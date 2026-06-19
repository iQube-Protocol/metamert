/* HMR boundary — ShellProvider */
import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  type ShellConfig,
  type MenuActionResult,
  type SelectorResult,
  type PromptActionResult,
  fetchShellConfig,
  updateSelector,
  menuAction,
  promptAction,
  authenticate,
  getToken,
} from "@/lib/aa-client";
import {
  postToIframe,
  postRawToIframe,
  normalizeInbound,
  isInferenceStart,
  isInferenceComplete,
} from "@/lib/shell-messages";
import { resolveIframeOrigin } from "@/lib/iframe-origin";
import {
  parseMetameEvent,
  reduceCartridgeEvent,
  postCartridgeClose,
  type OpenCartridgeState,
} from "@/lib/metame-protocol";
import { toast } from "sonner";
import {
  type SmartMenuMode,
  type ViewState,
  type SubmenuType,
  type QuickActionVisibility,
  type InteractionState,
  type CartridgeState,
  type PersonaState,
  MODE_CONFIGS,
  DEFAULT_CARTRIDGES,
  DEFAULT_PERSONAS,
  DEFAULT_ACTIVE_PERSONA_ID,
  personaIdToIqubeType,
  IDLE_TIMEOUT_MS,
} from "@/lib/smart-menu-config";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

export type ShellState = "welcome" | "post-welcome";

/** Active runtime context — drives the header lightning bolt color and copilot framing. */
export type RuntimeContext = "metame" | "knyt";

// Runtime-driven hints the shell can reflect without rendering content (LOV-301)
export interface RuntimeHints {
  activeGuide: boolean;      // runtime has an active guide session
  focusMode: boolean;        // runtime requests minimal shell chrome
  deepLink: string | null;   // runtime signalled a deep-link path
  handoff: boolean;          // runtime is in a handoff state
}

const INITIAL_HINTS: RuntimeHints = {
  activeGuide: false,
  focusMode: false,
  deepLink: null,
  handoff: false,
};

// Iframe readiness state (LOV-303)
export type IframeReadiness = "probing" | "loading" | "ready" | "error" | "blocked";

interface ShellContextValue {
  config: ShellConfig | null;
  loading: boolean;
  authenticated: boolean;
  shellState: ShellState;
  activeMenuItem: string | null;
  quickLinksExpanded: boolean;
  inferring: boolean;
  overlayTrigger: number;
  resetKey: number;

  // Runtime-driven state awareness (LOV-301)
  runtimeHints: RuntimeHints;

  // Iframe readiness (LOV-303)
  iframeReadiness: IframeReadiness;

  // LOV-401: KNYT onboarding active flag
  knytOnboarding: boolean;

  // Cartridge overlay (driven by runtime CARTRIDGE_OVERLAY_ACTIVE messages)
  cartridgeOverlay: { slug: string; title: string } | null;
  closeCartridgeOverlay: () => void;

  // Smart Menu state
  viewState: ViewState;
  activeMode: SmartMenuMode | null;
  submenuType: SubmenuType | null;
  submenuVisibility: QuickActionVisibility;
  interactionState: InteractionState;
  cartridgeState: CartridgeState;
  personaState: PersonaState;

  // CartridgePresenceRegistry — open cartridges as broadcast by the app via
  // metame:cartridge-* events. The most-recently-opened entry is "active".
  openCartridges: OpenCartridgeState[];
  activeCartridge: OpenCartridgeState | null;
  /** Post canonical metame:cartridge-closed into the iframe and update local state. */
  closeCartridge: (cartridgeId: string) => void;

  // Runtime context (metaMe ↔ KNYT) — drives the header lightning color
  // and the play menu's central context-toggle quick action.
  runtimeContext: RuntimeContext;
  setRuntimeContext: (next: RuntimeContext) => void;
  /** Apply runtime-originated context change without echoing back to iframe. */
  applyRuntimeContextFromRuntime: (next: RuntimeContext) => void;

  // Actions
  toggleQuickLinks: () => void;
  hydrate: () => Promise<void>;
  selectAigent: (id: string) => Promise<void>;
  selectLLM: (id: string) => Promise<void>;
  handleMenuAction: (itemId: string) => Promise<void>;
  sendIframeAction: (actionId: string, deepLink?: import("@/lib/shell-messages").DeepLink) => void;
  submitPrompt: (text: string) => void;
  resetToWelcome: () => void;
  updateTrust: (trust: { level: string; signals: string[]; scores?: Record<string, number> }) => void;
  iframeRef: React.RefObject<HTMLIFrameElement>;

  // Smart Menu actions
  activateMode: (mode: SmartMenuMode) => void;
  activateQuickActions: (mode: SmartMenuMode) => void;
  deactivateMode: () => void;
  setSubmenuType: (type: SubmenuType | null) => void;
  toggleSubmenu: () => void;
  /** Launch a cartridge inside the runtime iframe (does NOT change header color). */
  launchCartridge: (cartridgeId: string) => void;
  selectCartridge: (cartridgeId: string) => void;
  selectCodex: (codexId: string) => void;
  selectPersona: (personaId: string) => void;
  /** Open the Persona iQube drawer in the runtime (knyt or qripto). */
  openPersonaIQube: (iqubeType: "knyt" | "qripto") => void;
  /** Open the Identity iQube drawer in the runtime (single drawer, no variants). */
  openIdentityIQube: () => void;
  /** Open the Memory iQube drawer in the runtime. */
  openMemoryIQube: () => void;
  resetIdleTimer: (reason?: string) => void;
  pauseIdleTimer: () => void;
  resumeIdleTimer: () => void;
  setInteractionState: (state: InteractionState) => void;
  setPromptHasText: (hasText: boolean) => void;
  /** Briefly animate the trust/reliability score dots to indicate processing. */
  pulseInference: () => void;
}

const ShellCtx = createContext<ShellContextValue | null>(null);

// Stable module-level ref survives HMR — context value is written here by the provider
let __shellSingleton: ShellContextValue | null = null;

export function useShell(): ShellContextValue {
  // Prefer React context; fall back to module singleton during HMR transitions
  const ctx = useContext(ShellCtx);
  const value = ctx ?? __shellSingleton;
  if (!value) throw new Error("useShell must be used inside ShellProvider");
  return value;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getIframeOrigin(config: ShellConfig): string {
  return resolveIframeOrigin(config);
}

function createInferenceController(
  setInferring: React.Dispatch<React.SetStateAction<boolean>>,
) {
  let safetyTimer: ReturnType<typeof setTimeout> | null = null;
  let graceTimer: ReturnType<typeof setTimeout> | null = null;

  function clearTimers() {
    if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
    if (graceTimer) { clearTimeout(graceTimer); graceTimer = null; }
  }

  function start() {
    clearTimers();
    setInferring(true);
    safetyTimer = setTimeout(() => { setInferring(false); safetyTimer = null; }, 30_000);
  }

  function complete(graceMs: number = 2_000) {
    if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
    if (graceTimer) { clearTimeout(graceTimer); graceTimer = null; }
    graceTimer = setTimeout(() => { setInferring(false); graceTimer = null; }, graceMs);
  }

  function cleanup() { clearTimers(); }

  return { start, complete, cleanup };
}

function inferPersonaIdFromSurface(surface?: string): string | null {
  const value = (surface ?? "").toLowerCase();
  if (!value) return null;
  if (value.includes("knyt")) return "knyt-persona";
  if (value.includes("qripto") || value.includes("qrypto")) return "qripto-persona";
  return null;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ShellConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [shellState, setShellState] = useState<ShellState>("welcome");
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
  const [quickLinksExpanded, setQuickLinksExpanded] = useState(true);
  const [inferring, setInferring] = useState(false);
  const [overlayTrigger, setOverlayTrigger] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [runtimeHints, setRuntimeHints] = useState<RuntimeHints>(INITIAL_HINTS);
  const [iframeReadiness, setIframeReadiness] = useState<IframeReadiness>("probing");
  const [knytOnboarding, setKnytOnboarding] = useState(false);
  const [cartridgeOverlay, setCartridgeOverlay] = useState<{ slug: string; title: string } | null>(null);
  const [openCartridges, setOpenCartridges] = useState<OpenCartridgeState[]>([]);
  const activeCartridge = openCartridges.length > 0 ? openCartridges[openCartridges.length - 1] : null;
  const bumpOverlay = useCallback(() => setOverlayTrigger((n) => n + 1), []);
  const iframeRef = useRef<HTMLIFrameElement>(null!);
  const inferCtrl = useRef<ReturnType<typeof createInferenceController> | null>(null);
  // Forward ref so callbacks defined before submitPrompt can still call it
  const submitPromptRef = useRef<((text: string) => Promise<void> | void) | null>(null);

  // Smart Menu state
  const [viewState, setViewState] = useState<ViewState>("defaultNav");
  const [activeMode, setActiveMode] = useState<SmartMenuMode | null>(null);
  const [submenuType, setSubmenuTypeState] = useState<SubmenuType | null>(null);
  const [submenuVisibility, setSubmenuVisibility] = useState<QuickActionVisibility>("visibleAuto");
  const [interactionState, setInteractionStateRaw] = useState<InteractionState>("idle");
  const [cartridgeState, setCartridgeState] = useState<CartridgeState>({
    activeCartridgeId: "qripto-codex",
    activeCodexId: "qripto-codex",
    available: DEFAULT_CARTRIDGES,
  });
  const [personaState, setPersonaState] = useState<PersonaState>(() => {
    // Guard: if hardcoded default doesn't exist in visible personas, use first available.
    const fallback = DEFAULT_PERSONAS.find(p => p.id === DEFAULT_ACTIVE_PERSONA_ID)
      ? DEFAULT_ACTIVE_PERSONA_ID
      : DEFAULT_PERSONAS[0]?.id ?? "";
    return {
      activePersonaId: fallback,
      available: DEFAULT_PERSONAS,
    };
  });

  // Runtime context (metaMe ↔ KNYT) — drives header lightning color and copilot framing.
  // Initial value is "metame"; on mount we hydrate from the platform's shared
  // singleton at GET ${VITE_PLATFORM_BASE_URL}/api/runtime/settings/context so
  // this shell stays in sync with the admin tab and the iframe runtime.
  const [runtimeContext, setRuntimeContextState] = useState<RuntimeContext>("metame");

  // Hydrate runtime context from platform server (one-shot on mount).
  useEffect(() => {
    const base = (import.meta.env.VITE_PLATFORM_BASE_URL as string | undefined) ?? "https://dev-beta.aigentz.me";
    let cancelled = false;
    void fetch(`${base}/api/runtime/settings/context`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok || cancelled) return;
        const data = await res.json().catch(() => null);
        const next = data?.context;
        if ((next === "metame" || next === "knyt") && !cancelled) {
          setRuntimeContextState(next);
        }
      })
      .catch(() => { /* offline / CORS — keep local default */ });
    return () => { cancelled = true; };
  }, []);

  // Idle timer refs — split: 3s for quick action layer, 4s for full collapse
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track whether prompt has text (prevents collapse)
  const promptHasTextRef = useRef(false);

  // Lazily create inference controller
  if (!inferCtrl.current) {
    inferCtrl.current = createInferenceController(setInferring);
  }

  useEffect(() => () => inferCtrl.current?.cleanup(), []);

  // ---------------------------------------------------------------------------
  // Unified runtime message dispatch.
  //
  // Per the platform contract (2026-04-23): the runtime has a single permanent
  // handler for OPEN_PERSONA_IQUBE / OPEN_IDENTITY_IQUBE / OPEN_MEMORY_IQUBE /
  // LAUNCH_CARTRIDGE / RUNTIME_CONTEXT_CHANGE. One postMessage per action — no
  // triple-dispatch, no compatibility helpers.
  // ---------------------------------------------------------------------------
  const sendRuntimeMessage = useCallback((type: string, payload: Record<string, unknown> = {}) => {
    if (!iframeRef.current || !config) return;
    const origin = getIframeOrigin(config);
    postToIframe(iframeRef.current, { type, source: "shell", payload } as any, origin);
  }, [config]);

  // Idle auto-hide logic — split timers per spec
  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
    if (submenuTimerRef.current) { clearTimeout(submenuTimerRef.current); submenuTimerRef.current = null; }
  }, []);

  const startIdleTimer = useCallback(() => {
    clearIdleTimer();
    // 4s: auto-hide quick action floating layer
    submenuTimerRef.current = setTimeout(() => {
      setSubmenuVisibility("hiddenAutoIdle");
      submenuTimerRef.current = null;
    }, 4000);
    // 5s: full prompt collapse (only if prompt is empty)
    idleTimerRef.current = setTimeout(() => {
      if (promptHasTextRef.current) return; // spec: don't collapse with text
      setViewState("defaultNav");
      setActiveMode(null);
      setSubmenuTypeState(null);
      setSubmenuVisibility("visibleAuto");
    }, 5000);
  }, [clearIdleTimer]);

  const resetIdleTimer = useCallback((reason?: string) => {
    // Carousel swipe does NOT reset idle
    if (reason === "carouselSwipe" || reason === "carouselDrag") return;
    if (submenuVisibility === "hiddenUserToggle") return; // respect manual toggle
    setSubmenuVisibility("visibleAuto");
    startIdleTimer();
  }, [startIdleTimer, submenuVisibility]);

  // Pause idle timer (pointer hovering over interactive area)
  const pauseIdleTimer = useCallback(() => {
    clearIdleTimer();
  }, [clearIdleTimer]);

  // Resume idle timer (pointer left interactive area)
  const resumeIdleTimer = useCallback(() => {
    if (submenuVisibility === "hiddenUserToggle") {
      // User manually hid quick actions — still start the 4s full-collapse timer
      // so prompt bar returns to main nav when pointer leaves
      clearIdleTimer();
      idleTimerRef.current = setTimeout(() => {
        if (promptHasTextRef.current) return;
        setViewState("defaultNav");
        setActiveMode(null);
        setSubmenuTypeState(null);
        setSubmenuVisibility("visibleAuto");
      }, 4000);
      return;
    }
    startIdleTimer();
  }, [startIdleTimer, submenuVisibility, clearIdleTimer]);

  // Expose prompt text tracking for idle logic
  const setPromptHasText = useCallback((hasText: boolean) => {
    promptHasTextRef.current = hasText;
  }, []);

  // Clean up idle timer on unmount
  useEffect(() => () => clearIdleTimer(), [clearIdleTimer]);

  // Notify iframe of mode change
  const notifyModeChanged = useCallback((mode: SmartMenuMode | null, vs: ViewState) => {
    if (!iframeRef.current || !config) return;
    postToIframe(iframeRef.current, {
      type: "MODE_CHANGED",
      mode,
      view_state: vs,
      cartridge_id: cartridgeState.activeCartridgeId,
      codex_id: cartridgeState.activeCodexId,
    }, getIframeOrigin(config));
  }, [config, cartridgeState.activeCartridgeId, cartridgeState.activeCodexId]);

  // Smart Menu actions
  const activateMode = useCallback((mode: SmartMenuMode) => {
    // If tapping active mode, deactivate (collapse)
    if (activeMode === mode && viewState === "promptMode") {
      setViewState("defaultNav");
      setActiveMode(null);
      setSubmenuTypeState(null);
      setSubmenuVisibility("visibleAuto");
      clearIdleTimer();
      notifyModeChanged(null, "defaultNav");
      return;
    }
    setViewState("promptMode");
    setActiveMode(mode);
    setSubmenuTypeState("quickActions");
    setSubmenuVisibility("visibleAuto");
    startIdleTimer();
    notifyModeChanged(mode, "promptMode");
  }, [activeMode, viewState, clearIdleTimer, startIdleTimer, notifyModeChanged]);

  // Quick-action-only mode: show submenu without prompt bar (no keyboard on mobile)
  const activateQuickActions = useCallback((mode: SmartMenuMode) => {
    // If tapping same mode in quickActionOnly, collapse
    if (activeMode === mode && viewState === "quickActionOnly") {
      setViewState("defaultNav");
      setActiveMode(null);
      setSubmenuTypeState(null);
      setSubmenuVisibility("visibleAuto");
      clearIdleTimer();
      notifyModeChanged(null, "defaultNav");
      return;
    }
    setViewState("quickActionOnly");
    setActiveMode(mode);
    setSubmenuTypeState("quickActions");
    setSubmenuVisibility("visibleAuto");
    startIdleTimer();
    notifyModeChanged(mode, "quickActionOnly");
  }, [activeMode, viewState, clearIdleTimer, startIdleTimer, notifyModeChanged]);

  const deactivateMode = useCallback(() => {
    setViewState("defaultNav");
    setActiveMode(null);
    setSubmenuTypeState(null);
    setSubmenuVisibility("visibleAuto");
    clearIdleTimer();
    notifyModeChanged(null, "defaultNav");
  }, [clearIdleTimer, notifyModeChanged]);

  const setSubmenuType = useCallback((type: SubmenuType | null) => {
    setSubmenuTypeState(type);
    if (type) {
      setSubmenuVisibility("visibleAuto");
      startIdleTimer();
    }
  }, [startIdleTimer]);

  const toggleSubmenu = useCallback(() => {
    setSubmenuVisibility(prev => {
      if (prev === "hiddenUserToggle" || prev === "hiddenAutoIdle") {
        startIdleTimer();
        return "visibleAuto";
      }
      clearIdleTimer();
      return "hiddenUserToggle";
    });
  }, [startIdleTimer, clearIdleTimer]);

  /**
   * Launch a cartridge inside the runtime iframe.
   * Single dispatch per platform contract — no triple-dispatch, no extra
   * SELECTOR_CHANGE. Followed by the seed-prompt + UI animation.
   */
  const launchCartridge = useCallback((cartridgeId: string) => {
    sendRuntimeMessage("LAUNCH_CARTRIDGE", { cartridge_id: cartridgeId });

    inferCtrl.current?.start();
    inferCtrl.current?.complete(4_000);

    const prompts: Record<string, string> = {
      "knyt-codex":   "Open the KNYT cartridge and walk me through it.",
      "qripto-codex": "Open the Qriptopian cartridge and show me what's available.",
      "metame-codex": "Open the metaMe cartridge and orient me.",
    };
    queueMicrotask(() => {
      void submitPromptRef.current?.(
        prompts[cartridgeId] ?? `Open the ${cartridgeId} cartridge.`,
      );
    });

    // Restore local cartridge state so the active checkmark moves and outbound
    // context enrichment carries the correct cartridge_id + codex_id.
    const cart = cartridgeState.available.find(c => c.id === cartridgeId);
    const codexId = cart?.default_codex_id;
    setCartridgeState(prev => {
      const changed =
        prev.activeCartridgeId !== cartridgeId ||
        (codexId != null && prev.activeCodexId !== codexId);
      if (changed) {
        // Pulse R/T dots to acknowledge cartridge activation/change
        setInferring(true);
        window.setTimeout(() => setInferring(false), 3000);
      }
      return {
        ...prev,
        activeCartridgeId: cartridgeId,
        activeCodexId: codexId ?? prev.activeCodexId,
      };
    });
    if (cart) {
      setCartridgeOverlay({ slug: cart.id, title: cart.label ?? cart.id });
    }

    setSubmenuTypeState("quickActions");
    startIdleTimer();
  }, [sendRuntimeMessage, startIdleTimer, cartridgeState.available]);

  /**
   * Legacy `selectCartridge` — kept for backward compat (cartridge selector
   * pill click). Routes through `launchCartridge`.
   */
  const selectCartridge = useCallback((cartridgeId: string) => {
    launchCartridge(cartridgeId);
  }, [launchCartridge]);

  /**
   * Set the active runtime context (metaMe ↔ KNYT).
   * Single RUNTIME_CONTEXT_CHANGE dispatch per platform contract.
   */
  const setRuntimeContext = useCallback((next: RuntimeContext) => {
    setRuntimeContextState(next);
    sendRuntimeMessage("RUNTIME_CONTEXT_CHANGE", { context: next });
    // Best-effort AA-API notification (non-blocking)
    void menuAction("runtime-context", { runtime_context: next } as any).catch(() => {
      /* swallow — runtime context is local-first */
    });
  }, [sendRuntimeMessage]);

  /**
   * Apply a runtime-originated lead change (RUNTIME_LEAD_CHANGE) without
   * echoing RUNTIME_CONTEXT_CHANGE back to the iframe. Avoids feedback loops.
   */
  const applyRuntimeContextFromRuntime = useCallback((next: RuntimeContext) => {
    setRuntimeContextState(prev => {
      if (prev === next) return prev;
      console.log("[Shell] RUNTIME_LEAD_CHANGE → applying runtimeContext:", next);
      // Pulse the R/T trust dots to acknowledge the runtime lead handover,
      // mirroring the inference animation triggered by prompt sends.
      setInferring(true);
      window.setTimeout(() => setInferring(false), 3000);
      return next;
    });
  }, []);

  const selectCodex = useCallback((codexId: string) => {
    setCartridgeState(prev => {
      if (prev.activeCodexId !== codexId) {
        // Pulse R/T dots to acknowledge codex change
        setInferring(true);
        window.setTimeout(() => setInferring(false), 3000);
      }
      return {
        ...prev,
        activeCodexId: codexId,
      };
    });
    setSubmenuTypeState("quickActions");
    startIdleTimer();

    if (iframeRef.current && config) {
      postToIframe(iframeRef.current, { type: "SELECTOR_CHANGE", selector_type: "codex" as any, id: codexId }, getIframeOrigin(config));
    }
  }, [config, startIdleTimer]);

  /**
   * Select a persona pill — opens the persona iQube drawer.
   *
   * Single OPEN_PERSONA_IQUBE dispatch per platform contract; followed by a
   * descriptive prompt and inference pulse for UX feedback. Local
   * activePersonaId is updated so the "Be" icon tints with the persona accent.
   */
  const selectPersona = useCallback((personaId: string) => {
    const iqubeType = personaIdToIqubeType(personaId);
    if (!iqubeType) {
      console.warn("[Shell] selectPersona: no iqube_type mapping for", personaId);
      return;
    }
    setPersonaState(prev => ({ ...prev, activePersonaId: personaId }));
    try { localStorage.setItem("currentPersonaId", personaId); } catch { /* SSR / privacy mode */ }

    sendRuntimeMessage("OPEN_PERSONA_IQUBE", { iqube_type: iqubeType });

    inferCtrl.current?.start();
    inferCtrl.current?.complete(4_000);

    queueMicrotask(() => {
      void submitPromptRef.current?.(
        `Tell me about the ${iqubeType === "knyt" ? "KNYT" : "Qripto"} persona.`,
      );
    });

    setSubmenuTypeState("quickActions");
    startIdleTimer();
  }, [sendRuntimeMessage, startIdleTimer]);

  /** Open the Persona iQube drawer in the runtime directly. */
  const openPersonaIQube = useCallback((iqubeType: "knyt" | "qripto") => {
    sendRuntimeMessage("OPEN_PERSONA_IQUBE", { iqube_type: iqubeType });
  }, [sendRuntimeMessage]);

  /** Open the Identity iQube drawer in the runtime. Single drawer — no variants. */
  const openIdentityIQube = useCallback(() => {
    sendRuntimeMessage("OPEN_IDENTITY_IQUBE");
  }, [sendRuntimeMessage]);

  /** Open the Memory iQube drawer in the runtime. */
  const openMemoryIQube = useCallback(() => {
    sendRuntimeMessage("OPEN_MEMORY_IQUBE");
  }, [sendRuntimeMessage]);

  const setInteractionState = useCallback((state: InteractionState) => {
    setInteractionStateRaw(state);
    if (state !== "idle") {
      resetIdleTimer(state);
    }
  }, [resetIdleTimer]);

  // Listen for iframe inference lifecycle signals
  useEffect(() => {
    if (!config) return;
    const runtimeOrigin = getIframeOrigin(config);

    const handler = (e: MessageEvent) => {
      if (runtimeOrigin !== "*" && e.origin !== runtimeOrigin) return;
      const msg = normalizeInbound(e.data);
      if (!msg) return;
      const t = msg.type as string;

      if (import.meta.env.DEV) {
        console.log("[Shell:lifecycle]", t, "origin:", e.origin, "state:", msg.state ?? "-");
      }

      if (isInferenceStart(msg)) {
        console.log("[Shell] Inference START signal:", t);
        setShellState("post-welcome");
        inferCtrl.current?.start();
        bumpOverlay();
        return;
      }

      const payload = (msg as any).payload ?? msg;
      const welcomeInferenceCompleted =
        payload.welcome_inference_completed === true ||
        payload.welcome_prompt_executed === true;

      if (isInferenceComplete(msg)) {
        console.log("[Shell] Inference COMPLETE signal:", t, welcomeInferenceCompleted ? "(welcome_inference_completed)" : "");
        setShellState("post-welcome");
        inferCtrl.current?.complete();
        bumpOverlay();
        return;
      }

      if (t === "WELCOME_COMPLETE") {
        setShellState("post-welcome");
        inferCtrl.current?.complete();
        bumpOverlay();
        return;
      }

      if (t === "STATE_SYNC" && welcomeInferenceCompleted) {
        setShellState("post-welcome");
        inferCtrl.current?.complete();
        bumpOverlay();
        return;
      }

      // LOV-301: Extract runtime hints from STATE_SYNC
      if (t === "STATE_SYNC") {
        const state = (msg as any).state ?? msg;
        setRuntimeHints(prev => ({
          activeGuide: typeof state.active_guide === "boolean" ? state.active_guide : prev.activeGuide,
          focusMode: typeof state.focus_mode === "boolean" ? state.focus_mode : prev.focusMode,
          deepLink: typeof state.deep_link === "string" ? state.deep_link : prev.deepLink,
          handoff: typeof state.handoff === "boolean" ? state.handoff : prev.handoff,
        }));
        // LOV-401: Track KNYT onboarding state from runtime
        if (typeof state.knyt_onboarding === "boolean") {
          setKnytOnboarding(state.knyt_onboarding);
        }
      }

      // LOV-301: Handle dedicated RUNTIME_HINT signals
      if (t === "RUNTIME_HINT") {
        const hint = (msg as any).hint as string;
        const value = (msg as any).value;
        setRuntimeHints(prev => {
          if (hint === "active_guide" && typeof value === "boolean") return { ...prev, activeGuide: value };
          if (hint === "focus_mode" && typeof value === "boolean") return { ...prev, focusMode: value };
          if (hint === "deep_link") return { ...prev, deepLink: value as string | null };
          if (hint === "handoff" && typeof value === "boolean") return { ...prev, handoff: value };
          return prev;
        });
        return;
      }

      if (
        t === "PROMPT_SUBMIT" || t === "PROMPT_RESPONSE" ||
        t === "RESPONSE" || t === "CHAT_RESPONSE" ||
        t === "RESULT" || t === "OUTPUT"
      ) {
        setShellState("post-welcome");
        inferCtrl.current?.complete();
        bumpOverlay();
        return;
      }

      // TRUST_UPDATE from runtime — update shell trust state
      if (t === "TRUST_UPDATE") {
        const trustPayload = (msg as any).trust ?? msg;
        if (trustPayload.level) {
          updateTrust(trustPayload);
          console.log("[Shell] Trust updated from runtime:", trustPayload);
        }
        return;
      }

      if (t === "NAVIGATE" && (msg as any).action === "close_codex") {
        if (iframeRef.current && config) {
          postToIframe(iframeRef.current, { type: "MENU_ACTION", action_id: "close_codex" }, getIframeOrigin(config));
        }
        return;
      }

      // Cartridge overlay state from runtime
      if (t === "CARTRIDGE_OVERLAY_ACTIVE") {
        const p = (msg as any) as { active?: boolean; slug?: string; title?: string };
        if (p.active && p.slug) {
          setCartridgeOverlay({ slug: p.slug, title: p.title ?? p.slug });
          // Mirror cartridge state so the active checkmark moves AND pulse R/T dots
          setCartridgeState(prev => {
            const cart = prev.available.find(c => c.id === p.slug);
            const codexId = cart?.default_codex_id;
            const changed =
              prev.activeCartridgeId !== p.slug ||
              (codexId != null && prev.activeCodexId !== codexId);
            if (changed) {
              setInferring(true);
              window.setTimeout(() => setInferring(false), 3000);
            }
            return {
              ...prev,
              activeCartridgeId: p.slug!,
              activeCodexId: codexId ?? prev.activeCodexId,
            };
          });
        } else {
          setCartridgeOverlay(null);
        }
        return;
      }
    };

    const codexCloseHandler = (e: MessageEvent) => {
      const raw = e.data;
      const isString = typeof raw === "string";
      const isObj = raw && typeof raw === "object";
      const typeMatch =
        (isString && raw === "METAME_CODEX_CLOSE_LAYER") ||
        (isObj && (raw.type === "METAME_CODEX_CLOSE_LAYER" ||
                   (raw.payload && typeof raw.payload === "object" && (raw.payload as any).type === "METAME_CODEX_CLOSE_LAYER")));
      if (!typeMatch) return;
      console.log("[Shell:CODEX_CLOSE_DIAG] METAME_CODEX_CLOSE_LAYER received", { origin: e.origin });
    };

    // RUNTIME_READY: ask the runtime to (re)broadcast the active persona surface
    // so the Be label hydrates after sign-in or iframe remount.
    const runtimeReadyHandler = (e: MessageEvent) => {
      const raw = e.data;
      if (!raw || typeof raw !== "object") return;
      const t = (raw as any).type;
      if (t !== "RUNTIME_READY" && t !== "aa-auth-context-ready-v1") return;
      if (!iframeRef.current) return;
      try {
        iframeRef.current.contentWindow?.postMessage(
          { type: "REQUEST_ACTIVE_PERSONA", source: "shell" },
          "*",
        );
        console.log("[Shell] requested active persona resync after", t);
      } catch (err) {
        console.warn("[Shell] persona resync post failed", err);
      }
    };

    window.addEventListener("message", handler);
    window.addEventListener("message", codexCloseHandler);
    window.addEventListener("message", runtimeReadyHandler);
    return () => {
      window.removeEventListener("message", handler);
      window.removeEventListener("message", codexCloseHandler);
      window.removeEventListener("message", runtimeReadyHandler);
    };
  }, [config]);

  // Canonical metame:* protocol listener — ALWAYS mounted, independent of
  // shell-config hydration. The runtime can broadcast persona-changed at any
  // time (including before /aa/v1/runtime/shell-config resolves), so we must
  // not gate this listener on `config`. Forbidden T0 fields are stripped by
  // parseMetameEvent and never read.
  useEffect(() => {
    const metameHandler = (e: MessageEvent) => {
      const event = parseMetameEvent(e.data);
      if (!event) return;
      console.log("[Shell] metame event", event.type, event);

      switch (event.type) {
        case "metame:persona-changed": {
          // Confidence model:
          //   - Explicit active events (isActive === true) always win.
          //   - Non-devagent runtime surfaces update the Be label even without
          //     an explicit active marker (runtime is source of truth).
          //   - Plain `devagent` (no active marker) is the dev-shell account
          //     fallback. It only wins when there is no current runtime handle.
          const inlineHandle = event.displayLabel ?? event.ownFioHandle;
          if (!inlineHandle) {
            console.log("[Shell] persona-changed without display surface — ignoring", event);
            return;
          }
          const isDevagent = /devagent/i.test(`${event.displayLabel ?? ""} ${event.ownFioHandle ?? ""}`);
          const inferredId = event.personaId
            ?? inferPersonaIdFromSurface(event.ownFioHandle ?? event.displayLabel);
          setPersonaState(prev => {
            const hasCurrentRuntimeHandle = Boolean(prev.activeHandle);
            // Block devagent fallback only when we already have a runtime
            // handle and the incoming event is not explicitly active.
            if (isDevagent && !event.isActive && hasCurrentRuntimeHandle) {
              console.log("[Shell] ignoring ambiguous devagent fallback (have active runtime handle)", { current: prev.activeHandle, event });
              return prev;
            }
            const nextActiveId = inferredId ?? prev.activePersonaId;
            if (prev.activeHandle === inlineHandle && prev.activePersonaId === nextActiveId) return prev;
            console.log("[Shell] persona-changed → updating Be label", { handle: inlineHandle, personaId: nextActiveId, isActive: event.isActive });
            return { ...prev, activeHandle: inlineHandle, activePersonaId: nextActiveId };
          });
          return;
        }
        case "metame:persona-revoked": {
          // Sign-out / persona cleared: return Be nav to its default state
          // (literal "Be" label, default visible persona id).
          setPersonaState(prev => {
            const fallback = DEFAULT_PERSONAS.find(p => p.id === DEFAULT_ACTIVE_PERSONA_ID)
              ? DEFAULT_ACTIVE_PERSONA_ID
              : DEFAULT_PERSONAS[0]?.id ?? prev.activePersonaId;
            const next: PersonaState = { ...prev, activePersonaId: fallback };
            delete next.activeHandle;
            return next;
          });
          return;
        }
        case "metame:cartridge-opened":
        case "metame:cartridge-tab-changed":
        case "metame:cartridge-closed": {
          setOpenCartridges(prev => reduceCartridgeEvent(prev, event));
          return;
        }
      }
    };

    window.addEventListener("message", metameHandler);
    return () => window.removeEventListener("message", metameHandler);
  }, []);

  // Send DEVICE_CONTEXT_UPDATE to iframe on viewport resize
  useEffect(() => {
    if (!config) return;
    const origin = getIframeOrigin(config);

    function getDeviceType(w: number): "mobile" | "tablet" | "desktop" {
      if (w < 768) return "mobile";
      if (w < 1024) return "tablet";
      return "desktop";
    }

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const sendUpdate = () => {
      if (!iframeRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      postToIframe(iframeRef.current, {
        type: "DEVICE_CONTEXT_UPDATE",
        context: { device: getDeviceType(w), viewport: { width: w, height: h } },
      }, origin);
    };

    const onResize = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(sendUpdate, 250);
    };

    // Send initial context after iframe loads
    const initialTimer = setTimeout(sendUpdate, 1000);
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(initialTimer);
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [config]);

  // NOTE: Pattern A (CC commit 6a912c00) — the iframe is the source of truth
  // for the active persona. The shell does NOT fetch /api/wallet/active-persona
  // because the shell auths as `did:metame:dev-shell` (a different identity from
  // the actual signed-in user inside the iframe), so that fetch returns the
  // wrong persona (e.g. "devagent" instead of the iframe's active "arkagent@knyt").
  // The persona handle is set strictly from inline T1 surface fields on
  // metame:persona-changed events broadcast by the runtime.

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      if (!getToken()) {
        try {
          await authenticate("did:metame:dev-shell", async () => "dev-sig");
          setAuthenticated(true);
        } catch {
          console.warn("[Shell] Auth failed via proxy");
        }
      }
      const cfg = await fetchShellConfig();
      setConfig(cfg);
    } catch (err) {
      console.error("[Shell] Hydration failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const isLiveConfig = useCallback((cfg?: ShellConfig): boolean => {
    if (!cfg) return false;
    if (cfg.trust?.level === "unverified" && cfg.trust?.signals?.[0] === "Phase-1 dev mode") return false;
    return true;
  }, []);

  const applyConfigUpdate = useCallback((newConfig?: ShellConfig) => {
    if (isLiveConfig(newConfig)) setConfig(newConfig);
  }, [isLiveConfig]);

  const selectAigent = useCallback(async (id: string) => {
    try {
      const result: SelectorResult = await updateSelector("aigent", id);
      setConfig((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, selectors: { ...prev.selectors, aigent: { ...prev.selectors.aigent, current: id } } };
        if (result.shell_config?.trust?.scores) {
          updated.trust = { ...updated.trust, ...result.shell_config.trust };
        }
        return updated;
      });
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "SELECTOR_CHANGE", selector_type: "aigent", id }, getIframeOrigin(config));
      }
    } catch {
      console.error("[Shell] Failed to update Aigent selector");
    }
  }, [config]);

  const selectLLM = useCallback(async (id: string) => {
    try {
      const result: SelectorResult = await updateSelector("llm", id);
      setConfig((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, selectors: { ...prev.selectors, llm: { ...prev.selectors.llm, current: id } } };
        if (result.shell_config?.trust?.scores) {
          updated.trust = { ...updated.trust, ...result.shell_config.trust };
        }
        return updated;
      });
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "SELECTOR_CHANGE", selector_type: "llm", id }, getIframeOrigin(config));
      }
    } catch {
      console.error("[Shell] Failed to update LLM selector");
    }
  }, [config]);

  const handleMenuAction = useCallback(async (itemId: string) => {
    if (itemId === "refresh" || itemId === "__runtime_refresh__") {
      setShellState("welcome");
      setActiveMenuItem(null);
      deactivateMode();
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "RESET_WELCOME" }, getIframeOrigin(config));
      }
      toast.success("Reset to welcome");
      return;
    }
    if (itemId === "reset" || itemId === "__runtime_reset__") {
      setShellState("welcome");
      setActiveMenuItem(null);
      setQuickLinksExpanded(true);
      deactivateMode();
      setResetKey((k) => k + 1);
      toast.success("Reset — iframe remounted");
      return;
    }

    if (itemId === "close_codex") {
      const origin = config ? getIframeOrigin(config) : "(no config)";
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "MENU_ACTION", action_id: "close_codex" }, origin);
      }
      return;
    }

    setShellState("post-welcome");
    setActiveMenuItem(itemId);
    inferCtrl.current?.start();

    const ctx = {
      cartridge_id: cartridgeState.activeCartridgeId,
      codex_id: cartridgeState.activeCodexId,
      mode: activeMode ?? undefined,
    };

    try {
      const result: MenuActionResult = await menuAction(itemId, ctx);
      applyConfigUpdate(result.shell_config);
      if (result.iframe_event && iframeRef.current && config) {
        postRawToIframe(iframeRef.current, result.iframe_event, getIframeOrigin(config));
      } else if (result.menu_event && iframeRef.current && config) {
        postToIframe(
          iframeRef.current,
          { type: "MENU_ACTION", action_id: itemId, prompt: result.menu_event?.prompt, menu_event: result.menu_event, ...ctx },
          getIframeOrigin(config),
        );
      }
    } catch {
      const menuItem = config?.menu?.items?.find((i: any) => i.id === itemId);
      const trigger = (menuItem as any)?.trigger;
      if (iframeRef.current && config) {
        const menuEvent = trigger
          ? { action_id: itemId, prompt: trigger.prompt, intent: trigger.intent }
          : { action_id: itemId, intent: itemId };
        postToIframe(
          iframeRef.current,
          { type: "MENU_ACTION", action_id: itemId, prompt: menuEvent.prompt, menu_event: menuEvent, ...ctx },
          getIframeOrigin(config),
        );
      }
    }
  }, [config, applyConfigUpdate, deactivateMode, cartridgeState.activeCartridgeId, cartridgeState.activeCodexId]);

  /** Send a MENU_ACTION directly to the iframe without API round-trip */
  const sendIframeAction = useCallback((actionId: string, deepLink?: import("@/lib/shell-messages").DeepLink) => {
    if (!iframeRef.current || !config) return;
    const origin = getIframeOrigin(config);
    postToIframe(iframeRef.current, {
      type: "MENU_ACTION",
      action_id: actionId,
      cartridge_id: cartridgeState.activeCartridgeId,
      codex_id: cartridgeState.activeCodexId,
      ...(deepLink ? { deep_link: deepLink } : {}),
    }, origin);
  }, [config, cartridgeState.activeCartridgeId, cartridgeState.activeCodexId]);

  const submitPrompt = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setShellState("post-welcome");
    inferCtrl.current?.start();
    const ctx = {
      cartridge_id: cartridgeState.activeCartridgeId,
      codex_id: cartridgeState.activeCodexId,
      mode: activeMode ?? undefined,
    };
    try {
      const result: PromptActionResult = await promptAction(text, ctx);
      applyConfigUpdate(result.shell_config);
      if (iframeRef.current && config) {
        if (result.iframe_event) {
          postRawToIframe(iframeRef.current, result.iframe_event, getIframeOrigin(config));
        } else {
          postToIframe(iframeRef.current, { type: "PROMPT_SUBMIT", text, ...ctx }, getIframeOrigin(config));
        }
      }
    } catch {
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "PROMPT_SUBMIT", text, ...ctx }, getIframeOrigin(config));
      }
    } finally {
      inferCtrl.current?.start();
    }
  }, [config, applyConfigUpdate, cartridgeState.activeCartridgeId, cartridgeState.activeCodexId]);

  // Keep the forward ref in sync so callbacks defined earlier (selectPersona,
  // launchCartridge) can call submitPrompt without a circular dependency.
  useEffect(() => {
    submitPromptRef.current = submitPrompt;
  }, [submitPrompt]);

  const resetToWelcome = useCallback(() => {
    setShellState("welcome");
    setActiveMenuItem(null);
    setQuickLinksExpanded(true);
    deactivateMode();
    if (iframeRef.current && config) {
      postToIframe(iframeRef.current, { type: "RESET_WELCOME" }, getIframeOrigin(config));
    }
  }, [config, deactivateMode]);

  const toggleQuickLinks = useCallback(() => {
    setQuickLinksExpanded((prev) => !prev);
  }, []);

  const updateTrust = useCallback((trust: { level: string; signals: string[]; scores?: Record<string, number> }) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            trust: {
              level: trust.level as ShellConfig["trust"]["level"],
              signals: trust.signals,
              scores: trust.scores,
            },
          }
        : prev
    );
  }, []);

  const closeCartridgeOverlay = useCallback(() => {
    if (iframeRef.current && config) {
      postToIframe(iframeRef.current, { type: "CARTRIDGE_OVERLAY_CLOSE" } as any, getIframeOrigin(config));
    }
    setCartridgeOverlay(null);
  }, [config]);

  const pulseInference = useCallback(() => {
    inferCtrl.current?.start();
    // Extended grace (4s) so the trust/reliability dot pulse stays visible
    // long enough to clearly signal that a quick action triggered processing.
    inferCtrl.current?.complete(4_000);
  }, []);

  const closeCartridge = useCallback((cartridgeId: string) => {
    if (iframeRef.current && config) {
      postCartridgeClose(iframeRef.current, cartridgeId, getIframeOrigin(config));
    }
    // Pattern: soft-hide. Wait ≤500ms for the iframe's metame:cartridge-closed
    // ack (which the reducer will apply via the metameHandler). If no ack
    // arrives, force-remove locally so the chip doesn't get stuck.
    setTimeout(() => {
      setOpenCartridges(prev => {
        if (!prev.some(c => c.cartridgeId === cartridgeId)) return prev;
        console.warn("[Shell] cartridge close ack timeout — force-removing", cartridgeId);
        return prev.filter(c => c.cartridgeId !== cartridgeId);
      });
    }, 500);
  }, [config]);



  const ctxValue: ShellContextValue = useMemo(() => ({
    config, loading, authenticated, shellState,
    activeMenuItem, quickLinksExpanded, inferring, overlayTrigger, resetKey,
    runtimeHints, iframeReadiness, knytOnboarding,
    cartridgeOverlay, closeCartridgeOverlay,
    // Smart Menu state
    viewState, activeMode, submenuType, submenuVisibility, interactionState, cartridgeState, personaState,
    // CartridgePresenceRegistry
    openCartridges, activeCartridge, closeCartridge,
    // Runtime context
    runtimeContext, setRuntimeContext, applyRuntimeContextFromRuntime,
    // Actions
    toggleQuickLinks,
    hydrate, selectAigent, selectLLM, handleMenuAction, sendIframeAction,
    submitPrompt, resetToWelcome, updateTrust, iframeRef,
    // Smart Menu actions
    activateMode, activateQuickActions, deactivateMode, setSubmenuType, toggleSubmenu,
    launchCartridge, selectCartridge, selectCodex, selectPersona, openPersonaIQube, openIdentityIQube, openMemoryIQube, resetIdleTimer, pauseIdleTimer, resumeIdleTimer, setInteractionState, setPromptHasText,
    pulseInference,
  }), [
    config, loading, authenticated, shellState,
    activeMenuItem, quickLinksExpanded, inferring, overlayTrigger, resetKey,
    runtimeHints, iframeReadiness, knytOnboarding,
    cartridgeOverlay, closeCartridgeOverlay,
    viewState, activeMode, submenuType, submenuVisibility, interactionState, cartridgeState, personaState,
    openCartridges, activeCartridge, closeCartridge,
    runtimeContext, setRuntimeContext, applyRuntimeContextFromRuntime,
    toggleQuickLinks, hydrate, selectAigent, selectLLM, handleMenuAction, sendIframeAction,
    submitPrompt, resetToWelcome, updateTrust, iframeRef,
    activateMode, activateQuickActions, deactivateMode, setSubmenuType, toggleSubmenu,
    launchCartridge, selectCartridge, selectCodex, selectPersona, openPersonaIQube, openIdentityIQube, openMemoryIQube, resetIdleTimer, pauseIdleTimer, resumeIdleTimer, setInteractionState, setPromptHasText,
    pulseInference,
  ]);

  // Publish to module singleton so HMR-stale consumers can still read it
  __shellSingleton = ctxValue;

  return (
    <ShellCtx.Provider value={ctxValue}>
      {children}
    </ShellCtx.Provider>
  );
}

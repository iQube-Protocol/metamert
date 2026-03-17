/**
 * BrowserContext — manages browser surface UI state.
 * Shell is a visual host only; all actions relay events to the runtime iframe.
 */
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import type {
  BrowserSurfaceUIState,
  BrowserMountPayload,
  BrowserStepState,
  BrowserBadgeState,
  BrowserDrawerData,
  BrowserActionStatus,
  SurfaceBounds,
} from "@/lib/browser-types";
import { postToIframe } from "@/lib/shell-messages";
import { resolveIframeOrigin } from "@/lib/iframe-origin";
import type { ShellConfig } from "@/lib/aa-client";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface BrowserContextValue {
  surfaceState: BrowserSurfaceUIState;
  mountPayload: BrowserMountPayload | null;
  stepState: BrowserStepState | null;
  takeoverActive: boolean;
  badges: BrowserBadgeState | null;
  error: string | null;
  drawerOpen: boolean;
  drawerData: BrowserDrawerData | null;
  actionStatus: BrowserActionStatus | null;

  // Shell → Runtime actions
  requestOpen: (intent?: string) => void;
  requestClose: () => void;
  requestMinimize: () => void;
  requestExpand: () => void;
  requestTakeover: () => void;
  requestResume: () => void;
  reportBounds: (bounds: SurfaceBounds) => void;
  reportFocus: (focused: boolean) => void;
  dismissError: () => void;
  toggleDrawer: () => void;
  requestDrawerRefresh: () => void;
  requestExtract: () => void;
  requestSave: () => void;

  // Runtime → Shell dispatches (called by RuntimeFrame message handler)
  handleMount: (payload: BrowserMountPayload) => void;
  handleUnmount: (sessionId: string) => void;
  handleStepUpdate: (step: BrowserStepState) => void;
  handleTakeoverState: (sessionId: string, active: boolean) => void;
  handleBadgesUpdate: (badges: BrowserBadgeState) => void;
  handleError: (message: string, sessionId?: string) => void;
  handleSurfaceState: (state: Record<string, unknown>) => void;
  handleDrawerData: (data: BrowserDrawerData) => void;
  handleActionStatus: (status: BrowserActionStatus) => void;
}

const BrowserCtx = createContext<BrowserContextValue | null>(null);

export function useBrowser(): BrowserContextValue {
  const ctx = useContext(BrowserCtx);
  if (!ctx) throw new Error("useBrowser must be used inside BrowserProvider");
  return ctx;
}

export function useBrowserOptional(): BrowserContextValue | null {
  return useContext(BrowserCtx);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface BrowserProviderProps {
  children: React.ReactNode;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  config: ShellConfig | null;
}

export function BrowserProvider({ children, iframeRef, config }: BrowserProviderProps) {
  const [surfaceState, setSurfaceState] = useState<BrowserSurfaceUIState>("collapsed");
  const [mountPayload, setMountPayload] = useState<BrowserMountPayload | null>(null);
  const [stepState, setStepState] = useState<BrowserStepState | null>(null);
  const [takeoverActive, setTakeoverActive] = useState(false);
  const [badges, setBadges] = useState<BrowserBadgeState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<BrowserDrawerData | null>(null);
  const [actionStatus, setActionStatus] = useState<BrowserActionStatus | null>(null);

  const boundsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getOrigin = useCallback(() => {
    if (!config) return "*";
    return resolveIframeOrigin(config);
  }, [config]);

  const postBrowserEvent = useCallback((type: string, payload: Record<string, unknown>) => {
    if (!iframeRef.current || !config) return;
    // Browser events use the same bridge envelope as all shell→iframe messages
    const origin = getOrigin();
    postToIframe(iframeRef.current, { type, ...payload } as any, origin);
  }, [iframeRef, config, getOrigin]);

  // --- Shell → Runtime actions ---

  const requestOpen = useCallback((intent?: string) => {
    setSurfaceState("mounting");
    setError(null);
    postBrowserEvent("browser.open.request", intent ? { intent } : {});
  }, [postBrowserEvent]);

  const requestClose = useCallback(() => {
    if (!mountPayload) return;
    postBrowserEvent("browser.close.request", { sessionId: mountPayload.sessionId });
  }, [postBrowserEvent, mountPayload]);

  const requestMinimize = useCallback(() => {
    if (!mountPayload) return;
    setSurfaceState("minimized");
    postBrowserEvent("browser.minimize.request", { sessionId: mountPayload.sessionId });
  }, [postBrowserEvent, mountPayload]);

  const requestExpand = useCallback(() => {
    if (!mountPayload) return;
    // Restore to previous active state
    setSurfaceState(takeoverActive ? "human_takeover" : stepState ? "agent_active" : "mounted");
    postBrowserEvent("browser.expand.request", { sessionId: mountPayload.sessionId });
  }, [postBrowserEvent, mountPayload, takeoverActive, stepState]);

  const requestTakeover = useCallback(() => {
    if (!mountPayload) return;
    postBrowserEvent("browser.takeover.request", { sessionId: mountPayload.sessionId });
  }, [postBrowserEvent, mountPayload]);

  const requestResume = useCallback(() => {
    if (!mountPayload) return;
    postBrowserEvent("browser.resume.request", { sessionId: mountPayload.sessionId });
  }, [postBrowserEvent, mountPayload]);

  const reportBounds = useCallback((bounds: SurfaceBounds) => {
    if (!mountPayload) return;
    // Debounce bounds changes
    if (boundsDebounceRef.current) clearTimeout(boundsDebounceRef.current);
    boundsDebounceRef.current = setTimeout(() => {
      postBrowserEvent("browser.surface.bounds.changed", { sessionId: mountPayload.sessionId, bounds });
    }, 200);
  }, [postBrowserEvent, mountPayload]);

  const reportFocus = useCallback((focused: boolean) => {
    if (!mountPayload) return;
    postBrowserEvent("browser.focus.changed", { sessionId: mountPayload.sessionId, focused });
  }, [postBrowserEvent, mountPayload]);

  const dismissError = useCallback(() => {
    setError(null);
    setSurfaceState("collapsed");
    setMountPayload(null);
  }, []);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen(prev => {
      if (!prev && mountPayload) {
        // Request fresh data when opening
        postBrowserEvent("browser.drawer.refresh.request", { sessionId: mountPayload.sessionId });
      }
      return !prev;
    });
  }, [mountPayload, postBrowserEvent]);

  const requestDrawerRefresh = useCallback(() => {
    if (!mountPayload) return;
    postBrowserEvent("browser.drawer.refresh.request", { sessionId: mountPayload.sessionId });
  }, [postBrowserEvent, mountPayload]);

  const requestExtract = useCallback(() => {
    if (!mountPayload) return;
    postBrowserEvent("browser.extract.request", { sessionId: mountPayload.sessionId });
  }, [postBrowserEvent, mountPayload]);

  const requestSave = useCallback(() => {
    if (!mountPayload) return;
    postBrowserEvent("browser.save.request", { sessionId: mountPayload.sessionId });
  }, [postBrowserEvent, mountPayload]);

  // --- Runtime → Shell dispatches ---

  const handleMount = useCallback((payload: BrowserMountPayload) => {
    // Prevent duplicate mounts
    if (mountPayload?.sessionId === payload.sessionId && surfaceState !== "collapsed" && surfaceState !== "mounting") {
      return;
    }
    setMountPayload(payload);
    setSurfaceState("mounted");
    setError(null);
    setTakeoverActive(false);
    setStepState(null);
  }, [mountPayload, surfaceState]);

  const handleUnmount = useCallback((sessionId: string) => {
    if (mountPayload?.sessionId !== sessionId) return;
    setSurfaceState("collapsed");
    setMountPayload(null);
    setStepState(null);
    setTakeoverActive(false);
    setBadges(null);
    setError(null);
    setDrawerOpen(false);
    setDrawerData(null);
    setActionStatus(null);
  }, [mountPayload]);

  const handleStepUpdate = useCallback((step: BrowserStepState) => {
    if (mountPayload && step.sessionId !== mountPayload.sessionId) return;
    setStepState(step);
    if (surfaceState === "mounted" || surfaceState === "agent_active") {
      setSurfaceState("agent_active");
    }
  }, [mountPayload, surfaceState]);

  const handleTakeoverState = useCallback((sessionId: string, active: boolean) => {
    if (mountPayload && sessionId !== mountPayload.sessionId) return;
    setTakeoverActive(active);
    if (active) {
      setSurfaceState("human_takeover");
    } else {
      setSurfaceState(stepState ? "agent_active" : "mounted");
    }
  }, [mountPayload, stepState]);

  const handleBadgesUpdate = useCallback((newBadges: BrowserBadgeState) => {
    if (mountPayload && newBadges.sessionId !== mountPayload.sessionId) return;
    setBadges(newBadges);
  }, [mountPayload]);

  const handleError = useCallback((message: string, sessionId?: string) => {
    if (sessionId && mountPayload && sessionId !== mountPayload.sessionId) return;
    setError(message);
    setSurfaceState("error");
  }, [mountPayload]);

  const handleSurfaceState = useCallback((state: Record<string, unknown>) => {
    if (state.takeoverActive !== undefined) {
      setTakeoverActive(state.takeoverActive as boolean);
    }
  }, []);

  const handleDrawerData = useCallback((data: BrowserDrawerData) => {
    if (mountPayload && data.sessionId !== mountPayload.sessionId) return;
    setDrawerData(data);
  }, [mountPayload]);

  const handleActionStatus = useCallback((status: BrowserActionStatus) => {
    if (mountPayload && status.sessionId !== mountPayload.sessionId) return;
    setActionStatus(status);
    // Auto-refresh drawer on completed actions
    if (status.status === "completed" && mountPayload) {
      postBrowserEvent("browser.drawer.refresh.request", { sessionId: mountPayload.sessionId });
    }
  }, [mountPayload, postBrowserEvent]);

  // Mount timeout: if we stay in "mounting" for 15s without a mount event, show error
  const mountTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (surfaceState === "mounting") {
      mountTimeoutRef.current = setTimeout(() => {
        if (surfaceState === "mounting") {
          setError("Browser session timed out waiting for runtime to respond.");
          setSurfaceState("error");
        }
      }, 15_000);
    } else {
      if (mountTimeoutRef.current) {
        clearTimeout(mountTimeoutRef.current);
        mountTimeoutRef.current = null;
      }
    }
    return () => {
      if (mountTimeoutRef.current) clearTimeout(mountTimeoutRef.current);
    };
  }, [surfaceState]);

  // Cleanup debounce on unmount
  useEffect(() => () => {
    if (boundsDebounceRef.current) clearTimeout(boundsDebounceRef.current);
  }, []);

  const ctxValue: BrowserContextValue = {
    surfaceState, mountPayload, stepState, takeoverActive, badges, error,
    drawerOpen, drawerData, actionStatus,
    requestOpen, requestClose, requestMinimize, requestExpand,
    requestTakeover, requestResume, reportBounds, reportFocus, dismissError,
    toggleDrawer, requestDrawerRefresh, requestExtract, requestSave,
    handleMount, handleUnmount, handleStepUpdate, handleTakeoverState,
    handleBadgesUpdate, handleError, handleSurfaceState,
    handleDrawerData, handleActionStatus,
  };

  return (
    <BrowserCtx.Provider value={ctxValue}>
      {children}
    </BrowserCtx.Provider>
  );
}

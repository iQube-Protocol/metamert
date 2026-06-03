import { useMemo, useRef, useState, useEffect } from "react";
import { Joyride, ACTIONS, EVENTS, STATUS, type EventData, type Step } from "react-joyride";
import { useShell } from "@/contexts/ShellContext";
import { DEEP_LINK_DISPATCH } from "@/lib/smart-menu-config";

interface Props {
  run: boolean;
  onFinish: () => void;
}

type TourAction =
  | "reset"
  | "show-prompt"
  | "show-cartridges"
  | "signin"
  | "create-persona"
  | "open-wallet"
  | "open-settings"
  | "activate-persona"
  | "show-trust"
  | "show-help";

/**
 * Visitor Tour.
 *
 * - Cards use the same mint-cyan parchment as the Welcome modal, with the
 *   Joyride arrow + spotlight halo recoloured to match.
 * - Step effects fire on STEP_BEFORE. We collapse shell-side surfaces
 *   (mode + submenu) on every transition so we never stack drawers.
 * - Sign-in opens the SmartWallet drawer (right side, runtime-owned) with the
 *   Sign-In tab deep-linked. The arrow points at the persona / Be nav pill.
 */
export default function VisitorTour({ run, onFinish }: Props) {
  const {
    sendIframeAction,
    activateMode,
    deactivateMode,
    setSubmenuType,
    pauseIdleTimer,
    activeMode,
    viewState,
    handleMenuAction,
  } = useShell();


  // Live mirror of mode/viewState — useShell closures captured inside
  // runStepEffect would otherwise be stale across rapid step transitions
  // and could collapse the menu instead of activating it.
  const activeModeRef = useRef(activeMode);
  const viewStateRef = useRef(viewState);
  useEffect(() => { activeModeRef.current = activeMode; }, [activeMode]);
  useEffect(() => { viewStateRef.current = viewState; }, [viewState]);

  const lastStepRef = useRef<number>(-1);

  const steps: Step[] = useMemo(
    () => [
      {
        target: '[data-tour="runtime-area"]',
        placement: "center",
        title: "Welcome to your Runtime",
        content:
          "This is metaMe Runtime — your entry into agentic cartridges, content, co-pilots, experiences and community. Explore freely without signing in.",
        data: { action: "reset" satisfies TourAction },
      },
      {
        target: '[data-tour="smart-menu"]',
        placement: "top",
        title: "The Smart Menu",
        content:
          "Be, Make, Play, Earn and Share — five lenses for everything you can do here. Browse identity, media, creation, rewards and sharing.",
        data: { action: "reset" satisfies TourAction },
      },
      {
        // Cartridges — anchored at the Cartridge quick action inside Play.
        target: '[data-tour="quick-action-cartridge"]',
        placement: "top-end",
        title: "Cartridges",
        content:
          "Cartridges are focused experience spaces holding public and personal content. Pick KNYT, The Qriptopian, or metaMe from the selector above the prompt bar.",
        data: { action: "show-cartridges" satisfies TourAction },
      },
      {
        // Co-pilot prompt — show the prompt input bar (not the nav) so the
        // user sees what they'll type into. Anchored on the prompt bar.
        target: '[data-tour="smart-menu-prompt"]',
        placement: "top",
        title: "Co-pilot prompt",
        content:
          "Tap any menu item to open the prompt bar — that's where you talk to your aigent.",
        data: { action: "show-prompt" satisfies TourAction },
      },
      {
        // Sign In — dedicated Sign In quick action inside Earn submenu.
        target: '[data-tour="quick-action-signin"]',
        placement: "top-end",
        title: "Sign in",
        content:
          "Tap Sign In here to open the SmartWallet and tap the chevron at the top next to the blue figure to Sign-In or Sign-up. Once signed in you can remix, buy, earn, vote, save, publish and generate.",
        data: { action: "signin" satisfies TourAction },
      },
      {
        // Create Persona — anchored at the Earn pill (opens the wallet).
        target: '[data-tour="quick-action-wallet"]',
        placement: "top-end",
        title: "Create a persona",
        content:
          "In the open SmartWallet on the right, tap the Create Persona badge to launch the wizard and set up Qripto, KNYT or a delegate persona.",
        data: { action: "create-persona" satisfies TourAction },
      },
      {
        // SmartWallet — anchored at the Earn pill (opens the wallet drawer).
        target: '[data-tour="quick-action-wallet"]',
        placement: "top-end",
        title: "The SmartWallet",
        content:
          "Your SmartWallet is where you manage personas, payments, rewards and reputation across every cartridge.",
        data: { action: "open-wallet" satisfies TourAction },
      },

      {
        // Settings — Settings quick action in Be.
        target: '[data-tour="quick-action-settings"]',
        placement: "top-end",
        title: "Settings",
        content:
          "Set the rules your aigents act under — autonomy, spend limits, approvals and skill scope. The Settings drawer is open on the right.",
        data: { action: "open-settings" satisfies TourAction },
      },
      {
        // Persona activation happens inside the wallet.
        target: '[data-tour="quick-action-wallet"]',
        placement: "top-end",
        title: "Activate a persona",
        content:
          "Activating personas happens inside the SmartWallet on the right. Choose the persona you wish to use or a delegate to an aigent you want to act on your behalf.",
        data: { action: "activate-persona" satisfies TourAction },
      },
      {
        target: '[data-tour="trust-dots"]',
        placement: "bottom",
        title: "Trust & Reliability",
        content:
          "These dots reflect your aigent's live Trust and Reliability scores. Watch them respond as you interact.",
        data: { action: "show-trust" satisfies TourAction },
      },
      {
        target: '[data-tour="help-button"]',
        placement: "bottom",
        title: "Restart anytime",
        content:
          "Re-run this guide any time by clicking the ? button up here.",
        data: { action: "show-help" satisfies TourAction },
      },
    ],
    [],
  );

  /** Collapse shell-side overlays (mode + submenu) before staging the next. */
  const clearShellSurfaces = () => {
    setSubmenuType(null);
    deactivateMode();
  };

  /**
   * Idempotently move the shell into a given mode + promptMode. If we are
   * already there we do nothing — calling activateMode again with the same
   * mode would hit the "tap-active-to-collapse" branch (stale closure) and
   * fold the menu back to defaultNav, yanking the tour anchor away.
   */
  const ensureMode = (mode: "earn" | "be" | "play") => {
    if (activeModeRef.current === mode && viewStateRef.current === "promptMode") return;
    activateMode(mode);
  };

  /**
   * Pre-anchor staging — make sure the DOM target for the step exists AND
   * open the runtime drawer/modal the card is describing. The tour is a
   * first-class thin-client narrator: each card explains the surface it has
   * just opened. We rely on the controlled `goToStep` settle delay (bumped
   * for drawer-opening steps) to keep the tooltip from flipping while the
   * drawer slides in.
   *
   * Exceptions handled by the runtime itself (no shell drawer):
   *   - signin           → wallet drawer w/ Sign-In modal (runtime owns modal)
   *   - create-persona   → wallet drawer w/ Create Persona wizard (runtime)
   */
  const runStepEffect = (action: TourAction | undefined) => {
    if (!action) return;
    pauseIdleTimer();
    switch (action) {
      case "reset":
      case "show-trust":
      case "show-help":
        clearShellSurfaces();
        break;
      case "show-prompt":
        ensureMode("play");
        break;
      case "show-cartridges":
        ensureMode("play");
        // Stay in Play quickActions so the [data-tour="quick-action-cartridge"]
        // anchor remains mounted. Tapping the highlighted Cartridge pill is
        // what opens the cartridge selector overlay.
        setSubmenuType("quickActions");
        break;

      case "signin":
        ensureMode("earn");
        sendIframeAction("wallet", { module: "wallet", tab: "wallet", intent: "signin" });
        break;
      case "create-persona":
        ensureMode("earn");
        sendIframeAction("persona", { module: "persona", flow: "create-wizard" });
        break;
      case "open-wallet":
        ensureMode("earn");
        sendIframeAction("wallet");
        break;
      case "activate-persona":
        ensureMode("earn");
        sendIframeAction("wallet", { module: "wallet", tab: "reputation" });
        break;
      case "open-settings":
        ensureMode("be");
        sendIframeAction("settings");
        break;
    }
    // activateMode restarts the shell idle timer, which would auto-collapse
    // the staged submenu after a few seconds and yank the tour anchor away.
    // Re-pause it so the highlighted pill stays put for the whole step.
    pauseIdleTimer();
  };

  /**
   * End-of-tour cleanup: collapse shell surfaces AND trigger the runtime
   * Reset action so the iframe + shell land on a fresh slate. Safe to call
   * from FINISHED, SKIPPED, or CLOSE paths.
   */
  const finalizeTour = () => {
    clearShellSurfaces();
    lastStepRef.current = -1;
    try { void handleMenuAction("reset"); } catch { /* noop */ }
    onFinish();
  };



  // Controlled step index — we gate every advancement on the target being
  // present in the DOM, so async drawer/submenu mounts can't cause Joyride
  // to silently skip past steps whose anchors haven't rendered yet.
  const [stepIndex, setStepIndex] = useState(0);
  const stagingRef = useRef(false);

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  const waitForElement = async (
    selector: string,
    { timeout = 1500, interval = 50 }: { timeout?: number; interval?: number } = {},
  ): Promise<HTMLElement | null> => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el && el.offsetParent !== null) return el;
      await sleep(interval);
    }
    return null;
  };

  /**
   * Move to step `target`, pre-staging shell surfaces and waiting for the
   * anchor to appear before handing control back to Joyride. If the anchor
   * never appears we skip that single step instead of cascading forward.
   */
  const goToStep = async (target: number) => {
    if (stagingRef.current) return;
    stagingRef.current = true;
    try {
      let idx = target;
      while (idx >= 0 && idx < steps.length) {
        const step = steps[idx];
        runStepEffect(step?.data?.action as TourAction | undefined);
        const selector =
          typeof step.target === "string" ? step.target : "";
        const found = selector
          ? await waitForElement(selector, { timeout: 2000, interval: 50 })
          : null;
        if (found || !selector) {
          if (found) {
            try { found.scrollIntoView({ block: "nearest", inline: "center" }); } catch { /* noop */ }
          }
          // Settle delay: let menu open/scroll animations finish before
          // Joyride measures the anchor and positions the tooltip. Drawer-
          // opening steps need a longer settle so the right-side runtime
          // drawer is mounted before Popper computes placement.
          const action = step?.data?.action as TourAction | undefined;
          const isDrawerStep =
            action === "signin" ||
            action === "create-persona" ||
            action === "open-wallet" ||
            action === "activate-persona" ||
            action === "open-settings" ||
            action === "show-cartridges";
          await sleep(isDrawerStep ? 420 : 220);
          setStepIndex(idx);
          lastStepRef.current = idx;
          return;
        }
        // Anchor never materialised — skip this single step.
        idx += 1;
      }
      // Ran past the end → finish with a full shell reset so the user lands
      // on a clean slate (no lingering drawers, submenus, or modes).
      finalizeTour();

    } finally {
      stagingRef.current = false;
    }
  };

  // Kick off / reset whenever the tour starts (also covers runKey remounts
  // since this component is keyed in Index.tsx).
  useEffect(() => {
    if (run) {
      setStepIndex(0);
      void goToStep(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  // While the tour is running, continuously suppress the shell idle timer so
  // the staged submenu (Earn / Be) can't auto-collapse between steps when the
  // pointer isn't hovering over the menu cluster.
  useEffect(() => {
    if (!run) return;
    pauseIdleTimer();
    const id = window.setInterval(() => pauseIdleTimer(), 800);
    return () => window.clearInterval(id);
  }, [run, pauseIdleTimer]);

  const handleEvent = (data: EventData) => {
    const { status, type, action, index } = data;

    if (type === EVENTS.STEP_AFTER) {
      if (action === ACTIONS.NEXT) {
        void goToStep(index + 1);
        return;
      }
      if (action === ACTIONS.PREV) {
        void goToStep(index - 1);
        return;
      }
      if (action === ACTIONS.CLOSE) {
        finalizeTour();
        return;
      }
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      finalizeTour();
    }

  };

  // Brand-tinted card surface — mint-cyan parchment continuous with the
  // Welcome modal, with arrow + spotlight halo recoloured to match.
  const CARD_BG = "hsla(186, 55%, 95%, 0.95)";
  const CARD_BORDER = "hsla(186, 50%, 60%, 0.35)";
  const CARD_TEXT = "hsl(200 30% 16%)";
  const CARD_TEXT_MUTED = "hsl(200 18% 36%)";
  const CARD_ACCENT = "hsl(186 70% 38%)";
  const HALO = "hsla(186, 70%, 60%, 0.55)";

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      options={{
        zIndex: 10000,
        spotlightPadding: 6,
        arrowColor: CARD_BG,
      }}
      onEvent={handleEvent}
      locale={{ last: "Finish", skip: "Skip" }}
      styles={{
        overlay: {
          backgroundColor: "hsla(0, 0%, 0%, 0.35)",
        },
        spotlight: {
          stroke: HALO,
          strokeWidth: 3,
        },
        tooltip: {
          backdropFilter: "blur(10px) saturate(140%)",
          WebkitBackdropFilter: "blur(10px) saturate(140%)",
          background: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: "12px",
          boxShadow:
            "0 18px 48px -16px rgba(0,0,0,0.55), 0 0 0 1px hsla(186,60%,60%,0.18), 0 2px 6px rgba(0,0,0,0.2)",
          color: CARD_TEXT,
          padding: "16px 18px",
        },
        tooltipTitle: {
          color: CARD_TEXT,
          fontWeight: 600,
          fontSize: "15px",
          marginBottom: "6px",
        },
        tooltipContent: {
          color: CARD_TEXT_MUTED,
          fontSize: "13.5px",
          lineHeight: 1.5,
          padding: 0,
        },
        buttonPrimary: {
          background: CARD_ACCENT,
          color: "white",
          borderRadius: "8px",
          fontSize: "13px",
          padding: "8px 14px",
        },
        buttonBack: {
          color: CARD_TEXT_MUTED,
          fontSize: "13px",
          marginRight: "8px",
        },
        buttonSkip: {
          color: CARD_TEXT_MUTED,
          fontSize: "12px",
        },
        buttonClose: {
          color: CARD_TEXT_MUTED,
          height: "10px",
          width: "10px",
        },
      }}
    />
  );
}

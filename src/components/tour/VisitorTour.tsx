import { useMemo, useRef } from "react";
import { Joyride, EVENTS, STATUS, type EventData, type Step } from "react-joyride";
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
  } = useShell();

  const lastStepRef = useRef<number>(-1);

  const steps: Step[] = useMemo(
    () => [
      {
        target: '[data-tour="runtime-area"]',
        placement: "center",
        title: "Welcome to your Runtime",
        content:
          "This is metaMe Runtime — your entry into cartridges, content, co-pilots, experiences and community. Explore freely without signing in.",
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
        target: '[data-tour="cartridge-indicator"]',
        placement: "bottom",
        title: "Cartridges",
        content:
          "Cartridges are focused experience spaces holding public and personal content. Start with KNYT, The Qriptopian, or metaMe. The active cartridge is shown up here.",
        data: { action: "show-cartridges" satisfies TourAction },
      },
      {
        target: '[data-tour="smart-menu-prompt"]',
        placement: "top",
        title: "Co-pilot prompt",
        content:
          "Tap any menu item again to open the prompt bar. That's where you talk to your aigent.",
        data: { action: "show-prompt" satisfies TourAction },
      },
      {
        // Sign In — arrow points at the persona / Be pill; card floats top-end
        // so it sits in the middle-right of the screen and does not cover the
        // SmartWallet drawer that opens on the right.
        target: '[data-tour="persona-nav"]',
        placement: "top-end",
        title: "Sign in",
        content:
          "Sign in from the SmartWallet on the right — the wallet is now open on the Sign-In tab. Once signed in you can remix, buy, earn, vote, save, publish and generate.",
        data: { action: "signin" satisfies TourAction },
      },
      {
        // Create Persona — same anchor (persona / Be pill), still floats
        // top-end. Wallet stays open on the Sign-In tab where the
        // "Create Persona" CTA lives.
        target: '[data-tour="persona-nav"]',
        placement: "top-end",
        title: "Create a persona",
        content:
          "In the open SmartWallet, tap Create Persona to launch the wizard and set up Qripto, KNYT or a delegate persona.",
        data: { action: "create-persona" satisfies TourAction },
      },
      {
        // SmartWallet — anchored to the Earn pill which also opens the wallet.
        target: '[data-tour="quick-action-wallet"]',
        placement: "top",
        title: "The SmartWallet",
        content:
          "Your SmartWallet is where you manage personas, payments, rewards and reputation across every cartridge.",
        data: { action: "open-wallet" satisfies TourAction },
      },
      {
        // Settings — anchored at the Settings quick action in Be. Card
        // top-end so the settings drawer (right floating) stays in view.
        target: '[data-tour="quick-action-settings"]',
        placement: "top-end",
        title: "Settings",
        content:
          "Set the rules your aigents act under — autonomy, spend limits, approvals and skill scope. The Settings drawer is open on the right.",
        data: { action: "open-settings" satisfies TourAction },
      },
      {
        // Persona activation happens inside the wallet — bring it back and
        // anchor at the persona/Be pill so users know where to manage it.
        target: '[data-tour="persona-nav"]',
        placement: "top-end",
        title: "Activate a persona",
        content:
          "Activating personas happens inside the SmartWallet. Choose Qripto, KNYT or a delegate to set the identity your aigent acts as.",
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

  /** Open the SmartWallet on the Sign-In tab (deep-linked). */
  const openWalletSignIn = () => {
    const dl = DEEP_LINK_DISPATCH["signin"];
    if (dl) sendIframeAction(dl.actionId, dl.deepLink);
    else sendIframeAction("wallet");
  };

  const runStepEffect = (action: TourAction | undefined) => {
    if (!action) return;
    pauseIdleTimer();
    switch (action) {
      case "reset":
      case "show-cartridges":
      case "show-trust":
      case "show-help":
        clearShellSurfaces();
        break;
      case "show-prompt":
        clearShellSurfaces();
        activateMode("play");
        break;
      case "signin":
      case "create-persona":
      case "activate-persona":
        // All three live inside the SmartWallet on the Sign-In tab.
        clearShellSurfaces();
        openWalletSignIn();
        break;
      case "open-wallet":
        clearShellSurfaces();
        activateMode("earn");
        sendIframeAction("wallet");
        break;
      case "open-settings":
        clearShellSurfaces();
        activateMode("be");
        sendIframeAction("settings");
        break;
    }
  };

  const handleEvent = (data: EventData) => {
    const { status, type, index } = data;

    if (type === EVENTS.STEP_BEFORE) {
      const step = steps[index];
      runStepEffect(step?.data?.action as TourAction | undefined);
      lastStepRef.current = index;
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      clearShellSurfaces();
      lastStepRef.current = -1;
      onFinish();
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
          borderRadius: "10px",
          boxShadow: `0 0 0 3px ${HALO}, 0 0 24px 6px ${HALO}`,
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

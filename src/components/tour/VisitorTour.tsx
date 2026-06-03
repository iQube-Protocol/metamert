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
  | "create-persona-wallet"
  | "create-persona-submenu"
  | "open-wallet"
  | "open-settings"
  | "show-trust"
  | "show-help";

/**
 * Visitor Tour.
 *
 * Step effects fire on STEP_BEFORE. We clear shell-side surfaces (mode +
 * submenu) on every transition so we never stack drawers. Sign-in & create-
 * persona open the SmartWallet drawer (right side, runtime-owned) — NOT the
 * IdentityIQube drawer (left). Settings opens the metaMe Settings drawer via
 * the Be submenu's Settings quick action.
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
        // Target the prompt bar itself so the tooltip sits ABOVE the prompt
        // input — overlaying the floating quick-action menu rather than being
        // pushed above it.
        target: '[data-tour="smart-menu-prompt"]',
        placement: "top",
        title: "Co-pilot prompt",
        content:
          "Tap any menu item again to open the prompt bar. That's where you talk to your aigent.",
        data: { action: "show-prompt" satisfies TourAction },
      },
      {
        target: '[data-tour="cartridge-indicator"]',
        placement: "bottom",
        title: "Cartridges",
        content:
          "Cartridges are focused experience spaces. Start with KNYT, The Qriptopian, or metaMe. Open cartridges appear here.",
        data: { action: "show-cartridges" satisfies TourAction },
      },
      {
        // Sign-in opens the SmartWallet on the right with the Sign-In tab
        // active. Card sits bottom-left so the wallet stays visible.
        target: '[data-tour="smart-menu-shell"]',
        placement: "top-start",
        title: "Sign in",
        content:
          "Sign in from the SmartWallet to remix, buy, earn, vote, save, publish or generate. Use the Sign In option in the wallet on the right.",
        data: { action: "signin" satisfies TourAction },
      },
      {
        // Same wallet still open — point users at the Create Persona CTA.
        target: '[data-tour="smart-menu-shell"]',
        placement: "top-start",
        title: "Create a persona — from the wallet",
        content:
          "Tap Create Persona in the SmartWallet to launch the persona wizard and set up Qripto, KNYT or a delegate.",
        data: { action: "create-persona-wallet" satisfies TourAction },
      },
      {
        // Alternate path: Be → persona submenu → + opens the wizard directly.
        target: '[data-tour="quick-action-persona"]',
        placement: "top",
        title: "Create a persona — from Be",
        content:
          "You can also reach the persona wizard from Be → Persona. Tap + to add a new Qripto, KNYT or delegate persona.",
        data: { action: "create-persona-submenu" satisfies TourAction },
      },
      {
        target: '[data-tour="quick-action-wallet"]',
        placement: "top",
        title: "The SmartWallet",
        content:
          "Activate personas, make payments and earn rewards across cartridges and runtime experiences.",
        data: { action: "open-wallet" satisfies TourAction },
      },
      {
        // Target the Settings quick action in Be so the arrow points at the
        // right control. Card placed top-end so the settings drawer (left)
        // remains visible.
        target: '[data-tour="quick-action-settings"]',
        placement: "top-end",
        title: "Settings",
        content:
          "Set the rules your aigents act under — autonomy, spend limits, approvals and skill scope.",
        data: { action: "open-settings" satisfies TourAction },
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

  const runStepEffect = (action: TourAction | undefined) => {
    if (!action) return;
    pauseIdleTimer();
    switch (action) {
      case "reset":
        clearShellSurfaces();
        break;
      case "show-prompt":
        clearShellSurfaces();
        activateMode("play");
        break;
      case "show-cartridges":
        clearShellSurfaces();
        break;
      case "signin": {
        // Open SmartWallet on Sign-In tab. Do NOT open IdentityIQube.
        clearShellSurfaces();
        const dl = DEEP_LINK_DISPATCH["signin"];
        if (dl) sendIframeAction(dl.actionId, dl.deepLink);
        else sendIframeAction("wallet");
        break;
      }
      case "create-persona-wallet": {
        // Keep SmartWallet open with sign-in context — user clicks "Create
        // Persona" in the wallet UI to launch the wizard.
        clearShellSurfaces();
        const dl = DEEP_LINK_DISPATCH["signin"];
        if (dl) sendIframeAction(dl.actionId, dl.deepLink);
        else sendIframeAction("wallet");
        break;
      }
      case "create-persona-submenu": {
        // Alternate entry: Be → Persona submenu pill. + opens the wizard
        // (already wired in SmartMenuSubmenu via DEEP_LINK_DISPATCH).
        clearShellSurfaces();
        activateMode("be");
        setSubmenuType("personaSelector");
        break;
      }
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
      case "show-trust":
      case "show-help":
        clearShellSurfaces();
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

  // Brand-tinted card surface — soft mint-cyan parchment that reads as part
  // of the metaMe palette (vs. plain cream) while staying legible over the
  // dark runtime canvas in both themes.
  const CARD_BG = "hsla(186, 55%, 95%, 0.95)";
  const CARD_BORDER = "hsla(186, 50%, 60%, 0.35)";
  const CARD_TEXT = "hsl(200 30% 16%)";
  const CARD_TEXT_MUTED = "hsl(200 18% 36%)";
  const CARD_ACCENT = "hsl(186 70% 38%)";

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      options={{ zIndex: 10000, spotlightPadding: 6 }}
      onEvent={handleEvent}
      locale={{ last: "Finish", skip: "Skip" }}
      styles={{
        overlay: {
          backgroundColor: "hsla(0, 0%, 0%, 0.35)",
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

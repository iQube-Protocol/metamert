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
  | "show-trust"
  | "show-help";

/**
 * Visitor Tour.
 *
 * Each step's `data.action` drives shell state via `runStepEffect` *before*
 * the tooltip renders (STEP_BEFORE), and we clear shell surfaces on each
 * transition (STEP_AFTER) so we don't end up with stacked drawers/submenus.
 *
 * Drawer-opening steps (signin / persona / wallet / settings) use the
 * working shell primitives today AND emit the new deep_link envelope so the
 * runtime side lights up "for free" once it ships its half.
 */
export default function VisitorTour({ run, onFinish }: Props) {
  const {
    sendIframeAction,
    activateMode,
    deactivateMode,
    setSubmenuType,
    openPersonaIQube,
    openIdentityIQube,
    pauseIdleTimer,
  } = useShell();

  // Track current step index so STEP_AFTER can clean up correctly.
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
          "Be, Make, Play, Earn and Share — five lenses for everything you can do here. Browse identity, media, creation, rewards and sharing experiences.",
        data: { action: "reset" satisfies TourAction },
      },
      {
        target: '[data-tour="smart-menu-shell"]',
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
        target: '[data-tour="smart-menu-shell"]',
        placement: "top",
        title: "Sign in",
        content:
          "Sign in and create a Persona to remix, buy, earn, vote, save, publish or generate content. Opens the Sign In tab in your wallet.",
        data: { action: "signin" satisfies TourAction },
      },
      {
        target: '[data-tour="persona-nav"]',
        placement: "top",
        title: "Create a persona",
        content:
          "Use the Persona wizard to create, manage and switch between Qripto, KNYT or agent delegates — or add a new one with +.",
        data: { action: "create-persona" satisfies TourAction },
      },
      {
        target: '[data-tour="smart-menu-shell"]',
        placement: "top",
        title: "The SmartWallet",
        content:
          "Activate personas, make payments and earn rewards across cartridges and runtime experiences.",
        data: { action: "open-wallet" satisfies TourAction },
      },
      {
        target: '[data-tour="smart-menu-shell"]',
        placement: "top",
        title: "Settings",
        content:
          "Set the rules by which your aigents can act, and how much autonomy and control you want them operating under.",
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
          "You can re-run this guide whenever you like by clicking the ? button up here.",
        data: { action: "show-help" satisfies TourAction },
      },
    ],
    [],
  );

  /** Close any shell-side surface (mode, submenu) before the next step. */
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
        clearShellSurfaces();
        openIdentityIQube();
        const dl = DEEP_LINK_DISPATCH["signin"];
        if (dl) sendIframeAction(dl.actionId, dl.deepLink);
        break;
      }
      case "create-persona": {
        clearShellSurfaces();
        // Surface the persona selector in the shell so the + pill is visible.
        activateMode("be");
        setSubmenuType("personaSelector");
        openPersonaIQube("qripto");
        const dl = DEEP_LINK_DISPATCH["persona-create"];
        if (dl) sendIframeAction(dl.actionId, dl.deepLink);
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

  // Light parchment surface for tour cards — legible in BOTH light and dark
  // mode. Sits above the dark runtime canvas without disappearing into it.
  const CARD_BG = "rgba(252, 250, 245, 0.94)";
  const CARD_BORDER = "rgba(20, 20, 30, 0.12)";
  const CARD_TEXT = "hsl(220 13% 18%)";
  const CARD_TEXT_MUTED = "hsl(220 9% 38%)";

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      disableOverlayClose
      spotlightPadding={6}
      onEvent={handleEvent}
      locale={{ last: "Finish", skip: "Skip" }}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          textColor: CARD_TEXT,
          backgroundColor: CARD_BG,
          arrowColor: CARD_BG,
          overlayColor: "hsla(0, 0%, 0%, 0.45)",
          zIndex: 10000,
        },
        overlay: {
          backgroundColor: "hsla(0, 0%, 0%, 0.45)",
        },
        tooltip: {
          backdropFilter: "blur(10px) saturate(140%)",
          WebkitBackdropFilter: "blur(10px) saturate(140%)",
          background: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: "12px",
          boxShadow: "0 18px 48px -16px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.2)",
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
        buttonNext: {
          background: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
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

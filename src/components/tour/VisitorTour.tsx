import { useMemo } from "react";
import { Joyride, EVENTS, STATUS, type EventData, type Step } from "react-joyride";
import { useShell } from "@/contexts/ShellContext";
import { DEEP_LINK_DISPATCH } from "@/lib/smart-menu-config";

interface Props {
  run: boolean;
  onFinish: () => void;
}

type TourAction =
  | "show-earn-menu"
  | "show-prompt"
  | "show-persona-submenu"
  | "create-persona"
  | "signin";

/**
 * Visitor Tour MVP.
 *
 * Steps anchor to shell-owned DOM via `data-tour` attributes. On each
 * STEP_BEFORE we drive shell state directly (open submenus, drawers) so the
 * user actually sees the surface the tooltip is describing. Drawer-open
 * steps additionally emit a MENU_ACTION with the new deep_link envelope —
 * this is a no-op today on the runtime side, but lights up "for free" once
 * the runtime team ships its half of the deep-link contract.
 */
export default function VisitorTour({ run, onFinish }: Props) {
  const {
    sendIframeAction,
    activateMode,
    deactivateMode,
    setSubmenuType,
    openPersonaIQube,
    openIdentityIQube,
    activeMode,
  } = useShell();

  const steps: Step[] = useMemo(
    () => [
      {
        target: '[data-tour="runtime-area"]',
        placement: "center",
        title: "Welcome to your Runtime",
        content:
          "Explore freely. Create a persona to act. Add an ExperienceGuide when you want aigentMe to personalize your Runtime.",
      },
      {
        target: '[data-tour="smart-menu"]',
        placement: "top",
        title: "Smart Menu",
        content:
          "Be, Make, Play, Earn and Share — five lenses for everything you can do here. Each opens a floating set of quick actions.",
        data: { action: "show-earn-menu" satisfies TourAction },
      },
      {
        target: '[data-tour="cartridge-indicator"]',
        placement: "bottom",
        title: "Cartridges",
        content:
          "Cartridges are the experiences you launch — metaMe, KNYT, Qriptopian. Open cartridges appear here.",
      },
      {
        target: '[data-tour="smart-menu"]',
        placement: "top",
        title: "Co-pilot prompt",
        content:
          "Tap any menu item again to open the prompt bar. That's where you talk to your aigent.",
        data: { action: "show-prompt" satisfies TourAction },
      },
      {
        target: '[data-tour="persona-nav"]',
        placement: "top",
        title: "Your persona",
        content:
          "The Be button is your active persona. Tap it to switch between Qripto and KNYT — or add a new one with +.",
        data: { action: "show-persona-submenu" satisfies TourAction },
      },
      {
        target: '[data-tour="persona-nav"]',
        placement: "top",
        title: "Create a persona",
        content:
          "A persona lets your aigent act on your behalf. Let's open the create-persona flow.",
        data: { action: "create-persona" satisfies TourAction },
      },
      {
        target: '[data-tour="smart-menu"]',
        placement: "top",
        title: "Sign in",
        content:
          "Sign in to unlock your wallet, rewards and reputation. Opens the Sign In tab in your wallet.",
        data: { action: "signin" satisfies TourAction },
      },
      {
        target: '[data-tour="trust-dots"]',
        placement: "bottom",
        title: "Trust & Reliability",
        content:
          "These dots reflect your aigent's live Trust and Reliability scores. Watch them respond as you interact.",
      },
      {
        target: '[data-tour="help-button"]',
        placement: "bottom",
        title: "Replay anytime",
        content:
          "You can re-run this guide whenever you like by clicking the ? button up here.",
      },
    ],
    [],
  );

  const runStepEffect = (action: TourAction | undefined) => {
    if (!action) return;
    switch (action) {
      case "show-earn-menu":
        activateMode("earn");
        break;
      case "show-prompt":
        // Surface the prompt bar over whichever mode is active (default earn).
        activateMode(activeMode ?? "earn");
        break;
      case "show-persona-submenu":
        setSubmenuType("personaSelector");
        break;
      case "create-persona": {
        // Open the persona drawer today via the working primitive…
        openPersonaIQube("qripto");
        // …and also emit the deep-link envelope so the runtime can route to
        // the create-wizard tab once it supports MENU_ACTION.deep_link.
        const dl = DEEP_LINK_DISPATCH["persona-create"];
        if (dl) sendIframeAction(dl.actionId, dl.deepLink);
        break;
      }
      case "signin": {
        openIdentityIQube();
        const dl = DEEP_LINK_DISPATCH["signin"];
        if (dl) sendIframeAction(dl.actionId, dl.deepLink);
        break;
      }
    }
  };

  const handleEvent = (data: EventData) => {
    const { status, type, step } = data;
    const action = step?.data?.action as TourAction | undefined;

    // Drive shell state *before* the tooltip renders so the target surface
    // is visible when the user reads the card.
    if (type === EVENTS.STEP_BEFORE) {
      runStepEffect(action);
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      // Tidy up any shell state we opened.
      setSubmenuType(null);
      deactivateMode();
      onFinish();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      disableScrolling
      onEvent={handleEvent}
      locale={{ last: "Finish", skip: "Skip" }}
      styles={{
        tooltip: {
          backdropFilter: "blur(14px) saturate(140%)",
          WebkitBackdropFilter: "blur(14px) saturate(140%)",
          background: "hsl(var(--card) / 0.78)",
          border: "1px solid hsl(var(--border) / 0.6)",
          borderRadius: "var(--mm-radius-md)",
          boxShadow: "var(--mm-shadow-panel)",
          color: "hsl(var(--foreground))",
        },
        tooltipTitle: {
          color: "hsl(var(--foreground))",
          fontWeight: 600,
        },
        tooltipContent: {
          color: "hsl(var(--foreground) / 0.85)",
        },
        buttonNext: {
          background: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          borderRadius: "var(--mm-radius-sm)",
        },
        buttonBack: {
          color: "hsl(var(--foreground) / 0.7)",
        },
        buttonSkip: {
          color: "hsl(var(--foreground) / 0.55)",
        },
        buttonClose: {
          color: "hsl(var(--foreground) / 0.55)",
        },
      }}
    />
  );
}

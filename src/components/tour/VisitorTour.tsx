import { useMemo } from "react";
import { Joyride, EVENTS, STATUS, type EventData, type Step } from "react-joyride";
import { useShell } from "@/contexts/ShellContext";
import { DEEP_LINK_DISPATCH } from "@/lib/smart-menu-config";

interface Props {
  run: boolean;
  onFinish: () => void;
}

/**
 * Visitor Tour MVP. Lightweight steps anchored to shell-owned DOM via
 * `data-tour` attributes. Two steps dispatch deep-linked MENU_ACTIONs to
 * open runtime-side drawers (Create persona, Sign In). Joyride cannot
 * anchor inside the iframe, so those steps simply trigger and advance.
 */
export default function VisitorTour({ run, onFinish }: Props) {
  const { sendIframeAction } = useShell();

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
      },
      {
        target: '[data-tour="persona-nav"]',
        placement: "top",
        title: "Your persona",
        content:
          "The Be button is your active persona. Tap it to switch between Qripto and KNYT — or add a new one with +.",
      },
      {
        target: '[data-tour="persona-nav"]',
        placement: "top",
        title: "Create a persona",
        content:
          "A persona lets your aigent act on your behalf. Let's open the create-persona flow.",
        data: { action: "create-persona" },
      },
      {
        target: '[data-tour="smart-menu"]',
        placement: "top",
        title: "Sign in",
        content:
          "Sign in to unlock your wallet, rewards and reputation. Opens the Sign In tab in your wallet.",
        data: { action: "signin" },
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

  const handleEvent = (data: EventData) => {
    const { status, type, step } = data;

    // Trigger side-effects after the user advances past an actionable step.
    if (type === EVENTS.STEP_AFTER && step?.data?.action) {
      const action = step.data.action as "create-persona" | "signin";
      const entry =
        action === "create-persona"
          ? DEEP_LINK_DISPATCH["persona-create"]
          : DEEP_LINK_DISPATCH["signin"];
      if (entry) sendIframeAction(entry.actionId, entry.deepLink);
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onFinish();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      onEvent={handleEvent}
      options={{
        showProgress: true,
        skipBeacon: true,
        skipScroll: true,
        buttons: ["back", "close", "primary", "skip"],
        primaryColor: "hsl(var(--primary))",
        backgroundColor: "var(--mm-surface-2)",
        arrowColor: "var(--mm-surface-2)",
        textColor: "var(--mm-ink-primary)",
        overlayColor: "rgba(0,0,0,0.55)",
        zIndex: 10000,
      }}
      locale={{ last: "Finish", skip: "Skip" }}
    />
  );
}

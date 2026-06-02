import { useMemo } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useShell } from "@/contexts/ShellContext";
import { DEEP_LINK_DISPATCH } from "@/lib/smart-menu-config";

interface Props {
  run: boolean;
  onFinish: () => void;
}

/**
 * Visitor Tour MVP. 10 lightweight steps anchored to shell-owned DOM via
 * `data-tour` attributes. Steps 6 and 7 dispatch deep-linked MENU_ACTIONs
 * to open runtime-side drawers (Create persona, Sign In). Joyride cannot
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
        disableBeacon: true,
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
          "Cartridges are the experiences you launch — metaMe, KNYT, Qriptopian. Open cartridges show up here.",
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
          "The Be button is your active persona. Tap it to switch between Qripto and KNYT — or add a new one.",
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

  const handleCallback = (data: CallBackProps) => {
    const { status, type, step, index } = data;

    // Side-effects when an actionable step is reached.
    if (type === "step:after" && step?.data?.action) {
      const action = step.data.action as "create-persona" | "signin";
      if (action === "create-persona") {
        const dl = DEEP_LINK_DISPATCH["persona-create"];
        sendIframeAction("persona", dl);
      } else if (action === "signin") {
        const dl = DEEP_LINK_DISPATCH["signin"];
        sendIframeAction("wallet", dl);
      }
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
      showProgress
      showSkipButton
      disableScrolling
      callback={handleCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "hsl(var(--primary))",
          backgroundColor: "var(--mm-surface-2)",
          textColor: "var(--mm-ink-primary)",
          arrowColor: "var(--mm-surface-2)",
          overlayColor: "rgba(0,0,0,0.55)",
        },
        tooltip: {
          borderRadius: 12,
          border: "var(--mm-border-default)",
        },
        tooltipTitle: { color: "var(--mm-ink-primary)" },
        tooltipContent: { color: "var(--mm-ink-secondary)" },
        buttonNext: { borderRadius: 8 },
        buttonBack: { color: "var(--mm-ink-muted)" },
        buttonSkip: { color: "var(--mm-ink-muted)" },
      }}
      locale={{ last: "Finish", skip: "Skip" }}
    />
  );
}

import { useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";

interface Props {
  onClick: () => void;
}

/**
 * Small "?" button that restarts the Visitor Tour.
 * On first arrival per page load, an overlay ring pulses green for 3s.
 * No Radix tooltip — Joyride focus changes were causing it to flash on every
 * step change. Native `title` attribute is enough; `aria-label` covers a11y.
 */
export default function TourHelpButton({ onClick }: Props) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const w = window as unknown as { __metameHelpPulsed?: boolean };
    if (w.__metameHelpPulsed) return;
    w.__metameHelpPulsed = true;

    const start = window.setTimeout(() => setPulse(true), 600);
    const stop = window.setTimeout(() => setPulse(false), 600 + 3000);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(stop);
    };
  }, []);

  return (
    <button
      data-tour="help-button"
      onClick={onClick}
      aria-label="Replay welcome guide"
      title="Replay welcome guide"
      className="relative flex h-7 w-7 items-center justify-center transition-colors"
      style={{
        color: pulse ? "hsl(150 70% 45%)" : "var(--mm-ink-muted)",
        borderRadius: "9999px",
      }}
    >
      {pulse && <span className="metame-guide-pulse-ring" aria-hidden="true" />}
      <HelpCircle className="h-4 w-4 relative" style={{ zIndex: 1 }} />
    </button>
  );
}

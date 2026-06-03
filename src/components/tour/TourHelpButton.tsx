import { useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  onClick: () => void;
}

/**
 * Small "?" button that restarts the Visitor Tour. Mounted in the header.
 * On first arrival (no tour completed/skipped flag), pulses green for 3s
 * to draw the user's attention to the guide.
 */
export default function TourHelpButton({ onClick }: Props) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Pulse once per full page load. Using a window-level flag (not storage)
    // means it survives component remounts within the same page but resets on
    // every fresh navigation/refresh — i.e. each time a user "arrives".
    const w = window as unknown as { __metameHelpPulsed?: boolean };
    if (w.__metameHelpPulsed) return;
    w.__metameHelpPulsed = true;

    const raf = window.requestAnimationFrame(() => setPulse(true));
    const t = window.setTimeout(() => setPulse(false), 3000);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, []);


  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            data-tour="help-button"
            onClick={onClick}
            aria-label="Replay welcome guide"
            className={`flex h-7 w-7 items-center justify-center transition-colors ${pulse ? "tour-help-pulse" : ""}`}
            style={{
              color: pulse ? "hsl(150 70% 50%)" : "var(--mm-ink-muted)",
              borderRadius: "var(--mm-radius-xs)",
            }}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Replay welcome guide</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

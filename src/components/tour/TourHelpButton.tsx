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
 */
export default function TourHelpButton({ onClick }: Props) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            data-tour="help-button"
            onClick={onClick}
            aria-label="Replay welcome guide"
            className="flex h-7 w-7 items-center justify-center transition-colors"
            style={{
              color: "var(--mm-ink-muted)",
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

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onStart: () => void;
  onSkip: () => void;
}

/**
 * First-time visitor welcome modal. Styled to match the Visitor Tour cards
 * (mint-cyan parchment, translucent) so the journey feels visually continuous.
 */
export default function WelcomeModal({ open, onStart, onSkip }: Props) {
  const CARD_BG = "hsla(186, 55%, 95%, 0.95)";
  const CARD_BORDER = "hsla(186, 50%, 60%, 0.35)";
  const CARD_TEXT = "hsl(200 30% 16%)";
  const CARD_TEXT_MUTED = "hsl(200 18% 36%)";
  const CARD_ACCENT = "hsl(186 70% 38%)";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onSkip(); }}>
      <DialogContent
        className="max-w-md"
        style={{
          background: CARD_BG,
          backdropFilter: "blur(10px) saturate(140%)",
          WebkitBackdropFilter: "blur(10px) saturate(140%)",
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: "12px",
          boxShadow:
            "0 18px 48px -16px rgba(0,0,0,0.55), 0 0 0 1px hsla(186,60%,60%,0.18), 0 2px 6px rgba(0,0,0,0.2)",
          color: CARD_TEXT,
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: CARD_TEXT, fontWeight: 600 }}>
            Welcome to your metaMe Runtime
          </DialogTitle>
          <DialogDescription style={{ color: CARD_TEXT_MUTED, fontSize: "13.5px", lineHeight: 1.5 }}>
            Explore freely. Create a persona to act. Add an ExperienceGuide when
            you want aigentMe to personalize your Runtime.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={onSkip}
            style={{ color: CARD_TEXT_MUTED }}
          >
            Explore on my own
          </Button>
          <Button
            onClick={onStart}
            style={{ background: CARD_ACCENT, color: "white" }}
          >
            Start guide
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

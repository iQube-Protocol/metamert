import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onStart: () => void;
  onSkip: () => void;
}

/**
 * First-time visitor welcome modal. Appears once until the user starts or
 * skips the tour. Persistence handled by `useTourState`.
 */
export default function WelcomeModal({ open, onStart, onSkip }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onSkip(); }}>
      <DialogContent
        className="max-w-md"
        style={{
          backgroundColor: "var(--mm-surface-2)",
          border: "var(--mm-border-default)",
          color: "var(--mm-ink-primary)",
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: "var(--mm-ink-primary)" }}>
            Welcome to your metaMe Runtime
          </DialogTitle>
          <DialogDescription style={{ color: "var(--mm-ink-secondary)" }}>
            Explore freely. Create a persona to act. Add an ExperienceGuide when
            you want aigentMe to personalize your Runtime.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={onSkip}>
            Explore on my own
          </Button>
          <Button onClick={onStart}>Start guide</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useShell } from "@/contexts/ShellContext";
import { SendHorizonal, ChevronUp, ChevronDown } from "lucide-react";

/**
 * Floating prompt input with send button + chevron to toggle QuickLinksBar.
 * Chevron is to the RIGHT of the send button.
 */
export default function PromptBox() {
  const { config, submitPrompt, quickLinksExpanded, toggleQuickLinks } = useShell();
  const [text, setText] = useState("");

  const placeholder =
    config?.menu?.policy?.prompt_box?.placeholder ?? "What do you want to do today?";

  const handleSubmit = () => {
    if (!text.trim()) return;
    submitPrompt(text.trim());
    setText("");
    // Dismiss mobile keyboard to restore viewport
    (document.activeElement as HTMLElement)?.blur();
  };

  return (
    <div className="glass-float flex items-center rounded-xl px-2 py-1.5 shadow-lg">
      {/* Left spacer to balance the right-side buttons */}
      <div className="flex w-[4.75rem] shrink-0" />
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-center text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <div className="flex shrink-0 items-center">
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
        >
          <SendHorizonal className="h-4 w-4" />
        </button>
        <button
          onClick={toggleQuickLinks}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-transparent text-muted-foreground transition-all duration-150 hover:bg-accent/50 hover:text-accent-foreground active:scale-95"
          aria-label={quickLinksExpanded ? "Hide quick links" : "Show quick links"}
        >
          {quickLinksExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

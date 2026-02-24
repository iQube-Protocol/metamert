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
  };

  return (
    <div className="glass-float flex items-center gap-1.5 rounded-xl border-0 px-2 py-1.5 shadow-lg">
      <div className="flex flex-1 items-center rounded-lg border-0 bg-transparent">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
        >
          <SendHorizonal className="h-4 w-4" />
        </button>
      </div>
      <button
        onClick={toggleQuickLinks}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-accent-foreground active:scale-95"
        aria-label={quickLinksExpanded ? "Hide quick links" : "Show quick links"}
      >
        {quickLinksExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>
    </div>
  );
}

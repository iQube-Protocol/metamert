import { useState } from "react";
import { useShell } from "@/contexts/ShellContext";
import { SendHorizonal, ChevronDown, ChevronRight } from "lucide-react";

/**
 * Post-welcome prompt input with send button and chevron to toggle quick links.
 */
export default function PromptBox() {
  const { submitPrompt, quickLinksExpanded, toggleQuickLinks } = useShell();
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    submitPrompt(text.trim());
    setText("");
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      <div className="flex flex-1 items-center rounded-lg border border-border bg-card">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="What do you want to do today?"
          className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <SendHorizonal className="h-4 w-4" />
        </button>
      </div>
      <button
        onClick={toggleQuickLinks}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
      >
        {quickLinksExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
    </div>
  );
}

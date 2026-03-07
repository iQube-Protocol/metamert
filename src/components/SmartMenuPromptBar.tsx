/**
 * SmartMenuPromptBar — the transformed bottom nav in prompt mode.
 * Contains: Input | Mic | Send | Chevron
 */
import { useState, useRef, useEffect } from "react";
import { resolveIcon } from "@/lib/icon-utils";
import { useShell } from "@/contexts/ShellContext";
import { MODE_CONFIGS } from "@/lib/smart-menu-config";
import { SendHorizonal, Mic, ChevronUp, ChevronDown } from "lucide-react";

export default function SmartMenuPromptBar() {
  const {
    activeMode,
    submitPrompt,
    toggleSubmenu,
    submenuVisibility,
    resetIdleTimer,
    setInteractionState,
    deactivateMode,
  } = useShell();

  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const modeConfig = activeMode ? MODE_CONFIGS[activeMode] : null;
  const accent = modeConfig?.accentHex ?? "#fff";

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!text.trim()) return;
    submitPrompt(text.trim());
    setText("");
    // Send keeps prompt open (spec requirement)
    resetIdleTimer("typing");
    (document.activeElement as HTMLElement)?.blur();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    resetIdleTimer("typing");
    setInteractionState(e.target.value ? "typing" : "focused");
  };

  const handleFocus = () => {
    resetIdleTimer("promptFocus");
    setInteractionState("focused");
  };

  const handleBlur = () => {
    if (!text) setInteractionState("idle");
  };

  const submenuHidden = submenuVisibility !== "visibleAuto";

  return (
    <div
      className="flex items-center border-t border-border bg-card px-2 gap-1"
      style={{ height: '3.25rem' }}
      onPointerEnter={() => resetIdleTimer("hover")}
    >
      {/* Mode indicator pill */}
      <button
        onClick={deactivateMode}
        className="flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-semibold transition-all active:scale-95"
        style={{
          backgroundColor: `${accent}20`,
          color: accent,
          border: `1px solid ${accent}35`,
        }}
      >
        {(() => {
          const ModeIcon = resolveIcon(undefined, modeConfig?.id);
          return ModeIcon ? <ModeIcon className="h-4 w-4" /> : <span className="text-xs">{modeConfig?.label}</span>;
        })()}
      </button>

      {/* Prompt input */}
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder={modeConfig?.promptPlaceholder ?? "What do you want to do?"}
        className="min-w-0 flex-1 bg-transparent px-2 py-1 text-sm text-white placeholder:text-muted-foreground focus:outline-none"
        style={{ caretColor: accent }}
      />

      {/* Controls: Mic | Send | Chevron */}
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
          title="Voice input"
        >
          <Mic className="h-4 w-4" />
        </button>
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-30"
          style={{ color: text.trim() ? accent : undefined }}
          title="Send"
        >
          <SendHorizonal className="h-4 w-4" />
        </button>
        <button
          onClick={toggleSubmenu}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
          aria-label={submenuHidden ? "Show quick actions" : "Hide quick actions"}
        >
          {submenuHidden ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

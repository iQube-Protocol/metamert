/**
 * SmartMenuPromptBar — the transformed bottom nav in prompt mode.
 * Contains: Input | Mic | Send | Chevron
 * Spec: accent border trim, ~15px text, swipe-down collapse, text-prevents-idle-collapse.
 */
import { useState, useRef, useEffect, useCallback } from "react";
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
    setPromptHasText,
  } = useShell();

  const [text, setText] = useState("");
  const [hasSent, setHasSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  const modeConfig = activeMode ? MODE_CONFIGS[activeMode] : null;
  const accent = modeConfig?.accentHex ?? "#fff";

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Sync prompt-has-text to context for idle logic
  useEffect(() => {
    setPromptHasText(text.length > 0);
  }, [text, setPromptHasText]);

  // Swipe-down to collapse
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (dy > 40) deactivateMode(); // swipe down threshold
    touchStartY.current = null;
  }, [deactivateMode]);

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
      ref={barRef}
      className="flex items-center bg-card px-2 gap-1 transition-colors duration-300"
      style={{
        height: '3.25rem',
        // Accent trim: top border in mode color (spec: accent piping/trim)
        borderTop: `1px solid ${accent}`,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mode indicator pill — slight pop animation */}
      <button
        onClick={deactivateMode}
        className="flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-semibold transition-all active:scale-95 animate-scale-in"
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

      {/* Prompt input — spec: brilliant white, ~1pt larger than text-sm */}
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder={modeConfig?.promptPlaceholder ?? "What do you want to do?"}
        className="min-w-0 flex-1 bg-transparent px-2 py-1 text-white placeholder:text-muted-foreground focus:outline-none"
        style={{
          caretColor: accent,
          fontSize: '0.9375rem', // 15px (~1pt larger than 14px text-sm)
        }}
      />

      {/* Controls: Mic | Send | Chevron */}
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
          title="Voice input"
          onClick={() => resetIdleTimer("micToggle")}
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

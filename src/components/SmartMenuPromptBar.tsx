/**
 * SmartMenuPromptBar — the transformed bottom nav in prompt mode.
 * Contains: Input | Mic | Send | Chevron
 * Spec: accent border trim, ~15px text, swipe-down collapse, text-prevents-idle-collapse.
 */
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { resolveIcon } from "@/lib/icon-utils";
import { useShell } from "@/contexts/ShellContext";
import { useBrowserOptional } from "@/contexts/BrowserContext";
import { MODE_CONFIGS } from "@/lib/smart-menu-config";
import { SendHorizonal, Mic, ChevronUp, ChevronDown, Globe } from "lucide-react";

/** Track whether the prompt input is focused — used to hold idle timers */
let promptInputFocused = false;

export default function SmartMenuPromptBar() {
  const {
    activeMode,
    viewState,
    submitPrompt,
    toggleSubmenu,
    submenuVisibility,
    resetIdleTimer,
    pauseIdleTimer,
    resumeIdleTimer,
    setInteractionState,
    deactivateMode,
    setPromptHasText,
  } = useShell();

  const [text, setText] = useState("");
  const [hasSent, setHasSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const browser = useBrowserOptional();

  const modeConfig = activeMode ? MODE_CONFIGS[activeMode] : null;
  const accent = modeConfig?.accentHex ?? "#7B7266";

  // Detect if text looks like a URL
  const isUrl = useMemo(() => {
    const t = text.trim();
    if (!t) return false;
    return /^https?:\/\//i.test(t) || /^[a-z0-9][-a-z0-9]*\.[a-z]{2,}/i.test(t);
  }, [text]);

  // Browser is active and mounted
  const browserActive = browser && browser.surfaceState !== "collapsed" && browser.surfaceState !== "error";

  // Auto-focus only when entering prompt mode (not quickActionOnly)
  useEffect(() => {
    if (viewState === "promptMode") {
      inputRef.current?.focus();
    }
  }, [viewState]);

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
    if (dy > 40) deactivateMode();
    touchStartY.current = null;
  }, [deactivateMode]);

  const handleSubmit = () => {
    if (!text.trim()) return;

    if (isUrl && browser) {
      const url = text.trim().startsWith("http") ? text.trim() : `https://${text.trim()}`;
      browser.requestOpen(url);
      setText("");
      setHasSent(true);
      resetIdleTimer("typing");
      (document.activeElement as HTMLElement)?.blur();
      return;
    }

    submitPrompt(text.trim());
    setText("");
    setHasSent(true);
    resetIdleTimer("typing");
    (document.activeElement as HTMLElement)?.blur();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (hasSent && e.target.value) setHasSent(false);
    resetIdleTimer("typing");
    setInteractionState(e.target.value ? "typing" : "focused");
  };

  const handleFocus = () => {
    promptInputFocused = true;
    pauseIdleTimer();
    setInteractionState("focused");
    const scrollToInput = () => {
      inputRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    };
    requestAnimationFrame(scrollToInput);
    setTimeout(scrollToInput, 300);
    setTimeout(scrollToInput, 600);
  };

  const handleBlur = () => {
    promptInputFocused = false;
    if (!text) setInteractionState("idle");
    resumeIdleTimer();
  };

  const submenuHidden = submenuVisibility !== "visibleAuto";

  return (
    <div
      ref={barRef}
      className="flex items-center px-2 pt-3 pb-2 gap-1 transition-all animate-in fade-in slide-in-from-bottom-2"
      style={{
        animationDuration: '300ms',
        transitionDuration: '300ms',
        height: '4.25rem',
        borderTop: `1px solid ${accent}`,
        backgroundColor: 'var(--mm-surface-2)',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mode indicator pill — slight pop animation */}
      <button
        onClick={deactivateMode}
        className="flex h-8 shrink-0 items-center justify-center transition-all active:scale-95 animate-scale-in"
        style={{ color: accent }}
      >
        {(() => {
          const ModeIcon = resolveIcon(undefined, modeConfig?.id);
          return ModeIcon ? <ModeIcon className="h-5 w-5" /> : <span className="text-xs font-semibold">{modeConfig?.label}</span>;
        })()}
      </button>

      {/* Prompt input — parchment ink, not white */}
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder={browserActive ? "Enter URL or ask about the page…" : (modeConfig?.promptPlaceholder ?? "What do you want to do?")}
        className="min-w-0 flex-1 bg-transparent px-2 py-1 focus:outline-none"
        style={{
          caretColor: accent,
          fontSize: '0.9375rem',
          textAlign: hasSent ? 'left' : 'center',
          color: 'var(--mm-ink-primary)',
        }}
      />

      {/* Controls: Mic | Send | Chevron */}
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          className="flex h-8 w-8 items-center justify-center transition-colors"
          style={{ color: 'var(--mm-ink-muted)', borderRadius: 'var(--mm-radius-xs)' }}
          title="Voice input"
          onClick={() => resetIdleTimer("micToggle")}
        >
          <Mic className="h-4 w-4" />
        </button>
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="flex h-8 w-8 items-center justify-center transition-colors disabled:opacity-30"
          style={{ color: text.trim() ? accent : 'var(--mm-ink-faint)', borderRadius: 'var(--mm-radius-xs)' }}
          title={isUrl ? "Navigate" : "Send"}
        >
          {isUrl ? <Globe className="h-4 w-4" /> : <SendHorizonal className="h-4 w-4" />}
        </button>
        <button
          onClick={toggleSubmenu}
          className="flex h-8 w-8 items-center justify-center transition-colors"
          style={{ color: 'var(--mm-ink-muted)', borderRadius: 'var(--mm-radius-xs)' }}
          aria-label={submenuHidden ? "Show quick actions" : "Hide quick actions"}
        >
          {submenuHidden ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

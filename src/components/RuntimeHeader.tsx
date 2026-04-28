import { useShell } from "@/contexts/ShellContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bot, ChevronDown, Check, Zap, Sun, Moon, Save, X } from "lucide-react";
import ProviderIcon from "@/components/ProviderIcon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";

/** Map a 0-10 score to 0-5 filled dots using ceil(score/2) */
function scoreToDots(score: number | undefined, fallback: number): number {
  if (score == null) return fallback;
  return Math.ceil(Math.min(10, Math.max(0, score)) / 2);
}

function trustDotColor(score: number | undefined): string {
  const v = score ?? 5;
  if (v <= 3) return "bg-mm-accent-alert";
  if (v <= 6) return "bg-mm-accent-codex";
  return "bg-mm-accent-earn";
}

function reliabilityDotColor(score: number | undefined): string {
  const v = score ?? 5;
  if (v <= 3) return "bg-mm-accent-alert";
  if (v <= 6) return "bg-mm-accent-codex";
  return "bg-mm-accent-runtime";
}

/** Returns "up", "down", or null for score direction */
function scoreDirection(prev: number | undefined, curr: number | undefined): "up" | "down" | null {
  if (prev == null || curr == null) return null;
  if (curr > prev) return "up";
  if (curr < prev) return "down";
  return null;
}

export default function RuntimeHeader() {
  const { config, selectAigent, selectLLM, inferring, cartridgeState, knytOnboarding, iframeRef, runtimeContext, cartridgeOverlay, closeCartridgeOverlay } = useShell();
  const [aigentOpen, setAigentOpen] = useState(false);
  const [llmOpen, setLlmOpen] = useState(false);
  const [trustFlash, setTrustFlash] = useState(false);
  const prevScoresRef = useRef<Record<string, number | undefined>>({});

  // Theme toggle state — default dark, check URL param
  const [theme, setTheme] = useState<"light" | "dark">(
    new URLSearchParams(window.location.search).get("theme") === "light" ? "light" : "dark"
  );

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";

    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
    iframeRef.current?.contentWindow?.postMessage({ type: "SET_THEME", theme }, "*");
  }, [theme, iframeRef]);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === "light" ? "dark" : "light"));
  }, []);

  const llmGroups = useMemo(() => {
    if (!config) return [];
    const groups: { provider: string; color: string; options: typeof config.selectors.llm.options }[] = [];
    const map = new Map<string, typeof groups[0]>();
    for (const o of config.selectors.llm.options) {
      const prov = o.provider ?? "Other";
      if (!map.has(prov)) {
        const g = { provider: prov, color: o.provider_color ?? o.color ?? "#888", options: [] as typeof config.selectors.llm.options };
        map.set(prov, g);
        groups.push(g);
      }
      map.get(prov)!.options.push(o);
    }
    return groups;
  }, [config]);

  const trustScores = config?.trust?.scores ?? {};

  // LOV-403: Track score direction for live flow feedback
  const [trustDir, setTrustDir] = useState<"up" | "down" | null>(null);
  const [reliabilityDir, setReliabilityDir] = useState<"up" | "down" | null>(null);

  // Flash animation + direction indicators when trust scores change
  useEffect(() => {
    const prev = prevScoresRef.current;
    if (prev.trust !== trustScores.trust || prev.reliability !== trustScores.reliability) {
      if (prev.trust !== undefined || prev.reliability !== undefined) {
        setTrustFlash(true);
        setTrustDir(scoreDirection(prev.trust, trustScores.trust));
        setReliabilityDir(scoreDirection(prev.reliability, trustScores.reliability));
        const timer = setTimeout(() => {
          setTrustFlash(false);
          setTrustDir(null);
          setReliabilityDir(null);
        }, 1200);
        prevScoresRef.current = trustScores;
        return () => clearTimeout(timer);
      }
      prevScoresRef.current = trustScores;
    }
  }, [trustScores.trust, trustScores.reliability]);

  if (!config) return null;

  const trust = config.trust ?? { level: "unverified", signals: [], scores: {} };
  const rScore = scoreToDots(trustScores.reliability, 4);
  const tScore = scoreToDots(trustScores.trust, 3);
  const rColor = reliabilityDotColor(trustScores.reliability);
  const tColor = trustDotColor(trustScores.trust);

  const renderDots = (filled: number, activeColor: string) =>
    [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`inline-block h-2 w-2 rounded-full ${
          inferring ? "animate-pulse duration-700" : "transition-all duration-300"
        } ${i < filled ? activeColor : "bg-mm-ink-faint/30"}`}
        style={{
          ...(inferring ? { animationDelay: `${i * 150}ms` } : {}),
          ...(i < filled ? { opacity: 1, filter: 'saturate(2) brightness(1.1)' } : {}),
        }}
      />
    ));

  const activeAigent = config.selectors.aigent.options.find(o => o.id === config.selectors.aigent.current);
  const activeLLM = config.selectors.llm.options.find(o => o.id === config.selectors.llm.current);

  // Cartridge/Codex info for header center (tooltip only — color is now driven by runtimeContext)
  const activeCart = cartridgeState.available.find(c => c.id === cartridgeState.activeCartridgeId);
  const activeCodex = activeCart?.codexes.find(c => c.id === cartridgeState.activeCodexId);
  // Header lightning bolt color reflects the active runtime context, not the cartridge.
  // KNYT context → amber; metaMe context → emerald. Onboarding forces KNYT amber.
  const KNYT_AMBER = "#F59E0B";
  const METAME_EMERALD = "#10B981";
  const cartridgeColor = (runtimeContext === "knyt" || knytOnboarding) ? KNYT_AMBER : METAME_EMERALD;
  // Cartridge overlay chip accent — tinted with the active cartridge's accentHex
  // so the floppy disk indicator matches the quick-actions cartridge color
  // (KNYT amber, Qriptopian cyan, metaMe coral).
  // Tolerant slug match: runtime may emit 'metame' / 'knyt' / 'qripto' (bare)
  // while our canonical cartridge IDs are '-codex' suffixed (e.g. 'metame-codex').
  // Compare both forms so the floppy chip always picks up the cartridge accent.
  const overlayCart = cartridgeOverlay
    ? cartridgeState.available.find(c => {
        const slug = cartridgeOverlay.slug;
        const cid = c.id;
        return (
          cid === slug ||
          cid === `${slug}-codex` ||
          cid.replace(/-codex$/, "") === slug.replace(/-codex$/, "")
        );
      })
    : null;
  const overlayAccent = overlayCart?.accentHex ?? 'var(--mm-ink-secondary)';

  return (
    <TooltipProvider delayDuration={300}>
      <header
        className="relative flex items-center justify-between px-3 py-1.5"
        style={{
          backgroundColor: 'var(--mm-surface-1)',
          borderBottom: 'var(--mm-border-hairline)',
        }}
      >
        {/* Left: selectors */}
        <div className="flex items-center gap-2">
          {/* Aigent selector */}
          <Popover open={aigentOpen} onOpenChange={setAigentOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-0.5 px-1.5 h-8 transition-colors"
                style={{ borderRadius: 'var(--mm-radius-xs)' }}
              >
                <Bot className="h-5 w-5 shrink-0" style={activeAigent?.color ? (theme === "light" ? { color: activeAigent.color, stroke: activeAigent.color, fill: 'white', strokeWidth: 1.8 } : { color: activeAigent.color }) : { color: 'var(--mm-ink-secondary)' }} />
                <ChevronDown className="h-3 w-3 shrink-0" style={{ color: 'var(--mm-ink-muted)' }} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-48 p-1 z-50"
              align="start"
              style={{
                backgroundColor: 'var(--mm-surface-2)',
                border: 'var(--mm-border-default)',
                borderRadius: 'var(--mm-radius-sm)',
                boxShadow: 'var(--mm-shadow-mid)',
              }}
            >
              {config.selectors.aigent.options.map((o) => (
                <button
                  key={o.id}
                  onClick={() => { selectAigent(o.id); setAigentOpen(false); }}
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-sm transition-colors hover:bg-mm-canvas-variant"
                  style={{ borderRadius: 'var(--mm-radius-xs)' }}
                >
                  <Bot className="h-4 w-4 shrink-0" style={o.color ? { color: o.color, fill: o.color } : undefined} />
                  <span className="flex-1 text-left text-mm-ink-primary">{o.label}</span>
                  {o.id === config.selectors.aigent.current && <Check className="h-3.5 w-3.5 text-mm-accent-runtime" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* LLM selector */}
          <Popover open={llmOpen} onOpenChange={setLlmOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-0.5 px-1.5 h-8 transition-colors"
                style={{ borderRadius: 'var(--mm-radius-xs)' }}
              >
                <ProviderIcon
                  provider={activeLLM?.provider}
                  className="h-5 w-5 shrink-0"
                  style={activeLLM?.provider_color ? { color: activeLLM.provider_color } : { color: 'var(--mm-ink-secondary)' }}
                />
                <ChevronDown className="h-3 w-3 shrink-0" style={{ color: 'var(--mm-ink-muted)' }} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-56 p-1 z-50"
              align="start"
              style={{
                backgroundColor: 'var(--mm-surface-2)',
                border: 'var(--mm-border-default)',
                borderRadius: 'var(--mm-radius-sm)',
                boxShadow: 'var(--mm-shadow-mid)',
              }}
            >
              {llmGroups.map((group, gi) => (
                <div key={group.provider}>
                  {gi > 0 && <div className="my-1" style={{ borderTop: 'var(--mm-border-hairline)' }} />}
                  <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-mm-ink-muted">
                    <ProviderIcon provider={group.provider} className="h-3.5 w-3.5" style={{ color: group.color }} />
                    {group.provider}
                  </div>
                  {group.options.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => { selectLLM(o.id); setLlmOpen(false); }}
                      className="flex w-full items-center gap-2 px-2 py-1.5 pl-7 text-sm transition-colors hover:bg-mm-canvas-variant"
                      style={{ borderRadius: 'var(--mm-radius-xs)' }}
                    >
                      <span className="flex-1 text-left text-mm-ink-primary">{o.label}</span>
                      {o.id === config.selectors.llm.current && <Check className="h-3.5 w-3.5 text-mm-accent-runtime" />}
                    </button>
                  ))}
                </div>
              ))}
            </PopoverContent>
          </Popover>

          {/* Theme toggle (next to LLM dropdown) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                className="inline-flex h-7 w-7 items-center justify-center rounded-mm-xs border border-transparent bg-transparent p-0 text-mm-ink-primary transition-colors hover:bg-mm-line-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              >
                {theme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">{theme === "light" ? "Switch to dark mode" : "Switch to light mode"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Center: Cartridge icon (dead center) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-default">
                <Zap className="h-[19px] w-[19px]" style={theme === "light" ? { color: cartridgeColor, stroke: cartridgeColor, fill: 'white', strokeWidth: 1.8 } : { color: cartridgeColor }} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">{activeCodex?.label ?? activeCart?.label ?? "No cartridge"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {/* Right: cartridge overlay indicator + trust dots */}
        <div className="flex items-center justify-end ml-auto gap-2">
          {cartridgeOverlay && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex items-center gap-1 px-2 py-1"
                  style={{
                    borderRadius: 'var(--mm-radius-xs)',
                    backgroundColor: 'var(--mm-canvas-variant)',
                    border: 'var(--mm-border-hairline)',
                  }}
                >
                  <Save className="h-3.5 w-3.5" style={{ color: overlayAccent }} />
                  <button
                    type="button"
                    onClick={closeCartridgeOverlay}
                    aria-label={`Close ${cartridgeOverlay.title}`}
                    className="inline-flex h-4 w-4 items-center justify-center rounded-mm-xs text-mm-ink-muted transition-colors hover:bg-mm-line-subtle hover:text-mm-ink-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Close {cartridgeOverlay.title}</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`relative flex items-center gap-4 px-3 py-2 text-[11px] cursor-default transition-all duration-300 ${trustFlash ? "ring-1 ring-mm-accent-runtime/40 scale-105" : ""}`}
                style={{
                  borderRadius: 'var(--mm-radius-xs)',
                  color: 'var(--mm-ink-muted)',
                }}
              >
                {/* Background layer behind content so dots stay vivid */}
                <div className="absolute inset-0 bg-mm-canvas-variant/40" style={{ borderRadius: 'inherit' }} />
                <div className="relative flex items-center gap-0.5">
                  <span className="font-medium mr-1" style={{ color: 'var(--mm-ink-secondary)' }}>R</span>
                  {renderDots(rScore, rColor)}
                  {reliabilityDir && <span className={`ml-0.5 text-[10px] transition-opacity duration-300 ${reliabilityDir === "up" ? "text-mm-accent-earn" : "text-mm-accent-alert"}`}>{reliabilityDir === "up" ? "▲" : "▼"}</span>}
                </div>
                <div className="relative flex items-center gap-0.5">
                  <span className="font-medium mr-1" style={{ color: 'var(--mm-ink-secondary)' }}>T</span>
                  {renderDots(tScore, tColor)}
                  {trustDir && <span className={`ml-0.5 text-[10px] transition-opacity duration-300 ${trustDir === "up" ? "text-mm-accent-earn" : "text-mm-accent-alert"}`}>{trustDir === "up" ? "▲" : "▼"}</span>}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">{(trust.signals ?? []).join(" · ") || trust.level}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}

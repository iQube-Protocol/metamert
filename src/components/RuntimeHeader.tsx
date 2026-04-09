import { useShell } from "@/contexts/ShellContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bot, ChevronDown, Check, Box, Sun, Moon } from "lucide-react";
import ProviderIcon from "@/components/ProviderIcon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useMemo, useRef, useEffect } from "react";

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
  const { config, selectAigent, selectLLM, inferring, cartridgeState, knytOnboarding, iframeRef } = useShell();
  const [aigentOpen, setAigentOpen] = useState(false);
  const [llmOpen, setLlmOpen] = useState(false);
  const [trustFlash, setTrustFlash] = useState(false);
  const prevScoresRef = useRef<Record<string, number | undefined>>({});

  // Theme toggle state — default dark, check URL param
  const [theme, setTheme] = useState<"light" | "dark">(
    new URLSearchParams(window.location.search).get("theme") === "light" ? "light" : "dark"
  );

  const toggleTheme = useCallback(() => {
    setTheme(t => {
      const next = t === "light" ? "dark" : "light";
      // Propagate to runtime iframe via postMessage
      iframeRef.current?.contentWindow?.postMessage({ type: "SET_THEME", theme: next }, "*");
      return next;
    });
  }, [iframeRef]);

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
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          inferring ? "animate-pulse duration-700" : "transition-all duration-300"
        } ${i < filled ? activeColor : "bg-mm-ink-faint/40"}`}
        style={inferring ? { animationDelay: `${i * 150}ms` } : undefined}
      />
    ));

  const activeAigent = config.selectors.aigent.options.find(o => o.id === config.selectors.aigent.current);
  const activeLLM = config.selectors.llm.options.find(o => o.id === config.selectors.llm.current);

  // Cartridge/Codex info for header center
  const activeCart = cartridgeState.available.find(c => c.id === cartridgeState.activeCartridgeId);
  const activeCodex = activeCart?.codexes.find(c => c.id === cartridgeState.activeCodexId);
  // LOV-401: Show KNYT accent on cartridge icon during onboarding
  const cartridgeColor = knytOnboarding ? "#F59E0B" : activeCart?.accentHex;

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
                <Bot className="h-5 w-5 shrink-0" style={activeAigent?.color ? { color: activeAigent.color } : { color: 'var(--mm-ink-secondary)' }} />
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
                  <Bot className="h-4 w-4 shrink-0" style={o.color ? { color: o.color } : undefined} />
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
        </div>

        {/* Center: Active Cartridge icon — centered with nav below */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center cursor-default">
              <Box className="h-[18px] w-[18px]" style={cartridgeColor ? { color: cartridgeColor } : { color: 'var(--mm-ink-muted)' }} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">{activeCodex?.label ?? activeCart?.label ?? "No cartridge"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Right: trust dots */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex items-center gap-4 px-3 py-2 text-xs cursor-default transition-all duration-300 ${trustFlash ? "ring-1 ring-mm-accent-runtime/40 scale-105" : ""}`}
              style={{
                backgroundColor: 'var(--mm-canvas-variant)',
                borderRadius: 'var(--mm-radius-xs)',
                color: 'var(--mm-ink-muted)',
              }}
            >
              <div className="flex items-center gap-0.5">
                <span className="font-medium mr-1" style={{ color: 'var(--mm-ink-secondary)' }}>R</span>
                {renderDots(rScore, rColor)}
                {reliabilityDir && <span className={`ml-0.5 text-[10px] transition-opacity duration-300 ${reliabilityDir === "up" ? "text-mm-accent-earn" : "text-mm-accent-alert"}`}>{reliabilityDir === "up" ? "▲" : "▼"}</span>}
              </div>
              <div className="flex items-center gap-0.5">
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
      </header>
    </TooltipProvider>
  );
}

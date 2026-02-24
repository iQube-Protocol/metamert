import { useShell } from "@/contexts/ShellContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bot, ChevronDown, Check } from "lucide-react";
import ProviderIcon from "@/components/ProviderIcon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useMemo } from "react";

/** Map a 0-10 score to 0-5 filled dots using ceil(score/2) per spec */
function scoreToDots(score: number | undefined, fallback: number): number {
  if (score == null) return fallback;
  return Math.ceil(Math.min(10, Math.max(0, score)) / 2);
}

/** Trust dot color: <=3 red, <=6 yellow, >6 green */
function trustDotColor(score: number | undefined): string {
  const v = score ?? 5;
  if (v <= 3) return "bg-[hsl(var(--shell-fail))]";
  if (v <= 6) return "bg-[hsl(var(--shell-warn))]";
  return "bg-[hsl(var(--shell-ok))]";
}

/** Reliability dot color: <=3 red, <=6 yellow, >6 purple */
function reliabilityDotColor(score: number | undefined): string {
  const v = score ?? 5;
  if (v <= 3) return "bg-[hsl(var(--shell-fail))]";
  if (v <= 6) return "bg-[hsl(var(--shell-warn))]";
  return "bg-purple-500";
}

/**
 * Compact header: colored Bot icon (aigent) + LLM provider logo, both icon-only.
 * LLM dropdown groups models by provider with provider header rows.
 */
export default function RuntimeHeader() {
  const { config, selectAigent, selectLLM, inferring } = useShell();
  const [aigentOpen, setAigentOpen] = useState(false);
  const [llmOpen, setLlmOpen] = useState(false);

  // Group LLM options by provider (must be before early return)
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

  if (!config) return null;

  const trust = config.trust ?? { level: "unverified", signals: [], scores: {} };
  const trustScores = trust.scores ?? {};
  const rScore = scoreToDots(trustScores.reliability, 4);
  const tScore = scoreToDots(trustScores.trust, 3);
  const rColor = reliabilityDotColor(trustScores.reliability);
  const tColor = trustDotColor(trustScores.trust);

  const renderDots = (filled: number, activeColor: string) =>
    [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`inline-block h-2 w-2 rounded-full ${
          inferring
            ? "animate-pulse transition-all duration-700"
            : "transition-all duration-300"
        } ${i < filled ? activeColor : "bg-muted-foreground/20"}`}
        style={inferring ? { animationDelay: `${i * 150}ms` } : undefined}
      />
    ));

  const activeAigent = config.selectors.aigent.options.find(o => o.id === config.selectors.aigent.current);
  const activeLLM = config.selectors.llm.options.find(o => o.id === config.selectors.llm.current);


  return (
    <TooltipProvider delayDuration={300}>
      <header className="flex items-center justify-between border-b border-border bg-card px-3 py-1.5">
        {/* Left: selectors */}
        <div className="flex items-center gap-2">
          {/* Aigent selector */}
          <Popover open={aigentOpen} onOpenChange={setAigentOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-0.5 rounded-md px-1.5 h-8 hover:bg-accent/50 transition-colors">
                <Bot className="h-5 w-5 shrink-0" style={activeAigent?.color ? { color: activeAigent.color } : undefined} />
                <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1 z-50 bg-popover" align="start">
              {config.selectors.aigent.options.map((o) => (
                <button
                  key={o.id}
                  onClick={() => { selectAigent(o.id); setAigentOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                >
                  <Bot className="h-4 w-4 shrink-0" style={o.color ? { color: o.color } : undefined} />
                  <span className="flex-1 text-left">{o.label}</span>
                  {o.id === config.selectors.aigent.current && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* LLM selector */}
          <Popover open={llmOpen} onOpenChange={setLlmOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-0.5 rounded-md px-1.5 h-8 hover:bg-accent/50 transition-colors">
                <ProviderIcon
                  provider={activeLLM?.provider}
                  className="h-5 w-5 shrink-0"
                  style={activeLLM?.provider_color ? { color: activeLLM.provider_color } : undefined}
                />
                <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-1 z-50 bg-popover" align="start">
              {llmGroups.map((group, gi) => (
                <div key={group.provider}>
                  {gi > 0 && <div className="my-1 border-t border-border" />}
                  <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <ProviderIcon provider={group.provider} className="h-3.5 w-3.5" style={{ color: group.color }} />
                    {group.provider}
                  </div>
                  {group.options.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => { selectLLM(o.id); setLlmOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 pl-7 text-sm hover:bg-accent transition-colors"
                    >
                      <span className="flex-1 text-left">{o.label}</span>
                      {o.id === config.selectors.llm.current && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* Right: trust dots */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-3 text-xs text-muted-foreground cursor-default">
              <div className="flex items-center gap-1">
                <span className="font-medium">R</span>
                {renderDots(rScore, rColor)}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">T</span>
                {renderDots(tScore, tColor)}
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

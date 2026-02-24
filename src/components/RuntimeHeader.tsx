import { useShell } from "@/contexts/ShellContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { resolveIcon } from "@/lib/icon-utils";
import { Bot, ChevronDown } from "lucide-react";

/**
 * Compact top header — icon-only selectors + trust dots.
 * Aigent: colored Bot icon + chevron. LLM: colored provider icon + chevron.
 * No text labels shown in closed state.
 */
export default function RuntimeHeader() {
  const { config, selectAigent, selectLLM } = useShell();
  if (!config) return null;

  const trust = config.trust ?? { level: "unverified", signals: [], scores: {} };
  const trustScores = trust.scores ?? {};
  const rScore = trustScores?.reliability ?? 4;
  const tScore = trustScores?.trust ?? (trust.level === "verified" ? 5 : trust.level === "warning" ? 1 : 3);

  const dotColorMap: Record<string, string> = {
    verified: "bg-[hsl(var(--shell-ok))]",
    warning: "bg-[hsl(var(--shell-warn))]",
    unverified: "bg-[hsl(var(--shell-fail))]",
  };
  const dotColor = dotColorMap[trust.level] ?? "bg-muted-foreground/30";

  const renderDots = (score: number, activeColor: string) =>
    [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`inline-block h-2 w-2 rounded-full transition-colors duration-200 ${
          i < score ? activeColor : "bg-muted-foreground/20"
        }`}
      />
    ));

  const activeAigent = config.selectors.aigent.options.find(o => o.id === config.selectors.aigent.current);
  const activeLLM = config.selectors.llm.options.find(o => o.id === config.selectors.llm.current);

  return (
    <TooltipProvider delayDuration={300}>
      <header className="flex items-center justify-center border-b border-border bg-card px-3 py-1.5">
        {/* Center container for selectors + trust */}
        <div className="flex items-center gap-4">
          {/* Aigent selector — icon-only */}
          <Select value={config.selectors.aigent.current} onValueChange={selectAigent}>
            <SelectTrigger className="h-8 w-auto gap-0.5 border-border bg-card px-1.5 [&>span:last-child]:hidden">
              <Bot className="h-5 w-5 shrink-0" style={activeAigent?.color ? { color: activeAigent.color } : undefined} />
              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent>
              {config.selectors.aigent.options.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center gap-1.5">
                        <Bot className="h-3.5 w-3.5" style={o.color ? { color: o.color } : undefined} />
                        {o.label}
                      </span>
                    </TooltipTrigger>
                    {o.tooltip && (
                      <TooltipContent side="bottom">
                        <p className="text-xs">{o.tooltip}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* LLM selector — icon-only */}
          <Select value={config.selectors.llm.current} onValueChange={selectLLM}>
            <SelectTrigger className="h-8 w-auto gap-0.5 border-border bg-card px-1.5 [&>span:last-child]:hidden">
              {(() => {
                const ActiveIcon = activeLLM ? resolveIcon(activeLLM.icon, activeLLM.id) : null;
                return ActiveIcon ? <ActiveIcon className="h-5 w-5 shrink-0" style={activeLLM?.color ? { color: activeLLM.color } : undefined} /> : null;
              })()}
              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent>
              {config.selectors.llm.options.map((o) => {
                const Icon = resolveIcon(o.icon, o.id);
                return (
                  <SelectItem key={o.id} value={o.id}>
                    <span className="flex items-center gap-1.5">
                      {Icon && <Icon className="h-3.5 w-3.5" style={o.color ? { color: o.color } : undefined} />}
                      {o.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Trust dots */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3 text-xs text-muted-foreground cursor-default">
                <div className="flex items-center gap-1">
                  <span className="font-medium">R</span>
                  {renderDots(rScore, "bg-[hsl(var(--shell-warn))]")}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">T</span>
                  {renderDots(tScore, dotColor)}
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

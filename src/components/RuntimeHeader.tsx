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

/**
 * Compact top header — fully payload-driven.
 * Left: Aigent + LLM selectors (with icons/tooltips from payload)
 * Right: R + T dot indicators driven by trust.scores or trust.level
 */
export default function RuntimeHeader() {
  const { config, selectAigent, selectLLM } = useShell();
  if (!config) return null;

  const trustScores = config.trust.scores;
  const rScore = trustScores?.reliability ?? 4;
  const tScore = trustScores?.trust ?? (config.trust.level === "verified" ? 5 : config.trust.level === "warning" ? 1 : 3);

  const trustColors: Record<string, string> = {
    verified: "bg-emerald-400",
    unverified: "bg-yellow-400",
    warning: "bg-red-400",
  };
  const dotColor = trustColors[config.trust.level] ?? "bg-muted-foreground";

  const renderDots = (score: number, color: string) =>
    [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`inline-block h-2 w-2 rounded-full ${i < score ? color : "bg-muted-foreground/30"}`}
      />
    ));

  return (
    <TooltipProvider delayDuration={300}>
      <header className="flex items-center justify-between border-b border-border bg-card px-3 py-1.5">
        {/* Left: compact selectors */}
        <div className="flex items-center gap-1.5">
          <Select value={config.selectors.aigent.current} onValueChange={selectAigent}>
            <SelectTrigger className="h-8 w-auto gap-1 border-border bg-card px-2 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {config.selectors.aigent.options.map((o) => {
                const Icon = resolveIcon(o.icon, o.id);
                return (
                  <SelectItem key={o.id} value={o.id}>
                    <span className="flex items-center gap-1.5">
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {o.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={config.selectors.llm.current} onValueChange={selectLLM}>
            <SelectTrigger className="h-8 w-auto gap-1 border-border bg-card px-2 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {config.selectors.llm.options.map((o) => {
                const Icon = resolveIcon(o.icon, o.id);
                return (
                  <SelectItem key={o.id} value={o.id}>
                    <span className="flex items-center gap-1.5">
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {o.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Right: R + T trust/reputation dot indicators */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-3 text-xs text-muted-foreground cursor-default">
              <div className="flex items-center gap-1">
                <span className="font-medium">R</span>
                {renderDots(rScore, "bg-yellow-400")}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">T</span>
                {renderDots(tScore, dotColor)}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">{config.trust.signals.join(" · ") || config.trust.level}</p>
          </TooltipContent>
        </Tooltip>
      </header>
    </TooltipProvider>
  );
}

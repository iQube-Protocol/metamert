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
 * Compact top header — payload-driven.
 * Left: Aigent + LLM selectors   Right: R + T dot indicators
 * Trust dot colors use --shell-ok / --shell-warn / --shell-fail tokens.
 */
export default function RuntimeHeader() {
  const { config, selectAigent, selectLLM } = useShell();
  if (!config) return null;

  const trust = config.trust ?? { level: "unverified", signals: [], scores: {} };
  const trustScores = trust.scores ?? {};
  const rScore = trustScores?.reliability ?? 4;
  const tScore = trustScores?.trust ?? (trust.level === "verified" ? 5 : trust.level === "warning" ? 1 : 3);

  // Map trust level to shell token colors
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

  return (
    <TooltipProvider delayDuration={300}>
      <header className="flex items-center justify-between border-b border-border bg-card px-3 py-1.5">
        {/* Left: compact selectors */}
        <div className="flex items-center gap-1.5">
          <Select value={config.selectors.aigent.current} onValueChange={selectAigent}>
            <SelectTrigger className="h-8 w-auto gap-1 border-border bg-card px-2 text-xs">
              {(() => {
                const active = config.selectors.aigent.options.find(o => o.id === config.selectors.aigent.current);
                const ActiveIcon = active ? resolveIcon(active.icon, active.id) : null;
                return ActiveIcon ? <ActiveIcon className="h-3.5 w-3.5" style={active?.color ? { color: active.color } : undefined} /> : null;
              })()}
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {config.selectors.aigent.options.map((o) => {
                const Icon = resolveIcon(o.icon, o.id);
                return (
                  <SelectItem key={o.id} value={o.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1.5">
                          {Icon && <Icon className="h-3.5 w-3.5" style={o.color ? { color: o.color } : undefined} />}
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
                );
              })}
            </SelectContent>
          </Select>

          <Select value={config.selectors.llm.current} onValueChange={selectLLM}>
            <SelectTrigger className="h-8 w-auto gap-1 border-border bg-card px-2 text-xs">
              {(() => {
                const active = config.selectors.llm.options.find(o => o.id === config.selectors.llm.current);
                const ActiveIcon = active ? resolveIcon(active.icon, active.id) : null;
                return ActiveIcon ? <ActiveIcon className="h-3.5 w-3.5" style={active?.color ? { color: active.color } : undefined} /> : null;
              })()}
              <SelectValue />
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
        </div>

        {/* Right: R + T trust/reliability dot indicators */}
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
      </header>
    </TooltipProvider>
  );
}

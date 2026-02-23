import { useShell } from "@/contexts/ShellContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Compact top header matching the reference design:
 * Left: two icon-style selector dropdowns (Aigent + LLM)
 * Right: R (reputation) + T (trust) dot indicators
 */
export default function RuntimeHeader() {
  const { config, selectAigent, selectLLM } = useShell();
  if (!config) return null;

  const trustColors: Record<string, string> = {
    verified: "bg-emerald-400",
    unverified: "bg-yellow-400",
    warning: "bg-red-400",
  };

  const dotColor = trustColors[config.trust.level] ?? "bg-muted-foreground";

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-3 py-1.5">
      {/* Left: compact selectors */}
      <div className="flex items-center gap-1.5">
        <Select value={config.selectors.aigent.current} onValueChange={selectAigent}>
          <SelectTrigger className="h-8 w-auto gap-1 border-border bg-card px-2 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {config.selectors.aigent.options.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={config.selectors.llm.current} onValueChange={selectLLM}>
          <SelectTrigger className="h-8 w-auto gap-1 border-border bg-card px-2 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {config.selectors.llm.options.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Right: R + T trust/reputation dot indicators */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="font-medium">R</span>
          {[...Array(5)].map((_, i) => (
            <span key={`r-${i}`} className={`inline-block h-2 w-2 rounded-full ${i < 4 ? "bg-yellow-400" : "bg-muted-foreground/30"}`} />
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium">T</span>
          {[...Array(5)].map((_, i) => (
            <span key={`t-${i}`} className={`inline-block h-2 w-2 rounded-full ${i < 4 ? dotColor : "bg-muted-foreground/30"}`} />
          ))}
        </div>
      </div>
    </header>
  );
}

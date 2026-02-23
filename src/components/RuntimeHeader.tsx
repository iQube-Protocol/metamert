import { useShell } from "@/contexts/ShellContext";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";

const trustMeta = {
  verified: { icon: ShieldCheck, color: "bg-emerald-600/20 text-emerald-400 border-emerald-500/40", label: "Verified" },
  unverified: { icon: ShieldQuestion, color: "bg-yellow-600/20 text-yellow-400 border-yellow-500/40", label: "Unverified" },
  warning: { icon: ShieldAlert, color: "bg-red-600/20 text-red-400 border-red-500/40", label: "Warning" },
} as const;

export default function RuntimeHeader() {
  const { config, selectAigent, selectLLM } = useShell();
  if (!config) return null;

  const trust = trustMeta[config.trust.level];
  const TrustIcon = trust.icon;

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-2">
      {/* Trust badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={`gap-1.5 ${trust.color}`}>
          <TrustIcon className="h-3.5 w-3.5" />
          {trust.label}
        </Badge>
        {config.trust.signals.map((s) => (
          <span key={s} className="hidden text-xs text-muted-foreground sm:inline">{s}</span>
        ))}
      </div>

      {/* Selectors */}
      <div className="flex items-center gap-2">
        <Select value={config.selectors.aigent.current} onValueChange={selectAigent}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {config.selectors.aigent.options.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={config.selectors.llm.current} onValueChange={selectLLM}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {config.selectors.llm.options.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}

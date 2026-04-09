import { useBrowser } from "@/contexts/BrowserContext";
import { X, Minus, Maximize2, Minimize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BrowserSurfaceChrome() {
  const { mountPayload, badges, requestClose, requestMinimize, surfaceState } = useBrowser();

  if (!mountPayload) return null;

  const chrome = badges
    ? { ...mountPayload.chrome, trustMode: badges.trustMode, privacyMode: badges.privacyMode, executionMode: badges.executionMode, activeAgentLabel: badges.activeAgentLabel }
    : mountPayload.chrome;

  return (
    <div
      className="flex items-center justify-between px-3 py-2"
      style={{
        backgroundColor: 'var(--mm-surface-1)',
        borderBottom: 'var(--mm-border-hairline)',
      }}
    >
      {/* Left: domain + title */}
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="truncate text-xs font-medium" style={{ color: 'var(--mm-ink-primary)' }}>
          {chrome.title}
        </span>
        {chrome.domain && (
          <span className="truncate text-xs" style={{ color: 'var(--mm-ink-muted)' }}>
            {chrome.domain}
          </span>
        )}
      </div>

      {/* Center: badges */}
      <div className="hidden items-center gap-1.5 sm:flex">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ color: 'var(--mm-ink-secondary)', borderColor: 'var(--mm-line-soft)' }}>
          {chrome.activeAgentLabel}
        </Badge>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0" style={{ color: 'var(--mm-ink-secondary)', backgroundColor: 'var(--mm-canvas-variant)' }}>
          {chrome.trustMode}
        </Badge>
        {chrome.privacyMode !== "standard" && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0" style={{ color: 'var(--mm-ink-secondary)', backgroundColor: 'var(--mm-canvas-variant)' }}>
            {chrome.privacyMode}
          </Badge>
        )}
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1">
        {mountPayload.capabilities.canMinimize && (
          <button
            onClick={requestMinimize}
            className="rounded p-1 transition-colors"
            style={{ color: 'var(--mm-ink-muted)' }}
            aria-label="Minimize browser"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={requestClose}
          className="rounded p-1 transition-colors"
          style={{ color: 'var(--mm-ink-muted)' }}
          aria-label="Close browser"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

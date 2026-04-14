/**
 * MetaMeSettingsDrawer — left-entering settings drawer for the thin client shell.
 */
import { useEffect, useRef } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import MetaMeSettingsPanel from "./MetaMeSettingsPanel";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MetaMeSettingsDrawer({ open, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="absolute inset-0 z-[60] bg-black/50 animate-in fade-in"
          style={{ animationDuration: '200ms' }}
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <div
        className="absolute left-0 top-0 bottom-0 z-[70] flex flex-col overflow-hidden"
        style={{
          width: '320px',
          maxWidth: '85vw',
          backgroundColor: 'var(--mm-surface-1)',
          borderRight: '1px solid var(--mm-line-soft)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 300ms ease-in-out',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--mm-line-soft)' }}
        >
          <SlidersHorizontal className="h-4 w-4" style={{ color: 'var(--mm-accent-runtime)' }} />
          <span className="text-sm font-medium flex-1" style={{ color: 'var(--mm-ink-primary)' }}>
            metaMe Settings
          </span>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" style={{ color: 'var(--mm-ink-muted)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <MetaMeSettingsPanel />
        </div>
      </div>
    </>
  );
}

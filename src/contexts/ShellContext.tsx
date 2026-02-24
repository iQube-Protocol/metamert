import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  type ShellConfig,
  fetchShellConfig,
  updateSelector,
  menuAction,
  authenticate,
  getToken,
} from "@/lib/aa-client";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface ShellState {
  config: ShellConfig | null;
  loading: boolean;
  authenticated: boolean;
  hydrate: () => Promise<void>;
  selectAigent: (id: string) => Promise<void>;
  selectLLM: (id: string) => Promise<void>;
  handleMenuAction: (itemId: string) => Promise<void>;
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

const ShellCtx = createContext<ShellState | null>(null);

export function useShell(): ShellState {
  const ctx = useContext(ShellCtx);
  if (!ctx) throw new Error("useShell must be used inside ShellProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ShellConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null!);

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      // Phase 1: auto-auth with placeholder DID in dev
      if (!getToken()) {
        try {
          await authenticate("did:metame:dev-shell", async () => "dev-sig");
          setAuthenticated(true);
        } catch {
          console.warn("[Shell] Auth failed via proxy");
        }
      }

      // Fetch shell-config (proxy returns default if upstream is unavailable)
      const cfg = await fetchShellConfig();
      setConfig(cfg);
    } catch (err) {
      console.error("[Shell] Hydration failed:", err);
      toast.error("Shell hydration failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const selectAigent = useCallback(async (id: string) => {
    try {
      await updateSelector("aigent", id);
      setConfig((prev) =>
        prev
          ? { ...prev, selectors: { ...prev.selectors, aigent: { ...prev.selectors.aigent, current: id } } }
          : prev
      );
    } catch {
      toast.error("Failed to update Aigent selector");
    }
  }, []);

  const selectLLM = useCallback(async (id: string) => {
    try {
      await updateSelector("llm", id);
      setConfig((prev) =>
        prev
          ? { ...prev, selectors: { ...prev.selectors, llm: { ...prev.selectors.llm, current: id } } }
          : prev
      );
    } catch {
      toast.error("Failed to update LLM selector");
    }
  }, []);

  const handleMenuAction = useCallback(async (itemId: string) => {
    try {
      await menuAction(itemId);
      toast.success(`Action: ${itemId}`);
    } catch {
      toast.error(`Menu action failed: ${itemId}`);
    }
  }, []);

  return (
    <ShellCtx.Provider
      value={{ config, loading, authenticated, hydrate, selectAigent, selectLLM, handleMenuAction, iframeRef }}
    >
      {children}
    </ShellCtx.Provider>
  );
}

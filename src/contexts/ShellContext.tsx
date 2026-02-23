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
// Mock data used when the AA-API isn't available yet
// ---------------------------------------------------------------------------

const MOCK_CONFIG: ShellConfig = {
  trust: { level: "unverified", signals: ["Phase-1 dev mode"] },
  selectors: {
    aigent: {
      current: "aigent-z",
      options: [
        { id: "aigent-z", label: "Aigent Z" },
        { id: "aigent-q", label: "Aigent Q" },
      ],
    },
    llm: {
      current: "gpt-4o",
      options: [
        { id: "gpt-4o", label: "GPT-4o" },
        { id: "claude-sonnet", label: "Claude Sonnet" },
      ],
    },
  },
  menu: {
    items: [
      { id: "earn", label: "Earn", enabled: true },
      { id: "play", label: "Play", enabled: true },
      { id: "make", label: "Make", enabled: true },
    ],
    edge_items: [
      { id: "be", label: "Be", visible: true },
      { id: "share", label: "Share", visible: true },
    ],
    collapse_mobile: true,
  },
  iframe: {
    url: "https://dev-beta.aigentz.me/runtime",
    handoff_token: "dev-placeholder-token",
    origin: "https://dev-beta.aigentz.me",
  },
};

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
      // Phase 1: try real API, fall back to mock
      if (!getToken()) {
        // Auto-auth with placeholder DID in dev
        try {
          await authenticate("did:metame:dev-shell", async () => "dev-sig");
          setAuthenticated(true);
        } catch {
          console.warn("[Shell] Auth failed, using mock config");
        }
      }

      try {
        const cfg = await fetchShellConfig();
        setConfig(cfg);
      } catch {
        console.warn("[Shell] shell-config unavailable, using mock");
        setConfig(MOCK_CONFIG);
      }
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

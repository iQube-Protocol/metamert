import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AA_PRIMARY = "https://aa.dev-beta.aigentz.me/aa/v1";
const AA_FALLBACK = "https://aigentzbeta-production.up.railway.app/aa/v1";

// ---------------------------------------------------------------------------
// Default shell-config (enriched schema matching Windsurf brief)
// ---------------------------------------------------------------------------

const DEFAULT_SHELL_CONFIG = {
  trust: {
    level: "unverified",
    signals: ["Phase-1 dev mode"],
    scores: { trust: 3, reliability: 4 },
  },
  selectors: {
    aigent: {
      current: "aigent-z",
      options: [
        { id: "aigent-z", label: "Aigent Z", icon: "bot", tooltip: "Primary orchestration agent" },
        { id: "aigent-q", label: "Aigent Q", icon: "bot", tooltip: "Query agent" },
      ],
    },
    llm: {
      current: "gpt-4o",
      options: [
        { id: "gpt-4o", label: "GPT-4o", icon: "cpu", tooltip: "OpenAI GPT-4o" },
        { id: "claude-sonnet", label: "Claude Sonnet", icon: "message-square", tooltip: "Anthropic Claude" },
      ],
    },
  },
  menu: {
    mode: "expanded",
    items: [
      { id: "earn", label: "Earn", icon: "coins", enabled: true },
      { id: "play", label: "Play", icon: "gamepad-2", enabled: true },
      { id: "make", label: "Make", icon: "wrench", enabled: true },
    ],
    edge_items: [
      { id: "be", label: "Be", icon: "user", visible: true },
      { id: "share", label: "Share", icon: "share-2", visible: true },
    ],
    collapse_mobile: true,
    policy: {
      collapse_to_metame_button: false,
      center_group_ids: ["earn", "play", "make"],
      triad_cluster_gap: "0.25rem",
      quick_links: [
        { id: "ql-watch", label: "Watch", icon: "eye", action: "watch" },
        { id: "ql-listen", label: "Listen", icon: "headphones", action: "listen" },
        { id: "ql-read", label: "Read", icon: "book-open", action: "read" },
        { id: "ql-find", label: "Find", icon: "search", action: "find" },
        { id: "ql-refresh", label: "Refresh", icon: "refresh-cw", action: "refresh" },
        { id: "ql-reset", label: "Reset", icon: "rotate-ccw", action: "reset" },
      ],
      prompt_box: { placeholder: "What do you want to do today?", visible: true },
      state_behavior: {
        welcome: { show_prompt: false, show_quick_links: true },
        post_welcome: { show_prompt: true, collapse_quick_links: false },
      },
    },
  },
  iframe: {
    url: "https://dev-beta.aigentz.me/runtime",
    handoff_token: "dev-placeholder-token",
    origin: "https://dev-beta.aigentz.me",
    bootstrap: { context: {} },
  },
};

// ---------------------------------------------------------------------------
// Upstream fetch with primary/fallback
// ---------------------------------------------------------------------------

async function upstreamFetch(
  path: string,
  init: RequestInit,
): Promise<Response> {
  const url1 = `${AA_PRIMARY}${path}`;
  try {
    const res = await fetch(url1, init);
    if (res.ok) return res;
  } catch {
    // primary unreachable
  }
  const url2 = `${AA_FALLBACK}${path}`;
  return fetch(url2, init);
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, body: reqBody, token } = await req.json();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // ---- AUTH: challenge ----
    if (action === "challenge") {
      try {
        const res = await upstreamFetch("/auth/challenge", {
          method: "POST",
          headers,
          body: JSON.stringify(reqBody),
        });
        if (res.ok) {
          const data = await res.json();
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch { /* upstream unavailable */ }
      console.log("[aa-proxy] challenge upstream unavailable, returning dev nonce");
      return new Response(JSON.stringify({ nonce: "dev-nonce-placeholder" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- AUTH: verify ----
    if (action === "verify") {
      try {
        const res = await upstreamFetch("/auth/verify", {
          method: "POST",
          headers,
          body: JSON.stringify(reqBody),
        });
        if (res.ok) {
          const data = await res.json();
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch { /* upstream unavailable */ }
      console.log("[aa-proxy] verify upstream unavailable, returning dev token");
      return new Response(JSON.stringify({ aa_token: "dev-token-placeholder", tenant_id: "dev-tenant" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- SHELL CONFIG ----
    if (action === "shell-config") {
      try {
        const res = await upstreamFetch("/runtime/shell-config", {
          method: "GET",
          headers,
        });
        if (res.ok) {
          const data = await res.json();
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch {
        // upstream unavailable
      }
      console.log("[aa-proxy] shell-config upstream unavailable, returning default");
      return new Response(JSON.stringify(DEFAULT_SHELL_CONFIG), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- SELECTORS ----
    if (action === "selectors") {
      try {
        const res = await upstreamFetch("/runtime/selectors", {
          method: "POST",
          headers,
          body: JSON.stringify(reqBody),
        });
        if (res.ok) {
          const data = await res.json();
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch {
        // upstream unavailable
      }
      console.log("[aa-proxy] selectors upstream unavailable, returning fallback");
      return new Response(JSON.stringify({ ok: true, shell_config: DEFAULT_SHELL_CONFIG }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- MENU ACTION ----
    if (action === "menu-action") {
      try {
        const res = await upstreamFetch("/runtime/menu-action", {
          method: "POST",
          headers,
          body: JSON.stringify(reqBody),
        });
        if (res.ok) {
          const data = await res.json();
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch {
        // upstream unavailable
      }
      console.log("[aa-proxy] menu-action upstream unavailable, returning fallback");
      const itemId = reqBody?.item_id ?? "unknown";
      return new Response(JSON.stringify({
        menu_event: { action_id: itemId, intent: itemId, prompt: `Launching ${itemId}…` },
        shell_config: DEFAULT_SHELL_CONFIG,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[aa-proxy] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

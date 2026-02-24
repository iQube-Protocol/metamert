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
        { id: "aigent-z", label: "Aigent Z", icon: "bot", color: "#3b82f6", tooltip: "Primary orchestration agent" },
        { id: "aigent-q", label: "Aigent Q", icon: "bot", color: "#a855f7", tooltip: "Query agent" },
        { id: "aigent-m", label: "Aigent M", icon: "bot", color: "#22c55e", tooltip: "Media agent" },
      ],
    },
    llm: {
      current: "gpt-4o",
      options: [
        { id: "gpt-4o", label: "GPT-4o", icon: "sparkles", color: "#10b981", provider: "OpenAI", provider_icon: "openai", provider_color: "#10b981", tooltip: "OpenAI GPT-4o" },
        { id: "gpt-4.5", label: "GPT-4.5", icon: "sparkles", color: "#10b981", provider: "OpenAI", provider_icon: "openai", provider_color: "#10b981", tooltip: "OpenAI GPT-4.5 Preview" },
        { id: "o3-mini", label: "o3-mini", icon: "sparkles", color: "#10b981", provider: "OpenAI", provider_icon: "openai", provider_color: "#10b981", tooltip: "OpenAI o3-mini" },
        { id: "claude-sonnet", label: "Claude 3.5 Sonnet", icon: "message-square", color: "#d97706", provider: "Anthropic", provider_icon: "anthropic", provider_color: "#d97706", tooltip: "Anthropic Claude 3.5 Sonnet" },
        { id: "claude-opus", label: "Claude 3 Opus", icon: "message-square", color: "#d97706", provider: "Anthropic", provider_icon: "anthropic", provider_color: "#d97706", tooltip: "Anthropic Claude 3 Opus" },
        { id: "gemini-pro", label: "Gemini 2.0 Pro", icon: "zap", color: "#4285F4", provider: "Google", provider_icon: "google", provider_color: "#4285F4", tooltip: "Google Gemini 2.0 Pro" },
        { id: "gemini-flash", label: "Gemini 2.0 Flash", icon: "zap", color: "#4285F4", provider: "Google", provider_icon: "google", provider_color: "#4285F4", tooltip: "Google Gemini 2.0 Flash" },
      ],
    },
  },
  menu: {
    mode: "expanded",
    items: [
      { id: "be", label: "Be", icon: "users", enabled: true },
      { id: "earn", label: "Earn", icon: "coins", enabled: true },
      { id: "play", label: "Play", icon: "play-circle", enabled: true },
      { id: "make", label: "Make", icon: "pencil", enabled: true },
      { id: "share", label: "Share", icon: "share-2", enabled: true },
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
// Normalize upstream shell-config to match ShellConfig shape
// ---------------------------------------------------------------------------

// deno-lint-ignore no-explicit-any
function normalizeShellConfig(raw: any): any {
  // 1. Flatten current selectors from object to string ID
  if (raw.selectors?.aigent?.current?.id)
    raw.selectors.aigent.current = raw.selectors.aigent.current.id;
  if (raw.selectors?.llm?.current?.id)
    raw.selectors.llm.current = raw.selectors.llm.current.id;

  // 2. Rename provider_id -> provider in LLM options
  for (const opt of raw.selectors?.llm?.options ?? [])
    if (opt.provider_id && !opt.provider) { opt.provider = opt.provider_id; }

  // 3. Map session -> trust block
  if (raw.session && !raw.trust) {
    raw.trust = {
      level: raw.session.trust_level ?? "unverified",
      signals: (raw.session.trust_signals ?? []).map((s: any) =>
        typeof s === "string" ? s : s.label ?? String(s)
      ),
      scores: raw.session.scores ?? {},
    };
  }

  // 4. Ensure quick_links includes Refresh + Reset
  const ql = raw.menu?.policy?.quick_links ?? [];
  const hasRefresh = ql.some((q: any) => q.id === "ql-refresh" || q.action === "refresh");
  if (!hasRefresh) {
    ql.push({ id: "ql-refresh", label: "Refresh", icon: "refresh-cw", action: "refresh" });
    ql.push({ id: "ql-reset", label: "Reset", icon: "rotate-ccw", action: "reset" });
  }
  if (raw.menu?.policy) raw.menu.policy.quick_links = ql;

  // 5. Fix localhost iframe URL
  if (raw.iframe?.url?.startsWith("http://localhost"))
    raw.iframe.url = DEFAULT_SHELL_CONFIG.iframe.url;

  // 6. Ensure menu.edge_items exists
  if (!raw.menu?.edge_items) raw.menu = { ...raw.menu, edge_items: [] };

  return raw;
}

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
          const data = normalizeShellConfig(await res.json());
          console.log("[aa-proxy] shell-config normalized from upstream");
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

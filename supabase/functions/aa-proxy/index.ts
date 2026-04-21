// aa-proxy v2.1 – POST action-based routing with normalization
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AA_PRIMARY = "https://aa.dev-beta.aigentz.me/aa/v1";
const AA_FALLBACK = "https://aigentzbeta-production.up.railway.app/aa/v1";

// Formula-based scoring from WS spec (latest QT #ui-shell):
// trust  = clamp(base_score - processing_penalty, 1..10)
// reliability = clamp(base_score + reliability_bonus - processing_penalty, 1..10)
// processing_penalty = 0.3 when processing=true, else 0.0
// reliability_bonus = +0.8 for venice/chaingpt/thirdweb, else 0.0
const PROVIDER_BASE_SCORES: Record<string, number> = {
  openai: 5.0,
  anthropic: 5.0,
  chaingpt: 7.4,
  venice: 7.8,
  thirdweb: 7.3,
  google: 4.5,
  default: 4.5,
};
const RELIABILITY_BONUS_PROVIDERS = new Set(["venice", "chaingpt", "thirdweb"]);

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function computeScores(provider: string, processing = false): { trust: number; reliability: number } {
  const base = PROVIDER_BASE_SCORES[provider] ?? PROVIDER_BASE_SCORES["default"];
  const penalty = processing ? 0.3 : 0.0;
  const bonus = RELIABILITY_BONUS_PROVIDERS.has(provider) ? 0.8 : 0.0;
  return {
    trust: clamp(base - penalty, 1, 10),
    reliability: clamp(base + bonus - penalty, 1, 10),
  };
}

/** Resolve provider from LLM option id */
function resolveProvider(llmId?: string): string {
  if (!llmId) return "default";
  if (llmId.startsWith("gpt-") || llmId.startsWith("o3")) return "openai";
  if (llmId.startsWith("claude")) return "anthropic";
  if (llmId.startsWith("gemini")) return "google";
  if (llmId.startsWith("venice")) return "venice";
  if (llmId.startsWith("chaingpt")) return "chaingpt";
  if (llmId.startsWith("thirdweb")) return "thirdweb";
  return "default";
}

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
  cartridges: {
    active: "qriptopian",
    active_codex: "qriptopian-codex",
    available: [
      {
        id: "metame-runtime",
        label: "MetaMe Runtime",
        icon: "cpu",
        default_codex_id: "metame-core",
        codexes: [{ id: "metame-core", label: "Runtime Core" }],
        agents: ["metame-agent"],
      },
      {
        id: "qriptopian",
        label: "Qriptopian",
        icon: "book-open",
        default_codex_id: "qriptopian-codex",
        codexes: [
          { id: "qriptopian-codex", label: "Qriptopian" },
          { id: "knyt-codex", label: "KNYT" },
        ],
        agents: ["moneypenny", "know1"],
      },
      {
        id: "knyt",
        label: "KNYT",
        icon: "sword",
        default_codex_id: "knyt-codex",
        codexes: [{ id: "knyt-codex", label: "KNYT" }],
        agents: ["moneypenny", "know1", "nakamoto"],
      },
    ],
  },
  iframe: {
    url: "https://dev-beta.aigentz.me/metame/runtime?embed=1&shell=thin",
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
  if (raw.iframe?.url?.startsWith("http://localhost") || !raw.iframe?.url)
    raw.iframe = { ...(raw.iframe ?? {}), url: DEFAULT_SHELL_CONFIG.iframe.url };

  // 5b. Normalize iframe path: /runtime → /metame/runtime?embed=1
  if (raw.iframe?.url) {
    try {
      const u = new URL(raw.iframe.url);
      if (u.pathname === "/runtime" || u.pathname === "/") {
        u.pathname = "/metame/runtime";
      }
      if (!u.searchParams.has("embed")) u.searchParams.set("embed", "1");
      if (!u.searchParams.has("shell")) u.searchParams.set("shell", "thin");
      raw.iframe.url = u.toString();
    } catch { /* invalid URL, leave as-is */ }
  }

  // 6. Ensure menu.edge_items exists
  if (!raw.menu?.edge_items) raw.menu = { ...raw.menu, edge_items: [] };

  // 7. Map postMessageOrigin -> origin
  if (raw.iframe?.postMessageOrigin && !raw.iframe.origin)
    raw.iframe.origin = raw.iframe.postMessageOrigin;

  // 8. Fix localhost origin
  if (raw.iframe?.origin?.startsWith("http://localhost"))
    raw.iframe.origin = new URL(raw.iframe.url).origin;

  // 9. Fix localhost postMessageOrigin
  if (raw.iframe?.postMessageOrigin?.startsWith("http://localhost"))
    raw.iframe.postMessageOrigin = raw.iframe.origin
      || new URL(raw.iframe.url).origin;

  // 10. Hoist bootstrap.handoff_token
  if (raw.iframe?.bootstrap?.handoff_token && !raw.iframe.handoff_token)
    raw.iframe.handoff_token = raw.iframe.bootstrap.handoff_token;

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
          // Inject provider-specific scores based on current LLM
          const currentLlm = typeof data.selectors?.llm?.current === "string"
            ? data.selectors.llm.current
            : data.selectors?.llm?.current?.id;
          const prov = resolveProvider(currentLlm);
          const provScores = computeScores(prov);
          // Use upstream scores if they differ from static session scores, otherwise inject computed
          if (!data.trust?.scores || (data.trust.scores.trust === data.session?.scores?.trust)) {
            data.trust = { ...data.trust, scores: provScores };
          }
          console.log("[aa-proxy] shell-config normalized, scores for", prov, data.trust?.scores);
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
          // deno-lint-ignore no-explicit-any
          const data: any = await res.json();
          const providerId = reqBody?.provider_id ?? resolveProvider(reqBody?.id);
          const canonicalScores = computeScores(providerId);
          
          // Prefer upstream per-provider scores if present and different from session default
          const upstreamScores = data.shell_config?.trust?.scores;
          const sessionScores = data.session?.scores;
          const useUpstream = upstreamScores
            && (upstreamScores.trust !== sessionScores?.trust || upstreamScores.reliability !== sessionScores?.reliability);
          const finalScores = useUpstream ? upstreamScores : canonicalScores;
          
          if (!data.shell_config) data.shell_config = {};
          data.shell_config.trust = {
            level: data.session?.trust_level ?? data.trust?.level ?? "verified",
            signals: (data.session?.trust_signals ?? []).map((s: any) =>
              typeof s === "string" ? s : s.label ?? String(s)
            ),
            scores: finalScores,
          };
          if (data.shell_config) normalizeShellConfig(data.shell_config);
          console.log("[aa-proxy] selector scores for", providerId, finalScores);
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch {
        // upstream unavailable
      }
      console.log("[aa-proxy] selectors upstream unavailable, returning fallback");
      // Return provider-specific scores from canonical map
      const providerId = reqBody?.provider_id ?? resolveProvider(reqBody?.id);
      const scores = computeScores(providerId);
      const fallback = {
        ok: true,
        shell_config: {
          ...DEFAULT_SHELL_CONFIG,
          trust: {
            ...DEFAULT_SHELL_CONFIG.trust,
            level: "verified",
            signals: [`Trust ${scores.trust}/10`, `Reliability ${scores.reliability}/10`],
            scores,
          },
        },
      };
      return new Response(JSON.stringify(fallback), {
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
        iframe_event: { type: "MENU_ACTION", item_id: itemId, intent: itemId },
        shell_config: DEFAULT_SHELL_CONFIG,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- PROMPT ACTION ----
    if (action === "prompt-action") {
      try {
        const res = await upstreamFetch("/runtime/prompt-action", {
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
      console.log("[aa-proxy] prompt-action upstream unavailable, returning fallback");
      return new Response(JSON.stringify({
        iframe_event: { type: "PROMPT_SUBMIT", text: reqBody?.text ?? "" },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- ADMIN CHECK ----
    if (action === "admin-check") {
      const did = reqBody?.did;
      if (!did) {
        return new Response(JSON.stringify({ is_admin: false, reason: "no_did" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Try upstream persona/admin endpoint
      try {
        const res = await upstreamFetch("/identity/persona/admin-status", {
          method: "POST",
          headers,
          body: JSON.stringify({ did }),
        });
        if (res.ok) {
          const data = await res.json();
          return new Response(JSON.stringify({
            is_admin: data.is_admin === true || data.role === "admin" || data.role === "owner",
            role: data.role ?? null,
            did,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch { /* upstream unavailable */ }

      // Fallback: check against known admin DIDs from env or hardcoded list
      const envDids = (Deno.env.get("ADMIN_DIDS") ?? "").split(",").map(d => d.trim()).filter(Boolean);
      const ADMIN_DIDS = [...new Set([...envDids, "did:metame:dev-shell"])];
      const isKnownAdmin = ADMIN_DIDS.includes(did);

      console.log("[aa-proxy] admin-check fallback for", did, "known:", isKnownAdmin);
      return new Response(JSON.stringify({
        is_admin: isKnownAdmin,
        role: isKnownAdmin ? "admin" : null,
        did,
        source: "fallback",
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

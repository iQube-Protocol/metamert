import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * AA-Proxy Edge Function
 * 
 * Proxies all AA-API calls from the browser through this server-side function,
 * ensuring tokens and API details stay off the client. Provides a fallback
 * shell-config when the upstream endpoint isn't ready yet.
 *
 * Request body: { action, path?, body?, token? }
 *   - action: "challenge" | "verify" | "shell-config" | "selectors" | "menu-action"
 *   - path: optional override (unused for most actions)
 *   - body: JSON body to forward upstream
 *   - token: AA bearer token for authenticated calls
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AA_PRIMARY = "https://aa.dev-beta.aigentz.me/aa/v1";
const AA_FALLBACK = "https://aigentzbeta-production.up.railway.app/aa/v1";

// ---------------------------------------------------------------------------
// Default shell-config returned when the upstream endpoint doesn't exist yet
// ---------------------------------------------------------------------------

const DEFAULT_SHELL_CONFIG = {
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
    // If primary returns non-ok, try fallback
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
      const res = await upstreamFetch("/auth/challenge", {
        method: "POST",
        headers,
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- AUTH: verify ----
    if (action === "verify") {
      const res = await upstreamFetch("/auth/verify", {
        method: "POST",
        headers,
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
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

      // Fallback: return default config
      console.log("[aa-proxy] shell-config upstream unavailable, returning default");
      return new Response(JSON.stringify(DEFAULT_SHELL_CONFIG), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- SELECTORS ----
    if (action === "selectors") {
      const res = await upstreamFetch("/runtime/selectors", {
        method: "POST",
        headers,
        body: JSON.stringify(reqBody),
      });
      const data = await res.text();
      return new Response(data, {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- MENU ACTION ----
    if (action === "menu-action") {
      const res = await upstreamFetch("/runtime/menu-action", {
        method: "POST",
        headers,
        body: JSON.stringify(reqBody),
      });
      const data = await res.text();
      return new Response(data, {
        status: res.status,
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

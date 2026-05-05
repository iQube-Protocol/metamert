/**
 * Runtime environment resolver.
 *
 * Maps the shell to dev / staging / production tiers of the metaMe platform.
 * One source of truth for iframe host + AA-API base.
 *
 * Precedence:
 *   1. ?env=dev|staging|production query param (persisted to localStorage)
 *   2. localStorage["mm_runtime_env"]
 *   3. import.meta.env.VITE_RUNTIME_ENV
 *   4. Hostname heuristic
 *   5. Default "dev"
 */

export type RuntimeEnv = "dev" | "staging" | "production";

export interface RuntimeEnvConfig {
  env: RuntimeEnv;
  iframeHost: string;
  iframeUrl: string;
  iframeOrigin: string;
  aaPrimary: string;
  aaFallback: string;
}

const RAILWAY = "https://aigentzbeta-production.up.railway.app/aa/v1";

export const ENV_CONFIG: Record<RuntimeEnv, Omit<RuntimeEnvConfig, "env">> = {
  dev: {
    iframeHost: "dev-beta.aigentz.me",
    iframeUrl: "https://dev-beta.aigentz.me/metame/runtime?embed=1&shell=thin",
    iframeOrigin: "https://dev-beta.aigentz.me",
    aaPrimary: "https://aa.dev-beta.aigentz.me/aa/v1",
    aaFallback: RAILWAY,
  },
  staging: {
    iframeHost: "staging-beta.aigentz.me",
    iframeUrl: "https://staging-beta.aigentz.me/metame/runtime?embed=1&shell=thin",
    iframeOrigin: "https://staging-beta.aigentz.me",
    aaPrimary: RAILWAY,
    aaFallback: RAILWAY,
  },
  production: {
    iframeHost: "beta.aigentz.me",
    iframeUrl: "https://beta.aigentz.me/metame/runtime?embed=1&shell=thin",
    iframeOrigin: "https://beta.aigentz.me",
    aaPrimary: RAILWAY,
    aaFallback: RAILWAY,
  },
};

const STORAGE_KEY = "mm_runtime_env";
const VALID: RuntimeEnv[] = ["dev", "staging", "production"];

function isValid(v: unknown): v is RuntimeEnv {
  return typeof v === "string" && (VALID as string[]).includes(v);
}

function fromHostname(): RuntimeEnv | null {
  if (typeof window === "undefined") return null;
  const h = window.location.hostname;
  if (h === "metame.live" || h === "www.metame.live") return "production";
  if (h === "runtime.metame.com") return "staging";
  if (h === "metame.dev" || h === "www.metame.dev") return "dev";
  if (h.endsWith(".lovable.app") || h.endsWith(".lovableproject.com") || h === "localhost") return "dev";
  return null;
}

let cached: RuntimeEnv | null = null;

export function resolveEnv(): RuntimeEnv {
  if (cached) return cached;

  // 1. URL ?env=
  if (typeof window !== "undefined") {
    try {
      const q = new URLSearchParams(window.location.search).get("env");
      if (isValid(q)) {
        try { localStorage.setItem(STORAGE_KEY, q); } catch { /* ignore */ }
        cached = q;
        return q;
      }
    } catch { /* ignore */ }

    // 2. localStorage
    try {
      const ls = localStorage.getItem(STORAGE_KEY);
      if (isValid(ls)) { cached = ls; return ls; }
    } catch { /* ignore */ }
  }

  // 3. build-time
  const buildEnv = import.meta.env.VITE_RUNTIME_ENV;
  if (isValid(buildEnv)) { cached = buildEnv; return buildEnv; }

  // 4. hostname heuristic
  const h = fromHostname();
  if (h) { cached = h; return h; }

  // 5. default
  cached = "dev";
  return cached;
}

export function getRuntimeEnvConfig(): RuntimeEnvConfig {
  const env = resolveEnv();
  return { env, ...ENV_CONFIG[env] };
}

/** Override the env at runtime (persists). Pass null to clear. */
export function setRuntimeEnvOverride(env: RuntimeEnv | null): void {
  if (typeof window === "undefined") return;
  try {
    if (env) localStorage.setItem(STORAGE_KEY, env);
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
  cached = null;
}

export function getEnvBadgeLabel(env: RuntimeEnv): string | null {
  if (env === "production") return null;
  if (env === "staging") return "STG";
  return "DEV";
}

/**
 * AA-API Client for metaMe Runtime Shell
 * Handles authentication and API communication with the AigentiQ AA-API.
 * All calls go through this module — never call AA-API directly from components.
 */

const PRIMARY_BASE = "https://aa.dev-beta.aigentz.me/aa/v1";
const FALLBACK_BASE = "https://aigentzbeta-production.up.railway.app/aa/v1";

let cachedToken: string | null = null;
let cachedDid: string | null = null;
let cachedTenantId: string | null = null;
let activePrimary = true; // true = use PRIMARY_BASE

// ---------------------------------------------------------------------------
// URL builder
// ---------------------------------------------------------------------------

function baseUrl(): string {
  return activePrimary ? PRIMARY_BASE : FALLBACK_BASE;
}

function buildUrl(path: string): string {
  const base = baseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

// ---------------------------------------------------------------------------
// Generic fetch wrapper with Bearer auth + fallback
// ---------------------------------------------------------------------------

export async function aaFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (cachedToken) {
    headers["Authorization"] = `Bearer ${cachedToken}`;
  }

  const url = buildUrl(path);
  try {
    const res = await fetch(url, { ...init, headers });
    if (!res.ok && activePrimary) {
      // try fallback once
      activePrimary = false;
      return aaFetch(path, init);
    }
    return res;
  } catch (err) {
    if (activePrimary) {
      activePrimary = false;
      return aaFetch(path, init);
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Authentication (DID challenge-verify)
// ---------------------------------------------------------------------------

export async function authenticate(
  did: string,
  signNonce: (nonce: string) => Promise<string> | string
): Promise<{ aa_token: string; tenant_id: string }> {
  // Step 1: challenge
  const challengeRes = await aaFetch("/auth/challenge", {
    method: "POST",
    body: JSON.stringify({ did }),
  });
  const { nonce } = await challengeRes.json();

  // Step 2: sign
  const signature = await signNonce(nonce);

  // Step 3: verify
  const verifyRes = await aaFetch("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ did, signature }),
  });
  const data = await verifyRes.json();

  cachedToken = data.aa_token;
  cachedDid = did;
  cachedTenantId = data.tenant_id;

  return data;
}

// ---------------------------------------------------------------------------
// Shell-config hydration
// ---------------------------------------------------------------------------

export interface ShellConfig {
  trust: {
    level: "verified" | "unverified" | "warning";
    signals: string[];
  };
  selectors: {
    aigent: { current: string; options: { id: string; label: string }[] };
    llm: { current: string; options: { id: string; label: string }[] };
  };
  menu: {
    items: { id: string; label: string; icon?: string; enabled: boolean }[];
    edge_items: { id: string; label: string; icon?: string; visible: boolean }[];
    collapse_mobile: boolean;
  };
  iframe: {
    url: string;
    handoff_token?: string;
    origin?: string;
  };
}

export async function fetchShellConfig(): Promise<ShellConfig> {
  const res = await aaFetch("/runtime/shell-config");
  return res.json();
}

// ---------------------------------------------------------------------------
// Selector updates
// ---------------------------------------------------------------------------

export async function updateSelector(
  type: "aigent" | "llm",
  id: string
): Promise<void> {
  await aaFetch("/runtime/selectors", {
    method: "POST",
    body: JSON.stringify({ type, id }),
  });
}

// ---------------------------------------------------------------------------
// Menu actions
// ---------------------------------------------------------------------------

export async function menuAction(itemId: string): Promise<void> {
  await aaFetch("/runtime/menu-action", {
    method: "POST",
    body: JSON.stringify({ item_id: itemId }),
  });
}

// ---------------------------------------------------------------------------
// Accessors
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  return cachedToken;
}

export function getDid(): string | null {
  return cachedDid;
}

export function getTenantId(): string | null {
  return cachedTenantId;
}

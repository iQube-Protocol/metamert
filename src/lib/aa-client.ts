/**
 * AA-API Client for metaMe Runtime Shell
 *
 * All calls are routed through the `aa-proxy` Supabase edge function.
 * The browser NEVER calls the AA-API directly — the proxy handles
 * primary/fallback base selection and provides shell-config defaults
 * when the upstream endpoint isn't available yet.
 */

import { supabase } from "@/integrations/supabase/client";

let cachedToken: string | null = null;
let cachedDid: string | null = null;
let cachedTenantId: string | null = null;

// ---------------------------------------------------------------------------
// Proxy helper
// ---------------------------------------------------------------------------

async function aaProxy<T = unknown>(
  action: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke("aa-proxy", {
    body: {
      action,
      body,
      token: cachedToken,
    },
  });

  if (error) throw error;
  return data as T;
}

// ---------------------------------------------------------------------------
// Authentication (DID challenge-verify)
// ---------------------------------------------------------------------------

export async function authenticate(
  did: string,
  signNonce: (nonce: string) => Promise<string> | string,
): Promise<{ aa_token: string; tenant_id: string }> {
  // Step 1: challenge
  const { nonce } = await aaProxy<{ nonce: string }>("challenge", { did });

  // Step 2: sign
  const signature = await signNonce(nonce);

  // Step 3: verify
  const data = await aaProxy<{ aa_token: string; tenant_id: string }>("verify", {
    did,
    signature,
  });

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
  return aaProxy<ShellConfig>("shell-config");
}

// ---------------------------------------------------------------------------
// Selector updates
// ---------------------------------------------------------------------------

export async function updateSelector(
  type: "aigent" | "llm",
  id: string,
): Promise<void> {
  await aaProxy("selectors", { type, id });
}

// ---------------------------------------------------------------------------
// Menu actions
// ---------------------------------------------------------------------------

export async function menuAction(itemId: string): Promise<void> {
  await aaProxy("menu-action", { item_id: itemId });
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

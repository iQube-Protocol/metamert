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
// Types
// ---------------------------------------------------------------------------

export interface SelectorOption {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  color?: string;
  /** For LLM options: provider grouping */
  provider?: string;
  provider_icon?: string;
  provider_color?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  enabled: boolean;
  color?: string;
}

export interface EdgeItem {
  id: string;
  label: string;
  icon?: string;
  visible: boolean;
}

export interface QuickLink {
  id: string;
  label: string;
  icon?: string;
  action?: string;
}

export interface MenuPolicy {
  collapse_to_metame_button?: boolean;
  center_group_ids?: string[];
  triad_cluster_gap?: string;
  edge_items_when_needed?: boolean;
  quick_links?: QuickLink[];
  floating_quick_links?: { id: string; label: string; action: string }[];
  prompt_box?: { placeholder: string; visible: boolean };
  state_behavior?: {
    welcome?: { show_prompt: boolean; show_quick_links: boolean };
    post_welcome?: { show_prompt: boolean; collapse_quick_links: boolean };
  };
}

export interface ShellConfig {
  trust: {
    level: "verified" | "unverified" | "warning";
    signals: string[];
    scores?: { trust?: number; reliability?: number };
  };
  selectors: {
    aigent: { current: string; options: SelectorOption[] };
    llm: { current: string; options: SelectorOption[] };
  };
  menu: {
    mode?: "expanded" | "collapsed";
    items: MenuItem[];
    edge_items: EdgeItem[];
    collapse_mobile: boolean;
    policy?: MenuPolicy;
  };
  iframe: {
    url: string;
    handoff_token?: string;
    origin?: string;
    bootstrap?: { context?: Record<string, unknown> };
  };
}

export interface MenuActionResult {
  menu_event?: {
    action_id: string;
    prompt?: string;
    intent?: string;
    surface_plan_instruction?: string;
    copilot_instruction?: string;
  };
  iframe_event?: Record<string, unknown>;
  shell_config?: ShellConfig;
}

export interface SelectorResult {
  shell_config?: ShellConfig;
}

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
  const { nonce } = await aaProxy<{ nonce: string }>("challenge", { did });
  const signature = await signNonce(nonce);
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

export async function fetchShellConfig(): Promise<ShellConfig> {
  const raw = await aaProxy<ShellConfig>("shell-config");
  // Belt-and-suspenders: flatten current if object leaked through
  const s = raw?.selectors;
  if (s?.aigent?.current && typeof s.aigent.current === "object")
    s.aigent.current = (s.aigent.current as any).id ?? "aigent-z";
  if (s?.llm?.current && typeof s.llm.current === "object")
    s.llm.current = (s.llm.current as any).id ?? "gpt-4o";
  return raw;
}

// ---------------------------------------------------------------------------
// Selector updates
// ---------------------------------------------------------------------------

export async function updateSelector(
  type: "aigent" | "llm",
  id: string,
): Promise<SelectorResult> {
  return aaProxy<SelectorResult>("selectors", { type, id });
}

// ---------------------------------------------------------------------------
// Menu actions
// ---------------------------------------------------------------------------

export async function menuAction(
  itemId: string,
  context?: { cartridge_id?: string; codex_id?: string },
): Promise<MenuActionResult> {
  return aaProxy<MenuActionResult>("menu-action", { item_id: itemId, ...context });
}

// ---------------------------------------------------------------------------
// Prompt action
// ---------------------------------------------------------------------------

export interface PromptActionResult {
  iframe_event?: Record<string, unknown>;
  shell_config?: ShellConfig;
}

export async function promptAction(
  text: string,
  context?: { cartridge_id?: string; codex_id?: string },
): Promise<PromptActionResult> {
  return aaProxy<PromptActionResult>("prompt-action", { text, ...context });
}

// ---------------------------------------------------------------------------
// Admin check
// ---------------------------------------------------------------------------

export interface AdminCheckResult {
  is_admin: boolean;
  role?: string | null;
  did?: string;
  source?: string;
}

export async function checkAdminStatus(did?: string | null): Promise<AdminCheckResult> {
  const effectiveDid = did ?? cachedDid;
  if (!effectiveDid) return { is_admin: false };
  return aaProxy<AdminCheckResult>("admin-check", { did: effectiveDid });
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

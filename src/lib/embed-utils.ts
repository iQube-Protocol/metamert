/**
 * Embed / iframe utilities for metaMe Runtime Shell.
 * Handles URL probing, multi-base fallback, and cache-busting.
 */

const EMBED_BASES_RAW = "https://dev-beta.aigentz.me";
const LKG_KEY = "metame_embed_lkg_base";

// ---------------------------------------------------------------------------
// Ordered bases (last-known-good first)
// ---------------------------------------------------------------------------

export function getOrderedBases(): string[] {
  const bases = EMBED_BASES_RAW.split(",").map((b) => b.trim());
  const lkg = localStorage.getItem(LKG_KEY);
  if (lkg && bases.includes(lkg)) {
    return [lkg, ...bases.filter((b) => b !== lkg)];
  }
  return bases;
}

// ---------------------------------------------------------------------------
// Cache-bust helper
// ---------------------------------------------------------------------------

export function withCacheBust(url: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_t=${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Build embed URL from base + path
// ---------------------------------------------------------------------------

export function buildEmbedUrl(
  base: string,
  path: string = "/runtime"
): string {
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

// ---------------------------------------------------------------------------
// Probe an embed URL (simple HEAD check — no edge function needed w/o Cloud)
// ---------------------------------------------------------------------------

export async function probeEmbedUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(withCacheBust(url), {
      method: "HEAD",
      mode: "no-cors",
    });
    // no-cors returns opaque response (status 0), which still means network ok
    return res.type === "opaque" || res.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Find first reachable base and remember it
// ---------------------------------------------------------------------------

export async function findReachableBase(
  path: string = "/runtime"
): Promise<string | null> {
  const bases = getOrderedBases();
  for (const base of bases) {
    const ok = await probeEmbedUrl(buildEmbedUrl(base, path));
    if (ok) {
      localStorage.setItem(LKG_KEY, base);
      return base;
    }
  }
  return null;
}

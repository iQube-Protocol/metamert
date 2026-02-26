/**
 * Single source of truth for resolving the iframe origin used in postMessage.
 * Ensures EmbedFrame, RuntimeFrame, and ShellContext all agree.
 */
import type { ShellConfig } from "@/lib/aa-client";

export function resolveIframeOrigin(config: ShellConfig): string {
  const iframe = config.iframe as Record<string, unknown>;
  // Prefer explicit postMessageOrigin, then origin, then derive from URL
  const candidates = [
    iframe.postMessageOrigin as string | undefined,
    iframe.origin as string | undefined,
  ];
  for (const c of candidates) {
    if (c && typeof c === "string" && !c.startsWith("http://localhost")) return c;
  }
  try {
    return new URL(config.iframe.url).origin;
  } catch {
    return "*";
  }
}

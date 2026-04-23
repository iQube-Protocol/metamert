import { postToIframe } from "@/lib/shell-messages";

function createShellMessageMeta() {
  return {
    msg_id: crypto.randomUUID?.() ?? `shell-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "shell" as const,
  };
}

/**
 * Dispatch identity drawer-open messages in a compatibility-safe way.
 *
 * Mirrors the persona drawer dispatch pattern (see persona-messages.ts):
 * the live runtime currently has conflicting handler contracts across builds,
 * so we triple-dispatch (canonical envelope, hybrid, flat) to ensure the
 * IdentityIQubeDrawer opens regardless of which build is mounted.
 *
 * Unlike persona, there is NO iqube_type — Identity is a single drawer.
 *
 * We intentionally do NOT send SELECTOR_CHANGE here; that can trigger a
 * runtime content refresh which would supersede the drawer-open request.
 */
export function postIdentityIQubeOpen(
  iframe: HTMLIFrameElement,
  origin: string,
) {
  // Canonical bridge envelope
  postToIframe(
    iframe,
    {
      type: "OPEN_IDENTITY_IQUBE",
      payload: {},
    },
    origin,
  );

  // Hybrid (envelope + meta) for builds expecting top-level shell metadata
  iframe.contentWindow?.postMessage(
    {
      type: "OPEN_IDENTITY_IQUBE",
      payload: {},
      ...createShellMessageMeta(),
    },
    origin,
  );

  // Bare flat fallback for older builds
  iframe.contentWindow?.postMessage(
    {
      type: "OPEN_IDENTITY_IQUBE",
    },
    origin,
  );
}

import { postToIframe } from "@/lib/shell-messages";

export type PersonaIQubeType = "knyt" | "qripto";

function createShellMessageMeta() {
  return {
    msg_id: crypto.randomUUID?.() ?? `shell-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "shell" as const,
  };
}

/**
 * Dispatch persona drawer-open messages in a compatibility-safe way.
 *
 * The live runtime currently has conflicting handler contracts across builds:
 * some expect the canonical bridge envelope, some expect a raw message with
 * payload, and some older builds read `iqube_type` directly at the top level.
 *
 * We intentionally do NOT send SELECTOR_CHANGE here because that can trigger a
 * runtime content refresh that supersedes the drawer-open request.
 */
export function postPersonaIQubeOpen(
  iframe: HTMLIFrameElement,
  origin: string,
  iqubeType: PersonaIQubeType,
) {
  postToIframe(
    iframe,
    {
      type: "OPEN_PERSONA_IQUBE",
      payload: { iqube_type: iqubeType },
    },
    origin,
  );

  iframe.contentWindow?.postMessage(
    {
      type: "OPEN_PERSONA_IQUBE",
      iqube_type: iqubeType,
      payload: { iqube_type: iqubeType },
      ...createShellMessageMeta(),
    },
    origin,
  );

  iframe.contentWindow?.postMessage(
    {
      type: "OPEN_PERSONA_IQUBE",
      iqube_type: iqubeType,
    },
    origin,
  );
}
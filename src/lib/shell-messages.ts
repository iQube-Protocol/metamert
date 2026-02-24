/**
 * postMessage protocol types for Shell ↔ iframe communication.
 */

// Shell → iframe
export type DeviceType = "desktop" | "tablet" | "mobile";

export interface DeviceContext {
  device: DeviceType;
  viewport: { width: number; height: number };
}

export type ShellOutbound =
  | { type: "SHELL_READY"; hide_chrome?: boolean }
  | { type: "HANDOFF"; handoff_token: string; context?: Record<string, unknown> }
  | { type: "MENU_ACTION"; item_id: string; menu_event?: MenuEvent }
  | { type: "SELECTOR_CHANGE"; selector_type: "aigent" | "llm"; id: string }
  | { type: "CONTEXT_UPDATE"; payload: Record<string, unknown> }
  | { type: "PROMPT_SUBMIT"; text: string }
  | { type: "RESET_WELCOME" }
  | { type: "DEVICE_CONTEXT_UPDATE"; context: DeviceContext };

export interface MenuEvent {
  action_id: string;
  prompt?: string;
  intent?: string;
  surface_plan_instruction?: string;
  copilot_instruction?: string;
}

// iframe → Shell
export type IframeInbound =
  | { type: "RUNTIME_READY" }
  | { type: "NAVIGATE"; path: string }
  | { type: "REQUEST_TRUST_REFRESH" }
  | { type: "TOAST"; message: string; variant?: "default" | "destructive" }
  | { type: "OPEN_CAPSULE"; capsule_id: string }
  | { type: "WELCOME_COMPLETE" }
  | { type: "STATE_SYNC"; state: Record<string, unknown> }
  | { type: "TRUST_UPDATE"; trust: { level: string; signals: string[]; scores?: Record<string, number> } };

/** Generate a unique message ID */
function genMsgId(): string {
  return `shell-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Wrap a ShellOutbound message in the bridge envelope expected by the runtime:
 * { type, msg_id, timestamp, source: "shell", payload }
 */
function toBridgeEnvelope(msg: ShellOutbound): Record<string, unknown> {
  const { type, ...payload } = msg as Record<string, unknown>;
  return {
    type,
    msg_id: genMsgId(),
    timestamp: Date.now(),
    source: "shell",
    payload,
  };
}

export function postToIframe(
  iframe: HTMLIFrameElement,
  msg: ShellOutbound,
  origin: string
): void {
  const envelope = toBridgeEnvelope(msg);
  console.log("[Shell→iframe]", envelope.type, envelope, "→", origin);
  iframe.contentWindow?.postMessage(envelope, origin);
}

/**
 * Wrap a raw API-returned iframe_event in the bridge envelope and post it.
 * Use this for forwarding `result.iframe_event` from menu-action / prompt-action.
 */
export function postRawToIframe(
  iframe: HTMLIFrameElement,
  rawEvent: Record<string, unknown>,
  origin: string
): void {
  const { type, ...payload } = rawEvent;
  const envelope = {
    type,
    msg_id: genMsgId(),
    timestamp: Date.now(),
    source: "shell",
    payload,
  };
  console.log("[Shell→iframe:raw]", envelope.type, envelope, "→", origin);
  iframe.contentWindow?.postMessage(envelope, origin);
}

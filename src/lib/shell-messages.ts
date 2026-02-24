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
  | { type: "SHELL_READY" }
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

export function postToIframe(
  iframe: HTMLIFrameElement,
  msg: ShellOutbound,
  origin: string
): void {
  iframe.contentWindow?.postMessage(msg, origin);
}

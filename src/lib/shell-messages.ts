/**
 * postMessage protocol types for Shell ↔ iframe communication.
 */

// Shell → iframe
export type ShellOutbound =
  | { type: "SHELL_READY" }
  | { type: "HANDOFF"; handoff_token: string; context?: Record<string, unknown> }
  | { type: "MENU_ACTION"; item_id: string; menu_event?: MenuEvent }
  | { type: "SELECTOR_CHANGE"; selector_type: "aigent" | "llm"; id: string }
  | { type: "CONTEXT_UPDATE"; payload: Record<string, unknown> };

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
  | { type: "OPEN_CAPSULE"; capsule_id: string };

export function postToIframe(
  iframe: HTMLIFrameElement,
  msg: ShellOutbound,
  origin: string
): void {
  iframe.contentWindow?.postMessage(msg, origin);
}

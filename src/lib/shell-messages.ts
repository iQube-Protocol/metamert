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
  | { type: "SET_THEME"; theme: "light" | "dark" }
  | { type: "HANDOFF"; handoff_token: string; aa_api_base_url?: string; aa_api_token?: string; context?: Record<string, unknown> }
  | { type: "MENU_ACTION"; action_id: string; prompt?: string; menu_event?: MenuEvent; cartridge_id?: string; codex_id?: string; mode?: string }
  | { type: "SELECTOR_CHANGE"; selector_type: "aigent" | "llm" | "cartridge" | "codex" | "persona"; id: string; iqube_id?: string }
  | { type: "CONTEXT_UPDATE"; payload: Record<string, unknown> }
  | { type: "PROMPT_SUBMIT"; text: string; cartridge_id?: string; codex_id?: string; mode?: string }
  | { type: "RESET_WELCOME" }
  | { type: "DEVICE_CONTEXT_UPDATE"; context: DeviceContext }
  | { type: "MODE_CHANGED"; mode: string | null; view_state: string; cartridge_id?: string; codex_id?: string }
  // Browser bridge events (shell → runtime)
  | { type: "browser.open.request"; payload?: { intent?: string } }
  | { type: "browser.close.request"; payload: { sessionId: string } }
  | { type: "browser.minimize.request"; payload: { sessionId: string } }
  | { type: "browser.expand.request"; payload: { sessionId: string } }
  | { type: "browser.focus.changed"; payload: { sessionId: string; focused: boolean } }
  | { type: "browser.takeover.request"; payload: { sessionId: string } }
  | { type: "browser.resume.request"; payload: { sessionId: string } }
  | { type: "browser.surface.bounds.changed"; payload: { sessionId: string; bounds: Record<string, number> } }
  | { type: "browser.drawer.refresh.request"; payload: { sessionId: string } }
  | { type: "browser.extract.request"; payload: { sessionId: string } }
  | { type: "browser.save.request"; payload: { sessionId: string } }
  // Cartridge overlay (shell → runtime: request close)
  | { type: "CARTRIDGE_OVERLAY_CLOSE" };

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
  | { type: "TRUST_UPDATE"; trust: { level: string; signals: string[]; scores?: Record<string, number> } }
  | { type: "SHELL_RESET" }
  | { type: "RUNTIME_HINT"; hint: string; value: unknown }
  // Browser bridge events (runtime → shell)
  | { type: "browser.mount"; payload: Record<string, unknown> }
  | { type: "browser.unmount"; payload: { sessionId: string } }
  | { type: "browser.surface.state"; payload: Record<string, unknown> }
  | { type: "browser.step.update"; payload: Record<string, unknown> }
  | { type: "browser.takeover.state"; payload: { sessionId: string; active: boolean } }
  | { type: "browser.badges.update"; payload: Record<string, unknown> }
  | { type: "browser.error"; payload: { sessionId?: string; message: string; code?: string } }
  | { type: "browser.drawer.data"; payload: Record<string, unknown> }
  | { type: "browser.action.status"; payload: Record<string, unknown> };

/**
 * Normalize an inbound iframe message that may arrive as either:
 *   - direct: { type, field1, field2, ... }
 *   - envelope: { type, payload: { field1, field2, ... } }
 * Returns a flat object with `type` at top level and all payload fields merged.
 */
export function normalizeInbound(raw: unknown): Record<string, unknown> | null {
  // Handle stringified JSON
  if (typeof raw === "string") {
    try { raw = JSON.parse(raw); } catch { return null; }
  }
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  // Support { payload: { type, ... } } envelope (type inside payload)
  let type = obj.type;
  if (typeof type !== "string" || !type) {
    if (obj.payload && typeof obj.payload === "object") {
      const inner = obj.payload as Record<string, unknown>;
      if (typeof inner.type === "string") {
        // Lift type from payload
        type = inner.type;
      }
    }
  }
  if (typeof type !== "string" || !type) return null;

  // If envelope-style with payload object, merge payload fields at top level
  const payload =
    obj.payload && typeof obj.payload === "object" && !Array.isArray(obj.payload)
      ? (obj.payload as Record<string, unknown>)
      : {};

  // Top-level fields (except meta) take precedence over payload fields
  const { msg_id: _1, timestamp: _2, source: _3, payload: _4, ...topFields } = obj;
  return { ...payload, ...topFields, type };
}

/**
 * Check if a normalized inbound message indicates inference is actively processing.
 */
export function isInferenceStart(msg: Record<string, unknown>): boolean {
  const t = msg.type as string;
  // Explicit start signals
  if (t === "INFERENCE_START" || t === "RENDER_START" || t === "PROCESSING_START") return true;
  // STATE_SYNC with processing/busy/inferring flags
  if (t === "STATE_SYNC") {
    const state = (msg.state ?? msg) as Record<string, unknown>;
    return (
      state.processing === true ||
      state.busy === true ||
      state.inferring === true ||
      state.isProcessing === true
    );
  }
  return false;
}

/**
 * Check if a normalized inbound message indicates inference is complete.
 */
export function isInferenceComplete(msg: Record<string, unknown>): boolean {
  const t = msg.type as string;
  // Explicit completion signals
  if (t === "INFERENCE_COMPLETE" || t === "RENDER_COMPLETE") return true;
  // STATE_SYNC with processing done
  if (t === "STATE_SYNC") {
    const state = (msg.state ?? msg) as Record<string, unknown>;
    // Only treat as complete if an explicit false flag is present
    if (
      state.processing === false ||
      state.busy === false ||
      state.inferring === false ||
      state.isProcessing === false
    ) {
      return true;
    }
  }
  return false;
}

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
    timestamp: new Date().toISOString(),
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
    timestamp: new Date().toISOString(),
    source: "shell",
    payload,
  };
  console.log("[Shell→iframe:raw]", envelope.type, envelope, "→", origin);
  iframe.contentWindow?.postMessage(envelope, origin);
}

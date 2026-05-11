/**
 * metame:* client protocol — canonical postMessage contract between the
 * embedded AigentZ runtime app and this thin-client shell.
 *
 * See docs (CC, 2026-05-12):
 *   - PersonaSpine: metame:persona-changed | metame:persona-revoked
 *     (legacy alias `aa-persona-change-v1` accepted for one release)
 *   - CartridgePresenceRegistry: metame:cartridge-opened | -tab-changed | -closed
 *
 * Contract rules honoured here:
 *   - Persona events are HINTS — never read identity fields off the payload.
 *     The shell must re-fetch /api/wallet/active-persona after any hint.
 *   - Cartridge events carry only surface identity (cartridgeId, displayLabel,
 *     tab, subTab). Never parse or store personaId / authProfileId / rootDid.
 *   - Outbound `metame:cartridge-closed` from shell → app must include
 *     `schemaVersion: 1`.
 */

export type MetameEventType =
  | "metame:persona-changed"
  | "metame:persona-revoked"
  | "metame:cartridge-opened"
  | "metame:cartridge-tab-changed"
  | "metame:cartridge-closed";

export interface MetamePersonaChanged {
  type: "metame:persona-changed";
  /**
   * Optional surface-only display fields. Per the strict contract these
   * are hints and the shell SHOULD re-fetch /api/wallet/active-persona.
   * They are preserved here so the shell can render a label immediately
   * (transitional fallback). NEVER include personaId / authProfileId /
   * rootDid / kybeAttestation here — those are forbidden.
   */
  displayLabel?: string;
  ownFioHandle?: string;
}
export interface MetamePersonaRevoked {
  type: "metame:persona-revoked";
}
export interface MetameCartridgeOpened {
  type: "metame:cartridge-opened";
  cartridgeId: string;
  displayLabel: string;
  schemaVersion: 1;
}
export interface MetameCartridgeTabChanged {
  type: "metame:cartridge-tab-changed";
  cartridgeId: string;
  tab?: string;
  subTab?: string;
  schemaVersion: 1;
}
export interface MetameCartridgeClosed {
  type: "metame:cartridge-closed";
  cartridgeId: string;
  schemaVersion: 1;
}

export type MetameEvent =
  | MetamePersonaChanged
  | MetamePersonaRevoked
  | MetameCartridgeOpened
  | MetameCartridgeTabChanged
  | MetameCartridgeClosed;

export interface OpenCartridgeState {
  cartridgeId: string;
  displayLabel: string;
  tab?: string;
  subTab?: string;
  openedAt: number;
}

const LEGACY_PERSONA_ALIAS = "aa-persona-change-v1";

/**
 * Parse a raw MessageEvent.data into a canonical MetameEvent.
 * Accepts both raw `{type,...}` and bridge-wrapped `{type, payload:{...}}`
 * shapes, plus stringified JSON. Returns null when the message isn't part
 * of the metame:* family.
 */
export function parseMetameEvent(raw: unknown): MetameEvent | null {
  let data: unknown = raw;
  if (typeof data === "string") {
    try { data = JSON.parse(data); } catch { return null; }
  }
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;

  // Accept envelope: lift type from payload, merge fields.
  let type = obj.type;
  let body: Record<string, unknown> = obj;
  if (obj.payload && typeof obj.payload === "object" && !Array.isArray(obj.payload)) {
    const payload = obj.payload as Record<string, unknown>;
    if (typeof type !== "string" && typeof payload.type === "string") {
      type = payload.type;
    }
    body = { ...payload, ...obj };
  }
  if (typeof type !== "string") return null;

  // Legacy alias normalised to canonical.
  if (type === LEGACY_PERSONA_ALIAS) {
    return { type: "metame:persona-changed" };
  }
  if (!type.startsWith("metame:")) return null;

  switch (type) {
    case "metame:persona-changed":
      return { type: "metame:persona-changed" };
    case "metame:persona-revoked":
      return { type: "metame:persona-revoked" };
    case "metame:cartridge-opened": {
      const cartridgeId = typeof body.cartridgeId === "string" ? body.cartridgeId : "";
      const displayLabel = typeof body.displayLabel === "string" ? body.displayLabel : "";
      if (!cartridgeId) return null;
      return {
        type: "metame:cartridge-opened",
        cartridgeId,
        displayLabel,
        schemaVersion: 1,
      };
    }
    case "metame:cartridge-tab-changed": {
      const cartridgeId = typeof body.cartridgeId === "string" ? body.cartridgeId : "";
      if (!cartridgeId) return null;
      return {
        type: "metame:cartridge-tab-changed",
        cartridgeId,
        tab: typeof body.tab === "string" ? body.tab : undefined,
        subTab: typeof body.subTab === "string" ? body.subTab : undefined,
        schemaVersion: 1,
      };
    }
    case "metame:cartridge-closed": {
      const cartridgeId = typeof body.cartridgeId === "string" ? body.cartridgeId : "";
      if (!cartridgeId) return null;
      return { type: "metame:cartridge-closed", cartridgeId, schemaVersion: 1 };
    }
    default:
      return null;
  }
}

/**
 * Apply a cartridge presence event to the open-cartridges list. Pure reducer.
 * - opened: dedupe by id, push to end (most-recent-last)
 * - tab-changed: merge tab/subTab onto existing entry (no-op if not open)
 * - closed: remove entry
 */
export function reduceCartridgeEvent(
  state: OpenCartridgeState[],
  event: MetameCartridgeOpened | MetameCartridgeTabChanged | MetameCartridgeClosed,
  now: number = Date.now(),
): OpenCartridgeState[] {
  switch (event.type) {
    case "metame:cartridge-opened": {
      const filtered = state.filter(c => c.cartridgeId !== event.cartridgeId);
      return [
        ...filtered,
        {
          cartridgeId: event.cartridgeId,
          displayLabel: event.displayLabel,
          openedAt: now,
        },
      ];
    }
    case "metame:cartridge-tab-changed": {
      const i = state.findIndex(c => c.cartridgeId === event.cartridgeId);
      if (i < 0) return state;
      const next = state.slice();
      next[i] = { ...next[i], tab: event.tab, subTab: event.subTab };
      return next;
    }
    case "metame:cartridge-closed":
      return state.filter(c => c.cartridgeId !== event.cartridgeId);
  }
}

/** Post the canonical close-intent envelope into the app iframe. */
export function postCartridgeClose(
  iframe: HTMLIFrameElement,
  cartridgeId: string,
  origin: string,
): void {
  const msg: MetameCartridgeClosed = {
    type: "metame:cartridge-closed",
    cartridgeId,
    schemaVersion: 1,
  };
  iframe.contentWindow?.postMessage(msg, origin);
}

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
 *   - Persona events carry Pattern A T1 surface inline. Read only surface
 *     display fields; never re-fetch shell-auth active persona.
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
   * Optional surface-only display fields. NEVER include personaId UUIDs /
   * authProfileId / rootDid / kybeAttestation here — those are forbidden
   * and stripped by parseMetameEvent.
   */
  displayLabel?: string;
  ownFioHandle?: string;
  /**
   * T1-safe persona slug (e.g. `knyt-persona`, `qripto-persona`,
   * `metame-persona`, or a user-defined slug). UUIDs are stripped.
   */
  personaId?: string;
  /**
   * True when the event's surface explicitly identifies the active persona
   * (via `surface.activePersona`, `payload.activePersona`, or top-level
   * `active: true` / `isActive: true`). When false/absent the shell must
   * NOT overwrite the current active label — the surface describes a
   * candidate persona, not a confirmed transition.
   */
  isActive?: boolean;
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

  // Accept envelope: lift canonical metame/legacy type from payload when the
  // outer bridge type is generic, then merge payload fields with precedence.
  let type = obj.type;
  let body: Record<string, unknown> = obj;
  if (obj.payload && typeof obj.payload === "object" && !Array.isArray(obj.payload)) {
    const payload = obj.payload as Record<string, unknown>;
    const payloadType = typeof payload.type === "string" ? payload.type : null;
    if (payloadType && (payloadType === LEGACY_PERSONA_ALIAS || payloadType.startsWith("metame:"))) {
      type = payload.type;
    } else if (typeof type !== "string" && payloadType) {
      type = payload.type;
    }
    body = { ...obj, ...payload };
  }
  if (typeof type !== "string") return null;

  // Surface-only persona fields (Pattern A T1 surface). Extracts displayLabel,
  // ownFioHandle, personaId (slug only, never UUIDs), and isActive flag.
  //
  // Priority: surface.activePersona.* > payload.activePersona.* > surface.* > body.*
  // The `isActive` flag is set when the event explicitly identifies the active
  // persona: presence of `activePersona` wrapper, or `active: true` / `isActive: true`.
  const personaSurface = (): Pick<MetamePersonaChanged, "displayLabel" | "ownFioHandle" | "personaId" | "isActive"> => {
    const nested = (body.surface && typeof body.surface === "object" && !Array.isArray(body.surface))
      ? (body.surface as Record<string, unknown>)
      : {};
    const surfaceActive = (nested.activePersona && typeof nested.activePersona === "object" && !Array.isArray(nested.activePersona))
      ? (nested.activePersona as Record<string, unknown>)
      : null;
    const bodyActive = (body.activePersona && typeof body.activePersona === "object" && !Array.isArray(body.activePersona))
      ? (body.activePersona as Record<string, unknown>)
      : null;

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const stringFrom = (source: Record<string, unknown>, keys: string[], stripUuid = false): string => {
      for (const key of keys) {
        const value = source[key];
        if (typeof value !== "string") continue;
        const trimmed = value.trim();
        if (!trimmed) continue;
        if (stripUuid && UUID_RE.test(trimmed)) continue;
        return trimmed;
      }
      return "";
    };
    const displayKeys = ["displayLabel", "display_label", "label"];
    const handleKeys = ["ownFioHandle", "own_fio_handle", "fioHandle", "fio_handle", "handle"];
    const idKeys = ["personaId", "persona_id", "personaSlug", "persona_slug"];

    // Ordered sources: most-trusted (explicitly active) first
    const sources: Array<Record<string, unknown>> = [];
    if (surfaceActive) sources.push(surfaceActive);
    if (bodyActive) sources.push(bodyActive);
    sources.push(nested);
    sources.push(body);

    let displayLabel = "", ownFioHandle = "", personaId = "";
    for (const src of sources) {
      if (!displayLabel) displayLabel = stringFrom(src, displayKeys);
      if (!ownFioHandle) ownFioHandle = stringFrom(src, handleKeys);
      if (!personaId) personaId = stringFrom(src, idKeys, true);
    }

    const explicitActiveMarker = body.active === true || body.isActive === true
      || nested.active === true || nested.isActive === true;
    const isActive = Boolean(surfaceActive || bodyActive || explicitActiveMarker);

    const out: Pick<MetamePersonaChanged, "displayLabel" | "ownFioHandle" | "personaId" | "isActive"> = {};
    if (displayLabel) out.displayLabel = displayLabel;
    if (ownFioHandle) out.ownFioHandle = ownFioHandle;
    if (personaId) out.personaId = personaId;
    if (isActive) out.isActive = true;
    return out;
  };

  // Legacy alias normalised to canonical.
  if (type === LEGACY_PERSONA_ALIAS) {
    return { type: "metame:persona-changed", ...personaSurface() };
  }
  if (!type.startsWith("metame:")) return null;

  switch (type) {
    case "metame:persona-changed":
      return { type: "metame:persona-changed", ...personaSurface() };
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

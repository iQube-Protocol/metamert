/**
 * Persona flow regression tests.
 *
 * Locks in the contract:
 *  - default active persona must exist in DEFAULT_PERSONAS (visible list)
 *  - hidden metaMe persona is not rendered
 *  - personaId → iqube_type mapping is exact
 *  - OPEN_PERSONA_IQUBE envelope keeps payload shape (no double-nesting)
 *
 * The platform runtime now exposes a single permanent handler for
 * OPEN_PERSONA_IQUBE — one postMessage per action, no triple-dispatch.
 */
import { describe, it, expect } from "vitest";
import {
  DEFAULT_PERSONAS,
  ALL_PERSONAS,
  DEFAULT_ACTIVE_PERSONA_ID,
  personaIdToIqubeType,
} from "@/lib/smart-menu-config";
import { postToIframe } from "@/lib/shell-messages";

describe("persona config", () => {
  it("default active persona id exists in visible list", () => {
    const ids = DEFAULT_PERSONAS.map(p => p.id);
    expect(ids).toContain(DEFAULT_ACTIVE_PERSONA_ID);
  });

  it("metaMe persona is hidden from visible list", () => {
    const visibleIds = DEFAULT_PERSONAS.map(p => p.id);
    expect(visibleIds).not.toContain("metame-persona");
    // But still exists in the full registry
    const allIds = ALL_PERSONAS.map(p => p.id);
    expect(allIds).toContain("metame-persona");
  });

  it("only Qripto and KNYT are visible", () => {
    const ids = DEFAULT_PERSONAS.map(p => p.id).sort();
    expect(ids).toEqual(["knyt-persona", "qripto-persona"]);
  });
});

describe("personaIdToIqubeType mapping", () => {
  it("maps qripto-persona → 'qripto'", () => {
    expect(personaIdToIqubeType("qripto-persona")).toBe("qripto");
  });
  it("maps knyt-persona → 'knyt'", () => {
    expect(personaIdToIqubeType("knyt-persona")).toBe("knyt");
  });
  it("returns null for unknown ids (no loose fallback)", () => {
    expect(personaIdToIqubeType("metame-persona")).toBeNull();
    expect(personaIdToIqubeType("bogus-id")).toBeNull();
  });
});

describe("OPEN_PERSONA_IQUBE envelope", () => {
  it("nests iqube_type under payload exactly once", () => {
    const posts: any[] = [];
    const iframe = {
      contentWindow: {
        postMessage: (msg: any) => posts.push(msg),
      },
    } as unknown as HTMLIFrameElement;

    postToIframe(
      iframe,
      { type: "OPEN_PERSONA_IQUBE", payload: { iqube_type: "knyt" } },
      "*",
    );

    expect(posts).toHaveLength(1);
    const env = posts[0];
    expect(env.type).toBe("OPEN_PERSONA_IQUBE");
    expect(env.source).toBe("shell");
    // payload must be { iqube_type: "knyt" } — NOT { payload: { iqube_type: "knyt" } }
    expect(env.payload).toEqual({ iqube_type: "knyt" });
    expect(env.payload.payload).toBeUndefined();
  });
});

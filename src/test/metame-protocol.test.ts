import { describe, it, expect } from "vitest";
import {
  parseMetameEvent,
  reduceCartridgeEvent,
  type OpenCartridgeState,
} from "@/lib/metame-protocol";

describe("parseMetameEvent", () => {
  it("parses raw persona-changed", () => {
    expect(parseMetameEvent({ type: "metame:persona-changed" })).toEqual({
      type: "metame:persona-changed",
    });
  });

  it("treats legacy aa-persona-change-v1 as persona-changed", () => {
    expect(parseMetameEvent({ type: "aa-persona-change-v1", personaId: "p_1" })).toEqual({
      type: "metame:persona-changed",
    });
  });

  it("preserves optional surface fields on persona-changed", () => {
    expect(
      parseMetameEvent({
        type: "metame:persona-changed",
        displayLabel: "alice@fio",
        ownFioHandle: "alice@fio",
      }),
    ).toEqual({
      type: "metame:persona-changed",
      displayLabel: "alice@fio",
      ownFioHandle: "alice@fio",
    });
  });

  it("drops forbidden identity fields from persona-changed", () => {
    const parsed = parseMetameEvent({
      type: "metame:persona-changed",
      personaId: "p_1",
      authProfileId: "ap_1",
      rootDid: "did:example:1",
      kybeAttestation: "x",
      displayLabel: "bob@fio",
    });
    expect(parsed).toEqual({
      type: "metame:persona-changed",
      displayLabel: "bob@fio",
    });
    expect(parsed).not.toHaveProperty("personaId");
    expect(parsed).not.toHaveProperty("authProfileId");
    expect(parsed).not.toHaveProperty("rootDid");
    expect(parsed).not.toHaveProperty("kybeAttestation");
  });

  it("reads persona surface fields from nested `surface` payload", () => {
    expect(
      parseMetameEvent({
        type: "metame:persona-changed",
        surface: { displayLabel: "arkagent@knyt", ownFioHandle: "arkagent@knyt" },
      }),
    ).toEqual({
      type: "metame:persona-changed",
      displayLabel: "arkagent@knyt",
      ownFioHandle: "arkagent@knyt",
    });
  });

  it("parses persona-revoked sign-out", () => {
    expect(parseMetameEvent({ type: "metame:persona-revoked" })).toEqual({
      type: "metame:persona-revoked",
    });
  });

  it("parses bridge-wrapped envelope", () => {
    const env = {
      type: "metame:cartridge-opened",
      payload: { cartridgeId: "knyt-codex", displayLabel: "KNYT" },
    };
    expect(parseMetameEvent(env)).toEqual({
      type: "metame:cartridge-opened",
      cartridgeId: "knyt-codex",
      displayLabel: "KNYT",
      schemaVersion: 1,
    });
  });

  it("parses stringified JSON", () => {
    const s = JSON.stringify({ type: "metame:persona-revoked" });
    expect(parseMetameEvent(s)).toEqual({ type: "metame:persona-revoked" });
  });

  it("rejects foreign types", () => {
    expect(parseMetameEvent({ type: "browser.mount" })).toBeNull();
    expect(parseMetameEvent({ type: "STATE_SYNC" })).toBeNull();
    expect(parseMetameEvent(null)).toBeNull();
    expect(parseMetameEvent("not json")).toBeNull();
  });

  it("rejects cartridge events without cartridgeId", () => {
    expect(parseMetameEvent({ type: "metame:cartridge-opened" })).toBeNull();
    expect(parseMetameEvent({ type: "metame:cartridge-closed" })).toBeNull();
  });

  it("parses tab-changed with optional subTab", () => {
    expect(parseMetameEvent({
      type: "metame:cartridge-tab-changed",
      cartridgeId: "knyt-codex",
      tab: "living-canon",
      subTab: "canon",
    })).toEqual({
      type: "metame:cartridge-tab-changed",
      cartridgeId: "knyt-codex",
      tab: "living-canon",
      subTab: "canon",
      schemaVersion: 1,
    });
  });
});

describe("reduceCartridgeEvent", () => {
  const empty: OpenCartridgeState[] = [];

  it("opens a cartridge and pushes to end", () => {
    const s1 = reduceCartridgeEvent(empty, {
      type: "metame:cartridge-opened",
      cartridgeId: "a",
      displayLabel: "A",
      schemaVersion: 1,
    }, 1);
    const s2 = reduceCartridgeEvent(s1, {
      type: "metame:cartridge-opened",
      cartridgeId: "b",
      displayLabel: "B",
      schemaVersion: 1,
    }, 2);
    expect(s2.map(c => c.cartridgeId)).toEqual(["a", "b"]);
  });

  it("dedupes on re-open and moves to end", () => {
    const initial: OpenCartridgeState[] = [
      { cartridgeId: "a", displayLabel: "A", openedAt: 1 },
      { cartridgeId: "b", displayLabel: "B", openedAt: 2 },
    ];
    const next = reduceCartridgeEvent(initial, {
      type: "metame:cartridge-opened",
      cartridgeId: "a",
      displayLabel: "A",
      schemaVersion: 1,
    }, 3);
    expect(next.map(c => c.cartridgeId)).toEqual(["b", "a"]);
    expect(next[1].openedAt).toBe(3);
  });

  it("merges tab on tab-changed", () => {
    const initial: OpenCartridgeState[] = [
      { cartridgeId: "a", displayLabel: "A", openedAt: 1 },
    ];
    const next = reduceCartridgeEvent(initial, {
      type: "metame:cartridge-tab-changed",
      cartridgeId: "a",
      tab: "store",
      schemaVersion: 1,
    });
    expect(next[0].tab).toBe("store");
  });

  it("ignores tab-changed for unknown cartridge", () => {
    const next = reduceCartridgeEvent(empty, {
      type: "metame:cartridge-tab-changed",
      cartridgeId: "x",
      tab: "t",
      schemaVersion: 1,
    });
    expect(next).toBe(empty);
  });

  it("removes on closed", () => {
    const initial: OpenCartridgeState[] = [
      { cartridgeId: "a", displayLabel: "A", openedAt: 1 },
      { cartridgeId: "b", displayLabel: "B", openedAt: 2 },
    ];
    const next = reduceCartridgeEvent(initial, {
      type: "metame:cartridge-closed",
      cartridgeId: "a",
      schemaVersion: 1,
    });
    expect(next.map(c => c.cartridgeId)).toEqual(["b"]);
  });
});

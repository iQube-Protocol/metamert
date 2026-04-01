/**
 * LOV-504: Shell state machine regression tests
 * Tests the core message normalization and inference lifecycle detection.
 */
import { describe, it, expect } from "vitest";
import { normalizeInbound, isInferenceStart, isInferenceComplete } from "@/lib/shell-messages";

describe("normalizeInbound", () => {
  it("returns null for non-objects", () => {
    expect(normalizeInbound(null)).toBeNull();
    expect(normalizeInbound(42)).toBeNull();
    expect(normalizeInbound("not json")).toBeNull();
  });

  it("normalizes direct messages", () => {
    const msg = { type: "RUNTIME_READY" };
    const result = normalizeInbound(msg);
    expect(result).toEqual({ type: "RUNTIME_READY" });
  });

  it("normalizes enveloped messages", () => {
    const msg = {
      type: "STATE_SYNC",
      msg_id: "abc",
      timestamp: "2026-01-01",
      source: "runtime",
      payload: { state: { processing: true } },
    };
    const result = normalizeInbound(msg);
    expect(result?.type).toBe("STATE_SYNC");
    expect(result?.state).toEqual({ processing: true });
  });

  it("lifts type from payload when top-level type missing", () => {
    const msg = { payload: { type: "TOAST", message: "hello" } };
    const result = normalizeInbound(msg);
    expect(result?.type).toBe("TOAST");
    expect(result?.message).toBe("hello");
  });

  it("handles stringified JSON", () => {
    const msg = JSON.stringify({ type: "WELCOME_COMPLETE" });
    const result = normalizeInbound(msg);
    expect(result?.type).toBe("WELCOME_COMPLETE");
  });
});

describe("isInferenceStart", () => {
  it("detects explicit start signals", () => {
    expect(isInferenceStart({ type: "INFERENCE_START" })).toBe(true);
    expect(isInferenceStart({ type: "RENDER_START" })).toBe(true);
    expect(isInferenceStart({ type: "PROCESSING_START" })).toBe(true);
  });

  it("detects STATE_SYNC with processing flags", () => {
    expect(isInferenceStart({ type: "STATE_SYNC", state: { processing: true } })).toBe(true);
    expect(isInferenceStart({ type: "STATE_SYNC", state: { busy: true } })).toBe(true);
    expect(isInferenceStart({ type: "STATE_SYNC", state: { inferring: true } })).toBe(true);
  });

  it("rejects non-start signals", () => {
    expect(isInferenceStart({ type: "STATE_SYNC", state: { processing: false } })).toBe(false);
    expect(isInferenceStart({ type: "TOAST" })).toBe(false);
  });
});

describe("isInferenceComplete", () => {
  it("detects explicit complete signals", () => {
    expect(isInferenceComplete({ type: "INFERENCE_COMPLETE" })).toBe(true);
    expect(isInferenceComplete({ type: "RENDER_COMPLETE" })).toBe(true);
  });

  it("detects STATE_SYNC with processing=false", () => {
    expect(isInferenceComplete({ type: "STATE_SYNC", state: { processing: false } })).toBe(true);
    expect(isInferenceComplete({ type: "STATE_SYNC", state: { busy: false } })).toBe(true);
  });

  it("rejects active processing", () => {
    expect(isInferenceComplete({ type: "STATE_SYNC", state: { processing: true } })).toBe(false);
  });
});

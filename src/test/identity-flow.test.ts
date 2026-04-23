/**
 * Identity flow regression tests.
 *
 * Locks in the contract:
 *  - OPEN_IDENTITY_IQUBE envelope has empty payload (no iqube_type)
 *  - triple-dispatch fires for cross-build compatibility
 */
import { describe, it, expect } from "vitest";
import { postIdentityIQubeOpen } from "@/lib/identity-messages";

describe("OPEN_IDENTITY_IQUBE envelope", () => {
  it("dispatches three compatibility-safe messages with empty payload", () => {
    const posts: any[] = [];
    const iframe = {
      contentWindow: {
        postMessage: (msg: any) => posts.push(msg),
      },
    } as unknown as HTMLIFrameElement;

    postIdentityIQubeOpen(iframe, "*");

    expect(posts).toHaveLength(3);

    // 1: canonical bridge envelope
    expect(posts[0]).toMatchObject({
      type: "OPEN_IDENTITY_IQUBE",
      source: "shell",
      payload: {},
    });

    // 2: hybrid with shell meta
    expect(posts[1]).toMatchObject({
      type: "OPEN_IDENTITY_IQUBE",
      source: "shell",
      payload: {},
    });
    expect(posts[1].msg_id).toBeTruthy();
    expect(posts[1].timestamp).toBeTruthy();

    // 3: bare flat fallback — no iqube_type
    expect(posts[2]).toEqual({
      type: "OPEN_IDENTITY_IQUBE",
    });
  });

  it("never includes an iqube_type field (Identity is single-drawer)", () => {
    const posts: any[] = [];
    const iframe = {
      contentWindow: {
        postMessage: (msg: any) => posts.push(msg),
      },
    } as unknown as HTMLIFrameElement;

    postIdentityIQubeOpen(iframe, "*");

    for (const p of posts) {
      expect(p.iqube_type).toBeUndefined();
      expect(p.payload?.iqube_type).toBeUndefined();
    }
  });
});

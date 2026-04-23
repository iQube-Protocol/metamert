/**
 * Identity flow regression tests.
 *
 * Locks in the contract:
 *  - OPEN_IDENTITY_IQUBE envelope has empty payload (no iqube_type)
 *  - single-dispatch (one postMessage per action) per platform contract
 */
import { describe, it, expect } from "vitest";
import { postToIframe } from "@/lib/shell-messages";

describe("OPEN_IDENTITY_IQUBE envelope", () => {
  it("dispatches a single message with empty payload", () => {
    const posts: any[] = [];
    const iframe = {
      contentWindow: {
        postMessage: (msg: any) => posts.push(msg),
      },
    } as unknown as HTMLIFrameElement;

    postToIframe(
      iframe,
      { type: "OPEN_IDENTITY_IQUBE", payload: {} },
      "*",
    );

    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      type: "OPEN_IDENTITY_IQUBE",
      source: "shell",
      payload: {},
    });
  });

  it("never includes an iqube_type field (Identity is single-drawer)", () => {
    const posts: any[] = [];
    const iframe = {
      contentWindow: {
        postMessage: (msg: any) => posts.push(msg),
      },
    } as unknown as HTMLIFrameElement;

    postToIframe(
      iframe,
      { type: "OPEN_IDENTITY_IQUBE", payload: {} },
      "*",
    );

    for (const p of posts) {
      expect(p.iqube_type).toBeUndefined();
      expect(p.payload?.iqube_type).toBeUndefined();
    }
  });
});

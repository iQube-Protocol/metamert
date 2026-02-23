import { useEffect, useState, useCallback, useRef } from "react";
import {
  fetchHistory,
  publishMessage,
  subscribeToChannel,
} from "@/lib/qubetalk-client";
import type { QubeTalkMessage, QubeTalkPayload, QubeTalkThread } from "@/lib/qubetalk-types";

/**
 * React hook for QubeTalk – subscribes to a thread and provides
 * a `sendMessage` function.
 */
export function useQubeTalk(thread?: QubeTalkThread) {
  const [messages, setMessages] = useState<QubeTalkMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof subscribeToChannel> | null>(null);

  // Load history on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const history = await fetchHistory(thread, 50);
        if (!cancelled) setMessages(history.reverse()); // oldest first
      } catch (err) {
        console.error("[QubeTalk] Failed to fetch history:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    // Subscribe to realtime
    channelRef.current = subscribeToChannel((msg) => {
      setMessages((prev) => [...prev, msg]);
    }, thread);
    setConnected(true);

    return () => {
      cancelled = true;
      channelRef.current?.unsubscribe();
      setConnected(false);
    };
  }, [thread]);

  const sendMessage = useCallback(
    async (
      payload: Omit<QubeTalkPayload, "control" | "attestations"> & {
        control?: Partial<QubeTalkPayload["control"]>;
      },
    ) => {
      return publishMessage(payload);
    },
    [],
  );

  return { messages, connected, loading, sendMessage };
}

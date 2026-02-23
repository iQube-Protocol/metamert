// ---------------------------------------------------------------------------
// QubeTalk Client – uses Supabase Realtime for subscriptions and an edge
// function (send-qubetalk) for publishing.
// ---------------------------------------------------------------------------

import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  type QubeTalkMessage,
  type QubeTalkPayload,
  type QubeTalkThread,
  QUBETALK_CHANNEL,
  LOVABLE_AGENT,
} from "./qubetalk-types";

// ---------------------------------------------------------------------------
// Read helpers (direct Supabase queries – anon key is fine for SELECT)
// ---------------------------------------------------------------------------

export async function fetchHistory(
  thread?: QubeTalkThread,
  limit = 50,
): Promise<QubeTalkMessage[]> {
  let query = supabase
    .from("qubetalk_messages")
    .select("*")
    .eq("channel_id", QUBETALK_CHANNEL)
    .order("created_at", { ascending: false })
    .limit(limit);

  // NOTE: We skip server-side JSON filtering because RLS policies on this
  // table require `app.current_tenant_id` which isn't set for the anon role.
  // Instead we filter client-side after fetching.

  const { data, error } = await query;
  if (error) throw error;

  let messages = (data ?? []).map(mapRow);
  // Client-side thread filter
  if (thread) {
    messages = messages.filter((m) => m.metadata?.thread === thread);
  }
  return messages;
}

// ---------------------------------------------------------------------------
// Publish via edge function (needs service role key server-side)
// ---------------------------------------------------------------------------

export async function publishMessage(
  payload: Omit<QubeTalkPayload, "control" | "attestations"> & {
    control?: Partial<QubeTalkPayload["control"]>;
  },
): Promise<QubeTalkMessage> {
  const messageId = crypto.randomUUID();

  const fullPayload: QubeTalkPayload = {
    ...payload,
    control: {
      id: messageId,
      supersedes_id: payload.control?.supersedes_id ?? null,
      depends_on: payload.control?.depends_on ?? [],
      assignee: payload.control?.assignee ?? null,
      status: payload.control?.status ?? "open",
    },
    attestations: {
      authority: "lovable",
      signature: `lovable:${messageId}`,
    },
  };

  const { data, error } = await supabase.functions.invoke("send-qubetalk", {
    body: {
      channel_id: QUBETALK_CHANNEL,
      message_id: messageId,
      content: payload.title,
      from_agent: LOVABLE_AGENT,
      type: "text", // DB check constraint only allows: text, delegation, response, system, receipt
      metadata: fullPayload,
    },
  });

  if (error) throw error;
  return data as QubeTalkMessage;
}

// ---------------------------------------------------------------------------
// Realtime subscription
// ---------------------------------------------------------------------------

export function subscribeToChannel(
  onMessage: (msg: QubeTalkMessage) => void,
  thread?: QubeTalkThread,
): RealtimeChannel {
  const channel = supabase
    .channel(`qubetalk:${QUBETALK_CHANNEL}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "qubetalk_messages",
        filter: `channel_id=eq.${QUBETALK_CHANNEL}`,
      },
      (payload) => {
        const msg = mapRow(payload.new as any);
        // If thread filter is set, only deliver matching messages
        if (thread && msg.metadata?.thread !== thread) return;
        onMessage(msg);
      },
    )
    .subscribe();

  return channel;
}

// ---------------------------------------------------------------------------
// Row mapper
// ---------------------------------------------------------------------------

function mapRow(row: any): QubeTalkMessage {
  return {
    message_id: row.message_id,
    channel_id: row.channel_id,
    content: row.content,
    from_agent: typeof row.from_agent === "string" ? JSON.parse(row.from_agent) : row.from_agent,
    type: row.type,
    created_at: row.created_at,
    in_reply_to: row.in_reply_to,
    metadata: row.metadata as QubeTalkPayload | null,
  };
}

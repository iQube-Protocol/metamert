import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();

    // ---------- READ (history) ----------
    if (body.action === "history") {
      const { channel_id, limit } = body;
      const { data, error } = await supabase
        .from("qubetalk_messages")
        .select("*")
        .eq("channel_id", channel_id)
        .order("created_at", { ascending: false })
        .limit(limit ?? 50);

      if (error) {
        console.error("[send-qubetalk] History error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------- WRITE (publish message) ----------
    const { channel_id, message_id, content, from_agent, type, metadata, in_reply_to } = body;

    if (!channel_id || !message_id || !content || !from_agent) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: channel_id, message_id, content, from_agent" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Ensure channel exists (upsert)
    const { error: chErr } = await supabase.from("qubetalk_channels").upsert(
      {
        channel_id,
        tenant_id: "agentiq_main",
        participants: ["lovable-metame", "aigent-z", "chatgpt", "windsurf", "claude-code", "openai-codex"],
      },
      { onConflict: "channel_id", ignoreDuplicates: true },
    );
    if (chErr) {
      console.error("[send-qubetalk] Channel upsert error:", chErr);
    }

    const { data, error } = await supabase.from("qubetalk_messages").insert({
      channel_id,
      message_id,
      content,
      from_agent,
      type: type ?? "text",
      metadata: metadata ?? null,
      in_reply_to: in_reply_to ?? null,
    }).select().single();

    if (error) {
      console.error("[send-qubetalk] Insert error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[send-qubetalk] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

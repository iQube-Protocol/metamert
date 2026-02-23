// ---------------------------------------------------------------------------
// QubeTalk message types – adapted from spec to match the existing
// qubetalk_messages table schema in QubeBase (Supabase).
// ---------------------------------------------------------------------------

/** Thread names within the metame-runtime-thinclient channel */
export type QubeTalkThread = "spec" | "api-wiring" | "ui-shell" | "dev-exec" | "ops";

/** Message payload types */
export type QubeTalkMessageType = "task" | "decision" | "question" | "status" | "patch" | "log";

/** Severity levels */
export type QubeTalkSeverity = "info" | "warn" | "blocker";

/** Authority identifiers for attestations */
export type QubeTalkAuthority = "aigent_z" | "chatgpt" | "lovable" | "windsurf";

/** Control block for task tracking */
export interface QubeTalkControl {
  id: string;
  supersedes_id: string | null;
  depends_on: string[];
  assignee: string | null;
  status: "open" | "in_progress" | "blocked" | "done";
}

/** Reference block */
export interface QubeTalkRefs {
  repo: string;
  paths: string[];
  endpoints: string[];
  env: string[];
}

/** Attestation block */
export interface QubeTalkAttestation {
  authority: QubeTalkAuthority;
  signature: string;
}

/**
 * Rich message payload stored inside the `metadata` JSON column
 * of `qubetalk_messages`.
 */
export interface QubeTalkPayload {
  type: QubeTalkMessageType;
  thread: QubeTalkThread;
  severity: QubeTalkSeverity;
  title: string;
  body: string;
  acceptance: string[];
  refs: QubeTalkRefs;
  control: QubeTalkControl;
  attestations: QubeTalkAttestation;
}

/**
 * A row from `qubetalk_messages` with the metadata parsed as
 * QubeTalkPayload.
 */
export interface QubeTalkMessage {
  message_id: string;
  channel_id: string;
  content: string;
  from_agent: { id: string; label: string };
  type: string;
  created_at: string | null;
  in_reply_to: string | null;
  metadata: QubeTalkPayload | null;
}

/** The channel we operate on */
export const QUBETALK_CHANNEL = "metame-runtime-thinclient";

/** Agent identity used when Lovable publishes */
export const LOVABLE_AGENT = { id: "lovable-metame", label: "Lovable Agent" } as const;

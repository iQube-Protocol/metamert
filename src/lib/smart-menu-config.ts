/**
 * Smart Menu — config-driven mode definitions, cartridge/codex types,
 * and state model for the metaMe Runtime Liquid UI.
 */

import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// State model types
// ---------------------------------------------------------------------------

export type ViewState = "defaultNav" | "promptMode" | "quickActionOnly";
export type SmartMenuMode = "be" | "earn" | "play" | "make" | "share";
export type SubmenuType = "quickActions" | "cartridgeSelector" | "codexSelector";
export type QuickActionVisibility = "visibleAuto" | "hiddenAutoIdle" | "hiddenUserToggle";
export type InteractionState = "idle" | "focused" | "typing" | "voiceReady" | "recording" | "quickActionActive";

export interface SmartMenuState {
  viewState: ViewState;
  activeMode: SmartMenuMode | null;
  submenuType: SubmenuType | null;
  submenuVisibility: QuickActionVisibility;
  interactionState: InteractionState;
}

// ---------------------------------------------------------------------------
// Cartridge / Codex
// ---------------------------------------------------------------------------

export interface CodexDef {
  id: string;
  label: string;
  icon?: string;
}

export interface CartridgeDef {
  id: string;
  label: string;
  icon?: string;
  accentHex?: string;
  default_codex_id: string;
  codexes: CodexDef[];
  agents?: string[];
  rules?: string[];
  assets?: string[];
}

export interface CartridgeState {
  activeCartridgeId: string;
  activeCodexId: string;
  available: CartridgeDef[];
}

// ---------------------------------------------------------------------------
// Quick action config
// ---------------------------------------------------------------------------

export type QuickActionKind = "llm+menu" | "system-only";

export interface QuickActionDef {
  id: string;
  label: string;
  icon?: string;
  kind: QuickActionKind;
  triggersInference: boolean;
}

export interface ModeConfig {
  id: SmartMenuMode;
  label: string;
  accentColor: string;   // HSL values string for CSS custom property use
  accentHex: string;      // hex for inline styles
  promptPlaceholder: string;
  defaultCenteredQuickActionId: string;
  mobileVisibleFold: string[];
  quickActions: QuickActionDef[];
}

// ---------------------------------------------------------------------------
// Default cartridges (interim: codex blocks as building blocks per Codex directive)
// ---------------------------------------------------------------------------

export const DEFAULT_CARTRIDGES: CartridgeDef[] = [
  {
    id: "metame-runtime",
    label: "metaMe",
    icon: "box",
    accentHex: "#FF6B6B",
    default_codex_id: "metame-core",
    codexes: [{ id: "metame-core", label: "Runtime Core" }],
    agents: ["metame-agent"],
  },
  {
    id: "qriptopian",
    label: "Qriptopian",
    icon: "box",
    accentHex: "#00D5FF",
    default_codex_id: "qriptopian-codex",
    codexes: [
      { id: "qriptopian-codex", label: "Qriptopian" },
      { id: "knyt-codex", label: "KNYT" },
    ],
    agents: ["moneypenny", "know1"],
  },
  {
    id: "knyt",
    label: "KNYT",
    icon: "box",
    accentHex: "#F59E0B",
    default_codex_id: "knyt-codex",
    codexes: [{ id: "knyt-codex", label: "KNYT" }],
    agents: ["moneypenny", "know1", "nakamoto"],
  },
];

// ---------------------------------------------------------------------------
// Per-mode quick action configs
// ---------------------------------------------------------------------------

const PLAY_ACTIONS: QuickActionDef[] = [
  { id: "be",        label: "Be",        icon: "users",      kind: "llm+menu",    triggersInference: true },
  { id: "find",      label: "Find",      icon: "search",     kind: "llm+menu",    triggersInference: true },
  { id: "listen",    label: "Listen",    icon: "headphones", kind: "llm+menu",    triggersInference: true },
  { id: "watch",     label: "Watch",     icon: "eye",        kind: "llm+menu",    triggersInference: true },
  { id: "read",      label: "Read",      icon: "book-open",  kind: "llm+menu",    triggersInference: true },
  { id: "cartridge", label: "Cartridge", icon: "box",        kind: "system-only", triggersInference: false },
  { id: "share",     label: "Share",     icon: "share-2",    kind: "llm+menu",    triggersInference: true },
  { id: "reset",     label: "Reset",     icon: "rotate-ccw", kind: "system-only", triggersInference: false },
];

const BE_ACTIONS: QuickActionDef[] = [
  { id: "vault",     label: "Vault",     icon: "lock",       kind: "llm+menu",    triggersInference: true },
  { id: "persona",   label: "Persona",   icon: "user",       kind: "llm+menu",    triggersInference: true },
  { id: "memory",    label: "Memory",    icon: "sparkles",   kind: "llm+menu",    triggersInference: true },
  { id: "policy",    label: "Policy",    icon: "shield",     kind: "llm+menu",    triggersInference: true },
  { id: "identity",  label: "Identity",  icon: "fingerprint", kind: "llm+menu",   triggersInference: true },
  { id: "presence",  label: "Presence",  icon: "radio",      kind: "llm+menu",    triggersInference: true },
  { id: "share",     label: "Share",     icon: "share-2",    kind: "llm+menu",    triggersInference: true },
  { id: "reset",     label: "Reset",     icon: "rotate-ccw", kind: "system-only", triggersInference: false },
];

const EARN_ACTIONS: QuickActionDef[] = [
  { id: "goal",        label: "Goal",        icon: "target",     kind: "llm+menu",    triggersInference: true },
  { id: "task",        label: "Task",        icon: "check-square", kind: "llm+menu",  triggersInference: true },
  { id: "reward",      label: "Reward",      icon: "star",       kind: "llm+menu",    triggersInference: true },
  { id: "offer",       label: "Offer",       icon: "tag",        kind: "llm+menu",    triggersInference: true },
  { id: "opportunity", label: "Opportunity", icon: "compass",    kind: "llm+menu",    triggersInference: true },
  { id: "wallet",      label: "Wallet",      icon: "wallet",     kind: "llm+menu",    triggersInference: true },
  { id: "share",       label: "Share",       icon: "share-2",    kind: "llm+menu",    triggersInference: true },
  { id: "reset",       label: "Reset",       icon: "rotate-ccw", kind: "system-only", triggersInference: false },
];

const MAKE_ACTIONS: QuickActionDef[] = [
  { id: "write",   label: "Write",   icon: "pen-line",   kind: "llm+menu",    triggersInference: true },
  { id: "design",  label: "Design",  icon: "palette",    kind: "llm+menu",    triggersInference: true },
  { id: "build",   label: "Build",   icon: "hammer",     kind: "llm+menu",    triggersInference: true },
  { id: "edit",    label: "Edit",    icon: "pencil",     kind: "llm+menu",    triggersInference: true },
  { id: "remix",   label: "Remix",   icon: "shuffle",    kind: "llm+menu",    triggersInference: true },
  { id: "publish", label: "Publish", icon: "upload",     kind: "llm+menu",    triggersInference: true },
  { id: "share",   label: "Share",   icon: "share-2",    kind: "llm+menu",    triggersInference: true },
  { id: "reset",   label: "Reset",   icon: "rotate-ccw", kind: "system-only", triggersInference: false },
];

const SHARE_ACTIONS: QuickActionDef[] = [
  { id: "send",        label: "Send",        icon: "send",       kind: "llm+menu",    triggersInference: true },
  { id: "publish",     label: "Publish",     icon: "upload",     kind: "llm+menu",    triggersInference: true },
  { id: "export",      label: "Export",      icon: "download",   kind: "llm+menu",    triggersInference: true },
  { id: "connect",     label: "Connect",     icon: "link",       kind: "llm+menu",    triggersInference: true },
  { id: "collaborate", label: "Collaborate", icon: "users",      kind: "llm+menu",    triggersInference: true },
  { id: "deliver",     label: "Deliver",     icon: "truck",      kind: "llm+menu",    triggersInference: true },
  { id: "be",          label: "Be",          icon: "user",       kind: "llm+menu",    triggersInference: true },
  { id: "reset",       label: "Reset",       icon: "rotate-ccw", kind: "system-only", triggersInference: false },
];

// ---------------------------------------------------------------------------
// Mode configs — canonical definitions
// ---------------------------------------------------------------------------

export const MODE_CONFIGS: Record<SmartMenuMode, ModeConfig> = {
  be: {
    id: "be",
    label: "Be",
    accentColor: "210 70% 55%",
    accentHex: "#4DA3FF",
    promptPlaceholder: "Set who you are being, your policy, memory, or identity context…",
    defaultCenteredQuickActionId: "policy",
    mobileVisibleFold: ["persona", "memory", "policy", "identity", "presence"],
    quickActions: BE_ACTIONS,
  },
  earn: {
    id: "earn",
    label: "Earn",
    accentColor: "142 71% 45%",
    accentHex: "#22C55E",
    promptPlaceholder: "Ask about rewards, tasks, offers, value, or opportunities…",
    defaultCenteredQuickActionId: "offer",
    mobileVisibleFold: ["task", "reward", "offer", "opportunity", "wallet"],
    quickActions: EARN_ACTIONS,
  },
  play: {
    id: "play",
    label: "Play",
    accentColor: "190 100% 50%",
    accentHex: "#00D5FF",
    promptPlaceholder: "Ask, explore, watch, listen, read, or switch context…",
    defaultCenteredQuickActionId: "watch",
    mobileVisibleFold: ["find", "listen", "watch", "read", "cartridge"],
    quickActions: PLAY_ACTIONS,
  },
  make: {
    id: "make",
    label: "Make",
    accentColor: "300 76% 60%",
    accentHex: "#D946EF",
    promptPlaceholder: "Create, design, build, edit, or publish something…",
    defaultCenteredQuickActionId: "build",
    mobileVisibleFold: ["design", "build", "edit", "remix", "publish"],
    quickActions: MAKE_ACTIONS,
  },
  share: {
    id: "share",
    label: "Share",
    accentColor: "38 92% 50%",
    accentHex: "#F59E0B",
    promptPlaceholder: "Send, publish, export, connect, or collaborate…",
    defaultCenteredQuickActionId: "connect",
    mobileVisibleFold: ["publish", "export", "connect", "collaborate", "deliver"],
    quickActions: SHARE_ACTIONS,
  },
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const IDLE_TIMEOUT_MS = 3000;
export const IDLE_RESET_EVENTS = ["typing", "promptFocus", "hover", "micToggle", "voiceRecordingState", "quickActionOpen", "promptNonEmpty"] as const;
export const IDLE_NO_RESET_EVENTS = ["carouselSwipe", "carouselDrag"] as const;

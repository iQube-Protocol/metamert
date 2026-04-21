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
export type SubmenuType = "quickActions" | "cartridgeSelector" | "codexSelector" | "personaSelector" | "browserSelector";
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
// Persona
// ---------------------------------------------------------------------------

export interface PersonaDef {
  id: string;
  label: string;
  icon?: string;
  accentHex?: string;
  /** iQube ID to load when this persona is selected */
  iqubeId?: string;
}

export interface PersonaState {
  activePersonaId: string;
  available: PersonaDef[];
}

export const DEFAULT_PERSONAS: PersonaDef[] = [
  {
    id: "metame-persona",
    label: "metaMe",
    icon: "user",
    accentHex: "#FF6B6B",
    iqubeId: "iqube-metame-persona",
  },
  {
    id: "qripto-persona",
    label: "Qripto",
    icon: "user",
    accentHex: "#00D5FF",
    iqubeId: "iqube-qripto-persona",
  },
  {
    id: "knyt-persona",
    label: "KNYT",
    icon: "user",
    accentHex: "#F59E0B",
    iqubeId: "iqube-knyt-persona",
  },
];

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
  /** Rich contextual prompt sent via PROMPT_SUBMIT to trigger inference */
  prompt?: string;
  /** If set, also sends a MENU_ACTION with this action_id to the iframe (dual dispatch) */
  iframeAction?: string;
  /** If set, route the action through AA-API menu-action before/while sending the prompt */
  apiAction?: string;
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

/**
 * PLAY_ACTIONS — note that the "context-toggle" item (id "knyt") is rendered
 * dynamically by the SmartMenuSubmenu and toggles between KNYT ↔ metaMe based
 * on the active runtime context. Its label/icon/color in the menu come from
 * the runtime context state, not these static fields.
 */
const PLAY_ACTIONS: QuickActionDef[] = [
  { id: "be",        label: "Be",        icon: "users",      kind: "llm+menu",    triggersInference: true,  prompt: "Show me who I can be" },
  { id: "find",      label: "Find",      icon: "search",     kind: "llm+menu",    triggersInference: true,  prompt: "Search and discover something new for me" },
  { id: "listen",    label: "Listen",    icon: "headphones", kind: "llm+menu",    triggersInference: true,  prompt: "Play something for me to listen to" },
  { id: "knyt",      label: "KNYT",      icon: "zap",        kind: "system-only", triggersInference: false },
  { id: "watch",     label: "Watch",     icon: "eye",        kind: "llm+menu",    triggersInference: true,  prompt: "Show me something interesting to watch" },
  { id: "browse",    label: "Browse",    icon: "globe",      kind: "system-only", triggersInference: false },
  { id: "read",      label: "Read",      icon: "book-open",  kind: "llm+menu",    triggersInference: true,  prompt: "Find me something good to read" },
  { id: "cartridge", label: "Cartridge", icon: "box",        kind: "system-only", triggersInference: false },
  { id: "share",     label: "Share",     icon: "share-2",    kind: "llm+menu",    triggersInference: true },
  { id: "reset",     label: "Reset",     icon: "rotate-ccw", kind: "system-only", triggersInference: false },
];

const BE_ACTIONS: QuickActionDef[] = [
  { id: "settings",  label: "Settings",  icon: "settings",   kind: "system-only", triggersInference: false },
  { id: "vault",     label: "Vault",     icon: "lock",       kind: "llm+menu",    triggersInference: true,  prompt: "Open my secure vault" },
  { id: "persona",   label: "Persona",   icon: "user",       kind: "system-only", triggersInference: false },
  { id: "memory",    label: "Memory",    icon: "sparkles",   kind: "llm+menu",    triggersInference: true,  prompt: "Show my memory and context history" },
  { id: "policy",    label: "Policy",    icon: "shield",     kind: "llm+menu",    triggersInference: true,  prompt: "Review my current policies and settings" },
  { id: "identity",  label: "Identity",  icon: "fingerprint", kind: "llm+menu",   triggersInference: true,  prompt: "Show my identity and credentials" },
  { id: "presence",  label: "Presence",  icon: "radio",      kind: "llm+menu",    triggersInference: true,  prompt: "Show my presence and availability status" },
  { id: "share",     label: "Share",     icon: "share-2",    kind: "llm+menu",    triggersInference: true },
  { id: "reset",     label: "Reset",     icon: "rotate-ccw", kind: "system-only", triggersInference: false },
];

const EARN_ACTIONS: QuickActionDef[] = [
  { id: "knyt-progress", label: "Progress", icon: "trending-up", kind: "llm+menu", triggersInference: true, prompt: "Show my KNYT progression status and next milestones", apiAction: "knyt-progress", iframeAction: "knyt_progress" },
  { id: "goal",        label: "Goal",        icon: "target",     kind: "llm+menu",    triggersInference: true,  prompt: "Show my current goals and progress" },
  { id: "task",        label: "Task",        icon: "check-square", kind: "llm+menu",  triggersInference: true,  prompt: "What tasks should I work on next?" },
  { id: "reward",      label: "Reward",      icon: "star",       kind: "llm+menu",    triggersInference: true,  prompt: "Show my rewards and achievements" },
  { id: "offer",       label: "Offer",       icon: "tag",        kind: "llm+menu",    triggersInference: true,  prompt: "Find offers and deals available to me" },
  { id: "opportunity", label: "Opportunity", icon: "compass",    kind: "llm+menu",    triggersInference: true,  prompt: "Discover new opportunities for me" },
  { id: "wallet",      label: "Wallet",      icon: "wallet",     kind: "llm+menu",    triggersInference: true,  prompt: "What would you like to explore in your wallet?", apiAction: "wallet" },
  { id: "share",       label: "Share",       icon: "share-2",    kind: "llm+menu",    triggersInference: true },
  { id: "reset",       label: "Reset",       icon: "rotate-ccw", kind: "system-only", triggersInference: false },
];

const MAKE_ACTIONS: QuickActionDef[] = [
  { id: "write",   label: "Write",   icon: "pen-line",   kind: "llm+menu",    triggersInference: true,  prompt: "Help me write something" },
  { id: "design",  label: "Design",  icon: "palette",    kind: "llm+menu",    triggersInference: true,  prompt: "Help me design something creative" },
  { id: "build",   label: "Build",   icon: "hammer",     kind: "llm+menu",    triggersInference: true,  prompt: "Help me build something new" },
  { id: "edit",    label: "Edit",    icon: "pencil",     kind: "llm+menu",    triggersInference: true,  prompt: "Help me edit and refine my work" },
  { id: "remix",   label: "Remix",   icon: "shuffle",    kind: "llm+menu",    triggersInference: true,  prompt: "Remix something creative for me" },
  { id: "publish", label: "Publish", icon: "upload",     kind: "llm+menu",    triggersInference: true,  prompt: "Help me publish my work" },
  { id: "share",   label: "Share",   icon: "share-2",    kind: "llm+menu",    triggersInference: true },
  { id: "reset",   label: "Reset",   icon: "rotate-ccw", kind: "system-only", triggersInference: false },
];

const SHARE_ACTIONS: QuickActionDef[] = [
  { id: "send",        label: "Send",        icon: "send",       kind: "llm+menu",    triggersInference: true,  prompt: "Send a message for me" },
  { id: "publish",     label: "Publish",     icon: "upload",     kind: "llm+menu",    triggersInference: true,  prompt: "Publish and share my content" },
  { id: "export",      label: "Export",      icon: "download",   kind: "llm+menu",    triggersInference: true,  prompt: "Export my data and content" },
  { id: "connect",     label: "Connect",     icon: "link",       kind: "llm+menu",    triggersInference: true,  prompt: "Connect me with someone" },
  { id: "collaborate", label: "Collaborate", icon: "users",      kind: "llm+menu",    triggersInference: true,  prompt: "Start a collaboration session" },
  { id: "deliver",     label: "Deliver",     icon: "truck",      kind: "llm+menu",    triggersInference: true,  prompt: "Deliver my content to its destination" },
  { id: "be",          label: "Be",          icon: "user",       kind: "llm+menu",    triggersInference: true,  prompt: "Show me who I can be" },
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
    mobileVisibleFold: ["settings", "persona", "memory", "policy", "identity", "presence"],
    quickActions: BE_ACTIONS,
  },
  earn: {
    id: "earn",
    label: "Earn",
    accentColor: "142 71% 45%",
    accentHex: "#22C55E",
    promptPlaceholder: "Ask about rewards, tasks, offers, value, or opportunities…",
    defaultCenteredQuickActionId: "offer",
    mobileVisibleFold: ["knyt-progress", "task", "reward", "offer", "wallet"],
    quickActions: EARN_ACTIONS,
  },
  play: {
    id: "play",
    label: "Play",
    accentColor: "190 100% 50%",
    accentHex: "#00D5FF",
    promptPlaceholder: "Ask, explore, watch, listen, read, or switch context…",
    defaultCenteredQuickActionId: "knyt",
    mobileVisibleFold: ["find", "listen", "knyt", "watch", "browse"],
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

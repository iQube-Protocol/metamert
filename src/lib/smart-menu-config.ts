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

/**
 * ALL_PERSONAS — full registry including hidden ones.
 * DEFAULT_PERSONAS — only personas that should be rendered in the submenu.
 *
 * Add `hidden: true` to keep a persona in the registry without showing it
 * in the UI. The shell guarantees that `personaState.available` only
 * contains visible personas.
 */
interface InternalPersonaDef extends PersonaDef {
  hidden?: boolean;
}

export const ALL_PERSONAS: InternalPersonaDef[] = [
  {
    id: "metame-persona",
    label: "metaMe",
    icon: "user",
    accentHex: "#FF6B6B",
    iqubeId: "iqube-metame-persona",
    hidden: true,
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

/** Visible personas — what the submenu renders. */
export const DEFAULT_PERSONAS: PersonaDef[] = ALL_PERSONAS
  .filter(p => !p.hidden)
  .map(({ hidden: _h, ...rest }) => rest);

/** Canonical default active persona id (first visible). */
export const DEFAULT_ACTIVE_PERSONA_ID: string = DEFAULT_PERSONAS[0]?.id ?? "qripto-persona";

/** Map a persona id to the runtime's iqube_type drawer key. */
export function personaIdToIqubeType(personaId: string): "knyt" | "qripto" | null {
  if (personaId === "knyt-persona") return "knyt";
  if (personaId === "qripto-persona") return "qripto";
  return null;
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
    id: "metame-codex",
    label: "metaMe",
    icon: "box",
    accentHex: "#FF6B6B",
    default_codex_id: "metame-codex",
    codexes: [{ id: "metame-codex", label: "metaMe Codex" }],
    agents: ["metame-agent"],
  },
  {
    id: "qripto-codex",
    label: "Qriptopian",
    icon: "box",
    accentHex: "#00D5FF",
    default_codex_id: "qripto-codex",
    codexes: [
      { id: "qripto-codex", label: "Qriptopian" },
      { id: "knyt-codex", label: "KNYT" },
    ],
    agents: ["moneypenny", "know1"],
  },
  {
    id: "knyt-codex",
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
  { id: "read",      label: "Read",      icon: "book-open",  kind: "llm+menu",    triggersInference: true,  prompt: "Find me something good to read" },
  { id: "listen",    label: "Listen",    icon: "headphones", kind: "llm+menu",    triggersInference: true,  prompt: "Play something for me to listen to" },
  { id: "watch",     label: "Watch",     icon: "eye",        kind: "llm+menu",    triggersInference: true,  prompt: "Show me something interesting to watch" },
  { id: "knyt",      label: "KNYT",      icon: "zap",        kind: "system-only", triggersInference: false },
  { id: "browse",    label: "Browse",    icon: "globe",      kind: "system-only", triggersInference: false },
  { id: "cartridge", label: "Cartridge", icon: "save",       kind: "system-only", triggersInference: false },
  { id: "reset",     label: "Reset",     icon: "rotate-ccw", kind: "system-only", triggersInference: false },
];

const BE_ACTIONS: QuickActionDef[] = [
  { id: "persona",     label: "Persona",     icon: "user",        kind: "system-only", triggersInference: false },
  { id: "memory",      label: "Memory",      icon: "sparkles",    kind: "system-only", triggersInference: false },
  { id: "identity",    label: "Identity",    icon: "fingerprint", kind: "system-only", triggersInference: false },
  { id: "connections", label: "Connections", icon: "network",     kind: "llm+menu",    triggersInference: true, prompt: "Show my connections and network" },
  { id: "settings",    label: "Settings",    icon: "settings",    kind: "system-only", triggersInference: false },
];

const EARN_ACTIONS: QuickActionDef[] = [
  { id: "goal",        label: "Goal",        icon: "target",       kind: "llm+menu", triggersInference: true,  prompt: "Show my current goals and progress" },
  { id: "task",        label: "Task",        icon: "check-square", kind: "llm+menu", triggersInference: true,  prompt: "What tasks should I work on next?" },
  { id: "wallet",      label: "Wallet",      icon: "wallet",       kind: "llm+menu", triggersInference: true,  prompt: "What would you like to explore in your wallet?", apiAction: "wallet" },
  { id: "reward",      label: "Reward",      icon: "star",         kind: "llm+menu", triggersInference: true,  prompt: "Show my rewards and achievements" },
  { id: "offer",       label: "Offer",       icon: "tag",          kind: "llm+menu", triggersInference: true,  prompt: "Find offers and deals available to me" },
];

const MAKE_ACTIONS: QuickActionDef[] = [
  { id: "create",  label: "Create",  icon: "sparkles",  kind: "llm+menu", triggersInference: true, prompt: "Help me create something new" },
  { id: "design",  label: "Design",  icon: "palette",   kind: "llm+menu", triggersInference: true, prompt: "Help me design something creative" },
  { id: "edit",    label: "Edit",    icon: "pencil",    kind: "llm+menu", triggersInference: true, prompt: "Help me edit and refine my work" },
  { id: "remix",   label: "Remix",   icon: "shuffle",   kind: "llm+menu", triggersInference: true, prompt: "Remix something creative for me" },
  { id: "build",   label: "Build",   icon: "hammer",    kind: "llm+menu", triggersInference: true, prompt: "Help me build something new" },
];

const SHARE_ACTIONS: QuickActionDef[] = [
  { id: "refer",       label: "Refer",       icon: "user-plus",  kind: "llm+menu", triggersInference: true, prompt: "Help me refer someone" },
  { id: "invite",      label: "Invite",      icon: "mail",       kind: "llm+menu", triggersInference: true, prompt: "Help me invite someone" },
  { id: "message",     label: "Message",     icon: "message-circle", kind: "llm+menu", triggersInference: true, prompt: "Help me send a message" },
  { id: "share",       label: "Share",       icon: "share-2",    kind: "llm+menu", triggersInference: true, prompt: "Help me share something" },
  { id: "publish",     label: "Publish",     icon: "upload",     kind: "llm+menu", triggersInference: true, prompt: "Publish and share my content" },
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
    promptPlaceholder: "Set who you are being, your memory, identity, or connections…",
    defaultCenteredQuickActionId: "identity",
    mobileVisibleFold: ["persona", "memory", "identity", "connections", "settings"],
    quickActions: BE_ACTIONS,
  },
  earn: {
    id: "earn",
    label: "Earn",
    accentColor: "142 71% 45%",
    accentHex: "#22C55E",
    promptPlaceholder: "Ask about rewards, tasks, offers, value, or opportunities…",
    defaultCenteredQuickActionId: "wallet",
    mobileVisibleFold: ["goal", "task", "wallet", "reward", "offer"],
    quickActions: EARN_ACTIONS,
  },
  play: {
    id: "play",
    label: "Play",
    accentColor: "190 100% 50%",
    accentHex: "#00D5FF",
    promptPlaceholder: "Ask, explore, watch, listen, read, or switch context…",
    defaultCenteredQuickActionId: "knyt",
    mobileVisibleFold: ["read", "listen", "watch", "knyt", "browse", "cartridge", "reset"],
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
    defaultCenteredQuickActionId: "message",
    mobileVisibleFold: ["refer", "invite", "message", "share", "publish"],
    quickActions: SHARE_ACTIONS,
  },
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const IDLE_TIMEOUT_MS = 3000;
export const IDLE_RESET_EVENTS = ["typing", "promptFocus", "hover", "micToggle", "voiceRecordingState", "quickActionOpen", "promptNonEmpty"] as const;
export const IDLE_NO_RESET_EVENTS = ["carouselSwipe", "carouselDrag"] as const;

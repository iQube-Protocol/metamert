/**
 * Browser Surface Host — type definitions for the shell-side browser capability.
 *
 * The shell is a visual host only. All browser logic lives in the runtime.
 * These types define the rendering contract and bridge event shapes.
 */

// ---------------------------------------------------------------------------
// Surface UI state
// ---------------------------------------------------------------------------

export type BrowserSurfaceUIState =
  | "collapsed"
  | "mounting"
  | "mounted"
  | "agent_active"
  | "human_takeover"
  | "minimized"
  | "docked"
  | "error";

// ---------------------------------------------------------------------------
// Mount payload — runtime → shell rendering contract
// ---------------------------------------------------------------------------

export interface BrowserMountPayload {
  sessionId: string;
  provider: "browserbase" | "browserless" | "self_hosted";
  mountMode: "overlay" | "docked" | "panel";
  liveView: {
    type: "iframe";
    url: string;
  };
  chrome: {
    title: string;
    domain?: string;
    trustMode: "managed" | "private-managed" | "self-hosted";
    privacyMode: "standard" | "sensitive" | "sealed";
    executionMode: "playwright" | "stagehand" | "browser_use";
    activeAgentLabel: string;
  };
  capabilities: {
    canTakeover: boolean;
    canResize: boolean;
    canMinimize: boolean;
    canDock: boolean;
  };
}

// ---------------------------------------------------------------------------
// Surface bounds
// ---------------------------------------------------------------------------

export interface SurfaceBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Step state — streamed during agent_active
// ---------------------------------------------------------------------------

export type BrowserStepStatus =
  | "reading"
  | "extracting"
  | "navigating"
  | "waiting"
  | "paused"
  | "acting"
  | "observing";

export interface BrowserStepState {
  sessionId: string;
  stepLabel: string;
  actorLabel: string;
  status: BrowserStepStatus;
  stepIndex?: number;
  totalSteps?: number;
}

// ---------------------------------------------------------------------------
// Badge state — mirrored from runtime
// ---------------------------------------------------------------------------

export interface BrowserBadgeState {
  sessionId: string;
  trustMode: string;
  privacyMode: string;
  executionMode: string;
  activeAgentLabel: string;
}

// ---------------------------------------------------------------------------
// Shell → Runtime bridge events
// ---------------------------------------------------------------------------

export type ShellBrowserEvent =
  | { type: "browser.open.request"; payload?: { intent?: string } }
  | { type: "browser.close.request"; payload: { sessionId: string } }
  | { type: "browser.minimize.request"; payload: { sessionId: string } }
  | { type: "browser.expand.request"; payload: { sessionId: string } }
  | { type: "browser.focus.changed"; payload: { sessionId: string; focused: boolean } }
  | { type: "browser.takeover.request"; payload: { sessionId: string } }
  | { type: "browser.resume.request"; payload: { sessionId: string } }
  | { type: "browser.surface.bounds.changed"; payload: { sessionId: string; bounds: SurfaceBounds } };

// ---------------------------------------------------------------------------
// Runtime → Shell bridge events
// ---------------------------------------------------------------------------

export type RuntimeBrowserEvent =
  | { type: "browser.mount"; payload: BrowserMountPayload }
  | { type: "browser.unmount"; payload: { sessionId: string } }
  | { type: "browser.surface.state"; payload: { sessionId: string; mounted: boolean; mountMode: string; shellSurfaceState: string; focused: boolean; takeoverActive: boolean; visible: boolean } }
  | { type: "browser.step.update"; payload: BrowserStepState }
  | { type: "browser.takeover.state"; payload: { sessionId: string; active: boolean } }
  | { type: "browser.badges.update"; payload: BrowserBadgeState }
  | { type: "browser.error"; payload: { sessionId?: string; message: string; code?: string } };

/**
 * SmartMenuSubmenu rendered interaction tests.
 *
 * Regression coverage for the iQube drawer flow:
 *  - Persona quick action MUST switch submenu to "personaSelector"
 *    (and MUST NOT call handleMenuAction or submitPrompt)
 *  - Identity quick action MUST call openIdentityIQube exactly once
 *    (and MUST NOT call handleMenuAction or submitPrompt)
 *  - Persona pill click MUST call selectPersona exactly once
 *
 * These tests guard against the recurring regression where submenu
 * reorderings or hover/idle changes silently break drawer dispatch.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import SmartMenuSubmenu from "@/components/SmartMenuSubmenu";

// --- Shared mock spies -----------------------------------------------------
const handleMenuAction = vi.fn();
const submitPrompt = vi.fn();
const sendIframeAction = vi.fn();
const setSubmenuType = vi.fn();
const openIdentityIQube = vi.fn();
const openPersonaIQube = vi.fn();
const selectPersona = vi.fn();
const selectCartridge = vi.fn();
const selectCodex = vi.fn();
const activateMode = vi.fn();
const pauseIdleTimer = vi.fn();
const resetIdleTimer = vi.fn();
const resumeIdleTimer = vi.fn();
const setRuntimeContext = vi.fn();
const pulseInference = vi.fn();

let __submenuType:
  | "quickActions"
  | "personaSelector"
  | "cartridgeSelector"
  | "codexSelector"
  | "browserSelector"
  | null = "quickActions";

vi.mock("@/contexts/ShellContext", () => ({
  useShell: () => ({
    activeMode: "be",
    viewState: "promptMode",
    submenuType: __submenuType,
    setSubmenuType,
    handleMenuAction,
    submitPrompt,
    sendIframeAction,
    activateMode,
    pauseIdleTimer,
    resetIdleTimer,
    resumeIdleTimer,
    runtimeContext: "metame",
    setRuntimeContext,
    openPersonaIQube,
    openIdentityIQube,
    pulseInference,
    cartridgeState: {
      activeCartridgeId: "qripto-codex",
      activeCodexId: "qripto-codex",
      available: [],
    },
    selectCartridge,
    selectCodex,
    selectPersona,
  }),
}));

vi.mock("@/contexts/BrowserContext", () => ({
  useBrowserOptional: () => null,
}));

beforeEach(() => {
  vi.clearAllMocks();
  __submenuType = "quickActions";
});

describe("SmartMenuSubmenu — Be quick actions routing", () => {
  it("Persona click switches submenu to personaSelector and does NOT call handleMenuAction or submitPrompt", () => {
    render(<SmartMenuSubmenu />);
    const btn = screen.getByTitle("Persona");
    fireEvent.pointerUp(btn);

    expect(setSubmenuType).toHaveBeenCalledWith("personaSelector");
    expect(handleMenuAction).not.toHaveBeenCalled();
    expect(submitPrompt).not.toHaveBeenCalled();
    expect(openPersonaIQube).not.toHaveBeenCalled();
    expect(pulseInference).not.toHaveBeenCalled();
  });

  it("Identity click calls openIdentityIQube exactly once and does NOT route through generic prompt path", () => {
    render(<SmartMenuSubmenu />);
    const btn = screen.getByTitle("Identity");
    fireEvent.pointerUp(btn);

    // Direct drawer-open via canonical OPEN_IDENTITY_IQUBE triple-dispatch
    expect(openIdentityIQube).toHaveBeenCalledTimes(1);

    // Generic prompt-path legs MUST NOT fire for Identity
    expect(handleMenuAction).not.toHaveBeenCalled();
    expect(sendIframeAction).not.toHaveBeenCalled();
    expect(submitPrompt).not.toHaveBeenCalled();
    expect(setSubmenuType).not.toHaveBeenCalled();

    // Pulse fires for visual feedback
    expect(pulseInference).toHaveBeenCalled();
  });

  it("Identity click only fires once even if pointerUp and click both bubble", () => {
    render(<SmartMenuSubmenu />);
    const btn = screen.getByTitle("Identity");
    fireEvent.pointerUp(btn);
    fireEvent.click(btn);
    expect(openIdentityIQube).toHaveBeenCalledTimes(1);
  });
});

describe("SmartMenuSubmenu — Persona pill routing (mirrors Cartridge)", () => {
  it("clicking the KNYT pill calls selectPersona('knyt') exactly once", () => {
    __submenuType = "personaSelector";
    render(<SmartMenuSubmenu />);
    const knytBtn = screen.getByText("KNYT").closest("button")!;
    fireEvent.pointerUp(knytBtn);

    expect(selectPersona).toHaveBeenCalledTimes(1);
    expect(selectPersona).toHaveBeenCalledWith("knyt");
    expect(handleMenuAction).not.toHaveBeenCalled();
    expect(submitPrompt).not.toHaveBeenCalled();
  });

  it("clicking the Qripto pill calls selectPersona('qripto') exactly once", () => {
    __submenuType = "personaSelector";
    render(<SmartMenuSubmenu />);
    const qriptoBtn = screen.getByText("Qripto").closest("button")!;
    fireEvent.pointerUp(qriptoBtn);

    expect(selectPersona).toHaveBeenCalledTimes(1);
    expect(selectPersona).toHaveBeenCalledWith("qripto");
  });
});

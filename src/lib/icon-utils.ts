/**
 * Dynamic Lucide icon lookup from payload icon name strings.
 * Falls back to sensible defaults per menu item ID.
 */
import { icons, type LucideIcon } from "lucide-react";
import { Coins, Gamepad2, Wrench, User, Share2, Bot, Cpu, MessageSquare } from "lucide-react";

/** Default icon map keyed by well-known item IDs */
const DEFAULTS: Record<string, LucideIcon> = {
  be: User,
  earn: Coins,
  play: Gamepad2,
  make: Wrench,
  share: Share2,
  "aigent-z": Bot,
  "aigent-q": Bot,
  "gpt-4o": Cpu,
  "claude-sonnet": MessageSquare,
};

/**
 * Resolve a Lucide icon component from a kebab-case or PascalCase name.
 * Returns a fallback based on `fallbackId`, or undefined.
 */
export function resolveIcon(
  iconName?: string,
  fallbackId?: string,
): LucideIcon | undefined {
  if (iconName) {
    // Convert kebab-case to PascalCase for lucide-react icons map
    const pascal = iconName
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("");
    const found = (icons as Record<string, LucideIcon>)[pascal];
    if (found) return found;
  }
  if (fallbackId) {
    return DEFAULTS[fallbackId];
  }
  return undefined;
}

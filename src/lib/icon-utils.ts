/**
 * Dynamic Lucide icon lookup from payload icon name strings.
 * Falls back to sensible defaults per menu item ID.
 */
import { icons, type LucideIcon } from "lucide-react";
import {
  Coins, PlayCircle, Pencil, Users, Share2,
  Bot, Cpu, MessageSquare, Sparkles, Zap,
  Eye, Headphones, BookOpen, Search, RefreshCw, RotateCcw,
} from "lucide-react";

/** Default icon map keyed by well-known item IDs */
const DEFAULTS: Record<string, LucideIcon> = {
  be: Users,
  earn: Coins,
  play: PlayCircle,
  make: Pencil,
  share: Share2,
  "aigent-z": Bot,
  "aigent-q": Bot,
  "aigent-m": Bot,
  "gpt-4o": Sparkles,
  "claude-sonnet": MessageSquare,
  "gemini-pro": Zap,
  // Quick link defaults
  "ql-watch": Eye,
  watch: Eye,
  "ql-listen": Headphones,
  listen: Headphones,
  "ql-read": BookOpen,
  read: BookOpen,
  "ql-find": Search,
  find: Search,
  "ql-refresh": RefreshCw,
  refresh: RefreshCw,
  "ql-reset": RotateCcw,
  reset: RotateCcw,
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

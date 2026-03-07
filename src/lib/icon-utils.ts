/**
 * Dynamic Lucide icon lookup from payload icon name strings.
 * Falls back to sensible defaults per menu item ID.
 */
import { icons, type LucideIcon } from "lucide-react";
import {
  Coins, Play, Pencil, Users, Share2,
  Bot, Cpu, MessageSquare, Sparkles, Zap,
  Eye, Headphones, BookOpen, Search, RefreshCw, RotateCcw, XCircle,
  Lock, User, Shield, Fingerprint, Radio,
  Target, CheckSquare, Star, Tag, Compass, Wallet,
  PenLine, Palette, Hammer, Shuffle, Upload,
  Send, Download, Link, Truck, Box, Library,
} from "lucide-react";

/** Default icon map keyed by well-known item IDs */
const DEFAULTS: Record<string, LucideIcon> = {
  be: Users,
  earn: Coins,
  play: Play,
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
  "close-codex": XCircle,
  "close_codex": XCircle,
  // Smart Menu quick action defaults
  vault: Lock,
  persona: User,
  memory: Sparkles,
  policy: Shield,
  identity: Fingerprint,
  presence: Radio,
  goal: Target,
  task: CheckSquare,
  reward: Star,
  offer: Tag,
  opportunity: Compass,
  wallet: Wallet,
  write: PenLine,
  design: Palette,
  build: Hammer,
  edit: Pencil,
  remix: Shuffle,
  publish: Upload,
  send: Send,
  export: Download,
  connect: Link,
  collaborate: Users,
  deliver: Truck,
  cartridge: Box,
  codex: Library,
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

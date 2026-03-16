/**
 * Extended icon defaults for Smart Menu quick actions.
 * Supplements the existing icon-utils.ts DEFAULTS map.
 */
import {
  Lock, User, Sparkles, Shield, Fingerprint, Radio,
  Target, CheckSquare, Star, Tag, Compass, Wallet,
  PenLine, Palette, Hammer, Pencil, Shuffle, Upload,
  Send, Download, Link, Truck, Box, Library, Globe,
  type LucideIcon,
} from "lucide-react";

export const SMART_MENU_ICON_DEFAULTS: Record<string, LucideIcon> = {
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
  collaborate: User,
  deliver: Truck,
  cartridge: Box,
  codex: Library,
};

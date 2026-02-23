import { useShell } from "@/contexts/ShellContext";
import { Coins, Gamepad2, Wrench, User, Share2 } from "lucide-react";

const menuItems = [
  { id: "be", icon: User, label: "Be", edge: true },
  { id: "earn", icon: Coins, label: "Earn", edge: false },
  { id: "play", icon: Gamepad2, label: "Play", edge: false },
  { id: "make", icon: Wrench, label: "Make", edge: false },
  { id: "share", icon: Share2, label: "Share", edge: true },
];

/**
 * Fixed bottom navigation bar matching the reference design:
 * Be (left edge) | Earn · Play · Make (center triad) | Share (right edge)
 */
export default function SmartMenu() {
  const { config, handleMenuAction } = useShell();
  if (!config) return null;

  return (
    <nav className="flex items-stretch justify-between border-t border-border bg-card px-2 py-1.5">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isEdge = item.edge;
        return (
          <button
            key={item.id}
            onClick={() => handleMenuAction(item.id)}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-md py-1.5 text-[11px] transition-colors hover:bg-accent hover:text-accent-foreground ${
              isEdge
                ? "text-muted-foreground"
                : "text-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

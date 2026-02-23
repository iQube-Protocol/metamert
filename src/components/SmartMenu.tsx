import { useState } from "react";
import { useShell } from "@/contexts/ShellContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Coins, Gamepad2, Wrench, User, Share2, Menu } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  earn: Coins,
  play: Gamepad2,
  make: Wrench,
  be: User,
  share: Share2,
};

export default function SmartMenu() {
  const { config, handleMenuAction } = useShell();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(true);

  if (!config) return null;

  const allItems = [
    ...config.menu.items.filter((i) => i.enabled),
    ...config.menu.edge_items.filter((i) => i.visible),
  ];

  // Mobile collapsed mode
  if (isMobile && config.menu.collapse_mobile && collapsed) {
    return (
      <nav className="flex items-center justify-center border-b border-border bg-card px-2 py-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="gap-2">
              <Menu className="h-4 w-4" />
              metaMe
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {allItems.map((item) => {
              const Icon = iconMap[item.id];
              return (
                <DropdownMenuItem key={item.id} onClick={() => handleMenuAction(item.id)}>
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  {item.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    );
  }

  // Desktop / expanded
  return (
    <nav className="flex items-center justify-center gap-1 border-b border-border bg-card px-4 py-1.5">
      {config.menu.items
        .filter((i) => i.enabled)
        .map((item) => {
          const Icon = iconMap[item.id];
          return (
            <Button key={item.id} variant="ghost" size="sm" className="gap-1.5" onClick={() => handleMenuAction(item.id)}>
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
            </Button>
          );
        })}

      {config.menu.edge_items.some((i) => i.visible) && (
        <div className="mx-2 h-5 w-px bg-border" />
      )}

      {config.menu.edge_items
        .filter((i) => i.visible)
        .map((item) => {
          const Icon = iconMap[item.id];
          return (
            <Button key={item.id} variant="outline" size="sm" className="gap-1.5" onClick={() => handleMenuAction(item.id)}>
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
            </Button>
          );
        })}
    </nav>
  );
}

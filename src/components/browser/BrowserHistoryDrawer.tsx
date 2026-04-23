import { useBrowserOptional } from "@/contexts/BrowserContext";
import { RefreshCw, History, FileText, Receipt, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { BrowserDrawerItem } from "@/lib/browser-types";

function DrawerColumn({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ElementType;
  items: BrowserDrawerItem[];
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-medium text-foreground">{title}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{items.length}</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0.5 p-1.5">
          {items.length === 0 && (
            <p className="px-2 py-3 text-center text-[11px] text-muted-foreground">None yet</p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2 rounded-md px-2 py-1.5 text-[11px] transition-colors hover:bg-accent"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{item.label}</p>
                {item.timestamp && (
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default function BrowserHistoryDrawer() {
  const ctx = useBrowserOptional();
  if (!ctx) return null;
  const { drawerOpen, drawerData, requestDrawerRefresh } = ctx;

  if (!drawerOpen) return null;

  const history = drawerData?.history ?? [];
  const artifacts = drawerData?.artifacts ?? [];
  const receipts = drawerData?.receipts ?? [];

  return (
    <div className="flex h-48 flex-col border-t border-border bg-card/80 backdrop-blur-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-end px-2 py-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 px-2 text-[10px] text-muted-foreground"
          onClick={requestDrawerRefresh}
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      </div>

      {/* Three columns */}
      <div className="flex flex-1 divide-x divide-border overflow-hidden">
        <DrawerColumn title="History" icon={History} items={history} />
        <DrawerColumn title="Artifacts" icon={FileText} items={artifacts} />
        <DrawerColumn title="Receipts" icon={Receipt} items={receipts} />
      </div>
    </div>
  );
}

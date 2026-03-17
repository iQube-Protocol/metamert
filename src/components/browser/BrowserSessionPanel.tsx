import { useBrowser } from "@/contexts/BrowserContext";
import {
  PanelBottomClose,
  PanelBottomOpen,
  Download,
  Save,
  Hand,
  Play,
  Minus,
  Maximize2,
  X,
  History,
  FileText,
  Receipt,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrowserSessionPanel() {
  const {
    surfaceState,
    mountPayload,
    takeoverActive,
    drawerData,
    drawerOpen,
    actionStatus,
    toggleDrawer,
    requestExtract,
    requestSave,
    requestTakeover,
    requestResume,
    requestMinimize,
    requestExpand,
    requestClose,
  } = useBrowser();

  // Only show when a session is active (any non-collapsed, non-error state with a mount payload)
  if (!mountPayload) return null;
  const isActive = surfaceState !== "collapsed" && surfaceState !== "error";
  if (!isActive) return null;

  const historyCt = drawerData?.history.length ?? 0;
  const artifactsCt = drawerData?.artifacts.length ?? 0;
  const receiptsCt = drawerData?.receipts.length ?? 0;

  const extractRunning = actionStatus?.action === "extract" && actionStatus.status === "running";
  const saveRunning = actionStatus?.action === "save" && actionStatus.status === "running";

  return (
    <div className="flex items-center gap-1 border-t border-border bg-card px-2 py-1.5 font-[family-name:var(--font-display)]">
      {/* Drawer toggle + counts */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
        onClick={toggleDrawer}
      >
        {drawerOpen ? (
          <PanelBottomClose className="h-3.5 w-3.5" />
        ) : (
          <PanelBottomOpen className="h-3.5 w-3.5" />
        )}
        <span className="hidden sm:inline">{drawerOpen ? "Hide" : "Show"}</span>
      </Button>

      {/* Badge counts */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-0.5">
          <History className="h-3 w-3" /> {historyCt}
        </span>
        <span className="flex items-center gap-0.5">
          <FileText className="h-3 w-3" /> {artifactsCt}
        </span>
        <span className="flex items-center gap-0.5">
          <Receipt className="h-3 w-3" /> {receiptsCt}
        </span>
      </div>

      <div className="flex-1" />

      {/* Action controls */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        onClick={requestExtract}
        disabled={extractRunning}
      >
        {extractRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">Extract</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        onClick={requestSave}
        disabled={saveRunning}
      >
        {saveRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">Save</span>
      </Button>

      <div className="mx-1 h-4 w-px bg-border" />

      {/* Takeover / Resume */}
      {mountPayload.capabilities.canTakeover && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={takeoverActive ? requestResume : requestTakeover}
        >
          {takeoverActive ? (
            <>
              <Play className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Resume</span>
            </>
          ) : (
            <>
              <Hand className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Take Over</span>
            </>
          )}
        </Button>
      )}

      {/* Minimize / Expand */}
      {mountPayload.capabilities.canMinimize && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-1.5"
          onClick={surfaceState === "minimized" ? requestExpand : requestMinimize}
          aria-label={surfaceState === "minimized" ? "Expand" : "Minimize"}
        >
          {surfaceState === "minimized" ? (
            <Maximize2 className="h-3.5 w-3.5" />
          ) : (
            <Minus className="h-3.5 w-3.5" />
          )}
        </Button>
      )}

      {/* Close */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-1.5 hover:bg-destructive/10 hover:text-destructive"
        onClick={requestClose}
        aria-label="Close browser session"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

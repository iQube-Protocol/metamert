import { useState, useEffect } from "react";
import { useQubeTalk } from "@/hooks/use-qubetalk";
import type { QubeTalkThread } from "@/lib/qubetalk-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { checkAdminStatus, getDid } from "@/lib/aa-client";

const THREADS: QubeTalkThread[] = ["spec", "api-wiring", "ui-shell", "dev-exec", "ops"];

function ThreadPanel({ thread }: { thread: QubeTalkThread }) {
  const { messages, connected, loading, sendMessage } = useQubeTalk(thread);

  const handleTestMessage = async () => {
    try {
      await sendMessage({
        type: "status",
        thread,
        severity: "info",
        title: `Test from Lovable — ${thread}`,
        body: `Dev diagnostics test message at ${new Date().toISOString()}`,
        acceptance: ["Message appears in thread"],
        refs: { repo: "metame-runtime-shell", paths: [], endpoints: [], env: [] },
      });
      toast.success("Message sent");
    } catch (err: any) {
      toast.error(`Send failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-destructive"}`}
          />
          <span className="text-xs text-muted-foreground">
            {connected ? "Connected" : "Disconnected"} · {messages.length} messages
          </span>
        </div>
        <Button size="sm" variant="outline" onClick={handleTestMessage}>
          Send Test
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

      <div className="max-h-[60vh] space-y-2 overflow-y-auto">
        {messages.map((msg) => (
          <Card key={msg.message_id} className="border-border/50">
            <CardHeader className="py-2 px-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {msg.metadata?.title ?? msg.content}
                </CardTitle>
                <div className="flex gap-1">
                  {msg.metadata?.severity && (
                    <Badge
                      variant={
                        msg.metadata.severity === "blocker"
                          ? "destructive"
                          : msg.metadata.severity === "warn"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {msg.metadata.severity}
                    </Badge>
                  )}
                  <Badge variant="outline">{msg.type}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <p className="text-xs text-muted-foreground">
                {msg.from_agent?.label ?? msg.from_agent?.id ?? "unknown"} ·{" "}
                {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : "—"}
              </p>
              {msg.metadata?.body && (
                <p className="mt-1 text-sm">{msg.metadata.body}</p>
              )}
            </CardContent>
          </Card>
        ))}
        {!loading && messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No messages in #{thread}
          </p>
        )}
      </div>
    </div>
  );
}

const ADMIN_KEY = "dev-diag-auth";

function AdminGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(ADMIN_KEY) === "1");
  const [checking, setChecking] = useState(true);
  const [code, setCode] = useState("");

  // Auto-check admin status via AA-API persona/DID on mount
  useEffect(() => {
    if (authed) { setChecking(false); return; }

    let cancelled = false;
    (async () => {
      try {
        // If no DID cached yet (direct nav to /dev), auto-auth with dev DID
        let did = getDid();
        if (!did) {
          try {
            await authenticate("did:metame:dev-shell", async () => "dev-sig");
            did = getDid();
          } catch {
            console.warn("[AdminGate] dev auto-auth failed");
          }
        }
        if (did) {
          const result = await checkAdminStatus(did);
          if (!cancelled && result.is_admin) {
            sessionStorage.setItem(ADMIN_KEY, "1");
            setAuthed(true);
          }
        }
      } catch (err) {
        console.warn("[AdminGate] admin-check failed, falling back to code:", err);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authed]);

  if (authed) return <>{children}</>;

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Checking admin status…</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === "metame-dev-2026") {
      sessionStorage.setItem(ADMIN_KEY, "1");
      setAuthed(true);
    } else {
      toast.error("Invalid access code");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="text-lg">Admin Access Required</CardTitle>
          <p className="text-xs text-muted-foreground">
            Sign in with an admin persona, or enter an access code.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Access code"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              autoFocus
            />
            <Button type="submit" className="w-full" size="sm">
              Enter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DevDiagnostics() {
  const [activeThread, setActiveThread] = useState<QubeTalkThread>("ui-shell");

  return (
    <AdminGate>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <div>
            <h1 className="text-2xl font-bold">QubeTalk Diagnostics</h1>
            <p className="text-sm text-muted-foreground">
              Channel: <code>metame-runtime-thinclient</code>
            </p>
          </div>

          <Tabs
            value={activeThread}
            onValueChange={(v) => setActiveThread(v as QubeTalkThread)}
          >
            <TabsList className="w-full">
              {THREADS.map((t) => (
                <TabsTrigger key={t} value={t} className="flex-1 text-xs">
                  #{t}
                </TabsTrigger>
              ))}
            </TabsList>
            {THREADS.map((t) => (
              <TabsContent key={t} value={t}>
                <ThreadPanel thread={t} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </AdminGate>
  );
}

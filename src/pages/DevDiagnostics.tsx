import { useState } from "react";
import { useQubeTalk } from "@/hooks/use-qubetalk";
import type { QubeTalkThread } from "@/lib/qubetalk-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

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

export default function DevDiagnostics() {
  const [activeThread, setActiveThread] = useState<QubeTalkThread>("ui-shell");

  return (
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
  );
}

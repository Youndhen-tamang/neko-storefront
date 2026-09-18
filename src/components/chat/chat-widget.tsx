"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = { role: "user" | "assistant"; content: string };

export function ChatWidget({ brandName }: { brandName: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Ask me about live stock and products at ${brandName}.`,
    },
  ]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    const history = [...messages, { role: "user" as const, content: text }];
    setMessages(history);
    setInput("");
    setLoading(true);
    try {
      const data = await api<{ answer: string }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: text,
          history: history.slice(-8),
        }),
      });
      setMessages([...history, { role: "assistant", content: data.answer }]);
    } catch (error) {
      setMessages([
        ...history,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "Chat is unavailable right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 flex h-[440px] w-[340px] flex-col overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="text-sm font-medium">Store assistant</p>
              <p className="text-xs text-muted-foreground">Live product and stock answers</p>
            </div>
            <button onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === "user"
                    ? "ml-8 rounded-xl bg-primary px-3 py-2 text-primary-foreground"
                    : "mr-8 rounded-xl bg-muted px-3 py-2"
                }
              >
                {message.content}
              </div>
            ))}
            {loading && <p className="text-xs text-muted-foreground">Checking live inventory...</p>}
          </div>
          <form
            className="flex gap-2 border-t p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Is the oak chair in stock?"
            />
            <Button type="submit" disabled={loading}>
              Send
            </Button>
          </form>
        </div>
      )}
      <Button className="rounded-full px-4" onClick={() => setOpen((value) => !value)}>
        <MessageCircle className="h-4 w-4" />
        Ask stock
      </Button>
    </div>
  );
}

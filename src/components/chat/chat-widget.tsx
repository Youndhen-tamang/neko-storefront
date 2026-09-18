"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, RotateCcw, X } from "lucide-react";
import { api, getAgencySlug } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProductLink = { id: string; name: string; url: string; tryOnUrl: string };

type Message = {
  role: "user" | "assistant";
  content: string;
  checkoutUrl?: string;
  products?: ProductLink[];
};

type ChatResponse = {
  answer: string;
  checkoutUrl?: string;
  checkoutSessionId?: string;
  order?: { invoice_number: string };
  products?: ProductLink[];
};

function pathOf(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

const URL_RE = /https?:\/\/[^\s]+/gi;
const STRIPE_URL_RE = /https?:\/\/(?:checkout\.stripe\.com|buy\.stripe\.com)[^\s<]+/i;

function storageKeys(slug: string) {
  return {
    messages: `chat_messages_${slug}`,
    checkout: `chat_checkout_session_${slug}`,
  };
}

function greeting(brandName: string): Message {
  return {
    role: "assistant",
    content: `Ask me about live stock and products at ${brandName}. I can also take your details and send a payment link.`,
  };
}

function readJson<T>(key: string, store: "local" | "session" = "local"): T | null {
  try {
    const raw = (store === "local" ? localStorage : sessionStorage).getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function displayMessage(message: Message) {
  const stripeUrl = message.content.match(STRIPE_URL_RE)?.[0]?.replace(/[),.;]+$/, "");
  const checkoutUrl = message.checkoutUrl || stripeUrl;
  const text = message.content
    .replace(URL_RE, "")
    .replace(/Pay securely here:\s*/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { text, checkoutUrl };
}

const historyFrom = (messages: Message[]) =>
  messages.map((message) => ({
    role: message.role,
    content: displayMessage(message).text,
  }));

export function ChatWidget({ brandName }: { brandName: string }) {
  const slug = getAgencySlug();
  const keys = storageKeys(slug);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([greeting(brandName)]);
  const confirming = useRef(false);
  const chatEpoch = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  function scrollToLatest() {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => scrollToLatest());
    return () => cancelAnimationFrame(frame);
  }, [messages, loading, open]);

  useEffect(() => {
    if (!slug) {
      setHydrated(true);
      return;
    }

    const saved = readJson<Message[]>(keys.messages) ?? readJson<Message[]>(keys.messages, "session");
    const restored =
      Array.isArray(saved) && saved.length > 0 ? saved : [greeting(brandName)];
    const pending =
      localStorage.getItem(keys.checkout) || sessionStorage.getItem(keys.checkout) || undefined;
    setMessages(restored);
    setCheckoutSessionId(pending || undefined);

    const params = new URLSearchParams(window.location.search);
    const fromChat = params.get("from") === "chat";
    const urlSession = params.get("session_id");
    if (fromChat) setOpen(true);
    if (urlSession && (fromChat || pending)) {
      void confirmPayment(urlSession, restored);
    }

    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, brandName]);

  useEffect(() => {
    if (!hydrated || !slug) return;
    localStorage.setItem(keys.messages, JSON.stringify(messages));
  }, [hydrated, keys.messages, messages, slug]);

  useEffect(() => {
    if (!hydrated || !slug) return;
    if (checkoutSessionId) localStorage.setItem(keys.checkout, checkoutSessionId);
    else localStorage.removeItem(keys.checkout);
  }, [checkoutSessionId, hydrated, keys.checkout, slug]);

  async function sendToChat(payload: { message?: string; history: Message[]; checkoutSessionId?: string }) {
    const data = await api<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: payload.message,
        checkoutSessionId: payload.checkoutSessionId,
        history: historyFrom(payload.history).slice(-8),
      }),
    });
    if (data.checkoutSessionId) setCheckoutSessionId(data.checkoutSessionId);
    if (data.order) setCheckoutSessionId(undefined);
    return data;
  }

  async function confirmPayment(sessionId: string, history: Message[]) {
    if (confirming.current) return;
    if (history.some((message) => message.content.includes("Your order is confirmed"))) return;
    confirming.current = true;
    const epoch = chatEpoch.current;
    setOpen(true);
    setLoading(true);
    try {
      for (let attempt = 0; attempt < 5; attempt++) {
        if (epoch !== chatEpoch.current) return;
        const data = await sendToChat({ history, checkoutSessionId: sessionId });
        if (epoch !== chatEpoch.current) return;
        if (data.order) {
          setMessages([...history, { role: "assistant", content: data.answer }]);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    } catch {
      // webhook/confirm may still be in flight
    } finally {
      confirming.current = false;
      setLoading(false);
    }
  }

  function restartChat() {
    chatEpoch.current += 1;
    confirming.current = false;
    setLoading(false);
    setInput("");
    setCheckoutSessionId(undefined);
    setMessages([greeting(brandName)]);
    if (slug) {
      localStorage.removeItem(keys.messages);
      localStorage.removeItem(keys.checkout);
      sessionStorage.removeItem(keys.messages);
      sessionStorage.removeItem(keys.checkout);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text) return;
    const history = [...messages, { role: "user" as const, content: text }];
    const epoch = chatEpoch.current;
    setMessages(history);
    setInput("");
    setLoading(true);
    try {
      const data = await sendToChat({
        message: text,
        history,
        checkoutSessionId,
      });
      if (epoch !== chatEpoch.current) return;
      setMessages([
        ...history,
        {
          role: "assistant",
          content: data.answer,
          checkoutUrl: data.checkoutUrl,
          products: data.products?.length ? data.products : undefined,
        },
      ]);
    } catch (error) {
      if (epoch !== chatEpoch.current) return;
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
              <p className="text-xs text-muted-foreground">Shop, pay, and track your order here</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Restart chat"
                aria-label="Restart chat"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={restartChat}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button type="button" title="Close chat" aria-label="Close chat" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.map((message, index) => {
              const { text, checkoutUrl } = displayMessage(message);
              return (
                <div
                  key={index}
                  className={
                    message.role === "user"
                      ? "ml-8 overflow-hidden rounded-xl bg-primary px-3 py-2 text-primary-foreground"
                      : "mr-8 overflow-hidden rounded-xl bg-muted px-3 py-2"
                  }
                >
                  {text && <p className="whitespace-pre-wrap break-words">{text}</p>}
                  {message.products?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {message.products.map((product) => (
                        <span key={product.id} className="inline-flex overflow-hidden rounded-full border bg-background text-xs">
                          <Link href={pathOf(product.url)} className="px-2.5 py-1 hover:bg-muted">
                            {product.name}
                          </Link>
                          <Link
                            href={pathOf(product.tryOnUrl)}
                            className="border-l px-2.5 py-1 text-muted-foreground hover:bg-muted"
                            title="See it on you"
                          >
                            Try on
                          </Link>
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {checkoutUrl && (
                    <a
                      href={checkoutUrl}
                      className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90"
                    >
                      Pay securely
                    </a>
                  )}
                </div>
              );
            })}
            {loading && <p className="text-xs text-muted-foreground">Checking live inventory...</p>}
            <div ref={bottomRef} />
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
              placeholder="I'd like the silk slip dress"
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Mic, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { A11yWelcome } from "@/components/chat/a11y-welcome";
import { useShop } from "@/components/shop/shop-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Order, api, getAgencySlug } from "@/lib/api";
import { downloadOrderReceipt } from "@/lib/receipt-pdf";
import {
  CHAT_OPEN_EVENT,
  CHAT_RECEIPT_EVENT,
  cancelListening,
  ensureMicrophone,
  isAffirmative,
  isNegative,
  listenForSpeech,
  listenOnce,
  speak,
  speechSupported,
  stopSpeaking,
} from "@/lib/speech";

type ProductLink = { id: string; name: string; url: string; tryOnUrl: string; price_cents?: number };

type PendingCheckout = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  items: { productId?: string; productName?: string; quantity: number }[];
};

type Message = {
  role: "user" | "assistant";
  content: string;
  checkoutUrl?: string;
  products?: ProductLink[];
  pendingCheckout?: PendingCheckout;
};

type ChatResponse = {
  answer: string;
  checkoutUrl?: string;
  checkoutSessionId?: string;
  order?: { invoice_number: string };
  products?: ProductLink[];
  pendingCheckout?: PendingCheckout;
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
const VOICE_KEY = "store_chat_voice";

function storageKeys(slug: string) {
  return {
    messages: `chat_messages_${slug}`,
    checkout: `chat_checkout_session_${slug}`,
    welcome: `a11y_welcome_${slug}`,
  };
}

function greeting(brandName: string): Message {
  return {
    role: "assistant",
    content: `Hi, how can we help you at ${brandName}? Ask me anything. Whenever you want, I can also read live inventory and place a dress order for you. I never ask for card numbers here.`,
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

function lastPending(messages: Message[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].pendingCheckout) return messages[index].pendingCheckout;
  }
  return undefined;
}

function lastCheckoutUrl(messages: Message[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const url = displayMessage(messages[index]).checkoutUrl;
    if (url) return url;
  }
  return undefined;
}

export function ChatWidget({ brandName }: { brandName: string }) {
  const slug = getAgencySlug();
  const keys = storageKeys(slug);
  const pathname = usePathname();
  const { branding } = useShop();
  const [open, setOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [behalf, setBehalf] = useState("");
  const [checkoutSessionId, setCheckoutSessionId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([greeting(brandName)]);
  const confirming = useRef(false);
  const chatEpoch = useRef(0);
  const skipAutoPay = useRef(true);
  const openedPay = useRef("");
  const receiptOrder = useRef<Order | null>(null);
  const listenGen = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  function scrollToLatest() {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }

  function markWelcomeDone() {
    localStorage.setItem("a11y_welcome", "done");
    if (slug) localStorage.setItem(keys.welcome, "done");
    setShowWelcome(false);
  }

  async function actOnBehalf(note: string) {
    setBehalf(note);
    setLiveText(note);
    await speak(note);
  }

  useEffect(() => {
    setVoiceReady(speechSupported());
    setVoiceOn(localStorage.getItem(VOICE_KEY) === "on");
  }, []);

  useEffect(() => {
    function onOpen() {
      setShowWelcome(false);
      setOpen(true);
    }
    window.addEventListener(CHAT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CHAT_OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) {
      listenGen.current += 1;
      cancelListening();
      stopSpeaking();
      return;
    }
    const frame = requestAnimationFrame(() => {
      scrollToLatest();
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [messages, loading, open, behalf]);

  useEffect(() => {
    if (!slug) {
      setHydrated(true);
      return;
    }

    const saved = readJson<Message[]>(keys.messages) ?? readJson<Message[]>(keys.messages, "session");
    const restored = Array.isArray(saved) && saved.length > 0 ? saved : [greeting(brandName)];
    const pending =
      localStorage.getItem(keys.checkout) || sessionStorage.getItem(keys.checkout) || undefined;
    setMessages(restored);
    setCheckoutSessionId(pending || undefined);
    openedPay.current = lastCheckoutUrl(restored) || "";

    const params = new URLSearchParams(window.location.search);
    const fromChat = params.get("from") === "chat";
    const urlSession = params.get("session_id");
    if (fromChat) setOpen(true);
    if (urlSession && (fromChat || pending)) {
      void confirmPayment(urlSession, restored);
    }

    skipAutoPay.current = true;
    setHydrated(true);
    window.setTimeout(() => {
      skipAutoPay.current = false;
    }, 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, brandName, pathname]);

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/checkout/success")) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("from") === "chat") return;
    if (params.get("a11y") === "1") {
      setShowWelcome(true);
      return;
    }
    const welcomeKey = slug ? keys.welcome : "a11y_welcome";
    if (localStorage.getItem(welcomeKey) !== "done") setShowWelcome(true);
  }, [keys.welcome, pathname, slug]);

  useEffect(() => {
    if (!showWelcome) return;
    void speak(
      "A spoken shop assistant is available. Ask anything you like. I will open it on your behalf in 3 seconds if you do nothing."
    );
    const timer = window.setTimeout(() => {
      void acceptWelcome();
    }, 3000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showWelcome]);

  useEffect(() => {
    setMessages((current) => {
      if (current.length === 1 && current[0].role === "assistant") {
        return [greeting(brandName)];
      }
      return current;
    });
  }, [brandName]);

  useEffect(() => {
    if (!hydrated || !slug) return;
    localStorage.setItem(keys.messages, JSON.stringify(messages));
  }, [hydrated, keys.messages, messages, slug]);

  useEffect(() => {
    if (!hydrated || !slug) return;
    if (checkoutSessionId) localStorage.setItem(keys.checkout, checkoutSessionId);
    else localStorage.removeItem(keys.checkout);
  }, [checkoutSessionId, hydrated, keys.checkout, slug]);

  useEffect(() => {
    const url = lastCheckoutUrl(messages);
    if (!url || skipAutoPay.current || openedPay.current === url) return;
    openedPay.current = url;
    void (async () => {
      await actOnBehalf(
        "I'm opening the Stripe payment page on your behalf. Use Apple Pay, Google Pay, Link, or a card. I never ask for your card number here."
      );
      window.location.href = url;
    })();
  }, [messages]);

  useEffect(() => {
    async function onReceipt(event: Event) {
      const order = (event as CustomEvent<{ order: Order }>).detail?.order;
      if (!order) return;
      receiptOrder.current = order;
      markWelcomeDone();
      setOpen(true);
      const thanks = `Thank you for ordering, sir or ma'am. Your order ${order.invoice_number} is confirmed. Should I download the receipt for you? Say yes or no.`;
      setMessages((current) => [...current, { role: "assistant", content: thanks }]);
      setLiveText(thanks);
      await speak(thanks);
      setListening(true);
      const answer = await listenForSpeech({ idleMs: 12000, pauseMs: 1800 });
      setListening(false);
      if (answer && isAffirmative(answer)) {
        setMessages((current) => [...current, { role: "user", content: answer }]);
        await actOnBehalf("I'm downloading the receipt on your behalf.");
        try {
          await downloadOrderReceipt(order, branding);
          const done = "The receipt PDF is downloading now.";
          setMessages((current) => [...current, { role: "assistant", content: done }]);
          await speak(done);
        } catch {
          const fail = "I couldn't create the PDF. There is a Download receipt button on this page.";
          setMessages((current) => [...current, { role: "assistant", content: fail }]);
          await speak(fail);
        }
      } else if (answer && isNegative(answer)) {
        setMessages((current) => [
          ...current,
          { role: "user", content: answer },
          { role: "assistant", content: "Okay. You can download the receipt from this page anytime." },
        ]);
        await speak("Okay. You can download the receipt from this page anytime.");
      }
    }
    window.addEventListener(CHAT_RECEIPT_EVENT, onReceipt);
    return () => window.removeEventListener(CHAT_RECEIPT_EVENT, onReceipt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branding, keys.welcome, slug]);

  async function sendToChat(payload: {
    message?: string;
    history: Message[];
    checkoutSessionId?: string;
    pendingCheckout?: PendingCheckout;
  }) {
    const data = await api<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: payload.message,
        checkoutSessionId: payload.checkoutSessionId,
        pendingCheckout: payload.pendingCheckout,
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
          const next = [...history, { role: "assistant" as const, content: data.answer }];
          setMessages(next);
          announce(data.answer, true);
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

  function announce(text: string, allowSpeak: boolean) {
    setLiveText(text);
    if (allowSpeak) void speak(text);
  }

  async function listenAfterAssistant() {
    if (!speechSupported() || loading) return;
    const gen = ++listenGen.current;
    stopSpeaking();
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    if (gen !== listenGen.current) return;

    const denied = await ensureMicrophone();
    if (gen !== listenGen.current) return;
    if (denied) {
      setLiveText(denied);
      await speak(denied);
      return;
    }

    setListening(true);
    setLiveText("I'm listening. Please speak.");
    const transcript = await listenForSpeech({
      idleMs: 12000,
      pauseMs: 1800,
      onPartial: (text) => {
        if (gen === listenGen.current) setInput(text);
      },
    });
    if (gen !== listenGen.current) return;
    setListening(false);
    if (transcript) {
      setVoiceOn(true);
      localStorage.setItem(VOICE_KEY, "on");
      await send(transcript);
      return;
    }
    const note = "I didn't catch that. Tap the microphone and speak again.";
    setLiveText(note);
    await speak(note);
  }

  async function acceptWelcome() {
    markWelcomeDone();
    setOpen(true);
    setVoiceOn(true);
    localStorage.setItem(VOICE_KEY, "on");
    const hello = greeting(brandName);
    setMessages([hello]);
    await actOnBehalf("I'm opening the shop assistant on your behalf.");
    await speak(hello.content);
    await listenAfterAssistant();
  }

  function dismissWelcome() {
    markWelcomeDone();
    stopSpeaking();
  }

  function restartChat() {
    chatEpoch.current += 1;
    listenGen.current += 1;
    cancelListening();
    confirming.current = false;
    setLoading(false);
    setInput("");
    setCheckoutSessionId(undefined);
    stopSpeaking();
    const next = [greeting(brandName)];
    setMessages(next);
    announce(next[0].content, true);
    if (slug) {
      localStorage.removeItem(keys.messages);
      localStorage.removeItem(keys.checkout);
      sessionStorage.removeItem(keys.messages);
      sessionStorage.removeItem(keys.checkout);
    }
  }

  function toggleVoice() {
    const next = !voiceOn;
    setVoiceOn(next);
    localStorage.setItem(VOICE_KEY, next ? "on" : "off");
    if (!next) stopSpeaking();
    else {
      const latest = [...messages].reverse().find((message) => message.role === "assistant");
      if (latest) void speak(displayMessage(latest).text);
    }
  }

  async function send(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text) return;
    const history = [...messagesRef.current, { role: "user" as const, content: text }];
    const epoch = chatEpoch.current;
    setMessages(history);
    setInput("");
    setLoading(true);
    setLiveText("Answering your question.");
    listenGen.current += 1;
    cancelListening();
    stopSpeaking();
    try {
      const data = await sendToChat({
        message: text,
        history,
        checkoutSessionId,
        pendingCheckout: lastPending(messagesRef.current),
      });
      if (epoch !== chatEpoch.current) return;
      const assistant: Message = {
        role: "assistant",
        content: data.answer,
        checkoutUrl: data.checkoutUrl,
        products: data.products?.length ? data.products : undefined,
        pendingCheckout: data.pendingCheckout,
      };
      setMessages([...history, assistant]);
      setLoading(false);
      const spokenReply = displayMessage(assistant).text;
      announce(spokenReply, false);
      await speak(spokenReply);
      if (epoch !== chatEpoch.current) return;
      if (!data.checkoutUrl && speechSupported()) {
        await listenAfterAssistant();
      }
    } catch (error) {
      if (epoch !== chatEpoch.current) return;
      const fallback = error instanceof Error ? error.message : "Chat is unavailable right now.";
      setMessages([...history, { role: "assistant", content: fallback }]);
      announce(fallback, true);
    } finally {
      setLoading(false);
    }
  }

  async function startListening() {
    if (loading) return;
    const gen = ++listenGen.current;
    cancelListening();
    stopSpeaking();
    setListening(true);
    setLiveText("I'm listening. Please speak.");
    try {
      const denied = await ensureMicrophone();
      if (gen !== listenGen.current) return;
      if (denied) {
        setLiveText(denied);
        await speak(denied);
        return;
      }
      const transcript = await listenOnce((text) => {
        if (gen === listenGen.current) setInput(text);
      });
      if (gen !== listenGen.current) return;
      if (transcript) {
        setVoiceOn(true);
        localStorage.setItem(VOICE_KEY, "on");
        setInput(transcript);
        await send(transcript);
      }
    } catch (error) {
      if (gen !== listenGen.current) return;
      const fallback = error instanceof Error ? error.message : "Voice input failed.";
      setLiveText(fallback);
      await speak(fallback);
    } finally {
      if (gen === listenGen.current) setListening(false);
    }
  }

  const pending = lastPending(messages);

  return (
    <>
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {liveText}
      </div>
      {showWelcome && (
        <A11yWelcome brandName={brandName} onAccept={() => void acceptWelcome()} onDismiss={dismissWelcome} />
      )}
      <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div
          id="store-assistant"
          role="dialog"
          aria-modal="false"
          aria-labelledby="store-assistant-title"
          className="mb-3 flex h-[min(560px,calc(100vh-7rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p id="store-assistant-title" className="text-sm font-medium">
                Store assistant
              </p>
              <p className="text-xs text-muted-foreground">Speak or type. We never take card numbers here.</p>
            </div>
            <div className="flex items-center gap-1">
              {voiceReady && (
                <button
                  type="button"
                  title={voiceOn ? "Stop speaking replies" : "Speak replies"}
                  aria-pressed={voiceOn}
                  aria-label={voiceOn ? "Turn off spoken replies" : "Turn on spoken replies"}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={toggleVoice}
                >
                  {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
              )}
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
          {behalf && (
            <p className="border-b bg-muted/60 px-4 py-2 text-xs text-muted-foreground" aria-live="polite">
              {behalf}
            </p>
          )}
          <div
            ref={listRef}
            role="log"
            aria-relevant="additions"
            className="flex-1 space-y-3 overflow-y-auto p-4 text-sm"
          >
            {messages.map((message, index) => {
              const { text, checkoutUrl } = displayMessage(message);
              return (
                <div
                  key={index}
                  className={
                    message.role === "user"
                      ? "ml-8 overflow-hidden rounded-xl bg-primary px-3 py-2 text-primary-foreground"
                      : "mr-6 overflow-hidden rounded-xl bg-muted px-3 py-2"
                  }
                >
                  {text && <p className="whitespace-pre-wrap break-words">{text}</p>}
                  {message.products?.length ? (
                    <ol className="mt-2 space-y-1.5">
                      {message.products.map((product, productIndex) => (
                        <li key={product.id} className="overflow-hidden rounded-lg border bg-background text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5">
                            <span>
                              {productIndex + 1}. {product.name}
                            </span>
                            <span className="flex overflow-hidden rounded-full border">
                              <Link href={pathOf(product.url)} className="px-2 py-1 hover:bg-muted">
                                Details
                              </Link>
                              <Link
                                href={pathOf(product.tryOnUrl)}
                                className="border-l px-2 py-1 text-muted-foreground hover:bg-muted"
                              >
                                Try on
                              </Link>
                            </span>
                          </div>
                          <button
                            type="button"
                            className="w-full border-t px-2.5 py-1.5 text-left hover:bg-muted"
                            onClick={() => {
                              void actOnBehalf(`I'm choosing number ${productIndex + 1} on your behalf.`);
                              void send(String(productIndex + 1));
                            }}
                          >
                            Say {productIndex + 1} for this piece
                          </button>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                  {message.pendingCheckout && (
                    <div className="mt-3 grid gap-2">
                      <Button
                        type="button"
                        className="w-full"
                        onClick={() => {
                          void actOnBehalf("I'm placing the order on your behalf.");
                          void send("place order");
                        }}
                      >
                        Place order
                      </Button>
                      <Button type="button" variant="outline" className="w-full" onClick={() => void send("change")}>
                        Change details
                      </Button>
                    </div>
                  )}
                  {checkoutUrl && (
                    <div className="mt-3 space-y-2">
                      <a
                        href={checkoutUrl}
                        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90"
                      >
                        Pay on Stripe
                      </a>
                      <p className="text-xs text-muted-foreground">
                        I open this page for you. Use Apple Pay, Google Pay, Link, or a card.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            {loading && <p className="text-xs text-muted-foreground">Answering your question...</p>}
            {listening && <p className="text-xs text-muted-foreground">Listening… speak when you are ready.</p>}
          </div>
          <form
            className="space-y-2 border-t p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            {pending && (
              <p className="text-xs text-muted-foreground">
                Order is ready to confirm. Say place order, or I can tap it for you.
              </p>
            )}
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="store-assistant-input">
                Message the store assistant
              </label>
              <Input
                id="store-assistant-input"
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask anything, or say what you'd like to order"
                autoComplete="off"
              />
              {voiceReady && (
                <Button
                  type="button"
                  variant={listening ? "default" : "outline"}
                  size="icon"
                  aria-label={listening ? "Listening" : "Speak your message"}
                  aria-pressed={listening}
                  disabled={loading}
                  onClick={() => void startListening()}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              )}
              <Button type="submit" disabled={loading || !input.trim()}>
                Send
              </Button>
            </div>
          </form>
        </div>
      )}
      <Button
        className="rounded-full px-4"
        aria-expanded={open}
        aria-controls="store-assistant"
        onClick={() => {
          setShowWelcome(false);
          setOpen((value) => !value);
        }}
      >
        <MessageCircle className="h-4 w-4" />
        Ask shop
      </Button>
      </div>
    </>
  );
}

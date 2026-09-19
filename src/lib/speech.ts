import { API_URL, Order, getAgencySlug } from "@/lib/api";

export const CHAT_OPEN_EVENT = "store-chat-open";
export const CHAT_RECEIPT_EVENT = "store-chat-receipt";

export function openStoreChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHAT_OPEN_EVENT));
}

export function offerReceipt(order: Order) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHAT_RECEIPT_EVENT, { detail: { order } }));
}

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives?: number;
  onresult: ((event: {
    resultIndex?: number;
    results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }>;
  }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

let listenSession = 0;
let activeRecognition: SpeechRecognitionLike | null = null;

export function cancelListening() {
  listenSession += 1;
  const current = activeRecognition;
  activeRecognition = null;
  try {
    current?.stop();
  } catch {
    // already stopped
  }
}

export async function ensureMicrophone(): Promise<string | null> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return "This browser cannot use the microphone.";
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return null;
  } catch {
    return "Please allow the microphone, then tap the microphone button and speak.";
  }
}

function RecognitionCtor() {
  const speechWindow = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition || null;
}

export function speechSupported() {
  return typeof window !== "undefined" && Boolean(RecognitionCtor());
}

export function listenOnce(onPartial?: (text: string) => void): Promise<string> {
  return listenForSpeech({ idleMs: 12000, pauseMs: 2000, onPartial }).then((text) => {
    if (!text) throw new Error("I couldn't hear that. Tap the microphone and try again.");
    return text;
  });
}

function normalizeHeard(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\bma\s*a?m\b/g, "mam")
    .replace(/\s+/g, " ")
    .trim();
}

const CHOICE_WORDS: Record<string, string> = {
  "1": "1",
  one: "1",
  won: "1",
  "2": "2",
  two: "2",
  too: "2",
  "3": "3",
  three: "3",
  tree: "3",
  "4": "4",
  four: "4",
  "5": "5",
  five: "5",
};

export function extractSpokenChoice(text: string): string | null {
  const tokens = normalizeHeard(text).split(" ").filter(Boolean);
  if (!tokens.length) return null;
  const mapped = tokens.map((token) => CHOICE_WORDS[token]).filter(Boolean);
  if (mapped.length && mapped.length === tokens.length) return mapped[mapped.length - 1];
  if (/^(say|number|option|the)$/.test(tokens[0]) && mapped.length === tokens.length - 1 && mapped.length) {
    return mapped[mapped.length - 1];
  }
  return null;
}

export function looksLikeEcho(transcript: string, spoken: string, opts?: { strict?: boolean }) {
  const heard = normalizeHeard(transcript);
  const source = normalizeHeard(spoken);
  if (!heard) return true;
  if (!source) return false;

  const bareChoice = Boolean(extractSpokenChoice(heard) && heard.split(" ").length <= 2 && !/^yes|ok/.test(heard));
  if (bareChoice) return false;

  if (/^yes mam$/.test(heard) && source.includes("yes mam")) return true;
  if (source.startsWith(heard) && heard.split(" ").length >= 2) return true;
  if (opts?.strict && source.startsWith(heard)) return true;
  if (heard.length >= 12 && source.includes(heard)) return true;
  return false;
}

function resultTranscript(result: ArrayLike<{ transcript: string }> | undefined) {
  return result?.[0]?.transcript?.trim() || "";
}

function joinHeard(...parts: string[]) {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function listenForSpeech(options?: {
  idleMs?: number;
  speechMs?: number;
  pauseMs?: number;
  holdWhile?: () => boolean;
  isNoise?: (text: string) => boolean;
  onHeard?: (text: string) => void;
  onPartial?: (text: string) => void;
}): Promise<string | null> {
  const idleMs = options?.idleMs ?? 12000;
  const pauseMs = options?.pauseMs ?? options?.speechMs ?? 2000;

  return new Promise((resolve) => {
    const Ctor = RecognitionCtor();
    if (!Ctor) {
      resolve(null);
      return;
    }

    const session = ++listenSession;
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    activeRecognition = recognition;

    let settled = false;
    const finals: string[] = [];
    let spoken = "";
    let keepUntil = 0;
    let idleTimer: number | undefined;
    let pauseTimer: number | undefined;

    function finish(value: string | null) {
      if (settled) return;
      settled = true;
      window.clearTimeout(idleTimer);
      window.clearTimeout(pauseTimer);
      if (activeRecognition === recognition) activeRecognition = null;
      try {
        recognition.stop();
      } catch {
        // already stopped
      }
      resolve(session === listenSession ? value?.trim() || null : null);
    }

    function stillWaiting() {
      return Boolean(options?.holdWhile?.()) || keepUntil === 0 || Date.now() < keepUntil;
    }

    function armIdle() {
      window.clearTimeout(idleTimer);
      if (options?.holdWhile?.()) {
        keepUntil = 0;
        idleTimer = window.setTimeout(armIdle, 400);
        return;
      }
      if (!keepUntil) keepUntil = Date.now() + idleMs;
      idleTimer = window.setTimeout(() => finish(spoken || null), Math.max(250, keepUntil - Date.now()));
    }

    function skipPiece(piece: string) {
      const speaking = Boolean(options?.holdWhile?.());
      if (!speaking) return false;
      const promptEcho = /^say\b/i.test(normalizeHeard(piece)) && piece.split(/\s+/).length > 2;
      return promptEcho || Boolean(options?.isNoise?.(piece));
    }

    recognition.onresult = (event) => {
      if (session !== listenSession) return;
      const start = event.resultIndex ?? 0;
      const interims: string[] = [];
      for (let i = start; i < event.results.length; i++) {
        const piece = resultTranscript(event.results[i]);
        if (!piece || skipPiece(piece)) continue;
        if (event.results[i].isFinal) {
          if (finals[finals.length - 1] !== piece) finals.push(piece);
        } else {
          interims.push(piece);
        }
      }
      const heard = joinHeard(...finals, ...interims);
      if (!heard) return;

      const choice = extractSpokenChoice(heard);
      spoken = choice ?? heard;
      options?.onHeard?.(spoken);
      options?.onPartial?.(spoken);
      window.clearTimeout(idleTimer);
      window.clearTimeout(pauseTimer);
      if (choice) {
        finish(choice);
        return;
      }
      pauseTimer = window.setTimeout(() => finish(spoken), pauseMs);
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      finish(spoken || null);
    };

    recognition.onend = () => {
      if (settled) return;
      if (session !== listenSession) {
        finish(null);
        return;
      }
      if (stillWaiting() || spoken) {
        try {
          recognition.start();
          return;
        } catch {
          window.setTimeout(() => {
            if (settled || session !== listenSession) return;
            try {
              recognition.start();
            } catch {
              finish(spoken || null);
            }
          }, 250);
        }
        return;
      }
      finish(spoken || null);
    };

    armIdle();
    try {
      recognition.start();
    } catch {
      finish(null);
    }
  });
}

let currentAudio: HTMLAudioElement | null = null;
let speaking = false;
let speakDone: (() => void) | null = null;

function endSpeak() {
  speaking = false;
  const done = speakDone;
  speakDone = null;
  done?.();
}

export function isSpeaking() {
  return speaking || Boolean(currentAudio && !currentAudio.paused);
}

async function speakBackend(text: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/api/tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(getAgencySlug() ? { "X-Agency-Slug": getAgencySlug() } : {}),
    },
    body: JSON.stringify({ text: text.slice(0, 500) }),
  });
  if (!response.ok) return false;

  const blob = await response.blob();
  if (!blob.size || !speaking) return false;

  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.playbackRate = 1.2;
  currentAudio = audio;

  return new Promise((resolve) => {
    let settled = false;
    const done = (ok: boolean) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      if (currentAudio === audio) currentAudio = null;
      resolve(ok);
    };
    audio.onended = () => done(true);
    audio.onerror = () => done(false);
    audio.onpause = () => {
      if (!audio.ended) done(true);
    };
    void audio.play().then(
      () => undefined,
      () => done(false)
    );
  });
}

export async function speak(text: string): Promise<void> {
  const spoken = text.trim();
  if (!spoken || typeof window === "undefined") return;
  stopSpeaking();
  speaking = true;
  const finished = new Promise<void>((resolve) => {
    speakDone = resolve;
  });
  try {
    await speakBackend(spoken);
  } catch {
    // Keep a single backend voice; do not fall back to the browser.
  } finally {
    endSpeak();
  }
  await finished;
}

export async function speakAndListen(
  text: string,
  options?: { onPartial?: (text: string) => void }
): Promise<string | null> {
  const denied = await ensureMicrophone();
  if (denied) {
    await speak(denied);
    return null;
  }

  let echoUntil = 0;
  const stillEchoing = () => isSpeaking() || Date.now() < echoUntil;
  const listen = listenForSpeech({
    idleMs: 12000,
    pauseMs: 2000,
    holdWhile: stillEchoing,
    isNoise: (heard) => looksLikeEcho(heard, text, { strict: stillEchoing() }),
    onHeard: () => stopSpeaking(),
    onPartial: options?.onPartial,
  });

  await new Promise((resolve) => window.setTimeout(resolve, 80));
  await speak(text);
  echoUntil = Date.now() + 800;
  const transcript = await listen;
  if (transcript && looksLikeEcho(transcript, text, { strict: stillEchoing() })) return null;
  return transcript;
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
  endSpeak();
}

export function isAffirmative(text: string) {
  return /^(yes|yeah|yep|yup|please|download|ok|okay|sure|do it|go ahead)\b/i.test(text.trim());
}

export function isNegative(text: string) {
  return /^(no|nope|not now|don't|do not|skip)\b/i.test(text.trim());
}

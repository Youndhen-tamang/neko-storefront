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
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

let listenSession = 0;

export function cancelListening() {
  listenSession += 1;
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
  return typeof window !== "undefined" && Boolean(RecognitionCtor() && window.speechSynthesis);
}

export function listenOnce(onPartial?: (text: string) => void): Promise<string> {
  return listenForSpeech({ idleMs: 12000, pauseMs: 1800, onPartial }).then((text) => {
    if (!text) throw new Error("I couldn't hear that. Tap the microphone and try again.");
    return text;
  });
}

export function listenForSpeech(options?: {
  idleMs?: number;
  speechMs?: number;
  pauseMs?: number;
  onPartial?: (text: string) => void;
}): Promise<string | null> {
  const idleMs = options?.idleMs ?? 12000;
  const pauseMs = options?.pauseMs ?? options?.speechMs ?? 1800;

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

    let settled = false;
    let spoken = "";
    let idleTimer: number | undefined;
    let pauseTimer: number | undefined;
    const deadline = Date.now() + idleMs;

    function finish(value: string | null) {
      if (settled) return;
      settled = true;
      window.clearTimeout(idleTimer);
      window.clearTimeout(pauseTimer);
      try {
        recognition.stop();
      } catch {
        // already stopped
      }
      resolve(session === listenSession ? value?.trim() || null : null);
    }

    function armIdle() {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => finish(spoken || null), Math.max(250, deadline - Date.now()));
    }

    recognition.onresult = (event) => {
      if (session !== listenSession) return;
      spoken = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();
      if (!spoken) return;
      options?.onPartial?.(spoken);
      window.clearTimeout(idleTimer);
      window.clearTimeout(pauseTimer);
      pauseTimer = window.setTimeout(() => finish(spoken), pauseMs);
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      finish(spoken || null);
    };

    recognition.onend = () => {
      if (settled || session !== listenSession) return;
      if (spoken.trim()) {
        finish(spoken);
        return;
      }
      if (Date.now() < deadline) {
        try {
          recognition.start();
          return;
        } catch {
          finish(null);
          return;
        }
      }
      finish(null);
    };

    armIdle();
    try {
      recognition.start();
    } catch {
      finish(null);
    }
  });
}

const FEMALE_NAMES = [
  "samantha",
  "victoria",
  "karen",
  "moira",
  "fiona",
  "tessa",
  "zira",
  "susan",
  "linda",
  "heera",
  "hazel",
  "serena",
  "kate",
  "nicky",
  "siri",
  "flo",
  "jane",
  "allison",
  "ava",
  "susan",
];

const MALE_NAMES = [
  "alex",
  "daniel",
  "fred",
  "tom",
  "david",
  "mark",
  "george",
  "james",
  "oliver",
  "ralph",
  "bruce",
  "aaron",
  "albert",
  "junior",
  "rishi",
  "thomas",
];

function voicesReady(): Promise<SpeechSynthesisVoice[]> {
  const existing = window.speechSynthesis.getVoices();
  if (existing.length) return Promise.resolve(existing);
  return new Promise((resolve) => {
    const finish = () => resolve(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener("voiceschanged", finish, { once: true });
    window.setTimeout(finish, 400);
  });
}

function pickFemaleVoice(voices: SpeechSynthesisVoice[]) {
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const pool = english.length ? english : voices;

  const scored = pool
    .map((voice) => {
      const name = voice.name.toLowerCase();
      let score = 0;
      if (FEMALE_NAMES.some((item) => name.includes(item))) score += 6;
      if (/\bfemale\b|\bwoman\b/.test(name)) score += 8;
      if (voice.lang.toLowerCase().startsWith("en-us")) score += 2;
      if (voice.localService) score += 1;
      if (MALE_NAMES.some((item) => name.includes(item)) || /\bmale\b|\bman\b/.test(name)) score -= 10;
      return { voice, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.find((item) => item.score > 0)?.voice ?? null;
}

let currentAudio: HTMLAudioElement | null = null;

function speakBrowser(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) {
      resolve();
      return;
    }

    void voicesReady().then((voices) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickFemaleVoice(voices);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
        utterance.pitch = 1.05;
      } else {
        utterance.lang = "en-US";
        utterance.pitch = 1.25;
      }
      utterance.rate = 0.98;
      utterance.volume = 1;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  });
}

async function speakElevenLabs(text: string): Promise<boolean> {
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
  if (!blob.size) return false;

  stopSpeaking();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  currentAudio = audio;

  return new Promise((resolve) => {
    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (currentAudio === audio) currentAudio = null;
      resolve(true);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      if (currentAudio === audio) currentAudio = null;
      resolve(false);
    };
    void audio.play().then(
      () => undefined,
      () => resolve(false)
    );
  });
}

export async function speak(text: string): Promise<void> {
  const spoken = text.trim();
  if (!spoken || typeof window === "undefined") return;
  try {
    if (await speakElevenLabs(spoken)) return;
  } catch {
    // Use the browser voice if ElevenLabs is unset or failing.
  }
  await speakBrowser(spoken);
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
}

export function isAffirmative(text: string) {
  return /^(yes|yeah|yep|yup|please|download|ok|okay|sure|do it|go ahead)\b/i.test(text.trim());
}

export function isNegative(text: string) {
  return /^(no|nope|not now|don't|do not|skip)\b/i.test(text.trim());
}

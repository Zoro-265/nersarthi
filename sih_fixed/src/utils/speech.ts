import { LanguageCode } from '../types';

const LANG_CODE_MAP: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  as: 'as-IN',
  bn: 'bn-IN',
  pa: 'pa-IN',
  gu: 'gu-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  or: 'or-IN',
  ur: 'ur-IN',
  ne: 'ne-NP',
  brx: 'hi-IN',
  mni: 'hi-IN',
  mzo: 'en-IN',
  mai: 'hi-IN',
  doi: 'hi-IN',
  ks: 'ur-IN',
  kok: 'mr-IN',
  sd: 'hi-IN',
  sat: 'hi-IN',
  sa: 'hi-IN',
  kha: 'en-IN',
  grt: 'en-IN',
};

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
}

export function speakSpeech(
  text: string,
  lang: LanguageCode = 'en',
  rate: number = 1.0,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this browser');
    if (onStart) onStart();
    setTimeout(() => {
      if (onEnd) onEnd();
    }, 2000);
    return;
  }

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG_CODE_MAP[lang] || 'en-IN';
  utterance.rate = Math.max(0.5, Math.min(rate, 1.5));
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('Speech error', e);
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function triggerVibration(pattern: number[] = [200, 100, 200]) {
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors on unsupported environments
    }
  }
}

let japaneseVoice: SpeechSynthesisVoice | null = null;

export function initJapaneseVoice(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    japaneseVoice =
      voices.find((v) => v.lang === "ja-JP" || v.lang.startsWith("ja")) ||
      voices[0] ||
      null;
  };

  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

export function speakJapanese(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.7;
    utterance.pitch = 1;
    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    }
    window.speechSynthesis.speak(utterance);
  } catch {
  }
}

export function speakRomaji(romaji: string): void {
  speakJapanese(romaji);
}

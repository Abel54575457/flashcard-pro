export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakWord(
  text: string,
  rate: number = 1.0,
  pitch: number = 1.0,
  lang: string = 'en-US'
): void {
  if (!isTTSSupported()) {
    console.warn('Web Speech API is not supported in this browser.');
    return;
  }

  // 先停止前一次尚未播放完畢的聲音
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;

  // 嘗試獲取美式英語語音包
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(
    (v) => (v.lang === 'en-US' || v.lang.startsWith('en')) && v.name.includes('Google')
  ) || voices.find((v) => v.lang === 'en-US' || v.lang.startsWith('en'));

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.cancel();
  }
}

// 高可靠性雙引擎英語語音朗讀系統 (Web Speech API + 全局解鎖美音真人 MP3 引擎)

let isAudioUnlocked = false;
let globalAudioPlayer: HTMLAudioElement | null = null;

function getOrCreateAudioPlayer(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!globalAudioPlayer) {
    globalAudioPlayer = new Audio();
    globalAudioPlayer.id = 'flashcard-global-audio-player';
  }
  return globalAudioPlayer;
}

// 全局音訊解鎖 (在學生第一次點擊/觸控畫面時解鎖 iOS / Safari / Android 音訊權限)
export function initAudioUnlock(): void {
  if (isAudioUnlocked || typeof window === 'undefined') return;

  const unlock = () => {
    if (isAudioUnlocked) return;
    isAudioUnlocked = true;

    // 1. 解鎖全域 Audio 標籤 (播放靜音片段，獲得手機 Safari/Chrome 永久播音授權)
    const player = getOrCreateAudioPlayer();
    if (player) {
      player.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      player.play().catch(() => {});
    }

    // 2. 預熱 Web Speech API
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
      } catch (e) {
        console.warn('SpeechSynthesis unlock notice:', e);
      }
    }

    window.removeEventListener('click', unlock);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('pointerdown', unlock);
  };

  window.addEventListener('click', unlock, { passive: true });
  window.addEventListener('touchstart', unlock, { passive: true });
  window.addEventListener('pointerdown', unlock, { passive: true });
}

export function isTTSSupported(): boolean {
  return typeof window !== 'undefined';
}

// 線上真人美音 MP3 發音引擎
function playOnlineMP3(text: string, rate: number = 1.0): void {
  const player = getOrCreateAudioPlayer();
  if (!player) return;

  try {
    player.pause();
    const cleanText = text.trim();

    // 優先使用有道美式英語接口 (Type 2 代表純正美語)
    const youdaoUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&type=2`;
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=en&client=tw-ob`;

    player.playbackRate = rate < 0.9 ? 0.75 : 1.0;
    player.src = youdaoUrl;

    let hasTriedGoogle = false;

    player.onerror = () => {
      if (!hasTriedGoogle) {
        hasTriedGoogle = true;
        player.src = googleUrl;
        player.play().catch((err) => console.warn('Google TTS play failed:', err));
      }
    };

    player.play().catch(() => {
      // 若有道播不出，切換至 Google TTS
      if (!hasTriedGoogle) {
        hasTriedGoogle = true;
        player.src = googleUrl;
        player.play().catch((err) => console.warn('Backup TTS play failed:', err));
      }
    });
  } catch (err) {
    console.warn('MP3 playback failed:', err);
  }
}

// 主發音入口 (Web Speech API 優先，遇凍結/阻擋/無語音時 250ms 內自動無縫切換至 MP3)
export function speakWord(
  text: string,
  rate: number = 1.0,
  pitch: number = 1.0,
  lang: string = 'en-US'
): void {
  if (typeof window === 'undefined' || !text || !text.trim()) return;

  const cleanText = text.trim();

  // 若有線上 MP3 正在播放，先關閉
  if (globalAudioPlayer) {
    globalAudioPlayer.pause();
  }

  // 1. 若支援 Web Speech API，嘗試調用
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;

      const voices = window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find((v) => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David'))) ||
        voices.find((v) => v.lang === 'en-US' || v.lang.startsWith('en'));

      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      let hasStarted = false;

      utterance.onstart = () => {
        hasStarted = true;
      };

      utterance.onerror = () => {
        if (!hasStarted) {
          playOnlineMP3(cleanText, rate);
        }
      };

      window.speechSynthesis.speak(utterance);

      // 250ms 快照監測：若 Chrome/Safari/手機阻塞未能及時發音，立即切換至線上 MP3
      setTimeout(() => {
        if (!hasStarted) {
          playOnlineMP3(cleanText, rate);
        }
      }, 250);

      return;
    } catch {
      // 降級處理
    }
  }

  // 2. 無 Web Speech API 時直接播放線上 MP3
  playOnlineMP3(cleanText, rate);
}

export function cancelSpeech(): void {
  if (globalAudioPlayer) {
    globalAudioPlayer.pause();
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

// 高可靠性雙語音朗讀系統 (支援法文專業餐旅詞彙 + 美式英語，Web Speech API + 真人線上雙引擎)

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

// 觀光餐旅與西餐法文專業詞彙判斷庫
export const FRENCH_HOSPITALITY_TERMS = new Set([
  'sous vide',
  'sous-vide',
  'sauté',
  'saute',
  'garde manger',
  'entremetier',
  'saucier',
  'brasserie',
  'bistro',
  'bistrot',
  'chef de partie',
  'sous chef',
  'buffet',
  'semi-buffet',
  'chef',
  'hors d\'oeuvre',
  'hors d’oeuvre',
  'à la carte',
  'a la carte',
  'table d\'hôte',
  'table d’hôte',
  'table d’hote',
  'table d\'hote',
  'sommelier',
  'maître d\'',
  'maître d’hôtel',
  'maitre d',
  'maitre d\'hotel',
  'rôtisseur',
  'rotisseur',
  'poissonnier',
  'pâtissier',
  'patissier',
  'boucher',
  'commis',
  'consommé',
  'consomme',
  'flambé',
  'flambe',
  'julienne',
  'roux',
  'mirepoix',
  'foie gras',
  'croissant',
  'baguette',
  'beurre',
  'fondue',
  'crepe',
  'crêpe',
  'vinaigrette',
  'bouquet garni',
  'au gratin',
  'en papillote',
  'mise en place',
  'a la mode',
  'à la mode',
  'du jour',
  'demi-glace'
]);

/**
 * 智慧法文詞彙判定：
 * 1. 顯式指定 lang === 'fr-FR'
 * 2. 備註或提示中標註「法文」、「法語」、「法式」
 * 3. 符合餐旅專業法文借詞詞庫
 * 4. 含有典型法文變音符號 (é, è, ê, à, ç, ô, î, û 等)
 */
export function isFrenchTerm(text: string, hint?: string): boolean {
  if (!text) return false;
  const clean = text.toLowerCase().trim();

  // 若備註標示法文/法語
  if (hint && (hint.includes('法文') || hint.includes('法語') || hint.includes('法國'))) {
    return true;
  }

  // 直接比對單字庫
  for (const term of FRENCH_HOSPITALITY_TERMS) {
    if (clean === term || clean.startsWith(term + ' ') || clean.includes('/ ' + term) || clean.includes('(' + term + ')')) {
      return true;
    }
  }

  // 含有法文特殊音標重音字母
  if (/[éèêëàâçîïôûù]/i.test(clean)) {
    return true;
  }

  return false;
}

/**
 * 朗讀文本清理：去除括號與斜線後面重複詞，避免語音朗讀出「slash」或「parenthesis」
 */
export function cleanTextForSpeech(text: string, isFrench: boolean): string {
  if (!text) return '';
  let cleaned = text.trim();

  // 範例：Station Chef (Chef de Partie) -> 若是法文，朗讀主要法文名詞 Chef de Partie
  if (isFrench && cleaned.includes('(')) {
    const match = cleaned.match(/\((.*?)\)/);
    if (match && isFrenchTerm(match[1])) {
      return match[1].trim();
    }
  }

  // 範例：Bistro / Bistrot -> 朗讀 Bistro
  if (cleaned.includes('/')) {
    cleaned = cleaned.split('/')[0].trim();
  }

  // 範例：Sous Chef (Assistant Executive Chef) -> 朗讀 Sous Chef
  if (cleaned.includes('(')) {
    cleaned = cleaned.replace(/\(.*?\)/g, '').trim();
  }

  return cleaned;
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

// 線上真人 MP3 發音引擎 (支援法文 tl=fr 與 美音 type=2)
function playOnlineMP3(text: string, rate: number = 1.0, isFrench: boolean = false): void {
  const player = getOrCreateAudioPlayer();
  if (!player) return;

  try {
    player.pause();
    const cleanText = text.trim();

    player.playbackRate = rate < 0.9 ? 0.75 : 1.0;

    let primaryUrl: string;
    let backupUrl: string;

    if (isFrench) {
      // 🇫🇷 法文發音引擎：優先調用 Google 法文真人語音，備援使用有道法文庫
      primaryUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=fr&client=tw-ob`;
      backupUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&le=fr`;
    } else {
      // 🇺🇸 英文美音引擎：優先調用有道美式英語，備援使用 Google 英文語音
      primaryUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&type=2`;
      backupUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=en&client=tw-ob`;
    }

    player.src = primaryUrl;
    let hasTriedBackup = false;

    player.onerror = () => {
      if (!hasTriedBackup) {
        hasTriedBackup = true;
        player.src = backupUrl;
        player.play().catch((err) => console.warn('Backup TTS play failed:', err));
      }
    };

    player.play().catch(() => {
      if (!hasTriedBackup) {
        hasTriedBackup = true;
        player.src = backupUrl;
        player.play().catch((err) => console.warn('Backup TTS play failed:', err));
      }
    });
  } catch (err) {
    console.warn('MP3 playback failed:', err);
  }
}

/**
 * 主發音入口 (Web Speech API 優先，遇到法文詞自動切換為純正法文發音 fr-FR)
 */
export function speakWord(
  text: string,
  rate: number = 1.0,
  pitch: number = 1.0,
  lang?: string,
  hint?: string
): void {
  if (typeof window === 'undefined' || !text || !text.trim()) return;

  // 判定是否為法文專有名詞
  const isFrench = lang === 'fr-FR' || isFrenchTerm(text, hint);
  const targetLang = isFrench ? 'fr-FR' : (lang || 'en-US');
  const speechText = cleanTextForSpeech(text, isFrench);

  // 若有線上 MP3 正在播放，先關閉
  if (globalAudioPlayer) {
    globalAudioPlayer.pause();
  }

  // 1. 若支援 Web Speech API，嘗試調用
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = targetLang;
      // 法文稍微放慢語速，讓學生清楚辨識小舌音與連音細節
      utterance.rate = isFrench ? (rate < 0.9 ? 0.8 : 0.92) : rate;
      utterance.pitch = pitch;

      const voices = window.speechSynthesis.getVoices();
      if (isFrench) {
        // 尋找高音質法文發音人
        const frenchVoice =
          voices.find((v) => (v.lang === 'fr-FR' || v.lang.startsWith('fr')) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Thomas') || v.name.includes('Amelie') || v.name.includes('Audrey') || v.name.includes('Pauline') || v.name.includes('Virginie') || v.name.includes('Hortense'))) ||
          voices.find((v) => v.lang === 'fr-FR' || v.lang.startsWith('fr'));
        if (frenchVoice) {
          utterance.voice = frenchVoice;
        }
      } else {
        // 尋找高音質美式英語發音人
        const englishVoice =
          voices.find((v) => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David'))) ||
          voices.find((v) => v.lang === 'en-US' || v.lang.startsWith('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }

      let hasStarted = false;

      utterance.onstart = () => {
        hasStarted = true;
      };

      utterance.onerror = () => {
        if (!hasStarted) {
          playOnlineMP3(speechText, rate, isFrench);
        }
      };

      window.speechSynthesis.speak(utterance);

      // 250ms 快照監測：若 Chrome/Safari/手機阻塞未能及時發音，立即切換至線上 MP3
      setTimeout(() => {
        if (!hasStarted) {
          playOnlineMP3(speechText, rate, isFrench);
        }
      }, 250);

      return;
    } catch {
      // 降級處理
    }
  }

  // 2. 無 Web Speech API 時直接播放線上 MP3
  playOnlineMP3(speechText, rate, isFrench);
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

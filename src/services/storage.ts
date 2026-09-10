import { UserProfile, WordItem, WordStat, ThemeColor } from '../types';
import { INITIAL_WORDS } from '../data/grade2Words';
import { syncUserToFirestore, fetchUserFromFirestore } from './firebase';

const USER_PROFILE_KEY = 'flashcard_pro_user_profile';
const CUSTOM_WORDS_KEY = 'flashcard_pro_custom_words';

export function createDefaultProfile(seatNumber: string = '01', classCode: string = '201'): UserProfile {
  return {
    seatNumber,
    classCode,
    themeColor: 'emerald',
    unlockedLevel: 1,
    lastActive: new Date().toISOString(),
    streakDays: 1,
    stars: 0,
    progress: {
      level1: { completed: false, masteryRate: 0, starsEarned: 0 },
    },
    wordStats: {},
  };
}

export function getLocalProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLocalProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  // 同步給 Firestore (若有設定 Firebase)
  syncUserToFirestore(profile).catch((err) => console.log('Firestore sync notice:', err));
}

export async function loadUserProfile(seatNumber: string): Promise<UserProfile> {
  // 先嘗試從 LocalStorage 讀取
  const local = getLocalProfile();
  if (local && local.seatNumber === seatNumber) {
    // 檢查連續登入 Streak
    const updated = updateStreakDays(local);
    saveLocalProfile(updated);
    return updated;
  }

  // 若 LocalStorage 沒有，嘗試從 Firestore 抓取
  const remote = await fetchUserFromFirestore(seatNumber);
  if (remote) {
    const updated = updateStreakDays(remote);
    saveLocalProfile(updated);
    return updated;
  }

  // 若都沒有，建立全新帳號檔
  const newProfile = createDefaultProfile(seatNumber);
  saveLocalProfile(newProfile);
  return newProfile;
}

function updateStreakDays(profile: UserProfile): UserProfile {
  const last = new Date(profile.lastActive);
  const now = new Date();

  // 計算是否同一天
  const isSameDay =
    last.getFullYear() === now.getFullYear() &&
    last.getMonth() === now.getMonth() &&
    last.getDate() === now.getDate();

  if (isSameDay) {
    return { ...profile, lastActive: now.toISOString() };
  }

  // 判斷是否為昨天 (連續天數 +1)
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    last.getFullYear() === yesterday.getFullYear() &&
    last.getMonth() === yesterday.getMonth() &&
    last.getDate() === yesterday.getDate();

  const newStreak = isYesterday ? profile.streakDays + 1 : 1;

  return {
    ...profile,
    streakDays: newStreak,
    lastActive: now.toISOString(),
  };
}

// 自訂單字庫管理
export function getCustomWords(): WordItem[] {
  if (typeof window === 'undefined') return INITIAL_WORDS;
  const raw = localStorage.getItem(CUSTOM_WORDS_KEY);
  if (!raw) return INITIAL_WORDS;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_WORDS;
  } catch {
    return INITIAL_WORDS;
  }
}

export function saveCustomWords(words: WordItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(words));
}

// 無損合併新單字庫：新增單字時保留現有單字與記憶曲線紀錄
export function mergeCustomWords(newWords: WordItem[]): WordItem[] {
  const currentWords = getCustomWords();
  const wordMap = new Map<string, WordItem>();

  // 1. 先把既有單字放入 Map
  currentWords.forEach((w) => wordMap.set(w.id, w));

  // 2. 將新單字逐一合併或補全
  newWords.forEach((w) => {
    if (wordMap.has(w.id)) {
      // 若 ID 已存在，更新單字內容（但 WordStat 保留在 userProfile 中）
      wordMap.set(w.id, { ...wordMap.get(w.id)!, ...w });
    } else {
      // 若為全新單字，追加至單字庫
      wordMap.set(w.id, w);
    }
  });

  const merged = Array.from(wordMap.values());
  saveCustomWords(merged);
  return merged;
}

export function resetCustomWordsToDefault(): WordItem[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CUSTOM_WORDS_KEY);
  }
  return INITIAL_WORDS;
}

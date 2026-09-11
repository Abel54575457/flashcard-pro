import liff from '@line/liff';

const LIFF_ID_KEY = 'flashcard_pro_liff_id';

export interface LiffUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export function getSavedLiffId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(LIFF_ID_KEY) || '';
}

export function saveLiffId(liffId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LIFF_ID_KEY, liffId.trim());
  }
}

let isLiffInitialized = false;

export async function initLiff(customLiffId?: string): Promise<boolean> {
  const liffId = customLiffId || getSavedLiffId();
  if (!liffId) {
    console.log('LINE LIFF ID not configured. Operating in standard web mode.');
    return false;
  }

  try {
    if (!isLiffInitialized) {
      await liff.init({ liffId });
      isLiffInitialized = true;
    }
    return true;
  } catch (err) {
    console.warn('LINE LIFF init notice:', err);
    return false;
  }
}

export async function getLiffUserProfile(): Promise<LiffUserProfile | null> {
  if (!isLiffInitialized) {
    const ok = await initLiff();
    if (!ok) return null;
  }

  try {
    if (liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
      };
    }
  } catch (err) {
    console.warn('Failed to get LIFF profile:', err);
  }
  return null;
}

export function isLiffEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return liff.isInClient() || liff.isLoggedIn();
}

export function triggerLiffLogin(): void {
  if (isLiffInitialized && !liff.isLoggedIn()) {
    liff.login();
  }
}

export function triggerLiffLogout(): void {
  if (isLiffInitialized && liff.isLoggedIn()) {
    liff.logout();
  }
}

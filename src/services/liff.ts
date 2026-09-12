import liff from '@line/liff';

const LIFF_ID_KEY = 'flashcard_pro_liff_id';
const DEFAULT_LIFF_ID = '2011565097-n1Ab1IlP';

export interface LiffUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export function getSavedLiffId(): string {
  if (typeof window === 'undefined') return DEFAULT_LIFF_ID;
  return localStorage.getItem(LIFF_ID_KEY) || DEFAULT_LIFF_ID;
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

const CHANNEL_TOKEN_KEY = 'flashcard_pro_line_channel_token';

export function getSavedChannelToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(CHANNEL_TOKEN_KEY) || '';
}

export function saveChannelToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CHANNEL_TOKEN_KEY, token.trim());
  }
}

export async function sendLinePushReminder(
  channelToken: string,
  toUserId: string,
  studentName: string,
  seatNumber: string,
  dueCount: number,
  streakDays: number
): Promise<boolean> {
  if (!channelToken || !toUserId) return false;
  const liffUrl = `https://liff.line.me/${getSavedLiffId()}`;

  const payload = {
    to: toUserId,
    messages: [
      {
        type: 'flex',
        altText: `📢 課後單字複習提醒：座號 ${seatNumber} 今日有 ${dueCount} 個單字待複習！`,
        contents: {
          type: 'bubble',
          size: 'mega',
          header: {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#06C755',
            contents: [
              { type: 'text', text: '📢 課後單字複習提醒', weight: 'bold', color: '#FFFFFF', size: 'xs' },
              { type: 'text', text: `${studentName || '同學'} (座號 ${seatNumber})`, weight: 'bold', color: '#FFFFFF', size: 'xl', margin: 'sm' }
            ]
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              { type: 'text', text: `📚 您今日有 ${dueCount} 個單字已進入記憶曲線複習池囉！`, wrap: true, size: 'sm', color: '#333333' },
              { type: 'text', text: `🔥 連續學習天數：${streakDays || 1} 天`, size: 'xs', color: '#888888', margin: 'md' }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                action: { type: 'uri', label: '🚀 花 3 分鐘開始刷單字', uri: liffUrl },
                style: 'primary',
                color: '#06C755'
              }
            ]
          }
        }
      }
    ]
  };

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelToken.trim()}`
      },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.error('Push message failed:', err);
    return false;
  }
}


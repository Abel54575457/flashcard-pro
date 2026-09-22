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
const DEFAULT_CHANNEL_TOKEN = 'tA+pW5dxTSDYkmCZou7kTt1APVC9U4H2xm9J6Pny8fCE/2dFhL2qdizLym7dT0jOdOzPRGBE/lJjRhtN5eIpjD0djQ7fR49VG642tLTSpypbrznk3szasMVguJiaFSiqfwhW7/tG4ucsxWi4F6cE1gdB04t89/1O/w1cDnyilFU=';

const GAS_PROXY_KEY = 'flashcard_pro_gas_proxy_url';

export function getSavedGasProxyUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GAS_PROXY_KEY) || '';
}

export function saveGasProxyUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GAS_PROXY_KEY, url.trim());
  }
}

export function getSavedChannelToken(): string {
  if (typeof window === 'undefined') return DEFAULT_CHANNEL_TOKEN;
  const saved = localStorage.getItem(CHANNEL_TOKEN_KEY);
  // 自動升級舊版已失效的 gVXr Token 到最新有效 Token
  if (!saved || saved.startsWith('gVXr') || saved.includes('IJjRhtN5elpjD0') || saved.includes('10/w1cD')) {
    localStorage.setItem(CHANNEL_TOKEN_KEY, DEFAULT_CHANNEL_TOKEN);
    return DEFAULT_CHANNEL_TOKEN;
  }
  return saved;
}

export function saveChannelToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CHANNEL_TOKEN_KEY, token.trim());
  }
}

export interface PushResult {
  success: boolean;
  reason?: string;
}

export interface CheckBotResult {
  ok: boolean;
  botName?: string;
  basicId?: string;
  error?: string;
  status?: number;
}

export async function checkLineBotConnection(token: string, gasUrl?: string): Promise<CheckBotResult> {
  const cleanToken = token.trim() || getSavedChannelToken().trim();
  const cleanGas = (gasUrl || getSavedGasProxyUrl()).trim();

  if (!cleanToken) {
    return { ok: false, error: '尚未設定 LINE Channel Access Token' };
  }

  // 1. 若有 GAS 代理，透過 GAS 測試（突破瀏覽器 CORS 限制）
  if (cleanGas) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(`${cleanGas}?action=check&tk=${encodeURIComponent(cleanToken)}`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.success) {
            return { ok: true, botName: data.botName, basicId: data.botId };
          }
          return { ok: false, error: data.error || `LINE API 回應 HTTP ${data.status}` };
        } catch {
          return {
            ok: false,
            error: 'GAS 雲端腳本尚未更新為 2026 極速版（目前回應非 JSON）。請更新 GAS 部署為新版本！'
          };
        }
      }
    } catch (e: any) {
      console.warn('GAS check fetch notice:', e);
    }
  }

  // 2. 直連 LINE API（在非限制環境下）
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://api.line.me/v2/bot/info', {
      headers: { Authorization: `Bearer ${cleanToken}` },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return { ok: true, botName: data.displayName, basicId: data.basicId };
    }
    const errText = await res.text();
    return { ok: false, error: `LINE 回應 ${res.status}: ${errText}` };
  } catch (err: any) {
    if (cleanGas) {
      return { ok: false, error: 'GAS 代理連線逾時 (12秒)，請確認 GAS 網址與部署版本。' };
    }
    return {
      ok: false,
      error: '瀏覽器安全限制 (CORS) 阻擋直連。請設定並儲存 GAS 雲端代理網址以連線！'
    };
  }
}

export interface BatchPushResult {
  success: boolean;
  sentCount: number;
  failCount: number;
  reason?: string;
  errors?: string[];
}

export async function sendLineBatchReminders(
  channelToken: string,
  gasUrl: string,
  students: { lineUserId?: string; lineDisplayName?: string; seatNumber: string; streakDays?: number; wordStats?: any }[],
  words: any[]
): Promise<BatchPushResult> {
  const bound = students.filter((s) => !!s.lineUserId);
  if (bound.length === 0) {
    return { success: false, sentCount: 0, failCount: 0, reason: '暫無已綁定 LINE 的學生' };
  }

  const payload = bound.map((st) => {
    let dueCount = 0;
    if (words && st.wordStats) {
      dueCount = words.filter((w: any) => {
        const stat = st.wordStats?.[w.id];
        if (!stat) return true;
        if (stat.box === 5) return false;
        if (!stat.nextReviewDate) return true;
        return new Date(stat.nextReviewDate) <= new Date();
      }).length;
    }
    return {
      to: st.lineUserId,
      name: encodeURIComponent(st.lineDisplayName || `座號 ${st.seatNumber}`),
      seat: st.seatNumber,
      due: dueCount,
      streak: st.streakDays || 1
    };
  });

  const cleanGas = gasUrl.trim() || getSavedGasProxyUrl().trim();
  if (!cleanGas) {
    return { success: false, sentCount: 0, failCount: bound.length, reason: '尚未設定 GAS 雲端代理網址' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 秒上限，留足冷啟動時間
    const url = `${cleanGas}?action=batch&liff=${encodeURIComponent(getSavedLiffId())}&tk=${encodeURIComponent(channelToken)}&data=${encodeURIComponent(JSON.stringify(payload))}`;
    const res = await fetch(url, { method: 'GET', signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data.success || (data.sentCount && data.sentCount > 0)) {
          return {
            success: true,
            sentCount: data.sentCount || 0,
            failCount: data.failCount || 0,
            errors: data.errors || []
          };
        }
        return {
          success: false,
          sentCount: 0,
          failCount: bound.length,
          reason: data.error || '推播未成功，請確認 LINE Channel Access Token 是否有效。',
          errors: data.errors
        };
      } catch {
        if (text.includes('missing to') || text.includes('Cleanly')) {
          return {
            success: false,
            sentCount: 0,
            failCount: bound.length,
            reason: 'GAS 雲端腳本仍為舊版（未支援批次功能），請更新 GAS 部署為新版本！'
          };
        }
        return {
          success: false,
          sentCount: 0,
          failCount: bound.length,
          reason: `GAS 回應非 JSON: ${text.slice(0, 60)}`
        };
      }
    }
    return { success: false, sentCount: 0, failCount: bound.length, reason: `GAS 伺服器回應 HTTP ${res.status}` };
  } catch (err: any) {
    return {
      success: false,
      sentCount: 0,
      failCount: bound.length,
      reason: err?.name === 'AbortError' ? 'GAS 伺服器連線逾時（超過20秒）' : `連線錯誤: ${err?.message || err}`
    };
  }
}

export async function sendLinePushReminder(
  channelToken: string,
  toUserId: string,
  studentName: string,
  seatNumber: string,
  dueCount: number,
  streakDays: number
): Promise<PushResult> {
  if (!channelToken || !toUserId) return { success: false, reason: '未提供 Token 或 User ID' };
  const liffUrl = `https://liff.line.me/${getSavedLiffId()}`;

  const isDue = dueCount > 0;
  const altText = isDue
    ? `📢 課後單字複習提醒：座號 ${seatNumber} 今日有 ${dueCount} 個單字待複習！`
    : `📢 觀光英文單字學習提醒：座號 ${seatNumber} 今日課後學習卡片已上線！`;
  const bodyText = isDue
    ? `📚 您今日有 ${dueCount} 個單字已進入記憶曲線複習池囉！`
    : `🌟 保持每日學習好習慣！觀光餐旅專業單字庫與最新關卡已準備就緒，點擊開始挑戰！`;

  const messages = [
    {
      type: 'flex',
      altText,
      contents: {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#06C755',
          contents: [
            { type: 'text', text: '📢 課後單字學習提醒', weight: 'bold', color: '#FFFFFF', size: 'xs' },
            { type: 'text', text: `${studentName || '同學'} (座號 ${seatNumber})`, weight: 'bold', color: '#FFFFFF', size: 'xl', margin: 'sm' }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            { type: 'text', text: bodyText, wrap: true, size: 'sm', color: '#333333' },
            { type: 'text', text: `🔥 連續學習天數：${streakDays || 1} 天`, size: 'xs', color: '#888888', margin: 'md' }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: { type: 'uri', label: '🚀 開始背單字 / 挑戰關卡', uri: liffUrl },
              style: 'primary',
              color: '#06C755'
            }
          ]
        }
      }
    }
  ];

  // 1. 直連 LINE API (超時 2 秒)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelToken.trim()}`
      },
      body: JSON.stringify({ to: toUserId, messages }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) return { success: true };
    const errText = await res.text();
    return { success: false, reason: `LINE 伺服器回應 ${res.status}: ${errText}` };
  } catch (err) {
    // blocked by CORS or timeout, continue to GAS
  }

  // 2. GAS 雲端代理 (超時 12 秒，留足冷啟動時間)
  const gasUrl = getSavedGasProxyUrl();
  if (gasUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const params = new URLSearchParams({
        action: 'push',
        to: toUserId,
        name: encodeURIComponent(studentName || '同學'),
        seat: seatNumber,
        due: String(dueCount),
        streak: String(streakDays),
        liff: getSavedLiffId(),
        tk: channelToken.trim()
      });

      const res = await fetch(`${gasUrl}?${params.toString()}`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.success) return { success: true };
          return { success: false, reason: data.error || `LINE API HTTP ${data.status}` };
        } catch {
          if (text === 'OK') return { success: true };
          if (text.includes('FAIL') || text.includes('ERROR') || text.includes('Cleanly')) {
            return {
              success: false,
              reason: `GAS 腳本尚未更新為最新版（目前回應：${text}）。請至 script.google.com 部署新版本！`
            };
          }
          return { success: false, reason: `GAS 回應異常: ${text.slice(0, 80)}` };
        }
      }
      return { success: false, reason: `GAS 伺服器回應 HTTP ${res.status}` };
    } catch (gasErr: any) {
      if (gasErr?.name === 'AbortError') {
        return { success: false, reason: 'GAS 代理連線逾時 (12秒)' };
      }
      return { success: false, reason: `GAS 連線異常: ${gasErr?.message || gasErr}` };
    }
  }

  return {
    success: false,
    reason: '尚未設定 GAS 代理網址。請至「Firebase 雲端設定」點擊「📋 查看與複製 GAS 程式碼」完成設定。'
  };
}


export function shareIndividualStudentReminder(
  studentName: string,
  seatNumber: string,
  dueCount: number
): boolean {
  const liffUrl = `https://liff.line.me/${getSavedLiffId()}`;
  const isDue = dueCount > 0;
  const bodyMsg = isDue
    ? `您今日有 ${dueCount} 個單字已進入記憶曲線複習池，請把握黃金複習時間！`
    : `觀光英文全冊 135 個專業單字與 Unit 7 最新關卡已上線，保持好習慣開始複習！`;

  const shareText = `📢 【觀光英文單字卡 Pro】課後學習提醒\n\n親愛的 ${studentName || '同學'} (座號 ${seatNumber})：\n📚 老師提醒：${bodyMsg}\n👉 點此開始背單字：${liffUrl}`;

  const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`;
  window.open(lineShareUrl, '_blank');
  return true;
}

export async function shareReminderViaLiffPicker(studentName?: string): Promise<boolean> {
  const liffUrl = `https://liff.line.me/${getSavedLiffId()}`;
  const shareText = studentName
    ? `📢 【觀光英文單字卡 Pro】課後學習提醒\n\n親愛的 ${studentName} 同學：\n📚 老師提醒您記得點擊連結開始複習今日單字與 Unit 7 最新關卡！\n👉 點此開始背單字：${liffUrl}`
    : `📢 【觀光英文單字卡 Pro】課後學習提醒！\n\n📚 老師提醒：請 205 班同學點擊下方連結開始複習今日單字與最新 Unit 7 關卡！\n👉 點此開始背單字：${liffUrl}`;

  try {
    if (isLiffEnvironment()) {
      if (!isLiffInitialized) {
        await initLiff();
      }
      if (liff.isLoggedIn() && liff.isApiAvailable('shareTargetPicker')) {
        const res = await liff.shareTargetPicker([
          {
            type: 'flex',
            altText: '📢 205班 觀光餐旅英文單字卡課後學習提醒！',
            contents: {
              type: 'bubble',
              size: 'mega',
              header: {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#06C755',
                contents: [
                  { type: 'text', text: '📢 課後單字學習提醒', weight: 'bold', color: '#FFFFFF', size: 'xs' },
                  { type: 'text', text: studentName ? `${studentName} 同學` : '觀光餐旅英文 學習卡片已發布！', weight: 'bold', color: '#FFFFFF', size: 'lg', margin: 'sm' }
                ]
              },
              body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  { type: 'text', text: '📚 老師提醒：請點擊下方按鈕開始複習今日單字與最新 Unit 7 關卡！', wrap: true, size: 'sm', color: '#333333' }
                ]
              },
              footer: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'button',
                    action: { type: 'uri', label: '🚀 開啟 觀光單字卡 Pro', uri: liffUrl },
                    style: 'primary',
                    color: '#06C755'
                  }
                ]
              }
            }
          }
        ]);
        if (res) return true;
      }
    }
  } catch (err) {
    console.warn('LIFF share target picker notice:', err);
  }

  // 跨平台 Universal Share API：開啟 LINE 官方分享視窗
  const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`;
  window.open(lineShareUrl, '_blank');
  return true;
}


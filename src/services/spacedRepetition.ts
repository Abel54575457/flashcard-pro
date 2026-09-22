import { WordStat, WordMemoryLevel } from '../types';

// 萊特納箱位對應間隔天數 (Leitner Box Intervals in Days)
const BOX_INTERVALS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 15,
};

export function createDefaultWordStat(): WordStat {
  return {
    level: 'new',
    box: 1,
    reviewCount: 0,
    correctCount: 0,
    wrongCount: 0,
    lastInterval: 0,
    nextReviewDate: new Date().toISOString(),
  };
}

export function updateWordStatOnResult(
  currentStat: WordStat | undefined,
  rating: 'remembered' | 'fuzzy' | 'forgot'
): WordStat {
  const stat: WordStat = currentStat ? { ...currentStat } : createDefaultWordStat();
  const now = new Date();

  stat.reviewCount += 1;
  stat.lastReviewedAt = now.toISOString();

  if (rating === 'remembered') {
    stat.correctCount += 1;
    // 晉升箱位，最高 5 級
    stat.box = Math.min(5, stat.box + 1);

    const intervalDays = BOX_INTERVALS[stat.box] || 15;
    stat.lastInterval = intervalDays;

    const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    stat.nextReviewDate = nextDate.toISOString();

    if (stat.box >= 4) {
      stat.level = 'mastered';
    } else {
      stat.level = 'reviewing';
    }
  } else if (rating === 'fuzzy') {
    // 模糊不退回 box 1，但留在原 box 或調降一級，間隔 1 天後複習
    stat.box = Math.max(1, stat.box - 1);
    stat.lastInterval = 1;
    const nextDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    stat.nextReviewDate = nextDate.toISOString();
    stat.level = 'learning';
  } else {
    // 忘記：重設回 Box 1，今天立即需再次複習
    stat.wrongCount += 1;
    stat.box = 1;
    stat.lastInterval = 0;
    stat.nextReviewDate = now.toISOString();
    stat.level = 'learning';
  }

  return stat;
}

export function isWordDueForReview(stat: WordStat | undefined): boolean {
  if (!stat) return true; // 新單字視為可複習
  if (stat.level === 'new') return true;
  if (!stat.nextReviewDate) return true;
  const nextDate = new Date(stat.nextReviewDate).getTime();
  const now = Date.now();
  return isNaN(nextDate) || now >= nextDate;
}

export function calculateMasteryRate(
  wordIds: string[],
  wordStats: Record<string, WordStat> | undefined
): number {
  if (!wordIds || wordIds.length === 0) return 0;
  const safeStats = wordStats || {};
  let totalScore = 0;
  for (const id of wordIds) {
    const stat = safeStats[id];
    if (stat) {
      if (stat.box >= 4 || stat.level === 'mastered') {
        totalScore += 1.0;
      } else if (stat.box === 3) {
        totalScore += 0.8;
      } else if (stat.box === 2 || stat.level === 'reviewing') {
        totalScore += 0.6;
      } else if (stat.reviewCount > 0) {
        totalScore += 0.3;
      }
    }
  }
  return Number(Math.min(1, totalScore / wordIds.length).toFixed(2));
}

import confetti from 'canvas-confetti';

export function fireCelebrationConfetti(): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. 強制重置舊的彩帶與畫布，避免殘留
    confetti.reset();

    // 2. 觸發短暫慶祝彩帶 (設定 short ticks 與快速 decay，1.2秒內完全乾淨消失)
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      ticks: 100, // 僅噴發 100 幀 (約 1 秒)
      decay: 0.91, // 聲速衰減下落
      disableForReducedMotion: true,
      zIndex: 999, // 避免擋住文字與 UI 操作
    });

    // 3. 1.2 秒後二次強制清空 canvas
    setTimeout(() => {
      try {
        confetti.reset();
      } catch {
        // ignore
      }
    }, 1200);
  } catch (e) {
    console.warn('Confetti execution note:', e);
  }
}

export function clearConfetti(): void {
  if (typeof window === 'undefined') return;
  try {
    confetti.reset();
  } catch {
    // ignore
  }
}

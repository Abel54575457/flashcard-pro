import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  ShieldCheck,
  X,
  ExternalLink,
  Sparkles,
  Zap,
  Globe,
  Info
} from 'lucide-react';
import { soundSynth } from '../services/soundEffects';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSeatNumber?: string;
  lineBound?: boolean;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  userSeatNumber,
  lineBound
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>((window as any).deferredPwaPrompt || null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInLine, setIsInLine] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // 檢測是否已處於獨立 App 模式 (Standalone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // 檢測作業系統與瀏覽器環境
    const ua = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isDesktopDevice = !/iphone|ipad|ipod|android|mobile/.test(ua);
    setIsIOS(isIOSDevice);
    setIsInLine(ua.includes('line'));
    setIsDesktop(isDesktopDevice);

    // 取得全域捕捉到的 PWA 安裝事件
    if ((window as any).deferredPwaPrompt) {
      setDeferredPrompt((window as any).deferredPwaPrompt);
    }

    const handlePromptAvailable = (e: any) => {
      setDeferredPrompt(e.detail || (window as any).deferredPwaPrompt);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      soundSynth.playLevelClear();
    };

    window.addEventListener('pwa-prompt-available', handlePromptAvailable);
    window.addEventListener('pwa-installed', handleInstalled);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-available', handlePromptAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    const promptObj = deferredPrompt || (window as any).deferredPwaPrompt;
    if (promptObj) {
      soundSynth.playFlip();
      promptObj.prompt();
      const choice = await promptObj.userChoice;
      if (choice.outcome === 'accepted') {
        soundSynth.playLevelClear();
        setIsInstalled(true);
        (window as any).deferredPwaPrompt = null;
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-inner shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  📲 加到手機主畫面 (App)
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-white/20 rounded-full tracking-wide">
                  原生體驗
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                桌面圖示一鍵秒開，無網址列遮擋，全螢幕背單字！
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* App Preview Card */}
          <div className="flex items-center space-x-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <img
              src="/pwa-192x192.png"
              alt="單字卡 Pro"
              className="w-14 h-14 rounded-2xl shadow-md border border-slate-200 object-cover shrink-0"
            />
            <div className="space-y-0.5 flex-1 min-w-0">
              <h4 className="font-black text-sm text-slate-900 truncate">
                FlashCard Pro - 觀光單字卡
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                https://flashcard-pro-app-25c7f.web.app
              </p>
              <div className="flex items-center space-x-2 pt-0.5">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  離線可用
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                  秒速加載
                </span>
              </div>
            </div>
          </div>

          {/* Two Key Assurances */}
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-emerald-900 block font-black">
                  🔒 保留原有 LINE 綁定與推播
                </strong>
                <span className="text-emerald-800">
                  {lineBound
                    ? '您的帳號已成功連動 LINE！桌面圖示打開後，座號進度與課後推播依然維持綁定。'
                    : '無論從桌面或 LINE 開啟，雲端進度與排行榜皆即時同步，絕不遺失任何進度。'}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs">
              <Zap className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-indigo-900 block font-black">
                  ⚡ 免開瀏覽器，全螢幕無干擾
                </strong>
                <span className="text-indigo-800">
                  桌面點擊即全螢幕啟動，無網址列遮擋，享有等同 iPhone / Android 原生 App 的流暢體驗。
                </span>
              </div>
            </div>
          </div>

          {/* Environmental Instructions */}

          {/* Case 1: Already Installed */}
          {isInstalled && (
            <div className="p-4 rounded-2xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 mx-auto" />
              <p className="font-black text-sm">🎉 您已成功安裝單字卡至本裝置主畫面！</p>
              <p className="text-xs text-emerald-800">
                可隨時自手機桌面點擊圖示直接打開學習。
              </p>
            </div>
          )}

          {/* Case 2: In LINE In-App Browser (Crucial!) */}
          {isInLine && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-amber-600 shrink-0" />
                <h5 className="font-black text-xs sm:text-sm text-amber-900">
                  ⚠️ 偵測到您目前在 LINE 聊天室內開啟
                </h5>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                LINE 內建瀏覽器受系統安全限制，無法直接建立桌面圖示。請點擊下方按鈕以手機預設瀏覽器（Safari 或 Chrome）開啟，即可輕鬆加到桌面：
              </p>

              <a
                href="https://flashcard-pro-app-25c7f.web.app/?openExternalBrowser=1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-black text-xs sm:text-sm shadow-md shadow-[#06C755]/25 flex items-center justify-center space-x-2 transition-all active:scale-95 text-center"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>🚀 點此跳出 LINE（以手機瀏覽器開啟）</span>
              </a>

              <div className="text-[11px] text-amber-800/90 bg-amber-100/70 p-2.5 rounded-lg space-y-1 font-medium">
                <p className="font-bold">也可以手動切換：</p>
                <p>1. 點擊 LINE 右上角「<strong>⋮</strong>」或分享按鈕</p>
                <p>2. 選擇「<strong>以預設瀏覽器開啟</strong>」</p>
              </div>
            </div>
          )}

          {/* Case 3: Android Native Install Button (when prompt is available) */}
          {!isInstalled && !isIOS && !isInLine && (deferredPrompt || (window as any).deferredPwaPrompt) && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleNativeInstall}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all active:scale-95 animate-pulse"
              >
                <Download className="w-5 h-5" />
                <span>📲 立即一鍵加到手機主畫面</span>
              </button>
              <p className="text-[11px] text-center text-slate-500 font-medium">
                點擊後系統將跳出安裝確認，點選「新增」即可在手機桌面看到圖示
              </p>
            </div>
          )}

          {/* Case 4: iOS Safari Step-by-Step Guide */}
          {!isInstalled && isIOS && !isInLine && (
            <div className="space-y-2.5">
              <div className="flex items-center space-x-1.5 text-indigo-900 font-black text-xs sm:text-sm">
                <Share2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>iPhone / iPad (Safari) 安裝 3 步驟：</span>
              </div>
              <div className="space-y-2 text-xs text-slate-700 font-semibold bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    點擊 Safari 底部工具列中央的「<strong>分享</strong>」按鈕 📤 (向上箭頭圖示)
                  </span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    在選單中往下滑動，點選「<strong>加入主畫面 ➕</strong>」
                  </span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    點擊右上角的「<strong>新增</strong>」，手機桌面立即出現「觀光單字卡」專屬圖示！
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium text-center">
                💡 註：Apple iOS 規定網頁需透過上述分享選單加入主畫面
              </p>
            </div>
          )}

          {/* Case 5: Android Chrome Manual Steps (if prompt not yet triggered) */}
          {!isInstalled && !isIOS && !isDesktop && !isInLine && !(deferredPrompt || (window as any).deferredPwaPrompt) && (
            <div className="space-y-2">
              <h5 className="text-xs font-black text-slate-800 flex items-center space-x-1.5">
                <PlusSquare className="w-4 h-4 text-emerald-600" />
                <span>Android / Chrome 手動加入方式：</span>
              </h5>
              <div className="space-y-2 text-xs text-slate-700 font-semibold bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <p>
                  1. 點擊 Chrome 右上角選單「<strong>⋮</strong>」
                </p>
                <p>
                  2. 點選「<strong>加到主畫面</strong>」或「<strong>安裝應用程式</strong>」
                </p>
                <p>
                  3. 點選「<strong>新增</strong>」，手機桌面即會產生專屬圖示！
                </p>
              </div>
            </div>
          )}

          {/* Case 6: Desktop PC Info */}
          {isDesktop && !isInLine && (
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center space-x-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0" />
              <span>📱 本功能專為學生手機端設計。請用手機開啟本網頁，即可一鍵加入手機桌面！</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-medium text-slate-500">
            {userSeatNumber ? `目前座號：${userSeatNumber} 號` : '免密碼快速學習'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};

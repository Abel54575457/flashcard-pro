import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  Sparkles,
  X,
  CheckCircle2,
  Brain,
  Volume2,
  Flame,
  Star,
  Gamepad2,
  HelpCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { soundSynth } from '../services/soundEffects';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'modes' | 'rules' | 'science'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl p-6 sm:p-8 relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Background Decorative Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            soundSynth.playFlip();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4 shrink-0 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">遊戲簡介與通關指南</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                新手必讀
              </span>
            </div>
            <p className="text-xs text-slate-500">掌握闖關秘訣，快速搞定觀光餐旅專業單字！</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 p-1.5 bg-slate-100 rounded-2xl mb-4 shrink-0 overflow-x-auto text-xs font-extrabold">
          <button
            onClick={() => {
              soundSynth.playFlip();
              setActiveTab('overview');
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🎯 系統簡介</span>
          </button>
          <button
            onClick={() => {
              soundSynth.playFlip();
              setActiveTab('modes');
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 shrink-0 ${
              activeTab === 'modes'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>🎮 三大模式</span>
          </button>
          <button
            onClick={() => {
              soundSynth.playFlip();
              setActiveTab('rules');
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 shrink-0 ${
              activeTab === 'rules'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>🏆 通關原則</span>
          </button>
          <button
            onClick={() => {
              soundSynth.playFlip();
              setActiveTab('science');
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 shrink-0 ${
              activeTab === 'science'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>🧠 記憶曲線</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto pr-1 space-y-4 text-slate-700 text-sm leading-relaxed">
          
          {/* Tab 1: System Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 space-y-2">
                <h3 className="font-black text-indigo-900 flex items-center space-x-2 text-base">
                  <span>🌟 專為觀光餐旅科打造的數位記憶神器</span>
                </h3>
                <p className="text-xs text-indigo-950/80">
                  收錄餐飲、飯店、旅遊、客服等核心觀光專業詞彙，搭配美式發音與情境例句，幫助學生無痛快速記憶。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="font-extrabold text-slate-900 text-xs flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>免密碼 35 位座號直選</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    學生無需記憶帳號密碼，點選座號（01 ~ 35 號）即可開始練習，系統零延遲記憶學習進度。
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="font-extrabold text-slate-900 text-xs flex items-center space-x-1.5">
                    <Volume2 className="w-4 h-4 text-indigo-500" />
                    <span>全裝置 100% 語音備援</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    自動支援手機（iOS Safari / Android Chrome）與電腦發音，無聲播放解鎖 Autoplay 限制。
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="font-extrabold text-slate-900 text-xs flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>關卡解鎖與成就獎勵</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    完成關卡挑戰自動解鎖下一關，累積星星獎勵與每日登入 Streak 天數成就感！
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="font-extrabold text-slate-900 text-xs flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                    <span>教師端防側目隱私</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    教師端提供學習圖表與全班熟練度大數據，登入具備密碼遮蔽保護機制。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: 3 Game Modes */}
          {activeTab === 'modes' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              
              {/* Mode 1 */}
              <div className="p-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/60 to-purple-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-indigo-900 text-sm flex items-center space-x-1.5">
                    <span className="text-lg">🎴</span>
                    <span>模式一：閃卡朗讀記憶 (Flashcard Mode)</span>
                  </span>
                  <span className="text-[11px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">基礎累積</span>
                </div>
                <p className="text-xs text-slate-600">
                  顯示英文單字、KK音標、美式朗讀與中文翻譯及實用例句。翻卡後學生自行評定「記得」、「模糊」或「忘記」，系統會自動計算艾賓浩斯間隔時間安排複習。
                </p>
              </div>

              {/* Mode 2 */}
              <div className="p-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/60 to-orange-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-900 text-sm flex items-center space-x-1.5">
                    <span className="text-lg">🎧</span>
                    <span>模式二：聽力選字測驗 (Listening Quiz)</span>
                  </span>
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">獲得 1 ~ 10 星</span>
                </div>
                <p className="text-xs text-slate-600">
                  播放發音後進行 4 選 1 中文辨識測驗，考驗對語音與詞意敏銳度。答錯自動存入錯題本，完成可依正確率獲得最高 10 顆星星。
                </p>
              </div>

              {/* Mode 3 */}
              <div className="p-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/60 to-teal-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-900 text-sm flex items-center space-x-1.5">
                    <span className="text-lg">🧩</span>
                    <span>模式三：雙語連連看配對 (Memory Match)</span>
                  </span>
                  <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">獲勝賺 15 星</span>
                </div>
                <p className="text-xs text-slate-600">
                  將 6 個單字拆解為 12 張中英文配對卡片，進行 60 秒限時翻牌記憶與配對。連續成功觸發 Combo 加倍，限時內清空獲得 15 星最高榮譽！
                </p>
              </div>

            </div>
          )}

          {/* Tab 3: Level Clearing Rules */}
          {activeTab === 'rules' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <h3 className="font-black text-amber-900 flex items-center space-x-2 text-base">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span>核心通關四大原則 (Mastery Principles)</span>
                </h3>
                <p className="text-xs text-amber-900/80">
                  掌握以下規則，即可順利過關並達到 100% 全精通！
                </p>
              </div>

              <div className="space-y-3">
                
                <div className="flex space-x-3 items-start p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-xs">🔓 關卡解鎖機制 (Level Unlock)</h4>
                    <p className="text-xs text-slate-600">
                      完成目前關卡的閃卡記憶或聽力 / 配對遊戲，系統認定過關，自動解除鎖定並開放下一單字關卡（Level 1 ➔ Level 2 ...）。
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 items-start p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-xs">⭐ 星星獎勵與座號保存 (Stars & Progress)</h4>
                    <p className="text-xs text-slate-600">
                      聽力測驗頒發 1 ~ 10 星、連連看配對成功獎勵 15 星。所有分數與過關紀錄將永久保存在選擇的 01 ~ 35 號座號中。
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 items-start p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-xs">💯 全站 100% 精通 (Mastery Progress Bar)</h4>
                    <p className="text-xs text-slate-600">
                      首頁顯示整體熟練度百分比。持續將單字評定為「記得」或完成測驗，能逐步將熟練度提升至 100% 金黃色金牌成就！
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 items-start p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-7 h-7 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-xs">🎉 1.2 秒彩帶祝賀與音效 (Celebration)</h4>
                    <p className="text-xs text-slate-600">
                      通關時觸發勝音樂音與 1.2 秒絕美彩帶打氣，自動衰減完全清理，流暢不遮擋任何卡片與按鈕。
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Tab 4: Ebbinghaus Science */}
          {activeTab === 'science' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                <h3 className="font-black text-purple-900 flex items-center space-x-2 text-base">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>艾賓浩斯遺忘曲線原理 (Ebbinghaus Spaced Repetition)</span>
                </h3>
                <p className="text-xs text-purple-900/80">
                  人類在學習新單字後，24 小時內會遺忘約 70% 的內容。本系統透過間隔重複算法幫你記最久！
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xl">🌱</div>
                  <div className="font-black text-xs text-slate-900">新學單字 (Learning)</div>
                  <p className="text-[11px] text-slate-500">首次接觸，1 天後再次安排複習</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xl">🌿</div>
                  <div className="font-black text-xs text-indigo-700">複習中 (Review)</div>
                  <p className="text-[11px] text-slate-500">評定「記得」，間隔延長至 3 ~ 7 天</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xl">🌳</div>
                  <div className="font-black text-xs text-emerald-700">長期精通 (Mastered)</div>
                  <p className="text-[11px] text-slate-500">進入長期記憶，永久掌控該單字</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center space-x-3 text-xs text-indigo-900">
                <Zap className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>
                  <strong>小技巧：</strong> 當首頁「艾賓浩斯記憶池」出現待複習單字時，點擊「立即複習」可達到最高記憶效率！
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Confirm Button */}
        <div className="pt-4 border-t border-slate-100 mt-4 flex justify-end shrink-0">
          <button
            onClick={() => {
              soundSynth.playCorrect();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>我懂了，開始挑戰關卡！</span>
          </button>
        </div>

      </div>
    </div>
  );
};

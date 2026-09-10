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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fcfbf9] rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl p-6 sm:p-8 relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={() => {
            soundSynth.playFlip();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4 shrink-0 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-stone-900 text-amber-300 flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">觀光單字自主學習 ‧ 通關指南</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                新手必讀
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">掌握闖關原則，輕鬆累積專業單字！</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 p-1 bg-stone-100 rounded-2xl mb-4 shrink-0 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => {
              soundSynth.playFlip();
              setActiveTab('overview');
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>🎯 系統簡介</span>
          </button>
          <button
            onClick={() => {
              soundSynth.playFlip();
              setActiveTab('modes');
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 shrink-0 ${
              activeTab === 'modes'
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-amber-600" />
            <span>🎮 三大模式</span>
          </button>
          <button
            onClick={() => {
              soundSynth.playFlip();
              setActiveTab('rules');
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 shrink-0 ${
              activeTab === 'rules'
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>🏆 通關原則</span>
          </button>
          <button
            onClick={() => {
              soundSynth.playFlip();
              setActiveTab('science');
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 shrink-0 ${
              activeTab === 'science'
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-amber-600" />
            <span>🧠 記憶曲線</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto pr-1 space-y-4 text-stone-700 text-sm leading-relaxed">
          
          {/* Tab 1: System Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 space-y-1">
                <h3 className="font-bold text-stone-900 flex items-center space-x-2 text-sm">
                  <span>🌟 專為觀光餐旅科打造的數位記憶系統</span>
                </h3>
                <p className="text-xs text-stone-600">
                  收錄餐飲、飯店、旅遊、客服等核心專業詞彙，搭配美音朗讀與情境例句，幫助學生無痛快速記憶。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-1">
                  <div className="font-bold text-stone-900 text-xs flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>免密碼 35 位座號直選</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    點選 01 ~ 35 號即可開始練習，系統即時記憶學習進度與星星數。
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-1">
                  <div className="font-bold text-stone-900 text-xs flex items-center space-x-1.5">
                    <Volume2 className="w-4 h-4 text-amber-700" />
                    <span>全裝置 100% 語音備援</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    支援手機與電腦發音，無聲播放預解鎖 iOS/Android Autoplay 限制。
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-1">
                  <div className="font-bold text-stone-900 text-xs flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>關卡解鎖與成就獎勵</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    完成關卡自動解鎖下一關，累積星星點數與每日登入天數。
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-1">
                  <div className="font-bold text-stone-900 text-xs flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-stone-700" />
                    <span>教師端防側目隱私</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    教師端提供學習圖表大數據，登入具備密碼遮蔽保護機制。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: 3 Game Modes */}
          {activeTab === 'modes' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              
              <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm flex items-center space-x-1.5">
                    <span>🎴 模式一：閃卡朗讀記憶 (Flashcards)</span>
                  </span>
                  <span className="text-[11px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">基礎累積</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  顯示英文單字、KK音標、朗讀與中文例句。翻卡後自行評定「記得」、「模糊」或「忘記」，系統會自動安排最佳複習時機。
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm flex items-center space-x-1.5">
                    <span>🎧 模式二：聽力選字測驗 (Listening Quiz)</span>
                  </span>
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">獲得 1 ~ 10 星</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  播放發音進行 4 選 1 中文辨識，答錯自動存入錯題本，完成可依正確率獲得最高 10 顆星星。
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm flex items-center space-x-1.5">
                    <span>🧩 模式三：雙語連連看配對 (Memory Match)</span>
                  </span>
                  <span className="text-[11px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">獲勝賺 15 星</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  將單字拆解為 12 張中英文配對卡片，進行 60 秒限時翻牌記憶與配對，連續配對有 Combo 連擊加分！
                </p>
              </div>

            </div>
          )}

          {/* Tab 3: Level Clearing Rules */}
          {activeTab === 'rules' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2">
                <h3 className="font-bold text-stone-900 flex items-center space-x-2 text-sm">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>通關四大原則 (Mastery Principles)</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                <div className="flex space-x-3 items-start p-3 rounded-2xl bg-white border border-stone-200/80">
                  <div className="w-6 h-6 rounded-lg bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-stone-900 text-xs">🔓 關卡解鎖機制</h4>
                    <p className="text-xs text-stone-600">
                      完成目前關卡的閃卡記憶或測驗配對，系統認定過關，自動解除鎖定並開放下一關。
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 items-start p-3 rounded-2xl bg-white border border-stone-200/80">
                  <div className="w-6 h-6 rounded-lg bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-stone-900 text-xs">⭐ 星星獎勵與座號保存</h4>
                    <p className="text-xs text-stone-600">
                      聽力測驗 1 ~ 10 星、連連看配對 15 星，成績永久儲存在選擇的座號中。
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 items-start p-3 rounded-2xl bg-white border border-stone-200/80">
                  <div className="w-6 h-6 rounded-lg bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-stone-900 text-xs">💯 全站 100% 精通</h4>
                    <p className="text-xs text-stone-600">
                      持續評定「記得」與清理「待複習池」，將全站熟練度進度條推升至 100%！
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 items-start p-3 rounded-2xl bg-white border border-stone-200/80">
                  <div className="w-6 h-6 rounded-lg bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-stone-900 text-xs">🎉 1.2 秒絕美彩帶祝賀</h4>
                    <p className="text-xs text-stone-600">
                      過關時彈出 1.2 秒彩帶與勝音樂音打氣，隨即自動清理，流暢不擋畫面。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Ebbinghaus Science */}
          {activeTab === 'science' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1">
                <h3 className="font-bold text-stone-900 flex items-center space-x-2 text-sm">
                  <Brain className="w-4 h-4 text-amber-700" />
                  <span>間隔重複記憶曲線原理</span>
                </h3>
                <p className="text-xs text-stone-600">
                  學習新單字後 24 小時內會遺忘約 70% 內容。本系統透過間隔重複算法幫你記最久！
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-white border border-stone-200 space-y-1">
                  <div className="text-lg">🌱</div>
                  <div className="font-bold text-xs text-stone-900">新學單字 (Learning)</div>
                  <p className="text-[11px] text-stone-500">首次接觸，1 天後再次安排複習</p>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-stone-200 space-y-1">
                  <div className="text-lg">🌿</div>
                  <div className="font-bold text-xs text-stone-900">複習中 (Review)</div>
                  <p className="text-[11px] text-stone-500">評定「記得」，間隔延長至 3 ~ 7 天</p>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-stone-200 space-y-1">
                  <div className="text-lg">🌳</div>
                  <div className="font-bold text-xs text-emerald-700">長期精通 (Mastered)</div>
                  <p className="text-[11px] text-stone-500">進入長期記憶，永久掌控該單字</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Confirm Button */}
        <div className="pt-4 border-t border-stone-200 mt-4 flex justify-end shrink-0">
          <button
            onClick={() => {
              soundSynth.playCorrect();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>我懂了，開始學習！</span>
          </button>
        </div>

      </div>
    </div>
  );
};

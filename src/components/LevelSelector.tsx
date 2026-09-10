import React from 'react';
import { UserProfile, WordItem, StudyMode } from '../types';
import { LEVEL_NAMES } from '../data/grade2Words';
import { calculateMasteryRate } from '../services/spacedRepetition';
import { soundSynth } from '../services/soundEffects';
import {
  Lock,
  Star,
  CheckCircle2,
  Brain,
  Volume2,
  Grid2X2,
  Sparkles,
  Flame,
  ChevronRight,
  Zap,
  Award,
  UserCheck
} from 'lucide-react';

interface LevelSelectorProps {
  userProfile: UserProfile;
  words: WordItem[];
  onSelectLevel: (levelId: number, mode: StudyMode) => void;
  dueCount: number;
  onStartDueReview: () => void;
  onOpenLogin: () => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  userProfile,
  words,
  onSelectLevel,
  dueCount,
  onStartDueReview,
  onOpenLogin,
}) => {
  const levels = [1, 2, 3, 4, 5, 6];

  // 計算全站整體單字熟練度
  const allWordIds = words.map((w) => w.id);
  const totalMasteryRate = calculateMasteryRate(allWordIds, userProfile.wordStats);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner: General Progress & Ebbinghaus Review Callout */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none text-9xl flex items-center pr-8 font-black">
          ABC
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          <div className="md:col-span-2 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FlashCard Pro - 觀光餐旅專業單字記憶系統</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight flex flex-wrap items-center gap-2">
              <span>嗨，您的座號是</span>
              <button
                onClick={() => {
                  soundSynth.playFlip();
                  onOpenLogin();
                }}
                className="px-3 py-1 rounded-2xl bg-yellow-400 text-slate-900 hover:bg-yellow-300 transition-all font-black inline-flex items-center space-x-1.5 shadow-md active:scale-95 border-2 border-white ring-2 ring-yellow-300"
                title="點擊切換座號"
              >
                <UserCheck className="w-5 h-5 text-slate-900" />
                <span className="text-xl font-black">{userProfile.seatNumber} 號</span>
                <span className="text-[11px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold">
                  點此切換座號
                </span>
              </button>
              <span>！準備好溫習觀光單字了嗎？</span>
            </h1>
            <p className="text-sm text-indigo-100 max-w-xl">
              結合艾賓浩斯記憶曲線算法，系統會自動在最適當的時機為你安排複習，幫你記最久！
            </p>

            {/* Total Mastery Bar */}
            <div className="pt-2 max-w-md">
              <div className="flex justify-between text-xs font-extrabold mb-1">
                <span>整體單字熟練度 (Mastery)</span>
                <span>{Math.round(totalMasteryRate * 100)}%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-3 p-0.5 backdrop-blur-xs overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-300 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.round(totalMasteryRate * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Ebbinghaus Review Pool Widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-amber-300" />
                <span className="font-extrabold text-sm text-white">艾賓浩斯記憶池</span>
              </div>
              {dueCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white animate-bounce">
                  {dueCount} 個單字待複習
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/80 text-white">
                  目前無到期單字
                </span>
              )}
            </div>

            <p className="text-xs text-indigo-100 leading-relaxed">
              {dueCount > 0
                ? '依記憶衰退曲線，今天有單字需要即時溫習，快來複習吧！'
                : '真棒！你目前的單字記憶狀態非常好，繼續挑戰新關卡！'}
            </p>

            <button
              onClick={() => {
                soundSynth.playFlip();
                onStartDueReview();
              }}
              disabled={dueCount === 0}
              className={`w-full py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all ${
                dueCount > 0
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-md active:scale-95'
                  : 'bg-white/20 text-white/50 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{dueCount > 0 ? '開始艾賓浩斯複習' : '複習池已清空'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Level Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <Award className="w-6 h-6 text-indigo-600" />
            <span>單字關卡地圖 (Units 1 - 6)</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">點擊關卡卡片開啟多種記憶模式</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((levelId) => {
            const isUnlocked = levelId <= userProfile.unlockedLevel;
            const levelInfo = LEVEL_NAMES[levelId] || { title: `Unit ${levelId}`, desc: '', icon: '⭐' };
            const levelWords = words.filter((w) => w.levelId === levelId);
            const levelWordIds = levelWords.map((w) => w.id);
            const mastery = calculateMasteryRate(levelWordIds, userProfile.wordStats);
            const isCompleted = mastery >= 0.8;

            return (
              <div
                key={levelId}
                className={`group relative rounded-3xl p-6 transition-all duration-300 border ${
                  isUnlocked
                    ? 'bg-white border-slate-200/90 hover:border-indigo-400 hover:shadow-xl'
                    : 'bg-slate-100/70 border-slate-200 opacity-75'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:scale-110 ${
                        isUnlocked
                          ? 'bg-indigo-50 border border-indigo-100'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isUnlocked ? levelInfo.icon : <Lock className="w-6 h-6 text-slate-400" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                          LEVEL {levelId}
                        </span>
                        {isCompleted && (
                          <span className="inline-flex items-center space-x-0.5 px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>通關</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {levelInfo.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mb-5 min-h-[32px] line-clamp-2">
                  {levelInfo.desc} ({levelWords.length} 個單字)
                </p>

                {/* Level Mastery Rate */}
                <div className="mb-6 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>關卡熟練度</span>
                    <span>{Math.round(mastery * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        mastery >= 0.8
                          ? 'bg-emerald-500'
                          : mastery > 0
                          ? 'bg-indigo-500'
                          : 'bg-slate-300'
                      }`}
                      style={{ width: `${Math.round(mastery * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons for Modes */}
                {isUnlocked ? (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        soundSynth.playFlip();
                        onSelectLevel(levelId, 'flashcard');
                      }}
                      className="px-2 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold transition-all flex items-center justify-center space-x-1"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>3D 翻牌字卡</span>
                    </button>

                    <button
                      onClick={() => {
                        soundSynth.playFlip();
                        onSelectLevel(levelId, 'listening');
                      }}
                      className="px-2 py-2 rounded-xl bg-amber-50 hover:bg-amber-500 text-amber-800 hover:text-white text-xs font-bold transition-all flex items-center justify-center space-x-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>聽力測驗</span>
                    </button>

                    <button
                      onClick={() => {
                        soundSynth.playFlip();
                        onSelectLevel(levelId, 'matching');
                      }}
                      className="px-2 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-bold transition-all flex items-center justify-center space-x-1"
                    >
                      <Grid2X2 className="w-3.5 h-3.5" />
                      <span>單字連連看</span>
                    </button>
                  </div>
                ) : (
                  <div className="py-3 bg-slate-200/50 rounded-2xl text-center text-xs font-bold text-slate-500 flex items-center justify-center space-x-1.5">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>完成上一關解鎖</span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

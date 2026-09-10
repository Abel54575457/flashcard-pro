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
  Award,
  UserCheck,
  BookOpen,
  Trophy,
  Sparkles,
  Zap,
  ChevronRight
} from 'lucide-react';

interface LevelSelectorProps {
  userProfile: UserProfile;
  words: WordItem[];
  onSelectLevel: (levelId: number, mode: StudyMode) => void;
  dueCount: number;
  onStartDueReview: () => void;
  onOpenLogin: () => void;
  onOpenGuide?: () => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  userProfile,
  words,
  onSelectLevel,
  dueCount,
  onStartDueReview,
  onOpenLogin,
  onOpenGuide,
}) => {
  // 動態抓取關卡編號 (如 1 ~ 6，甚至新匯入的 7, 8 關卡)
  const derivedLevelIds = Array.from(new Set(words.map((w) => w.levelId || 1))).sort((a, b) => a - b);
  const levels = derivedLevelIds.length > 0 ? derivedLevelIds : [1, 2, 3, 4, 5, 6];

  // 全站整體熟練度
  const allWordIds = words.map((w) => w.id);
  const totalMasteryRate = calculateMasteryRate(allWordIds, userProfile.wordStats);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Zen Hero Banner */}
      <div className="zen-card-dark p-6 sm:p-8 text-stone-100 relative overflow-hidden">
        
        {/* Subtle Zen Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Main Greeting & Progress */}
          <div className="md:col-span-2 space-y-4">
            
            {/* Tag & Action Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-stone-300 border border-white/10 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>觀光餐旅專業單字</span>
              </span>

              {onOpenGuide && (
                <button
                  onClick={() => {
                    soundSynth.playFlip();
                    onOpenGuide();
                  }}
                  className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-400/90 hover:bg-amber-400 text-stone-950 font-bold transition-all border border-amber-300 shadow-xs active:scale-95"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>通關指南</span>
                </button>
              )}

              <button
                onClick={() => {
                  soundSynth.playFlip();
                  onSelectLevel(1, 'leaderboard');
                }}
                className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 transition-all border border-white/10 active:scale-95"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>全班排行榜</span>
              </button>
            </div>

            {/* Title & Seat Info */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-stone-300 text-xs sm:text-sm font-medium tracking-wide">
                <span>座號</span>
                <button
                  onClick={() => {
                    soundSynth.playFlip();
                    onOpenLogin();
                  }}
                  className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-amber-400 text-stone-950 font-bold text-sm shadow-xs hover:bg-amber-300 transition-all border border-amber-200 active:scale-95"
                  title="點擊切換座號"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{userProfile.seatNumber} 號</span>
                  <span className="text-[10px] opacity-75 underline ml-1">切換</span>
                </button>
                <span>‧ 溫習推進中</span>
              </div>

              <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-white font-serif leading-snug">
                觀光餐旅專業單字自主學習
              </h1>
            </div>

            {/* Refined Minimalist Mastery Progress Bar */}
            <div className="pt-1 max-w-md space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-stone-300 tracking-wider">
                <span>全站單字熟練度 (Mastery)</span>
                <span className="text-amber-400 font-bold">{Math.round(totalMasteryRate * 100)}%</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(totalMasteryRate * 100)}%` }}
                />
              </div>
            </div>

          </div>

          {/* Review Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-stone-200">待複習單字池</span>
              </div>
              {dueCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                  {dueCount} 個待複習
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  狀態良好
                </span>
              )}
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-normal">
              {dueCount > 0
                ? '依記憶衰退曲線，今日有單字需及時溫習。'
                : '真棒！所有單字皆在良好記憶週期中。'}
            </p>

            <button
              onClick={() => {
                soundSynth.playFlip();
                onStartDueReview();
              }}
              disabled={dueCount === 0}
              className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all ${
                dueCount > 0
                  ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-md active:scale-95'
                  : 'bg-white/10 text-stone-500 cursor-not-allowed border border-white/5'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{dueCount > 0 ? `開始複習 (${dueCount}個單字)` : '複習池已清空'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Level Cards Grid */}
      <div className="space-y-4">
        
        {/* Section Title */}
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-700" />
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
              觀光單字關卡地圖 (Units 1 - {Math.max(...levels, 6)})
            </h2>
          </div>
          <span className="text-xs text-stone-600 font-medium hidden sm:inline">
            點擊關卡開始翻卡記憶或參與測驗
          </span>
        </div>

        {/* Level Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {levels.map((levelId) => {
            const isUnlocked = levelId <= userProfile.unlockedLevel;
            const levelWords = words.filter((w) => w.levelId === levelId);
            const levelInfo = LEVEL_NAMES[levelId] || {
              title: `Unit ${levelId}: 自訂擴充關卡`,
              desc: `包含 ${levelWords.length} 個專業單字`,
              icon: '📚'
            };
            const levelWordIds = levelWords.map((w) => w.id);
            const mastery = calculateMasteryRate(levelWordIds, userProfile.wordStats);
            const isCompleted = mastery >= 0.8;

            return (
              <div
                key={levelId}
                className={`zen-card p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between space-y-4 ${
                  isUnlocked
                    ? 'hover:border-stone-400 hover:shadow-md'
                    : 'opacity-60 bg-stone-100/60'
                }`}
              >
                {/* Card Top */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-xs ${
                          isUnlocked
                            ? 'bg-stone-100 text-stone-800 border border-stone-200/80'
                            : 'bg-stone-200 text-stone-400'
                        }`}
                      >
                        {isUnlocked ? levelInfo.icon : <Lock className="w-5 h-5 text-stone-400" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[11px] font-bold text-amber-800 tracking-wider uppercase">
                            LEVEL {levelId}
                          </span>
                          {isCompleted && (
                            <span className="inline-flex items-center space-x-0.5 px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>已通關</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-stone-900 text-base leading-snug">
                          {levelInfo.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {levelInfo.desc}
                  </p>
                </div>

                {/* Card Bottom Progress & Actions */}
                {isUnlocked ? (
                  <div className="space-y-3 pt-2 border-t border-stone-100">
                    <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                      <span>包含 {levelWords.length} 單字</span>
                      <span className="font-bold text-stone-900">熟練度 {Math.round(mastery * 100)}%</span>
                    </div>

                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(mastery * 100)}%` }}
                      />
                    </div>

                    {/* Mode Buttons */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1 text-xs font-bold">
                      <button
                        onClick={() => {
                          soundSynth.playFlip();
                          onSelectLevel(levelId, 'flashcard');
                        }}
                        className="py-2 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 transition-all flex items-center justify-center space-x-1 shadow-xs active:scale-95"
                      >
                        <span>🎴 閃卡</span>
                      </button>

                      <button
                        onClick={() => {
                          soundSynth.playFlip();
                          onSelectLevel(levelId, 'listening');
                        }}
                        className="py-2 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 transition-all flex items-center justify-center space-x-1 border border-amber-200 active:scale-95"
                      >
                        <span>🎧 聽力</span>
                      </button>

                      <button
                        onClick={() => {
                          soundSynth.playFlip();
                          onSelectLevel(levelId, 'matching');
                        }}
                        className="py-2 rounded-xl bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-all flex items-center justify-center space-x-1 border border-emerald-200 active:scale-95"
                      >
                        <span>🧩 配對</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-stone-100 text-center py-2 text-xs font-semibold text-stone-600">
                    🔒 請先通過上一關卡解鎖
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

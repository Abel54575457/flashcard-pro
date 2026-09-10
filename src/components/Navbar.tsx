import React from 'react';
import { UserProfile, ThemeColor, StudyMode } from '../types';
import { soundSynth } from '../services/soundEffects';
import {
  Flame,
  Star,
  Volume2,
  VolumeX,
  GraduationCap,
  Sparkles,
  User,
  Home,
  Brain,
  HelpCircle,
  Trophy,
  Zap
} from 'lucide-react';

interface NavbarProps {
  userProfile: UserProfile;
  currentMode: StudyMode;
  onSelectMode: (mode: StudyMode) => void;
  onOpenLogin: () => void;
  onOpenGuide?: () => void;
  onUpdateTheme: (color: ThemeColor) => void;
  speechRate: number;
  onToggleSpeechRate: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  dueCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  userProfile,
  currentMode,
  onSelectMode,
  onOpenLogin,
  onOpenGuide,
  speechRate,
  onToggleSpeechRate,
  soundEnabled,
  onToggleSound,
  dueCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#fcfbf9]/90 backdrop-blur-md border-b border-stone-200/70 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          
          {/* Brand Logo & Desktop Mode Links */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => {
                soundSynth.playFlip();
                onSelectMode('levels');
              }}
              className="flex items-center space-x-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-200 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg tracking-tight text-stone-900">
                  FlashCard <span className="text-amber-700 font-semibold">Pro</span>
                </span>
                <span className="text-[10px] text-stone-600 font-medium block leading-none">
                  觀光餐旅專業單字
                </span>
              </div>
            </button>

            {/* Desktop Mode Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 border-l border-stone-200 pl-4 text-xs font-medium">
              <button
                onClick={() => onSelectMode('levels')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                  currentMode === 'levels'
                    ? 'bg-stone-900 text-stone-100 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>關卡地圖</span>
              </button>

              <button
                onClick={() => onSelectMode('mistakes')}
                className={`relative px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                  currentMode === 'mistakes'
                    ? 'bg-stone-900 text-stone-100 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-amber-600" />
                <span>複習與錯題</span>
                {dueCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold">
                    {dueCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectMode('leaderboard')}
                className={`relative px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                  currentMode === 'leaderboard'
                    ? 'bg-stone-900 text-stone-100 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>全班排行榜</span>
              </button>
            </nav>
          </div>

          {/* Student Status & Compact Mobile Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">

            {/* Seat Badge Switch Button */}
            <button
              onClick={() => {
                soundSynth.playFlip();
                onOpenLogin();
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200/80 text-stone-800 text-xs font-bold transition-all active:scale-95 shrink-0"
              title="點擊切換座號"
            >
              <User className="w-3.5 h-3.5 text-amber-700" />
              <span>座號 {userProfile.seatNumber}</span>
            </button>

            {/* Daily Streak & Stars (Compact) */}
            <div className="flex items-center space-x-2 bg-stone-100/80 border border-stone-200/60 px-2.5 py-1.5 rounded-xl text-xs font-bold text-stone-700 shrink-0">
              <div className="flex items-center space-x-1 text-amber-700">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>{userProfile.streakDays}天</span>
              </div>
              <span className="text-stone-300">|</span>
              <div className="flex items-center space-x-1 text-amber-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-600" />
                <span>{userProfile.stars}</span>
              </div>
            </div>

            {/* Guide Quick Access Modal Button */}
            {onOpenGuide && (
              <button
                onClick={() => {
                  soundSynth.playFlip();
                  onOpenGuide();
                }}
                className="p-1.5 sm:p-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200/80 text-stone-700 transition-all shrink-0"
                title="查看通關指南與說明"
              >
                <HelpCircle className="w-4 h-4 text-amber-700" />
              </button>
            )}

            {/* Leaderboard Quick Trigger on Mobile */}
            <button
              onClick={() => onSelectMode('leaderboard')}
              className="md:hidden p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200/80 text-stone-700 transition-all shrink-0"
              title="全班排行榜"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? '關閉音效' : '開啟音效'}
              className="p-1.5 sm:p-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200/80 text-stone-600 transition-all shrink-0"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
            </button>

            {/* TTS Speed Toggle */}
            <button
              onClick={onToggleSpeechRate}
              title={`發音語速: ${speechRate === 1.0 ? '正常 (1.0x)' : '慢速 (0.7x)'}`}
              className={`p-1.5 sm:p-2 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
                speechRate < 1.0
                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                  : 'bg-stone-100 border-stone-200/80 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${speechRate < 1.0 ? 'text-amber-700 fill-amber-500' : ''}`} />
            </button>

            {/* Teacher Dashboard */}
            <button
              onClick={() => {
                soundSynth.playFlip();
                onSelectMode('teacher');
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 transition-all shadow-xs shrink-0"
              title="教師管理後台"
            >
              <GraduationCap className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

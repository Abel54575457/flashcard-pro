import React from 'react';
import { UserProfile, ThemeColor, StudyMode } from '../types';
import { soundSynth } from '../services/soundEffects';
import {
  Flame,
  Star,
  Volume2,
  VolumeX,
  Zap,
  GraduationCap,
  Sparkles,
  UserCheck,
  Palette,
  Home,
  BookOpen,
  Brain,
  RotateCcw
} from 'lucide-react';

interface NavbarProps {
  userProfile: UserProfile;
  currentMode: StudyMode;
  onSelectMode: (mode: StudyMode) => void;
  onOpenLogin: () => void;
  onUpdateTheme: (color: ThemeColor) => void;
  speechRate: number;
  onToggleSpeechRate: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  dueCount: number;
}

const THEME_CLASSES: Record<ThemeColor, { bg: string; text: string; ring: string; badge: string }> = {
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', ring: 'ring-emerald-400', badge: 'bg-emerald-100 text-emerald-800' },
  blue: { bg: 'bg-indigo-600', text: 'text-indigo-600', ring: 'ring-indigo-400', badge: 'bg-indigo-100 text-indigo-800' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-600', ring: 'ring-purple-400', badge: 'bg-purple-100 text-purple-800' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-600', ring: 'ring-amber-400', badge: 'bg-amber-100 text-amber-800' },
  rose: { bg: 'bg-rose-600', text: 'text-rose-600', ring: 'ring-rose-400', badge: 'bg-rose-100 text-rose-800' },
};

export const Navbar: React.FC<NavbarProps> = ({
  userProfile,
  currentMode,
  onSelectMode,
  onOpenLogin,
  onUpdateTheme,
  speechRate,
  onToggleSpeechRate,
  soundEnabled,
  onToggleSound,
  dueCount,
}) => {
  const theme = THEME_CLASSES[userProfile.themeColor] || THEME_CLASSES.emerald;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Main Navigation */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                soundSynth.playFlip();
                onSelectMode('levels');
              }}
              className="flex items-center space-x-2 text-left group focus:outline-none"
            >
              <div className={`w-10 h-10 rounded-xl ${theme.bg} text-white flex items-center justify-center shadow-md transform group-hover:scale-105 transition-all`}>
                <Sparkles className="w-6 h-6 animate-pulse-subtle" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                    FlashCard <span className={theme.text}>Pro</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    記憶曲線
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">觀光餐旅專業單字記憶系統</p>
              </div>
            </button>

            {/* Quick Home / Mode Switch Tabs */}
            <div className="hidden md:flex items-center space-x-1 ml-4 border-l border-slate-200 pl-4">
              <button
                onClick={() => onSelectMode('levels')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  currentMode === 'levels'
                    ? `${theme.badge} font-bold shadow-xs`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>關卡地圖</span>
              </button>

              <button
                onClick={() => onSelectMode('mistakes')}
                className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  currentMode === 'mistakes'
                    ? `${theme.badge} font-bold shadow-xs`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>複習與錯題</span>
                {dueCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs bg-rose-500 text-white font-bold animate-pulse">
                    {dueCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Student Status & Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">

            {/* Student Login / Seat Switch Button (High Priority on Mobile) */}
            <button
              onClick={() => {
                soundSynth.playFlip();
                onOpenLogin();
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs sm:text-sm font-extrabold shadow-xs transition-all shrink-0 active:scale-95"
              title="點擊切換座號"
            >
              <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>座號 {userProfile.seatNumber}</span>
            </button>

            {/* Daily Streak & Stars */}
            <div className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-bold text-slate-700 shrink-0">
              <div className="flex items-center space-x-0.5 text-amber-600">
                <Flame className="w-3.5 h-3.5 fill-amber-500 animate-bounce" />
                <span>{userProfile.streakDays}天</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center space-x-0.5 text-yellow-600">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" />
                <span>{userProfile.stars}</span>
              </div>
            </div>

            {/* Sound Effects Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? '關閉音效' : '開啟音效'}
              className="p-1.5 sm:p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all shrink-0"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* TTS Speech Rate Toggle (Hidden on narrowest screens) */}
            <button
              onClick={onToggleSpeechRate}
              title={`發音語速: ${speechRate === 1.0 ? '正常 (1.0x)' : '慢速 (0.7x)'}`}
              className={`p-1.5 sm:p-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1 border shrink-0 ${
                speechRate < 1.0
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${speechRate < 1.0 ? 'text-amber-500 fill-amber-400' : ''}`} />
              <span className="hidden sm:inline">{speechRate === 1.0 ? '1.0x' : '0.7x慢速'}</span>
            </button>

            {/* Theme Selector Palette dropdown */}
            <div className="relative group hidden sm:block">
              <button
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all"
                title="切換主題色彩"
              >
                <Palette className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-1 hidden group-hover:flex group-focus-within:flex bg-white border border-slate-200 shadow-xl rounded-xl p-2 space-x-2 z-50 animate-in fade-in zoom-in-95">
                {(['emerald', 'blue', 'purple', 'amber', 'rose'] as ThemeColor[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdateTheme(c)}
                    className={`w-6 h-6 rounded-full transition-transform hover:scale-125 ${
                      c === 'emerald' ? 'bg-emerald-500' :
                      c === 'blue' ? 'bg-indigo-500' :
                      c === 'purple' ? 'bg-purple-500' :
                      c === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                    } ${userProfile.themeColor === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''}`}
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* Teacher Dashboard Trigger */}
            <button
              onClick={() => {
                soundSynth.playFlip();
                onSelectMode('teacher');
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs shrink-0"
              title="進入教師後台"
            >
              <GraduationCap className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

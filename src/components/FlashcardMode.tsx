import React, { useState, useEffect } from 'react';
import { WordItem, WordStat } from '../types';
import { speakWord } from '../services/tts';
import { updateWordStatOnResult } from '../services/spacedRepetition';
import { soundSynth } from '../services/soundEffects';
import {
  Volume2,
  RotateCw,
  CheckCircle2,
  HelpCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lightbulb,
  Award,
  ArrowLeft,
  Volume1
} from 'lucide-react';
import { fireCelebrationConfetti, clearConfetti } from '../utils/confettiHelper';

interface FlashcardModeProps {
  words: WordItem[];
  wordStats: Record<string, WordStat>;
  onUpdateStat: (wordId: string, rating: 'remembered' | 'fuzzy' | 'forgot') => void;
  onBack: () => void;
  speechRate: number;
}

/**
 * 依英文單字/片語長度動態調整字體大小與行高，確保長單字/組織縮寫不佔滿溢出
 */
const getFrontWordFontSize = (text: string) => {
  const len = text.length;
  if (len <= 10) {
    return 'text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight';
  }
  if (len <= 20) {
    return 'text-3xl sm:text-4xl md:text-5xl font-black leading-snug tracking-tight';
  }
  if (len <= 32) {
    return 'text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug tracking-normal';
  }
  if (len <= 48) {
    return 'text-xl sm:text-2xl md:text-3xl font-extrabold leading-snug tracking-normal';
  }
  return 'text-base sm:text-xl md:text-2xl font-bold leading-snug tracking-normal';
};

/**
 * 依中文翻譯長度動態調整字體大小
 */
const getBackTranslationFontSize = (text: string) => {
  const len = text.length;
  if (len <= 6) {
    return 'text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight';
  }
  if (len <= 14) {
    return 'text-2xl sm:text-3xl md:text-4xl font-black leading-snug';
  }
  return 'text-lg sm:text-2xl md:text-3xl font-extrabold leading-snug';
};

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  words,
  wordStats,
  onUpdateStat,
  onBack,
  speechRate,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentWord = words[currentIndex];
  const currentStat = currentWord ? wordStats[currentWord.id] : undefined;

  // 切換到新單字時自動發音並重置卡片面
  useEffect(() => {
    if (currentWord) {
      setIsFlipped(false);
      setShowHint(false);
      speakWord(currentWord.word, speechRate);
    }
  }, [currentIndex, currentWord, speechRate]);

  if (!currentWord || isFinished) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">太棒了！刷卡複習完成！</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            你已經看完了本組全部 {words.length} 個單字，系統已將你的精通度寫入記憶曲線！
          </p>
          <div className="pt-4 flex justify-center space-x-4">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsFinished(false);
              }}
              className="px-6 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-sm transition-all"
            >
              再刷一次
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-200 transition-all"
            >
              返回關卡列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleRating = (rating: 'remembered' | 'fuzzy' | 'forgot') => {
    if (rating === 'remembered') {
      soundSynth.playCorrect();
    } else {
      soundSynth.playWrong();
    }

    onUpdateStat(currentWord.id, rating);

    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      fireCelebrationConfetti();
      soundSynth.playLevelClear();
      setIsFinished(true);
    }
  };

  const handleCardClick = () => {
    soundSynth.playFlip();
    setIsFlipped((prev) => !prev);
  };

  // 依單字長度動態調整卡片高度，字多自動擴大容器，保證不擠壓下方按鈕
  const wordLen = currentWord.word.length;
  const transLen = currentWord.translation.length;
  const isVeryLong = wordLen > 45 || transLen > 20;
  const isLong = wordLen > 22 || transLen > 10;

  const cardMinHeightClass = isVeryLong
    ? 'min-h-[420px] sm:min-h-[460px]'
    : isLong
    ? 'min-h-[380px] sm:min-h-[410px]'
    : 'min-h-[330px] sm:min-h-[370px]';

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {currentIndex + 1} / {words.length} 個單字
          </span>
          {currentStat && (
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
              currentStat.box >= 4 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              Leitner 箱位 {currentStat.box}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card Container - 依字數自適應高度 */}
      <div className={`perspective-1000 w-full ${cardMinHeightClass} cursor-pointer group transition-all duration-300`}>
        <div
          onClick={handleCardClick}
          className={`relative w-full h-full ${cardMinHeightClass} duration-500 transform-style-3d transition-transform shadow-2xl rounded-3xl border border-slate-100 bg-white ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front Side (English + Audio) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-5 sm:p-8 flex flex-col justify-between items-center text-center bg-gradient-to-b from-white via-slate-50 to-indigo-50/30 overflow-y-auto">
            
            {/* Top Bar: Category Pill & Hint Button */}
            <div className="w-full flex items-center justify-between shrink-0">
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 tracking-wider">
                {currentWord.category}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint((prev) => !prev);
                }}
                className="p-1.5 sm:p-2 rounded-xl text-amber-600 hover:bg-amber-50 font-semibold text-xs flex items-center space-x-1 transition-all"
              >
                <Lightbulb className="w-4 h-4 fill-amber-300" />
                <span>{showHint ? '隱藏提示' : '小提示'}</span>
              </button>
            </div>

            {/* Main Word Area - 依字數動態調整字型與間距 */}
            <div className="my-auto py-2 w-full max-w-xl mx-auto flex flex-col items-center justify-center space-y-3">
              <h2 className={`${getFrontWordFontSize(currentWord.word)} text-slate-900 break-words hyphens-auto px-2 max-w-full text-center`}>
                {currentWord.word}
              </h2>

              <div className="flex items-center justify-center pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentWord.word, speechRate);
                  }}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-200 transition-transform active:scale-95 shrink-0"
                >
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>點擊發音 ({speechRate === 1.0 ? '1.0x' : '0.7x慢速'})</span>
                </button>
              </div>

              {showHint && currentWord.hint && (
                <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-2xl max-w-md mx-auto animate-in fade-in">
                  💡 提示：{currentWord.hint}
                </p>
              )}
            </div>

            {/* Bottom Hint */}
            <div className="text-xs font-bold text-slate-400 flex items-center space-x-1 animate-pulse shrink-0 pt-1">
              <RotateCw className="w-3.5 h-3.5" />
              <span>點擊卡片翻面看中文與例句</span>
            </div>
          </div>

          {/* Card Back Side (Chinese + Phonetics + Examples) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-5 sm:p-8 flex flex-col justify-between items-center text-center bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl overflow-y-auto">
            
            <div className="w-full flex items-center justify-between text-indigo-300 text-xs font-bold shrink-0">
              <span className="px-2 py-0.5 rounded-md bg-white/10">{currentWord.partOfSpeech}</span>
              <span>音標：{currentWord.phonetic}</span>
            </div>

            {/* Back Chinese Word */}
            <div className="my-auto py-2 space-y-3 max-w-lg w-full">
              <h3 className={`${getBackTranslationFontSize(currentWord.translation)} text-yellow-300 break-words px-2`}>
                {currentWord.translation}
              </h3>

              {currentWord.exampleEn && (
                <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5 text-left max-h-[160px] overflow-y-auto">
                  <div className="flex items-start justify-between">
                    <p className="text-xs sm:text-sm font-semibold text-indigo-100 leading-relaxed">
                      {currentWord.exampleEn}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(currentWord.exampleEn, speechRate);
                      }}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white ml-2 shrink-0 transition-colors"
                      title="朗讀例句"
                    >
                      <Volume1 className="w-4 h-4" />
                    </button>
                  </div>
                  {currentWord.exampleZh && (
                    <p className="text-[11px] sm:text-xs text-slate-300 font-medium">
                      {currentWord.exampleZh}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="text-xs font-bold text-indigo-300/80 shrink-0 pt-1">
              請於下方評定你的記憶熟悉度
            </div>
          </div>

        </div>
      </div>

      {/* Leitner Rating Buttons */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
        <button
          onClick={() => handleRating('forgot')}
          className="py-3 sm:py-4 px-2 sm:px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-black text-xs sm:text-sm flex flex-col items-center justify-center space-y-0.5 sm:space-y-1 transition-all active:scale-95 shadow-xs"
        >
          <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
          <span className="truncate max-w-full">❤️ 忘記 / 不會</span>
          <span className="text-[10px] font-normal text-rose-500 hidden sm:inline">重設 Box 1</span>
        </button>

        <button
          onClick={() => handleRating('fuzzy')}
          className="py-3 sm:py-4 px-2 sm:px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-black text-xs sm:text-sm flex flex-col items-center justify-center space-y-0.5 sm:space-y-1 transition-all active:scale-95 shadow-xs"
        >
          <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
          <span className="truncate max-w-full">💛 模糊 / 似曾相識</span>
          <span className="text-[10px] font-normal text-amber-600 hidden sm:inline">明天再次複習</span>
        </button>

        <button
          onClick={() => handleRating('remembered')}
          className="py-3 sm:py-4 px-2 sm:px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-black text-xs sm:text-sm flex flex-col items-center justify-center space-y-0.5 sm:space-y-1 transition-all active:scale-95 shadow-xs"
        >
          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
          <span className="truncate max-w-full">💚 記得 / 完全精通</span>
          <span className="text-[10px] font-normal text-emerald-600 hidden sm:inline">晉升下個箱位</span>
        </button>
      </div>

    </div>
  );
};

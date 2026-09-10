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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>

        <div className="flex items-center space-x-3">
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

      {/* 3D Flip Card Container */}
      <div className="perspective-1000 w-full min-h-[380px] sm:min-h-[420px] cursor-pointer group">
        <div
          onClick={handleCardClick}
          className={`relative w-full h-full min-h-[380px] sm:min-h-[420px] duration-500 transform-style-3d transition-transform shadow-2xl rounded-3xl border border-slate-100 bg-white ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front Side (English + Audio) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-8 flex flex-col justify-between items-center text-center bg-gradient-to-b from-white via-slate-50 to-indigo-50/30">
            
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 tracking-wider">
                {currentWord.category}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint((prev) => !prev);
                }}
                className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 font-semibold text-xs flex items-center space-x-1 transition-all"
              >
                <Lightbulb className="w-4 h-4 fill-amber-300" />
                <span>{showHint ? '隱藏提示' : '小提示'}</span>
              </button>
            </div>

            {/* Main Word */}
            <div className="my-auto space-y-4">
              <h2 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
                {currentWord.word}
              </h2>

              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentWord.word, speechRate);
                  }}
                  className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-indigo-200 transition-transform active:scale-95"
                >
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>點擊發音 ({speechRate === 1.0 ? '1.0x' : '0.7x慢速'})</span>
                </button>
              </div>

              {showHint && currentWord.hint && (
                <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl max-w-md mx-auto animate-in fade-in">
                  💡 提示：{currentWord.hint}
                </p>
              )}
            </div>

            <div className="text-xs font-bold text-slate-400 flex items-center space-x-1 animate-pulse">
              <RotateCw className="w-3.5 h-3.5" />
              <span>點擊卡片翻面看中文與例句</span>
            </div>
          </div>

          {/* Card Back Side (Chinese + Phonetics + Examples) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-8 flex flex-col justify-between items-center text-center bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl">
            
            <div className="w-full flex items-center justify-between text-indigo-300 text-xs font-bold">
              <span>{currentWord.partOfSpeech}</span>
              <span>音標：{currentWord.phonetic}</span>
            </div>

            {/* Back Chinese Word */}
            <div className="my-auto space-y-4 max-w-lg">
              <h3 className="text-4xl sm:text-5xl font-black text-yellow-300 tracking-tight">
                {currentWord.translation}
              </h3>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2 text-left">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold text-indigo-100">
                    {currentWord.exampleEn}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentWord.exampleEn, speechRate);
                    }}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white ml-2 shrink-0"
                    title="朗讀例句"
                  >
                    <Volume1 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {currentWord.exampleZh}
                </p>
              </div>
            </div>

            <div className="text-xs font-bold text-indigo-300/80">
              請下方評定你的記憶熟悉度
            </div>
          </div>

        </div>
      </div>

      {/* Leitner Rating Buttons */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <button
          onClick={() => handleRating('forgot')}
          className="py-4 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-black text-xs sm:text-sm flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 shadow-xs"
        >
          <XCircle className="w-6 h-6 text-rose-500" />
          <span>❤️ 忘記 / 不會</span>
          <span className="text-[10px] font-normal text-rose-500">重設 Box 1</span>
        </button>

        <button
          onClick={() => handleRating('fuzzy')}
          className="py-4 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-black text-xs sm:text-sm flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 shadow-xs"
        >
          <HelpCircle className="w-6 h-6 text-amber-500" />
          <span>💛 模糊 / 似曾相識</span>
          <span className="text-[10px] font-normal text-amber-600">明天再次複習</span>
        </button>

        <button
          onClick={() => handleRating('remembered')}
          className="py-4 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-black text-xs sm:text-sm flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 shadow-xs"
        >
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          <span>💚 記得 / 完全精通</span>
          <span className="text-[10px] font-normal text-emerald-600">晉升下個箱位</span>
        </button>
      </div>

    </div>
  );
};

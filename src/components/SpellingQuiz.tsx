import React, { useState, useEffect } from 'react';
import { WordItem } from '../types';
import { speakWord } from '../services/tts';
import { soundSynth } from '../services/soundEffects';
import { Volume2, ArrowLeft, RotateCcw, Check, Award, Lightbulb, Type } from 'lucide-react';
import { fireCelebrationConfetti, clearConfetti } from '../utils/confettiHelper';

interface SpellingQuizProps {
  words: WordItem[];
  onBack: () => void;
  onUpdateScore: (earnedStars: number) => void;
  speechRate: number;
}

export const SpellingQuiz: React.FC<SpellingQuizProps> = ({
  words,
  onBack,
  onUpdateScore,
  speechRate,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<{ id: string; char: string }[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{ id: string; char: string }[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentWord = words[currentIndex];

  useEffect(() => {
    if (!currentWord) return;

    // 將單字拆成字母，加上亂數 ID 並打亂
    const letters = currentWord.word.split('').map((char, index) => ({
      id: `${currentWord.id}_${index}_${Math.random()}`,
      char: char.toLowerCase(),
    }));

    // 隨機洗牌
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setScrambledLetters(shuffled);
    setSelectedLetters([]);
    setIsCorrect(null);
    setShowHint(false);

    speakWord(currentWord.word, speechRate);
  }, [currentIndex, currentWord, speechRate]);

  if (!currentWord || isFinished) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 space-y-6">
          <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">拼字大冒險完成！</h2>
          <div className="text-4xl font-extrabold text-purple-600">
            得分：{score} / {words.length}
          </div>
          <p className="text-sm text-slate-600">拼字大師！你贏得了額外的星星！</p>
          <div className="pt-4 flex justify-center space-x-4">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setIsFinished(false);
              }}
              className="px-6 py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-sm transition-all"
            >
              再拼一次
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-md transition-all"
            >
              返回關卡地圖
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePickLetter = (item: { id: string; char: string }) => {
    soundSynth.playFlip();
    setSelectedLetters((prev) => [...prev, item]);
    setScrambledLetters((prev) => prev.filter((l) => l.id !== item.id));
  };

  const handleRemoveLetter = (item: { id: string; char: string }) => {
    soundSynth.playFlip();
    setSelectedLetters((prev) => prev.filter((l) => l.id !== item.id));
    setScrambledLetters((prev) => [...prev, item]);
  };

  const handleCheckSpelling = () => {
    const spelled = selectedLetters.map((l) => l.char).join('');
    const target = currentWord.word.toLowerCase();

    if (spelled === target) {
      soundSynth.playCorrect();
      setIsCorrect(true);
      setScore((prev) => prev + 1);

      setTimeout(() => {
        if (currentIndex < words.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          onUpdateScore(Math.ceil((score / words.length) * 10));
          fireCelebrationConfetti();
          soundSynth.playLevelClear();
          setIsFinished(true);
        }
      }, 1200);
    } else {
      soundSynth.playWrong();
      setIsCorrect(false);
    }
  };

  const handleReset = () => {
    const letters = currentWord.word.split('').map((char, index) => ({
      id: `${currentWord.id}_${index}_${Math.random()}`,
      char: char.toLowerCase(),
    }));
    setScrambledLetters([...letters].sort(() => Math.random() - 0.5));
    setSelectedLetters([]);
    setIsCorrect(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>

        <span className="text-xs font-black bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
          拼字關卡 {currentIndex + 1} / {words.length}
        </span>
      </div>

      {/* Target Word Prompt Card */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 text-white text-center shadow-xl space-y-4">
        <button
          onClick={() => speakWord(currentWord.word, speechRate)}
          className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs inline-flex items-center space-x-2 backdrop-blur-md"
        >
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span>點擊聽發音</span>
        </button>

        <h2 className="text-4xl font-black text-yellow-300">
          {currentWord.translation}
        </h2>

        <p className="text-xs text-indigo-100">
          音標：{currentWord.phonetic} | 分類：{currentWord.category}
        </p>

        {showHint && currentWord.hint && (
          <p className="text-xs bg-white/10 p-2 rounded-xl text-amber-200 animate-in fade-in">
            💡 提示：{currentWord.hint}
          </p>
        )}
      </div>

      {/* Answer Slots */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4 text-center">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          已拼出的字母 (點擊可移出)
        </span>

        <div className="flex flex-wrap justify-center gap-2 min-h-[64px] items-center p-3 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
          {selectedLetters.map((item) => (
            <button
              key={item.id}
              onClick={() => handleRemoveLetter(item)}
              className="w-12 h-12 rounded-xl bg-purple-600 text-white font-black text-2xl shadow-md hover:bg-purple-700 transition-transform active:scale-95 flex items-center justify-center uppercase"
            >
              {item.char}
            </button>
          ))}
          {selectedLetters.length === 0 && (
            <span className="text-xs text-slate-400 font-semibold">
              點擊下方字母方塊進行拼字...
            </span>
          )}
        </div>

        {/* Feedback Alert */}
        {isCorrect === true && (
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-sm animate-bounce">
            🎉 答對了！太厲害了！
          </div>
        )}
        {isCorrect === false && (
          <div className="p-3 rounded-2xl bg-rose-100 text-rose-800 font-black text-sm">
            ❌ 拼法不太對喔，再試試看！
          </div>
        )}
      </div>

      {/* Scrambled Letters Pool */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-slate-600">待選字母池</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowHint(true)}
              className="text-xs font-bold text-amber-600 flex items-center space-x-1"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>小提示</span>
            </button>
            <button
              onClick={handleReset}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {scrambledLetters.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePickLetter(item)}
              className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-200 hover:border-purple-500 text-slate-900 font-black text-2xl shadow-sm hover:shadow-md transition-all active:scale-90 uppercase flex items-center justify-center"
            >
              {item.char}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleCheckSpelling}
        disabled={selectedLetters.length === 0}
        className={`w-full py-4 rounded-2xl font-black text-base transition-all shadow-lg flex items-center justify-center space-x-2 ${
          selectedLetters.length > 0
            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200 active:scale-[0.99]'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Check className="w-5 h-5" />
        <span>檢查拼字答案</span>
      </button>

    </div>
  );
};

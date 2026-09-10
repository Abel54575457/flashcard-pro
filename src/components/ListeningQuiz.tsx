import React, { useState, useEffect } from 'react';
import { WordItem, QuizQuestion } from '../types';
import { speakWord } from '../services/tts';
import { soundSynth } from '../services/soundEffects';
import { Volume2, ArrowLeft, Award, Sparkles, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { fireCelebrationConfetti, clearConfetti } from '../utils/confettiHelper';

interface ListeningQuizProps {
  words: WordItem[];
  allWords: WordItem[];
  onBack: () => void;
  onUpdateScore: (earnedStars: number) => void;
  onUpdateStat?: (wordId: string, rating: 'remembered' | 'fuzzy' | 'forgot') => void;
  speechRate: number;
}

export const ListeningQuiz: React.FC<ListeningQuizProps> = ({
  words,
  allWords,
  onBack,
  onUpdateScore,
  onUpdateStat,
  speechRate,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // 初始化題目
  useEffect(() => {
    if (!words || words.length === 0) return;
    const generated: QuizQuestion[] = words.map((target) => {
      // 隨機抽取 3 個混淆選項
      const distractors = allWords
        .filter((w) => w.id !== target.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w.translation);

      const options = [target.translation, ...distractors].sort(() => Math.random() - 0.5);
      return {
        word: target,
        options,
        correctAnswer: target.translation,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
  }, [words, allWords]);

  const currentQ = questions[currentIndex];

  // 題目變更時自動播放發音
  useEffect(() => {
    if (currentQ && !isFinished) {
      setSelectedAnswer(null);
      speakWord(currentQ.word.word, speechRate);
    }
  }, [currentIndex, currentQ, isFinished, speechRate]);

  if (!currentQ || isFinished) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 space-y-6">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">聽力測驗完成！</h2>
          <div className="text-4xl font-extrabold text-indigo-600">
            得分：{score} / {questions.length}
          </div>
          <p className="text-sm text-slate-600">
            你贏得了 +{Math.ceil((score / Math.max(1, questions.length)) * 10)} 顆星星獎勵！
          </p>
          <div className="pt-4 flex justify-center space-x-4">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setIsFinished(false);
              }}
              className="px-6 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-sm transition-all"
            >
              再測驗一次
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition-all"
            >
              返回關卡地圖
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSelect = (option: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(option);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      soundSynth.playCorrect();
      setScore((prev) => prev + 1);
    } else {
      soundSynth.playWrong();
    }

    if (onUpdateStat) {
      onUpdateStat(currentQ.word.id, isCorrect ? 'remembered' : 'forgot');
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        const starsEarned = Math.ceil((score / questions.length) * 10);
        onUpdateScore(starsEarned);
        fireCelebrationConfetti();
        soundSynth.playLevelClear();
        setIsFinished(true);
      }
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>

        <span className="text-xs font-black bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
          題目 {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-amber-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Listening Audio Card */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl space-y-6 relative overflow-hidden">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto shadow-inner">
          <button
            onClick={() => speakWord(currentQ.word.word, speechRate)}
            className="w-18 h-18 bg-white text-amber-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-95 transition-all"
            title="點擊重播發音"
          >
            <Volume2 className="w-9 h-9 animate-pulse" />
          </button>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black">聽發音，選擇正確中文意思</h2>
          <p className="text-xs text-amber-100 mt-1">點擊上方喇叭按鈕可重複聽音</p>
        </div>
      </div>

      {/* 4 Choices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentQ.options.map((opt, idx) => {
          let btnStyle = 'bg-white border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-800';
          if (selectedAnswer !== null) {
            if (opt === currentQ.correctAnswer) {
              btnStyle = 'bg-emerald-500 border-emerald-500 text-white font-black shadow-lg';
            } else if (opt === selectedAnswer) {
              btnStyle = 'bg-rose-500 border-rose-500 text-white font-black';
            } else {
              btnStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              disabled={selectedAnswer !== null}
              onClick={() => handleSelect(opt)}
              className={`p-5 rounded-2xl border-2 text-lg font-extrabold text-left transition-all duration-200 flex items-center justify-between shadow-xs ${btnStyle}`}
            >
              <span>{opt}</span>
              {selectedAnswer !== null && opt === currentQ.correctAnswer && (
                <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
              )}
              {selectedAnswer === opt && opt !== currentQ.correctAnswer && (
                <XCircle className="w-6 h-6 text-white shrink-0" />
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
};

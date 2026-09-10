import React, { useState, useEffect } from 'react';
import { WordItem } from '../types';
import { speakWord } from '../services/tts';
import { soundSynth } from '../services/soundEffects';
import { ArrowLeft, Award, Timer, Flame, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { fireCelebrationConfetti, clearConfetti } from '../utils/confettiHelper';

interface MemoryMatchGameProps {
  words: WordItem[];
  onBack: () => void;
  onUpdateScore: (earnedStars: number) => void;
  onUpdateStat?: (wordId: string, rating: 'remembered' | 'fuzzy' | 'forgot') => void;
  speechRate: number;
}

interface CardTile {
  uid: string;
  wordId: string;
  text: string;
  type: 'en' | 'zh';
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  words,
  onBack,
  onUpdateScore,
  onUpdateStat,
  speechRate,
}) => {
  const [cards, setCards] = useState<CardTile[]>([]);
  const [flippedCards, setFlippedCards] = useState<CardTile[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // 初始化連連看卡牌 (從本關挑選 6 個單字 = 12 張牌)
  useEffect(() => {
    initGame();
  }, [words]);

  // 60 秒倒數計時器
  useEffect(() => {
    if (isGameOver || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isGameOver]);

  const initGame = () => {
    const selectedWords = [...words].sort(() => Math.random() - 0.5).slice(0, 6);
    const tiles: CardTile[] = [];

    selectedWords.forEach((w) => {
      tiles.push({
        uid: `en_${w.id}_${Math.random()}`,
        wordId: w.id,
        text: w.word,
        type: 'en',
        isFlipped: false,
        isMatched: false,
      });
      tiles.push({
        uid: `zh_${w.id}_${Math.random()}`,
        wordId: w.id,
        text: w.translation,
        type: 'zh',
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(tiles.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMatchedPairs(0);
    setScore(0);
    setCombo(0);
    setTimeLeft(60);
    setIsGameOver(false);
  };

  const handleCardClick = (clickedCard: CardTile) => {
    if (clickedCard.isFlipped || clickedCard.isMatched || flippedCards.length >= 2) return;

    soundSynth.playFlip();

    if (clickedCard.type === 'en') {
      speakWord(clickedCard.text, speechRate);
    }

    const updated = cards.map((c) =>
      c.uid === clickedCard.uid ? { ...c, isFlipped: true } : c
    );
    setCards(updated);

    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (first.wordId === second.wordId) {
        // 配對成功！
        soundSynth.playCorrect();
        if (onUpdateStat) {
          onUpdateStat(first.wordId, 'remembered');
        }
        setMatchedPairs((prev) => {
          const nextPairs = prev + 1;
          if (nextPairs === 6) {
            setTimeout(() => endGame(true), 500);
          }
          return nextPairs;
        });

        setCombo((prev) => prev + 1);
        setScore((prev) => prev + 100 + combo * 50);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.wordId === first.wordId ? { ...c, isMatched: true } : c
            )
          );
          setFlippedCards([]);
        }, 500);
      } else {
        // 配對失敗
        soundSynth.playWrong();
        setCombo(0);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.uid === first.uid || c.uid === second.uid ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const endGame = (isWin: boolean) => {
    setIsGameOver(true);
    if (isWin) {
      fireCelebrationConfetti();
      soundSynth.playLevelClear();
      onUpdateScore(15);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-sm">
            <Timer className="w-4 h-4" />
            <span>{timeLeft} 秒</span>
          </div>

          <div className="flex items-center space-x-1 font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Score: {score}</span>
          </div>
        </div>
      </div>

      {/* Game Grid */}
      {!isGameOver ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {cards.map((card) => {
            const isVisible = card.isFlipped || card.isMatched;
            return (
              <button
                key={card.uid}
                onClick={() => handleCardClick(card)}
                disabled={card.isMatched}
                className={`h-28 sm:h-32 rounded-3xl font-black text-base sm:text-xl p-3 flex items-center justify-center text-center transition-all duration-300 transform active:scale-95 shadow-md border-2 ${
                  card.isMatched
                    ? 'bg-emerald-500 text-white border-emerald-500 opacity-60 cursor-default scale-95'
                    : isVisible
                    ? card.type === 'en'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
                      : 'bg-amber-500 text-white border-amber-500 shadow-amber-200'
                    : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-400 hover:text-slate-600'
                }`}
              >
                {isVisible ? (
                  <span className="animate-in zoom-in-95">{card.text}</span>
                ) : (
                  <span className="text-2xl opacity-40">❓</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* Game Over Modal */
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-xl border border-slate-100 space-y-6 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">
            {matchedPairs === 6 ? '🎉 全部配對成功！' : '時間到囉！'}
          </h2>
          <div className="text-4xl font-black text-indigo-600">
            總得分：{score}
          </div>
          <p className="text-xs text-slate-500">
            成功配對 {matchedPairs} / 6 組單字！
          </p>
          <div className="pt-4 flex justify-center space-x-4">
            <button
              onClick={initGame}
              className="px-6 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-sm transition-all flex items-center space-x-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>再玩一次</span>
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition-all"
            >
              返回關卡地圖
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { WordItem, WordStat, StudyMode } from '../types';
import { isWordDueForReview } from '../services/spacedRepetition';
import { speakWord } from '../services/tts';
import { soundSynth } from '../services/soundEffects';
import {
  Brain,
  XCircle,
  Volume2,
  Play,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Layers,
  HelpCircle
} from 'lucide-react';

interface MistakeNotebookProps {
  words: WordItem[];
  wordStats: Record<string, WordStat>;
  onStartReviewSession: (selectedWords: WordItem[]) => void;
  onBack: () => void;
  speechRate: number;
}

export const MistakeNotebook: React.FC<MistakeNotebookProps> = ({
  words,
  wordStats,
  onStartReviewSession,
  onBack,
  speechRate,
}) => {
  const [activeTab, setActiveTab] = useState<'due' | 'mistakes'>('due');

  // 計算待複習單字
  const dueWords = words.filter((w) => isWordDueForReview(wordStats[w.id]));

  // 計算曾經答錯的單字
  const mistakeWords = words.filter((w) => {
    const stat = wordStats[w.id];
    return stat && stat.wrongCount > 0;
  });

  const displayWords = activeTab === 'due' ? dueWords : mistakeWords;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-in fade-in">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回關卡地圖</span>
        </button>

        <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
          <Brain className="w-6 h-6 text-indigo-600" />
          <span>記憶曲線與錯題複習庫</span>
        </h1>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-slate-200/80 p-1.5 rounded-2xl max-w-md mx-auto">
        <button
          onClick={() => {
            soundSynth.playFlip();
            setActiveTab('due');
          }}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'due'
              ? 'bg-white text-indigo-700 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>待複習單字池 ({dueWords.length})</span>
        </button>

        <button
          onClick={() => {
            soundSynth.playFlip();
            setActiveTab('mistakes');
          }}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'mistakes'
              ? 'bg-white text-rose-700 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>歷史錯題本 ({mistakeWords.length})</span>
        </button>
      </div>

      {/* Action Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-stone-900">
            {activeTab === 'due' ? '待複習單字' : '歷史錯題本'}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {activeTab === 'due'
              ? `共 ${dueWords.length} 個單字待溫習`
              : `共 ${mistakeWords.length} 個錯題單字`}
          </p>
        </div>

        {displayWords.length > 0 && (
          <button
            onClick={() => onStartReviewSession(displayWords)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center space-x-2 shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>開始專屬刷卡練習 ({displayWords.length})</span>
          </button>
        )}
      </div>

      {/* Word List Table / Cards Grid */}
      {displayWords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayWords.map((word) => {
            const stat = wordStats[word.id];
            const box = stat ? stat.box : 1;
            const wrongCount = stat ? stat.wrongCount : 0;
            const correctCount = stat ? stat.correctCount : 0;

            return (
              <div
                key={word.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black uppercase text-indigo-600">
                      Unit {word.levelId}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {word.category}
                    </span>
                  </div>

                  <button
                    onClick={() => speakWord(word.word, speechRate)}
                    className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                    title="朗讀發音"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <div className="flex items-baseline space-x-2">
                    <h3 className="text-2xl font-black text-slate-900">{word.word}</h3>
                    <span className="text-xs text-slate-500 font-semibold">{word.phonetic}</span>
                  </div>
                  <p className="text-base font-extrabold text-indigo-700">{word.translation}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Leitner 箱位 {box}
                  </span>
                  <span>
                    答對 {correctCount} 次 | 答錯 {wrongCount} 次
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">非常完美！</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'due'
              ? '目前沒有記憶衰退到期的單字，請繼續挑戰新關卡！'
              : '你目前沒有任何歷史錯題紀錄，真棒！'}
          </p>
        </div>
      )}

    </div>
  );
};

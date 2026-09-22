import React, { useState } from 'react';
import { WordItem, UserProfile } from '../types';
import { soundSynth } from '../services/soundEffects';
import { LEVEL_NAMES } from '../data/grade2Words';
import {
  BookOpen,
  Search,
  Volume2,
  X,
  Filter,
  CheckCircle2,
  Sparkles,
  Printer,
  Grid,
  List,
  Flame,
  Star,
  Tag
} from 'lucide-react';

interface VocabularyMasterListModalProps {
  words: WordItem[];
  userProfile?: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const VocabularyMasterListModal: React.FC<VocabularyMasterListModalProps> = ({
  words,
  userProfile,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  if (!isOpen) return null;

  // 動態提取所有 Level 及 Category 分類
  const derivedLevels = Array.from(new Set(words.map((w) => w.levelId || 1))).sort((a, b) => a - b);
  const categories = Array.from(new Set(words.map((w) => w.category || 'General'))).filter(Boolean);

  // 篩選邏輯
  const filteredWords = words.filter((w) => {
    const matchesLevel = selectedLevel === 'all' || w.levelId === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || w.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      w.word.toLowerCase().includes(q) ||
      w.translation.includes(q) ||
      (w.phonetic && w.phonetic.toLowerCase().includes(q)) ||
      (w.exampleEn && w.exampleEn.toLowerCase().includes(q)) ||
      (w.exampleZh && w.exampleZh.includes(q));

    return matchesLevel && matchesCategory && matchesQuery;
  });

  const handlePrint = () => {
    soundSynth.playCorrect();
    window.print();
  };

  const playWordAudio = (word: string) => {
    soundSynth.speakWord(word);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fcfbf9] w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="bg-stone-900 text-stone-100 p-5 sm:p-6 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-xs font-bold shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
                  觀光餐旅英文 必學單字總表
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-400 text-stone-950">
                  共 {words.length} 單字
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                課前預習、課後對照與專題複習單字庫 ‧ 點擊即可朗讀與查閱範例
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all border border-stone-700"
              title="列印或儲存為 PDF 單字學習對照表"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>列印 / 匯出 PDF</span>
            </button>

            <button
              onClick={() => {
                soundSynth.playFlip();
                onClose();
              }}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-stone-200/80 space-y-3 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋英文、中文翻譯或例句..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Mode Toggle & Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Category Dropdown */}
              <div className="flex items-center space-x-1 bg-stone-50 px-2 py-1 rounded-xl border border-stone-200 text-xs font-bold text-stone-700">
                <Tag className="w-3.5 h-3.5 text-amber-700" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="all">全部分類 ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Switch */}
              <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'grid' ? 'bg-stone-900 text-stone-100 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="網格卡片視圖"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'table' ? 'bg-stone-900 text-stone-100 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="表格條列視圖"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* Unit Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            <button
              onClick={() => setSelectedLevel('all')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                selectedLevel === 'all'
                  ? 'bg-amber-400 text-stone-950 shadow-xs font-extrabold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              全部單字 ({words.length})
            </button>

            {derivedLevels.map((lvl) => {
              const count = words.filter((w) => w.levelId === lvl).length;
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    selectedLevel === lvl
                      ? 'bg-stone-900 text-stone-100 shadow-xs font-extrabold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Unit {lvl} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {filteredWords.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-600">未找到符合條件的單字</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLevel('all');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-stone-950 text-xs font-extrabold"
              >
                清除所有搜尋條件
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWords.map((w) => {
                const stat = userProfile?.wordStats?.[w.id];
                const isMastered = stat && stat.intervalDays >= 7;

                return (
                  <div
                    key={w.id}
                    className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-3 relative group hover:border-amber-400 transition-all"
                  >
                    {/* Top Level & Audio Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[11px]">
                          Unit {w.levelId || 1}
                        </span>
                        {w.category && (
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-bold text-[10px]">
                            {w.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        {isMastered && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center space-x-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>熟練</span>
                          </span>
                        )}

                        <button
                          onClick={() => playWordAudio(w.word)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition-all"
                          title="朗讀發音"
                        >
                          <Volume2 className="w-4 h-4 text-amber-700" />
                        </button>
                      </div>
                    </div>

                    {/* Word Title & Phonetic */}
                    <div>
                      <div className="flex items-baseline space-x-2">
                        <h3 className="text-xl sm:text-2xl font-black text-stone-900 font-serif tracking-tight">
                          {w.word}
                        </h3>
                        {w.partOfSpeech && (
                          <span className="text-xs font-bold text-amber-800 italic">
                            {w.partOfSpeech}
                          </span>
                        )}
                      </div>
                      {w.phonetic && (
                        <p className="text-xs font-mono text-stone-500 font-medium">
                          {w.phonetic}
                        </p>
                      )}
                    </div>

                    {/* Chinese Translation */}
                    <div className="pt-2 border-t border-stone-100">
                      <p className="text-base font-extrabold text-stone-900">
                        {w.translation}
                      </p>
                    </div>

                    {/* Examples */}
                    {(w.exampleEn || w.exampleZh) && (
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1 text-xs">
                        {w.exampleEn && (
                          <p className="font-medium text-stone-800 leading-snug">
                            {w.exampleEn}
                          </p>
                        )}
                        {w.exampleZh && (
                          <p className="text-stone-500 text-[11px] font-normal">
                            {w.exampleZh}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Context Hint */}
                    {w.hint && (
                      <p className="text-[11px] text-amber-800 font-medium bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                        💡 {w.hint}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-900 text-stone-100 font-bold border-b border-stone-800">
                    <th className="py-3 px-4">關卡</th>
                    <th className="py-3 px-4">單字 (Word)</th>
                    <th className="py-3 px-4">詞性</th>
                    <th className="py-3 px-4">中文翻譯</th>
                    <th className="py-3 px-4">分類</th>
                    <th className="py-3 px-4">例句與提示</th>
                    <th className="py-3 px-4 text-center">發音</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredWords.map((w) => (
                    <tr key={w.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-amber-900">Unit {w.levelId}</td>
                      <td className="py-3 px-4 font-black text-stone-900 text-sm">{w.word}</td>
                      <td className="py-3 px-4 text-amber-800 font-semibold italic">{w.partOfSpeech || 'n.'}</td>
                      <td className="py-3 px-4 font-bold text-stone-900">{w.translation}</td>
                      <td className="py-3 px-4 text-stone-600">{w.category || 'General'}</td>
                      <td className="py-3 px-4 max-w-xs space-y-0.5">
                        <p className="text-stone-800 font-normal line-clamp-1">{w.exampleEn}</p>
                        <p className="text-stone-500 text-[11px] line-clamp-1">{w.exampleZh}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => playWordAudio(w.word)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition-all inline-block"
                        >
                          <Volume2 className="w-4 h-4 text-amber-700" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600 shrink-0">
          <span>目前顯示 {filteredWords.length} / 共 {words.length} 單字</span>
          <button
            onClick={() => {
              soundSynth.playFlip();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-stone-900 text-stone-100 font-bold hover:bg-stone-800 transition-all shadow-xs"
          >
            關閉總表
          </button>
        </div>

      </div>
    </div>
  );
};

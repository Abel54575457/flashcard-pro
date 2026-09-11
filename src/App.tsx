import React, { useState, useEffect } from 'react';
import { UserProfile, WordItem, StudyMode, ThemeColor, WordStat } from './types';
import { loadUserProfile, loadUserProfileSync, saveLocalProfile, getLocalProfile, getLocalProfileForSeat, getCustomWords, saveCustomWords, resetCustomWordsToDefault, mergeUserProfiles, createDefaultProfile } from './services/storage';
import { isWordDueForReview, updateWordStatOnResult, calculateMasteryRate } from './services/spacedRepetition';
import { initFirebase, fetchUserFromFirestore } from './services/firebase';
import { soundSynth } from './services/soundEffects';

import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { GuideModal } from './components/GuideModal';
import { LevelSelector } from './components/LevelSelector';
import { FlashcardMode } from './components/FlashcardMode';
import { ListeningQuiz } from './components/ListeningQuiz';
import { MemoryMatchGame } from './components/MemoryMatchGame';
import { MistakeNotebook } from './components/MistakeNotebook';
import { Leaderboard } from './components/Leaderboard';
import { TeacherDashboard } from './components/TeacherDashboard';

import { initAudioUnlock } from './services/tts';
import { initLiff, getLiffUserProfile } from './services/liff';

export function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [words, setWords] = useState<WordItem[]>([]);
  const [currentMode, setCurrentMode] = useState<StudyMode>('levels');
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [sessionWords, setSessionWords] = useState<WordItem[]>([]);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(false);

  // 初始化載入
  useEffect(() => {
    // 全局解鎖瀏覽器音訊與 TTS 權限
    initAudioUnlock();

    // 檢查 Firebase
    const fbActive = initFirebase();
    setIsFirebaseActive(fbActive);

    // 載入自訂/預設單字
    const loadedWords = getCustomWords();
    setWords(loadedWords);

    // 載入上次紀錄之座號檔案 (預設為 01)
    const local = getLocalProfile();
    const initialSeat = local?.seatNumber || '01';
    const initialProfile = loadUserProfileSync(initialSeat);
    setUserProfile(initialProfile);

    // 背景同步遠端 Firebase (無損合併，絕不上鎖或覆寫本機較高進度)
    fetchUserFromFirestore(initialSeat).then((remote) => {
      if (remote) {
        setUserProfile((curr) => {
          if (!curr || curr.seatNumber !== initialSeat) return curr;
          const merged = mergeUserProfiles(curr, remote);
          saveLocalProfile(merged);
          return merged;
        });
      }
    }).catch(() => {});

    // 初始化 LINE LIFF，若於 LINE 聊天室開啟則自動辨識頭像與暱稱
    getLiffUserProfile().then((liffUser) => {
      if (liffUser) {
        setUserProfile((curr) => {
          if (!curr) return curr;
          const updated = {
            ...curr,
            lineDisplayName: liffUser.displayName,
            linePictureUrl: liffUser.pictureUrl,
            lineUserId: liffUser.userId,
          };
          saveLocalProfile(updated);
          return updated;
        });
      }
    }).catch(() => {});
  }, []);

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-black text-slate-700">正在載入 FlashCard Pro 學習庫...</p>
        </div>
      </div>
    );
  }

  // 待複習單字計數
  const dueCount = words.filter((w) => isWordDueForReview(userProfile.wordStats[w.id])).length;

  // 學生切換座號登入 (零延遲同步更新)
  const handleStudentLogin = (seatNumber: string, classCode: string, themeColor: ThemeColor) => {
    const local = getLocalProfileForSeat(seatNumber);
    const initialBase = local || createDefaultProfile(seatNumber, classCode);
    const initialProfile: UserProfile = {
      ...initialBase,
      seatNumber,
      classCode,
      themeColor,
    };

    // 1. 立即同步更新 React 狀態與 LocalStorage (0ms 延遲)
    setUserProfile(initialProfile);

    // 2. 背景同步 Firebase 雲端資料 (無損合併，確保進度與關卡不被洗掉)
    fetchUserFromFirestore(seatNumber).then((remote) => {
      if (remote) {
        setUserProfile((curr) => {
          if (curr && curr.seatNumber === seatNumber) {
            const merged = mergeUserProfiles(curr, remote);
            const finalProfile = { ...merged, themeColor, classCode };
            saveLocalProfile(finalProfile);
            return finalProfile;
          }
          return curr;
        });
      } else {
        saveLocalProfile(initialProfile);
      }
    }).catch(() => {
      saveLocalProfile(initialProfile);
    });
  };

  // 切換主題顏色
  const handleUpdateTheme = (color: ThemeColor) => {
    if (!userProfile) return;
    const updated = { ...userProfile, themeColor: color };
    setUserProfile(updated);
    saveLocalProfile(updated);
  };

  // 選擇關卡與學習模式
  const handleSelectLevelMode = (levelId: number, mode: StudyMode) => {
    setSelectedLevelId(levelId);
    const filteredWords = words.filter((w) => w.levelId === levelId);
    setSessionWords(filteredWords);
    setCurrentMode(mode);
  };

  // 開啟待複習池
  const handleStartDueReview = () => {
    const dueWords = words.filter((w) => isWordDueForReview(userProfile.wordStats[w.id]));
    if (dueWords.length > 0) {
      setSessionWords(dueWords);
      setCurrentMode('flashcard');
    }
  };

  // 開啟自訂複習清單 (從錯題本發起)
  const handleStartCustomReviewSession = (selectedWords: WordItem[]) => {
    setSessionWords(selectedWords);
    setCurrentMode('flashcard');
  };

  // 刷卡評定反饋 (更新間隔重複算法與解鎖邏輯)
  const handleUpdateWordStat = (wordId: string, rating: 'remembered' | 'fuzzy' | 'forgot') => {
    if (!userProfile) return;

    const currentStat = userProfile.wordStats[wordId];
    const updatedStat = updateWordStatOnResult(currentStat, rating);

    const newWordStats = {
      ...userProfile.wordStats,
      [wordId]: updatedStat,
    };

    // 全關卡解鎖條件評估：只要任一關卡熟練度 >= 80%，自動解鎖下一關
    let nextUnlockedLevel = userProfile.unlockedLevel || 1;
    for (let lvl = 1; lvl <= 6; lvl++) {
      const lvlWordIds = words.filter((w) => w.levelId === lvl).map((w) => w.id);
      if (lvlWordIds.length > 0) {
        const rate = calculateMasteryRate(lvlWordIds, newWordStats);
        if (rate >= 0.8 && lvl >= nextUnlockedLevel && lvl < 6) {
          nextUnlockedLevel = lvl + 1;
        }
      }
    }

    if (nextUnlockedLevel > userProfile.unlockedLevel) {
      soundSynth.playLevelClear();
    }

    const currentLevelWordIds = words.filter((w) => w.levelId === selectedLevelId).map((w) => w.id);
    const masteryRate = calculateMasteryRate(currentLevelWordIds, newWordStats);

    const updatedProfile: UserProfile = {
      ...userProfile,
      unlockedLevel: nextUnlockedLevel,
      wordStats: newWordStats,
      stars: rating === 'remembered' ? userProfile.stars + 2 : userProfile.stars,
      progress: {
        ...userProfile.progress,
        [`level${selectedLevelId}`]: {
          completed: masteryRate >= 0.8,
          masteryRate,
          starsEarned: Math.round(masteryRate * 3),
          lastStudied: new Date().toISOString(),
        },
      },
    };

    setUserProfile(updatedProfile);
    saveLocalProfile(updatedProfile);
  };

  // 測驗加分獎勵
  const handleUpdateStars = (earnedStars: number) => {
    if (!userProfile) return;
    const updated = {
      ...userProfile,
      stars: userProfile.stars + earnedStars,
    };
    setUserProfile(updated);
    saveLocalProfile(updated);
  };

  // 教師端保存與重置單字庫
  const handleSaveWords = (newWords: WordItem[]) => {
    setWords(newWords);
    saveCustomWords(newWords);
  };

  const handleResetWords = () => {
    const defaultWords = resetCustomWordsToDefault();
    setWords(defaultWords);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navbar Header */}
      <Navbar
        userProfile={userProfile}
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onUpdateTheme={handleUpdateTheme}
        speechRate={speechRate}
        onToggleSpeechRate={() => setSpeechRate((r) => (r === 1.0 ? 0.7 : 1.0))}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          soundSynth.setEnabled(next);
        }}
        dueCount={dueCount}
      />

      {/* Main Learning Canvas */}
      <main className="flex-1 pb-16">
        {currentMode === 'levels' && (
          <LevelSelector
            userProfile={userProfile}
            words={words}
            onSelectLevel={handleSelectLevelMode}
            dueCount={dueCount}
            onStartDueReview={handleStartDueReview}
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}

        {currentMode === 'flashcard' && (
          <FlashcardMode
            words={sessionWords.length > 0 ? sessionWords : words.filter((w) => w.levelId === selectedLevelId)}
            wordStats={userProfile.wordStats}
            onUpdateStat={handleUpdateWordStat}
            onBack={() => setCurrentMode('levels')}
            speechRate={speechRate}
          />
        )}

        {currentMode === 'listening' && (
          <ListeningQuiz
            words={sessionWords.length > 0 ? sessionWords : words.filter((w) => w.levelId === selectedLevelId)}
            allWords={words}
            onBack={() => setCurrentMode('levels')}
            onUpdateScore={handleUpdateStars}
            onUpdateStat={handleUpdateWordStat}
            speechRate={speechRate}
          />
        )}

        {currentMode === 'matching' && (
          <MemoryMatchGame
            words={sessionWords.length > 0 ? sessionWords : words.filter((w) => w.levelId === selectedLevelId)}
            onBack={() => setCurrentMode('levels')}
            onUpdateScore={handleUpdateStars}
            onUpdateStat={handleUpdateWordStat}
            speechRate={speechRate}
          />
        )}

        {currentMode === 'mistakes' && (
          <MistakeNotebook
            words={words}
            wordStats={userProfile.wordStats}
            onStartReviewSession={handleStartCustomReviewSession}
            onBack={() => setCurrentMode('levels')}
            speechRate={speechRate}
          />
        )}

        {currentMode === 'leaderboard' && (
          <Leaderboard
            currentProfile={userProfile}
            words={words}
            onBack={() => setCurrentMode('levels')}
          />
        )}

        {currentMode === 'teacher' && (
          <TeacherDashboard
            words={words}
            onSaveWords={handleSaveWords}
            onResetWords={handleResetWords}
            onBack={() => setCurrentMode('levels')}
            currentProfile={userProfile}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs font-semibold text-slate-500 space-y-1">
        <p>FlashCard Pro - 學生單字記憶曲線字卡系統 &copy; {new Date().getFullYear()}</p>
        <p className="text-[11px] text-slate-400">
          結合萊特納 5 箱位間隔重複記憶法 (Spaced Repetition System) | 支援 Firebase 雲端與離線 LocalStorage
        </p>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentProfile={userProfile}
        onLogin={handleStudentLogin}
        isFirebaseActive={isFirebaseActive}
      />

      {/* Guide & Mastery Principles Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

    </div>
  );
}

export default App;

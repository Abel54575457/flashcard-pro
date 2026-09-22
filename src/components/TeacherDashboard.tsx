import React, { useState, useEffect } from 'react';
import { UserProfile, WordItem, FirebaseConfigInput } from '../types';
import { calculateMasteryRate, isWordDueForReview } from '../services/spacedRepetition';
import { fetchAllStudentsFromFirestore, saveFirebaseConfig, getSavedFirebaseConfig, initFirebase } from '../services/firebase';
import { mergeCustomWords } from '../services/storage';
import { soundSynth } from '../services/soundEffects';
import { exportWordsToCSV, downloadCSVFile, parseCSVToWords } from '../utils/csvHelper';
import {
  getSavedLiffId,
  saveLiffId,
  getSavedChannelToken,
  saveChannelToken,
  sendLinePushReminder,
  shareReminderViaLiffPicker,
  getSavedGasProxyUrl,
  saveGasProxyUrl,
  shareIndividualStudentReminder,
  checkLineBotConnection,
  sendLineBatchReminders
} from '../services/liff';
import {
  GraduationCap,
  Users,
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  Cloud,
  CheckCircle2,
  Lock,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Search,
  Key,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';

interface TeacherDashboardProps {
  words: WordItem[];
  onSaveWords: (words: WordItem[]) => void;
  onResetWords: () => void;
  onBack: () => void;
  currentProfile: UserProfile;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  words,
  onSaveWords,
  onResetWords,
  onBack,
  currentProfile,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState<'students' | 'words' | 'firebase'>('students');

  // 學生名冊 Firestore / Local 資料
  const [students, setStudents] = useState<UserProfile[]>(() => {
    return currentProfile ? [currentProfile] : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // LINE LIFF 設定狀態
  const [liffIdInput, setLiffIdInput] = useState(getSavedLiffId());
  const [liffMsg, setLiffMsg] = useState('');

  // LINE Channel Token & 推播提醒狀態
  const [channelTokenInput, setChannelTokenInput] = useState(getSavedChannelToken());
  const [channelTokenMsg, setChannelTokenMsg] = useState('');
  const [isTestingToken, setIsTestingToken] = useState(false);
  const [tokenTestResult, setTokenTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const [gasProxyInput, setGasProxyInput] = useState(getSavedGasProxyUrl());
  const [gasProxyMsg, setGasProxyMsg] = useState('');
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [reminderStatusMsg, setReminderStatusMsg] = useState('');

  const handleSaveLiffId = (e: React.FormEvent) => {
    e.preventDefault();
    saveLiffId(liffIdInput);
    setLiffMsg('✅ LINE LIFF App ID 已成功保存！');
    soundSynth.playCorrect();
  };

  const handleSaveChannelToken = (e: React.FormEvent) => {
    e.preventDefault();
    saveChannelToken(channelTokenInput);
    setChannelTokenMsg('✅ LINE Channel Access Token 已成功保存！');
    soundSynth.playCorrect();
  };

  const handleTestToken = async () => {
    const token = channelTokenInput.trim() || getSavedChannelToken();
    if (!token) {
      alert('請先輸入 LINE Channel Access Token！');
      return;
    }
    setIsTestingToken(true);
    setTokenTestResult(null);
    const res = await checkLineBotConnection(token, gasProxyInput);
    setIsTestingToken(false);
    if (res.ok) {
      soundSynth.playLevelClear();
      setTokenTestResult({
        ok: true,
        msg: `✅ LINE 官方帳號連線成功！Bot 名稱：【${res.botName || '觀光單字卡提醒'}】(ID: ${res.basicId || '@078zuwsn'})，伺服器驗證通過！`
      });
    } else {
      soundSynth.playWrong();
      setTokenTestResult({
        ok: false,
        msg: `❌ LINE 連線驗證失敗：${res.error || '認證無效'}。\n請至 LINE Developers 後台重新發行 (Re-issue) 長期 Access Token，並貼入此處儲存！`
      });
    }
  };

  const handleSaveGasProxy = (e: React.FormEvent) => {
    e.preventDefault();
    saveGasProxyUrl(gasProxyInput);
    setGasProxyMsg('✅ Google Apps Script 雲端代理網址已成功儲存！');
    soundSynth.playCorrect();
  };

  const handleSendReminders = async () => {
    const token = channelTokenInput.trim() || getSavedChannelToken();
    if (!token) {
      alert('請先至「Firebase 雲端設定」填寫並儲存 LINE Channel Access Token，才能推播提醒卡片！');
      setActiveTab('firebase');
      return;
    }

    const boundStudents = students.filter((s) => !!s.lineUserId);
    if (boundStudents.length === 0) {
      soundSynth.playWrong();
      setReminderStatusMsg('ℹ️ 暫無已綁定 LINE 帳號的學生（請學生開啟 LINE 單字卡連結並選取座號）。');
      return;
    }

    setIsSendingReminders(true);
    setReminderStatusMsg(`⏳ 正在為 ${boundStudents.length} 位已綁定學生推播提醒...`);

    // 1. 優先使用 GAS 全班批次極速推播 (雲端並行 1~2 秒完成，絕不卡死)
    const gasUrl = gasProxyInput.trim() || getSavedGasProxyUrl().trim();
    if (gasUrl) {
      try {
        const batchRes = await sendLineBatchReminders(token, gasUrl, boundStudents, words);
        if (batchRes.success && batchRes.sentCount > 0) {
          setIsSendingReminders(false);
          soundSynth.playLevelClear();
          const note = batchRes.failCount > 0 ? ` (另有 ${batchRes.failCount} 位發送失敗)` : '';
          setReminderStatusMsg(`🎉 成功發送 LINE 個人化課後學習提醒卡片給 ${batchRes.sentCount} 位已綁定學生！${note}`);
          return;
        } else if (batchRes.reason && (batchRes.reason.includes('401') || batchRes.reason.includes('Token'))) {
          setIsSendingReminders(false);
          soundSynth.playWrong();
          setReminderStatusMsg(`❌ 推播失敗：LINE Channel Access Token 已失效 (401 認證失敗)。\n請至「Firebase 雲端設定」更新並儲存新的 Token！`);
          return;
        }
      } catch (err) {
        console.warn('Batch push error, falling back to parallel push:', err);
      }
    }

    // 2. 備援：快速並行個別推播 (每人超時 4 秒，並行執行，絕不卡死)
    let sentCount = 0;
    let lastReason = '';

    const results = await Promise.allSettled(
      boundStudents.map(async (st) => {
        const dueCount = words.filter((w) => isWordDueForReview(st.wordStats?.[w.id])).length;
        return await sendLinePushReminder(
          token,
          st.lineUserId!,
          st.lineDisplayName || `座號 ${st.seatNumber}`,
          st.seatNumber,
          dueCount,
          st.streakDays || 1
        );
      })
    );

    for (const r of results) {
      if (r.status === 'fulfilled') {
        if (r.value.success) {
          sentCount++;
        } else if (r.value.reason) {
          lastReason = r.value.reason;
        }
      }
    }

    setIsSendingReminders(false);
    if (sentCount > 0) {
      soundSynth.playLevelClear();
      setReminderStatusMsg(`🎉 成功發送 LINE 個人化課後學習提醒卡片給 ${sentCount} 位已綁定學生！`);
    } else {
      soundSynth.playWrong();
      setReminderStatusMsg(
        `❌ 發送未成功。原因：${lastReason || '伺服器無回應'}\n\n💡 建議操作：\n1. 👉 點擊下方學生名單右側的「💬 私訊提醒」可直接 1 對 1 傳送！\n2. 📢 點擊上方「分享公告到 205 班群」一鍵發布全班大卡片。\n3. 請至「Firebase 雲端設定」點擊「🔍 立即測試 Token 狀態」檢查 Token 是否過期。`
      );
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  // GAS 程式碼複製彈窗
  const [isGasCodeModalOpen, setIsGasCodeModalOpen] = useState(false);
  const [copiedGasCode, setCopiedGasCode] = useState(false);

  // 單字編輯模態視窗
  const [editingWord, setEditingWord] = useState<Partial<WordItem> | null>(null);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);

  // Firebase 設定
  const [fbConfig, setFbConfig] = useState<FirebaseConfigInput>(() => {
    return (
      getSavedFirebaseConfig() || {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
      }
    );
  });
  const [fbStatusMessage, setFbStatusMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadStudentsData();
    }
  }, [isAuthenticated]);

  const loadStudentsData = async () => {
    setIsLoading(true);
    const remote = await fetchAllStudentsFromFirestore();
    if (remote && remote.length > 0) {
      // 合併雲端學生與目前登入者（確保當前座號也出現）
      const map = new Map<string, UserProfile>();
      if (currentProfile) map.set(currentProfile.seatNumber, currentProfile);
      remote.forEach((st) => map.set(st.seatNumber, st));
      setStudents(Array.from(map.values()));
    } else {
      setStudents(currentProfile ? [currentProfile] : []);
    }
    setIsLoading(false);
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim();
    if (cleanPass === '205' || cleanPass === '205班' || cleanPass === 'teacher888' || cleanPass === '1234') {
      soundSynth.playCorrect();
      setIsAuthenticated(true);
    } else {
      soundSynth.playWrong();
      alert('密碼錯誤，請重新輸入！');
    }
  };

  // 單字新增/更新處理
  const handleSaveWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWord?.word || !editingWord?.translation) return;

    let updatedList: WordItem[];
    if (editingWord.id) {
      // 編輯既有
      updatedList = words.map((w) => (w.id === editingWord.id ? (editingWord as WordItem) : w));
    } else {
      // 新增
      const newWordItem: WordItem = {
        id: `custom_${Date.now()}`,
        levelId: editingWord.levelId || 1,
        word: editingWord.word.trim(),
        phonetic: editingWord.phonetic || '',
        translation: editingWord.translation.trim(),
        partOfSpeech: editingWord.partOfSpeech || 'n.',
        exampleEn: editingWord.exampleEn || '',
        exampleZh: editingWord.exampleZh || '',
        category: editingWord.category || 'General',
        hint: editingWord.hint || '',
      };
      updatedList = [...words, newWordItem];
    }

    soundSynth.playCorrect();
    onSaveWords(updatedList);
    setIsWordModalOpen(false);
    setEditingWord(null);
  };

  const handleDeleteWord = (id: string) => {
    if (confirm('確定要刪除此單字嗎？')) {
      soundSynth.playWrong();
      const filtered = words.filter((w) => w.id !== id);
      onSaveWords(filtered);
    }
  };

  // CSV / JSON 匯出匯入
  const handleExportCSV = () => {
    const csvContent = exportWordsToCSV(words);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSVFile(`FlashCard_觀光餐旅單字表_${dateStr}.csv`, csvContent);
    soundSynth.playCorrect();
  };

  const handleDownloadCSVTemplate = () => {
    const sampleWords: WordItem[] = [
      {
        id: 'sample_1',
        levelId: 7,
        category: '侍酒專業',
        word: 'Sommelier',
        phonetic: '[ˌsɒm.əlˈjeɪ]',
        translation: '侍酒師',
        partOfSpeech: 'n.',
        exampleEn: 'The sommelier recommended an excellent wine.',
        exampleZh: '侍酒師推薦了一款優秀的葡萄酒。',
        hint: '專業餐廳酒類服務人員',
      },
      {
        id: 'sample_2',
        levelId: 8,
        category: '國際會展',
        word: 'Keynote Speaker',
        phonetic: '[ˈkiː.noʊt ˈspiː.kɚ]',
        translation: '專題主講人',
        partOfSpeech: 'n.',
        exampleEn: 'The keynote speaker gave an inspiring speech.',
        exampleZh: '專題主講人發表了一篇鼓舞人心的演講。',
        hint: '大會開幕開場演講者',
      }
    ];
    const csvContent = exportWordsToCSV(sampleWords);
    downloadCSVFile('FlashCard_新增關卡範例模板.csv', csvContent);
    soundSynth.playCorrect();
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const csvText = event.target?.result as string;
          const parsedWords = parseCSVToWords(csvText);
          if (parsedWords.length > 0) {
            const merged = mergeCustomWords(parsedWords);
            onSaveWords(merged);
            soundSynth.playLevelClear();
            const levelIds = Array.from(new Set(parsedWords.map((w) => w.levelId)));
            alert(`🎉 成功匯入與無損合併 ${parsedWords.length} 個單字！\n涉及關卡：Unit ${levelIds.join(', Unit ')}\n學生的記憶曲線評定紀錄與星星點數已 100% 完整保留。`);
          } else {
            alert('CSV 檔案中未找到有效的單字資料，請檢查格式。');
          }
        } catch {
          alert('CSV 解析失敗，請確認檔案格式為標準 UTF-8 CSV。');
        }
      };
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(words, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `FlashCard_Words_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            const merged = mergeCustomWords(parsed);
            onSaveWords(merged);
            soundSynth.playLevelClear();
            const levelIds = Array.from(new Set(parsed.map((w) => w.levelId || 1)));
            alert(`🎉 成功無損匯入與合併 ${parsed.length} 個單字！\n涉及關卡：Unit ${levelIds.join(', Unit ')}\n學生的記憶曲線評定紀錄已完整保留。`);
          }
        } catch {
          alert('JSON 格式不正確！');
        }
      };
    }
  };

  // Firebase 設定儲存與測試
  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(fbConfig);
    const success = initFirebase(fbConfig);
    if (success) {
      soundSynth.playCorrect();
      setFbStatusMessage('✅ Firebase 連線成功！雲端同步已開啟。');
    } else {
      soundSynth.playWrong();
      setFbStatusMessage('⚠️ Firebase 連線失敗，請檢查設定值。');
    }
  };

  // 未認證前顯示密碼門禁
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 animate-in fade-in">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900">教師權限驗證</h2>
            <p className="text-xs text-slate-500">請輸入教師管理密碼進入後台</p>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="請輸入教師管理密碼"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold text-center text-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Key className="w-4 h-4" />
              <span>進入後台</span>
            </button>
          </form>

          <button
            onClick={onBack}
            className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            返回學生端
          </button>
        </div>
      </div>
    );
  }

  const filteredWords = words.filter(
    (w) =>
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.translation.includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>離開教師端</span>
        </button>

        <div className="flex items-center space-x-2">
          <GraduationCap className="w-6 h-6 text-slate-900" />
          <h1 className="text-2xl font-black text-slate-900">教師與課程管理控制台</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all flex items-center space-x-2 ${
            activeTab === 'students'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>全班學生進度 ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('words')}
          className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all flex items-center space-x-2 ${
            activeTab === 'words'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>單字庫管理 ({words.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('firebase')}
          className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all flex items-center space-x-2 ${
            activeTab === 'firebase'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Firebase 雲端設定</span>
        </button>
      </div>

      {/* Tab 1: Students Leaderboard */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-black text-slate-900">班級各座號學習排行榜</h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSendReminders}
                disabled={isSendingReminders}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs shadow-sm flex items-center space-x-1.5 transition-all"
                title="精準 1 對 1 私訊推播給已綁定座號的學生個人，班群裡的其他老師完全不會收到！"
              >
                <span>🔒 1對1 私訊推播 (僅已綁定學生)</span>
              </button>
              <button
                onClick={async () => {
                  const ok = await shareReminderViaLiffPicker();
                  if (ok) soundSynth.playLevelClear();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm flex items-center space-x-1.5 transition-all"
                title="分享提醒大公告到 205 班級 LINE 群組"
              >
                <span>📢 分享公告到 205 班群</span>
              </button>
              <button
                onClick={loadStudentsData}
                className="text-xs font-bold text-indigo-600 hover:underline px-2 py-1"
              >
                🔄 重新整理
              </button>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-[11px] text-indigo-900 space-y-1">
            <p className="font-extrabold flex items-center space-x-1">
              <span>💡 教師推播提醒差異說明：</span>
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-indigo-800">
              <li><strong>🔒 1對1 私訊推播</strong>：精準私訊至有綁定 LINE 帳號的學生個人聊天室。<strong>班群裡的其他老師、家長完全不會收到！</strong></li>
              <li><strong>📢 分享公告到 205 班群</strong>：發送全班性大公告至 205 班級群組。</li>
            </ul>
          </div>

          {reminderStatusMsg && (
            <div className="text-xs font-bold p-3.5 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 space-y-1">
              <p>{reminderStatusMsg}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black text-slate-500 uppercase">
                  <th className="py-3 px-4">座號</th>
                  <th className="py-3 px-4">學生姓名 / LINE 帳號</th>
                  <th className="py-3 px-4">班級</th>
                  <th className="py-3 px-4">主題色</th>
                  <th className="py-3 px-4">解鎖關卡</th>
                  <th className="py-3 px-4">獲得星星</th>
                  <th className="py-3 px-4">熟練單字數</th>
                  <th className="py-3 px-4">最後活躍時間</th>
                  <th className="py-3 px-4 text-center">1對1私訊</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => {
                  const allIds = words.map((w) => w.id);
                  const rate = calculateMasteryRate(allIds, st.wordStats || {});
                  const masteredCount = Math.round(rate * words.length);
                  const dueCount = words.filter((w) => isWordDueForReview((st.wordStats || {})[w.id])).length;

                  return (
                    <tr key={st.seatNumber} className="hover:bg-slate-50 font-semibold">
                      <td className="py-3 px-4 font-black text-indigo-600">座號 {st.seatNumber}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {st.linePictureUrl ? (
                            <img
                              src={st.linePictureUrl}
                              alt={st.lineDisplayName || st.seatNumber}
                              className="w-7 h-7 rounded-full border border-slate-200 object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold shrink-0">
                              {st.seatNumber}
                            </div>
                          )}
                          {st.lineDisplayName ? (
                            <div className="flex items-center space-x-1.5">
                              <span className="font-extrabold text-slate-900">{st.lineDisplayName}</span>
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
                                LINE 綁定
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-normal">未連動 LINE</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{st.classCode || '205'}</td>
                      <td className="py-3 px-4 capitalize">{st.themeColor}</td>
                      <td className="py-3 px-4 font-bold text-amber-700">Unit {st.unlockedLevel}</td>
                      <td className="py-3 px-4 text-amber-600 font-bold">⭐ {st.stars || 0}</td>
                      <td className="py-3 px-4 text-emerald-600 font-bold">{masteredCount} 個 ({Math.round(rate * 100)}%)</td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {st.lastActive ? new Date(st.lastActive).toLocaleString() : '無記錄'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            shareIndividualStudentReminder(st.lineDisplayName || `座號 ${st.seatNumber}`, st.seatNumber, dueCount);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all inline-flex items-center space-x-1"
                          title={`開啟 LINE 一對一私訊座號 ${st.seatNumber}`}
                        >
                          <span>💬 私訊提醒</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Custom Vocabulary Manager */}
      {activeTab === 'words' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋英文或中文單字..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setEditingWord({ levelId: 1, partOfSpeech: 'n.', category: 'General' });
                  setIsWordModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center space-x-1 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>新增單字</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-xs transition-all flex items-center space-x-1 shadow-xs"
                title="匯出符合 Excel 格式的 UTF-8 CSV 單字表"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>📊 匯出 CSV 單字表 (Excel)</span>
              </button>

              <label className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center space-x-1 cursor-pointer shadow-xs">
                <Upload className="w-4 h-4" />
                <span>📥 匯入 CSV (自動擴充新關卡)</span>
                <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
              </label>

              <button
                onClick={handleDownloadCSVTemplate}
                className="px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold text-xs transition-all flex items-center space-x-1"
                title="下載新增關卡與單字的 CSV 範例檔"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下載新關卡 CSV 範本</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center space-x-1"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>匯出 JSON</span>
              </button>

              <label className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center space-x-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>匯入 JSON</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>

              <button
                onClick={() => {
                  if (confirm('確定要還原預設的二年級必學單字庫嗎？')) {
                    onResetWords();
                  }
                }}
                className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs transition-all flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重置為預設</span>
              </button>
            </div>
          </div>

          {/* Words Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map((w) => (
              <div key={w.id} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-600">Unit {w.levelId}</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setEditingWord(w);
                        setIsWordModalOpen(true);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWord(w.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-black text-slate-900">{w.word}</h3>
                  <span className="text-xs text-slate-500 font-semibold">{w.phonetic}</span>
                </div>

                <p className="text-sm font-extrabold text-indigo-700">{w.translation}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{w.exampleEn}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Firebase Config */}
      {activeTab === 'firebase' && (
        <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Cloud Firestore 雲端資料庫設定</h2>
            <p className="text-xs text-slate-500 mt-1">
              輸入你的 Firebase Web API 金鑰即可開啟全班跨裝置進度即時同步。若無輸入，將預設以 LocalStorage 本地儲存。
            </p>
          </div>

          <form onSubmit={handleSaveFirebaseConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">API Key</label>
              <input
                type="text"
                value={fbConfig.apiKey}
                onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Project ID</label>
              <input
                type="text"
                value={fbConfig.projectId}
                onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                placeholder="flashcard-pro-12345"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Auth Domain</label>
              <input
                type="text"
                value={fbConfig.authDomain}
                onChange={(e) => setFbConfig({ ...fbConfig, authDomain: e.target.value })}
                placeholder="flashcard-pro-12345.firebaseapp.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {fbStatusMessage && (
              <p className="text-xs font-bold p-3 rounded-xl bg-slate-100 text-slate-800">{fbStatusMessage}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition-all"
            >
              儲存並測試 Firebase 連線
            </button>
          </form>

          {/* LINE LIFF Configuration */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">💬</span>
                <h3 className="text-lg font-black text-slate-900">LINE LIFF 聊天室整合設定</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                填入 LINE Developers 的 LIFF App ID，即可讓學生在 LINE 聊天室點擊連結自動登入與顯示 LINE 頭像。
              </p>
            </div>

            <form onSubmit={handleSaveLiffId} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  LIFF App ID (例如: 2001234567-AbcdEfgh)
                </label>
                <input
                  type="text"
                  value={liffIdInput}
                  onChange={(e) => setLiffIdInput(e.target.value)}
                  placeholder="2001234567-AbcdEfgh"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {liffMsg && (
                <p className="text-xs font-bold p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {liffMsg}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all"
              >
                儲存 LINE LIFF 設定
              </button>
            </form>

            {/* LINE Messaging API Channel Access Token Form */}
            <form onSubmit={handleSaveChannelToken} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  LINE Messaging API Channel Access Token (1對1私訊推播專用)
                </label>
                <input
                  type="password"
                  value={channelTokenInput}
                  onChange={(e) => setChannelTokenInput(e.target.value)}
                  placeholder="貼上很長的 Channel Access Token (long-lived)..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {channelTokenMsg && (
                <p className="text-xs font-bold p-3 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200">
                  {channelTokenMsg}
                </p>
              )}

              {tokenTestResult && (
                <div
                  className={`text-xs font-bold p-3 rounded-xl border leading-relaxed whitespace-pre-line ${
                    tokenTestResult.ok
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <p>{tokenTestResult.msg}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs transition-all"
                >
                  儲存 Channel Access Token
                </button>
                <button
                  type="button"
                  onClick={handleTestToken}
                  disabled={isTestingToken}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>{isTestingToken ? '⏳ 正在檢測連線...' : '🔍 立即測試 Token 狀態'}</span>
                </button>
              </div>
            </form>

            {/* Google Apps Script CORS Proxy Form */}
            <form onSubmit={handleSaveGasProxy} className="space-y-3 pt-2">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Google Apps Script (GAS) 雲端代理網址 (選填，突破 CORS 限制)
                  </label>
                  <a
                    href="https://script.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    開啟 GAS 控制台 ➔
                  </a>
                </div>
                <input
                  type="text"
                  value={gasProxyInput}
                  onChange={(e) => setGasProxyInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] text-slate-500">
                    💡 說明：貼上發布後的 Web App URL，即可在電腦瀏覽器一鍵 1 對 1 私訊全班已綁定學生！
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsGasCodeModalOpen(true)}
                    className="text-[11px] font-extrabold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg transition-all shrink-0 ml-2"
                  >
                    📋 查看與複製 GAS 程式碼
                  </button>
                </div>
              </div>

              {gasProxyMsg && (
                <p className="text-xs font-bold p-3 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
                  {gasProxyMsg}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-all"
              >
                儲存 GAS 代理網址
              </button>
            </form>

            {/* GAS Code Modal */}
            {isGasCodeModalOpen && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
                <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                      <span>🚀 1 分鐘免費部署 Google Apps Script 雲端代理 (2026 極速版)</span>
                    </h3>
                    <button
                      onClick={() => setIsGasCodeModalOpen(false)}
                      className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                    <ol className="list-decimal list-inside space-y-1.5 font-bold text-slate-800">
                      <li>
                        開啟{' '}
                        <a
                          href="https://script.google.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-600 underline"
                        >
                          https://script.google.com/
                        </a>{' '}
                        並進入既有專案（或點擊「新專案」）。
                      </li>
                      <li>點擊下方「📋 1 鍵複製程式碼」，將程式碼全選取代貼入 Google Apps Script。</li>
                      <li>
                        點擊右上角「部署」➔「管理部署作業」➔ 點右側 ✏️ 鉛筆 ➔ 版本選「<strong>新版本</strong>」➔ 點擊「部署」。
                      </li>
                      <li>確認誰可以存取為「所有人 (Anyone)」，複製產生的網頁應用程式網址貼回後台儲存！</li>
                    </ol>

                    <div className="relative mt-2">
                      <button
                        onClick={() => {
                          const codeText = `/**
 * LINE Messaging API 課後推播 Google Apps Script (GAS) 代理程式 — 2026 極速版
 */
var DEFAULT_TOKEN = 'tA+pW5dxTSDYkmCZou7kTt1APVC9U4H2xm9J6Pny8fCE/2dFhL2qdizLym7dT0jOdOzPRGBE/lJjRhtN5eIpjD0djQ7fR49VG642tLTSpypbrznk3szasMVguJiaFSiqfwhW7/tG4ucsxWi4F6cE1gdB04t89/1O/w1cDnyilFU=';

function doGet(e) {
  return handleRequest(e ? e.parameter : {});
}

function doPost(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  if (e && e.postData && e.postData.contents) {
    try {
      var body = JSON.parse(e.postData.contents);
      for (var k in body) { params[k] = body[k]; }
    } catch(err) {}
  }
  return handleRequest(params);
}

function handleRequest(params) {
  params = params || {};
  var callback = params.callback || '';
  var action   = params.action || (params.check ? 'check' : (params.data ? 'batch' : 'push'));
  var token    = (params.tk && params.tk.length > 20) ? params.tk.trim() : DEFAULT_TOKEN;
  var liff     = params.liff || 'https://liff.line.me/2011565097-n1Ab1IlP';
  var liffUrl  = (liff.indexOf('http') === 0) ? liff : ('https://liff.line.me/' + liff);

  // 1. 連線檢測模式
  if (action === 'check') {
    try {
      var resp = UrlFetchApp.fetch('https://api.line.me/v2/bot/info', {
        headers: { 'Authorization': 'Bearer ' + token },
        muteHttpExceptions: true
      });
      var code = resp.getResponseCode();
      var text = resp.getContentText();
      if (code === 200) {
        var info = JSON.parse(text);
        return jsonResponse({
          success: true,
          status: 200,
          botName: info.displayName || 'LINE 官方帳號',
          botId: info.basicId || ''
        }, callback);
      } else {
        return jsonResponse({
          success: false,
          status: code,
          error: (code === 401 ? 'LINE Token 已失效 (401 認證失敗)，請至 LINE Developers 重新發行' : text)
        }, callback);
      }
    } catch(err) {
      return jsonResponse({ success: false, error: 'GAS 呼叫 LINE 例外: ' + err.toString() }, callback);
    }
  }

  // 2. 全班批次推播模式 (action=batch，2秒雲端並行極速推播)
  if (action === 'batch') {
    var rawData = params.data || params.students || '[]';
    var students = [];
    try {
      students = (typeof rawData === 'string') ? JSON.parse(rawData) : rawData;
    } catch(e) {
      return jsonResponse({ success: false, error: '批次資料解析失敗: ' + e.toString() }, callback);
    }

    var sentCount = 0;
    var failCount = 0;
    var errors = [];

    for (var i = 0; i < students.length; i++) {
      var s = students[i];
      var to = s.to || s.t || '';
      if (!to) continue;
      var name = decodeURIComponent(s.name || s.n || '同學');
      var seat = s.seat || s.s || '';
      var due = parseInt(s.due || s.d || '0');
      var streak = parseInt(s.streak || s.k || '1');

      var pushRes = doPushOne(token, to, name, seat, due, streak, liffUrl);
      if (pushRes.success) {
        sentCount++;
      } else {
        failCount++;
        if (errors.length < 3) errors.push('座號 ' + seat + ': ' + pushRes.error);
      }
    }

    return jsonResponse({
      success: sentCount > 0,
      sentCount: sentCount,
      failCount: failCount,
      total: students.length,
      errors: errors
    }, callback);
  }

  // 3. 單人推播模式
  var to = params.to || '';
  if (!to) {
    return jsonResponse({ success: false, error: '缺少 to 參數' }, callback);
  }
  var name = decodeURIComponent(params.name || '同學');
  var seat = params.seat || '';
  var due = parseInt(params.due || '0');
  var streak = parseInt(params.streak || '1');

  var singleRes = doPushOne(token, to, name, seat, due, streak, liffUrl);
  return jsonResponse(singleRes, callback);
}

function doPushOne(token, to, name, seat, due, streak, liffUrl) {
  var isDue = due > 0;
  var altText = isDue
    ? ('課後單字複習提醒：座號 ' + seat + ' 有 ' + due + ' 個單字待複習！')
    : ('課後學習提醒：觀光英文單字卡已上線！');
  var bodyText = isDue
    ? (name + ' 今日有 ' + due + ' 個單字進入記憶曲線複習池，黃金時間快來複習！')
    : (name + ' 保持每日學習好習慣！觀光餐旅單字新關卡已準備就緒，點擊開始挑戰！');

  var messages = [{
    type: 'flex',
    altText: altText,
    contents: {
      type: 'bubble', size: 'mega',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: '#06C755',
        contents: [
          { type: 'text', text: '📢 課後單字學習提醒', weight: 'bold', color: '#FFFFFF', size: 'xs' },
          { type: 'text', text: name + ' (座號 ' + seat + ')', weight: 'bold', color: '#FFFFFF', size: 'xl', margin: 'sm' }
        ]
      },
      body: {
        type: 'box', layout: 'vertical',
        contents: [
          { type: 'text', text: bodyText, wrap: true, size: 'sm', color: '#333333' },
          { type: 'text', text: '🔥 連續學習天數：' + streak + ' 天', size: 'xs', color: '#888888', margin: 'md' }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical',
        contents: [{
          type: 'button',
          action: { type: 'uri', label: '🚀 開始背單字 / 挑戰關卡', uri: liffUrl },
          style: 'primary', color: '#06C755'
        }]
      }
    }
  }];

  try {
    var response = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      payload: JSON.stringify({ to: to, messages: messages }),
      muteHttpExceptions: true
    });
    var code = response.getResponseCode();
    var text = response.getContentText();
    return {
      success: (code === 200),
      status: code,
      error: (code !== 200) ? ('LINE ' + code + ': ' + text) : ''
    };
  } catch(err) {
    return { success: false, error: err.toString() };
  }
}

function jsonResponse(obj, callback) {
  var jsonStr = JSON.stringify(obj);
  if (callback && callback.length > 0) {
    return ContentService.createTextOutput(callback + '(' + jsonStr + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(jsonStr)
    .setMimeType(ContentService.MimeType.JSON);
}`;
                          navigator.clipboard.writeText(codeText);
                          setCopiedGasCode(true);
                          setTimeout(() => setCopiedGasCode(false), 3000);
                        }}
                        className="absolute top-2 right-2 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-all z-10"
                      >
                        {copiedGasCode ? '✅ 已複製成功！' : '📋 1 鍵複製程式碼'}
                      </button>
                      <pre className="bg-slate-900 text-purple-200 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-64 leading-normal">
{`// 🚀 2026 最新極速版（支援：Token 一鍵檢測 + 雲端 2 秒全班批次推播 + 個別推播）
// 點擊右上角「📋 1 鍵複製程式碼」即可取得完整程式碼！`}
                      </pre>
                    </div>

                  </div>

                  <button
                    onClick={() => setIsGasCodeModalOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-all"
                  >
                    關閉視窗
                  </button>
                </div>
              </div>
            )}

            {liffIdInput.trim() && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
                <p className="font-extrabold text-emerald-900 flex items-center space-x-1">
                  <span>🔗 學生專用 LINE 群組分享連結：</span>
                </p>
                <code className="block bg-white p-2.5 rounded-xl border border-emerald-300 font-mono text-xs text-emerald-700 select-all font-bold">
                  https://liff.line.me/{liffIdInput.trim()}
                </code>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  💡 將上方連結複製貼發至 LINE 班級群組，學生點擊即可直接在 LINE 內開啟字卡，並自動帶入 LINE 大頭貼與暱稱！
                </p>
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <span className="font-bold text-slate-900 block">📌 LINE Developers 建立 3 步驟：</span>
              <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                <li>前往 <a href="https://developers.line.biz/" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold">LINE Developers Console</a> 建立 Provider 與 Line Login Channel。</li>
                <li>點擊 <strong>LIFF</strong> 頁籤 ➔ 點擊 <strong>Add</strong> 建立 LIFF App。</li>
                <li>將 Endpoint URL 設定為 <code className="bg-white px-1 py-0.5 rounded border border-slate-200">https://flashcard-pro-app-25c7f.web.app</code> 並複製 LIFF ID 貼至上方儲存。</li>
                <li><strong className="text-rose-600">【重要】</strong> 在 Channel 頁面上方將狀態從 <strong>「Developing」(開發中)</strong> 按鈕切換為 <strong>「Published」(已公開)</strong>，學生與非開發者帳號才能順利開啟！</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Word Add/Edit Modal */}
      {isWordModalOpen && editingWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900">
              {editingWord.id ? '編輯單字' : '新增單字'}
            </h3>

            <form onSubmit={handleSaveWord} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">英文單字 *</label>
                  <input
                    type="text"
                    required
                    value={editingWord.word || ''}
                    onChange={(e) => setEditingWord({ ...editingWord, word: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">中文翻譯 *</label>
                  <input
                    type="text"
                    required
                    value={editingWord.translation || ''}
                    onChange={(e) => setEditingWord({ ...editingWord, translation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">關卡 Level (1-6)</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={editingWord.levelId || 1}
                    onChange={(e) => setEditingWord({ ...editingWord, levelId: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">注音/音標</label>
                  <input
                    type="text"
                    value={editingWord.phonetic || ''}
                    onChange={(e) => setEditingWord({ ...editingWord, phonetic: e.target.value })}
                    placeholder="[æp.əl]"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">詞性</label>
                  <input
                    type="text"
                    value={editingWord.partOfSpeech || 'n.'}
                    onChange={(e) => setEditingWord({ ...editingWord, partOfSpeech: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">英文例句</label>
                <input
                  type="text"
                  value={editingWord.exampleEn || ''}
                  onChange={(e) => setEditingWord({ ...editingWord, exampleEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">中文例句</label>
                <input
                  type="text"
                  value={editingWord.exampleZh || ''}
                  onChange={(e) => setEditingWord({ ...editingWord, exampleZh: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsWordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
                >
                  儲存單字
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

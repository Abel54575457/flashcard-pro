import React, { useState, useEffect } from 'react';
import type { UserProfile, ThemeColor } from '../types';
import { soundSynth } from '../services/soundEffects';
import { CLASS_205_STUDENTS, getStudentBySeat } from '../data/students';
import type { StudentInfo } from '../data/students';
import { getLiffUserProfile } from '../services/liff';
import type { LiffUserProfile } from '../services/liff';
import {
  User,
  ShieldCheck,
  Check,
  Sparkles,
  X,
  Palette,
  Cloud,
  Database,
  Search,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onLogin: (seatNumber: string, classCode: string, themeColor: ThemeColor, liffUser?: LiffUserProfile | null) => void;
  isFirebaseActive: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onLogin,
  isFirebaseActive,
}) => {
  const [selectedSeat, setSelectedSeat] = useState(currentProfile.seatNumber || '01');
  const [color, setColor] = useState<ThemeColor>(currentProfile.themeColor || 'emerald');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmStep, setConfirmStep] = useState(false);
  const [liffUser, setLiffUser] = useState<LiffUserProfile | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedSeat(currentProfile.seatNumber || '01');
      setColor(currentProfile.themeColor || 'emerald');
      setSearchTerm('');
      setConfirmStep(false);

      // 檢查當前 LINE LIFF 使用者資訊
      getLiffUserProfile().then((u) => {
        if (u) setLiffUser(u);
      }).catch(() => {});
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

  const currentStudent = getStudentBySeat(selectedSeat) || {
    seatNumber: selectedSeat,
    studentId: '',
    name: `座號 ${selectedSeat}`
  };

  // 檢查 LINE 暱稱是否包含名冊中的其他同學名字（防呆警示）
  const detectedOtherStudent = (() => {
    if (!liffUser?.displayName) return null;
    const cleanNick = liffUser.displayName.replace(/\s+/g, '');
    for (const st of CLASS_205_STUDENTS) {
      if (st.seatNumber !== selectedSeat && cleanNick.includes(st.name)) {
        return st;
      }
    }
    return null;
  })();

  const handleSelectSeat = (st: StudentInfo) => {
    setSelectedSeat(st.seatNumber);
    soundSynth.playCorrect();
    setConfirmStep(true);
  };

  const handleFinalConfirm = () => {
    soundSynth.playCorrect();
    onLogin(selectedSeat, '205', color, liffUser);
    onClose();
  };

  const filteredStudents = CLASS_205_STUDENTS.filter(
    (st) =>
      st.seatNumber.includes(searchTerm.trim()) ||
      st.name.includes(searchTerm.trim()) ||
      st.studentId.includes(searchTerm.trim())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-5 sm:p-7 relative overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-3 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {confirmStep ? '核對身分與防呆確認' : '205 班學生選擇座號'}
            </h2>
            <p className="text-xs text-slate-500">
              {confirmStep ? '請確認這是您本人的座號與姓名，避免進度誤記' : '請找到您的名字與座號後點擊進入'}
            </p>
          </div>
        </div>

        {/* Status bar */}
        <div className="mb-3 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700 shrink-0">
          <div className="flex items-center space-x-2">
            {isFirebaseActive ? (
              <Cloud className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            ) : (
              <Database className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span className="text-[11px]">205 班雲端資料庫</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            官方名冊 31 位同學
          </span>
        </div>

        {/* Step 1: 學生名冊清單選擇 */}
        {!confirmStep ? (
          <div className="flex flex-col flex-1 min-h-0 space-y-3">
            {/* Search Box */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜尋姓名或座號 (例如: 洪妤恩 或 31)..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Students Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredStudents.map((st) => {
                  const isCurrent = selectedSeat === st.seatNumber;
                  return (
                    <button
                      key={st.seatNumber}
                      type="button"
                      onClick={() => handleSelectSeat(st)}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                        isCurrent
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-400 shadow-sm'
                          : 'border-slate-200 hover:border-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-slate-900 text-white">
                          {st.seatNumber} 號
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {st.studentId}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-baseline justify-between">
                        <span className="text-sm font-black text-slate-800 group-hover:text-slate-900">
                          {st.name}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          點選 &gt;
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Selection summary */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                目前登入：<strong className="text-slate-800">{currentProfile.studentName || `座號 ${currentProfile.seatNumber}`}</strong>
              </span>
              <button
                type="button"
                onClick={() => setConfirmStep(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-xs"
              >
                繼續確認 &gt;
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: 防呆二次確認卡片 */
          <div className="flex flex-col flex-1 min-h-0 space-y-4 overflow-y-auto pr-1">
            
            {/* Identity Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-200">
                  觀光餐旅 205 班 · 正式身分核對
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                  座號 {currentStudent.seatNumber} 號
                </span>
              </div>

              <div className="flex items-baseline space-x-3">
                <h3 className="text-3xl font-black tracking-tight text-white">
                  {currentStudent.name}
                </h3>
                <span className="text-xs text-indigo-200 font-mono">
                  學號：{currentStudent.studentId || '無'}
                </span>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-indigo-200">
                <span>班級：205 班</span>
                <span className="text-emerald-300 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>官方名冊核可</span>
                </span>
              </div>
            </div>

            {/* 防呆偵測提醒 1: 當 LINE 暱稱檢測到是別的同學名字時 */}
            {detectedOtherStudent && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-2 animate-pulse">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-black text-rose-800 text-sm">
                      ⚠️ 偵測到 LINE 帳號不吻合！
                    </p>
                    <p>
                      您目前的 LINE 暱稱為<strong>「{liffUser?.displayName}」</strong>，但您選擇的座號是 <strong>{currentStudent.seatNumber} 號 {currentStudent.name}</strong>！
                    </p>
                    <p className="text-rose-700">
                      根據名冊，您可能是 <strong>{detectedOtherStudent.seatNumber} 號【{detectedOtherStudent.name}】</strong>！
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundSynth.playCorrect();
                    setSelectedSeat(detectedOtherStudent.seatNumber);
                  }}
                  className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs transition-all flex items-center justify-center space-x-1"
                >
                  <span>👉 點此立即切換為 {detectedOtherStudent.seatNumber} 號【{detectedOtherStudent.name}】</span>
                </button>
              </div>
            )}

            {/* 防呆偵測提醒 2: LINE 一般提示 */}
            {liffUser && !detectedOtherStudent && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center space-x-2">
                <span className="text-base">💬</span>
                <div>
                  <span className="text-slate-500">目前連動 LINE：</span>
                  <strong className="text-indigo-900">{liffUser.displayName}</strong>
                  <span className="text-[10px] text-indigo-700 block mt-0.5">
                    進入後將記錄此座號之單字評定與星星進度。
                  </span>
                </div>
              </div>
            )}

            {/* Theme selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Palette className="w-3.5 h-3.5 text-slate-700" />
                <span>個人卡片配色</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'emerald', name: '翡翠綠', bg: 'bg-emerald-500' },
                  { id: 'blue', name: '寶石藍', bg: 'bg-indigo-500' },
                  { id: 'purple', name: '紫晶', bg: 'bg-purple-500' },
                  { id: 'amber', name: '琥珀金', bg: 'bg-amber-500' },
                  { id: 'rose', name: '珊瑚紅', bg: 'bg-rose-500' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setColor(item.id as ThemeColor)}
                    className={`flex flex-col items-center p-1.5 rounded-xl border transition-all ${
                      color === item.id
                        ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-800'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full ${item.bg} shadow-xs flex items-center justify-center text-white mb-0.5`}>
                      {color === item.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Confirmation Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleFinalConfirm}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm shadow-lg shadow-emerald-200 transition-all flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>確認我是【{currentStudent.name}】本人，開始背單字</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmStep(false)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>選錯了，返回重新選擇姓名座號</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

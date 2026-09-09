import React, { useState } from 'react';
import { UserProfile, ThemeColor } from '../types';
import { soundSynth } from '../services/soundEffects';
import { User, ShieldCheck, Check, Sparkles, X, Palette, Cloud, Database } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onLogin: (seatNumber: string, classCode: string, themeColor: ThemeColor) => void;
  isFirebaseActive: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onLogin,
  isFirebaseActive,
}) => {
  const [seat, setSeat] = useState(currentProfile.seatNumber || '01');
  const [cls, setCls] = useState(currentProfile.classCode || '201');
  const [color, setColor] = useState<ThemeColor>(currentProfile.themeColor || 'emerald');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seat.trim()) return;
    const formattedSeat = seat.trim().padStart(2, '0');
    soundSynth.playCorrect();
    onLogin(formattedSeat, cls.trim() || '201', color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 sm:p-8 relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">學生登入</h2>
            <p className="text-xs text-slate-500">輸入座號紀錄關卡進度與記憶曲線</p>
          </div>
        </div>

        {/* Sync Mode Indicator */}
        <div className="mb-6 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-semibold text-slate-700">
          <div className="flex items-center space-x-2">
            {isFirebaseActive ? (
              <Cloud className="w-4 h-4 text-emerald-600 animate-pulse" />
            ) : (
              <Database className="w-4 h-4 text-indigo-600" />
            )}
            <span>同步狀態：</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            isFirebaseActive ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
          }`}>
            {isFirebaseActive ? '☁️ Firebase 雲端同步' : '💾 本地 LocalStorage 快取'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              班級代碼 (選填)
            </label>
            <input
              type="text"
              value={cls}
              onChange={(e) => setCls(e.target.value)}
              placeholder="如 201, 202"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              學生座號 (號碼)
            </label>
            <input
              type="text"
              required
              value={seat}
              onChange={(e) => setSeat(e.target.value)}
              placeholder="請輸入座號 (如 05)"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 text-lg bg-slate-50/50"
            />

            {/* Quick seat chips */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['01', '02', '03', '05', '08', '10', '12', '15', '20'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSeat(num)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                    seat === num
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num} 號
                </button>
              ))}
            </div>
          </div>

          {/* Theme selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Palette className="w-3.5 h-3.5 text-indigo-500" />
              <span>個人主題顏色</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
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
                  className={`flex flex-col items-center p-2 rounded-2xl border transition-all ${
                    color === item.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full ${item.bg} shadow-xs flex items-center justify-center text-white mb-1`}>
                    {color === item.id && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-700">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-extrabold text-base shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>開始闖關記憶卡片</span>
          </button>
        </form>

      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Users,
  Sparkles,
  RefreshCw,
  Eye,
  Edit3,
  Clock,
  Flame,
  BookOpen,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { UserProfile, WordItem } from '../types';
import { isWordDueForReview } from '../services/spacedRepetition';

export interface PushReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'batch' | 'single' | 'class_group';
  targetStudent?: UserProfile | null;
  boundStudents: UserProfile[];
  words: WordItem[];
  onConfirmBatchSend: (customMessage: string, customTitle: string) => Promise<void>;
  onConfirmSinglePush: (student: UserProfile, customMessage: string, customTitle: string) => Promise<void>;
  onConfirmSingleShare: (student: UserProfile, customMessage: string, customTitle: string) => void;
  onConfirmClassShare: (customMessage: string, customTitle: string) => void;
  isSending: boolean;
}

interface TemplateItem {
  id: string;
  badge: string;
  title: string;
  message: string;
}

const PRESET_TEMPLATES: TemplateItem[] = [
  {
    id: 'daily',
    badge: '🌟 每日鼓勵',
    title: '📢 課後單字學習提醒',
    message: '保持每日學習好習慣！觀光餐旅專業單字庫已準備就緒，把握零碎時間開始挑戰！'
  },
  {
    id: 'quiz',
    badge: '📝 小考衝刺',
    title: '📝 英文單字小考叮嚀',
    message: '即將進行單字隨堂測驗，請至「錯題本」與「全冊單字表」複習，把星星集滿！'
  },
  {
    id: 'deadline',
    badge: '⏰ 作業提醒',
    title: '⏰ 單字闖關進度提醒',
    message: '今日進度尚未達標的同學，請於今晚 10:00 前完成本單元練習喔！'
  },
  {
    id: 'streak',
    badge: '🔥 連勝挑戰',
    title: '🔥 連續學習天數挑戰',
    message: '太棒了！只要再挑戰 1 關就能刷新連續學習紀錄，大家加油！'
  },
  {
    id: 'mistakes',
    badge: '🧹 錯題清零',
    title: '💡 弱點加強與錯題清零',
    message: '錯題本裡還有待複習單字，趁現在記憶深刻趕快清零，成效會更好喔！'
  }
];

export const PushReminderModal: React.FC<PushReminderModalProps> = ({
  isOpen,
  onClose,
  mode,
  targetStudent,
  boundStudents,
  words,
  onConfirmBatchSend,
  onConfirmSinglePush,
  onConfirmSingleShare,
  onConfirmClassShare,
  isSending
}) => {
  const [customTitle, setCustomTitle] = useState('📢 課後單字學習提醒');
  const [customMessage, setCustomMessage] = useState(
    '保持每日學習好習慣！觀光餐旅專業單字庫已準備就緒，把握零碎時間開始挑戰！'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('daily');
  const [previewStudentIndex, setPreviewStudentIndex] = useState(0);

  // 當前預覽的學生資料
  const currentPreviewStudent = useMemo(() => {
    if (mode === 'single' && targetStudent) {
      return targetStudent;
    }
    if (boundStudents.length > 0) {
      return boundStudents[Math.min(previewStudentIndex, boundStudents.length - 1)];
    }
    return {
      seatNumber: '05',
      lineDisplayName: '王小明',
      streakDays: 3,
      unlockedLevel: 2
    } as UserProfile;
  }, [mode, targetStudent, boundStudents, previewStudentIndex]);

  // 計算預覽學生的待複習單字數
  const previewDueCount = useMemo(() => {
    if (!currentPreviewStudent || !currentPreviewStudent.wordStats) return 0;
    return words.filter((w) => isWordDueForReview(currentPreviewStudent.wordStats?.[w.id])).length;
  }, [currentPreviewStudent, words]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: TemplateItem) => {
    setSelectedTemplateId(tpl.id);
    setCustomTitle(tpl.title);
    setCustomMessage(tpl.message);
  };

  const handleAppendSnippet = (snippet: string) => {
    setCustomMessage((prev) => (prev ? `${prev}\n${snippet}` : snippet));
  };

  const handleResetToDefault = () => {
    setSelectedTemplateId('daily');
    setCustomTitle('📢 課後單字學習提醒');
    setCustomMessage('保持每日學習好習慣！觀光餐旅專業單字庫已準備就緒，把握零碎時間開始挑戰！');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  {mode === 'batch' && '🔒 全班 1 對 1 私訊推播提醒'}
                  {mode === 'single' && '💬 個人 1 對 1 私訊提醒'}
                  {mode === 'class_group' && '📢 205 班群廣播卡片發布'}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-white/20 rounded-full tracking-wide">
                  {mode === 'batch' && `共 ${boundStudents.length} 位已綁定學生`}
                  {mode === 'single' && `座號 ${targetStudent?.seatNumber || ''}`}
                  {mode === 'class_group' && '全班班群'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                在正式送出前，您可以自由預覽並自訂每次傳送給學生的提醒內容與叮嚀！
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content: Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-100 flex-1">
          {/* Left Column: Form & Editor (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 space-y-4">
            {/* Target Audience Bar */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>發送對象：</span>
                </span>
                {mode === 'batch' && (
                  <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg text-[11px]">
                    已綁定 {boundStudents.length} 位學生
                  </span>
                )}
                {mode === 'single' && targetStudent && (
                  <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg text-[11px]">
                    座號 {targetStudent.seatNumber} ({targetStudent.lineDisplayName || '學生'})
                  </span>
                )}
                {mode === 'class_group' && (
                  <span className="font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-lg text-[11px]">
                    205 班級 LINE 群組
                  </span>
                )}
              </div>

              {/* Student list preview tags in batch mode */}
              {mode === 'batch' && boundStudents.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pt-1">
                  {boundStudents.map((st, idx) => (
                    <button
                      key={st.seatNumber}
                      type="button"
                      onClick={() => setPreviewStudentIndex(idx)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center space-x-1 ${
                        previewStudentIndex === idx
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                      }`}
                      title="點擊切換右側預覽此學生卡片"
                    >
                      <span>{st.seatNumber} 號</span>
                      <span className="text-[10px] opacity-80 truncate max-w-[60px]">
                        {st.lineDisplayName || '同學'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Template Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>常用提醒範本（點擊一鍵套用）：</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-[11px] text-slate-400 hover:text-slate-600 font-bold flex items-center space-x-0.5 transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>重置</span>
                </button>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedTemplateId === tpl.id
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tpl.badge}
                  </button>
                ))}
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700 flex items-center space-x-1">
                <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                <span>推播標題 (LINE 卡片最上方粗體字)：</span>
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="例如：📢 課後單字學習提醒 或 📝 週五小考叮嚀"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Custom Message Textarea */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 flex items-center space-x-1">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  <span>老師叮嚀／自訂修改內容 (即時同步至右側預覽)：</span>
                </label>
                <span className="text-[11px] font-bold text-slate-400">
                  {customMessage.length} 字
                </span>
              </div>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                placeholder="在此輸入您想傳達給學生的個別叮嚀、小考時間、作業截止日、或是鼓勵的話..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Quick Append Buttons */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500">快捷追加常用備註：</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAppendSnippet('⚠️ 請於今晚 10:00 前完成今日單字闖關！')}
                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all"
                >
                  + 今晚10點截止
                </button>
                <button
                  type="button"
                  onClick={() => handleAppendSnippet('📝 明天早自習抽考本單元單字，請務必拿滿三星！')}
                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition-all"
                >
                  + 明天抽考
                </button>
                <button
                  type="button"
                  onClick={() => handleAppendSnippet('🎉 闖關完成後可截圖至群組打卡換點數！')}
                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-all"
                >
                  + 打卡換點數
                </button>
                <button
                  type="button"
                  onClick={() => setCustomMessage('')}
                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all"
                >
                  清空內容
                </button>
              </div>
            </div>

            {/* Privacy Protection Notice */}
            <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-[11px] text-emerald-900 space-y-1">
              <p className="font-extrabold flex items-center space-x-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>隱私保護機制：</span>
              </p>
              <p className="text-emerald-800 leading-relaxed font-medium">
                此 1 對 1 私訊推播僅會送達到該學生的個人 LINE 聊天室，<strong>班群其他老師、學生或家長完全不會收到</strong>，且每位學生的待複習單字數與進度會動態帶入！
              </p>
            </div>
          </div>

          {/* Right Column: Simulated LINE Card Preview (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 bg-slate-50 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-slate-700 flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>LINE 擬真卡片預覽</span>
                </span>
                <span className="text-[10px] font-extrabold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  學生端視角
                </span>
              </div>

              {/* Smartphone Frame / Bubble Card */}
              <div className="bg-[#8C9DAE] p-3 rounded-2xl shadow-inner border border-slate-300/80">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100 font-sans">
                  {/* Card Header (LINE Green) */}
                  <div className="bg-[#06C755] p-4 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100">
                        {customTitle || '📢 課後單字學習提醒'}
                      </span>
                      <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
                        LINE Bot
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-black mt-1 tracking-tight text-white drop-shadow-xs">
                      {currentPreviewStudent.lineDisplayName || '同學'}{' '}
                      <span className="text-xs font-normal opacity-90">
                        (座號 {currentPreviewStudent.seatNumber})
                      </span>
                    </h4>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 bg-white text-slate-800">
                    {/* Default Spaced Repetition status */}
                    <div className="text-xs font-medium text-slate-700 leading-relaxed">
                      {previewDueCount > 0 ? (
                        <span>
                          📚 您今日有{' '}
                          <strong className="text-rose-600 font-black">
                            {previewDueCount}
                          </strong>{' '}
                          個單字已進入記憶曲線複習池囉！
                        </span>
                      ) : (
                        <span>
                          🌟 保持每日學習好習慣！觀光餐旅專業單字庫與最新關卡已準備就緒，點擊開始挑戰！
                        </span>
                      )}
                    </div>

                    {/* Teacher's Custom Note (Highlight block) */}
                    {customMessage.trim() && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1">
                        <div className="flex items-center space-x-1 text-emerald-800 font-black text-[11px]">
                          <span>💡 老師叮嚀：</span>
                        </div>
                        <p className="text-emerald-950 font-semibold leading-relaxed whitespace-pre-wrap">
                          {customMessage.trim()}
                        </p>
                      </div>
                    )}

                    {/* Learning Streak */}
                    <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-500 pt-1 border-t border-slate-100">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        連續學習天數：{currentPreviewStudent.streakDays || 1} 天
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Button */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100">
                    <div className="w-full py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-black text-xs text-center shadow-xs flex items-center justify-center space-x-1.5 transition-all">
                      <span>🚀 開始背單字 / 挑戰關卡</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info hint */}
            <p className="text-[11px] text-slate-400 font-medium text-center">
              💡 學生在 LINE 聊天室中收到的卡片樣式即為上方預覽樣態。
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all"
          >
            取消返回
          </button>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Batch Send Mode */}
            {mode === 'batch' && (
              <button
                type="button"
                onClick={() => onConfirmBatchSend(customMessage, customTitle)}
                disabled={isSending || boundStudents.length === 0}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition-all"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>正在發送全班推播...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>確認發送 LINE 推播 ({boundStudents.length} 位學生)</span>
                  </>
                )}
              </button>
            )}

            {/* Single Student Mode: Two options */}
            {mode === 'single' && targetStudent && (
              <>
                <button
                  type="button"
                  onClick={() => onConfirmSingleShare(targetStudent, customMessage, customTitle)}
                  disabled={isSending}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition-all"
                  title="開啟 LINE 聊天室，自動預填文字發送（100% 成功，零門檻）"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>💬 開啟 LINE 傳送私訊 (推薦)</span>
                </button>

                {targetStudent.lineUserId && (
                  <button
                    type="button"
                    onClick={() => onConfirmSinglePush(targetStudent, customMessage, customTitle)}
                    disabled={isSending}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
                    title="由官方 Bot 直接推播卡片到該學生 LINE 聊天室"
                  >
                    {isSending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>🚀 官方 Bot 推播卡片</span>
                  </button>
                )}
              </>
            )}

            {/* Class Group Mode */}
            {mode === 'class_group' && (
              <button
                type="button"
                onClick={() => onConfirmClassShare(customMessage, customTitle)}
                disabled={isSending}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-1.5 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>📢 開啟 LINE 分享至 205 班群</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

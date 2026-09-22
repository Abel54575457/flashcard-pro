import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      // 保留當前座號，重置有疑慮的快取
      localStorage.removeItem('flashcard_pro_custom_words');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  private handleFullReset = () => {
    if (confirm('確定要完整清理所有快取並重新載入嗎？')) {
      try {
        localStorage.clear();
      } catch {
        // ignore
      }
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-700 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-white font-serif">
                FlashCard Pro 系統保護喚起
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                偵測到瀏覽器舊快取或元件載入例外。請點擊下方修復按鈕，即可瞬間恢復正常單字卡學習！
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-amber-300/80 text-left overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>一鍵自動修復並重新載入</span>
              </button>

              <button
                onClick={this.handleFullReset}
                className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-all"
              >
                深層重置快取資料
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

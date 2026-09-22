# 🎮 互動式記憶字卡 Pro 遊戲開發與維護完整工作流藍圖 (Workflow Blueprint)

> **版本**：v2.5 (2026-09-20 最新版)  
> **目的**：作為後續開發全新學科、全新主題或全新班級（如：餐飲英語、日文五十音、歷史年表、地理常識等）互動單字卡/知識卡遊戲的標準作業流程 (Standard Operating Procedure, SOP)。每一次系統重大更新，皆同步修訂本文件。

---

## 📋 目錄
1. 🎯 **核心架構與技術選型 (Tech Stack & Architecture)**
2. 📚 **單字庫與關卡架構設計 (Data & Level Schema)**
3. 📖 **全冊單字總表與預習/複習模組 (Vocabulary Master List)**
4. 🧠 **萊特納間隔重複演算法 (Leitner Spaced Repetition)**
5. 💬 **LINE Messaging API / LIFF 整合與 CORS 避坑指南**
6. 🔥 **Firebase Realtime Database 實時同步與排行榜**
7. 👩‍🏫 **教師管理儀表板與學習歷程追蹤 (Teacher Dashboard)**
8. 🛡️ **系統容錯與備援機制 (ErrorBoundary & Fallbacks)**
9. 🚀 **一鍵編譯、實體部署與雲端硬碟同步流程 (Build & Deployment)**
10. 🔄 **快速套用與複製流程 (Quick Replication Guide for New Games)**

---

### 1. 🎯 核心架構與技術選型 (Tech Stack & Architecture)
- **前端框架**：React 18 + TypeScript + Vite
- **UI 樣式**：Tailwind CSS + Lucide React 圖示庫 + Canvas Confetti 特效
- **音效系統**：Web Audio API (無外部音檔相依性，產出高音質答對/答錯/升級音效)
- **語音合成**：Web Speech Synthesis API (SpeechSynthesisUtterance, 支援多國語音朗讀)
- **雲端資料庫**：Firebase Realtime Database (即時排行榜、學生進度、個人化記憶星等)
- **LINE 服務**：LINE Front-end Framework (LIFF) + LINE Messaging API (Flex Message / 1對1 私訊)
- **代理伺服器**：Google Apps Script (GAS) Web App (轉發 Messaging API 推播，突破瀏覽器 CORS 限制)
- **主機代管**：Firebase Hosting (https://flashcard-pro-app-25c7f.web.app)
- **檔案鏡像**：Google Drive (h:\我的雲端硬碟\116年\AI專區\二年級記憶字卡)

---

### 2. 📚 單字庫與關卡架構設計 (Data & Level Schema)
所有單字與關卡均抽離至 src/data/grade2Words.ts：
`	ypescript
export interface WordItem {
  id: string;          // 唯一識別碼 (如 'u1-1', 'u7-15')
  word: string;        // 英文單字 / 核心題目
  phonetic: string;    // KK 音標 / 讀音
  translation: string; // 中文釋義
  category: string;    // 分類標籤 (如 '房務用語', '餐飲服務', '機場海關')
  exampleEn: string;   // 英文例句
  exampleZh: string;   // 例句中文翻譯
  unit: number;        // 所屬單元區塊 (1~7)
}
`

#### 關卡設計原則：
- **階段性解鎖**：劃分為 7 大實務單元區（如 Unit 1 旅館基礎 ~ Unit 7 專業與情境英語）。
- **闖關成就感**：每關 10~15 字，獲得星星解鎖下一關。
- **多元遊戲模式**：
  1. **翻卡記憶 (Flashcards)**：正面英文、反面發音與中文。
  2. **四選一測驗 (Multiple Choice)**：即時反饋音效與連勝計數。
  3. **配對連連看 (Matching Game)**：考驗反應速度與直覺記憶。
  4. **拼字大挑戰 (Spelling Challenge)**：字母重組與拼寫測驗。

---

### 3. 📖 全冊單字總表與預習/複習模組 (Vocabulary Master List)
- **檔案位置**：src/components/VocabularyMasterListModal.tsx
- **功能設計**：
  - **闖關前預習**：學生無需開始遊戲即可於首頁一鍵開啟 📖 全冊單字總表 閱讀全冊 135 字。
  - **即時搜尋與篩選**：支援關鍵字搜尋、單元 (Unit 1~7) 與主題分類過濾。
  - **發音朗讀 (🔊)**：點擊聲音圖示朗讀英文音檔。
  - **列印對照表 (🖨️)**：一鍵開啟對齊良好的紙本/PDF 列印對照視窗。

---

### 4. 🧠 萊特納間隔重複演算法 (Leitner Spaced Repetition)
- **檔案位置**：src/services/spacedRepetition.ts
- **演算法核心**：
  - **Level 1**：即時複習 (1 天後)
  - **Level 2**：短記憶 (3 天後)
  - **Level 3**：中記憶 (7 天後)
  - **Level 4**：長記憶 (14 天後)
  - **Level 5**：永久記憶 (30 天後)
- **動態複習池**：根據學生每日答對/答錯自動調整 Level，計算當日 dueCount (待複習字數)，精準觸發提醒。

---

### 5. 💬 LINE Messaging API / LIFF 整合與 CORS 避坑指南

#### ⚠️ 瀏覽器 CORS 限制原理說明
- **原因**：LINE Messaging API 推播端點 (https://api.line.me/v2/bot/message/push) 為伺服器對伺服器 API，LINE 未設定 Access-Control-Allow-Origin: * 標頭。
- **現象**：當使用者在 Chrome/Edge/Safari 等網頁前端 JS 呼叫 fetch('https://api.line.me...') 時，瀏覽器會安全性攔截並拋出 CORS 錯誤。

#### 💡 最佳解決方案矩陣

| 方案名稱 | 適用情境 | 優點 | 操作方式 |
| :--- | :--- | :--- | :--- |
| **方案 A：1對1 私訊提醒 (推薦)** | 教師後台點對點催繳 | **零設定、100% 成功、絕不安擾班群其他老師** | 點擊學生清單右側 **💬 私訊提醒**，自動拉起 LINE 對話框。 |
| **方案 B：GAS 雲端代理轉發 (2026 極速版)** | 全自動 1 對 1 批次推播 | 雲端 2 秒全班並行推播、內建 Token 檢測、絕不卡死 | 將專案內的 LINE_Push_Proxy.gs 部署為 Web App 並貼回後台。 |
| **方案 C：LIFF 分享卡片** | 班級 LINE 群組公告 | 展現精美 Flex 圖文卡片 | 點擊 **📢 分享公告到 205 班群**，選取班群發送。 |

#### GAS Proxy 代理腳本（LINE_Push_Proxy.gs - 2026 極速版重點）：
- **action=check**：即時檢驗 Channel Access Token 是否有效，防止 401 假發送。
- **action=batch**：前端打包全班學生陣列，GAS 在 Google 雲端 2 秒完成全部推播，徹底解決前端迴圈逾時卡死。
- **原生 CORS 支援**：自動適應 GET 與 POST，無 redirect 掉包問題。

---

### 6. 🔥 Firebase Realtime Database 實時同步與排行榜
- **檔案位置**：src/services/storage.ts
- **資料庫架構**：
  - /students/{seatNumber}：學生個人基本資料、綁定 LINE ID、星星數、關卡進度。
  - /wordStats/{seatNumber}/{wordId}：個人單字熟練度與複習時間戳。
  - /leaderboard：全班即時總星數與答對率排行榜。

---

### 7. 👩‍🏫 教師管理儀表板與學習歷程追蹤 (Teacher Dashboard)
- **檔案位置**：src/components/TeacherDashboard.tsx
- **功能特色**：
  - **全班學習概況**：即時統計完成率、平均星星數、綁定人數。
  - **未完成學生預警**：自動紅標標示未完成當前關卡或滯後學生。
  - **1對1 私訊催繳按鈕**：個別發送專屬 LINE 催繳訊息。
  - **單字線上編輯器**：支援教師現場新增、修改單字與例句。

---

### 8. 🛡️ 系統容錯與備援機制 (ErrorBoundary & Fallbacks)
- **檔案位置**：src/components/ErrorBoundary.tsx
- **防護設計**：
  - 攔截 React 元件渲染與 JS 執行階段未預期例外，防止白畫面。
  - 提供一鍵恢復按鈕 (重新載入應用程式)。
  - LocalStorage 備援存取：網路斷線時自動退回本機備份，連線後自動同步回 Firebase。

---

### 9. 🚀 一鍵編譯、實體部署與雲端硬碟同步流程 (Build & Deployment)

每次更新程式碼後，執行以下標準三步驟：

`ash
# 步驟 1：建置前端優化靜態檔
npm run build

# 步驟 2：正式部署至 Firebase Hosting 主機
npx firebase deploy --only hosting

# 步驟 3：同步鏡像至 Google Drive 備份資料夾 (Powershell / Command)
xcopy /E /Y /I C:\flashcard-pro " h:\我的雲端硬碟\116年\AI專區\二年級記憶字卡\
`

---

### 10. 🔄 快速套用與複製流程 (Quick Replication Guide for New Games)

若未來需要為 **別的學科** 或 **新班級** 製作全新的單字/知識卡遊戲，只需 4 步：
1. **複製本專案資料夾** 到新目錄。
2. **替換單字檔** (src/data/grade2Words.ts)：填入新學科的單字、中文與例句。
3. **設定班級代碼** (src/components/PasscodeModal.tsx)：修改通行碼 (如 301, 302)。
4. **修改標題與 Firebase / LIFF 設定** (src/services/liff.ts & App.tsx)，完成編譯與部署！

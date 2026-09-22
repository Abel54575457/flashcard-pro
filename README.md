# 🎴 FlashCard Pro - 互動式雙語記憶字卡遊戲系統

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting%20%7C%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![LINE LIFF](https://img.shields.io/badge/LINE-LIFF%20%7C%20Messaging%20API-00C300?logo=line&logoColor=white)](https://developers.line.biz/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 專為教學現場打造的**高效數位單字記憶與自主學習闖關系統**。  
> 融合**萊特納間隔重複演算法 (Leitner Spaced Repetition)**、**Web Audio / TTS 跨平台語音朗讀**、**全班即時英雄榜**與 **LINE 官方帳號 1 對 1 個人化課後提醒推播**。

🌐 **線上正式版體驗 (Live Demo)**：[https://flashcard-pro-app-25c7f.web.app](https://flashcard-pro-app-25c7f.web.app)

---

## 📖 目錄 (Table of Contents)
1. [🌟 系統核心特色](#-系統核心特色)
2. [🎮 五大學習與遊戲模式](#-五大學習與遊戲模式)
3. [🚀 任何人都能照做的 10 分鐘快速上手指南](#-任何人都能照做的-10-分鐘快速上手指南)
4. [📚 如何打造您自己學科的字卡遊戲（只需改 1 個檔案）](#-如何打造您自己學科的字卡遊戲只需改-1-個檔案)
5. [☁️ Firebase 雲端資料庫設定（即時連線與排行榜）](#️-firebase-雲端資料庫設定即時連線與排行榜)
6. [💬 LINE 官方帳號與 1 對 1 私訊推播設定 (2026 極速版)](#-line-官方帳號與-1-對-1-私訊推播設定-2026-極速版)
7. [👩‍🏫 教師管理後台功能](#-教師管理後台功能)
8. [🚢 免費部署上線教學 (Firebase Hosting / GitHub Pages)](#-免費部署上線教學-firebase-hosting--github-pages)
9. [📁 專案架構目錄說明](#-專案架構目錄說明)

---

## 🌟 系統核心特色

* **免密碼座號選擇**：首頁直接點選座號（如 01 ~ 35 號），本機與雲端無縫記憶，學生免除背誦帳號密碼的負擔。
* **無損進度雙向同步**：自動比對 LocalStorage 本機快取與 Firebase 雲端資料，無縫合併最高解鎖關卡、星星數與記憶盒狀態，進度永不遺失。
* **100% 跨平台語音朗讀 (TTS)**：Web Speech API 系統原生發音，搭配線上標準發音雙軌備援，完美支援 iOS Safari、Android Chrome、Windows 與 Mac。
* **無外部依賴的合成音效**：使用 Web Audio API 即時運算輸出答對、連勝、通關彩帶與升級音效，零額外音檔相依。
* **非阻塞慶祝體驗**：通關彩帶粒子特效 (Canvas Confetti) 於 1.2 秒內平滑淡出並清理，操作流暢不卡手。
* **系統防禦與白畫面保護**：內建 React ErrorBoundary 容錯邊界，徹底隔絕例外狀況。

---

## 🎮 五大學習與遊戲模式

| 模式名稱 | 特色與學習機制 | 適用時機 |
| :--- | :--- | :--- |
| **🎴 翻卡記憶 (Flashcards)** | 正面英文/術語、反面發音與中文釋義，支援單元循序學習與自由翻閱。 | 課前預習、初次認知 |
| **🎧 聽力測驗 (Listening Quiz)** | 真人語音朗讀單字，學生透過聽力辨識進行四選一測驗，計時與答題反饋。 | 聽力訓練、強化記憶 |
| **🧩 雙語連連看 (Matching Game)** | 英文與中文即時配對，考驗反應速度與直覺聯想，刺激大腦突觸連結。 | 課堂破冰、趣味競賽 |
| **📖 錯題本 (Mistake Notebook)** | 依據萊特納間隔重複曲線，自動收集答錯或待複習的單字，精準補強弱點。 | 考前衝刺、個別化複習 |
| **🏆 全班即時排行榜 (Leaderboard)** | 即時統計全班各座號總星星數、熟練單字百分比與解鎖進度，激發同儕良性競爭。 | 學習動機、成果驗收 |

---

## 🚀 任何人都能照做的 10 分鐘快速上手指南

想要製作屬於自己的單字卡遊戲？任何人只要跟著以下步驟就能在 10 分鐘內建立並在電腦上跑起來：

### 步驟 1：安裝環境
請確認您的電腦已安裝 [Node.js](https://nodejs.org/) (建議 v18 或 v20 以上版本) 與 Git。

### 步驟 2：下載本專案
打開終端機 (Terminal 或 PowerShell) 執行：
`ash
git clone https://github.com/Abel54575457/flashcard-pro.git
cd flashcard-pro
`

### 步驟 3：安裝依賴套件
`ash
npm install
`

### 步驟 4：啟動本地預覽
`ash
npm run dev
`
瀏覽器打開 http://localhost:5173，您就可以立即體驗並操作完整的單字卡遊戲！

---

## 📚 如何打造您自己學科的字卡遊戲（只需改 1 個檔案）

本系統所有題目均為**純資料驅動**，您完全不需要修改任何程式邏輯，只要修改 **src/data/grade2Words.ts** 即可換成任何學科！

### 範例：替換為您的專屬單字卡
開啟 src/data/grade2Words.ts，每個單字只要遵循以下格式即可：

`	ypescript
export const GRADE_2_WORDS: WordItem[] = [
  {
    id: 'w_001',
    word: 'Concierge',                     // 英文單字 / 核心專業術語
    phonetic: '/ˌkɒn.siˈeəʒ/',             // 音標或讀音
    translation: '禮賓接待 / 服務台人員',    // 中文釋義
    category: '飯店客務',                   // 分類標籤
    exampleEn: 'The concierge booked a table for us.', // 英文例句
    exampleZh: '禮賓人員為我們預訂了一張餐桌。',          // 例句中文
    levelId: 1                             // 所屬關卡 (Unit 1)
  },
  {
    id: 'w_002',
    word: 'Boarding Pass',
    phonetic: '/ˈbɔː.dɪŋ ˌpɑːs/',
    translation: '登機證',
    category: '航空票務',
    exampleEn: 'Please show your boarding pass at the gate.',
    exampleZh: '請在登機門出示您的登機證。',
    levelId: 1
  }
];
`

* **關卡名稱自訂**：在同檔案下方的 LEVEL_NAMES 中設定各關名稱（如：1: 'Unit 1：飯店客務基礎'）。
* **支援多種科目**：
  * **日語學習**：把 word 填入平假名，phonetic 填入羅馬拼音，	ranslation 填入中文。
  * **歷史/地理**：把 word 填入歷史事件/地名，	ranslation 填入年代/特色說明。
  * **醫護術語**：把 word 填入醫學縮寫，	ranslation 填入醫學中文名稱。

---

## ☁️ Firebase 雲端資料庫設定（即時連線與排行榜）

若希望學生在各自手機操作時，成績能自動即時匯整到全班排行榜與教師端：

1. 前往 [Firebase Console](https://console.firebase.google.com/) 免費建立專案。
2. 點擊 **Firestore Database** ➔ 建立資料庫（選擇測試模式或允許讀寫）。
3. 進入專案設定 (Project Settings) ➔ 複製 irebaseConfig 物件。
4. 進入遊戲右上角 **「教師管理」**（預設密碼 205 或 	eacher888）➔ 切換至 **「Firebase 雲端設定」** 貼上並儲存，全班資料即刻自動上雲！

---

## 💬 LINE 官方帳號與 1 對 1 私訊推播設定 (2026 極速版)

本系統支援教師在後台點擊按鈕，**全自動將客製化課後提醒卡片推播到學生的個人 LINE 聊天室**（絕不安擾班級群組的其他老師或家長）！

### 架構說明
`
[教師電腦瀏覽器] 
       │ (1次請求打包全班名冊)
       ▼
[Google Apps Script (GAS) 雲端代理] 
       │ (在 Google 高速機房 2 秒內並行轉發)
       ▼
[LINE Messaging API 伺服器]
       │ (精準推播 Flex Message 卡片)
       ▼
[學生個人的 LINE 聊天室]
`

### 快速設定 3 步驟：
1. **取得 LINE Token**：
   * 前往 [LINE Developers Console](https://developers.line.biz/console/) 進入 Messaging API Channel。
   * 在 **Messaging API** 頁籤底端點擊 **Issue** 取得 **Channel access token (long-lived)**。
2. **部署 GAS 雲端代理**：
   * 前往 [Google Apps Script](https://script.google.com/) 新增專案。
   * 將專案內的 LINE_Push_Proxy.gs 程式碼全部複製貼上。
   * 點右上角 **「部署」** ➔ **「新增部署作業」** ➔ 種類選 **「網頁應用程式 (Web App)」** ➔ 誰可以存取選 **「所有人 (Anyone)」** ➔ 複製取得的 /exec 網址。
3. **後台貼上並測試**：
   * 在教師管理後台貼入 Token 與 GAS 網址，點擊 **🔍 立即測試 Token 狀態**，看到連線成功綠燈即代表全線打通！

---

## 👩‍🏫 教師管理後台功能

教師管理後台提供一站式學情監控與個別化關懷工具：

* **全班學習概況總覽**：座號、姓名、頭像、LINE 綁定狀態、星星數、熟練單字數、最後登入時間。
* **🔒 1 對 1 全班自動推播**：一鍵將全班每位同學「今日待複習的專屬單字量」推播至個人 LINE。
* **💬 個別學生即時私訊**：學生名單右側設有專屬按鈕，隨時單獨私訊該學生，100% 成功、零設定門檻。
* **📢 分享公告到班群**：一鍵產生精美圖文 Flex 卡片發布至班級 LINE 群組。
* **單字線上總表 (Master List)**：支援全文檢索、發音試聽、單字卡片列印與 PDF 匯出。
* **CSV 批次匯入 / 匯出**：支援以 Excel / 試算表編輯單字庫後一鍵匯入。

---

## 🚢 免費部署上線教學 (Firebase Hosting / GitHub Pages)

### 方案 A：部署至 Firebase Hosting（推薦，完全免費）
`ash
# 1. 產生正式打包檔
npm run build

# 2. 部署到 Firebase Hosting
npx firebase-tools deploy --only hosting
`

### 方案 B：部署至 GitHub Pages
1. 在 ite.config.ts 內加入 ase: '/flashcard-pro/'。
2. 執行 
pm run build。
3. 在 GitHub 倉庫的 Settings ➔ Pages 設定發布來源即可。

---

## 📁 專案架構目錄說明

`
flashcard-pro/
├── public/                       # 靜態資源 (LINE Rich Menu 圖片、圖標)
├── src/
│   ├── components/               # React 頁面組件
│   │   ├── LevelSelector.tsx     # 關卡地圖首頁 & 免密碼座號選擇
│   │   ├── FlashcardMode.tsx     # 閃卡記憶模式 (翻卡、發音、例句)
│   │   ├── ListeningQuiz.tsx     # 聽力選字四選一測驗
│   │   ├── MemoryMatchGame.tsx   # 雙語連連看配對遊戲
│   │   ├── MistakeNotebook.tsx   # 萊特納智慧錯題本 (間隔重複複習)
│   │   ├── Leaderboard.tsx       # 全班即時星數與熟練度英雄榜
│   │   ├── TeacherDashboard.tsx  # 教師管理端 (學情監控、LINE推播、Token檢測)
│   │   ├── VocabularyMasterListModal.tsx # 全冊單字總表 (檢索、列印、試聽)
│   │   ├── ErrorBoundary.tsx     # 系統防崩潰與白畫面保護邊界
│   │   └── Navbar.tsx            # 頂部導覽列
│   ├── data/
│   │   └── grade2Words.ts        # 核心題目資料庫 (160+ 專業單字與分類)
│   ├── services/
│   │   ├── spacedRepetition.ts   # 萊特納間隔重複演算法核心
│   │   ├── soundEffects.ts       # Web Audio API 合成音效引擎
│   │   ├── firebase.ts           # Firestore 雲端資料庫雙向同步
│   │   ├── liff.ts               # LINE LIFF 與 Messaging API 推播服務
│   │   └── storage.ts            # 本地快取與無損資料合併
│   ├── utils/
│   │   └── csvHelper.ts          # 單字庫 CSV 匯入與匯出工具
│   ├── App.tsx                   # 應用程式主邏輯與全域狀態
│   └── main.tsx                  # 應用程式入口
├── LINE_Push_Proxy.gs            # Google Apps Script 雲端代理轉發腳本 (2026 極速版)
├── WORKFLOW_GAME_CREATION_BLUEPRINT.md # 新遊戲快速產出標準作業程序 (SOP)
└── README.md                     # 本說明文件
`

---

## 📄 授權條款 (License)

本專案採用 [MIT License](LICENSE) 開源授權，歡迎教育工作者、師生或開發者自由分叉 (Fork)、客製化修改並應用於各級學校課堂或自主學習專案中！

⭐ **如果這個專案對您的教學或學習有所幫助，請不吝在 GitHub 給予一顆 Star 支持！**

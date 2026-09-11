# 🚀 新專案通用開發工作流程指南 (免 Firebase / 極簡 GitHub Pages 自動化版)

本文件為 **免 Firebase 伺服器** 的通用 Web 應用程式（Web App）開發 SOP 指南。適用於未來的全新專案、教學遊戲、單字卡、測驗系統或工具軟體。
**未來製作新專案時，您可以直接將本文件複製給任何 AI Agent（AI 編程助手），AI 即可自動依照此規範完成開發、測試與發布。**

---

## 📌 1. 核心定位與技術選擇 (Core Tech Stack)

- **目標定位**：零伺服器成本、免註冊雲端資料庫、開啟網址即用的輕量 Web App。
- **技術棧 (Tech Stack)**：
  - **前端框架**：Vite + React (或 Vue / 純 HTML5) + Tailwind CSS
  - **資料持久化**：瀏覽器內建 `LocalStorage`（學生/使用者資料存於各自裝置，免帳密登入）
  - **網站託管發布**：**GitHub Pages**（免費全球 CDN 託管，網址格式：`https://您的帳號.github.io/專案名稱/`）
  - **自動化流水線**：**GitHub Actions**（每次 Git Push 自動完成打包與部署，免手動指令）
  - **異地檔案備份**：Google Drive (透過 Windows Robocopy 背景自動鏡像)

---

## 🛠️ 2. 新專案一鍵初始化流程 (Project Setup)

當您要開始一個全新的專案時，只需對 AI Agent 說：

> **「請參考 WORKFLOW_NO_FIREBASE.md 建立新專案 [專案名稱]，使用 React + Vite + Tailwind CSS，並設定 GitHub Pages 自動發布。」**

AI Agent 會自動執行以下初始化：
1. 建立專案資料夾與 Vite 基礎結構。
2. 配置 `.github/workflows/deploy.yml`（GitHub Pages 自動化發布腳本）。
3. 初始化 Git 儲存庫並綁定您的 GitHub 帳號。

---

## 🤖 3. AI Agent 標準開發與發布 SOP (5 大步驟)

```mermaid
graph TD
    A[Step 1: 需求解析與程式修改] --> B[Step 2: 本地打包測試 npm run build]
    B --> C[Step 3: 推送至 GitHub (git push)]
    C --> D[Step 4: GitHub Actions 背景自動發布網頁]
    D --> E[Step 5: Google Drive 雲端資料夾鏡像備份]
```

### 🔹 Step 1: 需求解析與程式修改
- AI Agent 直接於本機專案目錄修改代碼。
- 數據儲存統一使用 `LocalStorage`，設計直覺免密碼的使用者體驗。

### 🔹 Step 2: 本地建置驗證 (`npm run build`)
- AI 在本機終端機執行測試建置：
  ```bash
  npm run build
  ```
- 確保 TypeScript 與 Vite 打包無任何錯誤（Exit code 0）。

### 🔹 Step 3: 一鍵推送至 GitHub (`git push`)
- AI 將程式碼提交並推送到 GitHub：
  ```bash
  git add .
  git commit -m "feat: 新增專案功能與修復"
  git push origin main
  ```

### 🔹 Step 4: GitHub Actions 背景自動發布 (免人工作業)
- 推送完成後，GitHub 伺服器會**自動觸發雲端建置**，約 30 秒內自動更新線上網站：
  - **線上網址**：`https://您的帳號.github.io/專案名稱/`
  - **優點**：您與 AI 完全不需要執行任何 `deploy` 命令，一切全自動！

### 🔹 Step 5: Google Drive 異地鏡像備份
- AI 執行背景同步指令，將最新程式碼備份至 Google 雲端硬碟：
  ```cmd
  robocopy "C:\您的專案路徑" "h:\您的雲端硬碟\專案備份資料夾" /E /XD node_modules .git dist /XO
  ```

---

## 📄 4. 附錄：GitHub Pages 自動化腳本模板 (`.github/workflows/deploy.yml`)

未來的每一個新專案，只需要把這份檔案放在專案的 `.github/workflows/deploy.yml`，GitHub 就會自動開啟免費部署：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Project
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

---

## 💡 5. 免 Firebase 模式優缺點速查表

| 評比項目 | 免 Firebase 模式 (GitHub Pages + LocalStorage) | 傳統含 Firebase 模式 |
| :--- | :--- | :--- |
| **開發難易度** | ⭐⭐⭐⭐⭐ **最簡單**（免設定檔、免 API Key） | ⭐⭐⭐（需要註冊與設定權限） |
| **維護成本** | 💰 **完全 0 元** / 永久免費 | 💰 免費額度內免費，超出需付費 |
| **發布自動化** | ⚡ **Push 即自動發布**（CMD 指令更少） | 需要執行 `firebase deploy` 命令 |
| **適用場景** | 課堂遊戲、單字卡、個人工具、測驗系統、教學展示 | 需要實時全班連線/跨裝置強同步的大型系統 |

---
*本文件已存檔，隨時可複製給任何 AI Coding Agent 進行新專案開發。*

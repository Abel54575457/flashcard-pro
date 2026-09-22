@echo off
chcp 65001 >nul
title FlashCard Pro - 推送至 GitHub
color 0b
echo ======================================================================
echo   🎴 FlashCard Pro — 一鍵推送專案與完整文件至 GitHub
echo ======================================================================
echo.
echo 正在準備推送最新專案、README.md、工作流藍圖與單字庫...
echo 目標倉庫：https://github.com/Abel54575457/flashcard-pro.git
echo.
echo 💡 提示：如果彈出「Sign in with your browser」視窗，
echo 請點擊綠色按鈕透過瀏覽器完成 GitHub 授權即可！
echo.
cd /d "C:\flashcard-pro"
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ======================================================================
    echo   ✅ 恭喜！專案、README.md 與所有文件已成功上傳至 GitHub！
    echo   👉 立即查看：https://github.com/Abel54575457/flashcard-pro
    echo ======================================================================
) else (
    echo.
    echo ======================================================================
    echo   ❌ 上傳未完成，請確認網路連線或 GitHub 登入授權狀態。
    echo ======================================================================
)

echo.
echo 請按任意鍵結束本視窗...
pause >nul

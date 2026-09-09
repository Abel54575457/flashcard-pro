import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // 支援 GitHub Pages 與靜態網站託管相對路徑
  server: {
    host: true, // 允許區域網路（手機 Wi-Fi）連線測試
  },
})

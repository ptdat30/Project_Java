import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- Đảm bảo bạn đã cài đặt plugin này nếu sử dụng.

export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server: {
    port: 4173,
  },
})

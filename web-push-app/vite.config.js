import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Cho phép truy cập từ network
    port: 3000, // Port mặc định
    strictPort: true, // Sử dụng port cố định
    open: true, // Tự động mở browser
  }
})

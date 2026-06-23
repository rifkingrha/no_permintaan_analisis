import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => ({
  base: process.env.BASE_URL,
  plugins: [vue(), tailwindcss()],
  
  css: {
    devSourcemap: mode === "development",
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  // 🔥 TAMBAHKAN INI
  server: {
    host: true,        // atau '0.0.0.0'
    port: 5173
  }
}))
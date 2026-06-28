import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'development' ? '/' : '/gunaso/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        redirect: resolve(__dirname, 'redirect.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
}))

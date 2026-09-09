import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/polki-crm/',
  plugins: [react()],
  server: {
    proxy: {
      '/cdek-api': {
        target: 'https://api.edu.cdek.ru/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cdek-api/, ''),
      },
    },
  },
})

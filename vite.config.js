import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/dropbox/reddit/",

  resolve: {
    alias: {
      'assets': '/src/assets',
      'RedditArchiver': '/src/RedditArchiver',
    },
  },
})

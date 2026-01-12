import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // ✅ base يُستخدم فقط عند build (GitHub Pages)
  // ✅ لا يؤثر على dev نهائيًا
  base: command === 'build'
    ? '/-Enterprise-Intelligent-Perception/'
    : '/',

  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
}))

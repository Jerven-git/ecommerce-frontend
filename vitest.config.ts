import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

const appDirectory = fileURLToPath(new URL('./app', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  define: {
    'import.meta.client': 'true',
    'import.meta.server': 'false',
  },
  resolve: {
    alias: {
      '~': appDirectory,
      '@': appDirectory,
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.spec.ts'],
    clearMocks: true,
    restoreMocks: true,
  },
})

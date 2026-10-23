import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

const appDirectory = fileURLToPath(new URL('./app', import.meta.url))

export default defineConfig({
  tsconfig: './tsconfig.vitest.json',
  // @vitejs/plugin-vue forwards the transform-level tsconfig through Oxc.
  // Vite's public type currently omits this field even though its transformer
  // accepts it, so keep the cast local to the test runner configuration.
  oxc: { tsconfig: './tsconfig.vitest.json' } as any,
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

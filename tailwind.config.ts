import type { Config } from 'tailwindcss'

export default {
  theme: {
    extend: {
      colors: {
        blue: {
          50: 'var(--color-primary-50, #eef4fd)',
          100: 'var(--color-primary-100, #d9e6fb)',
          200: 'var(--color-primary-200, #b8d0f7)',
          300: 'var(--color-primary-300, #8eb4f0)',
          400: 'var(--color-primary-400, #7ba6ee)',
          500: 'var(--color-primary-500, #70a0ed)',
          600: 'var(--color-primary, #6898ED)',
          700: 'var(--color-primary-700, #4f7dd4)',
          800: 'var(--color-primary-800, #3f64ab)',
          900: 'var(--color-primary-900, #36538a)',
          950: 'var(--color-primary-950, #253660)',
        },
      },
      fontFamily: {
        heading: 'var(--font-heading, "Inter", sans-serif)',
        body: 'var(--font-body, "Inter", sans-serif)',
      },
    },
  },
} satisfies Config

export type AdminAppearance = 'dark' | 'light'

const STORAGE_KEY = 'ssu:admin-theme'
const LEGACY_STORAGE_KEY = 'ssu:super-admin-theme'

export const useAdminAppearance = (options: { syncBody?: boolean } = {}) => {
  const theme = useState<AdminAppearance>('admin-appearance', () => 'dark')
  const themeClass = computed(() => `admin-theme-${theme.value}`)
  const themeToggleLabel = computed(() => `Switch to ${theme.value === 'dark' ? 'light' : 'dark'} mode`)

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  if (options.syncBody) {
    useHead({
      bodyAttrs: {
        class: 'admin-active',
      },
    })

    const applyBodyTheme = (value: AdminAppearance) => {
      document.body.classList.toggle('admin-theme-dark', value === 'dark')
      document.body.classList.toggle('admin-theme-light', value === 'light')
    }

    onMounted(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY)
          ?? window.localStorage.getItem(LEGACY_STORAGE_KEY)
        if (saved === 'dark' || saved === 'light') {
          theme.value = saved
        }
      } catch {
        // Storage can be unavailable in private browsing; dark remains default.
      }
      applyBodyTheme(theme.value)
    })

    watch(theme, (value) => {
      applyBodyTheme(value)
      try {
        window.localStorage.setItem(STORAGE_KEY, value)
      } catch {
        // The current session still changes appearance without persistence.
      }
    })

    onBeforeUnmount(() => {
      document.body.classList.remove('admin-theme-dark', 'admin-theme-light')
    })
  }

  return {
    theme: readonly(theme),
    themeClass,
    themeToggleLabel,
    toggleTheme,
  }
}

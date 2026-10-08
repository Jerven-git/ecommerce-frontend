<template>
  <ApexAuthShell>
    <div class="apex-auth__form-heading">
      <h2>Welcome back.</h2>
      <p>Sign in to your DATABASY workspace to manage your store.</p>
    </div>

    <form class="apex-auth__form" :aria-busy="loading" @focusin="warmLoginDestinations" @submit.prevent="handleLogin">
      <div class="apex-auth__field">
        <label for="login-email" class="apex-auth__label">Email address</label>
        <input id="login-email" v-model="form.email" type="email" autocomplete="email" required class="apex-auth__input" placeholder="you@example.com" :disabled="loading">
      </div>

      <div class="apex-auth__field">
        <div class="apex-auth__field-head">
          <label for="login-password" class="apex-auth__label">Password</label>
          <NuxtLink to="/admin/forgot-password" class="apex-auth__link">Forgot password?</NuxtLink>
        </div>
        <div class="apex-auth__input-wrap">
          <input id="login-password" v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required class="apex-auth__input apex-auth__input--password" placeholder="Enter your password" :disabled="loading">
          <button type="button" class="apex-auth__toggle" :disabled="loading" :aria-label="showPassword ? 'Hide password' : 'Show password'" :aria-pressed="showPassword" @click="showPassword = !showPassword">
            <Icon :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" aria-hidden="true" />
          </button>
        </div>
      </div>

      <p v-if="error" class="apex-auth__alert" role="alert"><Icon name="heroicons:exclamation-circle" aria-hidden="true" />{{ error }}</p>

      <button type="submit" class="apex-auth__button" :class="{ 'is-loading': loading }" :disabled="loading" @pointerenter="warmLoginDestinations" @focus="warmLoginDestinations" @touchstart.passive="warmLoginDestinations">
        <Icon v-if="loading" name="heroicons:arrow-path" class="apex-auth__button-spinner" aria-hidden="true" />
        <span aria-live="polite">{{ loading ? 'Signing you in…' : 'Sign in' }}</span>
        <Icon v-if="!loading" name="heroicons:arrow-right" aria-hidden="true" />
        <span v-if="loading" class="apex-auth__button-progress" aria-hidden="true" />
      </button>
    </form>

    <p class="apex-auth__secondary">No store yet? <NuxtLink to="/register" class="apex-auth__link">Create your store</NuxtLink></p>
  </ApexAuthShell>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const authStore = useAuthStore()
const authTransition = useAuthTransition()
const route = useRoute()

// Optional ?redirect= destination (fallback to admin dashboard). Only allow
// same-origin paths to keep it from becoming an open redirect.
const getRedirect = () => {
  const candidate = route.query.redirect
  return typeof candidate === 'string' && candidate.startsWith('/') ? candidate : '/admin'
}

const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const routePreloads = new Map<string, Promise<void>>()
let optimisticPreloadTimer: ReturnType<typeof setTimeout> | undefined

const warmRoute = (path: string) => {
  if (!import.meta.client) return Promise.resolve()
  const existing = routePreloads.get(path)
  if (existing) return existing

  const request = preloadRouteComponents(path).catch(() => {
    routePreloads.delete(path)
  })
  routePreloads.set(path, request)
  return request
}

const warmLoginDestinations = () => Promise.all([
  warmRoute('/admin/verify-2fa'),
  warmRoute(getRedirect()),
])

const finishTransitionAfterRender = async () => {
  await nextTick()
  if (import.meta.client) await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  authTransition.finish()
}

const handleLogin = async () => {
  if (loading.value) return

  loading.value = true
  error.value = ''
  const transitionStartedAt = Date.now()
  authTransition.start('authenticating', form.value.email)

  try {
    const [response] = await Promise.all([
      authStore.login(form.value.email, form.value.password),
      warmLoginDestinations(),
    ])

    if (response.two_factor_required) {
      authTransition.setPhase('verification')
      const remainingDisplayTime = Math.max(0, 480 - (Date.now() - transitionStartedAt))
      if (remainingDisplayTime) await new Promise(resolve => setTimeout(resolve, remainingDisplayTime))
      await navigateTo({ path: '/admin/verify-2fa', query: { redirect: getRedirect() } })
      await finishTransitionAfterRender()
      return
    }

    authTransition.setPhase('preparing')
    const remainingDisplayTime = Math.max(0, 480 - (Date.now() - transitionStartedAt))
    if (remainingDisplayTime) await new Promise(resolve => setTimeout(resolve, remainingDisplayTime))
    await navigateTo(getRedirect())
    await finishTransitionAfterRender()
  } catch (err: any) {
    authTransition.finish()
    error.value = err?.data?.message || 'Invalid credentials or not authorized as admin'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await authStore.checkAuth()
  if (authStore.isAdmin) {
    navigateTo(getRedirect())
    return
  }
  optimisticPreloadTimer = setTimeout(() => { void warmLoginDestinations() }, 600)
})

onBeforeUnmount(() => clearTimeout(optimisticPreloadTimer))
</script>

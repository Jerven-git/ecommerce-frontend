<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Background decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-md w-full relative z-10">
      <!-- Card -->
      <div class="bg-white/[0.07] backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 sm:p-10 transition-all duration-300">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 mb-5 ring-1 ring-blue-400/30">
            <Icon name="mdi:shield-lock-outline" class="w-8 h-8 text-blue-400" />
          </div>
          <h2 class="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
          <p class="mt-2 text-sm text-slate-400">Sign in to access the admin dashboard</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email field -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Icon name="mdi:email-outline" class="w-5 h-5 text-slate-500" />
              </div>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full pl-11 pr-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                placeholder="admin@example.com"
                autocomplete="email"
              />
            </div>
          </div>

          <!-- Password field -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Icon name="mdi:lock-outline" class="w-5 h-5 text-slate-500" />
              </div>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full pl-11 pr-12 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                placeholder="Enter your password"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                @click="showPassword = !showPassword"
              >
                <Icon :name="showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Error message -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="error" class="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl">
              <Icon name="mdi:alert-circle-outline" class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-red-300">{{ error }}</p>
            </div>
          </Transition>

          <!-- Submit button -->
          <button
            type="submit"
            class="w-full relative flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
            :disabled="loading"
          >
            <svg
              v-if="loading"
              class="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="mt-8 pt-6 border-t border-white/[0.06] text-center">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors duration-200"
          >
            <Icon name="mdi:arrow-left" class="w-4 h-4" />
            Back to Store
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    await authStore.login(form.value.email, form.value.password)
    navigateTo('/admin')
  } catch (err: any) {
    error.value = err.message || 'Invalid credentials or not authorized as admin'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await authStore.checkAuth()
  if (authStore.isAdmin) {
    navigateTo('/admin')
  }
})
</script>

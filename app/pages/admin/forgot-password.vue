<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3a4661] via-[#4B5979] to-[#3a4661] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Background decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-[#6898ED]/15 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-[#6898ED]/10 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6898ED]/5 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-md w-full relative z-10">
      <div class="bg-white/[0.08] backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 sm:p-10 transition-all duration-300">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#6898ED]/20 mb-5 ring-1 ring-[#6898ED]/30">
            <Icon name="mdi:lock-reset" class="w-8 h-8 text-[#6898ED]" />
          </div>
          <h2 class="text-2xl font-bold text-white tracking-tight">Forgot password?</h2>
          <p class="mt-2 text-sm text-white/50">Enter your email and we'll send you a reset link</p>
        </div>

        <!-- Success message -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div v-if="sent" class="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-5">
            <Icon name="mdi:check-circle-outline" class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-green-300">{{ message }}</p>
          </div>
        </Transition>

        <!-- Form -->
        <form v-if="!sent" @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-white/70 mb-1.5">Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Icon name="mdi:email-outline" class="w-5 h-5 text-white/30" />
              </div>
              <input
                v-model="email"
                type="email"
                required
                class="w-full pl-11 pr-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#6898ED]/50 focus:border-[#6898ED]/50 transition-all duration-200"
                placeholder="admin@example.com"
                autocomplete="email"
              />
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

          <button
            type="submit"
            class="w-full relative flex items-center justify-center gap-2 bg-[#6898ED] hover:bg-[#7aa4f0] text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#6898ED] shadow-lg shadow-[#6898ED]/25 hover:shadow-[#6898ED]/40"
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
            <span>{{ loading ? 'Sending...' : 'Send Reset Link' }}</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="mt-8 pt-6 border-t border-white/[0.08] text-center">
          <NuxtLink
            to="/admin/login"
            class="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors duration-200"
          >
            <Icon name="mdi:arrow-left" class="w-4 h-4" />
            Back to Sign In
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

const { $apiFetch } = useNuxtApp()

const email = ref('')
const loading = ref(false)
const error = ref('')
const sent = ref(false)
const message = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await $apiFetch<{ message: string }>('/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    })
    message.value = res.message || 'If your email is in our system, you will receive a reset link.'
    sent.value = true
  } catch (err: any) {
    error.value = err?.data?.message || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

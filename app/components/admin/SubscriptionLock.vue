<template>
  <div class="subscription-lock min-h-screen flex items-center justify-center bg-admin-canvas px-4 py-12">
    <div class="w-full max-w-md">
      <div
        class="bg-admin-surface rounded-2xl shadow-xl border border-admin-border p-8 sm:p-10 text-center"
        :class="mounted ? 'animate-card-enter' : 'opacity-0 translate-y-6'"
      >
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-admin-warning-soft ring-1 ring-admin-warning/30 mb-5 animate-lock-pulse"
        >
          <svg class="w-8 h-8 text-admin-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h2 class="text-xl font-bold text-admin-text">Your store is on hold</h2>
        <p class="mt-3 text-sm text-admin-muted leading-relaxed">
          Your subscription has lapsed or hasn't started yet, so the admin panel is currently locked.
          Subscribe to reactivate your store and start selling right away.
        </p>

        <div class="mt-7 space-y-3" :class="mounted ? 'animate-stagger-1' : 'opacity-0 translate-y-4'">
          <button
            class="w-full bg-admin-accent hover:opacity-90 active:scale-[0.97] text-admin-on-accent font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-admin-accent/25"
            :disabled="subscribing"
            @click="handleSubscribe"
          >
            <span v-if="subscribing">Opening plans…</span>
            <span v-else>Subscribe to activate</span>
          </button>
          <button
            class="w-full text-sm text-admin-muted hover:text-admin-text transition-colors py-1"
            @click="handleLogout"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const subscription = useSubscription()

const mounted = ref(false)
const subscribing = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    mounted.value = true
  })

  // Refresh authoritative status in the background so the lock reflects
  // reality (e.g. a short grace-period edge the cached user payload missed).
  subscription.fetchState(true).catch(() => {})
})

const handleSubscribe = async () => {
  subscribing.value = true
  try {
    await authStore.checkAuth()
    navigateTo('/subscribe')
  } finally {
    subscribing.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
  navigateTo('/')
}
</script>

<style scoped>
.animate-card-enter {
  animation: card-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes card-enter {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-stagger-1 { animation: stagger-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
@keyframes stagger-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-lock-pulse {
  animation: lock-pulse 2.6s ease-in-out infinite;
}
@keyframes lock-pulse {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--admin-warning, #d97706) 0%, transparent); }
  50% { box-shadow: 0 0 24px 4px color-mix(in srgb, var(--admin-warning, #d97706) 22%, transparent); }
}
</style>
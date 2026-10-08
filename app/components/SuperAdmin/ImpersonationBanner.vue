<template>
  <div
    v-if="active"
    class="flex flex-col gap-2.5 border-b border-admin-warning bg-admin-warning-soft px-3 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-4"
  >
    <div class="flex items-center gap-3 text-admin-warning">
      <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <span>
        You are impersonating
        <span class="font-semibold">{{ targetEmail }}</span>
        as
        <span class="font-semibold">{{ impersonatorEmail }}</span>
      </span>
    </div>
    <button
      type="button"
      class="inline-flex min-h-10 items-center justify-center rounded-lg border border-admin-warning bg-admin-surface px-2.5 py-1.5 text-[11px] font-medium text-admin-warning hover:bg-admin-warning-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-warning"
      :disabled="impersonation.loading"
      @pointerenter="warmSuperAdminRoute"
      @focus="warmSuperAdminRoute"
      @touchstart.passive="warmSuperAdminRoute"
      @click="leave"
    >
      {{ impersonation.loading ? 'Leaving…' : 'Leave impersonation' }}
    </button>
  </div>
</template>

<script setup lang="ts">
const impersonation = useImpersonationStore()
const auth = useAuthStore()
const router = useRouter()
const { toastError } = useAdminToast()
let superAdminRoutePreload: Promise<void> | null = null

// Impersonation can be detected two ways: the pinia store (set when the
// super admin initiated impersonation in this session) or the auth store
// (server-confirmed via /user, survives page reloads). Either is enough.
const active = computed(() => impersonation.isImpersonating || auth.isImpersonating)

const targetEmail = computed(() => impersonation.target?.email ?? auth.user?.email ?? '—')
const impersonatorEmail = computed(
  () => impersonation.impersonator?.email ?? auth.user?.impersonator?.email ?? 'super admin'
)

const warmSuperAdminRoute = () => {
  if (!import.meta.client) return Promise.resolve()
  if (!superAdminRoutePreload) {
    superAdminRoutePreload = preloadRouteComponents('/super-admin').catch(() => {
      superAdminRoutePreload = null
    })
  }
  return superAdminRoutePreload
}

const leave = async () => {
  if (impersonation.transitioning) return

  try {
    const transitionStartedAt = Date.now()
    const leaveRequest = impersonation.leave()
    const preloadRequest = warmSuperAdminRoute()

    await Promise.all([leaveRequest, preloadRequest])
    const remainingDisplayTime = Math.max(0, 480 - (Date.now() - transitionStartedAt))
    if (remainingDisplayTime) {
      await new Promise(resolve => setTimeout(resolve, remainingDisplayTime))
    }
    await router.push('/super-admin')
    await nextTick()

    if (import.meta.client) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    }
    impersonation.finishTransition()
  } catch (err: any) {
    impersonation.finishTransition()
    toastError(err?.data?.message || 'Impersonation could not be ended. Try again.')
  }
}
</script>

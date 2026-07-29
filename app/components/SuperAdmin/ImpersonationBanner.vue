<template>
  <div
    v-if="active"
    class="flex flex-col gap-3 border-b border-admin-warning bg-admin-warning-soft px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6"
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
      class="inline-flex min-h-11 items-center justify-center rounded-lg border border-admin-warning bg-admin-surface px-3 py-2 text-xs font-medium text-admin-warning hover:bg-admin-warning-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-warning"
      :disabled="impersonation.loading"
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

// Impersonation can be detected two ways: the pinia store (set when the
// super admin initiated impersonation in this session) or the auth store
// (server-confirmed via /user, survives page reloads). Either is enough.
const active = computed(() => impersonation.isImpersonating || auth.isImpersonating)

const targetEmail = computed(() => impersonation.target?.email ?? auth.user?.email ?? '—')
const impersonatorEmail = computed(
  () => impersonation.impersonator?.email ?? auth.user?.impersonator?.email ?? 'super admin'
)

const leave = async () => {
  try {
    await impersonation.leave()
    router.push('/super-admin')
  } catch (err) {
    // Error already captured into impersonation.error.
  }
}
</script>

<template>
  <div
    v-if="active"
    class="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between gap-4 text-sm"
  >
    <div class="flex items-center gap-3 text-amber-900">
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
      class="px-3 py-1.5 text-xs font-medium text-amber-900 bg-white border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
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

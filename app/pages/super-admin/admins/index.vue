<template>
  <div class="space-y-6">
    <header class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Admin users</h1>
        <p class="text-sm text-gray-500 mt-1">Manage who can access the admin panel and which store they belong to.</p>
      </div>
      <AdminButton to="/super-admin/admins/new" variant="primary" class="shrink-0">
        <template #icon>
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
          </svg>
        </template>
        New admin
      </AdminButton>
    </header>

    <section class="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
            <th class="px-6 py-3">Name</th>
            <th class="px-6 py-3">Email</th>
            <th class="px-6 py-3">Role</th>
            <th class="px-6 py-3">Store</th>
            <th class="px-6 py-3">Status</th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading">
            <td colspan="6" class="px-6 py-8 text-center text-gray-400">Loading…</td>
          </tr>
          <tr v-else-if="admins.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-gray-400">No admins yet.</td>
          </tr>
          <tr v-for="a in admins" :key="a.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">{{ a.name }}</td>
            <td class="px-6 py-4 text-gray-600">{{ a.email }}</td>
            <td class="px-6 py-4">
              <span
                class="px-2 py-0.5 text-xs font-medium rounded"
                :class="a.is_super_admin ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'"
              >
                {{ a.is_super_admin ? 'super admin' : 'admin' }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-500">{{ a.store?.name ?? '—' }}</td>
            <td class="px-6 py-4">
              <span
                class="px-2 py-0.5 text-xs font-medium rounded"
                :class="a.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'"
              >
                {{ a.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center gap-1 justify-end">
                <button
                  v-if="!a.is_super_admin && a.status === 'active'"
                  type="button"
                  class="p-1.5 rounded-lg text-gray-400 transition-colors hover:text-amber-700 hover:bg-amber-50 disabled:opacity-50 disabled:pointer-events-none"
                  :disabled="impersonation.loading"
                  title="Impersonate"
                  aria-label="Impersonate"
                  @click="startImpersonation(a.id)"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                  </svg>
                </button>
                <NuxtLink
                  :to="`/super-admin/admins/${a.id}`"
                  class="p-1.5 rounded-lg text-gray-400 transition-colors hover:text-purple-700 hover:bg-purple-50"
                  title="Edit"
                  aria-label="Edit admin"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </NuxtLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
const api = useSuperAdminApi()
const impersonation = useImpersonationStore()
const router = useRouter()

const admins = ref<AdminUser[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const result = await api.listAdmins()
    admins.value = result.data
  } finally {
    loading.value = false
  }
})

const startImpersonation = async (userId: number) => {
  try {
    await impersonation.start(userId)
    router.push('/admin')
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to start impersonation')
  }
}
</script>

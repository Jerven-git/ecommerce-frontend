<template>
  <div class="space-y-6">
    <header class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Admin users</h1>
        <p class="text-sm text-gray-500 mt-1">Manage who can access the admin panel and which store they belong to.</p>
      </div>
      <NuxtLink
        to="/super-admin/admins/new"
        class="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
      >
        New admin
      </NuxtLink>
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
              <div class="flex items-center gap-3 justify-end">
                <button
                  v-if="!a.is_super_admin && a.status === 'active'"
                  type="button"
                  class="text-xs text-amber-700 hover:underline"
                  :disabled="impersonation.loading"
                  @click="startImpersonation(a.id)"
                >
                  Impersonate
                </button>
                <NuxtLink :to="`/super-admin/admins/${a.id}`" class="text-purple-700 hover:underline text-sm">Edit</NuxtLink>
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

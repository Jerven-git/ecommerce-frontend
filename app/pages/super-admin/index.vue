<template>
  <div class="space-y-8">
    <header>
      <h1 class="text-2xl font-bold text-gray-900">Super admin dashboard</h1>
      <p class="text-sm text-gray-500 mt-1">Platform-level controls: stores, admin accounts, and activity audit.</p>
    </header>

    <div class="grid gap-4 md:grid-cols-3">
      <NuxtLink
        v-for="tile in tiles"
        :key="tile.path"
        :to="tile.path"
        class="bg-white border border-gray-100 rounded-2xl p-6 hover:border-purple-300 hover:shadow-sm transition-all"
      >
        <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-4">
          <span v-html="tile.icon" class="w-5 h-5 text-purple-700 inline-flex" />
        </div>
        <p class="text-sm font-semibold text-gray-900">{{ tile.label }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ tile.description }}</p>
      </NuxtLink>
    </div>

    <section class="bg-white border border-gray-100 rounded-2xl p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-semibold text-gray-900">Recent activity</h2>
        <NuxtLink to="/super-admin/activity" class="text-xs text-purple-700 hover:underline">View all →</NuxtLink>
      </div>

      <div v-if="loading" class="text-sm text-gray-400 py-8 text-center">Loading…</div>
      <div v-else-if="error" class="text-sm text-red-600">{{ error }}</div>
      <ul v-else-if="recent.length > 0" class="divide-y divide-gray-100">
        <li v-for="entry in recent" :key="entry.id" class="py-3 flex items-start gap-3">
          <span class="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-600 uppercase tracking-wide">
            {{ entry.log_name ?? 'event' }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-800 truncate">{{ entry.description }}</p>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ entry.causer?.email ?? 'system' }} · {{ formatDate(entry.created_at) }}
              <span v-if="entry.store"> · {{ entry.store.name }}</span>
            </p>
          </div>
        </li>
      </ul>
      <p v-else class="text-sm text-gray-400 py-6 text-center">No activity yet.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
const api = useSuperAdminApi()

const recent = ref<ActivityEntry[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const tiles = [
  { path: '/super-admin/stores', label: 'Stores', description: 'Create, deactivate, and rename platform stores.', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7l2-3h14l2 3M3 7v13h18V7M3 7h18"/></svg>' },
  { path: '/super-admin/admins', label: 'Admins', description: 'Create, edit, disable, and impersonate admin accounts.', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4a4 4 0 110 8 4 4 0 010-8zm-7 16a7 7 0 1114 0H5z"/></svg>' },
  { path: '/super-admin/activity', label: 'Activity log', description: 'Audit log across all stores. Filter by causer, event, date.', icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5h6m-6 4h6m-6 4h6M4 4h.01M4 8h.01M4 12h.01M4 16h.01"/></svg>' },
]

const formatDate = (iso: string) => new Date(iso).toLocaleString()

onMounted(async () => {
  try {
    const result = await api.listActivity({ per_page: 10 })
    recent.value = result.data
  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to load activity'
  } finally {
    loading.value = false
  }
})
</script>

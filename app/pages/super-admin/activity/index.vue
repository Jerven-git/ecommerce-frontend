<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-gray-900">Activity log</h1>
      <p class="text-sm text-gray-500 mt-1">Audit trail for every store, admin action, and authentication event.</p>
    </header>

    <section class="bg-white border border-gray-100 rounded-2xl p-4">
      <div class="grid gap-3 md:grid-cols-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Store</label>
          <select v-model.number="filters.store_id" class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white">
            <option :value="undefined">All stores</option>
            <option v-for="s in stores" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Log</label>
          <input v-model="filters.log_name" type="text" placeholder="auth, store, user…" class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">From</label>
          <input v-model="filters.from" type="date" class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">To</label>
          <input v-model="filters.to" type="date" class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white" />
        </div>
      </div>
      <div class="flex justify-end mt-3">
        <button type="button" class="px-4 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700" @click="refresh">
          Apply filters
        </button>
      </div>
    </section>

    <section class="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
            <th class="px-6 py-3">When</th>
            <th class="px-6 py-3">Log</th>
            <th class="px-6 py-3">Description</th>
            <th class="px-6 py-3">Causer</th>
            <th class="px-6 py-3">Store</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading">
            <td colspan="5" class="px-6 py-8 text-center text-gray-400">Loading…</td>
          </tr>
          <tr v-else-if="entries.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-gray-400">No entries found.</td>
          </tr>
          <tr v-for="e in entries" :key="e.id" class="hover:bg-gray-50">
            <td class="px-6 py-3 text-xs text-gray-500 whitespace-nowrap">{{ formatDate(e.created_at) }}</td>
            <td class="px-6 py-3">
              <span class="px-2 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-600 uppercase tracking-wide">
                {{ e.log_name ?? '—' }}
              </span>
            </td>
            <td class="px-6 py-3 text-gray-800">{{ e.description }}</td>
            <td class="px-6 py-3 text-gray-500 text-xs">{{ e.causer?.email ?? '—' }}</td>
            <td class="px-6 py-3 text-gray-500 text-xs">{{ e.store?.name ?? '—' }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="pagination.last_page > 1" class="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
        <span class="text-gray-500">Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
        <div class="flex gap-2">
          <button :disabled="pagination.current_page <= 1" class="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40" @click="goTo(pagination.current_page - 1)">Prev</button>
          <button :disabled="pagination.current_page >= pagination.last_page" class="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40" @click="goTo(pagination.current_page + 1)">Next</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const api = useSuperAdminApi()

const entries = ref<ActivityEntry[]>([])
const stores = ref<Store[]>([])
const loading = ref(true)
const pagination = ref({ current_page: 1, last_page: 1, per_page: 25, total: 0 })

const filters = ref<{
  store_id?: number
  log_name?: string
  from?: string
  to?: string
  page?: number
}>({})

const formatDate = (iso: string) => new Date(iso).toLocaleString()

const refresh = async () => {
  loading.value = true
  try {
    const params: Record<string, string | number | undefined> = {
      page: filters.value.page ?? 1,
      per_page: 25,
      store_id: filters.value.store_id,
      log_name: filters.value.log_name?.trim() || undefined,
      from: filters.value.from || undefined,
      to: filters.value.to || undefined,
    }
    const result = await api.listActivity(params)
    entries.value = result.data
    pagination.value = {
      current_page: result.current_page,
      last_page: result.last_page,
      per_page: result.per_page,
      total: result.total,
    }
  } finally {
    loading.value = false
  }
}

const goTo = (page: number) => {
  filters.value.page = page
  refresh()
}

onMounted(async () => {
  const result = await api.listStores()
  stores.value = result.data
  await refresh()
})
</script>

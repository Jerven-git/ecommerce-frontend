<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-admin-text">Activity log</h1>
      <p class="mt-1 max-w-2xl text-sm text-admin-muted">Audit trail for every store, admin action, and authentication event.</p>
    </header>

    <section class="rounded-2xl border border-admin-border bg-admin-surface p-4 sm:p-5" aria-labelledby="filters-heading">
      <form @submit.prevent="refresh(1)">
        <h2 id="filters-heading" class="mb-4 text-sm font-semibold text-admin-text">Filter activity</h2>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SuperAdminStorePicker id="activity-store" v-model="filters.store_id" />
          <div>
            <label for="activity-log-name" class="mb-1.5 block text-sm font-medium text-admin-text">Log type</label>
            <input id="activity-log-name" v-model="filters.log_name" type="text" placeholder="auth, store, user…" class="admin-input" />
          </div>
          <div>
            <label for="activity-from" class="mb-1.5 block text-sm font-medium text-admin-text">From</label>
            <input id="activity-from" v-model="filters.from" type="date" class="admin-input" />
          </div>
          <div>
            <label for="activity-to" class="mb-1.5 block text-sm font-medium text-admin-text">To</label>
            <input id="activity-to" v-model="filters.to" type="date" class="admin-input" />
          </div>
        </div>
        <div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AdminButton type="button" variant="ghost" @click="clearFilters">Clear</AdminButton>
          <AdminButton type="submit" variant="primary" :loading="loading">Apply filters</AdminButton>
        </div>
      </form>
    </section>

    <section class="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface" aria-labelledby="activity-results-heading">
      <h2 id="activity-results-heading" class="sr-only">Activity results</h2>

      <div v-if="loading" class="px-6 py-12 text-center text-sm text-admin-muted" role="status" aria-live="polite">
        Loading activity…
      </div>
      <SuperAdminErrorState v-else-if="error" :message="error" @retry="refresh(pagination.current_page)" />
      <AdminEmptyState
        v-else-if="entries.length === 0"
        title="No activity found"
        description="Try widening the date range or clearing one of the filters."
      />

      <template v-else>
        <div class="hidden overflow-x-auto md:block">
          <table class="w-full min-w-[900px] text-sm">
            <caption class="sr-only">Activity matching the current filters</caption>
            <thead class="border-b border-admin-border bg-admin-soft">
              <tr class="text-left text-xs uppercase tracking-wide text-admin-muted">
                <th scope="col" class="px-6 py-3">When</th>
                <th scope="col" class="px-6 py-3">Log</th>
                <th scope="col" class="px-6 py-3">Description</th>
                <th scope="col" class="px-6 py-3">Causer</th>
                <th scope="col" class="px-6 py-3">Store</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-admin-border">
              <tr v-for="entry in entries" :key="entry.id" class="hover:bg-admin-soft">
                <td class="whitespace-nowrap px-6 py-3 text-xs text-admin-muted">{{ formatDate(entry.created_at) }}</td>
                <td class="px-6 py-3">
                  <span class="rounded bg-admin-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-admin-muted">
                    {{ entry.log_name ?? 'event' }}
                  </span>
                </td>
                <td class="max-w-md break-words px-6 py-3 text-admin-text">{{ entry.description }}</td>
                <td class="px-6 py-3 text-xs text-admin-muted">{{ entry.causer?.email ?? 'System' }}</td>
                <td class="px-6 py-3 text-xs text-admin-muted">{{ entry.store?.name ?? 'Platform' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ol class="divide-y divide-admin-border md:hidden">
          <li v-for="entry in entries" :key="entry.id" class="p-4">
            <div class="flex items-start justify-between gap-3">
              <span class="rounded bg-admin-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-admin-muted">
                {{ entry.log_name ?? 'event' }}
              </span>
              <time class="shrink-0 text-xs text-admin-muted" :datetime="entry.created_at">{{ formatDate(entry.created_at) }}</time>
            </div>
            <p class="mt-3 break-words text-sm text-admin-text">{{ entry.description }}</p>
            <p class="mt-2 text-xs text-admin-muted">
              {{ entry.causer?.email ?? 'System' }} · {{ entry.store?.name ?? 'Platform' }}
            </p>
          </li>
        </ol>
      </template>

      <SuperAdminPagination
        :current-page="pagination.current_page"
        :last-page="pagination.last_page"
        :total="pagination.total"
        :loading="loading"
        label="Activity pages"
        @change="refresh"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import type { ActivityEntry } from '~/composables/useSuperAdminApi'

const api = useSuperAdminApi()
const entries = ref<ActivityEntry[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const pagination = ref({ current_page: 1, last_page: 1, total: 0 })

const filters = ref<{
  store_id: number | null
  log_name: string
  from: string
  to: string
}>({
  store_id: null,
  log_name: '',
  from: '',
  to: '',
})

const formatDate = (iso: string) => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(iso))

const refresh = async (page = 1) => {
  loading.value = true
  error.value = null
  try {
    const result = await api.listActivity({
      page,
      per_page: 25,
      store_id: filters.value.store_id ?? undefined,
      log_name: filters.value.log_name.trim() || undefined,
      from: filters.value.from || undefined,
      to: filters.value.to || undefined,
    })
    entries.value = result.data
    pagination.value = {
      current_page: result.current_page,
      last_page: result.last_page,
      total: result.total,
    }
  } catch (err: any) {
    error.value = err?.data?.message || 'Activity could not be loaded. Check your connection and try again.'
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = { store_id: null, log_name: '', from: '', to: '' }
  refresh(1)
}

onMounted(() => refresh())
</script>

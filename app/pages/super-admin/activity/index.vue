<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div class="inline-flex items-center gap-2 text-xs font-medium text-admin-muted">
          <NuxtLink to="/super-admin" class="hover:text-admin-text">Dashboard</NuxtLink>
          <span class="text-admin-border">/</span>
          <span class="font-semibold text-admin-text">Activity log</span>
        </div>
        <h1 class="mt-2 text-[26px] font-bold tracking-tight text-admin-text">Activity log</h1>
        <p class="mt-1 max-w-2xl text-sm leading-relaxed text-admin-muted">Audit trail for every store, admin action, and authentication event. Filters are server-scoped by your role.</p>
      </div>
      <div class="flex items-center gap-2 text-xs">
        <span class="inline-flex items-center gap-1.5 rounded-full border border-admin-border bg-admin-surface px-3 py-2 font-medium text-admin-muted">
          <span class="h-2 w-2 rounded-full bg-admin-success animate-pulse" /> Live audit
        </span>
        <span class="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-admin-soft px-3 py-2 font-medium text-admin-muted">
          {{ pagination.total.toLocaleString() }} total events
        </span>
      </div>
    </header>

    <section class="rounded-2xl border border-admin-border bg-admin-surface p-4 sm:p-5 shadow-sm" aria-labelledby="filters-heading">
      <div class="flex items-center gap-2.5">
        <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-admin-accent-soft text-admin-accent">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9M3 16h13M15 14l4 4m0 0l-4 4m4-4H9" /></svg>
        </span>
        <h2 id="filters-heading" class="text-sm font-semibold text-admin-text">Filter activity</h2>
        <span class="ml-auto hidden sm:inline text-xs text-admin-muted">All filters are optional — apply to narrow</span>
      </div>
      <form class="mt-4" @submit.prevent="refresh(1)">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SuperAdminStorePicker id="activity-store" v-model="filters.store_id" />
          <div>
            <label for="activity-log-name" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-admin-muted">Log type</label>
            <div class="relative">
              <input id="activity-log-name" v-model="filters.log_name" type="text" placeholder="auth, store, user…" class="admin-input pl-9" />
              <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-admin-muted">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h10M7 12h10M7 17h5" /></svg>
              </span>
            </div>
          </div>
          <div>
            <label for="activity-from" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-admin-muted">From</label>
            <input id="activity-from" v-model="filters.from" type="date" class="admin-input" />
          </div>
          <div>
            <label for="activity-to" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-admin-muted">To</label>
            <input id="activity-to" v-model="filters.to" type="date" class="admin-input" />
          </div>
        </div>
        <div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" class="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-admin-border bg-admin-surface px-4 text-sm font-medium text-admin-text hover:bg-admin-soft" @click="clearFilters">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            Clear
          </button>
          <button type="submit" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-admin-accent px-5 text-sm font-semibold text-admin-on-accent hover:bg-admin-accent-strong disabled:opacity-50" :disabled="loading">
            <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9M3 16h13" /></svg>
            Apply filters
          </button>
        </div>
      </form>
    </section>

    <section class="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface shadow-sm" aria-labelledby="activity-results-heading">
      <div class="flex items-center justify-between gap-3 border-b border-admin-border bg-admin-soft/40 px-5 py-3">
        <h2 id="activity-results-heading" class="text-sm font-semibold text-admin-text">Results</h2>
        <span class="text-xs text-admin-muted">{{ entries.length }} on this page · page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
      </div>

      <div v-if="loading" class="px-6 py-12 text-center">
        <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-admin-border border-t-admin-accent" />
        <p class="mt-3 text-sm font-medium text-admin-muted" role="status" aria-live="polite">Loading activity…</p>
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
            <thead class="border-b border-admin-border bg-admin-soft/60">
              <tr class="text-left text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                <th scope="col" class="px-6 py-3">When</th>
                <th scope="col" class="px-6 py-3">Log</th>
                <th scope="col" class="px-6 py-3">Description</th>
                <th scope="col" class="px-6 py-3">Causer</th>
                <th scope="col" class="px-6 py-3">Store</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-admin-border">
              <tr v-for="entry in entries" :key="entry.id" class="hover:bg-admin-soft/60 transition-colors">
                <td class="whitespace-nowrap px-6 py-3">
                  <span class="inline-flex items-center gap-1.5 text-xs text-admin-muted">
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {{ formatDate(entry.created_at) }}
                  </span>
                </td>
                <td class="px-6 py-3">
                  <span class="inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide" :class="logChip(entry.log_name)">{{ entry.log_name ?? 'event' }}</span>
                </td>
                <td class="max-w-md break-words px-6 py-3 text-admin-text">{{ entry.description }}</td>
                <td class="px-6 py-3">
                  <span class="inline-flex items-center gap-1.5 text-xs text-admin-muted">
                    <span class="flex h-6 w-6 items-center justify-center rounded-full bg-admin-soft text-[10px] font-bold">{{ initials(entry.causer?.email) }}</span>
                    {{ entry.causer?.email ?? 'System' }}
                  </span>
                </td>
                <td class="px-6 py-3">
                  <span v-if="entry.store" class="inline-flex items-center gap-1.5 rounded-full bg-admin-soft px-2 py-1 text-xs font-medium text-admin-text">
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" /></svg>
                    {{ entry.store.name }}
                  </span>
                  <span v-else class="text-xs text-admin-muted">Platform</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ol class="divide-y divide-admin-border md:hidden">
          <li v-for="entry in entries" :key="entry.id" class="p-4">
            <div class="flex items-start justify-between gap-3">
              <span class="rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide" :class="logChip(entry.log_name)">{{ entry.log_name ?? 'event' }}</span>
              <time class="shrink-0 text-xs text-admin-muted" :datetime="entry.created_at">{{ formatDate(entry.created_at) }}</time>
            </div>
            <p class="mt-3 break-words text-sm leading-relaxed text-admin-text">{{ entry.description }}</p>
            <p class="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-admin-muted">
              <span class="inline-flex items-center gap-1"><span class="flex h-5 w-5 items-center justify-center rounded-full bg-admin-soft text-[10px] font-bold">{{ initials(entry.causer?.email) }}</span>{{ entry.causer?.email ?? 'System' }}</span>
              <span class="h-1 w-1 rounded-full bg-admin-border" />
              <span>{{ entry.store?.name ?? 'Platform' }}</span>
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

const filters = ref<{ store_id: number | null; log_name: string; from: string; to: string }>({
  store_id: null, log_name: '', from: '', to: '',
})

const formatDate = (iso: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
const initials = (email?: string | null) => (email?.[0] ?? 'S').toUpperCase()

const logChip = (name: string | null) => {
  const n = (name ?? '').toLowerCase()
  if (/(delete|remove|deactivate|disable)/.test(n)) return 'bg-admin-danger-soft text-admin-danger border-admin-danger/15'
  if (/(create|store|register)/.test(n)) return 'bg-admin-success-soft text-admin-success border-admin-success/15'
  if (/(login|auth|impersonat|session)/.test(n)) return 'bg-admin-info-soft text-admin-info border-admin-info/15'
  return 'bg-admin-accent-soft text-admin-accent border-admin-accent/15'
}

const refresh = async (page = 1) => {
  loading.value = true
  error.value = null
  try {
    const result = await api.listActivity({
      page, per_page: 25,
      store_id: filters.value.store_id ?? undefined,
      log_name: filters.value.log_name.trim() || undefined,
      from: filters.value.from || undefined,
      to: filters.value.to || undefined,
    })
    entries.value = result.data
    pagination.value = { current_page: result.current_page, last_page: result.last_page, total: result.total }
  } catch (err: any) {
    error.value = err?.data?.message || 'Activity could not be loaded. Check your connection and try again.'
  } finally { loading.value = false }
}

const clearFilters = () => { filters.value = { store_id: null, log_name: '', from: '', to: '' }; refresh(1) }

onMounted(() => refresh())
</script>

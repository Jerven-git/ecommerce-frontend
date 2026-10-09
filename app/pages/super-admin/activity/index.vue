<template>
  <div class="space-y-4">
    <header class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div class="inline-flex items-center gap-2 text-xs font-medium text-admin-muted">
          <NuxtLink to="/super-admin" class="hover:text-admin-text">Dashboard</NuxtLink>
          <span class="text-admin-border">/</span>
          <span class="font-semibold text-admin-text">Activity log</span>
        </div>
        <h1 class="mt-1.5 text-[22px] font-bold tracking-tight text-admin-text">Activity log</h1>
        <p class="mt-1 max-w-2xl text-sm leading-relaxed text-admin-muted">See who signed in, signed out, or changed a store—without reading raw system messages.</p>
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

    <section class="rounded-xl border border-admin-border bg-admin-surface p-3 shadow-sm" aria-labelledby="filters-heading">
      <div class="flex items-center gap-2.5">
        <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-admin-accent-soft text-admin-accent">
          <Icon name="heroicons:clipboard-document-list" class="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h2 id="filters-heading" class="text-sm font-semibold text-admin-text">Narrow the audit trail</h2>
          <p class="text-xs text-admin-muted">Choose an event, store, or date range.</p>
        </div>
      </div>
      <form class="mt-3.5" @submit.prevent="refresh(1)">
        <fieldset>
          <legend class="mb-1.5 text-xs font-semibold uppercase tracking-wider text-admin-muted">Event type</legend>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="option in logFilterOptions"
              :key="option.value"
              type="button"
              class="inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent"
              :class="filters.log_name === option.value ? 'border-admin-accent bg-admin-accent text-admin-on-accent' : 'border-admin-border bg-admin-surface text-admin-muted hover:bg-admin-soft hover:text-admin-text'"
              :aria-pressed="filters.log_name === option.value"
              @click="filters.log_name = option.value"
            >
              <Icon :name="option.icon" class="h-4 w-4" aria-hidden="true" />
              {{ option.label }}
            </button>
          </div>
        </fieldset>

        <div class="mt-3.5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SuperAdminStorePicker id="activity-store" v-model="filters.store_id" compact allow-all class="md:col-span-2" />
          <div class="min-w-0">
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-admin-muted">From</label>
            <AdminDatePicker
              v-model="filters.from"
              ariaLabel="Activity start date"
              placeholder="Start date"
              :max="filters.to"
            />
          </div>
          <div class="min-w-0">
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-admin-muted">To</label>
            <AdminDatePicker
              v-model="filters.to"
              ariaLabel="Activity end date"
              placeholder="End date"
              :min="filters.from"
            />
          </div>
        </div>
        <div class="mt-3.5 flex flex-col-reverse gap-2 border-t border-admin-border pt-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p class="hidden text-xs text-admin-muted sm:block">Filters stay in place while you move between result pages.</p>
          <div class="flex flex-col-reverse gap-2 sm:flex-row">
            <button type="button" class="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold text-admin-muted hover:bg-admin-soft hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent" @click="clearFilters">
              <Icon name="heroicons:x-mark" class="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <button type="submit" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-admin-accent px-3 text-xs font-semibold text-admin-on-accent hover:bg-admin-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent disabled:opacity-50" :disabled="loading">
              <Icon :name="loading ? 'heroicons:arrow-path' : 'heroicons:magnifying-glass'" class="h-4 w-4" :class="loading ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" />
              Show results
            </button>
          </div>
        </div>
      </form>
    </section>

    <section class="overflow-hidden rounded-xl border border-admin-border bg-admin-surface" aria-labelledby="activity-results-heading">
      <div class="flex items-center justify-between gap-3 border-b border-admin-border px-3 py-2.5">
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
          <table class="w-full min-w-[760px] text-sm">
            <caption class="sr-only">Activity matching the current filters</caption>
            <thead class="border-b border-admin-border bg-admin-soft/35">
              <tr class="text-left text-xs font-semibold text-admin-text">
                <th scope="col" class="px-4 py-3">Event</th>
                <th scope="col" class="px-4 py-3">Actor</th>
                <th scope="col" class="px-4 py-3">Scope</th>
                <th scope="col" class="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-admin-border">
              <tr v-for="entry in entries" :key="entry.id" class="transition-colors hover:bg-admin-soft/45">
                <td class="max-w-md px-4 py-3">
                  <div class="flex items-center gap-3">
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" :class="logChip(entry)">
                      <Icon :name="eventIcon(entry)" class="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div class="min-w-0">
                      <p class="break-words font-semibold text-admin-text">{{ eventTitle(entry) }}</p>
                      <p class="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-admin-muted">{{ eventType(entry) }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-admin-soft text-[10px] font-bold text-admin-text">{{ initials(entry.causer?.email) }}</span>
                    <span class="max-w-[15rem] truncate text-xs font-medium text-admin-text" :title="entry.causer?.email ?? 'System'">{{ entry.causer?.email ?? 'System' }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span v-if="entry.store" class="inline-flex items-center gap-1.5 text-xs font-medium text-admin-text">
                    <Icon name="heroicons:building-storefront" class="h-3 w-3" aria-hidden="true" />
                    {{ entry.store.name }}
                  </span>
                  <span v-else class="text-xs text-admin-muted">Platform</span>
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <time class="inline-flex items-center gap-1.5 text-xs tabular-nums text-admin-muted" :datetime="entry.created_at">
                    <Icon name="heroicons:clock" class="h-3.5 w-3.5" aria-hidden="true" />
                    {{ formatDate(entry.created_at) }}
                  </time>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ol class="divide-y divide-admin-border md:hidden">
          <li v-for="entry in entries" :key="entry.id" class="p-3">
            <div class="flex items-start gap-3">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" :class="logChip(entry)">
                <Icon :name="eventIcon(entry)" class="h-4 w-4" aria-hidden="true" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="break-words text-sm font-semibold leading-relaxed text-admin-text">{{ eventTitle(entry) }}</p>
                <p class="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-admin-muted">{{ eventType(entry) }}</p>
              </div>
              <time class="shrink-0 text-xs tabular-nums text-admin-muted" :datetime="entry.created_at">{{ formatDate(entry.created_at) }}</time>
            </div>
            <p class="mt-3 flex flex-wrap items-center gap-1.5 pl-11 text-xs text-admin-muted">
              <span class="inline-flex min-w-0 items-center gap-1"><span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-admin-soft text-[10px] font-bold">{{ initials(entry.causer?.email) }}</span><span class="truncate">{{ entry.causer?.email ?? 'System' }}</span></span>
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
const route = useRoute()
const entries = ref<ActivityEntry[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const pagination = ref({ current_page: 1, last_page: 1, total: 0 })

const requestedStoreId = Number(Array.isArray(route.query.store_id) ? route.query.store_id[0] : route.query.store_id)
const filters = ref<{ store_id: number | null; log_name: string; from: string; to: string }>({
  store_id: Number.isInteger(requestedStoreId) && requestedStoreId > 0 ? requestedStoreId : null,
  log_name: '',
  from: '',
  to: '',
})

const formatDate = (iso: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
const initials = (email?: string | null) => (email?.[0] ?? 'S').toUpperCase()

const logFilterOptions = [
  { value: '', label: 'All activity', icon: 'heroicons:squares-2x2' },
  { value: 'auth', label: 'Authentication', icon: 'heroicons:arrow-right-end-on-rectangle' },
  { value: 'store', label: 'Store changes', icon: 'heroicons:building-storefront' },
  { value: 'user', label: 'Admin actions', icon: 'heroicons:user-circle' },
]

const normalizedDescription = (entry: ActivityEntry) => (entry.description ?? '').trim().toLowerCase()
const isSignOut = (entry: ActivityEntry) => /(logged out|signed out|log out|logout)/.test(normalizedDescription(entry))
const isSignIn = (entry: ActivityEntry) => !isSignOut(entry) && /(logged in|signed in|log in|login)/.test(normalizedDescription(entry))

const eventTitle = (entry: ActivityEntry) => {
  if (isSignOut(entry)) return 'Signed out'
  if (isSignIn(entry)) return 'Signed in'
  return entry.description?.trim() || 'Activity recorded'
}

const eventType = (entry: ActivityEntry) => {
  if (isSignOut(entry)) return 'Sign out'
  if (isSignIn(entry)) return 'Sign in'
  return entry.log_name || 'Event'
}

const eventIcon = (entry: ActivityEntry) => {
  if (isSignOut(entry)) return 'heroicons:arrow-left-start-on-rectangle'
  if (isSignIn(entry)) return 'heroicons:arrow-right-end-on-rectangle'
  const name = (entry.log_name ?? '').toLowerCase()
  if (/(delete|remove|deactivate|disable)/.test(name)) return 'heroicons:trash'
  if (/(create|store|register)/.test(name)) return 'heroicons:building-storefront'
  if (/(user|admin|impersonat)/.test(name)) return 'heroicons:user-circle'
  return 'heroicons:bolt'
}

const logChip = (entry: ActivityEntry) => {
  const n = `${entry.log_name ?? ''} ${entry.description ?? ''}`.toLowerCase()
  if (/(delete|remove|deactivate|disable)/.test(n)) return 'bg-admin-danger-soft text-admin-danger border-admin-danger/15'
  if (/(create|store|register)/.test(n)) return 'bg-admin-success-soft text-admin-success border-admin-success/15'
  if (/(login|logged in|logout|logged out|auth|impersonat|session)/.test(n)) return 'bg-admin-soft text-admin-text border-admin-border'
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

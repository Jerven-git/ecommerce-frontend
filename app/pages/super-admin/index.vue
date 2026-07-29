<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Super admin"
      subtitle="Platform-level controls — stores, admin accounts, and activity across every tenant."
    />

    <!-- KPI row — real derived metrics, nothing decorative -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(m, i) in metrics"
        :key="m.label"
        class="admin-rise rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-sm"
        :style="{ '--i': i }"
      >
        <div class="flex items-center justify-between mb-3">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-admin-muted">{{ m.label }}</p>
          <span
            class="w-8 h-8 rounded-lg flex items-center justify-center [&_svg]:w-4 [&_svg]:h-4"
            :class="chipClass(m.tone)"
            v-html="m.icon"
          />
        </div>
        <div class="h-8 flex items-end">
          <span v-if="statsLoading" class="skeleton block h-7 w-16"></span>
          <p v-else class="stat-value text-2xl font-bold tabular-nums text-admin-text">{{ m.value }}</p>
        </div>
        <p class="mt-1 truncate text-xs text-admin-muted">
          <span v-if="statsLoading" class="skeleton inline-block h-3 w-24 align-middle"></span>
          <span v-else>{{ m.sub }}</span>
        </p>
      </div>
    </div>
    <p v-if="statsError" role="alert" class="rounded-xl bg-admin-danger-soft px-4 py-3 text-sm text-admin-danger">
      {{ statsError }}
      <button type="button" class="ml-2 min-h-11 font-semibold underline" @click="loadOverview">Try again</button>
    </p>

    <!-- Organized body: activity (2/3) + newest stores (1/3) -->
    <div class="grid gap-6 lg:grid-cols-3 items-start">
      <!-- Recent activity -->
      <AdminCard class="admin-rise lg:col-span-2 overflow-hidden" :style="{ '--i': 4 }">
        <div class="flex items-center justify-between gap-3 border-b border-admin-border px-5 py-4">
          <h2 class="text-sm font-semibold text-admin-text">Recent activity</h2>
          <NuxtLink to="/super-admin/activity" class="min-h-11 shrink-0 content-center text-xs font-medium text-admin-accent hover:text-admin-accent-strong">View all →</NuxtLink>
        </div>

        <ul v-if="loading" class="divide-y divide-gray-100" aria-hidden="true">
          <li v-for="n in 5" :key="n" class="flex items-start gap-3 px-5 py-3">
            <span class="skeleton h-4 w-12 shrink-0 mt-0.5"></span>
            <div class="min-w-0 flex-1 space-y-2">
              <span class="skeleton block h-3.5" :style="{ width: skeletonWidth(n) }"></span>
              <span class="skeleton block h-3 w-2/5"></span>
            </div>
          </li>
        </ul>
        <SuperAdminErrorState v-else-if="activityError" :message="activityError" @retry="loadActivity" />
        <ul v-else-if="recent.length > 0" class="divide-y divide-admin-border">
          <li
            v-for="entry in recent"
            :key="entry.id"
            class="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-admin-soft"
          >
            <span
              class="mt-0.5 shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
              :class="eventChip(entry.log_name)"
            >
              {{ entry.log_name ?? 'event' }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm text-admin-text">{{ entry.description }}</p>
              <p class="mt-0.5 truncate text-xs text-admin-muted">
                {{ entry.causer?.email ?? 'system' }} · {{ timeLabel(entry.created_at) }}<span v-if="entry.store"> · {{ entry.store.name }}</span>
              </p>
            </div>
          </li>
        </ul>
        <AdminEmptyState
          v-else
          title="No activity yet"
          description="Platform events will appear here as they happen."
          :icon="icons.activity"
        />
      </AdminCard>

      <!-- Newest stores -->
      <AdminCard class="admin-rise overflow-hidden" :style="{ '--i': 5 }">
        <div class="flex items-center justify-between gap-3 border-b border-admin-border px-5 py-4">
          <h2 class="text-sm font-semibold text-admin-text">Newest stores</h2>
          <NuxtLink to="/super-admin/stores" class="min-h-11 shrink-0 content-center text-xs font-medium text-admin-accent hover:text-admin-accent-strong">All →</NuxtLink>
        </div>

        <ul v-if="statsLoading" class="divide-y divide-gray-100" aria-hidden="true">
          <li v-for="n in 4" :key="n" class="flex items-center justify-between gap-3 px-5 py-3">
            <div class="min-w-0 space-y-2">
              <span class="skeleton block h-3.5 w-28"></span>
              <span class="skeleton block h-3 w-20"></span>
            </div>
            <span class="skeleton h-5 w-16 rounded-full shrink-0"></span>
          </li>
        </ul>
        <ul v-else-if="newestStores.length > 0" class="divide-y divide-admin-border">
          <li v-for="store in newestStores" :key="store.id">
            <NuxtLink
              :to="`/super-admin/stores/${store.id}`"
              class="flex min-h-14 items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-admin-soft"
            >
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-admin-text">{{ store.name }}</p>
                <p class="truncate text-xs text-admin-muted">{{ store.domain || `${store.slug}.store` }}</p>
              </div>
              <span
                class="shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
                :class="store.status === 'active' ? 'bg-admin-success-soft text-admin-success' : 'bg-admin-soft text-admin-muted'"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="store.status === 'active' ? 'bg-admin-success' : 'bg-admin-muted'"></span>
                {{ store.status }}
              </span>
            </NuxtLink>
          </li>
        </ul>
        <AdminEmptyState v-else title="No stores yet" :icon="icons.store" />
      </AdminCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityEntry, SuperAdminOverview } from '~/composables/useSuperAdminApi'

const api = useSuperAdminApi()

const recent = ref<ActivityEntry[]>([])
const overview = ref<SuperAdminOverview | null>(null)

const loading = ref(true)
const statsLoading = ref(true)
const activityError = ref<string | null>(null)
const statsError = ref<string | null>(null)

const icons = {
  store: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7l2-3h14l2 3M3 7v13h18V7M3 7h18"/></svg>',
  globe: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 000 18M12 3a15 15 0 010 18"/></svg>',
  users: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
  shield: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
  activity: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5h6m-6 4h6m-6 4h6M4 4h.01M4 8h.01M4 12h.01M4 16h.01"/></svg>',
}

const fmt = (n: number) => n.toLocaleString()

const metrics = computed(() => {
  const data = overview.value
  return [
    { label: 'Stores', value: fmt(data?.stores.total ?? 0), sub: `${data?.stores.active ?? 0} active · ${data?.stores.inactive ?? 0} inactive`, icon: icons.store, tone: 'brand' },
    { label: 'Live domains', value: fmt(data?.stores.verified_domains ?? 0), sub: 'verified custom', icon: icons.globe, tone: 'positive' },
    { label: 'Users', value: fmt(data?.users.total ?? 0), sub: 'across all stores', icon: icons.users, tone: 'info' },
    { label: 'Admins', value: fmt(data?.admins.total ?? 0), sub: `${data?.admins.active ?? 0} active · ${data?.admins.super ?? 0} super`, icon: icons.shield, tone: 'attention' },
  ]
})

// Metric-specific tint so the row reads as four distinct facts, not four clones.
const chipClass = (tone: string) => ({
  brand: 'bg-admin-accent-soft text-admin-accent',
  positive: 'bg-admin-success-soft text-admin-success',
  info: 'bg-admin-info-soft text-admin-info',
  attention: 'bg-admin-warning-soft text-admin-warning',
}[tone] ?? 'bg-admin-soft text-admin-muted')

// Vary skeleton line widths so the placeholder reads as content, not a bar chart.
const skeletonWidth = (n: number) => ['82%', '64%', '73%', '58%', '69%'][(n - 1) % 5]

const newestStores = computed(() => overview.value?.newest_stores ?? [])

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

// Light event chips, coloured by intent.
const eventChip = (name: string | null) => {
  const n = (name ?? '').toLowerCase()
  if (/(delete|remove|deactivate|disable)/.test(n)) return 'bg-admin-danger-soft text-admin-danger'
  if (/(create|store|register)/.test(n)) return 'bg-admin-success-soft text-admin-success'
  if (/(login|auth|impersonat|session)/.test(n)) return 'bg-admin-info-soft text-admin-info'
  return 'bg-admin-accent-soft text-admin-accent'
}

const loadActivity = async () => {
  loading.value = true
  activityError.value = null
  try {
    recent.value = (await api.listActivity({ per_page: 10 })).data
  } catch (err: any) {
    activityError.value = err?.data?.message || 'Recent activity could not be loaded.'
  } finally {
    loading.value = false
  }
}

const loadOverview = async () => {
  statsLoading.value = true
  statsError.value = null
  try {
    overview.value = (await api.overview()).data
  } catch (err: any) {
    statsError.value = err?.data?.message || 'Platform totals could not be loaded.'
  } finally {
    statsLoading.value = false
  }
}

onMounted(() => Promise.allSettled([loadActivity(), loadOverview()]))
</script>

<style scoped>
/* Gentle "data arrived" cue as each metric replaces its skeleton. */
.stat-value {
  animation: stat-value-in 0.35s ease both;
}
@keyframes stat-value-in {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .stat-value {
    animation: none;
  }
}
</style>

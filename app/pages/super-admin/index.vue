<template>
  <div class="space-y-4" :aria-busy="dashboardLoading || undefined">
    <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ dashboardStatus }}
    </p>
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex min-w-0 items-center gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-admin-accent text-admin-on-accent" aria-hidden="true">
          <Icon name="heroicons:squares-2x2" class="h-4 w-4" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <h1 class="text-2xl font-bold tracking-tight text-admin-text">Platform overview</h1>
          <p class="mt-0.5 truncate text-xs text-admin-muted">Tenants, domains, operators and live activity</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <NuxtLink to="/super-admin/stores" class="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-admin-border bg-admin-surface px-2.5 text-[11px] font-semibold text-admin-text hover:bg-admin-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent">
          <Icon name="heroicons:building-storefront" class="h-4 w-4" aria-hidden="true" />
          Stores
        </NuxtLink>
        <NuxtLink to="/super-admin/admins/new" class="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-admin-accent px-2.5 text-[11px] font-semibold text-admin-on-accent hover:bg-admin-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent">
          <Icon name="heroicons:plus" class="h-4 w-4" aria-hidden="true" />
          New admin
        </NuxtLink>
      </div>
    </div>

    <!-- KPI row -->
    <div class="grid grid-cols-2 gap-2 xl:grid-cols-4">
      <div
        v-for="m in metrics"
        :key="m.label"
        class="group relative overflow-hidden rounded-xl border border-admin-border bg-admin-surface p-3 transition-colors hover:border-admin-accent/30"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-admin-muted">{{ m.label }}</p>
            <div class="mt-1 flex flex-wrap items-baseline gap-1.5">
              <span v-if="statsLoading" class="skeleton block h-6 w-12 rounded-md" aria-hidden="true" />
              <p v-else class="text-2xl font-bold leading-none tracking-tight text-admin-text tabular-nums">{{ m.value }}</p>
              <span v-if="!statsLoading && m.delta" class="rounded-full bg-admin-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-admin-success">{{ m.delta }}</span>
            </div>
            <p class="mt-1 truncate text-[11px] text-admin-muted">
              <span v-if="statsLoading" class="skeleton inline-block h-3 w-28 align-middle" />
              <span v-else>{{ m.sub }}</span>
            </p>
          </div>
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" :class="m.chip">
            <Icon :name="m.icon" class="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>

    <p v-if="statsError" role="alert" class="flex flex-wrap items-center gap-2 rounded-lg border border-admin-danger/20 bg-admin-danger-soft px-3 py-2.5 text-xs text-admin-danger">
      <Icon name="heroicons:exclamation-triangle" class="h-4 w-4 shrink-0" aria-hidden="true" />
      {{ statsError }}
      <button type="button" class="ml-auto inline-flex min-h-11 items-center rounded-lg border border-admin-danger/20 bg-admin-surface px-2.5 text-[11px] font-semibold hover:bg-admin-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-danger" @click="loadOverview">Try again</button>
    </p>

    <!-- Charts -->
    <div class="grid gap-3 lg:grid-cols-3">
      <!-- Store health -->
      <div class="rounded-xl border border-admin-border bg-admin-surface p-3 lg:col-span-1">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-[13px] font-semibold text-admin-text">Store health</h2>
            <p class="mt-0.5 text-[11px] text-admin-muted">Active vs inactive</p>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-admin-soft px-2 py-1 text-[10px] font-semibold text-admin-muted">
            <span class="h-2 w-2 rounded-full bg-admin-success" /> {{ overview?.stores.active ?? 0 }} active
          </span>
        </div>
        <div class="mt-2">
          <SuperAdminSaChart
            type="doughnut"
            :height="164"
            :loading="statsLoading"
            loading-label="Loading store totals…"
            :is-empty="!statsLoading && storeHealthEmpty"
            empty-title="No stores yet"
            empty-description="Create your first admin and provision a store to see health metrics."
            :data="storeHealthData"
            :options="doughnutOptions"
            aria-label="Store health by status"
          />
        </div>
        <div v-if="!statsLoading && !storeHealthEmpty" class="mt-2 grid grid-cols-2 gap-1.5">
          <div class="rounded-lg bg-admin-success-soft px-2.5 py-1.5">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-admin-success">Active</p>
            <p class="text-xs font-bold text-admin-text">{{ overview?.stores.active ?? 0 }} stores</p>
          </div>
          <div class="rounded-lg bg-admin-soft px-2.5 py-1.5">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-admin-muted">Inactive</p>
            <p class="text-xs font-bold text-admin-text">{{ overview?.stores.inactive ?? 0 }} stores</p>
          </div>
        </div>
      </div>

      <!-- Domain readiness -->
      <div class="rounded-xl border border-admin-border bg-admin-surface p-3 lg:col-span-1">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-[13px] font-semibold text-admin-text">Domain readiness</h2>
            <p class="mt-0.5 text-[11px] text-admin-muted">Custom domain state</p>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-admin-info-soft px-2 py-1 text-[10px] font-semibold text-admin-info">
            {{ overview?.stores.verified_domains ?? 0 }} verified
          </span>
        </div>
        <div class="mt-2">
          <SuperAdminSaChart
            type="doughnut"
            :height="164"
            :loading="statsLoading"
            loading-label="Loading domain totals…"
            :is-empty="!statsLoading && domainEmpty"
            empty-title="No custom domains yet"
            empty-description="Custom domains appear here once DNS is verified."
            :data="domainData"
            :options="doughnutOptions"
            aria-label="Domain verification status"
          />
        </div>
        <div v-if="!statsLoading && !domainEmpty" class="mt-2 grid grid-cols-3 gap-1.5">
          <div class="rounded-lg bg-admin-info-soft px-2 py-1.5 text-center">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-admin-info">Verified</p>
            <p class="text-xs font-bold text-admin-text">{{ overview?.stores.verified_domains ?? 0 }}</p>
          </div>
          <div class="rounded-lg bg-admin-warning-soft px-2 py-1.5 text-center">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-admin-warning">Pending</p>
            <p class="text-xs font-bold text-admin-text">{{ overview?.stores.unverified_domains ?? 0 }}</p>
          </div>
          <div class="rounded-lg bg-admin-soft px-2 py-1.5 text-center">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-admin-muted">None</p>
            <p class="text-xs font-bold text-admin-text">{{ overview?.stores.no_domain ?? 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Platform operators -->
      <div class="rounded-xl border border-admin-border bg-admin-surface p-3 lg:col-span-1">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-[13px] font-semibold text-admin-text">Operators</h2>
            <p class="mt-0.5 text-[11px] text-admin-muted">Access distribution</p>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-admin-soft px-2 py-1 text-[10px] font-semibold text-admin-muted">
            {{ overview?.admins.total ?? 0 }} admins
          </span>
        </div>
        <div class="mt-2">
          <SuperAdminSaChart
            type="doughnut"
            :height="164"
            :loading="statsLoading"
            loading-label="Loading operator totals…"
            :is-empty="!statsLoading && operatorsEmpty"
            empty-title="No admins yet"
            empty-description="Admin accounts will be grouped here by role."
            :data="operatorsData"
            :options="doughnutOptions"
            aria-label="Admins by role"
          />
        </div>
        <div v-if="!statsLoading && !operatorsEmpty" class="mt-2 grid grid-cols-3 gap-1.5">
          <div class="rounded-lg bg-admin-soft px-2 py-1.5">
            <p class="text-[10px] font-medium text-admin-muted">Active</p>
            <p class="text-xs font-bold text-admin-text">{{ overview?.admins.active ?? 0 }}</p>
          </div>
          <div class="rounded-lg bg-admin-accent-soft px-2 py-1.5">
            <p class="text-[10px] font-medium text-admin-accent">Super</p>
            <p class="text-xs font-bold text-admin-text">{{ overview?.admins.super ?? 0 }}</p>
          </div>
          <div class="rounded-lg bg-admin-soft px-2 py-1.5">
            <p class="text-[10px] font-medium text-admin-muted">Disabled</p>
            <p class="text-xs font-bold text-admin-text">{{ Math.max(0, (overview?.admins.total ?? 0) - (overview?.admins.active ?? 0)) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity insights -->
    <div class="grid gap-3 xl:grid-cols-5">
      <div class="rounded-xl border border-admin-border bg-admin-surface p-3 xl:col-span-3">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-[13px] font-semibold text-admin-text">Activity mix</h2>
            <p class="mt-0.5 text-[11px] text-admin-muted">Top types across the latest 50 events</p>
          </div>
          <NuxtLink to="/super-admin/activity" class="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold text-admin-muted hover:bg-admin-soft hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent">
            Activity
            <Icon name="heroicons:arrow-right" class="h-3.5 w-3.5" aria-hidden="true" />
          </NuxtLink>
        </div>
        <div class="mt-2">
          <SuperAdminSaChart
            type="bar"
            :height="184"
            :loading="activityLoading"
            loading-label="Loading activity…"
            :is-empty="!activityLoading && activityMixEmpty"
            empty-title="No activity in range"
            empty-description="Create or modify a store or admin to generate events."
            :data="activityMixData"
            :options="barOptions"
            aria-label="Activity count by log type"
          />
        </div>
      </div>

      <div class="rounded-xl border border-admin-border bg-admin-surface p-3 xl:col-span-2">
        <h2 class="text-[13px] font-semibold text-admin-text">Seven-day signal</h2>
        <p class="mt-0.5 text-[11px] text-admin-muted">Events per day</p>
        <div class="mt-2">
          <SuperAdminSaChart
            type="line"
            :height="184"
            :loading="activityLoading"
            loading-label="Loading activity…"
            :is-empty="!activityLoading && activitySeriesEmpty"
            empty-title="Not enough points"
            empty-description="We need at least one dated event. Widen the activity window or wait for writes."
            :data="activitySeriesData"
            :options="lineOptions"
            aria-label="Activity events per day"
          />
        </div>
        <div v-if="!activityLoading && !activitySeriesEmpty" class="mt-2 flex items-center gap-2 text-[11px] text-admin-muted">
          <span class="h-2 w-2 rounded-full bg-admin-accent" />
          {{ activitySeriesTotal }} events · last 7 days
        </div>
      </div>
    </div>

    <!-- Data coverage -->
    <details class="group rounded-xl border border-admin-border bg-admin-surface">
      <summary class="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3 text-[11px] font-semibold text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-admin-accent [&::-webkit-details-marker]:hidden">
        <span class="flex h-7 w-7 items-center justify-center rounded-md bg-admin-info-soft text-admin-info" aria-hidden="true">
          <Icon name="heroicons:information-circle" class="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        Data coverage and limits
        <span class="ml-auto hidden text-[10px] font-medium text-admin-muted sm:inline">Verified sources only</span>
        <Icon name="heroicons:chevron-down" class="h-4 w-4 text-admin-muted transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
      </summary>
      <div class="border-t border-admin-border px-3 py-2.5">
        <p class="text-[11px] text-admin-muted">Current charts use <span class="font-mono text-admin-text">/super-admin/overview</span> and role-scoped <span class="font-mono text-admin-text">GET /activity-log</span>.</p>
        <ul class="mt-2 grid gap-2 text-[11px] leading-relaxed text-admin-muted md:grid-cols-3">
          <li><span class="font-semibold text-admin-text">Revenue and MRR</span><br>No platform-wide endpoint; store analytics remain tenant-scoped.</li>
          <li><span class="font-semibold text-admin-text">Store growth</span><br>The overview exposes five newest stores, not a historical series.</li>
          <li><span class="font-semibold text-admin-text">Subscriptions</span><br>Status breakdown is available only on individual store records.</li>
        </ul>
      </div>
    </details>

    <!-- Bottom: timeline + newest stores -->
    <div class="grid items-start gap-3 lg:grid-cols-3">
      <!-- Recent activity timeline -->
      <div class="overflow-hidden rounded-xl border border-admin-border bg-admin-surface lg:col-span-2">
        <div class="flex items-center justify-between gap-3 border-b border-admin-border px-3 py-2.5">
          <div class="flex items-center gap-2.5">
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-admin-accent-soft text-admin-accent">
              <Icon name="heroicons:clock" class="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 class="text-[13px] font-semibold text-admin-text">Recent activity</h2>
              <p class="text-[11px] text-admin-muted">Newest first</p>
            </div>
          </div>
          <NuxtLink to="/super-admin/activity" class="inline-flex min-h-11 items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold text-admin-muted hover:bg-admin-soft hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent">
            View all
            <Icon name="heroicons:arrow-right" class="h-3.5 w-3.5" aria-hidden="true" />
          </NuxtLink>
        </div>

        <ul v-if="activityLoading" class="divide-y divide-admin-border" aria-hidden="true">
          <li v-for="n in 5" :key="n" class="flex gap-3 px-3 py-2.5">
            <span class="skeleton h-6 w-16 shrink-0 rounded-full mt-0.5" />
            <div class="min-w-0 flex-1 space-y-2">
              <span class="skeleton block h-3.5" :style="{ width: skeletonWidth(n) }" />
              <span class="skeleton block h-3 w-2/5" />
            </div>
          </li>
        </ul>
        <SuperAdminErrorState v-else-if="activityError" :message="activityError" @retry="loadActivity" />
        <div v-else-if="recent.length > 0">
          <div class="hidden grid-cols-12 gap-3 border-b border-admin-border bg-admin-soft/35 px-4 py-2.5 text-[11px] font-semibold text-admin-text sm:grid">
            <span class="col-span-6">Event</span>
            <span class="col-span-3">Actor</span>
            <span class="col-span-3 text-right">When</span>
          </div>
          <ul class="divide-y divide-admin-border">
            <li v-for="entry in recent" :key="entry.id" class="grid gap-2 px-3 py-2.5 transition-colors hover:bg-admin-soft/45 sm:grid-cols-12 sm:items-center sm:gap-3">
              <div class="flex min-w-0 items-center gap-2.5 sm:col-span-6">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" :class="eventChip(entry.log_name)">
                  <Icon :name="dashboardEventIcon(entry)" class="h-4 w-4" aria-hidden="true" />
                </span>
                <div class="min-w-0">
                  <p class="truncate text-[13px] font-semibold text-admin-text">{{ dashboardEventTitle(entry) }}</p>
                  <p class="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-wider text-admin-muted">{{ dashboardEventType(entry) }}<template v-if="entry.store"> · {{ entry.store.name }}</template></p>
                </div>
              </div>
              <div class="hidden min-w-0 items-center gap-2 sm:col-span-3 sm:flex">
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-admin-soft text-[9px] font-bold text-admin-text">{{ actorInitial(entry.causer?.email) }}</span>
                <span class="truncate text-[11px] text-admin-muted" :title="entry.causer?.email ?? 'System'">{{ entry.causer?.email ?? 'System' }}</span>
              </div>
              <time class="hidden text-right text-[11px] tabular-nums text-admin-muted sm:col-span-3 sm:block" :datetime="entry.created_at">{{ timeLabel(entry.created_at) }}</time>
              <p class="flex min-w-0 items-center gap-1.5 pl-10 text-[11px] text-admin-muted sm:hidden">
                <span class="truncate">{{ entry.causer?.email ?? 'System' }}</span>
                <span class="h-1 w-1 shrink-0 rounded-full bg-admin-border" aria-hidden="true" />
                <time class="shrink-0 tabular-nums" :datetime="entry.created_at">{{ timeLabel(entry.created_at) }}</time>
              </p>
            </li>
          </ul>
        </div>
        <div v-else class="px-5 py-8 text-center">
          <div class="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-admin-soft text-admin-muted">
            <Icon name="heroicons:list-bullet" class="h-4 w-4" aria-hidden="true" />
          </div>
          <p class="mt-2 text-[13px] font-semibold text-admin-text">No activity yet</p>
          <p class="mx-auto mt-1 max-w-md text-xs text-admin-muted">Events appear after a store or admin changes.</p>
        </div>
      </div>

      <!-- Newest stores -->
      <div class="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
        <div class="flex items-center justify-between gap-3 border-b border-admin-border px-3 py-2.5">
          <div>
            <h2 class="text-[13px] font-semibold text-admin-text">Newest stores</h2>
            <p class="text-[11px] text-admin-muted">Last five provisioned</p>
          </div>
          <NuxtLink to="/super-admin/stores" class="inline-flex min-h-11 items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold text-admin-muted hover:bg-admin-soft hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent">
            All
            <Icon name="heroicons:arrow-right" class="h-3.5 w-3.5" aria-hidden="true" />
          </NuxtLink>
        </div>

        <ul v-if="statsLoading" class="divide-y divide-admin-border" aria-hidden="true">
          <li v-for="n in 4" :key="n" class="flex items-center justify-between gap-3 px-3 py-2.5">
            <div class="min-w-0 space-y-2">
              <span class="skeleton block h-3.5 w-28" />
              <span class="skeleton block h-3 w-20" />
            </div>
            <span class="skeleton h-6 w-16 rounded-full shrink-0" />
          </li>
        </ul>
        <div v-else-if="newestStores.length > 0">
          <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-admin-border bg-admin-soft/35 px-4 py-2.5 text-[11px] font-semibold text-admin-text">
            <span>Store</span>
            <span>Status</span>
          </div>
          <ul class="divide-y divide-admin-border">
            <li v-for="store in newestStores" :key="store.id">
              <NuxtLink :to="`/super-admin/stores/${store.id}`" class="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 transition-colors hover:bg-admin-soft/45 focus-visible:outline-none focus-visible:bg-admin-soft focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-admin-accent">
                <div class="flex min-w-0 items-center gap-2.5">
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-admin-soft text-admin-muted">
                    <Icon name="heroicons:building-storefront" class="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div class="min-w-0">
                    <p class="flex items-center gap-1.5 truncate text-[13px] font-semibold text-admin-text">
                      {{ store.name }}
                      <span v-if="store.is_default" class="rounded-md bg-admin-accent-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-admin-accent">default</span>
                    </p>
                    <p class="truncate text-[11px] text-admin-muted">{{ store.domain || `${store.slug}.store` }} · {{ shortDate(store.created_at) }}</p>
                  </div>
                </div>
                <span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold capitalize" :class="store.status === 'active' ? 'bg-admin-success-soft text-admin-success' : 'bg-admin-soft text-admin-muted'">
                  <span class="h-1.5 w-1.5 rounded-full" :class="store.status === 'active' ? 'bg-admin-success' : 'bg-admin-muted'" aria-hidden="true" />
                  {{ store.status }}
                </span>
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div v-else class="px-5 py-8 text-center">
          <div class="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-admin-soft text-admin-muted">
            <Icon name="heroicons:building-storefront" class="h-4 w-4" aria-hidden="true" />
          </div>
          <p class="mt-2 text-[13px] font-semibold text-admin-text">No stores yet</p>
          <NuxtLink to="/super-admin/admins/new" class="mt-2 inline-flex min-h-11 items-center rounded-lg bg-admin-accent px-2.5 text-[11px] font-semibold text-admin-on-accent hover:bg-admin-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent">Create first admin</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityEntry, SuperAdminOverview } from '~/composables/useSuperAdminApi'

const api = useSuperAdminApi()
const { theme } = useAdminAppearance()
const chartThemeTick = ref(0)

// CSS variables resolve from the rendered super-admin shell. Wait until Vue
// has applied its new theme class, then invalidate every chart-data computed
// value so canvas datasets receive the current palette rather than stale
// colours from the previous theme.
watch(theme, async () => {
  await nextTick()
  chartThemeTick.value++
})

const recent = ref<ActivityEntry[]>([])
const overview = ref<SuperAdminOverview | null>(null)
const activityPool = ref<ActivityEntry[]>([])

const activityLoading = ref(true)
const statsLoading = ref(true)
const activityError = ref<string | null>(null)
const statsError = ref<string | null>(null)
const dashboardLoading = computed(() => statsLoading.value || activityLoading.value)
const dashboardStatus = computed(() => {
  if (statsLoading.value && activityLoading.value) return 'Loading platform totals and activity data.'
  if (statsLoading.value) return 'Loading platform totals.'
  if (activityLoading.value) return 'Loading activity data.'
  return 'Dashboard loading complete.'
})

const icons = {
  store: 'heroicons:building-storefront',
  globe: 'heroicons:globe-alt',
  users: 'heroicons:user-group',
  shield: 'heroicons:shield-check',
}

const fmt = (n: number) => n.toLocaleString()

const metrics = computed(() => {
  const d = overview.value
  const total = d?.stores.total ?? 0
  const active = d?.stores.active ?? 0
  const activePct = total ? Math.round(active / total * 100) : 0
  return [
    { label: 'Stores', value: fmt(total), sub: `${fmt(d?.stores.active ?? 0)} active · ${fmt(d?.stores.inactive ?? 0)} inactive`, icon: icons.store, chip: 'bg-admin-accent-soft border-admin-accent/20 text-admin-accent', delta: total ? `${activePct}%` : undefined },
    { label: 'Live domains', value: fmt(d?.stores.verified_domains ?? 0), sub: 'verified custom domains', icon: icons.globe, chip: 'bg-admin-success-soft border-admin-success/20 text-admin-success' },
    { label: 'Users', value: fmt(d?.users.total ?? 0), sub: 'across all stores', icon: icons.users, chip: 'bg-admin-info-soft border-admin-info/20 text-admin-info' },
    { label: 'Admins', value: fmt(d?.admins.total ?? 0), sub: `${fmt(d?.admins.active ?? 0)} active · ${fmt(d?.admins.super ?? 0)} super`, icon: icons.shield, chip: 'bg-admin-warning-soft border-admin-warning/20 text-admin-warning' },
  ]
})

const newestStores = computed(() => overview.value?.newest_stores ?? [])

const skeletonWidth = (n: number) => ['82%', '64%', '73%', '58%', '69%'][(n - 1) % 5]
const timeLabel = (iso: string) => new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
const shortDate = (iso: string) => new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
const actorInitial = (email?: string | null) => (email?.[0] ?? 'S').toUpperCase()

const dashboardEventText = (entry: ActivityEntry) => (entry.description ?? '').trim().toLowerCase()
const dashboardIsSignOut = (entry: ActivityEntry) => /(logged out|signed out|log out|logout)/.test(dashboardEventText(entry))
const dashboardIsSignIn = (entry: ActivityEntry) => !dashboardIsSignOut(entry) && /(logged in|signed in|log in|login)/.test(dashboardEventText(entry))
const dashboardEventTitle = (entry: ActivityEntry) => dashboardIsSignOut(entry)
  ? 'Signed out'
  : dashboardIsSignIn(entry)
    ? 'Signed in'
    : entry.description?.trim() || 'Activity recorded'
const dashboardEventType = (entry: ActivityEntry) => dashboardIsSignOut(entry)
  ? 'Sign out'
  : dashboardIsSignIn(entry)
    ? 'Sign in'
    : entry.log_name || 'Event'
const dashboardEventIcon = (entry: ActivityEntry) => {
  if (dashboardIsSignOut(entry)) return 'heroicons:arrow-left-start-on-rectangle'
  if (dashboardIsSignIn(entry)) return 'heroicons:arrow-right-end-on-rectangle'
  const name = (entry.log_name ?? '').toLowerCase()
  if (/(delete|remove|deactivate|disable)/.test(name)) return 'heroicons:trash'
  if (/(create|store|register)/.test(name)) return 'heroicons:building-storefront'
  if (/(user|admin|impersonat)/.test(name)) return 'heroicons:user-circle'
  return 'heroicons:bolt'
}

const eventChip = (name: string | null) => {
  const n = (name ?? '').toLowerCase()
  if (/(delete|remove|deactivate|disable)/.test(n)) return 'bg-admin-danger-soft text-admin-danger border border-admin-danger/15'
  if (/(create|store|register)/.test(n)) return 'bg-admin-success-soft text-admin-success border border-admin-success/15'
  if (/impersonat/.test(n)) return 'bg-admin-warning-soft text-admin-warning border border-admin-warning/15'
  if (/(login|logout|auth|session)/.test(n)) return 'bg-admin-soft text-admin-text border border-admin-border'
  return 'bg-admin-accent-soft text-admin-accent border border-admin-accent/15'
}

// Chart helpers — read the pinned super-admin scope first so a store's
// Appearance theme (`--color-primary` on `:root`) can never re-tint charts.
const resolveVar = (name: string, fallback: string) => {
  void chartThemeTick.value
  if (!import.meta.client) return fallback
  const scope = document.querySelector('.super-admin-shell')
  if (scope) {
    const v = getComputedStyle(scope).getPropertyValue(name).trim()
    if (v) return v
  }
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

const isSuperDark = () => {
  void chartThemeTick.value
  if (!import.meta.client) return false
  return document.querySelector('.super-admin-shell')?.classList.contains('admin-theme-dark')
    ?? document.body.classList.contains('admin-theme-dark')
}

const storeHealthEmpty = computed(() => !overview.value || overview.value.stores.total === 0)
const storeHealthData = computed(() => {
  const o = overview.value
  const active = o?.stores.active ?? 0
  const inactive = o?.stores.inactive ?? 0
  return {
    labels: ['Active', 'Inactive'],
    datasets: [{ data: [active, inactive], backgroundColor: [resolveVar('--admin-success', '#047857'), resolveVar('--admin-border', '#dbe2ea')], borderWidth: 0, hoverOffset: 4 }],
  }
})

const domainEmpty = computed(() => !overview.value || overview.value.stores.total === 0)
const domainData = computed(() => {
  const o = overview.value?.stores
  const verified = o?.verified_domains ?? 0
  const pending = o?.unverified_domains ?? 0
  const none = o?.no_domain ?? 0
  // Backward-compat: if new fields missing (cached API), fall back to remainder split.
  const hasBreakdown = o && typeof pending === 'number' && typeof none === 'number' && verified + pending + none === (o.total ?? 0)
  if (hasBreakdown) {
    return {
      labels: ['Verified', 'Pending DNS', 'No custom domain'],
      datasets: [{ data: [verified, pending, none], backgroundColor: [resolveVar('--admin-info', '#0369a1'), resolveVar('--admin-warning', '#b45309'), resolveVar('--admin-border', '#dbe2ea')], borderWidth: 0, hoverOffset: 4 }],
    }
  }
  const total = o?.total ?? 0
  const remainder = Math.max(0, total - verified)
  return {
    labels: ['Verified', 'Awaiting / none'],
    datasets: [{ data: [verified, remainder], backgroundColor: [resolveVar('--admin-info', '#0369a1'), resolveVar('--admin-border', '#dbe2ea')], borderWidth: 0, hoverOffset: 4 }],
  }
})

const operatorsEmpty = computed(() => !overview.value || overview.value.admins.total === 0)
const operatorsData = computed(() => {
  const o = overview.value
  const superCount = o?.admins.super ?? 0
  const regularActive = Math.max(0, (o?.admins.active ?? 0) - superCount)
  const disabled = Math.max(0, (o?.admins.total ?? 0) - (o?.admins.active ?? 0))
  // If disabled is 0, show 2 segments for clarity
  if (disabled === 0) {
    return {
      labels: ['Active admins', 'Super admins'],
      datasets: [{ data: [regularActive, superCount], backgroundColor: [resolveVar('--admin-accent', '#1a1a1a'), resolveVar('--admin-warning', '#b45309')], borderWidth: 0, hoverOffset: 4 }],
    }
  }
  return {
    labels: ['Active admins', 'Super admins', 'Disabled'],
    datasets: [{ data: [regularActive, superCount, disabled], backgroundColor: [resolveVar('--admin-accent', '#1a1a1a'), resolveVar('--admin-warning', '#b45309'), resolveVar('--admin-border', '#dbe2ea')], borderWidth: 0, hoverOffset: 4 }],
  }
})

const doughnutOptions = computed(() => ({
  plugins: { legend: { display: false } },
}))

// Activity mix — top log_name
const activityMixEmpty = computed(() => activityPool.value.length === 0)
const activityMixData = computed(() => {
  const counts = new Map<string, number>()
  for (const e of activityPool.value) {
    const k = (e.log_name ?? 'other').toLowerCase()
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  // Keep categorical marks legible in both themes: lead with the platform
  // accent, then use the established semantic roles at their current values.
  const accent = resolveVar('--admin-accent', '#1a1a1a')
  const palette = [
    accent,
    resolveVar('--admin-info', '#0369a1'),
    resolveVar('--admin-success', '#047857'),
    resolveVar('--admin-warning', '#b45309'),
    resolveVar('--admin-danger', '#b91c1c'),
    resolveVar('--admin-text-muted', '#6b7280'),
  ]
  return {
    labels: sorted.map(([k]) => k),
    datasets: [{ label: 'Events', data: sorted.map(([, v]) => v), backgroundColor: palette.slice(0, sorted.length), borderRadius: 10 as any, borderSkipped: false, barThickness: 14 }],
  }
})
const barOptions = computed(() => ({
  indexAxis: 'y' as const,
  plugins: { legend: { display: false } },
}))

// Activity per day — last 7 days
const activitySeriesEmpty = computed(() => {
  const buckets = dailyBuckets.value
  return buckets.every(b => b.count === 0)
})
const activitySeriesTotal = computed(() => dailyBuckets.value.reduce((s, b) => s + b.count, 0))
const localDateKey = (date: Date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-')

const dailyBuckets = computed(() => {
  const days: { key: string; label: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const key = localDateKey(d)
    const label = d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    days.push({ key, label, count: 0 })
  }
  const map = new Map(days.map(d => [d.key, d]))
  for (const e of activityPool.value) {
    const k = localDateKey(new Date(e.created_at))
    const b = map.get(k)
    if (b) b.count++
  }
  return days
})
const activitySeriesData = computed(() => {
  const b = dailyBuckets.value
  const accent = resolveVar('--admin-accent', '#1a1a1a')
  const fill = isSuperDark() ? 'rgba(250,250,250,0.14)' : 'rgba(26,26,26,0.08)'
  return {
    labels: b.map(x => x.label),
    datasets: [{ label: 'Events', data: b.map(x => x.count), borderColor: accent, backgroundColor: fill, fill: true, tension: 0.35, pointRadius: 3, pointBackgroundColor: accent, pointBorderColor: resolveVar('--admin-surface', '#fff'), pointBorderWidth: 2 }],
  }
})
const lineOptions = computed(() => ({
  plugins: { legend: { display: false } },
  scales: {
    y: { ticks: { precision: 0 } },
  },
}))

const loadActivity = async () => {
  activityLoading.value = true
  activityError.value = null
  try {
    const response = await api.listActivity({ per_page: 50 })
    activityPool.value = response.data
    recent.value = response.data.slice(0, 8)
  } catch (err: any) {
    activityError.value = err?.data?.message || 'Recent activity could not be loaded.'
  } finally {
    activityLoading.value = false
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

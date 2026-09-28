<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="min-w-0">
        <div class="inline-flex items-center gap-2 rounded-full border border-admin-border bg-admin-surface px-2.5 py-1 text-[11px] font-semibold text-admin-muted">
          <span class="h-2 w-2 rounded-full bg-admin-success" aria-hidden="true" />
          Platform control room
          <span class="hidden sm:inline text-admin-border">·</span>
          <span class="hidden sm:inline">Authorized for super admins only</span>
        </div>
        <h1 class="mt-3 text-[28px] font-bold tracking-tight text-admin-text">Super Admin</h1>
        <p class="mt-1 max-w-2xl text-sm leading-relaxed text-admin-muted">Monitor every tenant, verify domain readiness, manage operators, and audit platform activity — all from one stable surface.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <NuxtLink to="/super-admin/stores" class="inline-flex min-h-10 items-center gap-2 rounded-xl border border-admin-border bg-admin-surface px-4 text-sm font-semibold text-admin-text hover:bg-admin-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h6" /></svg>
          Stores
        </NuxtLink>
        <NuxtLink to="/super-admin/admins/new" class="inline-flex min-h-10 items-center gap-2 rounded-xl bg-admin-accent px-4 text-sm font-semibold text-admin-on-accent shadow-sm hover:bg-admin-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" /></svg>
          New admin
        </NuxtLink>
      </div>
    </div>

    <!-- KPI row -->
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="(m, i) in metrics"
        :key="m.label"
        class="group relative overflow-hidden rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-sm transition-colors hover:border-admin-accent/20"
        :style="{ '--i': i } as any"
      >
        <div class="absolute inset-x-0 top-0 h-0.5" :class="m.accentBar" aria-hidden="true" />
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-widest text-admin-muted">{{ m.label }}</p>
            <div class="mt-2 flex items-baseline gap-2">
              <span v-if="statsLoading" class="skeleton block h-8 w-16 rounded-lg" aria-hidden="true" />
              <p v-else class="text-[28px] font-bold leading-none tracking-tight text-admin-text tabular-nums">{{ m.value }}</p>
              <span v-if="!statsLoading && m.delta" class="rounded-full bg-admin-success-soft px-1.5 py-0.5 text-[11px] font-semibold text-admin-success">{{ m.delta }}</span>
            </div>
            <p class="mt-1 text-xs leading-relaxed text-admin-muted">
              <span v-if="statsLoading" class="skeleton inline-block h-3 w-28 align-middle" />
              <span v-else>{{ m.sub }}</span>
            </p>
          </div>
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-admin-accent" :class="m.chip" v-html="m.icon" aria-hidden="true" />
        </div>
        <div v-if="!statsLoading && m.meta" class="mt-4 flex items-center gap-1.5 text-xs text-admin-muted">
          <span class="h-1.5 w-1.5 rounded-full" :class="m.dot" />
          {{ m.meta }}
        </div>
      </div>
    </div>

    <p v-if="statsError" role="alert" class="flex flex-wrap items-center gap-3 rounded-xl border border-admin-danger/20 bg-admin-danger-soft px-4 py-3 text-sm text-admin-danger">
      <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
      {{ statsError }}
      <button type="button" class="ml-auto inline-flex min-h-8 items-center rounded-lg border border-admin-danger/20 bg-admin-surface px-3 text-xs font-semibold hover:bg-white" @click="loadOverview">Try again</button>
    </p>

    <!-- Charts -->
    <div class="grid gap-4 lg:grid-cols-3">
      <!-- Store health -->
      <div class="rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-sm lg:col-span-1">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold text-admin-text">Store health</h2>
            <p class="mt-0.5 text-xs text-admin-muted">Active vs inactive — from platform totals</p>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full border border-admin-border bg-admin-soft px-2 py-1 text-[11px] font-semibold text-admin-muted">
            <span class="h-2 w-2 rounded-full bg-admin-success" /> {{ overview?.stores.active ?? 0 }} active
          </span>
        </div>
        <div class="mt-4">
          <SuperAdminSaChart
            type="doughnut"
            :height="200"
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
        <div v-if="!statsLoading && !storeHealthEmpty" class="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div class="rounded-xl border border-admin-success/20 bg-admin-success-soft px-3 py-2">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-admin-success">Active</p>
            <p class="mt-0.5 text-sm font-bold text-admin-text">{{ overview?.stores.active ?? 0 }} stores</p>
          </div>
          <div class="rounded-xl border border-admin-border bg-admin-soft px-3 py-2">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-admin-muted">Inactive</p>
            <p class="mt-0.5 text-sm font-bold text-admin-text">{{ overview?.stores.inactive ?? 0 }} stores</p>
          </div>
        </div>
        <p v-if="!statsLoading" class="mt-3 text-[11px] leading-relaxed text-admin-muted">Source: <span class="font-mono font-medium text-admin-text">/super-admin/overview</span> · authorized for super admin role only.</p>
      </div>

      <!-- Domain readiness -->
      <div class="rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-sm lg:col-span-1">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold text-admin-text">Domain readiness</h2>
            <p class="mt-0.5 text-xs text-admin-muted">Verified · pending DNS · no custom domain</p>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-admin-info-soft px-2 py-1 text-[11px] font-semibold text-admin-info">
            {{ overview?.stores.verified_domains ?? 0 }} verified
          </span>
        </div>
        <div class="mt-4">
          <SuperAdminSaChart
            type="doughnut"
            :height="200"
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
        <div v-if="!statsLoading && !domainEmpty" class="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div class="rounded-xl border border-admin-info/20 bg-admin-info-soft px-2.5 py-2 text-center">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-admin-info">Verified</p>
            <p class="mt-0.5 text-sm font-bold text-admin-text">{{ overview?.stores.verified_domains ?? 0 }}</p>
          </div>
          <div class="rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-2 text-center dark:border-amber-900/30 dark:bg-amber-950/30">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Pending</p>
            <p class="mt-0.5 text-sm font-bold text-admin-text">{{ overview?.stores.unverified_domains ?? 0 }}</p>
          </div>
          <div class="rounded-xl border border-admin-border bg-admin-soft px-2.5 py-2 text-center">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-admin-muted">No domain</p>
            <p class="mt-0.5 text-sm font-bold text-admin-text">{{ overview?.stores.no_domain ?? 0 }}</p>
          </div>
        </div>
        <p v-if="!statsLoading && !domainEmpty" class="mt-3 text-[11px] leading-relaxed text-admin-muted">Source: <span class="font-mono font-medium text-admin-text">/super-admin/overview</span> · <span class="font-mono">verified</span> = DNS proven, <span class="font-mono">pending</span> = domain set but not verified, <span class="font-mono">no_domain</span> = uses <span class="font-mono">{{ '{slug}.store' }}</span> or platform host.</p>
      </div>

      <!-- Platform operators -->
      <div class="rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-sm lg:col-span-1">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold text-admin-text">Operators</h2>
            <p class="mt-0.5 text-xs text-admin-muted">How access is distributed</p>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full border border-admin-border bg-admin-soft px-2 py-1 text-[11px] font-semibold text-admin-muted">
            {{ overview?.admins.total ?? 0 }} admins
          </span>
        </div>
        <div class="mt-4">
          <SuperAdminSaChart
            type="doughnut"
            :height="200"
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
        <div v-if="!statsLoading && !operatorsEmpty" class="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div class="rounded-xl bg-admin-soft px-3 py-2">
            <p class="text-[11px] font-medium text-admin-muted">Active</p>
            <p class="text-sm font-bold text-admin-text">{{ overview?.admins.active ?? 0 }}</p>
          </div>
          <div class="rounded-xl bg-admin-accent-soft px-3 py-2">
            <p class="text-[11px] font-medium text-admin-accent">Super</p>
            <p class="text-sm font-bold text-admin-text">{{ overview?.admins.super ?? 0 }}</p>
          </div>
          <div class="rounded-xl bg-admin-soft px-3 py-2">
            <p class="text-[11px] font-medium text-admin-muted">All users</p>
            <p class="text-sm font-bold text-admin-text">{{ overview?.users.total ?? 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity insights -->
    <div class="grid gap-4 lg:grid-cols-3">
      <div class="rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-sm lg:col-span-2">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold text-admin-text">Activity mix</h2>
            <p class="mt-0.5 text-xs text-admin-muted">Top log types from your last 50 events — what the platform is actually doing</p>
          </div>
          <NuxtLink to="/super-admin/activity" class="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-admin-border bg-admin-surface px-3 text-xs font-semibold text-admin-text hover:bg-admin-soft">
            View log
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </NuxtLink>
        </div>
        <div class="mt-4">
          <SuperAdminSaChart
            type="bar"
            :height="220"
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
        <p v-if="!activityLoading" class="mt-3 text-[11px] leading-relaxed text-admin-muted">Source: <span class="font-mono font-medium text-admin-text">GET /activity-log</span> (scoped to your role) · bucketed client-side — no synthetic series.</p>
      </div>

      <div class="rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-sm">
        <h2 class="text-sm font-semibold text-admin-text">Signals over 7 days</h2>
        <p class="mt-0.5 text-xs text-admin-muted">Events per day — proves liveness, surfaces quiet periods</p>
        <div class="mt-4">
          <SuperAdminSaChart
            type="line"
            :height="220"
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
        <div v-if="!activityLoading && !activitySeriesEmpty" class="mt-3 flex items-center gap-2 text-xs text-admin-muted">
          <span class="h-2 w-2 rounded-full bg-admin-accent" />
          {{ activitySeriesTotal }} events · last 7 days
        </div>
      </div>
    </div>

    <!-- Data gap notice -->
    <div class="rounded-2xl border border-admin-info/20 bg-admin-info-soft px-4 py-3.5 sm:px-5">
      <div class="flex gap-3">
        <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-admin-surface text-admin-info shadow-sm">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </span>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-admin-text">What we can’t chart yet — no placeholder numbers</p>
          <ul class="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-admin-muted marker:text-admin-info">
            <li><span class="font-medium text-admin-text">Revenue / orders / subscription MRR:</span> no platform-wide analytics endpoint for super admin. Store-level <span class="font-mono">/dashboard/stats</span> is tenant-scoped and not summed server-side.</li>
            <li><span class="font-medium text-admin-text">Store growth over time:</span> overview returns only 5 newest stores, not a histogram. A <span class="font-mono">GET /super-admin/stores?group_by=month</span> or dedicated <span class="font-mono">/super-admin/analytics</span> would unlock sparkline/Sankey work.</li>
            <li><span class="font-medium text-admin-text">Subscription status breakdown</span> (active / comped / expired / cancelled): not exposed in overview — currently only on per-store detail. Domain breakdown is now accurate (<span class="font-mono">verified / pending / no_domain</span> from <span class="font-mono">/super-admin/overview</span>).</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom: timeline + newest stores -->
    <div class="grid gap-4 lg:grid-cols-3 items-start">
      <!-- Recent activity timeline -->
      <div class="rounded-2xl border border-admin-border bg-admin-surface shadow-sm lg:col-span-2 overflow-hidden">
        <div class="flex items-center justify-between gap-3 border-b border-admin-border px-5 py-4">
          <div class="flex items-center gap-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-admin-accent-soft text-admin-accent">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <div>
              <h2 class="text-sm font-semibold text-admin-text">Recent activity</h2>
              <p class="text-xs text-admin-muted">Latest platform events — newest first</p>
            </div>
          </div>
          <NuxtLink to="/super-admin/activity" class="inline-flex min-h-9 items-center gap-1 rounded-xl border border-admin-border bg-admin-surface px-3 text-xs font-semibold text-admin-text hover:bg-admin-soft">
            View all
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </NuxtLink>
        </div>

        <ul v-if="activityLoading" class="divide-y divide-admin-border" aria-hidden="true">
          <li v-for="n in 5" :key="n" class="flex gap-3 px-5 py-3.5">
            <span class="skeleton h-6 w-16 shrink-0 rounded-full mt-0.5" />
            <div class="min-w-0 flex-1 space-y-2">
              <span class="skeleton block h-3.5" :style="{ width: skeletonWidth(n) }" />
              <span class="skeleton block h-3 w-2/5" />
            </div>
          </li>
        </ul>
        <SuperAdminErrorState v-else-if="activityError" :message="activityError" @retry="loadActivity" />
        <ul v-else-if="recent.length > 0" class="divide-y divide-admin-border">
          <li v-for="entry in recent" :key="entry.id" class="flex gap-3 px-5 py-3.5 hover:bg-admin-soft/60 transition-colors">
            <span class="mt-0.5 shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide leading-none" :class="eventChip(entry.log_name)">{{ entry.log_name ?? 'event' }}</span>
            <div class="min-w-0 flex-1">
              <p class="text-sm leading-relaxed text-admin-text line-clamp-2">{{ entry.description }}</p>
              <p class="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-admin-muted">
                <span class="inline-flex items-center gap-1">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {{ entry.causer?.email ?? 'system' }}
                </span>
                <span class="h-1 w-1 rounded-full bg-admin-border" aria-hidden="true" />
                <span>{{ timeLabel(entry.created_at) }}</span>
                <span v-if="entry.store" class="inline-flex items-center gap-1 rounded-full bg-admin-soft px-1.5 py-0.5 font-medium">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h6" /></svg>
                  {{ entry.store.name }}
                </span>
              </p>
            </div>
          </li>
        </ul>
        <div v-else class="px-6 py-14 text-center">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-admin-soft text-admin-muted">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5h6m-6 4h6m-6 4h6M4 4h.01M4 8h.01M4 12h.01M4 16h.01" /></svg>
          </div>
          <p class="mt-3 text-sm font-semibold text-admin-text">No activity yet</p>
          <p class="mx-auto mt-1 max-w-md text-sm text-admin-muted">Platform events will appear here as they happen. Try creating a store or admin.</p>
        </div>
      </div>

      <!-- Newest stores -->
      <div class="rounded-2xl border border-admin-border bg-admin-surface shadow-sm overflow-hidden">
        <div class="flex items-center justify-between gap-3 border-b border-admin-border px-5 py-4">
          <div>
            <h2 class="text-sm font-semibold text-admin-text">Newest stores</h2>
            <p class="text-xs text-admin-muted">Last 5 provisioned</p>
          </div>
          <NuxtLink to="/super-admin/stores" class="inline-flex min-h-9 items-center gap-1 rounded-xl border border-admin-border bg-admin-surface px-3 text-xs font-semibold text-admin-text hover:bg-admin-soft">
            All
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </NuxtLink>
        </div>

        <ul v-if="statsLoading" class="divide-y divide-admin-border" aria-hidden="true">
          <li v-for="n in 4" :key="n" class="flex items-center justify-between gap-3 px-5 py-4">
            <div class="min-w-0 space-y-2">
              <span class="skeleton block h-3.5 w-28" />
              <span class="skeleton block h-3 w-20" />
            </div>
            <span class="skeleton h-6 w-16 rounded-full shrink-0" />
          </li>
        </ul>
        <ul v-else-if="newestStores.length > 0" class="divide-y divide-admin-border">
          <li v-for="store in newestStores" :key="store.id">
            <NuxtLink :to="`/super-admin/stores/${store.id}`" class="group flex items-center justify-between gap-3 px-5 py-4 hover:bg-admin-soft/60 transition-colors focus-visible:outline-none focus-visible:bg-admin-soft">
              <div class="min-w-0">
                <p class="flex items-center gap-2 truncate text-sm font-semibold text-admin-text">
                  {{ store.name }}
                  <span v-if="store.is_default" class="rounded-full bg-admin-accent-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-admin-accent">default</span>
                </p>
                <p class="truncate font-mono text-xs text-admin-muted">{{ store.domain || `${store.slug}.store` }}</p>
                <p class="mt-1 text-[11px] text-admin-muted">{{ shortDate(store.created_at) }}</p>
              </div>
              <span class="flex shrink-0 items-center gap-2">
                <span class="hidden sm:inline-flex h-2 w-2 rounded-full" :class="store.status === 'active' ? 'bg-admin-success' : 'bg-admin-muted'" aria-hidden="true" />
                <span class="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold" :class="store.status === 'active' ? 'bg-admin-success-soft text-admin-success' : 'bg-admin-soft text-admin-muted'">{{ store.status }}</span>
                <svg class="h-4 w-4 text-admin-muted opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </span>
            </NuxtLink>
          </li>
        </ul>
        <div v-else class="px-6 py-10 text-center">
          <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-admin-soft text-admin-muted">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" /></svg>
          </div>
          <p class="mt-2 text-sm font-semibold text-admin-text">No stores yet</p>
          <NuxtLink to="/super-admin/admins/new" class="mt-3 inline-flex min-h-9 items-center rounded-xl bg-admin-accent px-4 text-xs font-semibold text-admin-on-accent">Create first admin</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityEntry, SuperAdminOverview } from '~/composables/useSuperAdminApi'

const api = useSuperAdminApi()

const recent = ref<ActivityEntry[]>([])
const overview = ref<SuperAdminOverview | null>(null)
const activityPool = ref<ActivityEntry[]>([])

const activityLoading = ref(true)
const statsLoading = ref(true)
const activityError = ref<string | null>(null)
const statsError = ref<string | null>(null)

const icons = {
  store: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h6"/></svg>',
  globe: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 2a15 15 0 010 18M12 2a15 15 0 000 18M3.6 9h16.8M3.6 15h16.8"/></svg>',
  users: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4a4 4 0 110 8 4 4 0 010-8zM5 20a7 7 0 0114 0H5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l2 2 4-4"/></svg>',
  shield: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
}

const fmt = (n: number) => n.toLocaleString()

const metrics = computed(() => {
  const d = overview.value
  const total = d?.stores.total ?? 0
  const active = d?.stores.active ?? 0
  const activePct = total ? Math.round(active / total * 100) : 0
  return [
    { label: 'Stores', value: fmt(total), sub: `${fmt(d?.stores.active ?? 0)} active · ${fmt(d?.stores.inactive ?? 0)} inactive`, icon: icons.store, chip: 'bg-admin-accent-soft border-admin-accent/20 text-admin-accent', accentBar: 'bg-admin-accent', dot: 'bg-admin-accent', meta: total ? `${activePct}% active` : 'No stores yet', delta: total ? `${activePct}%` : undefined },
    { label: 'Live domains', value: fmt(d?.stores.verified_domains ?? 0), sub: 'verified custom domains', icon: icons.globe, chip: 'bg-admin-success-soft border-admin-success/20 text-admin-success', accentBar: 'bg-admin-success', dot: 'bg-admin-success', meta: total ? `${fmt(d?.stores.verified_domains ?? 0)} of ${fmt(total)} stores` : undefined },
    { label: 'Users', value: fmt(d?.users.total ?? 0), sub: 'across all stores', icon: icons.users, chip: 'bg-admin-info-soft border-admin-info/20 text-admin-info', accentBar: 'bg-admin-info', dot: 'bg-admin-info', meta: d?.users.total ? 'Platform-wide' : 'Awaiting first tenant' },
    { label: 'Admins', value: fmt(d?.admins.total ?? 0), sub: `${fmt(d?.admins.active ?? 0)} active · ${fmt(d?.admins.super ?? 0)} super`, icon: icons.shield, chip: 'bg-admin-warning-soft border-admin-warning/20 text-admin-warning', accentBar: 'bg-admin-warning', dot: 'bg-admin-warning', meta: d?.admins.total ? `${fmt(d?.admins.super ?? 0)} super admins` : undefined },
  ]
})

const newestStores = computed(() => overview.value?.newest_stores ?? [])

const skeletonWidth = (n: number) => ['82%', '64%', '73%', '58%', '69%'][(n - 1) % 5]
const timeLabel = (iso: string) => new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
const shortDate = (iso: string) => new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })

const eventChip = (name: string | null) => {
  const n = (name ?? '').toLowerCase()
  if (/(delete|remove|deactivate|disable)/.test(n)) return 'bg-admin-danger-soft text-admin-danger border border-admin-danger/15'
  if (/(create|store|register)/.test(n)) return 'bg-admin-success-soft text-admin-success border border-admin-success/15'
  if (/(login|auth|impersonat|session)/.test(n)) return 'bg-admin-info-soft text-admin-info border border-admin-info/15'
  return 'bg-admin-accent-soft text-admin-accent border border-admin-accent/15'
}

// Chart helpers
const resolveVar = (name: string, fallback: string) => {
  if (!import.meta.client) return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
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
      labels: ['Admins', 'Super admins'],
      datasets: [{ data: [Math.max(1, regularActive || (o?.admins.total ?? 0) - superCount), superCount], backgroundColor: [resolveVar('--admin-accent', '#7c3aed'), resolveVar('--admin-warning', '#b45309')], borderWidth: 0, hoverOffset: 4 }],
    }
  }
  return {
    labels: ['Active admins', 'Super admins', 'Disabled'],
    datasets: [{ data: [regularActive, superCount, disabled], backgroundColor: [resolveVar('--admin-accent', '#7c3aed'), resolveVar('--admin-warning', '#b45309'), resolveVar('--admin-border', '#dbe2ea')], borderWidth: 0, hoverOffset: 4 }],
  }
})

const doughnutOptions = computed(() => ({
  plugins: { legend: { display: true, position: 'bottom' as const, labels: { color: resolveVar('--admin-text-muted', '#4b5563'), font: { size: 11, family: 'Inter' }, padding: 16, usePointStyle: true, pointStyle: 'circle' } } },
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
  // palette that stays calm in both themes
  const palette = ['#7c3aed', '#0369a1', '#047857', '#b45309', '#6b7280', '#4b5563']
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
const dailyBuckets = computed(() => {
  const days: { key: string; label: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    days.push({ key, label, count: 0 })
  }
  const map = new Map(days.map(d => [d.key, d]))
  for (const e of activityPool.value) {
    const k = new Date(e.created_at).toISOString().slice(0, 10)
    const b = map.get(k)
    if (b) b.count++
  }
  return days
})
const activitySeriesData = computed(() => {
  const b = dailyBuckets.value
  return {
    labels: b.map(x => x.label),
    datasets: [{ label: 'Events', data: b.map(x => x.count), borderColor: resolveVar('--admin-accent', '#7c3aed'), backgroundColor: 'rgba(124,58,237,0.12)', fill: true, tension: 0.35, pointRadius: 3, pointBackgroundColor: resolveVar('--admin-accent', '#7c3aed'), pointBorderColor: resolveVar('--admin-surface', '#fff'), pointBorderWidth: 2 }],
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
    const [recentRes, poolRes] = await Promise.all([
      api.listActivity({ per_page: 8 }),
      api.listActivity({ per_page: 50 }),
    ])
    recent.value = recentRes.data
    activityPool.value = poolRes.data
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

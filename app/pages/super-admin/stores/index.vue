<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="min-w-0">
        <div class="inline-flex items-center gap-2 text-xs font-medium text-admin-muted">
          <NuxtLink to="/super-admin" class="inline-flex items-center gap-1 hover:text-admin-text">Dashboard</NuxtLink>
          <span aria-hidden="true" class="text-admin-border">/</span>
          <span class="font-semibold text-admin-text">Stores</span>
        </div>
        <h1 class="mt-2 text-[26px] font-bold tracking-tight text-admin-text">Stores</h1>
        <p class="mt-1 max-w-2xl text-sm leading-relaxed text-admin-muted">Every tenant, its domain readiness, and headcount. Provision a store by creating its first admin.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="hidden sm:flex items-center gap-2 rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-xs text-admin-muted">
          <span class="h-2 w-2 rounded-full bg-admin-success" aria-hidden="true" />
          {{ pagination.total.toLocaleString() }} total
          <span class="text-admin-border">·</span>
          <span>Live directory</span>
        </div>
        <AdminButton to="/super-admin/admins/new" variant="primary">
          <template #icon>
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" /></svg>
          </template>
          New admin + store
        </AdminButton>
      </div>
    </header>

    <div class="rounded-xl border border-admin-accent/20 bg-admin-accent-soft px-4 py-3 text-sm leading-relaxed text-admin-accent-strong dark:bg-admin-accent-soft/60">
      <div class="flex gap-3">
        <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-admin-surface text-admin-accent shadow-sm">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </span>
        <div>
          <p class="font-semibold">How provisioning works</p>
          <p class="mt-0.5 text-xs leading-relaxed text-admin-accent-strong/80">Stores aren’t created standalone. Create an <NuxtLink to="/super-admin/admins/new" class="font-semibold underline decoration-admin-accent/30 underline-offset-2 hover:decoration-admin-accent">admin</NuxtLink> and choose “New store” — the store is provisioned atomically with its first operator.</p>
        </div>
      </div>
    </div>

    <section class="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface shadow-sm" aria-labelledby="stores-heading">
      <!-- Toolbar -->
      <div class="border-b border-admin-border bg-admin-soft/40 p-4 sm:px-5">
        <form class="flex flex-col gap-3 lg:flex-row lg:items-end" role="search" @submit.prevent="refresh(1)">
          <div class="min-w-0 flex-1">
            <label id="stores-heading" for="store-search" class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-admin-muted">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" /></svg>
              Search stores
            </label>
            <div class="relative">
              <input
                id="store-search"
                v-model="search"
                type="search"
                class="admin-input pl-10"
                placeholder="Name, slug, or domain"
              />
              <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-admin-muted">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" /></svg>
              </span>
              <button v-if="search" type="button" class="absolute inset-y-0 right-0 flex items-center pr-3 text-admin-muted hover:text-admin-text" aria-label="Clear search" title="Clear search" @click="search=''; refresh(1)">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p class="mt-1.5 text-[11px] text-admin-muted">Press Enter or click Search. Results are server-filtered and paginated.</p>
          </div>
          <div class="flex gap-2">
            <button type="submit" class="inline-flex min-h-11 items-center gap-2 rounded-xl bg-admin-accent px-5 text-sm font-semibold text-admin-on-accent hover:bg-admin-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent disabled:opacity-50" :disabled="loading">
              <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" /></svg>
              Search
            </button>
            <button v-if="search" type="button" class="inline-flex min-h-11 items-center rounded-xl border border-admin-border bg-admin-surface px-4 text-sm font-medium text-admin-text hover:bg-admin-soft" @click="search=''; refresh(1)">Clear</button>
          </div>
        </form>
      </div>

      <div v-if="loading" class="px-6 py-12 text-center">
        <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-admin-border border-t-admin-accent" aria-hidden="true" />
        <p class="mt-3 text-sm font-medium text-admin-muted" role="status" aria-live="polite">Loading stores…</p>
      </div>
      <SuperAdminErrorState v-else-if="error" :message="error" @retry="refresh(pagination.current_page)" />
      <AdminEmptyState
        v-else-if="stores.length === 0"
        title="No stores found"
        description="Try a different search, or create an admin and provision their store."
      >
        <template #action>
          <AdminButton to="/super-admin/admins/new" variant="primary">New admin + store</AdminButton>
        </template>
      </AdminEmptyState>

      <template v-else>
        <!-- Desktop table -->
        <div class="hidden overflow-x-auto md:block">
          <table class="w-full min-w-[820px] text-sm">
            <caption class="sr-only">Stores matching the current search</caption>
            <thead class="border-b border-admin-border bg-admin-soft/60">
              <tr class="text-left text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                <th scope="col" class="px-6 py-3">Store</th>
                <th scope="col" class="px-6 py-3">Domain</th>
                <th scope="col" class="px-6 py-3">Status</th>
                <th scope="col" class="px-6 py-3 text-center">Admins</th>
                <th scope="col" class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-admin-border">
              <tr v-for="store in stores" :key="store.id" class="group hover:bg-admin-soft/60 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-admin-border bg-admin-surface text-admin-muted group-hover:border-admin-accent/20 group-hover:text-admin-accent">
                      <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h6" /></svg>
                    </span>
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="truncate font-semibold text-admin-text">{{ store.name }}</span>
                        <span v-if="store.is_default" class="rounded-full bg-admin-accent-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-admin-accent">default</span>
                      </div>
                      <div class="truncate font-mono text-xs text-admin-muted">{{ store.slug }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div v-if="store.domain" class="flex items-center gap-2">
                    <span class="truncate font-mono text-xs font-medium text-admin-text">{{ store.domain }}</span>
                    <span class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" :class="store.domain_verified ? 'bg-admin-success-soft text-admin-success border border-admin-success/15' : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300'">
                      {{ store.domain_verified ? 'verified' : 'unverified' }}
                    </span>
                  </div>
                  <span v-else class="inline-flex items-center gap-1.5 text-xs text-admin-muted">
                    <span class="h-1.5 w-1.5 rounded-full bg-admin-border" /> No custom domain
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold" :class="store.status === 'active' ? 'border-admin-success/20 bg-admin-success-soft text-admin-success' : 'border-admin-border bg-admin-soft text-admin-muted'">
                    <span class="h-1.5 w-1.5 rounded-full" :class="store.status === 'active' ? 'bg-admin-success' : 'bg-admin-muted'" /> {{ store.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex min-w-7 justify-center rounded-full bg-admin-soft px-2 py-1 text-xs font-bold text-admin-text">{{ store.users_count }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-1">
                    <SuperAdminIconButton :icon="viewIcon" :to="`/super-admin/stores/${store.id}`" aria-label="Manage store" tooltip="Manage store" variant="soft" />
                    <SuperAdminIconButton :icon="editIcon" :to="`/super-admin/stores/${store.id}`" aria-label="Edit store" tooltip="Edit store" variant="ghost" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <ul class="divide-y divide-admin-border md:hidden">
          <li v-for="store in stores" :key="store.id" class="p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <p class="flex items-center gap-1.5 truncate font-semibold text-admin-text">{{ store.name }}<span v-if="store.is_default" class="rounded bg-admin-accent-soft px-1 py-0.5 text-[10px] font-bold uppercase text-admin-accent">default</span></p>
                <p class="truncate font-mono text-xs text-admin-muted">{{ store.slug }}</p>
                <p class="mt-1 truncate font-mono text-xs text-admin-text">{{ store.domain || 'No custom domain' }}</p>
              </div>
              <span class="shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold" :class="store.status === 'active' ? 'border-admin-success/20 bg-admin-success-soft text-admin-success' : 'border-admin-border bg-admin-soft text-admin-muted'">{{ store.status }}</span>
            </div>
            <div class="mt-3 flex items-center gap-2 text-xs text-admin-muted">
              <span class="rounded-full bg-admin-soft px-2 py-1 font-medium text-admin-text">{{ store.users_count }} admins</span>
              <span v-if="store.domain" class="rounded-full px-2 py-1 text-[11px] font-bold uppercase" :class="store.domain_verified ? 'bg-admin-success-soft text-admin-success' : 'bg-amber-50 text-amber-700'">{{ store.domain_verified ? 'verified' : 'unverified' }}</span>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <AdminButton :to="`/super-admin/stores/${store.id}`" variant="secondary" block>
                <template #icon><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></template>
                Manage
              </AdminButton>
              <AdminButton :to="`/super-admin/stores/${store.id}`" variant="secondary" block>View</AdminButton>
            </div>
          </li>
        </ul>
      </template>

      <SuperAdminPagination
        :current-page="pagination.current_page"
        :last-page="pagination.last_page"
        :total="pagination.total"
        :loading="loading"
        label="Store pages"
        @change="refresh"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Store } from '~/composables/useSuperAdminApi'

const api = useSuperAdminApi()
const stores = ref<Store[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')
const pagination = ref({ current_page: 1, last_page: 1, total: 0 })

const viewIcon = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>'
const editIcon = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>'

const refresh = async (page = 1) => {
  loading.value = true
  error.value = null
  try {
    const result = await api.listStores({
      page,
      per_page: 25,
      search: search.value.trim() || undefined,
    })
    stores.value = result.data
    pagination.value = {
      current_page: result.current_page,
      last_page: result.last_page,
      total: result.total,
    }
  } catch (err: any) {
    error.value = err?.data?.message || 'Stores could not be loaded. Check your connection and try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => refresh())
</script>

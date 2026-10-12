<template>
  <div class="space-y-4">
    <header class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div class="min-w-0">
        <div class="inline-flex items-center gap-2 text-xs font-medium text-admin-muted">
          <NuxtLink to="/super-admin" class="inline-flex items-center gap-1 hover:text-admin-text">Dashboard</NuxtLink>
          <span aria-hidden="true" class="text-admin-border">/</span>
          <span class="font-semibold text-admin-text">Stores</span>
        </div>
        <h1 class="mt-1.5 text-[22px] font-bold tracking-tight text-admin-text">Stores</h1>
        <p class="mt-1 max-w-2xl text-sm leading-relaxed text-admin-muted">Every tenant, its domain readiness, and headcount. Provision a store by creating its first admin.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="hidden sm:flex items-center gap-2 rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-xs text-admin-muted">
          <span class="h-2 w-2 rounded-full bg-admin-success" aria-hidden="true" />
          {{ pagination.total.toLocaleString() }} {{ hasAppliedCriteria ? 'matching' : 'total' }}
          <span class="text-admin-border">·</span>
          <span>Live directory</span>
        </div>
        <AdminButton to="/super-admin/admins/new" variant="primary">
          <template #icon>
            <Icon name="heroicons:plus" class="h-4 w-4" aria-hidden="true" />
          </template>
          New admin + store
        </AdminButton>
      </div>
    </header>

    <div class="rounded-xl border border-admin-accent/20 bg-admin-accent-soft px-3 py-2.5 text-xs leading-relaxed text-admin-accent-strong dark:bg-admin-accent-soft/60">
      <div class="flex gap-3">
        <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-admin-surface text-admin-accent shadow-sm">
          <Icon name="heroicons:information-circle" class="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p class="font-semibold">How provisioning works</p>
          <p class="mt-0.5 text-xs leading-relaxed text-admin-accent-strong/80">Stores aren’t created standalone. Create an <NuxtLink to="/super-admin/admins/new" class="font-semibold underline decoration-admin-accent/30 underline-offset-2 hover:decoration-admin-accent">admin</NuxtLink> and choose “New store” — the store is provisioned atomically with its first operator.</p>
        </div>
      </div>
    </div>

    <section class="relative overflow-visible rounded-xl border border-admin-border bg-admin-surface" aria-labelledby="stores-heading" :aria-busy="loading || undefined">
      <!-- Toolbar -->
      <div class="relative z-20 border-b border-admin-border p-3 sm:px-4">
        <form class="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1.5fr)_repeat(3,minmax(0,1fr))_auto]" role="search" @submit.prevent="refresh(1)">
          <div class="min-w-0 sm:col-span-2 xl:col-span-1">
            <label id="stores-heading" for="store-search" class="sr-only">Search stores</label>
            <div class="relative">
              <input
                id="store-search"
                v-model="search"
                type="search"
                class="admin-input rounded-lg pl-10 pr-11"
                placeholder="Name, slug, or domain"
              />
              <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-admin-muted">
                <Icon name="heroicons:magnifying-glass" class="h-4 w-4" aria-hidden="true" />
              </span>
              <button v-if="search" type="button" class="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-admin-muted hover:text-admin-text" aria-label="Clear search" title="Clear search" @click="search=''; refresh(1)">
                <Icon name="heroicons:x-mark" class="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <AdminFilterSelect
            v-model="status"
            :options="storeStatusOptions"
            aria-label="Filter by store status"
            list-label="Store status filters"
          />
          <AdminFilterSelect
            v-model="subscriptionStatus"
            :options="subscriptionStatusOptions"
            aria-label="Filter by subscription access"
            list-label="Subscription access filters"
          />
          <AdminFilterSelect
            v-model="domainStatus"
            :options="domainStatusOptions"
            aria-label="Filter by custom domain status"
            list-label="Custom domain status filters"
          />
          <div class="flex gap-2 sm:col-span-2 xl:col-span-1">
            <button type="submit" class="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-admin-border bg-admin-surface px-3 text-xs font-semibold text-admin-text hover:bg-admin-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent disabled:opacity-50 xl:flex-none" :disabled="loading">
              <Icon :name="loading ? 'heroicons:arrow-path' : 'heroicons:funnel'" class="h-4 w-4" :class="loading ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" />
              Apply
            </button>
            <button v-if="hasCriteria" type="button" class="inline-flex min-h-11 items-center rounded-lg px-3 text-[11px] font-semibold text-admin-muted hover:bg-admin-soft hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent" @click="resetFilters">Reset</button>
          </div>
        </form>
      </div>

      <div v-if="initialLoading" role="status" aria-live="polite">
        <p class="sr-only">Loading stores…</p>

        <!-- Desktop table skeleton -->
        <div class="hidden overflow-x-auto md:block" aria-hidden="true">
          <table class="w-full min-w-[940px] text-sm">
            <thead class="border-b border-admin-border bg-admin-soft/35">
              <tr class="text-left text-xs font-semibold text-admin-text">
                <th scope="col" class="px-4 py-3">Store</th>
                <th scope="col" class="px-4 py-3">Domain</th>
                <th scope="col" class="px-4 py-3">Status</th>
                <th scope="col" class="px-4 py-3">Access</th>
                <th scope="col" class="px-4 py-3 text-center">Admins</th>
                <th scope="col" class="px-4 py-3"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-admin-border">
              <tr v-for="row in 6" :key="row">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <span class="skeleton h-8 w-8 shrink-0 rounded-lg" />
                    <div class="min-w-0 flex-1 space-y-2">
                      <span class="skeleton block h-3.5" :class="row % 2 ? 'w-28' : 'w-36'" />
                      <span class="skeleton block h-3" :class="row % 2 ? 'w-20' : 'w-24'" />
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span class="skeleton h-3 w-28" />
                    <span class="skeleton h-5 w-16 rounded-md" />
                  </div>
                </td>
                <td class="px-4 py-3"><span class="skeleton block h-6 w-16 rounded-md" /></td>
                <td class="px-4 py-3"><span class="skeleton block h-6 w-20 rounded-md" /></td>
                <td class="px-4 py-3"><span class="skeleton mx-auto block h-3 w-5" /></td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-1">
                    <span class="skeleton h-9 w-9 rounded-lg" />
                    <span class="skeleton h-9 w-9 rounded-lg" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile card skeleton -->
        <ul class="divide-y divide-admin-border md:hidden" aria-hidden="true">
          <li v-for="row in 4" :key="row" class="p-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1 space-y-2">
                <span class="skeleton block h-3.5" :class="row % 2 ? 'w-36' : 'w-28'" />
                <span class="skeleton block h-3 w-20" />
                <span class="skeleton block h-3 w-32" />
              </div>
              <span class="skeleton h-6 w-16 shrink-0 rounded-md" />
            </div>
            <div class="mt-3 flex gap-2">
              <span class="skeleton h-6 w-20 rounded-md" />
              <span class="skeleton h-6 w-16 rounded-md" />
            </div>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <span class="skeleton h-11 rounded-lg" />
              <span class="skeleton h-11 rounded-lg" />
            </div>
          </li>
        </ul>
      </div>
      <SuperAdminErrorState v-else-if="error" :message="error" @retry="refresh(pagination.current_page)" />
      <AdminEmptyState
        v-else-if="stores.length === 0"
        title="No stores found"
        :description="hasAppliedCriteria ? 'Adjust or reset the current filters to broaden the results.' : 'Create an admin to provision their store.'"
      >
        <template #action>
          <button v-if="hasAppliedCriteria" type="button" class="inline-flex min-h-11 items-center justify-center rounded-lg bg-admin-accent px-4 text-sm font-semibold text-white hover:bg-admin-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent" @click="resetFilters">Reset filters</button>
          <AdminButton v-else to="/super-admin/admins/new" variant="primary">New admin + store</AdminButton>
        </template>
      </AdminEmptyState>

      <template v-else>
        <!-- Desktop table -->
        <div class="hidden overflow-x-auto md:block">
          <table class="w-full min-w-[940px] text-sm">
            <caption class="sr-only">Stores matching the current search</caption>
            <thead class="border-b border-admin-border bg-admin-soft/35">
              <tr class="text-left text-xs font-semibold text-admin-text">
                <th scope="col" class="px-4 py-3">Store</th>
                <th scope="col" class="px-4 py-3">Domain</th>
                <th scope="col" class="px-4 py-3">Status</th>
                <th scope="col" class="px-4 py-3">Access</th>
                <th scope="col" class="px-4 py-3 text-center">Admins</th>
                <th scope="col" class="px-4 py-3 text-right"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-admin-border">
              <tr v-for="store in stores" :key="store.id" class="group transition-colors hover:bg-admin-soft/45">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-admin-soft text-admin-muted group-hover:text-admin-accent">
                      <Icon name="heroicons:building-storefront" class="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="truncate font-semibold text-admin-text">{{ store.name }}</span>
                        <span v-if="store.is_default" class="rounded-md bg-admin-accent-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-admin-accent">default</span>
                      </div>
                      <div class="truncate font-mono text-xs text-admin-muted">{{ store.slug }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div v-if="store.domain" class="flex items-center gap-2">
                    <span class="truncate font-mono text-xs font-medium text-admin-text">{{ store.domain }}</span>
                    <span class="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" :class="store.domain_verified ? 'bg-admin-success-soft text-admin-success' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'">
                      {{ store.domain_verified ? 'verified' : 'unverified' }}
                    </span>
                  </div>
                  <span v-else class="inline-flex items-center gap-1.5 text-xs text-admin-muted">
                    <span class="h-1.5 w-1.5 rounded-full bg-admin-border" /> No custom domain
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold capitalize" :class="store.status === 'active' ? 'bg-admin-success-soft text-admin-success' : 'bg-admin-soft text-admin-muted'">
                    <span class="h-1.5 w-1.5 rounded-full" :class="store.status === 'active' ? 'bg-admin-success' : 'bg-admin-muted'" /> {{ store.status }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-md px-2 py-1 text-[11px] font-semibold" :class="accessStateClass(store.subscription_status)">{{ accessStateLabel(store.subscription_status) }}</span>
                </td>
                <td class="px-4 py-3 text-center text-xs font-semibold tabular-nums text-admin-text">
                  {{ store.users_count }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <SuperAdminIconButton :icon="viewIcon" :to="`/super-admin/stores/${store.id}`" ariaLabel="Manage store" tooltip="Manage store" variant="soft" />
                    <SuperAdminIconButton :icon="editIcon" :to="`/super-admin/stores/${store.id}`" ariaLabel="Edit store" tooltip="Edit store" variant="ghost" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <ul class="divide-y divide-admin-border md:hidden">
          <li v-for="store in stores" :key="store.id" class="p-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <p class="flex items-center gap-1.5 truncate font-semibold text-admin-text">{{ store.name }}<span v-if="store.is_default" class="rounded bg-admin-accent-soft px-1 py-0.5 text-[10px] font-bold uppercase text-admin-accent">default</span></p>
                <p class="truncate font-mono text-xs text-admin-muted">{{ store.slug }}</p>
                <p class="mt-1 truncate font-mono text-xs text-admin-text">{{ store.domain || 'No custom domain' }}</p>
              </div>
              <span class="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold capitalize" :class="store.status === 'active' ? 'bg-admin-success-soft text-admin-success' : 'bg-admin-soft text-admin-muted'">{{ store.status }}</span>
            </div>
            <div class="mt-3 flex items-center gap-2 text-xs text-admin-muted">
              <span class="rounded-md bg-admin-soft px-2 py-1 font-medium text-admin-text">{{ store.users_count }} admins</span>
              <span class="rounded-md px-2 py-1 text-[11px] font-semibold" :class="accessStateClass(store.subscription_status)">{{ accessStateLabel(store.subscription_status) }}</span>
              <span v-if="store.domain" class="rounded-md px-2 py-1 text-[11px] font-bold uppercase" :class="store.domain_verified ? 'bg-admin-success-soft text-admin-success' : 'bg-amber-50 text-amber-700'">{{ store.domain_verified ? 'verified' : 'unverified' }}</span>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <AdminButton :to="`/super-admin/stores/${store.id}`" variant="secondary" block>
                <template #icon><Icon name="heroicons:pencil-square" class="h-4 w-4" aria-hidden="true" /></template>
                Manage
              </AdminButton>
              <AdminButton :to="`/super-admin/stores/${store.id}`" variant="secondary" block>View</AdminButton>
            </div>
          </li>
        </ul>
      </template>

      <SuperAdminPagination
        v-if="!initialLoading"
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
const status = ref('')
const subscriptionStatus = ref('')
const domainStatus = ref('')
const pagination = ref({ current_page: 1, last_page: 1, total: 0 })
const appliedCriteria = ref({ search: '', status: '', subscriptionStatus: '', domainStatus: '' })

const storeStatusOptions = [
  { value: '', label: 'All store statuses', icon: 'heroicons:squares-2x2' },
  { value: 'active', label: 'Active stores', icon: 'heroicons:check-circle' },
  { value: 'inactive', label: 'Inactive stores', icon: 'heroicons:pause-circle' },
]

const subscriptionStatusOptions = [
  { value: '', label: 'All access states', icon: 'heroicons:key' },
  { value: 'active', label: 'Active subscription', icon: 'heroicons:check-badge' },
  { value: 'comped', label: 'Comped access', icon: 'heroicons:gift' },
  { value: 'pending', label: 'Pending subscription', icon: 'heroicons:clock' },
  { value: 'unsubscribed', label: 'Unsubscribed', icon: 'heroicons:no-symbol' },
  { value: 'cancelled', label: 'Cancelled', icon: 'heroicons:x-circle' },
  { value: 'expired', label: 'Expired', icon: 'heroicons:calendar-days' },
]

const domainStatusOptions = [
  { value: '', label: 'All domain states', icon: 'heroicons:globe-alt' },
  { value: 'verified', label: 'Verified domain', icon: 'heroicons:shield-check' },
  { value: 'unverified', label: 'Needs verification', icon: 'heroicons:exclamation-triangle' },
  { value: 'none', label: 'No custom domain', icon: 'heroicons:link-slash' },
]

const initialLoading = computed(() => loading.value && stores.value.length === 0)
const hasCriteria = computed(() => Boolean(search.value.trim() || status.value || subscriptionStatus.value || domainStatus.value))
const hasAppliedCriteria = computed(() => Object.values(appliedCriteria.value).some(Boolean))

const viewIcon = 'heroicons:eye'
const editIcon = 'heroicons:pencil-square'

const accessStateLabel = (value: Store['subscription_status']) => ({
  active: 'Subscribed',
  comped: 'Comped',
  pending: 'Pending',
  unsubscribed: 'Unsubscribed',
  cancelled: 'Cancelled',
  expired: 'Expired',
})[value]

const accessStateClass = (value: Store['subscription_status']) => {
  if (value === 'active' || value === 'comped') return 'bg-admin-success-soft text-admin-success'
  if (value === 'pending') return 'bg-admin-warning-soft text-admin-warning'
  return 'bg-admin-soft text-admin-muted'
}

const refresh = async (page = 1) => {
  loading.value = true
  error.value = null
  try {
    const result = await api.listStores({
      page,
      per_page: 25,
      search: search.value.trim() || undefined,
      status: status.value || undefined,
      subscription_status: subscriptionStatus.value || undefined,
      domain_status: domainStatus.value || undefined,
    })
    stores.value = result.data
    pagination.value = {
      current_page: result.current_page,
      last_page: result.last_page,
      total: result.total,
    }
    appliedCriteria.value = {
      search: search.value.trim(),
      status: status.value,
      subscriptionStatus: subscriptionStatus.value,
      domainStatus: domainStatus.value,
    }
  } catch (err: any) {
    error.value = err?.data?.message || 'Stores could not be loaded. Check your connection and try again.'
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  search.value = ''
  status.value = ''
  subscriptionStatus.value = ''
  domainStatus.value = ''
  void refresh(1)
}

onMounted(() => refresh())
</script>

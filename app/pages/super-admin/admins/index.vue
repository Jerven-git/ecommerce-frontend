<template>
  <div class="space-y-4">
    <header class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div class="inline-flex items-center gap-2 text-xs font-medium text-admin-muted">
          <NuxtLink to="/super-admin" class="hover:text-admin-text">Dashboard</NuxtLink>
          <span class="text-admin-border">/</span>
          <span class="font-semibold text-admin-text">Admins</span>
        </div>
        <h1 class="mt-1.5 text-[22px] font-bold tracking-tight text-admin-text">Admin users</h1>
        <p class="mt-1 max-w-2xl text-sm leading-relaxed text-admin-muted">Manage platform access, tenant assignments, and impersonation. Super admins operate across all stores.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span class="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-xs font-medium text-admin-muted">
          <span class="h-2 w-2 rounded-full bg-admin-accent" /> {{ pagination.total.toLocaleString() }} total
        </span>
        <AdminButton to="/super-admin/admins/new" variant="primary">
          <template #icon><Icon name="heroicons:plus" class="h-4 w-4" aria-hidden="true" /></template>
          New admin
        </AdminButton>
      </div>
    </header>

    <section class="overflow-hidden rounded-xl border border-admin-border bg-admin-surface" aria-labelledby="admins-heading">
      <div class="border-b border-admin-border p-3 sm:px-4">
        <form class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" role="search" @submit.prevent="refresh(1)">
          <div class="min-w-0 flex-1 sm:max-w-sm">
            <label id="admins-heading" for="admin-search" class="sr-only">Search admins</label>
            <div class="relative">
              <input id="admin-search" v-model="search" type="search" class="admin-input rounded-lg pl-10 pr-11" placeholder="Search admins…" />
              <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-admin-muted">
                <Icon name="heroicons:magnifying-glass" class="h-4 w-4" aria-hidden="true" />
              </span>
              <button v-if="search" type="button" class="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-admin-muted hover:text-admin-text" aria-label="Clear search" title="Clear search" @click="search=''; refresh(1)">
                <Icon name="heroicons:x-mark" class="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <button type="submit" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-admin-border bg-admin-surface px-2.5 text-xs font-semibold text-admin-text hover:bg-admin-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent disabled:opacity-50" :disabled="loading">
            <Icon :name="loading ? 'heroicons:arrow-path' : 'heroicons:magnifying-glass'" class="h-4 w-4" :class="loading ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" />
            Search
          </button>
        </form>
      </div>

      <div v-if="loading" class="px-6 py-12 text-center">
        <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-admin-border border-t-admin-accent" />
        <p class="mt-3 text-sm font-medium text-admin-muted" role="status" aria-live="polite">Loading admin users…</p>
      </div>
      <SuperAdminErrorState v-else-if="error" :message="error" @retry="refresh(pagination.current_page)" />
      <AdminEmptyState v-else-if="admins.length === 0" title="No admins found" description="Try a different search, or create a new administrator.">
        <template #action><AdminButton to="/super-admin/admins/new" variant="primary">New admin</AdminButton></template>
      </AdminEmptyState>

      <template v-else>
        <div class="hidden overflow-x-auto md:block">
          <table class="w-full min-w-[760px] text-sm">
            <caption class="sr-only">Admin users matching the current search</caption>
            <thead class="border-b border-admin-border bg-admin-soft/35">
              <tr class="text-left text-xs font-semibold text-admin-text">
                <th scope="col" class="px-4 py-3">Admin</th>
                <th scope="col" class="px-4 py-3">Role</th>
                <th scope="col" class="px-4 py-3">Store</th>
                <th scope="col" class="px-4 py-3">Status</th>
                <th scope="col" class="px-4 py-3 text-right"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-admin-border">
              <tr v-for="admin in admins" :key="admin.id" class="transition-colors hover:bg-admin-soft/45">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-admin-soft text-[10px] font-bold text-admin-text">{{ initials(admin.name) }}</span>
                    <div class="min-w-0">
                      <p class="truncate font-semibold text-admin-text">{{ admin.name }}</p>
                      <p class="truncate text-xs text-admin-muted">{{ admin.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold" :class="admin.is_super_admin ? 'bg-admin-accent-soft text-admin-accent' : 'bg-admin-info-soft text-admin-info'">
                    <Icon :name="admin.is_super_admin ? 'heroicons:shield-check' : 'heroicons:user'" class="h-3.5 w-3.5" aria-hidden="true" />
                    {{ admin.is_super_admin ? 'super admin' : 'admin' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="admin.store" class="inline-flex items-center gap-1.5 text-xs font-medium text-admin-text">
                    <Icon name="heroicons:building-storefront" class="h-3 w-3" aria-hidden="true" />
                    {{ admin.store.name }}
                  </span>
                  <span v-else class="text-xs text-admin-muted">All stores</span>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold capitalize" :class="admin.status === 'active' ? 'bg-admin-success-soft text-admin-success' : 'bg-admin-soft text-admin-muted'">
                    <span class="h-1.5 w-1.5 rounded-full" :class="admin.status === 'active' ? 'bg-admin-success' : 'bg-admin-muted'" /> {{ admin.status }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <SuperAdminIconButton
                      v-if="!admin.is_super_admin && admin.status === 'active'"
                      :icon="impersonation.transitionTargetId === admin.id ? loadingIcon : impersonateIcon"
                      :ariaLabel="impersonation.transitionTargetId === admin.id ? `Opening ${admin.name}'s workspace` : 'Impersonate admin'"
                      :tooltip="impersonation.transitionTargetId === admin.id ? 'Preparing merchant workspace' : 'Impersonate — open their store as them'"
                      variant="soft"
                      :disabled="impersonation.transitioning"
                      @pointerenter="warmAdminRoute"
                      @focus="warmAdminRoute"
                      @touchstart.passive="warmAdminRoute"
                      @click="startImpersonation(admin)"
                    />
                    <SuperAdminIconButton :icon="editIcon" :to="`/super-admin/admins/${admin.id}`" ariaLabel="Edit admin" tooltip="Edit admin" variant="ghost" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul class="divide-y divide-admin-border md:hidden">
          <li v-for="admin in admins" :key="admin.id" class="p-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex gap-3 min-w-0">
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-admin-soft text-xs font-bold text-admin-text">{{ initials(admin.name) }}</span>
                <div class="min-w-0">
                  <p class="truncate font-semibold text-admin-text">{{ admin.name }}</p>
                  <p class="truncate font-mono text-xs text-admin-muted">{{ admin.email }}</p>
                </div>
              </div>
              <span class="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold capitalize" :class="admin.status === 'active' ? 'bg-admin-success-soft text-admin-success' : 'bg-admin-soft text-admin-muted'">{{ admin.status }}</span>
            </div>
            <div class="mt-3 flex flex-wrap gap-2 text-xs">
              <span class="rounded-md px-2.5 py-1 font-semibold" :class="admin.is_super_admin ? 'bg-admin-accent-soft text-admin-accent' : 'bg-admin-info-soft text-admin-info'">{{ admin.is_super_admin ? 'Super admin' : 'Admin' }}</span>
              <span class="rounded-md bg-admin-soft px-2.5 py-1 font-medium text-admin-text">{{ admin.store?.name ?? 'All stores' }}</span>
            </div>
            <div class="mt-4 grid gap-2" :class="!admin.is_super_admin && admin.status === 'active' ? 'grid-cols-2' : 'grid-cols-1'">
              <button v-if="!admin.is_super_admin && admin.status === 'active'" type="button" class="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-admin-surface px-2.5 text-xs font-medium text-admin-text hover:bg-admin-soft disabled:cursor-wait disabled:opacity-50" :disabled="impersonation.transitioning" @pointerenter="warmAdminRoute" @focus="warmAdminRoute" @touchstart.passive="warmAdminRoute" @click="startImpersonation(admin)">
                <Icon :name="impersonation.transitionTargetId === admin.id ? 'heroicons:arrow-path' : 'heroicons:arrow-right-end-on-rectangle'" class="h-4 w-4" :class="impersonation.transitionTargetId === admin.id ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" />
                {{ impersonation.transitionTargetId === admin.id ? 'Opening…' : 'Impersonate' }}
              </button>
              <AdminButton :to="`/super-admin/admins/${admin.id}`" variant="secondary" block>Edit admin</AdminButton>
            </div>
          </li>
        </ul>
      </template>

      <SuperAdminPagination :current-page="pagination.current_page" :last-page="pagination.last_page" :total="pagination.total" :loading="loading" label="Admin user pages" @change="refresh" />
    </section>
  </div>
</template>

<script setup lang="ts">
import type { AdminUser } from '~/composables/useSuperAdminApi'

const api = useSuperAdminApi()
const impersonation = useImpersonationStore()
const router = useRouter()
const { toastError } = useAdminToast()

const admins = ref<AdminUser[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')
const pagination = ref({ current_page: 1, last_page: 1, total: 0 })

const initials = (name: string) => name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()

const editIcon = 'heroicons:pencil-square'
const impersonateIcon = 'heroicons:arrow-right-end-on-rectangle'
const loadingIcon = 'heroicons:arrow-path'
let adminRoutePreload: Promise<void> | null = null
let optimisticPreloadTimer: ReturnType<typeof setTimeout> | undefined

const warmAdminRoute = () => {
  if (!import.meta.client) return Promise.resolve()
  if (!adminRoutePreload) {
    adminRoutePreload = preloadRouteComponents('/admin').catch(() => {
      adminRoutePreload = null
    })
  }
  return adminRoutePreload
}

const refresh = async (page = 1) => {
  loading.value = true
  error.value = null
  try {
    const result = await api.listAdmins({ page, per_page: 25, search: search.value.trim() || undefined })
    admins.value = result.data
    pagination.value = { current_page: result.current_page, last_page: result.last_page, total: result.total }
  } catch (err: any) {
    error.value = err?.data?.message || 'Admin users could not be loaded. Check your connection and try again.'
  } finally { loading.value = false }
}

const startImpersonation = async (admin: AdminUser) => {
  if (impersonation.transitioning) return

  try {
    const transitionStartedAt = Date.now()
    const startRequest = impersonation.start(admin.id, {
      name: admin.name,
      email: admin.email,
      store: admin.store,
    })
    const preloadRequest = warmAdminRoute()

    await Promise.all([startRequest, preloadRequest])
    const remainingDisplayTime = Math.max(0, 480 - (Date.now() - transitionStartedAt))
    if (remainingDisplayTime) {
      await new Promise(resolve => setTimeout(resolve, remainingDisplayTime))
    }
    await router.push('/admin')
    await nextTick()

    if (import.meta.client) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    }
    impersonation.finishTransition()
  } catch (err: any) {
    impersonation.finishTransition()
    toastError(err?.data?.message || 'Impersonation could not be started.')
  }
}

onMounted(() => {
  refresh()
  optimisticPreloadTimer = setTimeout(() => { void warmAdminRoute() }, 600)
})
onBeforeUnmount(() => clearTimeout(optimisticPreloadTimer))
</script>

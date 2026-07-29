<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-admin-text">Stores</h1>
        <p class="mt-1 max-w-2xl text-sm text-admin-muted">Manage every tenant, its domain readiness, and assigned administrators.</p>
      </div>
      <AdminButton to="/super-admin/admins/new" variant="primary" class="self-start">
        <template #icon>
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
          </svg>
        </template>
        New admin + store
      </AdminButton>
    </header>

    <div class="rounded-xl border border-admin-accent bg-admin-accent-soft px-4 py-3 text-sm text-admin-accent-strong">
      Stores are provisioned when a new admin is created.
      <NuxtLink to="/super-admin/admins/new" class="inline-flex min-h-11 items-center font-semibold underline">Open that flow</NuxtLink>.
    </div>

    <section class="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface" aria-labelledby="stores-heading">
      <div class="border-b border-admin-border p-4 sm:px-6">
        <form class="flex flex-col gap-3 sm:flex-row sm:items-end" role="search" @submit.prevent="refresh(1)">
          <div class="min-w-0 flex-1">
            <label id="stores-heading" for="store-search" class="mb-1.5 block text-sm font-medium text-admin-text">Search stores</label>
            <input
              id="store-search"
              v-model="search"
              type="search"
              class="admin-input"
              placeholder="Name, slug, or domain"
            />
          </div>
          <AdminButton type="submit" variant="secondary" :loading="loading">Search</AdminButton>
        </form>
      </div>

      <div v-if="loading" class="px-6 py-12 text-center text-sm text-admin-muted" role="status" aria-live="polite">
        Loading stores…
      </div>
      <SuperAdminErrorState v-else-if="error" :message="error" @retry="refresh(pagination.current_page)" />
      <AdminEmptyState
        v-else-if="stores.length === 0"
        title="No stores found"
        description="Try a different search, or create an admin and provision their store."
      />

      <template v-else>
        <div class="hidden overflow-x-auto md:block">
          <table class="w-full min-w-[760px] text-sm">
            <caption class="sr-only">Stores matching the current search</caption>
            <thead class="border-b border-admin-border bg-admin-soft">
              <tr class="text-left text-xs uppercase tracking-wide text-admin-muted">
                <th scope="col" class="px-6 py-3">Name</th>
                <th scope="col" class="px-6 py-3">Domain</th>
                <th scope="col" class="px-6 py-3">Status</th>
                <th scope="col" class="px-6 py-3">Admins</th>
                <th scope="col" class="px-6 py-3"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-admin-border">
              <tr v-for="store in stores" :key="store.id" class="hover:bg-admin-soft">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-admin-text">{{ store.name }}</span>
                    <span v-if="store.is_default" class="rounded bg-admin-accent-soft px-2 py-0.5 text-[10px] font-medium uppercase text-admin-accent-strong">default</span>
                  </div>
                  <div class="mt-0.5 font-mono text-xs text-admin-muted">{{ store.slug }}</div>
                </td>
                <td class="px-6 py-4">
                  <div v-if="store.domain" class="flex items-center gap-2">
                    <span class="font-mono text-xs text-admin-text">{{ store.domain }}</span>
                    <span v-if="!store.domain_verified" class="rounded bg-admin-warning-soft px-1.5 py-0.5 text-[10px] font-medium uppercase text-admin-warning">unverified</span>
                  </div>
                  <span v-else class="text-xs text-admin-muted">No custom domain</span>
                </td>
                <td class="px-6 py-4">
                  <span class="rounded px-2 py-0.5 text-xs font-medium" :class="statusClass(store.status)">{{ store.status }}</span>
                </td>
                <td class="px-6 py-4 text-admin-muted">{{ store.users_count }}</td>
                <td class="px-6 py-4 text-right">
                  <NuxtLink
                    :to="`/super-admin/stores/${store.id}`"
                    class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-admin-muted hover:bg-admin-accent-soft hover:text-admin-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent"
                    :aria-label="`Edit ${store.name}`"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul class="divide-y divide-admin-border md:hidden">
          <li v-for="store in stores" :key="store.id" class="p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-semibold text-admin-text">{{ store.name }}</p>
                <p class="mt-0.5 truncate font-mono text-xs text-admin-muted">{{ store.slug }}</p>
              </div>
              <span class="shrink-0 rounded px-2 py-0.5 text-xs font-medium" :class="statusClass(store.status)">{{ store.status }}</span>
            </div>
            <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt class="text-xs text-admin-muted">Domain</dt>
                <dd class="mt-0.5 break-all text-admin-text">{{ store.domain || 'Not configured' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-admin-muted">Admins</dt>
                <dd class="mt-0.5 text-admin-text">{{ store.users_count }}</dd>
              </div>
            </dl>
            <AdminButton :to="`/super-admin/stores/${store.id}`" variant="secondary" block class="mt-4">Edit store</AdminButton>
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

const statusClass = (status: Store['status']) =>
  status === 'active'
    ? 'bg-admin-success-soft text-admin-success'
    : 'bg-admin-soft text-admin-muted'

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

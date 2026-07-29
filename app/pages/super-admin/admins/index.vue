<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-admin-text">Admin users</h1>
        <p class="mt-1 max-w-2xl text-sm text-admin-muted">Manage platform access, tenant assignments, account state, and impersonation.</p>
      </div>
      <AdminButton to="/super-admin/admins/new" variant="primary" class="self-start">
        <template #icon>
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
          </svg>
        </template>
        New admin
      </AdminButton>
    </header>

    <section class="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface" aria-labelledby="admins-heading">
      <div class="border-b border-admin-border p-4 sm:px-6">
        <form class="flex flex-col gap-3 sm:flex-row sm:items-end" role="search" @submit.prevent="refresh(1)">
          <div class="min-w-0 flex-1">
            <label id="admins-heading" for="admin-search" class="mb-1.5 block text-sm font-medium text-admin-text">Search admins</label>
            <input id="admin-search" v-model="search" type="search" class="admin-input" placeholder="Name or email" />
          </div>
          <AdminButton type="submit" variant="secondary" :loading="loading">Search</AdminButton>
        </form>
      </div>

      <div v-if="loading" class="px-6 py-12 text-center text-sm text-admin-muted" role="status" aria-live="polite">
        Loading admin users…
      </div>
      <SuperAdminErrorState v-else-if="error" :message="error" @retry="refresh(pagination.current_page)" />
      <AdminEmptyState
        v-else-if="admins.length === 0"
        title="No admins found"
        description="Try a different search, or create a new administrator."
      />

      <template v-else>
        <div class="hidden overflow-x-auto md:block">
          <table class="w-full min-w-[860px] text-sm">
            <caption class="sr-only">Admin users matching the current search</caption>
            <thead class="border-b border-admin-border bg-admin-soft">
              <tr class="text-left text-xs uppercase tracking-wide text-admin-muted">
                <th scope="col" class="px-6 py-3">Name</th>
                <th scope="col" class="px-6 py-3">Email</th>
                <th scope="col" class="px-6 py-3">Role</th>
                <th scope="col" class="px-6 py-3">Store</th>
                <th scope="col" class="px-6 py-3">Status</th>
                <th scope="col" class="px-6 py-3"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-admin-border">
              <tr v-for="admin in admins" :key="admin.id" class="hover:bg-admin-soft">
                <td class="px-6 py-4 font-medium text-admin-text">{{ admin.name }}</td>
                <td class="px-6 py-4 text-admin-muted">{{ admin.email }}</td>
                <td class="px-6 py-4">
                  <span class="rounded px-2 py-0.5 text-xs font-medium" :class="roleClass(admin)">
                    {{ admin.is_super_admin ? 'super admin' : 'admin' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-admin-muted">{{ admin.store?.name ?? 'All stores' }}</td>
                <td class="px-6 py-4">
                  <span class="rounded px-2 py-0.5 text-xs font-medium" :class="statusClass(admin.status)">{{ admin.status }}</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      v-if="!admin.is_super_admin && admin.status === 'active'"
                      type="button"
                      class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-admin-muted hover:bg-admin-warning-soft hover:text-admin-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent disabled:opacity-50"
                      :disabled="impersonation.loading"
                      :aria-label="`Impersonate ${admin.name}`"
                      @click="startImpersonation(admin.id)"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                      </svg>
                    </button>
                    <NuxtLink
                      :to="`/super-admin/admins/${admin.id}`"
                      class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-admin-muted hover:bg-admin-accent-soft hover:text-admin-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent"
                      :aria-label="`Edit ${admin.name}`"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </NuxtLink>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul class="divide-y divide-admin-border md:hidden">
          <li v-for="admin in admins" :key="admin.id" class="p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-semibold text-admin-text">{{ admin.name }}</p>
                <p class="mt-0.5 truncate text-sm text-admin-muted">{{ admin.email }}</p>
              </div>
              <span class="shrink-0 rounded px-2 py-0.5 text-xs font-medium" :class="statusClass(admin.status)">{{ admin.status }}</span>
            </div>
            <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt class="text-xs text-admin-muted">Role</dt>
                <dd class="mt-0.5 text-admin-text">{{ admin.is_super_admin ? 'Super admin' : 'Admin' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-admin-muted">Store</dt>
                <dd class="mt-0.5 truncate text-admin-text">{{ admin.store?.name ?? 'All stores' }}</dd>
              </div>
            </dl>
            <div class="mt-4 grid gap-2" :class="!admin.is_super_admin && admin.status === 'active' ? 'grid-cols-2' : 'grid-cols-1'">
              <AdminButton
                v-if="!admin.is_super_admin && admin.status === 'active'"
                variant="secondary"
                :disabled="impersonation.loading"
                @click="startImpersonation(admin.id)"
              >
                Impersonate
              </AdminButton>
              <AdminButton :to="`/super-admin/admins/${admin.id}`" variant="secondary">Edit admin</AdminButton>
            </div>
          </li>
        </ul>
      </template>

      <SuperAdminPagination
        :current-page="pagination.current_page"
        :last-page="pagination.last_page"
        :total="pagination.total"
        :loading="loading"
        label="Admin user pages"
        @change="refresh"
      />
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

const roleClass = (admin: AdminUser) =>
  admin.is_super_admin
    ? 'bg-admin-accent-soft text-admin-accent-strong'
    : 'bg-admin-info-soft text-admin-info'

const statusClass = (status: AdminUser['status']) =>
  status === 'active'
    ? 'bg-admin-success-soft text-admin-success'
    : 'bg-admin-soft text-admin-muted'

const refresh = async (page = 1) => {
  loading.value = true
  error.value = null
  try {
    const result = await api.listAdmins({
      page,
      per_page: 25,
      search: search.value.trim() || undefined,
    })
    admins.value = result.data
    pagination.value = {
      current_page: result.current_page,
      last_page: result.last_page,
      total: result.total,
    }
  } catch (err: any) {
    error.value = err?.data?.message || 'Admin users could not be loaded. Check your connection and try again.'
  } finally {
    loading.value = false
  }
}

const startImpersonation = async (userId: number) => {
  try {
    await impersonation.start(userId)
    router.push('/admin')
  } catch (err: any) {
    toastError(err?.data?.message || 'Impersonation could not be started.')
  }
}

onMounted(() => refresh())
</script>

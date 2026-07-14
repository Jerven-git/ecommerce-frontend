<template>
  <div class="pb-28 space-y-6">
    <AdminPageHeader title="Admin Users" subtitle="Create and manage admin and super admin accounts.">
      <template #breadcrumb>
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
          <span>/</span>
          <span class="text-gray-600 font-medium">Admin Users</span>
        </div>
      </template>
      <template #actions>
        <button
          v-if="isEditing"
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          @click="resetForm"
        >
          New Admin
        </button>
      </template>
    </AdminPageHeader>

    <div class="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <section class="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden h-fit">
        <div class="px-6 py-5 border-b border-gray-200/70">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4a4 4 0 110 8 4 4 0 010-8zm-7 16a7 7 0 1114 0H5z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900">{{ isEditing ? 'Edit admin account' : 'Create admin account' }}</p>
              <p class="text-xs text-gray-500">{{ isEditing ? 'Update details or change role.' : 'Super admins can create admin access without seeders.' }}</p>
            </div>
          </div>
        </div>

        <form class="p-6 space-y-4" @submit.prevent="submitForm">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              placeholder="Jane Admin"
              :disabled="saving"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              placeholder="admin@example.com"
              :disabled="saving"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select
              v-model="form.role"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              :disabled="saving"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              {{ isEditing ? 'New password' : 'Password' }}
            </label>
            <input
              v-model="form.password"
              type="password"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              :placeholder="isEditing ? 'Leave blank to keep current password' : 'Minimum 8 characters'"
              :disabled="saving"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
            <input
              v-model="form.password_confirmation"
              type="password"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              placeholder="Repeat password"
              :disabled="saving"
            />
          </div>

          <div v-if="formError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ formError }}
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button
              type="submit"
              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60"
              :disabled="saving"
            >
              <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{{ isEditing ? 'Save changes' : 'Create admin' }}</span>
            </button>
            <button
              v-if="isEditing"
              type="button"
              class="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              :disabled="saving"
              @click="resetForm"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>

      <section class="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden min-w-0">
        <div class="px-6 py-5 border-b border-gray-200/70 flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-gray-900">Current admin accounts</p>
            <p class="text-xs text-gray-500">{{ users.length }} account{{ users.length === 1 ? '' : 's' }}</p>
          </div>
          <button
            type="button"
            class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            :disabled="loading"
            @click="fetchUsers"
          >
            Refresh
          </button>
        </div>

        <AdminSpinner v-if="loading" label="Loading admin users…" />

        <div v-else-if="loadError" class="p-6">
          <div class="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            {{ loadError }}
          </div>
        </div>

        <AdminEmptyState
          v-else-if="!users.length"
          title="No admin accounts found."
          description="Create the first one from the form on the left."
          :icon="'M12 4a4 4 0 110 8 4 4 0 010-8zm-7 16a7 7 0 1114 0H5z'"
        />

        <div v-else class="divide-y divide-gray-100">
          <article
            v-for="user in users"
            :key="user.id"
            class="px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div class="min-w-0">
              <div class="flex items-center gap-3 flex-wrap">
                <p class="text-sm font-semibold text-gray-900">{{ user.name }}</p>
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  :class="user.role === 'super_admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'"
                >
                  {{ user.role === 'super_admin' ? 'Super Admin' : 'Admin' }}
                </span>
                <span
                  v-if="authStore.user?.id === user.id"
                  class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600"
                >
                  You
                </span>
              </div>
              <p class="text-sm text-gray-500 mt-1 break-all">{{ user.email }}</p>
              <p class="text-xs text-gray-500 mt-2">Created {{ formatDate(user.created_at) }}</p>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                @click="startEdit(user)"
              >
                Edit
              </button>
              <button
                type="button"
                class="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                :disabled="authStore.user?.id === user.id || deleting"
                @click="deleteTarget = user"
              >
                Delete
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>

    <ConfirmDeleteModal
      :open="!!deleteTarget"
      :deleting="deleting"
      title="Delete Admin Account"
      :message="deleteMessage"
      @cancel="deleteTarget = null"
      @confirm="confirmDelete"
    />

    <AdminToast />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'super-admin'],
})

interface AdminUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'super_admin'
  roles: string[]
  is_admin: boolean
  is_super_admin: boolean
  created_at?: string
}

interface AdminUserResponse {
  data: AdminUser[]
}

const { $apiFetch } = useNuxtApp()
const authStore = useAuthStore()
const { showToast } = useAdminToast()

const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const loadError = ref<string | null>(null)
const formError = ref<string | null>(null)
const users = ref<AdminUser[]>([])
const editingId = ref<number | null>(null)
const deleteTarget = ref<AdminUser | null>(null)

const form = reactive({
  name: '',
  email: '',
  role: 'admin' as 'admin' | 'super_admin',
  password: '',
  password_confirmation: '',
})

const isEditing = computed(() => editingId.value !== null)

const deleteMessage = computed(() => {
  if (!deleteTarget.value) return ''
  return `Are you sure you want to delete ${deleteTarget.value.name}? This admin will lose access immediately.`
})

async function fetchUsers() {
  loading.value = true
  loadError.value = null

  try {
    const response = await $apiFetch<AdminUserResponse>('/admin/users')
    users.value = response.data
  } catch (error: any) {
    loadError.value = error?.data?.message || 'Failed to load admin users.'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  editingId.value = null
  formError.value = null
  form.name = ''
  form.email = ''
  form.role = 'admin'
  form.password = ''
  form.password_confirmation = ''
}

function startEdit(user: AdminUser) {
  editingId.value = user.id
  formError.value = null
  form.name = user.name
  form.email = user.email
  form.role = user.role
  form.password = ''
  form.password_confirmation = ''
}

async function submitForm() {
  saving.value = true
  formError.value = null

  try {
    const body: Record<string, string> = {
      name: form.name,
      email: form.email,
      role: form.role,
    }

    if (!isEditing.value || form.password) {
      body.password = form.password
      body.password_confirmation = form.password_confirmation
    }

    if (isEditing.value) {
      await $apiFetch(`/admin/users/${editingId.value}`, {
        method: 'PATCH',
        body,
      })
      showToast('Admin account updated successfully.')
    } else {
      await $apiFetch('/admin/users', {
        method: 'POST',
        body,
      })
      showToast('Admin account created successfully.')
    }

    await fetchUsers()
    resetForm()
    await authStore.checkAuth()
  } catch (error: any) {
    formError.value = error?.data?.message || 'Failed to save admin account.'
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return

  deleting.value = true

  try {
    await $apiFetch(`/admin/users/${deleteTarget.value.id}`, {
      method: 'DELETE',
    })
    showToast('Admin account deleted successfully.')
    deleteTarget.value = null
    await fetchUsers()
  } catch (error: any) {
    showToast(error?.data?.message || 'Failed to delete admin account.', 'error')
  } finally {
    deleting.value = false
  }
}

function formatDate(value?: string) {
  if (!value) return 'recently'

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

onMounted(fetchUsers)
</script>

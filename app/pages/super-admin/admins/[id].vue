<template>
  <div class="space-y-6 max-w-2xl">
    <div class="flex items-center gap-2 text-sm text-gray-400">
      <NuxtLink to="/super-admin/admins" class="hover:text-gray-600">Admins</NuxtLink>
      <span>/</span>
      <span class="text-gray-600 font-medium">{{ isNew ? 'New admin' : (admin?.email ?? 'Loading…') }}</span>
    </div>

    <h1 class="text-2xl font-bold text-gray-900">{{ isNew ? 'Create admin' : 'Edit admin' }}</h1>
    <p v-if="isNew" class="text-sm text-gray-500">
      An admin belongs to a store — assign them to an existing one or provision a new store. Super admins do not get a store.
    </p>

    <div v-if="loading && !isNew" class="text-sm text-gray-400">Loading…</div>

    <form v-else class="bg-white border border-gray-100 rounded-2xl p-6 space-y-4" @submit.prevent="save">
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
          <input v-model="form.name" type="text" required class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input v-model="form.email" type="email" required class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
        </div>
      </div>

      <div v-if="isNew">
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
        <select v-model="form.role" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
          <option value="admin">Admin (manages a single store)</option>
          <option value="super_admin">Super admin (platform operator, no store)</option>
        </select>
      </div>
      <div v-else>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
        <div class="px-3 py-2 text-sm border border-gray-100 rounded-xl bg-gray-50 text-gray-600">
          {{ form.role === 'super_admin' ? 'Super admin' : 'Admin' }}
        </div>
        <p class="text-xs text-gray-400 mt-1">Role is fixed at creation. To change it, delete this account and create a new one.</p>
      </div>

      <div v-if="isNew && form.role === 'admin'" class="space-y-4 bg-purple-50/40 border border-purple-100 rounded-xl p-4">
        <div>
          <p class="text-xs font-semibold text-purple-800 uppercase tracking-wide">Store</p>
          <p class="text-xs text-purple-700/70 mt-0.5">Assign this admin to an existing store, or provision a new one.</p>
        </div>
        <div class="flex flex-wrap gap-4 text-sm">
          <label class="inline-flex items-center gap-2">
            <input v-model="storeMode" type="radio" value="existing" /> Existing store
          </label>
          <label class="inline-flex items-center gap-2">
            <input v-model="storeMode" type="radio" value="new" /> New store
          </label>
        </div>
        <div v-if="storeMode === 'existing'">
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Store</label>
          <select v-model.number="form.store_id" required class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
            <option :value="null" disabled>Select a store…</option>
            <option v-for="s in stores" :key="s.id" :value="s.id">{{ s.name }} ({{ s.slug }})</option>
          </select>
        </div>
        <div v-else class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Store name</label>
            <input v-model="form.store_name" type="text" required class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Store slug (optional)</label>
            <input v-model="form.store_slug" type="text" pattern="[a-z0-9-]+" placeholder="auto-generated" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
          </div>
        </div>
      </div>

      <div v-if="!isNew && form.role === 'admin'">
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Store</label>
        <select v-model.number="form.store_id" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
          <option v-for="s in stores" :key="s.id" :value="s.id">{{ s.name }} ({{ s.slug }})</option>
        </select>
        <p class="text-xs text-gray-400 mt-1">
          Reassigning moves this admin to another store. A store keeps working as long as it has at least one admin.
          <NuxtLink v-if="admin?.store" :to="`/super-admin/stores/${admin.store.id}`" class="text-purple-700 hover:underline">Edit current store →</NuxtLink>
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ isNew ? 'Password' : 'New password' }}</label>
          <input v-model="form.password" type="password" :required="isNew" minlength="8" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
          <input v-model="form.password_confirmation" type="password" :required="!!form.password" minlength="8" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
        </div>
      </div>

      <div v-if="!isNew">
        <label class="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            :checked="form.status === 'disabled'"
            @change="form.status = ($event.target as HTMLInputElement).checked ? 'disabled' : 'active'"
          />
          <span>Account disabled</span>
        </label>
        <p class="text-xs text-gray-400 mt-1">Disabled users can't log in and existing sessions are rejected.</p>
      </div>

      <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>

      <div class="flex items-center justify-between pt-2">
        <AdminButton type="submit" variant="primary" :loading="saving">
          {{ isNew ? 'Create admin' : 'Save' }}
        </AdminButton>
        <AdminButton
          v-if="!isNew"
          variant="danger"
          :loading="deleting"
          @click="del"
        >
          Delete admin
        </AdminButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const api = useSuperAdminApi()
const { toastSuccess, toastError } = useAdminToast()

const isNew = computed(() => route.params.id === 'new')
const id = computed(() => Number(route.params.id))

const admin = ref<AdminUser | null>(null)
const stores = ref<Store[]>([])
const storeMode = ref<'existing' | 'new'>('existing')
const loading = ref(!isNew.value)
const saving = ref(false)
const deleting = ref(false)
const saveError = ref<string | null>(null)

const form = ref({
  name: '',
  email: '',
  role: 'admin' as 'admin' | 'super_admin',
  store_id: null as number | null,
  store_name: '',
  store_slug: '',
  password: '',
  password_confirmation: '',
  status: 'active' as 'active' | 'disabled',
})

onMounted(async () => {
  // Stores are needed both to pick an existing store on create and to reassign
  // on edit. Default to "new store" only when none exist yet.
  try {
    const storesResult = await api.listStores()
    stores.value = storesResult.data
  } catch {
    stores.value = []
  }

  if (isNew.value) {
    const preselect = Number(route.query.store_id)
    if (preselect && stores.value.some((s) => s.id === preselect)) {
      storeMode.value = 'existing'
      form.value.store_id = preselect
    } else if (stores.value.length === 0) {
      storeMode.value = 'new'
    }
    return
  }

  try {
    const adminsResult = await api.listAdmins()
    const found = adminsResult.data.find((a) => a.id === id.value) ?? null
    admin.value = found
    if (found) {
      form.value.name = found.name
      form.value.email = found.email
      form.value.role = found.role
      form.value.status = found.status
      form.value.store_id = found.store?.id ?? null
    }
  } finally {
    loading.value = false
  }
})

const save = async () => {
  saving.value = true
  saveError.value = null
  try {
    if (isNew.value) {
      const payload: Record<string, unknown> = {
        name: form.value.name,
        email: form.value.email,
        role: form.value.role,
        password: form.value.password,
        password_confirmation: form.value.password_confirmation,
      }
      if (form.value.role === 'admin') {
        if (storeMode.value === 'existing') {
          payload.store_id = form.value.store_id
        } else {
          payload.store_name = form.value.store_name
          if (form.value.store_slug) payload.store_slug = form.value.store_slug
        }
      }
      const result = await api.createAdmin(payload as never)
      // Toasts are a module-level singleton and survive the SPA navigation, so
      // the confirmation shows on the admin's edit page we land on next.
      toastSuccess('Admin created')
      router.push(`/super-admin/admins/${result.data.id}`)
    } else {
      const payload: Record<string, unknown> = {
        name: form.value.name,
        email: form.value.email,
        status: form.value.status,
      }
      // Reassign store when it changed (admins only; super admins have none).
      if (form.value.role === 'admin' && form.value.store_id && form.value.store_id !== (admin.value?.store?.id ?? null)) {
        payload.store_id = form.value.store_id
      }
      if (form.value.password) {
        payload.password = form.value.password
        payload.password_confirmation = form.value.password_confirmation
      }
      await api.updateAdmin(id.value, payload as never)
      toastSuccess('Admin saved')
    }
  } catch (err: any) {
    const msg = err?.data?.message || 'Failed to save'
    saveError.value = msg
    toastError(msg)
  } finally {
    saving.value = false
  }
}

const del = async () => {
  if (!confirm('Delete this admin? If they are the last admin of their store, the store is also soft-deleted (recoverable). Stores with other admins are kept.')) return
  deleting.value = true
  try {
    await api.deleteAdmin(id.value)
    toastSuccess('Admin deleted')
    router.push('/super-admin/admins')
  } catch (err: any) {
    const msg = err?.data?.message || 'Failed to delete'
    saveError.value = msg
    toastError(msg)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6 max-w-2xl">
    <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-sm text-admin-muted">
      <NuxtLink to="/super-admin/admins" class="inline-flex min-h-11 items-center hover:text-admin-text">Admins</NuxtLink>
      <span aria-hidden="true">/</span>
      <span class="font-medium text-admin-text">{{ isNew ? 'New admin' : (admin?.email ?? 'Loading…') }}</span>
    </nav>

    <h1 class="text-2xl font-bold text-admin-text">{{ isNew ? 'Create admin' : 'Edit admin' }}</h1>
    <p v-if="isNew" class="text-sm text-admin-muted">
      An admin belongs to a store — assign them to an existing one or provision a new store. Super admins do not get a store.
    </p>

    <div v-if="loading && !isNew" class="text-sm text-admin-muted" role="status" aria-live="polite">Loading admin…</div>
    <SuperAdminErrorState v-else-if="loadError" :message="loadError" @retry="loadAdmin" />

    <form v-else class="space-y-4 rounded-2xl border border-admin-border bg-admin-surface p-4 sm:p-6" :aria-describedby="saveError ? 'admin-save-error' : undefined" @submit.prevent="save">
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label for="admin-name" class="mb-1.5 block text-sm font-medium text-admin-text">Name</label>
          <input id="admin-name" v-model="form.name" type="text" required maxlength="255" class="admin-input" />
        </div>
        <div>
          <label for="admin-email" class="mb-1.5 block text-sm font-medium text-admin-text">Email</label>
          <input id="admin-email" v-model="form.email" type="email" required maxlength="255" autocomplete="email" class="admin-input" />
        </div>
      </div>

      <div v-if="isNew">
        <label for="admin-role" class="mb-1.5 block text-sm font-medium text-admin-text">Role</label>
        <select id="admin-role" v-model="form.role" class="admin-input">
          <option value="admin">Admin (manages a single store)</option>
          <option value="super_admin">Super admin (platform operator, no store)</option>
        </select>
      </div>
      <div v-else>
        <p class="mb-1.5 block text-sm font-medium text-admin-text">Role</p>
        <div class="rounded-xl border border-admin-border bg-admin-soft px-3 py-2 text-sm text-admin-muted">
          {{ form.role === 'super_admin' ? 'Super admin' : 'Admin' }}
        </div>
        <p class="mt-1 text-xs text-admin-muted">Role is fixed at creation. To change it, delete this account and create a new one.</p>
      </div>

      <fieldset v-if="isNew && form.role === 'admin'" class="space-y-4 rounded-xl border border-admin-accent bg-admin-accent-soft p-4">
        <legend class="text-xs font-semibold uppercase tracking-wide text-admin-accent-strong">Store assignment</legend>
        <div>
          <p class="mt-0.5 text-xs text-admin-accent-strong">Assign this admin to an existing store, or provision a new one.</p>
        </div>
        <div class="flex flex-wrap gap-4 text-sm">
          <label class="inline-flex min-h-11 items-center gap-2">
            <input v-model="storeMode" type="radio" value="existing" /> Existing store
          </label>
          <label class="inline-flex min-h-11 items-center gap-2">
            <input v-model="storeMode" type="radio" value="new" /> New store
          </label>
        </div>
        <SuperAdminStorePicker v-if="storeMode === 'existing'" id="admin-store" v-model="form.store_id" required />
        <div v-else class="grid gap-4 md:grid-cols-2">
          <div>
            <label for="new-store-name" class="mb-1.5 block text-sm font-medium text-admin-text">Store name</label>
            <input id="new-store-name" v-model="form.store_name" type="text" required maxlength="255" class="admin-input" />
          </div>
          <div>
            <label for="new-store-slug" class="mb-1.5 block text-sm font-medium text-admin-text">Store slug (optional)</label>
            <input id="new-store-slug" v-model="form.store_slug" type="text" maxlength="255" pattern="[a-z0-9-]+" placeholder="auto-generated" class="admin-input font-mono" />
          </div>
        </div>
      </fieldset>

      <div v-if="!isNew && form.role === 'admin'">
        <SuperAdminStorePicker id="admin-store" v-model="form.store_id" required />
        <p class="mt-1 text-xs text-admin-muted">
          Reassigning moves this admin to another store. A store keeps working as long as it has at least one admin.
          <NuxtLink v-if="admin?.store" :to="`/super-admin/stores/${admin.store.id}`" class="inline-flex min-h-11 items-center text-admin-accent-strong hover:underline">Edit current store →</NuxtLink>
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label for="admin-password" class="mb-1.5 block text-sm font-medium text-admin-text">{{ isNew ? 'Password' : 'New password' }}</label>
          <input id="admin-password" v-model="form.password" type="password" :required="isNew" minlength="8" autocomplete="new-password" class="admin-input" />
        </div>
        <div>
          <label for="admin-password-confirmation" class="mb-1.5 block text-sm font-medium text-admin-text">Confirm password</label>
          <input id="admin-password-confirmation" v-model="form.password_confirmation" type="password" :required="!!form.password" minlength="8" autocomplete="new-password" class="admin-input" />
        </div>
      </div>

      <div v-if="!isNew">
        <label class="inline-flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            :checked="form.status === 'disabled'"
            @change="form.status = ($event.target as HTMLInputElement).checked ? 'disabled' : 'active'"
          />
          <span>Account disabled</span>
        </label>
        <p class="mt-1 text-xs text-admin-muted">Disabled users can't log in and existing sessions are rejected.</p>
      </div>

      <p v-if="saveError" id="admin-save-error" class="text-sm text-admin-danger" role="alert" tabindex="-1">{{ saveError }}</p>

      <div class="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
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
const storeMode = ref<'existing' | 'new'>('existing')
const loading = ref(!isNew.value)
const loadError = ref<string | null>(null)
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

const loadAdmin = async () => {
  loadError.value = null
  if (isNew.value) {
    const preselect = Number(route.query.store_id)
    if (preselect) {
      storeMode.value = 'existing'
      form.value.store_id = preselect
    }
    return
  }

  loading.value = true
  try {
    const found = (await api.showAdmin(id.value)).data
    admin.value = found
    form.value.name = found.name
    form.value.email = found.email
    form.value.role = found.role
    form.value.status = found.status
    form.value.store_id = found.store?.id ?? null
  } catch (err: any) {
    loadError.value = err?.data?.message || 'This admin could not be loaded.'
  } finally {
    loading.value = false
  }
}

onMounted(loadAdmin)

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
    await nextTick()
    document.getElementById('admin-save-error')?.focus()
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

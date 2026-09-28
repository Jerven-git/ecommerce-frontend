<template>
  <div class="mx-auto max-w-[720px] space-y-6">
    <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-sm text-admin-muted">
      <NuxtLink to="/super-admin/admins" class="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-transparent px-2 hover:bg-admin-soft hover:text-admin-text">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        Admins
      </NuxtLink>
      <span class="text-admin-border">/</span>
      <span class="truncate font-semibold text-admin-text">{{ isNew ? 'New admin' : (admin?.email ?? 'Loading…') }}</span>
    </nav>

    <div>
      <h1 class="text-[26px] font-bold tracking-tight text-admin-text">{{ isNew ? 'Create admin' : 'Edit admin' }}</h1>
      <p v-if="isNew" class="mt-1 max-w-2xl text-sm leading-relaxed text-admin-muted">An admin belongs to a store — assign them to an existing one or provision a new store. Super admins bypass store scoping and operate platform-wide.</p>
      <p v-else class="mt-1 text-sm text-admin-muted">Update account details, reassign store, or rotate credentials.</p>
    </div>

    <div v-if="loading && !isNew" class="rounded-2xl border border-admin-border bg-admin-surface p-10 text-center">
      <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-admin-border border-t-admin-accent" />
      <p class="mt-3 text-sm font-medium text-admin-muted" role="status" aria-live="polite">Loading admin…</p>
    </div>
    <SuperAdminErrorState v-else-if="loadError" :message="loadError" @retry="loadAdmin" />

    <form v-else class="rounded-2xl border border-admin-border bg-admin-surface shadow-sm" :aria-describedby="saveError ? 'admin-save-error' : undefined" @submit.prevent="save">
      <div class="border-b border-admin-border px-5 py-4 sm:px-6">
        <div class="flex items-center gap-2.5">
          <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-admin-accent-soft text-admin-accent">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </span>
          <div>
            <h2 class="text-sm font-semibold text-admin-text">Account</h2>
            <p class="text-xs text-admin-muted">Identity and role — role is immutable after creation.</p>
          </div>
        </div>
      </div>

      <div class="space-y-5 p-5 sm:p-6">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="admin-name" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-admin-muted">Name</label>
            <input id="admin-name" v-model="form.name" type="text" required maxlength="255" class="admin-input" placeholder="Ada Lovelace" />
          </div>
          <div>
            <label for="admin-email" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-admin-muted">Email</label>
            <div class="relative">
              <input id="admin-email" v-model="form.email" type="email" required maxlength="255" autocomplete="email" class="admin-input pl-9 font-mono text-sm" placeholder="ada@ssu.example" />
              <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-admin-muted">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </span>
            </div>
          </div>
        </div>

        <div v-if="isNew">
          <label for="admin-role" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-admin-muted">Role</label>
          <select id="admin-role" v-model="form.role" class="admin-input">
            <option value="admin">Admin — manages a single store</option>
            <option value="super_admin">Super admin — platform operator, no store</option>
          </select>
          <p class="mt-1.5 text-xs text-admin-muted">Choose carefully — this can’t be changed without recreating the account.</p>
        </div>
        <div v-else class="rounded-xl border border-admin-border bg-admin-soft/50 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-wider text-admin-muted">Role</p>
          <p class="mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold" :class="form.role === 'super_admin' ? 'border-admin-accent/20 bg-admin-accent-soft text-admin-accent' : 'border-admin-info/20 bg-admin-info-soft text-admin-info'">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="form.role === 'super_admin' ? 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' : 'M12 4a4 4 0 110 8 4 4 0 010-8zM5 20a7 7 0 0114 0H5z'" /></svg>
            {{ form.role === 'super_admin' ? 'Super admin' : 'Admin' }}
          </p>
          <p class="mt-2 text-xs text-admin-muted">Role is fixed at creation. To change it, delete this account and create a new one.</p>
        </div>

        <fieldset v-if="isNew && form.role === 'admin'" class="space-y-4 rounded-2xl border border-admin-accent/20 bg-admin-accent-soft/40 p-4 sm:p-5">
          <legend class="px-2 text-xs font-bold uppercase tracking-widest text-admin-accent-strong">Store assignment</legend>
          <p class="text-xs leading-relaxed text-admin-accent-strong/80">Assign this admin to an existing store, or provision a brand new tenant. New stores are created atomically with this admin.</p>
          <div class="flex gap-2 rounded-xl bg-admin-surface p-1 border border-admin-border w-fit">
            <button type="button" class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors" :class="storeMode === 'existing' ? 'bg-admin-accent text-admin-on-accent shadow-sm' : 'text-admin-muted hover:text-admin-text'" @click="storeMode='existing'">
              Existing store
            </button>
            <button type="button" class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors" :class="storeMode === 'new' ? 'bg-admin-accent text-admin-on-accent shadow-sm' : 'text-admin-muted hover:text-admin-text'" @click="storeMode='new'">
              New store
            </button>
          </div>
          <SuperAdminStorePicker v-if="storeMode === 'existing'" id="admin-store" v-model="form.store_id" required />
          <div v-else class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="new-store-name" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-admin-muted">Store name</label>
              <input id="new-store-name" v-model="form.store_name" type="text" required maxlength="255" class="admin-input" placeholder="Acme Atelier" />
            </div>
            <div>
              <label for="new-store-slug" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-admin-muted">Store slug <span class="normal-case font-normal">— optional</span></label>
              <input id="new-store-slug" v-model="form.store_slug" type="text" maxlength="255" pattern="[a-z0-9-]+" placeholder="auto-generated" class="admin-input font-mono" />
            </div>
          </div>
        </fieldset>

        <div v-if="!isNew && form.role === 'admin'" class="rounded-xl border border-admin-border bg-admin-soft/30 p-4">
          <SuperAdminStorePicker id="admin-store" v-model="form.store_id" required />
          <p class="mt-2 text-xs leading-relaxed text-admin-muted">
            Reassigning moves this admin to another store. A store keeps working as long as it has at least one admin.
            <NuxtLink v-if="admin?.store" :to="`/super-admin/stores/${admin.store.id}`" class="inline-flex items-center gap-1 font-semibold text-admin-accent hover:underline">Edit current store <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></NuxtLink>
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="admin-password" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-admin-muted">{{ isNew ? 'Password' : 'New password' }}</label>
            <input id="admin-password" v-model="form.password" type="password" :required="isNew" minlength="8" autocomplete="new-password" class="admin-input" placeholder="••••••••" />
            <p class="mt-1 text-[11px] text-admin-muted">Min 8 characters.</p>
          </div>
          <div>
            <label for="admin-password-confirmation" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-admin-muted">Confirm password</label>
            <input id="admin-password-confirmation" v-model="form.password_confirmation" type="password" :required="!!form.password" minlength="8" autocomplete="new-password" class="admin-input" placeholder="Repeat password" />
          </div>
        </div>

        <div v-if="!isNew" class="flex items-center justify-between rounded-xl border border-admin-border bg-admin-soft/30 px-4 py-3">
          <div>
            <p class="text-sm font-semibold text-admin-text">Account disabled</p>
            <p class="text-xs text-admin-muted">Disabled users can’t log in and active sessions are rejected.</p>
          </div>
          <label class="relative inline-flex h-6 w-11 cursor-pointer items-center">
            <input type="checkbox" class="peer sr-only" :checked="form.status === 'disabled'" @change="form.status = ($event.target as HTMLInputElement).checked ? 'disabled' : 'active'" />
            <span class="pointer-events-none absolute inset-0 rounded-full bg-admin-border transition-colors peer-checked:bg-admin-danger" />
            <span class="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </label>
        </div>

        <p v-if="saveError" id="admin-save-error" class="rounded-xl border border-admin-danger/20 bg-admin-danger-soft px-4 py-3 text-sm font-medium text-admin-danger" role="alert" tabindex="-1">{{ saveError }}</p>

        <div class="flex flex-col gap-2 border-t border-admin-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <AdminButton type="submit" variant="primary" :loading="saving">
            <template #icon><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg></template>
            {{ isNew ? 'Create admin' : 'Save changes' }}
          </AdminButton>
          <AdminButton v-if="!isNew" variant="danger" :loading="deleting" @click="del">
            <template #icon><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></template>
            Delete admin
          </AdminButton>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { AdminUser } from '~/composables/useSuperAdminApi'

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
  name: '', email: '', role: 'admin' as 'admin' | 'super_admin',
  store_id: null as number | null, store_name: '', store_slug: '',
  password: '', password_confirmation: '', status: 'active' as 'active' | 'disabled',
})

const loadAdmin = async () => {
  loadError.value = null
  if (isNew.value) {
    const preselect = Number(route.query.store_id)
    if (preselect) { storeMode.value = 'existing'; form.value.store_id = preselect }
    return
  }
  loading.value = true
  try {
    const found = (await api.showAdmin(id.value)).data
    admin.value = found
    form.value.name = found.name; form.value.email = found.email; form.value.role = found.role; form.value.status = found.status; form.value.store_id = found.store?.id ?? null
  } catch (err: any) { loadError.value = err?.data?.message || 'This admin could not be loaded.' }
  finally { loading.value = false }
}
onMounted(loadAdmin)

const save = async () => {
  saving.value = true; saveError.value = null
  try {
    if (isNew.value) {
      const payload: Record<string, unknown> = { name: form.value.name, email: form.value.email, role: form.value.role, password: form.value.password, password_confirmation: form.value.password_confirmation }
      if (form.value.role === 'admin') {
        if (storeMode.value === 'existing') payload.store_id = form.value.store_id
        else { payload.store_name = form.value.store_name; if (form.value.store_slug) payload.store_slug = form.value.store_slug }
      }
      const result = await api.createAdmin(payload as never)
      toastSuccess('Admin created'); router.push(`/super-admin/admins/${result.data.id}`)
    } else {
      const payload: Record<string, unknown> = { name: form.value.name, email: form.value.email, status: form.value.status }
      if (form.value.role === 'admin' && form.value.store_id && form.value.store_id !== (admin.value?.store?.id ?? null)) payload.store_id = form.value.store_id
      if (form.value.password) { payload.password = form.value.password; payload.password_confirmation = form.value.password_confirmation }
      await api.updateAdmin(id.value, payload as never); toastSuccess('Admin saved')
    }
  } catch (err: any) {
    const msg = err?.data?.message || 'Failed to save'
    saveError.value = msg; toastError(msg); await nextTick(); document.getElementById('admin-save-error')?.focus()
  } finally { saving.value = false }
}
const del = async () => {
  if (!confirm('Delete this admin? If they are the last admin of their store, the store is also soft-deleted (recoverable). Stores with other admins are kept.')) return
  deleting.value = true
  try { await api.deleteAdmin(id.value); toastSuccess('Admin deleted'); router.push('/super-admin/admins') }
  catch (err: any) { const msg = err?.data?.message || 'Failed to delete'; saveError.value = msg; toastError(msg) }
  finally { deleting.value = false }
}
</script>

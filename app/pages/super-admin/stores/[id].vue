<template>
  <div class="space-y-6 max-w-2xl">
    <div class="flex items-center gap-2 text-sm text-gray-400">
      <NuxtLink to="/super-admin/stores" class="hover:text-gray-600">Stores</NuxtLink>
      <span>/</span>
      <span class="text-gray-600 font-medium">{{ store?.name ?? 'Loading…' }}</span>
    </div>

    <h1 class="text-2xl font-bold text-gray-900">Edit store</h1>

    <div v-if="loading" class="text-sm text-gray-400">Loading…</div>
    <div v-else-if="!store" class="text-sm text-red-600">Store not found.</div>

    <form v-else class="bg-white border border-gray-100 rounded-2xl p-6 space-y-4" @submit.prevent="save">
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
          <input v-model="form.name" type="text" required class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
          <input v-model="form.slug" type="text" required pattern="[a-z0-9-]+" :disabled="store.is_default" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 disabled:bg-gray-50 disabled:text-gray-400" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Custom Domain</label>
        <p class="text-xs text-gray-400 mb-2">Point your domain's DNS A record to your server IP.</p>
        <input
          v-model="form.domain"
          type="text"
          placeholder="nazareck.com"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
        />
      </div>

      <div>
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" :checked="form.status === 'active'" :disabled="store.is_default && form.status === 'active'" @change="form.status = ($event.target as HTMLInputElement).checked ? 'active' : 'inactive'" />
          <span>Active</span>
        </label>
        <p v-if="store.is_default" class="text-xs text-gray-400 mt-1">The default store cannot be deactivated or deleted.</p>
      </div>

      <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>

      <div class="flex items-center justify-between pt-2">
        <button type="submit" :disabled="saving" class="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50">
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
        <button
          v-if="!store.is_default"
          type="button"
          :disabled="deleting || store.users_count > 0"
          class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          @click="del"
        >
          {{ store.users_count > 0 ? `Has ${store.users_count} admin${store.users_count === 1 ? '' : 's'}` : (deleting ? 'Deleting…' : 'Delete store') }}
        </button>
      </div>
    </form>

    <section v-if="store" class="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-gray-900">Admins</h2>
          <p class="text-sm text-gray-500 mt-0.5">Admins who manage this store. A store can have several.</p>
        </div>
        <NuxtLink
          :to="`/super-admin/admins/new?store_id=${store.id}`"
          class="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shrink-0"
        >
          Add admin
        </NuxtLink>
      </div>

      <p v-if="storeAdmins.length === 0" class="text-sm text-gray-400">No admins assigned to this store yet.</p>
      <ul v-else class="divide-y divide-gray-100">
        <li v-for="a in storeAdmins" :key="a.id" class="flex items-center justify-between gap-4 py-3">
          <div class="min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ a.name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ a.email }}</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span
              class="px-2 py-0.5 text-xs font-medium rounded"
              :class="a.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'"
            >
              {{ a.status }}
            </span>
            <NuxtLink :to="`/super-admin/admins/${a.id}`" class="text-purple-700 hover:underline text-sm">Edit</NuxtLink>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const api = useSuperAdminApi()

const id = Number(route.params.id)
const store = ref<Store | null>(null)
const storeAdmins = ref<AdminUser[]>([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const saveError = ref<string | null>(null)
const form = ref({ name: '', slug: '', domain: '' as string | null, status: 'active' as 'active' | 'inactive' })

onMounted(async () => {
  try {
    const [storeResult, adminsResult] = await Promise.all([api.showStore(id), api.listAdmins()])
    store.value = storeResult.data
    form.value = {
      name: storeResult.data.name,
      slug: storeResult.data.slug,
      domain: storeResult.data.domain ?? '',
      status: storeResult.data.status,
    }
    storeAdmins.value = adminsResult.data.filter((a) => a.store?.id === id)
  } finally {
    loading.value = false
  }
})

const save = async () => {
  saving.value = true
  saveError.value = null
  try {
    const payload = {
      ...form.value,
      domain: form.value.domain?.trim() || null,
    }
    const result = await api.updateStore(id, payload)
    store.value = result.data
    form.value.domain = result.data.domain ?? ''
  } catch (err: any) {
    saveError.value = err?.data?.message || 'Failed to save'
  } finally {
    saving.value = false
  }
}

const del = async () => {
  if (!confirm('Delete this store? Admins must be reassigned first.')) return
  deleting.value = true
  try {
    await api.deleteStore(id)
    router.push('/super-admin/stores')
  } catch (err: any) {
    saveError.value = err?.data?.message || 'Failed to delete'
  } finally {
    deleting.value = false
  }
}
</script>

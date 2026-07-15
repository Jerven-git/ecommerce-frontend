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
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <label class="block text-sm font-medium text-gray-700">Custom Domain</label>
          <span
            v-if="store.domain"
            class="px-2 py-0.5 text-xs font-medium rounded"
            :class="store.domain_verified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'"
          >
            {{ store.domain_verified ? 'Verified — live' : 'Not verified' }}
          </span>
        </div>

        <p class="text-xs text-gray-400 mb-2">
          Point an A record for this domain at
          <span v-if="expectedIps.length" class="font-mono text-gray-600">{{ expectedIps.join(' or ') }}</span>
          <span v-else>your server</span>, then verify it. A domain only serves traffic once verified.
        </p>

        <input
          v-model="form.domain"
          type="text"
          placeholder="nazareck.com"
          autocomplete="off"
          spellcheck="false"
          class="w-full px-3 py-2 text-sm border rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          :class="domainInputClass"
        />

        <p v-if="checking" class="mt-1.5 text-xs text-gray-400">Checking…</p>

        <template v-else-if="check">
          <p v-if="!check.valid || !check.available" class="mt-1.5 text-xs text-red-600">
            {{ check.reason }}
          </p>
          <p v-else-if="check.dns?.points_at_server" class="mt-1.5 text-xs text-green-700">
            Available, and DNS already points here. Save, then verify.
          </p>
          <p v-else-if="check.dns?.resolves" class="mt-1.5 text-xs text-amber-700">
            Available, but it currently resolves to
            <span class="font-mono">{{ check.dns.addresses.join(', ') }}</span>. Update its A record.
          </p>
          <p v-else class="mt-1.5 text-xs text-gray-400">
            Available. It doesn't resolve yet — DNS can take a while to propagate.
          </p>
        </template>

        <div v-if="store.domain" class="mt-3 flex items-center gap-3">
          <AdminButton
            variant="outline"
            size="sm"
            :loading="verifying"
            :disabled="domainDirty"
            @click="verifyDomain"
          >
            {{ store.domain_verified ? 'Re-check DNS' : 'Verify domain' }}
          </AdminButton>
          <p v-if="domainDirty" class="text-xs text-gray-400">Save your change before verifying.</p>
          <p v-else-if="verifyError" class="text-xs text-red-600">{{ verifyError }}</p>
          <p v-else-if="verifyMessage" class="text-xs text-green-700">{{ verifyMessage }}</p>
        </div>
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
        <AdminButton type="submit" variant="primary" :loading="saving">Save</AdminButton>
        <AdminButton
          v-if="!store.is_default"
          variant="danger"
          :loading="deleting"
          :disabled="store.users_count > 0"
          @click="del"
        >
          {{ store.users_count > 0 ? `Has ${store.users_count} admin${store.users_count === 1 ? '' : 's'}` : 'Delete store' }}
        </AdminButton>
      </div>
    </form>

    <section v-if="store" class="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-gray-900">Admins</h2>
          <p class="text-sm text-gray-500 mt-0.5">Admins who manage this store. A store can have several.</p>
        </div>
        <AdminButton :to="`/super-admin/admins/new?store_id=${store.id}`" variant="primary" class="shrink-0">
          <template #icon>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
            </svg>
          </template>
          Add admin
        </AdminButton>
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
            <NuxtLink
              :to="`/super-admin/admins/${a.id}`"
              class="inline-flex p-1.5 rounded-lg text-gray-400 transition-colors hover:text-purple-700 hover:bg-purple-50"
              title="Edit"
              aria-label="Edit admin"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </NuxtLink>
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
const { toastSuccess, toastError } = useAdminToast()

const id = Number(route.params.id)
const store = ref<Store | null>(null)
const storeAdmins = ref<AdminUser[]>([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const saveError = ref<string | null>(null)
const form = ref({ name: '', slug: '', domain: '' as string | null, status: 'active' as 'active' | 'inactive' })

const checking = ref(false)
const check = ref<DomainAvailability | null>(null)
const verifying = ref(false)
const verifyMessage = ref<string | null>(null)
const verifyError = ref<string | null>(null)

/** Normalise the way the API does, so "WWW.X.com" doesn't read as a pending edit. */
const canonical = (value: string | null | undefined) => {
  const domain = (value ?? '').trim().toLowerCase()
  return domain.startsWith('www.') ? domain.slice(4) : domain
}

/** Verification acts on the saved domain, so block it while an edit is pending. */
const domainDirty = computed(() => canonical(form.value.domain) !== canonical(store.value?.domain))

const expectedIps = computed(() => check.value?.expected_ips ?? [])

const domainInputClass = computed(() => {
  if (!form.value.domain?.trim() || checking.value || !check.value) {
    return 'border-gray-200 focus:border-purple-400'
  }
  return check.value.valid && check.value.available
    ? 'border-green-300 focus:border-green-400'
    : 'border-red-300 focus:border-red-400'
})

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
    if (form.value.domain) runCheck(form.value.domain)
  } finally {
    loading.value = false
  }
})

let checkTimer: ReturnType<typeof setTimeout> | undefined
let checkSeq = 0

const runCheck = async (domain: string) => {
  const seq = ++checkSeq
  checking.value = true
  try {
    const result = await api.checkDomain(domain, id)
    // Drop responses that a newer keystroke has already superseded.
    if (seq === checkSeq) check.value = result
  } catch {
    if (seq === checkSeq) check.value = null
  } finally {
    if (seq === checkSeq) checking.value = false
  }
}

watch(() => form.value.domain, (domain) => {
  clearTimeout(checkTimer)
  verifyMessage.value = null
  verifyError.value = null

  const trimmed = (domain ?? '').trim()
  if (!trimmed) {
    checkSeq++
    checking.value = false
    check.value = null
    return
  }

  checkTimer = setTimeout(() => runCheck(trimmed), 400)
})

onUnmounted(() => clearTimeout(checkTimer))

const verifyDomain = async () => {
  verifying.value = true
  verifyMessage.value = null
  verifyError.value = null
  try {
    const result = await api.verifyStoreDomain(id)
    verifyMessage.value = result.message
    if (store.value) {
      store.value.domain_verified = result.data.domain_verified
      store.value.domain_verified_at = result.data.domain_verified_at
    }
  } catch (err: any) {
    verifyError.value = err?.data?.message || 'Verification failed'
    // A DNS re-check that fails revokes verification server-side; mirror that.
    // Other 422s (no domain, verification unconfigured) leave it untouched.
    if (err?.data?.dns && store.value) {
      store.value.domain_verified = false
      store.value.domain_verified_at = null
    }
  } finally {
    verifying.value = false
  }
}

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
    toastSuccess('Store saved')
  } catch (err: any) {
    saveError.value = err?.data?.errors?.domain?.[0] || err?.data?.message || 'Failed to save'
    toastError('Couldn’t save the store')
  } finally {
    saving.value = false
  }
}

const del = async () => {
  if (!confirm('Delete this store? Admins must be reassigned first.')) return
  deleting.value = true
  try {
    await api.deleteStore(id)
    toastSuccess('Store deleted')
    router.push('/super-admin/stores')
  } catch (err: any) {
    toastError(err?.data?.message || 'Couldn’t delete the store')
  } finally {
    deleting.value = false
  }
}
</script>

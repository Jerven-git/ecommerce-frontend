<template>
  <div class="space-y-6 max-w-2xl">
    <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-sm text-admin-muted">
      <NuxtLink to="/super-admin/stores" class="inline-flex min-h-11 items-center hover:text-admin-text">Stores</NuxtLink>
      <span aria-hidden="true">/</span>
      <span class="font-medium text-admin-text">{{ store?.name ?? 'Loading…' }}</span>
    </nav>

    <h1 class="text-2xl font-bold text-admin-text">Edit store</h1>

    <div v-if="loading" class="text-sm text-admin-muted" role="status" aria-live="polite">Loading store…</div>
    <SuperAdminErrorState v-else-if="loadError" :message="loadError" @retry="loadStore" />
    <div v-else-if="!store" role="alert" class="text-sm text-admin-danger">Store not found.</div>

    <form v-else class="space-y-4 rounded-2xl border border-admin-border bg-admin-surface p-4 sm:p-6" :aria-describedby="saveError ? 'store-save-error' : undefined" @submit.prevent="save">
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label for="store-name" class="mb-1.5 block text-sm font-medium text-admin-text">Name</label>
          <input id="store-name" v-model="form.name" type="text" required maxlength="255" class="admin-input" />
        </div>
        <div>
          <label for="store-slug" class="mb-1.5 block text-sm font-medium text-admin-text">Slug</label>
          <input id="store-slug" v-model="form.slug" type="text" required maxlength="255" pattern="[a-z0-9-]+" :disabled="store.is_default" class="admin-input font-mono" />
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <label for="store-domain" class="block text-sm font-medium text-admin-text">Custom domain</label>
          <span
            v-if="store.domain"
            class="px-2 py-0.5 text-xs font-medium rounded"
            :class="store.domain_verified ? 'bg-admin-success-soft text-admin-success' : 'bg-admin-warning-soft text-admin-warning'"
          >
            {{ store.domain_verified ? 'Verified — live' : 'Not verified' }}
          </span>
        </div>

        <p id="store-domain-help" class="mb-2 text-xs text-admin-muted">
          Point an A record for this domain at
          <span v-if="expectedIps.length" class="font-mono text-admin-text">{{ expectedIps.join(' or ') }}</span>
          <span v-else>the public IP configured for SSU</span>, then verify it. A domain only serves traffic once verified.
        </p>

        <input
          id="store-domain"
          v-model="form.domain"
          type="text"
          placeholder="nazareck.com"
          autocomplete="off"
          spellcheck="false"
          class="admin-input font-mono"
          :class="domainInputClass"
          aria-describedby="store-domain-help store-domain-status"
          :aria-invalid="check && (!check.valid || !check.available) ? true : undefined"
        />

        <div id="store-domain-status" role="status" aria-live="polite" aria-atomic="true">
        <p v-if="checking" class="mt-1.5 text-xs text-admin-muted">Checking domain…</p>

        <template v-else-if="check">
          <p v-if="!check.valid || !check.available" class="mt-1.5 text-xs text-admin-danger">
            {{ check.reason }}
          </p>
          <p v-else-if="!domainVerifierConfigured" class="mt-1.5 text-xs text-admin-warning">
            The domain verifier has no server IP to compare against. Set <span class="font-mono">STOREFRONT_SERVER_IPS</span> on the backend, then check again.
          </p>
          <p v-else-if="check.dns?.points_at_server" class="mt-1.5 text-xs text-admin-success">
            Available, and DNS already points here. Save, then verify.
          </p>
          <p v-else-if="check.dns?.resolves" class="mt-1.5 text-xs text-admin-warning">
            Available, but it currently resolves to
            <span class="font-mono">{{ check.dns.addresses.join(', ') }}</span>. Update its A record.
          </p>
          <p v-else class="mt-1.5 text-xs text-admin-muted">
            Available. It doesn't resolve yet — DNS can take a while to propagate.
          </p>
        </template>
        </div>

        <div v-if="store.domain" class="mt-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <AdminButton
            variant="outline"
            size="sm"
            :loading="verifying"
            :disabled="domainDirty || !domainVerifierConfigured"
            @click="verifyDomain"
          >
            {{ store.domain_verified ? 'Re-check DNS' : 'Verify domain' }}
          </AdminButton>
          <div role="status" aria-live="polite">
            <p v-if="domainDirty" class="text-xs text-admin-muted">Save your change before verifying.</p>
            <p v-else-if="verifyError" class="text-xs text-admin-danger">{{ verifyError }}</p>
            <p v-else-if="verifyMessage" class="text-xs text-admin-success">{{ verifyMessage }}</p>
          </div>
        </div>
      </div>

      <div>
        <label class="inline-flex min-h-11 items-center gap-2 text-sm text-admin-text">
          <input type="checkbox" :checked="form.status === 'active'" :disabled="store.is_default && form.status === 'active'" @change="form.status = ($event.target as HTMLInputElement).checked ? 'active' : 'inactive'" />
          <span>Active</span>
        </label>
        <p v-if="store.is_default" class="mt-1 text-xs text-admin-muted">The default store cannot be deactivated or deleted.</p>
      </div>

      <p v-if="saveError" id="store-save-error" class="text-sm text-admin-danger" role="alert" tabindex="-1">{{ saveError }}</p>

      <div class="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
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

    <section v-if="store" class="space-y-4 rounded-2xl border border-admin-border bg-admin-surface p-4 sm:p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-bold text-admin-text">Subscription</h2>
          <p class="mt-0.5 text-sm text-admin-muted">Billing status and access for this store.</p>
        </div>
        <span
          class="px-2 py-0.5 text-xs font-medium rounded"
          :class="subscriptionBadgeClass"
        >
          {{ subscriptionLabel }}
        </span>
      </div>

      <dl class="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt class="text-xs text-admin-muted">Plan</dt>
          <dd class="mt-0.5 font-medium text-admin-text">{{ store.subscription_plan?.name ?? 'No plan' }}</dd>
        </div>
        <div>
          <dt class="text-xs text-admin-muted">Renews / expires</dt>
          <dd class="mt-0.5 font-medium text-admin-text">
            {{ store.subscription_expires_at ? formatDate(store.subscription_expires_at) : '—' }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-admin-muted">Subscribed</dt>
          <dd class="mt-0.5 font-medium text-admin-text">
            {{ store.subscribed_at ? formatDate(store.subscribed_at) : '—' }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-admin-muted">Price</dt>
          <dd class="mt-0.5 font-medium text-admin-text">
            {{ store.subscription_plan ? formatPrice(store.subscription_plan.price_cents) : '—' }}
          </dd>
        </div>
      </dl>

      <div v-if="!store.is_default" class="flex flex-col gap-2 border-t border-admin-border pt-3 sm:flex-row sm:items-center">
        <template v-if="store.subscription_status === 'comped'">
          <AdminButton variant="danger" size="sm" :loading="compMutating" @click="uncomp">
            Revoke comp
          </AdminButton>
          <p class="text-sm text-admin-muted">Removing the comp re-locks the store until the owner subscribes.</p>
        </template>
        <template v-else>
          <label class="sr-only" for="comp-plan">Plan to grant</label>
          <select
            id="comp-plan"
            v-model="compPlanId"
            class="admin-input w-auto text-sm"
          >
            <option :value="null">No plan</option>
            <option v-for="plan in compPlans" :key="plan.id" :value="plan.id">
              {{ plan.name }} — {{ formatPrice(plan.price_cents) }}/{{ plan.interval }}
            </option>
          </select>
          <AdminButton variant="primary" size="sm" :loading="compMutating" @click="comp">
            Comp — grant access
          </AdminButton>
        </template>
        <p v-if="compError" class="text-sm text-admin-danger" role="alert">{{ compError }}</p>
      </div>
      <p v-else class="border-t border-admin-border pt-3 text-sm text-admin-muted">
        The default store is always accessible.
      </p>
    </section>

    <section v-if="store" class="space-y-4 rounded-2xl border border-admin-border bg-admin-surface p-4 sm:p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-bold text-admin-text">Admins</h2>
          <p class="mt-0.5 text-sm text-admin-muted">Admins who manage this store. A store can have several.</p>
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

      <p v-if="storeAdmins.length === 0" class="text-sm text-admin-muted">No admins assigned to this store yet.</p>
      <ul v-else class="divide-y divide-admin-border">
        <li v-for="a in storeAdmins" :key="a.id" class="flex items-center justify-between gap-4 py-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-admin-text">{{ a.name }}</p>
            <p class="truncate text-xs text-admin-muted">{{ a.email }}</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span
              class="px-2 py-0.5 text-xs font-medium rounded"
              :class="a.status === 'active' ? 'bg-admin-success-soft text-admin-success' : 'bg-admin-soft text-admin-muted'"
            >
              {{ a.status }}
            </span>
            <NuxtLink
              :to="`/super-admin/admins/${a.id}`"
              class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-admin-muted transition-colors hover:bg-admin-accent-soft hover:text-admin-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent"
              :aria-label="`Edit ${a.name}`"
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
const { plans, fetchPlans } = useSubscription()
const { toastSuccess, toastError } = useAdminToast()

const id = Number(route.params.id)
const store = ref<Store | null>(null)
const storeAdmins = ref<AdminUser[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)
const saving = ref(false)
const deleting = ref(false)
const saveError = ref<string | null>(null)
const form = ref({ name: '', slug: '', domain: '' as string | null, status: 'active' as 'active' | 'inactive' })

const checking = ref(false)
const check = ref<DomainAvailability | null>(null)
const verifying = ref(false)
const verifyMessage = ref<string | null>(null)
const verifyError = ref<string | null>(null)

const compPlanId = ref<number | null>(null)
const compMutating = ref(false)
const compError = ref<string | null>(null)
const compPlans = computed(() => plans.value ?? [])

const subscriptionLabel = computed(() => {
  switch (store.value?.subscription_status) {
    case 'active': return 'Active'
    case 'comped': return 'Comp — free access'
    case 'cancelled': return 'Cancelled'
    case 'expired': return 'Expired'
    case 'pending': return 'Pending'
    default: return 'Unsubscribed'
  }
})

const subscriptionBadgeClass = computed(() => {
  switch (store.value?.subscription_status) {
    case 'active':
    case 'comped':
      return 'bg-admin-success-soft text-admin-success'
    case 'cancelled':
    case 'expired':
      return 'bg-admin-warning-soft text-admin-warning'
    default:
      return 'bg-admin-soft text-admin-muted'
  }
})

const formatDate = (iso: string) => new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}).format(new Date(iso))

const formatPrice = (cents: number) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(cents / 100)

/** Normalise the way the API does, so "WWW.X.com" doesn't read as a pending edit. */
const canonical = (value: string | null | undefined) => {
  const domain = (value ?? '').trim().toLowerCase()
  return domain.startsWith('www.') ? domain.slice(4) : domain
}

/** Verification acts on the saved domain, so block it while an edit is pending. */
const domainDirty = computed(() => canonical(form.value.domain) !== canonical(store.value?.domain))

const expectedIps = computed(() => check.value?.expected_ips ?? [])
const domainVerifierConfigured = computed(() => expectedIps.value.length > 0)

const domainInputClass = computed(() => {
  if (!form.value.domain?.trim() || checking.value || !check.value) {
    return 'border-admin-border focus:border-admin-accent'
  }
  if (!check.value.valid || !check.value.available) {
    return 'border-admin-danger focus:border-admin-danger'
  }
  return domainVerifierConfigured.value
    ? 'border-admin-success focus:border-admin-success'
    : 'border-admin-warning focus:border-admin-warning'
})

const loadStore = async () => {
  loading.value = true
  loadError.value = null
  try {
    const [storeResult, adminsResult] = await Promise.all([api.showStore(id), api.listStoreAdmins(id)])
    store.value = storeResult.data
    form.value = {
      name: storeResult.data.name,
      slug: storeResult.data.slug,
      domain: storeResult.data.domain ?? '',
      status: storeResult.data.status,
    }
    storeAdmins.value = adminsResult.data
    if (form.value.domain) runCheck(form.value.domain)
  } catch (err: any) {
    loadError.value = err?.data?.message || 'This store could not be loaded.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!plans.value) fetchPlans().catch(() => {})
  await loadStore()
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
    await nextTick()
    document.getElementById('store-save-error')?.focus()
  } finally {
    saving.value = false
  }
}

const comp = async () => {
  compMutating.value = true
  compError.value = null
  try {
    const result = await api.compStore(id, compPlanId.value ? { subscription_plan_id: compPlanId.value } : {})
    store.value = result.data
    toastSuccess('Store comped — access granted')
  } catch (err: any) {
    compError.value = err?.data?.message || 'Couldn’t comp this store'
    toastError('Couldn’t comp the store')
  } finally {
    compMutating.value = false
  }
}

const uncomp = async () => {
  if (!confirm('Revoke this comp? The store will be locked until it subscribes.')) return
  compMutating.value = true
  compError.value = null
  try {
    const result = await api.uncompStore(id)
    store.value = result.data
    toastSuccess('Comp revoked')
  } catch (err: any) {
    compError.value = err?.data?.message || 'Couldn’t revoke this comp'
    toastError('Couldn’t revoke the comp')
  } finally {
    compMutating.value = false
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

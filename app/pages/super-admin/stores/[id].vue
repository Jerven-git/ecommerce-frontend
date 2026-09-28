<template>
  <div class="mx-auto max-w-[880px] space-y-6">
    <!-- Breadcrumb + title -->
    <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-sm text-admin-muted">
      <NuxtLink to="/super-admin/stores" class="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-transparent px-2 hover:bg-admin-soft hover:text-admin-text">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        Stores
      </NuxtLink>
      <span class="text-admin-border">/</span>
      <span class="truncate font-semibold text-admin-text">{{ store?.name ?? 'Loading…' }}</span>
      <span v-if="store" class="hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-semibold" :class="store.status === 'active' ? 'border-admin-success/20 bg-admin-success-soft text-admin-success' : 'border-admin-border bg-admin-soft text-admin-muted'">
        <span class="h-1.5 w-1.5 rounded-full" :class="store.status === 'active' ? 'bg-admin-success' : 'bg-admin-muted'" /> {{ store.status }}
      </span>
    </nav>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-[26px] font-bold tracking-tight text-admin-text">Edit store</h1>
        <p class="mt-1 text-sm text-admin-muted">Update identity, domain, status, and subscription access. Changes are audited.</p>
      </div>
      <div v-if="store" class="flex items-center gap-2">
        <span class="rounded-xl border border-admin-border bg-admin-surface px-3 py-2 font-mono text-xs text-admin-muted">{{ store.slug }}</span>
        <span v-if="store.is_default" class="rounded-full bg-admin-accent-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-admin-accent">default store</span>
      </div>
    </div>

    <div v-if="loading" class="rounded-2xl border border-admin-border bg-admin-surface p-10 text-center">
      <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-admin-border border-t-admin-accent" />
      <p class="mt-3 text-sm font-medium text-admin-muted" role="status" aria-live="polite">Loading store…</p>
    </div>
    <SuperAdminErrorState v-else-if="loadError" :message="loadError" @retry="loadStore" />
    <div v-else-if="!store" role="alert" class="rounded-2xl border border-admin-danger/20 bg-admin-danger-soft p-6 text-sm text-admin-danger">Store not found.</div>

    <template v-else>
      <!-- Store form -->
      <form class="rounded-2xl border border-admin-border bg-admin-surface shadow-sm" :aria-describedby="saveError ? 'store-save-error' : undefined" @submit.prevent="save">
        <div class="border-b border-admin-border px-5 py-4 sm:px-6">
          <div class="flex items-center gap-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-admin-accent-soft text-admin-accent">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h6" /></svg>
            </span>
            <div>
              <h2 class="text-sm font-semibold text-admin-text">Identity</h2>
              <p class="text-xs text-admin-muted">Name is customer-facing; slug is the URL key and must stay unique.</p>
            </div>
          </div>
        </div>
        <div class="space-y-5 p-5 sm:p-6">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="store-name" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-admin-muted">Store name</label>
              <input id="store-name" v-model="form.name" type="text" required maxlength="255" class="admin-input" placeholder="e.g. Nazareck Atelier" />
            </div>
            <div>
              <label for="store-slug" class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-admin-muted">
                Slug
                <span v-if="store.is_default" class="rounded bg-admin-soft px-1.5 py-0.5 font-mono text-[10px] normal-case tracking-normal text-admin-muted">locked</span>
              </label>
              <input id="store-slug" v-model="form.slug" type="text" required maxlength="255" pattern="[a-z0-9-]+" :disabled="store.is_default" class="admin-input font-mono" placeholder="nazareck-atelier" />
              <p class="mt-1 text-[11px] text-admin-muted">Lowercase letters, numbers, hyphens only.</p>
            </div>
          </div>

          <div class="rounded-xl border border-admin-border bg-admin-soft/40 p-4">
            <div class="flex items-center justify-between gap-2">
              <label for="store-domain" class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-admin-muted">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c2.67 0 4.2-3.56 4.2-9S14.67 3 12 3m0 9H3" /></svg>
                Custom domain
              </label>
              <span v-if="store.domain" class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold" :class="store.domain_verified ? 'border-admin-success/20 bg-admin-success-soft text-admin-success' : 'border-amber-200 bg-amber-50 text-amber-700'">
                <span class="h-1.5 w-1.5 rounded-full" :class="store.domain_verified ? 'bg-admin-success' : 'bg-amber-500'" />
                {{ store.domain_verified ? 'Verified — live' : 'Not verified' }}
              </span>
            </div>

            <p id="store-domain-help" class="mt-2 text-xs leading-relaxed text-admin-muted">
              Point an A record at
              <span v-if="expectedIps.length" class="rounded bg-admin-surface px-1.5 py-0.5 font-mono text-admin-text border border-admin-border">{{ expectedIps.join(' or ') }}</span>
              <span v-else class="font-medium text-admin-text">the public IP configured for SSU</span>, then verify. A domain only serves traffic once verified.
            </p>

            <div class="relative mt-3">
              <input
                id="store-domain"
                v-model="form.domain"
                type="text"
                placeholder="nazareck.com"
                autocomplete="off"
                spellcheck="false"
                class="admin-input font-mono pl-9"
                :class="domainInputClass"
                aria-describedby="store-domain-help store-domain-status"
                :aria-invalid="check && (!check.valid || !check.available) ? true : undefined"
              />
              <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-admin-muted">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3" /></svg>
              </span>
            </div>

            <div id="store-domain-status" role="status" aria-live="polite" aria-atomic="true" class="min-h-[18px]">
              <p v-if="checking" class="mt-2 inline-flex items-center gap-1.5 text-xs text-admin-muted">
                <span class="h-3 w-3 animate-spin rounded-full border-2 border-admin-border border-t-admin-accent" /> Checking domain…
              </p>
              <template v-else-if="check">
                <p v-if="!check.valid || !check.available" class="mt-2 rounded-lg border border-admin-danger/20 bg-admin-danger-soft px-3 py-2 text-xs font-medium text-admin-danger">{{ check.reason }}</p>
                <p v-else-if="!domainVerifierConfigured" class="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">Verifier has no server IP to compare. Set <span class="font-mono font-semibold">STOREFRONT_SERVER_IPS</span> on the backend, then check again.</p>
                <p v-else-if="check.dns?.points_at_server" class="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-admin-success">
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Available — DNS already points here. Save, then verify.
                </p>
                <p v-else-if="check.dns?.resolves" class="mt-2 text-xs text-amber-700">Available, but resolves to <span class="font-mono font-medium">{{ check.dns.addresses.join(', ') }}</span>. Update its A record.</p>
                <p v-else class="mt-2 text-xs text-admin-muted">Available — no DNS yet. Propagation can take a while.</p>
              </template>
            </div>

            <div v-if="store.domain" class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <button type="button" class="inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent disabled:opacity-50" :class="domainDirty || !domainVerifierConfigured ? 'border-admin-border bg-admin-surface text-admin-muted' : 'border-admin-success/20 bg-admin-success-soft text-admin-success hover:bg-admin-success hover:text-white'" :disabled="domainDirty || !domainVerifierConfigured || verifying" @click="verifyDomain">
                <svg v-if="verifying" class="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                <svg v-else class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {{ store.domain_verified ? 'Re-check DNS' : 'Verify domain' }}
              </button>
              <div role="status" aria-live="polite" class="text-xs">
                <p v-if="domainDirty" class="text-admin-muted">Save your change before verifying.</p>
                <p v-else-if="verifyError" class="font-medium text-admin-danger">{{ verifyError }}</p>
                <p v-else-if="verifyMessage" class="font-medium text-admin-success">{{ verifyMessage }}</p>
              </div>
            </div>
          </div>

          <label class="flex items-center justify-between rounded-xl border border-admin-border bg-admin-soft/30 px-4 py-3">
            <span class="flex items-center gap-3">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-admin-surface border border-admin-border text-admin-muted">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </span>
              <span>
                <span class="block text-sm font-semibold text-admin-text">Store active</span>
                <span class="block text-xs text-admin-muted">Inactive stores are hidden from storefront and admin login.</span>
              </span>
            </span>
            <input type="checkbox" class="h-5 w-9 appearance-none rounded-full bg-admin-border p-0.5 transition-colors checked:bg-admin-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent [&:checked>span]:translate-x-4" :checked="form.status === 'active'" :disabled="store.is_default && form.status === 'active'" @change="form.status = ($event.target as HTMLInputElement).checked ? 'active' : 'inactive'" />
          </label>
          <p v-if="store.is_default" class="text-xs text-admin-muted">The default store cannot be deactivated or deleted.</p>

          <p v-if="saveError" id="store-save-error" class="rounded-xl border border-admin-danger/20 bg-admin-danger-soft px-4 py-3 text-sm font-medium text-admin-danger" role="alert" tabindex="-1">{{ saveError }}</p>

          <div class="flex flex-col gap-2 border-t border-admin-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <AdminButton type="submit" variant="primary" :loading="saving">
              <template #icon><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg></template>
              Save changes
            </AdminButton>
            <AdminButton v-if="!store.is_default" variant="danger" :loading="deleting" :disabled="store.users_count > 0" @click="del">
              <template #icon><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></template>
              {{ store.users_count > 0 ? `Has ${store.users_count} admin${store.users_count === 1 ? '' : 's'} — reassign first` : 'Delete store' }}
            </AdminButton>
          </div>
        </div>
      </form>

      <!-- Subscription -->
      <section class="rounded-2xl border border-admin-border bg-admin-surface shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border px-5 py-4 sm:px-6">
          <div class="flex items-center gap-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <div>
              <h2 class="text-sm font-semibold text-admin-text">Subscription</h2>
              <p class="text-xs text-admin-muted">Billing status and access for this store.</p>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold" :class="subscriptionBadgeClass">{{ subscriptionLabel }}</span>
        </div>
        <div class="p-5 sm:p-6">
          <dl class="grid gap-4 text-sm sm:grid-cols-2">
            <div class="rounded-xl bg-admin-soft/60 px-4 py-3">
              <dt class="text-xs font-semibold uppercase tracking-wider text-admin-muted">Plan</dt>
              <dd class="mt-1 font-semibold text-admin-text">{{ store.subscription_plan?.name ?? 'No plan' }}</dd>
            </div>
            <div class="rounded-xl bg-admin-soft/60 px-4 py-3">
              <dt class="text-xs font-semibold uppercase tracking-wider text-admin-muted">Renews / expires</dt>
              <dd class="mt-1 font-medium text-admin-text">{{ store.subscription_expires_at ? formatDate(store.subscription_expires_at) : '—' }}</dd>
            </div>
            <div class="rounded-xl bg-admin-soft/60 px-4 py-3">
              <dt class="text-xs font-semibold uppercase tracking-wider text-admin-muted">Subscribed</dt>
              <dd class="mt-1 font-medium text-admin-text">{{ store.subscribed_at ? formatDate(store.subscribed_at) : '—' }}</dd>
            </div>
            <div class="rounded-xl bg-admin-soft/60 px-4 py-3">
              <dt class="text-xs font-semibold uppercase tracking-wider text-admin-muted">Price</dt>
              <dd class="mt-1 font-medium text-admin-text">{{ store.subscription_plan ? formatPrice(store.subscription_plan.price_cents) : '—' }}</dd>
            </div>
          </dl>

          <div v-if="!store.is_default" class="mt-5 flex flex-col gap-3 rounded-xl border border-admin-border bg-admin-soft/30 p-4 sm:flex-row sm:items-center">
            <template v-if="store.subscription_status === 'comped'">
              <button type="button" class="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-admin-danger/20 bg-admin-danger-soft px-3 text-xs font-semibold text-admin-danger hover:bg-admin-danger hover:text-white disabled:opacity-50" :disabled="compMutating" @click="uncomp">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" /></svg>
                Revoke comp
              </button>
              <p class="text-xs leading-relaxed text-admin-muted">Removing the comp re-locks the store until the owner subscribes.</p>
            </template>
            <template v-else>
              <label class="sr-only" for="comp-plan">Plan to grant</label>
              <select id="comp-plan" v-model="compPlanId" class="admin-input w-auto text-sm">
                <option :value="null">No plan</option>
                <option v-for="plan in compPlans" :key="plan.id" :value="plan.id">{{ plan.name }} — {{ formatPrice(plan.price_cents) }}/{{ plan.interval }}</option>
              </select>
              <button type="button" class="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-admin-accent px-4 text-xs font-semibold text-admin-on-accent hover:bg-admin-accent-strong disabled:opacity-50" :disabled="compMutating" @click="comp">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1" /></svg>
                Comp — grant access
              </button>
            </template>
            <p v-if="compError" class="text-xs font-medium text-admin-danger" role="alert">{{ compError }}</p>
          </div>
          <p v-else class="mt-4 rounded-xl bg-admin-soft/60 px-4 py-3 text-sm text-admin-muted">The default store is always accessible.</p>
        </div>
      </section>

      <!-- Admins -->
      <section class="rounded-2xl border border-admin-border bg-admin-surface shadow-sm">
        <div class="flex flex-col gap-3 border-b border-admin-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div class="flex items-center gap-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-admin-info-soft text-admin-info border border-admin-info/15">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4a4 4 0 110 8 4 4 0 010-8zM5 20a7 7 0 0114 0H5z" /></svg>
            </span>
            <div>
              <h2 class="text-sm font-semibold text-admin-text">Admins</h2>
              <p class="text-xs text-admin-muted">{{ storeAdmins.length }} assigned · a store can have several</p>
            </div>
          </div>
          <AdminButton :to="`/super-admin/admins/new?store_id=${store.id}`" variant="primary" size="sm">
            <template #icon><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" /></svg></template>
            Add admin
          </AdminButton>
        </div>

        <div v-if="storeAdmins.length === 0" class="px-6 py-10 text-center">
          <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-admin-soft text-admin-muted">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4a4 4 0 110 8 4 4 0 010-8zM5 20a7 7 0 0114 0H5z" /></svg>
          </div>
          <p class="mt-2 text-sm font-medium text-admin-muted">No admins assigned to this store yet.</p>
          <NuxtLink :to="`/super-admin/admins/new?store_id=${store.id}`" class="mt-3 inline-flex min-h-9 items-center rounded-xl bg-admin-accent px-4 text-xs font-semibold text-admin-on-accent">Add first admin</NuxtLink>
        </div>
        <ul v-else class="divide-y divide-admin-border">
          <li v-for="a in storeAdmins" :key="a.id" class="flex items-center justify-between gap-4 px-5 py-3 sm:px-6 hover:bg-admin-soft/40 transition-colors">
            <div class="flex items-center gap-3 min-w-0">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-admin-soft text-xs font-bold text-admin-text">{{ a.name.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase() }}</span>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-admin-text">{{ a.name }}</p>
                <p class="truncate font-mono text-xs text-admin-muted">{{ a.email }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="hidden sm:inline-flex rounded-full border px-2 py-1 text-xs font-semibold" :class="a.status === 'active' ? 'border-admin-success/20 bg-admin-success-soft text-admin-success' : 'border-admin-border bg-admin-soft text-admin-muted'">{{ a.status }}</span>
              <SuperAdminIconButton :icon="editIcon" :to="`/super-admin/admins/${a.id}`" :aria-label="`Edit ${a.name}`" tooltip="Edit admin" variant="ghost" />
            </div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Store, AdminUser, DomainAvailability } from '~/composables/useSuperAdminApi'

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

const editIcon = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>'

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
    case 'comped': return 'border-admin-success/20 bg-admin-success-soft text-admin-success border'
    case 'cancelled':
    case 'expired': return 'border-amber-200 bg-amber-50 text-amber-700 border'
    default: return 'border-admin-border bg-admin-soft text-admin-muted border'
  }
})
const formatDate = (iso: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))
const formatPrice = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
const canonical = (value: string | null | undefined) => {
  const domain = (value ?? '').trim().toLowerCase()
  return domain.startsWith('www.') ? domain.slice(4) : domain
}
const domainDirty = computed(() => canonical(form.value.domain) !== canonical(store.value?.domain))
const expectedIps = computed(() => check.value?.expected_ips ?? [])
const domainVerifierConfigured = computed(() => expectedIps.value.length > 0)
const domainInputClass = computed(() => {
  if (!form.value.domain?.trim() || checking.value || !check.value) return 'border-admin-border focus:border-admin-accent'
  if (!check.value.valid || !check.value.available) return 'border-admin-danger focus:border-admin-danger'
  return domainVerifierConfigured.value ? 'border-admin-success focus:border-admin-success' : 'border-admin-warning focus:border-admin-warning'
})

const loadStore = async () => {
  loading.value = true
  loadError.value = null
  try {
    const [storeResult, adminsResult] = await Promise.all([api.showStore(id), api.listStoreAdmins(id)])
    store.value = storeResult.data
    form.value = { name: storeResult.data.name, slug: storeResult.data.slug, domain: storeResult.data.domain ?? '', status: storeResult.data.status }
    storeAdmins.value = adminsResult.data
    if (form.value.domain) runCheck(form.value.domain)
  } catch (err: any) { loadError.value = err?.data?.message || 'This store could not be loaded.' }
  finally { loading.value = false }
}
onMounted(async () => { if (!plans.value) fetchPlans().catch(() => {}); await loadStore() })
let checkTimer: ReturnType<typeof setTimeout> | undefined
let checkSeq = 0
const runCheck = async (domain: string) => {
  const seq = ++checkSeq
  checking.value = true
  try { const result = await api.checkDomain(domain, id); if (seq === checkSeq) check.value = result }
  catch { if (seq === checkSeq) check.value = null }
  finally { if (seq === checkSeq) checking.value = false }
}
watch(() => form.value.domain, (domain) => {
  clearTimeout(checkTimer)
  verifyMessage.value = null; verifyError.value = null
  const trimmed = (domain ?? '').trim()
  if (!trimmed) { checkSeq++; checking.value = false; check.value = null; return }
  checkTimer = setTimeout(() => runCheck(trimmed), 400)
})
onUnmounted(() => clearTimeout(checkTimer))
const verifyDomain = async () => {
  verifying.value = true; verifyMessage.value = null; verifyError.value = null
  try {
    const result = await api.verifyStoreDomain(id)
    verifyMessage.value = result.message
    if (store.value) { store.value.domain_verified = result.data.domain_verified; store.value.domain_verified_at = result.data.domain_verified_at }
  } catch (err: any) {
    verifyError.value = err?.data?.message || 'Verification failed'
    if (err?.data?.dns && store.value) { store.value.domain_verified = false; store.value.domain_verified_at = null }
  } finally { verifying.value = false }
}
const save = async () => {
  saving.value = true; saveError.value = null
  try {
    const payload = { ...form.value, domain: form.value.domain?.trim() || null }
    const result = await api.updateStore(id, payload)
    store.value = result.data; form.value.domain = result.data.domain ?? ''; toastSuccess('Store saved')
  } catch (err: any) {
    saveError.value = err?.data?.errors?.domain?.[0] || err?.data?.message || 'Failed to save'
    toastError('Couldn’t save the store'); await nextTick(); document.getElementById('store-save-error')?.focus()
  } finally { saving.value = false }
}
const comp = async () => {
  compMutating.value = true; compError.value = null
  try { const result = await api.compStore(id, compPlanId.value ? { subscription_plan_id: compPlanId.value } : {}); store.value = result.data; toastSuccess('Store comped — access granted') }
  catch (err: any) { compError.value = err?.data?.message || 'Couldn’t comp this store'; toastError('Couldn’t comp the store') }
  finally { compMutating.value = false }
}
const uncomp = async () => {
  if (!confirm('Revoke this comp? The store will be locked until it subscribes.')) return
  compMutating.value = true; compError.value = null
  try { const result = await api.uncompStore(id); store.value = result.data; toastSuccess('Comp revoked') }
  catch (err: any) { compError.value = err?.data?.message || 'Couldn’t revoke this comp'; toastError('Couldn’t revoke the comp') }
  finally { compMutating.value = false }
}
const del = async () => {
  if (!confirm('Delete this store? Admins must be reassigned first.')) return
  deleting.value = true
  try { await api.deleteStore(id); toastSuccess('Store deleted'); router.push('/super-admin/stores') }
  catch (err: any) { toastError(err?.data?.message || 'Couldn’t delete the store') }
  finally { deleting.value = false }
}
</script>

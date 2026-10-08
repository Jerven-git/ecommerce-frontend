<template>
  <div class="mx-auto max-w-[880px] space-y-4">
    <!-- Breadcrumb + title -->
    <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-sm text-admin-muted">
      <NuxtLink to="/super-admin/stores" class="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-transparent px-2 hover:bg-admin-soft hover:text-admin-text">
        <Icon name="heroicons:arrow-left" class="h-4 w-4" aria-hidden="true" />
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
        <h1 class="text-[22px] font-bold tracking-tight text-admin-text">Edit store</h1>
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
              <Icon name="heroicons:building-storefront" class="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 class="text-sm font-semibold text-admin-text">Identity</h2>
              <p class="text-xs text-admin-muted">Name is customer-facing; slug is the URL key and must stay unique.</p>
            </div>
          </div>
        </div>
        <div class="space-y-4 p-4 sm:p-5">
          <div class="grid gap-3 sm:grid-cols-2">
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

          <section class="overflow-hidden rounded-xl border border-admin-border bg-admin-soft/30" aria-labelledby="domain-setup-heading">
            <div class="flex flex-col gap-3 border-b border-admin-border bg-admin-surface px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex min-w-0 items-center gap-2.5">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-admin-accent-soft text-admin-accent"><Icon name="heroicons:globe-alt" class="h-4 w-4" aria-hidden="true" /></span>
                <div class="min-w-0">
                  <h3 id="domain-setup-heading" class="text-sm font-semibold text-admin-text">Custom domain setup</h3>
                  <p class="text-xs text-admin-muted">Connect, point DNS, then verify before traffic goes live.</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <a v-if="domainLiveUrl" :href="domainLiveUrl" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-admin-muted hover:bg-admin-soft hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent">Open site <Icon name="heroicons:arrow-up-right" class="h-3.5 w-3.5" aria-hidden="true" /></a>
                <span class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold" :class="domainStatusClass"><span class="h-1.5 w-1.5 rounded-full" :class="domainStatusDotClass" />{{ domainStatusLabel }}</span>
              </div>
            </div>

            <ol class="grid border-b border-admin-border bg-admin-surface sm:grid-cols-3" aria-label="Domain setup progress">
              <li v-for="step in domainSteps" :key="step.number" class="flex items-center gap-2.5 border-admin-border px-3 py-2.5 sm:border-r sm:last:border-r-0" :class="step.number < 3 ? 'border-b sm:border-b-0' : ''">
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold" :class="step.complete ? 'border-admin-success bg-admin-success text-white' : step.active ? 'border-admin-accent bg-admin-accent text-admin-on-accent' : 'border-admin-border bg-admin-soft text-admin-muted'">
                  <Icon v-if="step.complete" name="heroicons:check" class="h-3.5 w-3.5" aria-hidden="true" /><span v-else>{{ step.number }}</span>
                </span>
                <span class="min-w-0"><span class="block text-xs font-semibold" :class="step.active || step.complete ? 'text-admin-text' : 'text-admin-muted'">{{ step.label }}</span><span class="block truncate text-[10px] text-admin-muted">{{ step.detail }}</span></span>
              </li>
            </ol>

            <div class="space-y-4 p-3.5 sm:p-4">
              <div>
                <label for="store-domain" class="mb-1.5 block text-xs font-semibold text-admin-text">Domain name</label>
                <div class="flex flex-col gap-2 sm:flex-row">
                  <div class="relative min-w-0 flex-1">
                    <input id="store-domain" v-model="form.domain" type="text" inputmode="url" maxlength="253" placeholder="shop.example.com" autocomplete="off" autocapitalize="none" spellcheck="false" class="admin-input font-mono pl-9" :class="domainInputClass" aria-describedby="store-domain-help store-domain-status" :aria-invalid="check && (!check.valid || !check.available) ? true : undefined" />
                    <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-admin-muted"><Icon name="heroicons:link" class="h-4 w-4" aria-hidden="true" /></span>
                  </div>
                  <button v-if="form.domain" type="button" class="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-admin-surface px-3 text-xs font-semibold text-admin-text hover:bg-admin-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent disabled:opacity-50" :disabled="checking" @click="runCheck(form.domain || '')">
                    <Icon name="heroicons:arrow-path" class="h-4 w-4" :class="checking ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" /> Check DNS
                  </button>
                </div>
                <p id="store-domain-help" class="mt-1.5 text-[11px] leading-relaxed text-admin-muted">Enter only the hostname—no <span class="font-mono">https://</span>, paths, or trailing slash. Changes must be saved before verification.</p>
                <div id="store-domain-status" role="status" aria-live="polite" aria-atomic="true" class="min-h-[18px]">
                  <p v-if="checking" class="mt-2 inline-flex items-center gap-1.5 text-xs text-admin-muted"><span class="h-3 w-3 animate-spin rounded-full border-2 border-admin-border border-t-admin-accent" /> Checking availability and DNS…</p>
                  <p v-else-if="domainCheckError" class="mt-2 rounded-lg border border-admin-danger/20 bg-admin-danger-soft px-3 py-2 text-xs font-medium text-admin-danger">{{ domainCheckError }}</p>
                  <template v-else-if="check">
                    <p v-if="!check.valid || !check.available" class="mt-2 rounded-lg border border-admin-danger/20 bg-admin-danger-soft px-3 py-2 text-xs font-medium text-admin-danger">{{ check.reason }}</p>
                    <p v-else-if="!domainVerifierConfigured" class="mt-2 rounded-lg border border-admin-warning/20 bg-admin-warning-soft px-3 py-2 text-xs text-admin-warning">Domain checking is available, but verification needs <span class="font-mono font-semibold">STOREFRONT_SERVER_IPS</span> configured on the backend.</p>
                    <p v-else-if="check.dns?.points_at_server" class="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-admin-success"><Icon name="heroicons:check-circle" class="h-4 w-4" aria-hidden="true" /> DNS points to DATABASY.</p>
                    <p v-else-if="check.dns?.resolves" class="mt-2 text-xs text-admin-warning">Currently resolves to <span class="break-all font-mono font-medium">{{ check.dns.addresses.join(', ') }}</span>. Replace those A records with the values below.</p>
                    <p v-else class="mt-2 text-xs text-admin-muted">The domain is available, but no DNS record is visible yet. Add the A record below and allow time for propagation.</p>
                  </template>
                </div>
              </div>

              <div class="overflow-hidden rounded-lg border border-admin-border bg-admin-surface">
                <div class="flex items-center justify-between gap-3 border-b border-admin-border px-3 py-2.5">
                  <div><h4 class="text-xs font-semibold text-admin-text">Required DNS records</h4><p class="text-[11px] text-admin-muted">Add these at the domain’s DNS provider.</p></div>
                  <span v-if="check?.dns?.points_at_server" class="inline-flex items-center gap-1 text-[11px] font-semibold text-admin-success"><Icon name="heroicons:check-circle" class="h-4 w-4" aria-hidden="true" /> Detected</span>
                </div>
                <div v-if="expectedIps.length" class="divide-y divide-admin-border">
                  <div v-for="ip in expectedIps" :key="ip" class="grid items-center gap-2 px-3 py-2.5 sm:grid-cols-[4rem_1fr_auto]">
                    <div class="flex items-center gap-2 sm:contents"><span class="w-12 text-[10px] font-semibold uppercase tracking-wider text-admin-muted sm:w-auto">Type</span><span class="font-mono text-xs font-semibold text-admin-text sm:col-start-1 sm:row-start-2">A</span></div>
                    <div class="min-w-0 sm:col-start-2 sm:row-span-2 sm:row-start-1"><span class="block text-[10px] font-semibold uppercase tracking-wider text-admin-muted">Points to</span><span class="mt-0.5 block break-all font-mono text-xs font-semibold text-admin-text">{{ ip }}</span></div>
                    <button type="button" class="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold text-admin-muted hover:bg-admin-soft hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent sm:col-start-3 sm:row-span-2 sm:row-start-1" :aria-label="`Copy DNS destination ${ip}`" @click="copyDnsValue(ip)"><Icon :name="copiedDnsValue === ip ? 'heroicons:check' : 'heroicons:document-duplicate'" class="h-3.5 w-3.5" aria-hidden="true" />{{ copiedDnsValue === ip ? 'Copied' : 'Copy' }}</button>
                  </div>
                </div>
                <p v-else class="px-3 py-3 text-xs text-admin-muted">Enter a valid, available domain to load the server destination.</p>
              </div>

              <div class="flex flex-col gap-2 border-t border-admin-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div role="status" aria-live="polite" class="min-w-0 text-xs">
                  <p v-if="domainDirty" class="text-admin-muted">Save changes below, then verify the saved domain.</p>
                  <p v-else-if="verifyError" class="font-medium text-admin-danger">{{ verifyError }}</p>
                  <p v-else-if="verifyMessage" class="font-medium text-admin-success">{{ verifyMessage }}</p>
                  <p v-else-if="store.domain_verified_at" class="text-admin-muted">Last verified {{ formatDateTime(store.domain_verified_at) }}</p>
                  <p v-else class="text-admin-muted">Verification checks that DNS points to an approved DATABASY server.</p>
                </div>
                <button v-if="store.domain" type="button" class="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent disabled:cursor-not-allowed disabled:opacity-50" :class="domainDirty || !domainVerifierConfigured ? 'border-admin-border bg-admin-surface text-admin-muted' : 'border-admin-success/20 bg-admin-success-soft text-admin-success hover:bg-admin-success hover:text-white'" :disabled="domainDirty || !domainVerifierConfigured || verifying" @click="verifyDomain"><Icon :name="verifying ? 'heroicons:arrow-path' : 'heroicons:shield-check'" class="h-4 w-4" :class="verifying ? 'animate-spin motion-reduce:animate-none' : ''" aria-hidden="true" />{{ verifying ? 'Verifying…' : store.domain_verified ? 'Re-check verification' : 'Verify and activate' }}</button>
              </div>
            </div>
          </section>

          <label class="flex items-center justify-between rounded-xl border border-admin-border bg-admin-soft/30 px-3 py-2.5">
            <span class="flex items-center gap-3">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-admin-surface border border-admin-border text-admin-muted">
                <Icon name="heroicons:bolt" class="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <span class="block text-sm font-semibold text-admin-text">Store active</span>
                <span class="block text-xs text-admin-muted">Inactive stores are hidden from storefront and admin login.</span>
              </span>
            </span>
            <input type="checkbox" class="h-5 w-9 appearance-none rounded-full bg-admin-border p-0.5 transition-colors checked:bg-admin-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent [&:checked>span]:translate-x-4" :checked="form.status === 'active'" :disabled="store.is_default && form.status === 'active'" @change="form.status = ($event.target as HTMLInputElement).checked ? 'active' : 'inactive'" />
          </label>
          <p v-if="store.is_default" class="text-xs text-admin-muted">The default store cannot be deactivated or deleted.</p>

          <p v-if="saveError" id="store-save-error" class="rounded-xl border border-admin-danger/20 bg-admin-danger-soft px-3 py-2.5 text-xs font-medium text-admin-danger" role="alert" tabindex="-1">{{ saveError }}</p>

          <div class="flex flex-col gap-2 border-t border-admin-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <AdminButton type="submit" variant="primary" :loading="saving">
              <template #icon><Icon name="heroicons:check" class="h-4 w-4" aria-hidden="true" /></template>
              Save changes
            </AdminButton>
            <AdminButton v-if="!store.is_default" variant="danger" :loading="deleting" :disabled="store.users_count > 0" @click="del">
              <template #icon><Icon name="heroicons:trash" class="h-4 w-4" aria-hidden="true" /></template>
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
              <Icon name="heroicons:currency-dollar" class="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 class="text-sm font-semibold text-admin-text">Subscription</h2>
              <p class="text-xs text-admin-muted">Billing status and access for this store.</p>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold" :class="subscriptionBadgeClass">{{ subscriptionLabel }}</span>
        </div>
        <div class="p-4 sm:p-5">
          <dl class="grid gap-3 text-xs sm:grid-cols-2">
            <div class="rounded-xl bg-admin-soft/60 px-3 py-2.5">
              <dt class="text-xs font-semibold uppercase tracking-wider text-admin-muted">Plan</dt>
              <dd class="mt-1 font-semibold text-admin-text">{{ store.subscription_plan?.name ?? 'No plan' }}</dd>
            </div>
            <div class="rounded-xl bg-admin-soft/60 px-3 py-2.5">
              <dt class="text-xs font-semibold uppercase tracking-wider text-admin-muted">Renews / expires</dt>
              <dd class="mt-1 font-medium text-admin-text">{{ store.subscription_expires_at ? formatDate(store.subscription_expires_at) : '—' }}</dd>
            </div>
            <div class="rounded-xl bg-admin-soft/60 px-3 py-2.5">
              <dt class="text-xs font-semibold uppercase tracking-wider text-admin-muted">Subscribed</dt>
              <dd class="mt-1 font-medium text-admin-text">{{ store.subscribed_at ? formatDate(store.subscribed_at) : '—' }}</dd>
            </div>
            <div class="rounded-xl bg-admin-soft/60 px-3 py-2.5">
              <dt class="text-xs font-semibold uppercase tracking-wider text-admin-muted">Price</dt>
              <dd class="mt-1 font-medium text-admin-text">{{ store.subscription_plan ? formatPrice(store.subscription_plan.price_cents) : '—' }}</dd>
            </div>
          </dl>

          <div v-if="!store.is_default" class="mt-4 flex flex-col gap-2.5 rounded-xl border border-admin-border bg-admin-soft/30 p-3 sm:flex-row sm:items-center">
            <template v-if="store.subscription_status === 'comped'">
              <button type="button" class="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-admin-danger/20 bg-admin-danger-soft px-3 text-xs font-semibold text-admin-danger hover:bg-admin-danger hover:text-white disabled:opacity-50" :disabled="compMutating" @click="uncomp">
                <Icon name="heroicons:no-symbol" class="h-3.5 w-3.5" aria-hidden="true" />
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
                <Icon name="heroicons:currency-dollar" class="h-3.5 w-3.5" aria-hidden="true" />
                Comp — grant access
              </button>
            </template>
            <p v-if="compError" class="text-xs font-medium text-admin-danger" role="alert">{{ compError }}</p>
          </div>
          <p v-else class="mt-3 rounded-xl bg-admin-soft/60 px-3 py-2.5 text-xs text-admin-muted">The default store is always accessible.</p>
        </div>
      </section>

      <!-- Admins -->
      <section class="rounded-2xl border border-admin-border bg-admin-surface shadow-sm">
        <div class="flex flex-col gap-3 border-b border-admin-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div class="flex items-center gap-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-admin-info-soft text-admin-info border border-admin-info/15">
              <Icon name="heroicons:user-group" class="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 class="text-sm font-semibold text-admin-text">Admins</h2>
              <p class="text-xs text-admin-muted">{{ storeAdmins.length }} assigned · a store can have several</p>
            </div>
          </div>
          <AdminButton :to="`/super-admin/admins/new?store_id=${store.id}`" variant="primary" size="sm">
            <template #icon><Icon name="heroicons:plus" class="h-4 w-4" aria-hidden="true" /></template>
            Add admin
          </AdminButton>
        </div>

        <div v-if="storeAdmins.length === 0" class="px-6 py-10 text-center">
          <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-admin-soft text-admin-muted">
            <Icon name="heroicons:user" class="h-5 w-5" aria-hidden="true" />
          </div>
          <p class="mt-2 text-sm font-medium text-admin-muted">No admins assigned to this store yet.</p>
          <NuxtLink :to="`/super-admin/admins/new?store_id=${store.id}`" class="mt-3 inline-flex min-h-9 items-center rounded-xl bg-admin-accent px-4 text-xs font-semibold text-admin-on-accent">Add first admin</NuxtLink>
        </div>
        <ul v-else class="divide-y divide-admin-border">
          <li v-for="a in storeAdmins" :key="a.id" class="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5 hover:bg-admin-soft/40 transition-colors">
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
const domainCheckError = ref<string | null>(null)
const verifying = ref(false)
const verifyMessage = ref<string | null>(null)
const verifyError = ref<string | null>(null)
const copiedDnsValue = ref<string | null>(null)

const compPlanId = ref<number | null>(null)
const compMutating = ref(false)
const compError = ref<string | null>(null)
const compPlans = computed(() => plans.value ?? [])

const editIcon = 'heroicons:pencil-square'

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
const formatDateTime = (iso: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(iso))
const formatPrice = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
const canonical = (value: string | null | undefined) => {
  const domain = (value ?? '').trim().toLowerCase()
  return domain.startsWith('www.') ? domain.slice(4) : domain
}
const domainDirty = computed(() => canonical(form.value.domain) !== canonical(store.value?.domain))
const expectedIps = computed(() => check.value?.expected_ips ?? [])
const domainVerifierConfigured = computed(() => expectedIps.value.length > 0)
const domainLiveUrl = computed(() => store.value?.domain_verified && !domainDirty.value && store.value.domain
  ? `https://${canonical(store.value.domain)}`
  : null)
const domainStage = computed(() => {
  if (store.value?.domain_verified && !domainDirty.value) return 4
  if (!store.value?.domain || domainDirty.value) return 1
  if (check.value?.dns?.points_at_server) return 3
  return 2
})
const domainSteps = computed(() => [
  { number: 1, label: 'Connect', detail: !form.value.domain?.trim() ? 'Enter domain' : domainDirty.value ? 'Save domain' : 'Domain saved', complete: domainStage.value > 1, active: domainStage.value === 1 },
  { number: 2, label: 'Point DNS', detail: check.value?.dns?.points_at_server ? 'Record detected' : 'Add A record', complete: domainStage.value > 2, active: domainStage.value === 2 },
  { number: 3, label: 'Verify', detail: store.value?.domain_verified && !domainDirty.value ? 'Storefront live' : 'Confirm ownership', complete: domainStage.value > 3, active: domainStage.value === 3 },
])
const domainStatusLabel = computed(() => {
  if (store.value?.domain_verified && !domainDirty.value) return 'Verified · live'
  if (domainDirty.value) return 'Unsaved change'
  if (store.value?.domain) return 'Setup required'
  return 'Not connected'
})
const domainStatusClass = computed(() => {
  if (store.value?.domain_verified && !domainDirty.value) return 'border-admin-success/20 bg-admin-success-soft text-admin-success'
  if (domainDirty.value || store.value?.domain) return 'border-admin-warning/20 bg-admin-warning-soft text-admin-warning'
  return 'border-admin-border bg-admin-soft text-admin-muted'
})
const domainStatusDotClass = computed(() => store.value?.domain_verified && !domainDirty.value
  ? 'bg-admin-success'
  : domainDirty.value || store.value?.domain ? 'bg-admin-warning' : 'bg-admin-muted')
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
  } catch (err: any) { loadError.value = err?.data?.message || 'This store could not be loaded.' }
  finally { loading.value = false }
}
onMounted(async () => { if (!plans.value) fetchPlans().catch(() => {}); await loadStore() })
let checkTimer: ReturnType<typeof setTimeout> | undefined
let copiedDnsTimer: ReturnType<typeof setTimeout> | undefined
let checkSeq = 0
const runCheck = async (domain: string) => {
  const seq = ++checkSeq
  checking.value = true
  domainCheckError.value = null
  try { const result = await api.checkDomain(domain, id); if (seq === checkSeq) check.value = result }
  catch (err: any) {
    if (seq === checkSeq) {
      check.value = null
      domainCheckError.value = err?.data?.message || 'The domain check could not be completed. Try again.'
    }
  }
  finally { if (seq === checkSeq) checking.value = false }
}
watch(() => form.value.domain, (domain) => {
  clearTimeout(checkTimer)
  verifyMessage.value = null; verifyError.value = null
  domainCheckError.value = null
  check.value = null
  const trimmed = (domain ?? '').trim()
  if (!trimmed) { checkSeq++; checking.value = false; check.value = null; return }
  checkTimer = setTimeout(() => runCheck(trimmed), 400)
})
onUnmounted(() => {
  clearTimeout(checkTimer)
  clearTimeout(copiedDnsTimer)
})
const copyDnsValue = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    copiedDnsValue.value = value
    clearTimeout(copiedDnsTimer)
    copiedDnsTimer = setTimeout(() => { copiedDnsValue.value = null }, 1800)
  } catch {
    toastError('Couldn’t copy the DNS value. Select and copy it manually.')
  }
}
const verifyDomain = async () => {
  verifying.value = true; verifyMessage.value = null; verifyError.value = null
  try {
    const result = await api.verifyStoreDomain(id)
    verifyMessage.value = result.message
    if (store.value) { store.value.domain_verified = result.data.domain_verified; store.value.domain_verified_at = result.data.domain_verified_at }
    if (check.value) check.value = { ...check.value, dns: result.dns, expected_ips: result.dns.expected_ips }
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

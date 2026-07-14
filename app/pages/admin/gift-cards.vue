<template>
  <div class="space-y-8">

    <!-- Header -->
    <AdminPageHeader title="Gift Cards" subtitle="Manage denominations and view issued gift card codes." />

    <!-- Denominations -->
    <section>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-base font-semibold text-gray-900">Denominations</h2>
        <button type="button" class="btn-primary text-sm px-4 py-2" @click="openDenomModal()">Add Denomination</button>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
        <AdminSpinner v-if="loadingDenoms" label="Loading denominations…" />
        <AdminEmptyState
          v-else-if="denominations.length === 0"
          title="No denominations yet"
          description="Add one to enable gift card purchases."
          :icon="'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7'"
        />
        <table v-else class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200/70">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Label</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="d in denominations" :key="d.id" class="hover:bg-gray-50/50">
              <td class="px-6 py-4 text-sm font-semibold text-gray-900">{{ format(Number(d.amount)) }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ d.label || '—' }}</td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-1 text-xs font-semibold rounded-full"
                  :class="d.is_enabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'">
                  {{ d.is_enabled ? 'Active' : 'Disabled' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-3">
                <button type="button" class="text-xs font-semibold text-primary-600 hover:text-primary-700" @click="openDenomModal(d)">Edit</button>
                <button type="button" class="text-xs font-semibold text-red-500 hover:text-red-600" @click="deleteDenom(d)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Issued Gift Cards -->
    <section>
      <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 class="text-base font-semibold text-gray-900">Issued Gift Cards</h2>
        <div class="flex items-center gap-2">
          <input
            v-model="search"
            type="search"
            placeholder="Search code or email…"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
            @input="loadCards"
          />
          <select v-model="filterStatus" @change="loadCards"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none">
            <option value="">All statuses</option>
            <option v-for="s in STATUSES" :key="s" :value="s">{{ statusLabel(s) }}</option>
          </select>
          <button type="button" class="btn-secondary text-sm px-4 py-2" @click="openCreateCardModal">Create manually</button>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
        <AdminSpinner v-if="loadingCards" label="Loading gift cards…" />
        <AdminEmptyState
          v-else-if="cards.length === 0"
          title="No gift cards found"
          description="Issued gift cards will appear here."
          :icon="'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7'"
        />
        <table v-else class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200/70">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipient</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Issued</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="c in cards" :key="c.id" class="hover:bg-gray-50/50">
              <td class="px-6 py-4">
                <span class="font-mono text-sm font-semibold text-gray-900">{{ c.code }}</span>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-gray-900">{{ c.recipient_name || c.recipient_email }}</p>
                <p v-if="c.recipient_name" class="text-xs text-gray-500">{{ c.recipient_email }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ formatIn(Number(c.original_amount), c.currency) }}</td>
              <td class="px-6 py-4 text-sm font-semibold" :class="Number(c.balance) > 0 ? 'text-green-600' : 'text-gray-500'">
                {{ formatIn(Number(c.balance), c.currency) }}
              </td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-1 text-xs font-semibold rounded-full" :class="statusClass(c.status)">
                  {{ statusLabel(c.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-xs text-gray-500">{{ new Date(c.created_at).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Denomination Modal -->
    <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="denomModal" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" @click.self="denomModal = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
          <h2 class="text-lg font-bold text-gray-900">{{ editingDenom?.id ? 'Edit' : 'Add' }} Denomination</h2>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Amount <span class="text-red-500">*</span></label>
            <input v-model.number="denomForm.amount" type="number" min="1" step="0.01" class="input-field w-full" placeholder="25.00" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Label <span class="text-gray-500 font-normal">(optional)</span></label>
            <input v-model="denomForm.label" type="text" class="input-field w-full" placeholder="e.g. Classic, Premium" />
          </div>
          <div class="flex items-center gap-2">
            <input v-model="denomForm.is_enabled" type="checkbox" id="denom-enabled" class="h-4 w-4 accent-primary-600" />
            <label for="denom-enabled" class="text-sm text-gray-700">Enabled</label>
          </div>
          <div v-if="denomError" class="text-sm text-red-600">{{ denomError }}</div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200" @click="denomModal = false">Cancel</button>
            <button type="button" :disabled="savingDenom" class="btn-primary px-4 py-2 text-sm" @click="saveDenom">
              {{ savingDenom ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Create Gift Card Modal -->
    <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="createCardModal" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" @click.self="createCardModal = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
          <h2 class="text-lg font-bold text-gray-900">Create Gift Card</h2>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Amount <span class="text-red-500">*</span></label>
              <input v-model.number="newCardForm.amount" type="number" min="1" step="0.01" class="input-field w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Purchaser Name <span class="text-red-500">*</span></label>
              <input v-model="newCardForm.purchaser_name" type="text" class="input-field w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Purchaser Email <span class="text-red-500">*</span></label>
              <input v-model="newCardForm.purchaser_email" type="email" class="input-field w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Recipient Email <span class="text-red-500">*</span></label>
              <input v-model="newCardForm.recipient_email" type="email" class="input-field w-full" />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-semibold text-gray-600 mb-1">Recipient Name</label>
              <input v-model="newCardForm.recipient_name" type="text" class="input-field w-full" />
            </div>
          </div>
          <div v-if="createCardError" class="text-sm text-red-600">{{ createCardError }}</div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200" @click="createCardModal = false">Cancel</button>
            <button type="button" :disabled="savingCard" class="btn-primary px-4 py-2 text-sm" @click="saveNewCard">
              {{ savingCard ? 'Creating…' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { $apiFetch } = useNuxtApp()
const { format, formatIn } = useCurrency()

// --- Types ---
interface Denomination {
  id: number; amount: string; label: string | null; is_enabled: boolean; sort_order: number
}
interface GiftCard {
  id: number; code: string; original_amount: string; balance: string; currency: string
  recipient_name: string | null; recipient_email: string; purchaser_name: string; purchaser_email: string
  status: string; created_at: string
}

const STATUSES = ['pending_payment', 'active', 'partially_used', 'fully_used', 'void'] as const

function statusLabel(s: string): string {
  return s.split('_').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ')
}

function statusClass(s: string): string {
  return ({
    pending_payment: 'bg-amber-50 text-amber-700',
    active: 'bg-green-50 text-green-700',
    partially_used: 'bg-blue-50 text-blue-700',
    fully_used: 'bg-gray-100 text-gray-500',
    void: 'bg-red-50 text-red-700',
  } as Record<string, string>)[s] ?? 'bg-gray-50 text-gray-600'
}

// --- Denominations ---
const denominations = ref<Denomination[]>([])
const loadingDenoms = ref(true)
const denomModal = ref(false)
const editingDenom = ref<Denomination | null>(null)
const denomForm = ref({ amount: 0, label: '', is_enabled: true })
const savingDenom = ref(false)
const denomError = ref<string | null>(null)

async function loadDenoms(): Promise<void> {
  loadingDenoms.value = true
  try {
    const res = await $apiFetch<{ data: Denomination[] }>('/admin/gift-card-denominations')
    denominations.value = res.data ?? []
  } finally {
    loadingDenoms.value = false
  }
}

function openDenomModal(d?: Denomination): void {
  editingDenom.value = d ?? null
  denomForm.value = d
    ? { amount: Number(d.amount), label: d.label ?? '', is_enabled: d.is_enabled }
    : { amount: 0, label: '', is_enabled: true }
  denomError.value = null
  denomModal.value = true
}

async function saveDenom(): Promise<void> {
  if (!denomForm.value.amount) return
  savingDenom.value = true
  denomError.value = null
  try {
    if (editingDenom.value?.id) {
      const res = await $apiFetch<{ data: Denomination }>(`/gift-card-denominations/${editingDenom.value.id}`, {
        method: 'PATCH', body: denomForm.value,
      })
      const idx = denominations.value.findIndex(d => d.id === editingDenom.value!.id)
      if (idx >= 0) denominations.value[idx] = res.data
    } else {
      const res = await $apiFetch<{ data: Denomination }>('/gift-card-denominations', {
        method: 'POST', body: denomForm.value,
      })
      denominations.value.push(res.data)
    }
    denomModal.value = false
  } catch (err: any) {
    denomError.value = err?.data?.message || 'Failed to save.'
  } finally {
    savingDenom.value = false
  }
}

async function deleteDenom(d: Denomination): Promise<void> {
  if (!confirm(`Delete the ${format(Number(d.amount))} denomination?`)) return
  await $apiFetch(`/gift-card-denominations/${d.id}`, { method: 'DELETE' })
  denominations.value = denominations.value.filter(x => x.id !== d.id)
}

// --- Issued Cards ---
const cards = ref<GiftCard[]>([])
const loadingCards = ref(true)
const filterStatus = ref('')
const search = ref('')

async function loadCards(): Promise<void> {
  loadingCards.value = true
  try {
    const params = new URLSearchParams()
    if (filterStatus.value) params.set('status', filterStatus.value)
    if (search.value) params.set('search', search.value)
    const res = await $apiFetch<{ data: GiftCard[] }>(`/admin/gift-cards?${params}`)
    cards.value = res.data ?? []
  } finally {
    loadingCards.value = false
  }
}

// --- Create Card Modal ---
const createCardModal = ref(false)
const newCardForm = ref({ amount: 0, purchaser_name: '', purchaser_email: '', recipient_email: '', recipient_name: '' })
const savingCard = ref(false)
const createCardError = ref<string | null>(null)

function openCreateCardModal(): void {
  newCardForm.value = { amount: 0, purchaser_name: '', purchaser_email: '', recipient_email: '', recipient_name: '' }
  createCardError.value = null
  createCardModal.value = true
}

async function saveNewCard(): Promise<void> {
  savingCard.value = true
  createCardError.value = null
  try {
    await $apiFetch('/admin/gift-cards', { method: 'POST', body: newCardForm.value })
    createCardModal.value = false
    await loadCards()
  } catch (err: any) {
    createCardError.value = err?.data?.message || 'Failed to create.'
  } finally {
    savingCard.value = false
  }
}

onMounted(() => {
  loadDenoms()
  loadCards()
})
</script>

<style scoped>
.input-field {
  @apply px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none;
}
</style>

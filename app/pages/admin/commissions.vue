<template>
  <div class="space-y-6">
    <header class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Commissions</h1>
        <p class="text-sm text-gray-500 mt-0.5">Custom artwork requests from your storefront.</p>
      </div>
      <div data-guide="commission-filters" class="flex items-center gap-2">
        <select
          v-model="filterStatus"
          class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
          @change="load"
        >
          <option value="">All statuses</option>
          <option v-for="s in STATUSES" :key="s" :value="s">{{ statusLabel(s) }}</option>
        </select>
      </div>
    </header>

    <div data-guide="commission-table">
      <div v-if="loading" class="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-500">
        Loading commissions…
      </div>

      <div v-else-if="commissions.length === 0" class="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <p class="text-sm text-gray-500">No commission requests yet.</p>
      </div>

      <div v-else class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="c in commissions" :key="c.id" class="hover:bg-gray-50/50">
            <td class="px-6 py-4 align-top">
              <p class="text-sm font-semibold text-gray-900">{{ c.customer_name }}</p>
              <p class="text-xs text-gray-500">{{ c.customer_email }}</p>
            </td>
            <td class="px-6 py-4 text-sm text-gray-700 max-w-xs">
              <p class="font-medium truncate">{{ c.title }}</p>
              <p class="text-xs text-gray-400 line-clamp-1">{{ c.description }}</p>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ c.budget_range || '—' }}</td>
            <td class="px-6 py-4">
              <select
                :value="c.status"
                class="px-2.5 py-1 text-xs font-semibold rounded-full border focus:ring-2 focus:ring-primary-500/20 outline-none"
                :class="statusClass(c.status)"
                @change="updateStatus(c, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="s in STATUSES" :key="s" :value="s">{{ statusLabel(s) }}</option>
              </select>
            </td>
            <td class="px-6 py-4 text-xs text-gray-500">
              {{ new Date(c.created_at).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 text-right">
              <button
                type="button"
                class="text-xs font-semibold text-primary-600 hover:text-primary-700"
                @click="openDetail(c)"
              >View</button>
            </td>
          </tr>
        </tbody>
        </table>
      </div>
    </div>

    <!-- Detail modal -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="selected"
        class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        @click.self="selected = null"
      >
        <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-bold text-gray-900">{{ selected.title }}</h2>
              <p class="text-xs text-gray-500 mt-0.5">From {{ selected.customer_name }} · {{ new Date(selected.created_at).toLocaleString() }}</p>
            </div>
            <button class="text-gray-400 hover:text-gray-600 text-2xl leading-none" @click="selected = null">×</button>
          </div>
          <div class="p-6 space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                <a :href="`mailto:${selected.customer_email}`" class="text-primary-600 hover:underline">{{ selected.customer_email }}</a>
              </div>
              <div v-if="selected.customer_phone">
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                <p class="text-gray-700">{{ selected.customer_phone }}</p>
              </div>
              <div v-if="selected.budget_range">
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Budget</p>
                <p class="text-gray-700">{{ selected.budget_range }}</p>
              </div>
              <div v-if="selected.preferred_medium">
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Medium</p>
                <p class="text-gray-700">{{ selected.preferred_medium }}</p>
              </div>
              <div v-if="selected.preferred_size">
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Size</p>
                <p class="text-gray-700">{{ selected.preferred_size }}</p>
              </div>
              <div v-if="selected.deadline">
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Deadline</p>
                <p class="text-gray-700">{{ new Date(selected.deadline).toLocaleDateString() }}</p>
              </div>
            </div>

            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Brief</p>
              <p class="text-sm text-gray-700 whitespace-pre-line">{{ selected.description }}</p>
            </div>

            <div v-if="selected.reference_image_url">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reference image</p>
              <a :href="selected.reference_image_url" target="_blank" rel="noopener">
                <img :src="selected.reference_image_url" class="rounded-lg border border-gray-100 max-h-72 object-contain" />
              </a>
            </div>

            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Admin notes</p>
              <textarea
                v-model="notesDraft"
                rows="4"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
                placeholder="Internal notes for this commission…"
              ></textarea>
            </div>
          </div>
          <div class="p-4 border-t border-gray-100 flex items-center justify-between gap-2">
            <button
              type="button"
              class="text-sm text-red-600 hover:text-red-700 font-medium"
              @click="onDelete"
            >Delete</button>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
                @click="selected = null"
              >Close</button>
              <button
                type="button"
                :disabled="saving"
                class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                @click="saveNotes"
              >{{ saving ? 'Saving…' : 'Save notes' }}</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface Commission {
  id: number
  customer_name: string
  customer_email: string
  customer_phone: string | null
  title: string
  description: string
  budget_range: string | null
  preferred_medium: string | null
  preferred_size: string | null
  deadline: string | null
  reference_image_url: string | null
  status: string
  admin_notes: string | null
  created_at: string
}

const STATUSES = ['pending', 'reviewing', 'quoted', 'accepted', 'in_progress', 'delivered', 'cancelled'] as const

function statusLabel(s: string): string {
  return s.split('_').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ')
}

function statusClass(s: string): string {
  return {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    reviewing: 'bg-blue-50 text-blue-700 border-blue-200',
    quoted: 'bg-violet-50 text-violet-700 border-violet-200',
    accepted: 'bg-green-50 text-green-700 border-green-200',
    in_progress: 'bg-primary-50 text-primary-700 border-primary-200',
    delivered: 'bg-gray-100 text-gray-700 border-gray-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  }[s] ?? 'bg-gray-50 text-gray-700 border-gray-200'
}

const { $apiFetch } = useNuxtApp()

const commissions = ref<Commission[]>([])
const loading = ref(true)
const filterStatus = ref('')

const selected = ref<Commission | null>(null)
const notesDraft = ref('')
const saving = ref(false)

async function load(): Promise<void> {
  loading.value = true
  try {
    const params = filterStatus.value ? `?status=${filterStatus.value}` : ''
    const res = await $apiFetch<{ data: Commission[] }>(`/commission-requests${params}`)
    commissions.value = res.data ?? []
  } finally {
    loading.value = false
  }
}

function openDetail(c: Commission): void {
  selected.value = c
  notesDraft.value = c.admin_notes ?? ''
}

async function updateStatus(c: Commission, status: string): Promise<void> {
  await $apiFetch(`/commission-requests/${c.id}`, {
    method: 'PATCH',
    body: { status },
  })
  c.status = status
}

async function saveNotes(): Promise<void> {
  if (!selected.value) {
    return
  }
  saving.value = true
  try {
    const res = await $apiFetch<{ data: Commission }>(`/commission-requests/${selected.value.id}`, {
      method: 'PATCH',
      body: { admin_notes: notesDraft.value },
    })
    const idx = commissions.value.findIndex(c => c.id === selected.value!.id)
    if (idx >= 0) {
      commissions.value[idx] = res.data
    }
    selected.value = null
  } finally {
    saving.value = false
  }
}

async function onDelete(): Promise<void> {
  if (!selected.value) {
    return
  }
  if (!confirm('Delete this commission request? This cannot be undone.')) {
    return
  }
  await $apiFetch(`/commission-requests/${selected.value.id}`, { method: 'DELETE' })
  commissions.value = commissions.value.filter(c => c.id !== selected.value!.id)
  selected.value = null
}

onMounted(load)
</script>

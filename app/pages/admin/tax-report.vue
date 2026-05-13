<template>
  <div class="pb-28">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
        <span>/</span>
        <span class="text-gray-600 font-medium">Tax Report</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">Tax Report</h1>
      <p class="text-gray-500 text-sm mt-1">View tax collected by region and export for accounting</p>
    </div>

    <!-- Filters -->
    <section data-guide="tax-report" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div class="px-6 py-4 flex flex-wrap items-end gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">From</label>
          <input v-model="filters.date_from" type="date" class="input-field w-44" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">To</label>
          <input v-model="filters.date_to" type="date" class="input-field w-44" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
          <select v-model="filters.status" class="input-field w-44">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
        <button
          @click="loadReport"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loading ? 'Loading...' : 'Generate' }}
        </button>
      </div>
    </section>

    <!-- Report Table -->
    <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <p class="text-sm font-semibold text-gray-900">Tax Summary by Region</p>
        <div class="flex items-center gap-2">
          <button
            @click="exportCsv"
            :disabled="report.length === 0 || exporting"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      <div v-if="report.length === 0 && !loading" class="px-6 py-16 text-center">
        <p class="text-gray-400 text-sm">No data for the selected filters. Try adjusting the date range.</p>
      </div>

      <div v-if="report.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th class="text-left px-6 py-3">Region</th>
              <th class="text-right px-6 py-3">Orders</th>
              <th class="text-right px-6 py-3">Subtotal (Ex-Tax)</th>
              <th class="text-right px-6 py-3">Tax Collected</th>
              <th class="text-right px-6 py-3">Total</th>
              <th class="text-right px-6 py-3">Rate</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="row in report" :key="row.region_label" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3.5">
                <div>
                  <p class="font-medium text-gray-900">{{ row.region_label }}</p>
                  <p v-if="row.tax_name" class="text-xs text-gray-400">{{ row.tax_name }}</p>
                </div>
              </td>
              <td class="px-6 py-3.5 text-right text-gray-700 font-medium">{{ row.order_count }}</td>
              <td class="px-6 py-3.5 text-right text-gray-700">{{ format(row.subtotal) }}</td>
              <td class="px-6 py-3.5 text-right text-gray-900 font-semibold">{{ format(row.tax_collected) }}</td>
              <td class="px-6 py-3.5 text-right text-gray-700">{{ format(row.total) }}</td>
              <td class="px-6 py-3.5 text-right text-gray-500">{{ row.tax_rate != null ? row.tax_rate + '%' : '-' }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-gray-50 font-semibold text-sm">
              <td class="px-6 py-3.5 text-gray-900">Total</td>
              <td class="px-6 py-3.5 text-right text-gray-900">{{ totals.orders }}</td>
              <td class="px-6 py-3.5 text-right text-gray-900">{{ format(totals.subtotal) }}</td>
              <td class="px-6 py-3.5 text-right text-gray-900">{{ format(totals.taxCollected) }}</td>
              <td class="px-6 py-3.5 text-right text-gray-900">{{ format(totals.total) }}</td>
              <td class="px-6 py-3.5"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { $apiFetch } = useNuxtApp()
const { format } = useCurrency()

const loading = ref(false)
const exporting = ref(false)

const filters = ref({
  date_from: '',
  date_to: '',
  status: '',
})

interface ReportRow {
  country: string | null
  state: string | null
  region_label: string
  order_count: number
  subtotal: number
  tax_collected: number
  total: number
  tax_rate: number | null
  tax_name: string | null
  tax_rule_id: number | null
}

const report = ref<ReportRow[]>([])

const totals = computed(() => ({
  orders: report.value.reduce((sum, r) => sum + r.order_count, 0),
  subtotal: report.value.reduce((sum, r) => sum + r.subtotal, 0),
  taxCollected: report.value.reduce((sum, r) => sum + r.tax_collected, 0),
  total: report.value.reduce((sum, r) => sum + r.total, 0),
}))

async function loadReport() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.date_from) params.set('date_from', filters.value.date_from)
    if (filters.value.date_to) params.set('date_to', filters.value.date_to)
    if (filters.value.status) params.set('status', filters.value.status)

    const res = await $apiFetch<any>(`/tax-report?${params.toString()}`, { method: 'GET' })
    report.value = res?.data ?? []
  } catch (err: any) {
    console.error('Error loading tax report:', err)
    report.value = []
  } finally {
    loading.value = false
  }
}

async function exportCsv() {
  exporting.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.date_from) params.set('date_from', filters.value.date_from)
    if (filters.value.date_to) params.set('date_to', filters.value.date_to)
    if (filters.value.status) params.set('status', filters.value.status)

    const res = await $apiFetch<Blob>(`/tax-report/export?${params.toString()}`, {
      method: 'GET',
      responseType: 'blob',
    })

    const blob = new Blob([res as any], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tax-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } catch (err: any) {
    console.error('Error exporting:', err)
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  // Default: current month
  const now = new Date()
  filters.value.date_from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  filters.value.date_to = now.toISOString().split('T')[0]
  loadReport()
})
</script>

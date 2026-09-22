<template>
  <div>
    <AdminPageHeader title="Dashboard" subtitle="Overview of your store's performance" />

    <!-- Loading -->
    <AdminSpinner v-if="loading" label="Loading dashboard…" variant="dashboard" />

    <div v-else class="space-y-6">
      <!-- Stats — one hero metric (revenue) anchors a restrained supporting set. -->
      <div data-guide="stats" class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <AdminStatTile
          class="col-span-2"
          hero
          tone="brand"
          label="Total Revenue"
          :value="formatCurrency(stats.totalRevenue)"
          :hint="revenueHint"
          :icon="icons.revenue"
        />
        <AdminStatTile
          to="/admin/products"
          tone="neutral"
          label="Total Products"
          :value="stats.totalProducts"
          :icon="icons.products"
        />
        <AdminStatTile
          to="/admin/orders"
          tone="positive"
          label="Total Orders"
          :value="formatCompact(stats.totalOrders)"
          :hint="`${stats.totalOrders.toLocaleString()} orders`"
          :icon="icons.orders"
        />
        <AdminStatTile
          to="/admin/orders"
          tone="attention"
          label="Pending Orders"
          :value="formatCompact(stats.pendingOrders)"
          :hint="stats.pendingOrders > 0 ? `${stats.pendingOrders.toLocaleString()} needs attention` : undefined"
          emphasize-hint
          :icon="icons.pending"
        />
        <AdminStatTile
          tone="neutral"
          label="Pending Revenue"
          :value="formatCurrency(stats.pendingRevenue)"
          :hint="pendingRevenueHint"
          :icon="icons.pending"
        />
      </div>

      <!-- Sales Analytics — range filter -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h2 class="text-sm font-bold text-gray-900">Sales Analytics</h2>
          <p class="text-xs text-gray-500 mt-0.5">Filtered insights — orders, revenue and best sellers</p>
        </div>
        <div class="flex items-center gap-1 p-1 bg-white rounded-full border border-gray-200/70 shadow-sm w-full sm:w-fit overflow-x-auto max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            v-for="opt in rangeOptions"
            :key="opt.value"
            type="button"
            class="px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap shrink-0"
            :class="range === opt.value
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            @click="range = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Charts — Orders & Revenue (1 column on mobile, 2 on desktop) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <!-- Orders Overview -->
        <AdminCard class="overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-gray-200/70 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">Orders Overview</p>
              <p class="text-xs text-gray-500 truncate">{{ ordersChartSubtitle }}</p>
            </div>
            <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              {{ analytics?.summary.orders ?? 0 }} orders
            </span>
          </div>
          <div class="p-3 sm:p-6 flex-1 flex flex-col">
            <div v-if="analyticsLoading" class="flex-1 flex items-center justify-center py-10">
              <div class="w-6 h-6 rounded-full border-2 border-gray-200 border-t-emerald-600 animate-spin"></div>
            </div>
            <AdminEmptyState
              v-else-if="!hasOrdersData"
              title="No orders in this period"
              description="Try a wider range"
              :icon="icons.chart"
            />
            <template v-else>
              <ClientOnly>
                <component
                  :is="ApexChartComponent"
                  v-if="apexReady"
                  type="area"
                  height="220"
                  :options="ordersApexOptions"
                  :series="ordersApexSeries"
                />
                <template #fallback>
                  <div class="h-[220px] flex items-center justify-center">
                    <div class="w-6 h-6 rounded-full border-2 border-gray-200 border-t-emerald-600 animate-spin"></div>
                  </div>
                </template>
              </ClientOnly>
            </template>
          </div>
        </AdminCard>

        <!-- Revenue Overview -->
        <AdminCard class="overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-gray-200/70 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">Revenue Overview</p>
              <p class="text-xs text-gray-500 truncate">{{ revenueChartSubtitle }}</p>
            </div>
            <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 shrink-0">
              <span class="w-2 h-2 rounded-full bg-purple-500"></span>
              {{ formatCompactCurrency(analytics?.summary.revenue ?? 0) }}
            </span>
          </div>
          <div class="p-3 sm:p-6 flex-1 flex flex-col">
            <div v-if="analyticsLoading" class="flex-1 flex items-center justify-center py-10">
              <div class="w-6 h-6 rounded-full border-2 border-gray-200 border-t-purple-600 animate-spin"></div>
            </div>
            <AdminEmptyState
              v-else-if="!hasRevenueData"
              title="No revenue in this period"
              description="Paid orders will appear here"
              :icon="icons.revenue"
            />
            <template v-else>
              <ClientOnly>
                <component
                  :is="ApexChartComponent"
                  v-if="apexReady"
                  type="area"
                  height="220"
                  :options="revenueApexOptions"
                  :series="revenueApexSeries"
                />
                <template #fallback>
                  <div class="h-[220px] flex items-center justify-center">
                    <div class="w-6 h-6 rounded-full border-2 border-gray-200 border-t-purple-600 animate-spin"></div>
                  </div>
                </template>
              </ClientOnly>
            </template>
          </div>
        </AdminCard>
      </div>

      <!-- Popular Products -->
      <AdminCard class="overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-gray-200/70 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate">Popular Products</p>
            <p class="text-xs text-gray-500 truncate">{{ rangeLabel }} · by quantity sold</p>
          </div>
          <span v-if="popularProducts.length" class="inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-900 text-white shrink-0">Top {{ popularProducts.length }}</span>
        </div>

        <div v-if="analyticsLoading" class="p-6 space-y-4">
          <div v-for="i in 5" :key="i" class="animate-pulse flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gray-100 shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3 bg-gray-100 rounded w-3/4"></div>
              <div class="h-2 bg-gray-100 rounded w-full"></div>
            </div>
          </div>
        </div>

        <AdminEmptyState
          v-else-if="popularProducts.length === 0"
          title="No product sales in this period"
          description="Sales will appear here once orders are placed."
          :icon="icons.products"
        />

        <div v-else>
          <!-- ranked list -->
          <div class="p-4 sm:p-6 space-y-2.5 sm:space-y-4">
            <div
              v-for="(prod, idx) in popularProducts"
              :key="prod.product_id"
              class="group flex items-center gap-2.5 sm:gap-3 rounded-xl px-2 py-1 sm:py-1.5 -mx-2 hover:bg-gray-50 transition-colors cursor-default"
              :title="`${prod.name} — ${prod.quantity_sold} sold, ${formatIn(prod.revenue, shopCurrency.code)}`"
            >
              <span
                class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[11px] sm:text-xs font-bold shrink-0 border"
                :class="idx === 0 ? 'bg-amber-500 text-white border-amber-500' : idx === 1 ? 'bg-gray-800 text-white border-gray-800' : idx === 2 ? 'bg-amber-700 text-white border-amber-700' : 'bg-white text-gray-600 border-gray-200'"
              >{{ idx + 1 }}</span>
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                <img v-if="prod.thumb_url || prod.image_url" :src="prod.thumb_url || prod.image_url" :alt="prod.name" class="w-full h-full object-cover" loading="lazy" />
                <svg v-else class="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="icons.products" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] sm:text-sm font-semibold text-gray-900 truncate pr-2" :title="prod.name">{{ prod.name }}</p>
                <p class="text-[11px] sm:text-xs text-gray-500 truncate">{{ prod.quantity_sold.toLocaleString() }} sold · {{ prod.order_count }} order{{ prod.order_count === 1 ? '' : 's' }} · {{ formatIn(prod.revenue, shopCurrency.code) }}</p>
              </div>
              <span class="text-[11px] sm:text-xs font-bold text-gray-900 shrink-0">{{ prod.quantity_sold.toLocaleString() }}</span>
            </div>
          </div>
          <!-- interactive horizontal bar chart -->
          <div class="border-t border-gray-200/70 pt-2">
            <ClientOnly>
              <component
                :is="ApexChartComponent"
                v-if="apexReady"
                type="bar"
                :height="Math.max(220, popularProducts.length * 56)"
                :options="popularApexOptions"
                :series="popularApexSeries"
              />
              <template #fallback>
                <div class="h-[220px] flex items-center justify-center">
                  <div class="w-6 h-6 rounded-full border-2 border-gray-200 border-t-amber-500 animate-spin"></div>
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </AdminCard>

      <!-- Recent Orders -->
      <AdminCard data-guide="recent-orders" class="overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200/70 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.orders" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900">Recent Orders</p>
              <p class="text-xs text-gray-500">Latest 5 orders</p>
            </div>
          </div>
          <NuxtLink
            to="/admin/orders"
            class="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors shrink-0"
          >
            View all →
          </NuxtLink>
        </div>

        <!-- Empty -->
        <AdminEmptyState
          v-if="recentOrders.length === 0"
          title="No orders yet"
          :icon="icons.orders"
        />

        <!-- List -->
        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="order in recentOrders"
            :key="order.id"
            class="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <span class="text-xs font-bold text-gray-500">#</span>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ order.customer_name }}</p>
                <p class="text-xs text-gray-500">Order #{{ order.id }} · {{ formatIn(parseFloat(String(order.total_amount)), order.currency) }}</p>
              </div>
            </div>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
              :class="{
                'bg-amber-50 text-amber-700': order.status === 'pending',
                'bg-primary-50 text-primary-700': order.status === 'processing',
                'bg-purple-50 text-purple-700': order.status === 'shipped',
                'bg-emerald-50 text-emerald-700': order.status === 'delivered',
                'bg-gray-100 text-gray-600': order.status === 'cancelled',
              }"
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="{
                  'bg-amber-400': order.status === 'pending',
                  'bg-primary-500': order.status === 'processing',
                  'bg-purple-500': order.status === 'shipped',
                  'bg-emerald-500': order.status === 'delivered',
                  'bg-gray-400': order.status === 'cancelled',
                }"
              ></span>
              {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
            </span>
          </div>
        </div>
      </AdminCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

interface Order {
  id: number
  customer_name: string
  total_amount: string | number
  currency: string
  status: string
  created_at: string
}

interface AnalyticsSeries {
  key: string
  label: string
  date: string
  orders: number
  revenue: number
}

interface PopularProduct {
  product_id: number
  name: string
  image_url: string
  thumb_url: string
  quantity_sold: number
  revenue: number
  order_count: number
}

interface Analytics {
  range: string
  start_date: string
  end_date: string
  granularity: string
  summary: {
    orders: number
    revenue: number
    aov: number
    products: number
  }
  series: AnalyticsSeries[]
  popular_products: PopularProduct[]
}

const { $apiFetch } = useNuxtApp()

const loading = ref(true)
const analyticsLoading = ref(false)

const range = ref<'today' | '7d' | '30d' | 'year'>('7d')
const rangeOptions = [
  { label: 'Today', value: 'today' as const },
  { label: '7 Days', value: '7d' as const },
  { label: '30 Days', value: '30d' as const },
  { label: 'This Year', value: 'year' as const },
] as const

const rangeLabel = computed(() => {
  const m: Record<string, string> = { today: 'Today', '7d': 'Last 7 days', '30d': 'Last 30 days', year: 'This year' }
  return m[range.value] ?? range.value
})

const stats = ref({
  totalProducts: 0,
  totalOrders: 0,
  pendingOrders: 0,
  totalRevenue: 0,
  pendingRevenue: 0,
})

const analytics = ref<Analytics | null>(null)
const recentOrders = ref<Order[]>([])

const popularProducts = computed(() => analytics.value?.popular_products ?? [])

const ordersChartSubtitle = computed(() => {
  if (!analytics.value) return ''
  if (analytics.value.granularity === 'hour') return 'Today — hourly'
  if (analytics.value.granularity === 'month') return 'This year — monthly'
  return `Daily — ${analytics.value.series.length} points`
})

const revenueChartSubtitle = computed(() => {
  if (!analytics.value) return ''
  if (analytics.value.granularity === 'hour') return 'Today — hourly (paid orders)'
  if (analytics.value.granularity === 'month') return 'This year — monthly'
  return 'Daily — paid order revenue'
})

const hasOrdersData = computed(() => (analytics.value?.series.some(s => s.orders > 0) ?? false))
const hasRevenueData = computed(() => (analytics.value?.series.some(s => s.revenue > 0) ?? false))

// Icon path sets shared between the stat tiles and the recent-orders panel.
const icons = {
  revenue: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  products: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  orders: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  pending: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
}

const formatCompact = (num: number): string => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return num.toLocaleString()
}

const { shopCurrency, format, formatIn } = useCurrency()

const formatCurrency = (num: number): string => {
  const sym = shopCurrency.value.symbol
  const before = shopCurrency.value.symbol_position !== 'after'
  const compact = (n: string) => before ? `${sym}${n}` : `${n} ${sym}`
  if (num >= 1_000_000) return compact((num / 1_000_000).toFixed(2) + 'M')
  if (num >= 1_000) return compact((num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K')
  return format(num)
}

const formatCompactCurrency = (num: number): string => {
  return formatCurrency(num)
}

const fullCurrency = (num: number): string =>
  `${shopCurrency.value.symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const revenueHint = computed(() => fullCurrency(stats.value.totalRevenue))
const pendingRevenueHint = computed(() =>
  stats.value.pendingRevenue > 0 ? fullCurrency(stats.value.pendingRevenue) : undefined,
)

// Interactive charts — ApexCharts (client-only)
const apexReady = ref(false)
const ApexChartComponent = shallowRef<any>(null)

const ordersApexSeries = computed(() => [{
  name: 'Orders',
  data: (analytics.value?.series ?? []).map(s => s.orders),
}])

const revenueApexSeries = computed(() => [{
  name: 'Revenue',
  data: (analytics.value?.series ?? []).map(s => s.revenue),
}])

const categories = computed(() => (analytics.value?.series ?? []).map(s => s.label))

const ordersApexOptions = computed(() => ({
  chart: {
    type: 'area' as const,
    height: 220,
    toolbar: { show: true, tools: { download: true, selection: false, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } },
    zoom: { enabled: true, type: 'x' as const, autoScaleYaxis: true },
    animations: { enabled: true, easing: 'easeinout' as const, speed: 400 },
    fontFamily: 'inherit',
  },
  colors: ['#059669'],
  fill: {
    type: 'gradient' as const,
    gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 90, 100] },
  },
  stroke: { curve: 'smooth' as const, width: 2.5 },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f3f4f6', strokeDashArray: 4, xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } }, padding: { left: 8, right: 8 } },
  xaxis: {
    categories: categories.value,
    labels: { style: { colors: '#9ca3af', fontSize: '11px', fontFamily: 'inherit' }, rotate: 0, hideOverlappingLabels: true, trim: true },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  },
  yaxis: {
    min: 0,
    forceNiceScale: true,
    labels: {
      style: { colors: '#9ca3af', fontSize: '11px' },
      formatter: (val: number) => String(Math.round(val)),
    },
  },
  tooltip: {
    theme: 'light' as const,
    shared: false,
    intersect: false,
    x: { show: true },
    y: { formatter: (val: number) => `${val} orders` },
    marker: { show: true },
  },
  markers: { size: 4, strokeWidth: 2, strokeColors: '#fff', hover: { size: 6 } },
  responsive: [{ breakpoint: 640, options: { chart: { height: 200 }, xaxis: { labels: { rotate: -20 } } } }],
}))

const revenueApexOptions = computed(() => ({
  chart: {
    type: 'area' as const,
    height: 220,
    toolbar: { show: true, tools: { download: true, selection: false, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } },
    zoom: { enabled: true, type: 'x' as const, autoScaleYaxis: true },
    animations: { enabled: true, easing: 'easeinout' as const, speed: 400 },
    fontFamily: 'inherit',
  },
  colors: ['#7c3aed'],
  fill: {
    type: 'gradient' as const,
    gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 90, 100] },
  },
  stroke: { curve: 'smooth' as const, width: 2.5 },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f3f4f6', strokeDashArray: 4, xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } }, padding: { left: 8, right: 8 } },
  xaxis: {
    categories: categories.value,
    labels: { style: { colors: '#9ca3af', fontSize: '11px', fontFamily: 'inherit' }, rotate: 0, hideOverlappingLabels: true, trim: true },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  },
  yaxis: {
    min: 0,
    forceNiceScale: true,
    labels: {
      style: { colors: '#9ca3af', fontSize: '11px' },
      formatter: (val: number) => formatIn(val, shopCurrency.value.code),
    },
  },
  tooltip: {
    theme: 'light' as const,
    shared: false,
    intersect: false,
    x: { show: true },
    y: { formatter: (val: number) => formatIn(val, shopCurrency.value.code) },
    marker: { show: true },
  },
  markers: { size: 4, strokeWidth: 2, strokeColors: '#fff', hover: { size: 6 } },
  responsive: [{ breakpoint: 640, options: { chart: { height: 200 }, xaxis: { labels: { rotate: -20 } } } }],
}))

// Popular Products — interactive horizontal bar
const popularApexSeries = computed(() => [{
  name: 'Quantity sold',
  data: [...popularProducts.value].reverse().map(p => p.quantity_sold),
}])

const popularApexOptions = computed(() => {
  const names = [...popularProducts.value].reverse().map(p => p.name.length > 22 ? p.name.slice(0, 22) + '…' : p.name)
  const reversed = [...popularProducts.value].reverse()
  return {
    chart: {
      type: 'bar' as const,
      height: Math.max(220, popularProducts.value.length * 56),
      toolbar: { show: true, tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } },
      animations: { enabled: true, easing: 'easeinout' as const, speed: 400 },
      fontFamily: 'inherit',
    },
    colors: ['#f59e0b'],
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        borderRadius: 6,
        barHeight: '62%',
        dataLabels: { position: 'center' as const },
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start' as const,
      offsetX: 8,
      style: { colors: ['#1f2937'], fontSize: '12px', fontWeight: 600 },
      formatter: (val: number) => `${val}`,
    },
    grid: { borderColor: '#f3f4f6', xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } }, padding: { left: 8, right: 16 } },
    xaxis: {
      categories: names,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        show: true,
        style: { colors: '#6b7280', fontSize: '12px', fontWeight: 500 },
        maxWidth: 160,
      },
    },
    tooltip: {
      theme: 'light' as const,
      y: {
        formatter: (val: number, opts: any) => {
          const idx = opts?.dataPointIndex ?? 0
          const p = reversed[idx]
          if (!p) return `${val}`
          return `${val} sold · ${p.order_count} order${p.order_count === 1 ? '' : 's'} · ${formatIn(p.revenue, shopCurrency.value.code)}`
        },
      },
      x: { show: true },
    },
    legend: { show: false },
    states: { hover: { filter: { type: 'darken' as const, value: 0.08 } }, active: { filter: { type: 'darken' as const, value: 0.12 } } },
    responsive: [{ breakpoint: 640, options: { chart: { height: Math.max(260, popularProducts.value.length * 64) } } }],
  }
})

const loadDashboardData = async (opts: { initial?: boolean } = {}) => {
  const isInitial = opts.initial ?? false
  if (isInitial) loading.value = true
  else analyticsLoading.value = true

  try {
    const res = await $apiFetch<any>(`/dashboard/stats?range=${range.value}`, { method: 'GET' })
    const data = res?.data

    if (data?.stats) {
      stats.value.totalProducts = data.stats.total_products ?? 0
      stats.value.totalOrders = data.stats.total_orders ?? 0
      stats.value.pendingOrders = data.stats.pending_orders ?? 0
      stats.value.totalRevenue = data.stats.total_revenue ?? 0
      stats.value.pendingRevenue = data.stats.pending_revenue ?? 0
    }

    if (data?.analytics) {
      analytics.value = data.analytics
    }

    if (data?.recent_orders) {
      recentOrders.value = data.recent_orders
    }
  } catch (err: any) {
    console.error('Error loading dashboard data:', err)
  } finally {
    loading.value = false
    analyticsLoading.value = false
  }
}

watch(range, () => {
  loadDashboardData()
})

onMounted(async () => {
  loadDashboardData({ initial: true })
  // Load ApexCharts only on client — avoids SSR window error
  if (import.meta.client) {
    try {
      const mod = await import('vue3-apexcharts')
      ApexChartComponent.value = mod.default
      apexReady.value = true
    } catch (e) {
      console.error('Failed to load ApexCharts', e)
    }
  }
})
</script>

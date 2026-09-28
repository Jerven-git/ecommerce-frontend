<template>
  <div class="relative w-full" :style="{ height: height + 'px' }">
    <canvas ref="canvasRef" :aria-label="ariaLabel" role="img" />
    <!-- Loading -->
    <div v-if="loading" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-admin-surface/80 backdrop-blur-[1px]">
      <span class="h-7 w-7 rounded-full border-2 border-admin-border border-t-admin-accent animate-spin" aria-hidden="true" />
      <span class="text-xs font-medium text-admin-muted">{{ loadingLabel }}</span>
    </div>
    <!-- Empty -->
    <div v-else-if="isEmpty" class="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
      <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-admin-soft text-admin-muted" v-html="emptyIcon" />
      <p class="text-sm font-semibold text-admin-text">{{ emptyTitle }}</p>
      <p class="max-w-[28ch] text-xs leading-relaxed text-admin-muted">{{ emptyDescription }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = withDefaults(defineProps<{
  type: 'doughnut' | 'bar' | 'line'
  data: any
  options?: any
  height?: number
  loading?: boolean
  loadingLabel?: string
  isEmpty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: string
  ariaLabel?: string
}>(), {
  height: 200,
  loading: false,
  loadingLabel: 'Loading chart…',
  isEmpty: false,
  emptyTitle: 'No data yet',
  emptyDescription: 'Data will appear here once available.',
  emptyIcon: '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 3v18h18M7 14l3-3 3 3 5-6" /></svg>',
  ariaLabel: 'Chart',
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const cssVar = (name: string, fallback: string) => {
  if (!import.meta.client) return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

// watch theme class on body to redraw with correct colors
const themeTick = ref(0)
let observer: MutationObserver | null = null
onMounted(() => {
  if (import.meta.client) {
    observer = new MutationObserver(() => themeTick.value++)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
  }
})

onBeforeUnmount(() => observer?.disconnect())

const render = () => {
  if (!canvasRef.value || props.loading || props.isEmpty) return
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
  // Resolve current admin tokens for Chart.js to stay in sync with light/dark
  void themeTick.value
  const textMuted = cssVar('--admin-text-muted', '#6b7280')
  const border = cssVar('--admin-border', '#e5e7eb')
  const accent = cssVar('--admin-accent', '#7c3aed')
  // merge defaults
  const baseOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 420, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: cssVar('--admin-surface', '#ffffff'),
        titleColor: cssVar('--admin-text', '#111827'),
        bodyColor: textMuted,
        borderColor: border,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 10,
        displayColors: true,
        boxPadding: 3,
      },
    },
  }
  if (props.type === 'bar' || props.type === 'line') {
    baseOptions.scales = {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: textMuted, font: { size: 11, family: 'Inter' }, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
      },
      y: {
        grid: { color: border, drawTicks: false, lineWidth: 1, borderDash: [4, 4] },
        border: { display: false },
        ticks: { color: textMuted, font: { size: 11, family: 'Inter' }, padding: 8 },
        beginAtZero: true,
      },
    }
  }
  if (props.type === 'doughnut') {
    baseOptions.cutout = '68%'
    baseOptions.plugins.tooltip.callbacks = {
      label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed} (${Math.round(ctx.parsed / ctx.dataset.data.reduce((a:number,b:number)=>a+b,0)*100)}%)`,
    }
  }

  const mergedOptions = {
    ...baseOptions,
    ...(props.options || {}),
    plugins: { ...baseOptions.plugins, ...(props.options?.plugins || {}) },
    scales: props.options?.scales ? props.options.scales : baseOptions.scales,
  }

  chartInstance = new Chart(canvasRef.value, {
    type: props.type as any,
    data: props.data,
    options: mergedOptions,
  })
}

watch(() => [props.data, props.options, props.type, props.loading, props.isEmpty, themeTick.value], () => nextTick(render), { deep: true })
onMounted(() => nextTick(render))
onBeforeUnmount(() => chartInstance?.destroy())
</script>

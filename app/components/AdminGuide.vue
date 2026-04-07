<template>
  <Teleport to="body">
    <Transition name="guide-fade">
      <div v-if="visible" class="fixed inset-0 z-[100]" @click.self="handleBackdropClick">

        <!-- Spotlight overlay with cutout -->
        <div class="absolute inset-0 pointer-events-none">
          <!-- Dark overlay with hole punched for target -->
          <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <mask id="guide-spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  v-if="spotlight"
                  :x="spotlight.x"
                  :y="spotlight.y"
                  :width="spotlight.w"
                  :height="spotlight.h"
                  rx="12"
                  fill="black"
                  style="transition: x 0.35s ease-out, y 0.35s ease-out, width 0.35s ease-out, height 0.35s ease-out;"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(17, 24, 39, 0.6)"
              mask="url(#guide-spotlight-mask)"
            />
          </svg>

          <!-- Highlight ring around target -->
          <div
            v-if="spotlight"
            class="absolute border-2 border-primary-400 rounded-xl pointer-events-none"
            :style="{
              top: spotlight.y + 'px',
              left: spotlight.x + 'px',
              width: spotlight.w + 'px',
              height: spotlight.h + 'px',
              transition: 'all 0.35s ease-out',
            }"
          >
            <div class="absolute inset-0 rounded-xl ring-4 ring-primary-400/20 animate-pulse" />
          </div>
        </div>

        <!-- Tooltip card -->
        <Transition name="guide-slide" mode="out-in">
          <div
            v-if="!transitioning"
            :key="step"
            class="absolute z-10 pointer-events-auto"
            :style="tooltipStyle"
          >
            <!-- Arrow -->
            <div
              v-if="spotlight && arrowSide"
              class="absolute w-3 h-3 bg-white border border-gray-200 rotate-45 z-[-1]"
              :class="{
                '-top-1.5 left-8': arrowSide === 'top',
                '-bottom-1.5 left-8': arrowSide === 'bottom',
                '-left-1.5 top-6': arrowSide === 'left',
                '-right-1.5 top-6': arrowSide === 'right',
              }"
            />

            <div ref="tooltipCardRef" class="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[380px] max-w-[88vw] max-h-[70vh] overflow-y-auto overflow-x-hidden">
              <!-- Progress bar -->
              <div class="h-1 bg-gray-100">
                <div
                  class="h-full bg-primary-500 transition-all duration-500 ease-out rounded-full"
                  :style="{ width: ((step + 1) / steps.length * 100) + '%' }"
                />
              </div>

              <div class="p-5">
                <!-- Step counter -->
                <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Step {{ step + 1 }} / {{ steps.length }}
                </p>

                <!-- Icon + Title -->
                <div class="flex items-start gap-3 mb-2">
                  <div
                    class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    :class="currentStep.iconBg"
                  >
                    <div v-html="currentStep.icon" />
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-base font-bold text-gray-900 leading-snug">{{ currentStep.title }}</h3>
                    <p class="text-sm text-gray-500 leading-relaxed mt-1">{{ currentStep.description }}</p>
                  </div>
                </div>

                <!-- Tips -->
                <ul v-if="currentStep.tips?.length" class="mt-3 ml-12 space-y-1.5">
                  <li
                    v-for="(tip, i) in currentStep.tips"
                    :key="i"
                    class="flex items-start gap-2 text-[13px] text-gray-600"
                  >
                    <span class="w-1 h-1 rounded-full bg-primary-400 shrink-0 mt-2" />
                    <span>{{ tip }}</span>
                  </li>
                </ul>
              </div>

              <!-- Keyboard hint -->
              <div class="px-5 pb-2 flex items-center gap-1.5 text-[11px] text-gray-400">
                <kbd class="inline-flex items-center justify-center w-5 h-5 rounded border border-gray-200 bg-gray-50 text-[10px] font-mono leading-none">&larr;</kbd>
                <kbd class="inline-flex items-center justify-center w-5 h-5 rounded border border-gray-200 bg-gray-50 text-[10px] font-mono leading-none">&rarr;</kbd>
                <span>or</span>
                <kbd class="inline-flex items-center justify-center h-5 px-1.5 rounded border border-gray-200 bg-gray-50 text-[10px] font-mono leading-none">Enter</kbd>
                <span>to navigate</span>
                <span class="mx-0.5">&middot;</span>
                <kbd class="inline-flex items-center justify-center h-5 px-1.5 rounded border border-gray-200 bg-gray-50 text-[10px] font-mono leading-none">Esc</kbd>
                <span>to close</span>
              </div>

              <!-- Footer -->
              <div class="px-5 pb-4 flex items-center justify-between gap-3">
                <!-- Dots -->
                <div class="flex items-center gap-1 flex-wrap max-w-[140px]">
                  <span
                    v-for="(_, i) in steps"
                    :key="i"
                    class="w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer hover:scale-150"
                    :class="i === step ? 'bg-primary-500 scale-125' : i < step ? 'bg-primary-200' : 'bg-gray-200'"
                    @click="jumpToStep(i)"
                  />
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <button
                    v-if="step > 0"
                    @click="prev"
                    class="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    @click="dismiss"
                    class="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    @click="next"
                    class="px-4 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    {{ step === steps.length - 1 ? 'Done!' : 'Next' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { guideSteps, type GuideStep } from '~/composables/useAdminGuide'

interface SpotlightRect {
  x: number
  y: number
  w: number
  h: number
}

const STORAGE_KEY = 'admin_guide_seen'
const PAD = 8
const GAP = 14

const visible = ref(false)
const step = ref(0)
const transitioning = ref(false)
const spotlight = ref<SpotlightRect | null>(null)
const arrowSide = ref<'top' | 'bottom' | 'left' | 'right' | null>(null)
const tooltipPos = ref<{ top: string; left: string }>({ top: '50%', left: '50%' })
const tooltipCardRef = ref<HTMLElement | null>(null)

const steps = guideSteps

const currentStep = computed(() => steps[step.value] as GuideStep)

// ── Positioning logic ──

const computePosition = (targetRect: DOMRect, prefer: string) => {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const tw = 380
  const maxTh = Math.min(vh * 0.7, 400) // max-h-[70vh] capped at 400
  const th = tooltipCardRef.value?.offsetHeight ?? maxTh
  const pad = PAD
  const gap = GAP

  const sx = targetRect.left - pad
  const sy = targetRect.top - pad
  const sw = targetRect.width + pad * 2
  const sh = targetRect.height + pad * 2

  spotlight.value = { x: sx, y: sy, w: sw, h: sh }

  const spaceRight = vw - (sx + sw) - gap
  const spaceLeft = sx - gap
  const spaceBottom = vh - (sy + sh) - gap
  const spaceTop = sy - gap

  type Side = 'right' | 'left' | 'bottom' | 'top'
  const fits: Record<Side, boolean> = {
    right: spaceRight >= tw,
    left: spaceLeft >= tw,
    bottom: spaceBottom >= th,
    top: spaceTop >= th,
  }

  const order: Side[] = [prefer as Side, 'right', 'bottom', 'left', 'top']
  let side: Side = 'bottom'
  for (const s of order) {
    if (fits[s]) { side = s; break }
  }

  let top = 0
  let left = 0

  if (side === 'right') {
    left = sx + sw + gap
    top = Math.max(16, Math.min(sy, vh - th - 16))
    arrowSide.value = 'left'
  } else if (side === 'left') {
    left = Math.max(16, sx - gap - tw)
    top = Math.max(16, Math.min(sy, vh - th - 16))
    arrowSide.value = 'right'
  } else if (side === 'bottom') {
    top = sy + sh + gap
    left = Math.max(16, Math.min(sx, vw - tw - 16))
    arrowSide.value = 'top'
  } else {
    top = Math.max(16, sy - gap - th)
    left = Math.max(16, Math.min(sx, vw - tw - 16))
    arrowSide.value = 'bottom'
  }

  // Clamp to viewport
  top = Math.max(16, Math.min(top, vh - th - 16))
  left = Math.max(16, Math.min(left, vw - tw - 16))

  tooltipPos.value = { top: top + 'px', left: left + 'px' }
}

const centerTooltip = () => {
  spotlight.value = null
  arrowSide.value = null
  tooltipPos.value = { top: '50%', left: '50%' }
}

const tooltipStyle = computed(() => {
  const base = { transition: 'top 0.35s ease-out, left 0.35s ease-out, transform 0.35s ease-out' }
  if (!spotlight.value) {
    return {
      ...base,
      top: tooltipPos.value.top,
      left: tooltipPos.value.left,
      transform: 'translate(-50%, -50%)',
    }
  }
  return {
    ...base,
    top: tooltipPos.value.top,
    left: tooltipPos.value.left,
  }
})

// ── Get the admin layout's scrollable main container ──

const getScrollContainer = (): Element | null => {
  return document.querySelector('main.overflow-y-auto') || document.documentElement
}

// ── Wait for target element to appear in the DOM ──

const waitForElement = (selector: string, timeout = 5000): Promise<Element | null> => {
  return new Promise((resolve) => {
    const el = document.querySelector(selector)
    if (el) return resolve(el)

    const start = Date.now()
    const interval = setInterval(() => {
      const found = document.querySelector(selector)
      if (found) {
        clearInterval(interval)
        resolve(found)
      } else if (Date.now() - start > timeout) {
        clearInterval(interval)
        resolve(null)
      }
    }, 50)
  })
}

// ── Scroll element into view within the admin layout's scroll container ──

const scrollToTarget = (el: Element): Promise<void> => {
  return new Promise((resolve) => {
    const container = getScrollContainer()
    if (!container) { resolve(); return }

    const rect = el.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    const isVisible =
      rect.top >= containerRect.top + 20 &&
      rect.bottom <= containerRect.bottom - 20

    if (isVisible) {
      resolve()
      return
    }

    const scrollTop = container.scrollTop + rect.top - containerRect.top - containerRect.height / 3
    container.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' })

    setTimeout(resolve, 250)
  })
}

// ── Focus current step (navigate + highlight) ──

const focusStep = async () => {
  const s = currentStep.value
  const route = useRoute()

  // Compare full path + query to handle tab/sub-tab switching
  const stepPath = s.route.split('?')[0]
  const currentUrl = route.fullPath.split('#')[0]
  const needsNav = route.path !== stepPath || currentUrl !== s.route

  if (needsNav) {
    transitioning.value = true
    await navigateTo(s.route)
    await new Promise(r => setTimeout(r, 150))
    transitioning.value = false
  }

  if (s.target) {
    const el = await waitForElement(s.target)
    if (el) {
      await scrollToTarget(el)
      const rect = el.getBoundingClientRect()
      computePosition(rect, s.prefer || 'right')
      // Recompute after tooltip renders to get actual height
      await nextTick()
      const rect2 = el.getBoundingClientRect()
      computePosition(rect2, s.prefer || 'right')
    } else {
      centerTooltip()
    }
  } else {
    centerTooltip()
  }
}

// ── Navigation ──

const next = async () => {
  if (step.value < steps.length - 1) {
    step.value++
    await focusStep()
  } else {
    dismiss()
    await navigateTo('/admin')
  }
}

const prev = async () => {
  if (step.value > 0) {
    step.value--
    await focusStep()
  }
}

const jumpToStep = async (target: number) => {
  if (target === step.value) return
  step.value = target
  await focusStep()
}

const dismiss = () => {
  visible.value = false
  spotlight.value = null
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, 'true')
  }
}

const handleBackdropClick = () => {
  // Don't dismiss on backdrop click — require explicit skip/done
}

const startGuide = async () => {
  step.value = 0
  visible.value = true
  await nextTick()
  await focusStep()
}

// Auto-show on first visit
onMounted(async () => {
  if (typeof window !== 'undefined') {
    const seen = localStorage.getItem(STORAGE_KEY)
    const route = useRoute()
    if (!seen && route.path === '/admin') {
      await new Promise(r => setTimeout(r, 500))
      visible.value = true
      await nextTick()
      await focusStep()
    }
  }
})

// ── Keyboard navigation ──

const onKeydown = (e: KeyboardEvent) => {
  if (!visible.value) return

  if (e.key === 'ArrowRight' || e.key === 'Enter') {
    e.preventDefault()
    next()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    prev()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    dismiss()
  }
}

// Re-calculate position on resize or scroll
const recalculate = () => {
  if (visible.value && currentStep.value.target) {
    const el = document.querySelector(currentStep.value.target)
    if (el) {
      computePosition(el.getBoundingClientRect(), currentStep.value.prefer || 'right')
    }
  }
}

let scrollContainer: Element | null = null

onMounted(() => {
  window.addEventListener('resize', recalculate)
  window.addEventListener('keydown', onKeydown)
  scrollContainer = getScrollContainer()
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', recalculate, { passive: true })
  }
})
onUnmounted(() => {
  window.removeEventListener('resize', recalculate)
  window.removeEventListener('keydown', onKeydown)
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', recalculate)
  }
})

defineExpose({ startGuide })
</script>

<style scoped>
.guide-fade-enter-active,
.guide-fade-leave-active {
  transition: opacity 0.3s ease;
}
.guide-fade-enter-from,
.guide-fade-leave-to {
  opacity: 0;
}

.guide-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.guide-slide-leave-active {
  transition: all 0.15s ease-in;
}
.guide-slide-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
.guide-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>

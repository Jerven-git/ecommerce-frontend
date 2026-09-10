<template>
  <MotionConfig reduced-motion="user">
    <div class="border-y border-secondary-200/70">
      <div
        v-for="(item, index) in items"
        :key="`${item.question}-${index}`"
        class="border-b border-secondary-200/70 last:border-b-0"
      >
        <h3>
          <button
            :id="triggerId(index)"
            type="button"
            class="group flex min-h-14 w-full items-center justify-between gap-5 py-5 text-left text-secondary-950 transition-colors duration-200 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
            :aria-expanded="openIndex === index"
            :aria-controls="panelId(index)"
            @click="toggle(index)"
          >
            <span class="text-base font-semibold">{{ item.question }}</span>
            <span
              class="relative grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-colors duration-200 group-hover:border-primary-300 group-hover:text-primary-700"
              :class="openIndex === index
                ? 'border-primary-300 bg-primary-50 text-primary-700'
                : 'border-secondary-200 text-secondary-600'"
              aria-hidden="true"
            >
              <span class="absolute h-0.5 w-3 rounded-full bg-current"></span>
              <motion.span
                class="absolute h-3 w-0.5 origin-center rounded-full bg-current"
                :initial="false"
                :animate="{
                  scaleY: openIndex === index ? 0 : 1,
                  opacity: openIndex === index ? 0 : 1,
                }"
                :transition="iconTransition"
              ></motion.span>
            </span>
          </button>
        </h3>

        <AnimatePresence :initial="false">
          <motion.div
            v-if="openIndex === index"
            :id="panelId(index)"
            :key="panelId(index)"
            role="region"
            :aria-labelledby="triggerId(index)"
            class="overflow-hidden"
            :initial="panelClosed"
            :animate="panelOpen"
            :exit="panelClosed"
            :transition="panelTransition"
          >
            <div class="pb-6 pr-12">
              <p class="max-w-3xl text-sm leading-7 text-gray-600">{{ item.answer }}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  </MotionConfig>
</template>

<script setup lang="ts">
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion-v'

interface AccordionItem {
  question: string
  answer: string
}

defineProps<{
  items: AccordionItem[]
}>()

const openIndex = ref<number | null>(null)
const accordionId = useId()
const prefersReducedMotion = useReducedMotion()

const triggerId = (index: number) => `${accordionId}-trigger-${index}`
const panelId = (index: number) => `${accordionId}-panel-${index}`

const panelOpen = { height: 'auto', opacity: 1, filter: 'blur(0px)' }

const panelClosed = computed(() => prefersReducedMotion.value
  ? { height: 0, opacity: 1, filter: 'blur(0px)' }
  : { height: 0, opacity: 0, filter: 'blur(3px)' })

const panelTransition = computed(() => prefersReducedMotion.value
  ? { duration: 0 }
  : {
      height: { type: 'spring', stiffness: 380, damping: 38, mass: 0.82 },
      opacity: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
      filter: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
    })

const iconTransition = computed(() => prefersReducedMotion.value
  ? { duration: 0 }
  : { type: 'spring', stiffness: 430, damping: 32, mass: 0.65 })

const toggle = (index: number) => {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

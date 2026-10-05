<template>
  <div
    ref="columnRef"
    class="apex-feature-column"
    :class="`apex-feature-column--${variant}`"
  >
    <component
      :is="variant === 'group' ? 'h3' : 'h4'"
      class="apex-feature-column__title"
      :class="{ 'apex-feature-column__title--entering': isTitleEntering }"
      @animationend="isTitleEntering = false"
    >
      {{ title }}
    </component>

    <p class="apex-feature-column__description">
      <span class="sr-only">{{ description }}</span>
      <span class="apex-feature-column__reserve" aria-hidden="true">{{ description }}</span>
      <span class="apex-feature-column__typed" aria-hidden="true">
        {{ typedDescription }}<span v-if="isTyping" class="apex-feature-column__caret" />
      </span>
    </p>

    <span v-if="detail" class="apex-feature-column__detail">{{ detail }}</span>
  </div>
</template>

<script setup lang="ts">
import { useReducedMotion } from 'motion-v'

const props = defineProps<{
  title: string
  description: string
  detail?: string
  variant: 'group' | 'item'
}>()

const columnRef = ref<HTMLElement | null>(null)
const typedDescription = ref(props.description)
const isTyping = ref(false)
const isTitleEntering = ref(false)
const prefersReducedMotion = useReducedMotion()

let columnObserver: IntersectionObserver | undefined
let columnIsOnScreen = false
let typingTimer: ReturnType<typeof setTimeout> | undefined
let typingCycle = 0
let compactViewport = false

function naturalTypingDelay(index: number) {
  const character = props.description[index - 1]
  if (character === '.' || character === '!' || character === '?') return 140
  if (character === ',' || character === ';' || character === ':') return 82
  if (character === ' ') return 16

  return 22 + ((index * 17) % 6) * 4
}

function stopTyping(showFullText = true) {
  typingCycle += 1
  if (typingTimer) clearTimeout(typingTimer)
  typingTimer = undefined
  isTyping.value = false
  typedDescription.value = showFullText ? props.description : ''
}

function startTyping() {
  stopTyping(false)

  if (prefersReducedMotion.value) {
    typedDescription.value = props.description
    return
  }

  const activeCycle = typingCycle
  const characterStep = compactViewport || props.description.length >= 100 ? 3 : 2
  let characterIndex = 1
  typedDescription.value = props.description.slice(0, characterIndex)
  isTyping.value = true

  const typeNextCharacter = () => {
    if (activeCycle !== typingCycle) return

    characterIndex = Math.min(characterIndex + characterStep, props.description.length)
    typedDescription.value = props.description.slice(0, characterIndex)

    if (characterIndex >= props.description.length) {
      isTyping.value = false
      typingTimer = undefined
      return
    }

    typingTimer = setTimeout(typeNextCharacter, naturalTypingDelay(characterIndex))
  }

  typingTimer = setTimeout(typeNextCharacter, props.variant === 'group' ? 100 : 150)
}

onMounted(() => {
  const column = columnRef.value
  if (!column) return

  compactViewport = window.matchMedia('(max-width: 639px)').matches

  columnObserver = new IntersectionObserver(([entry]) => {
    if (!entry) return

    if (!entry.isIntersecting) {
      columnIsOnScreen = false
      isTitleEntering.value = false
      stopTyping()
      return
    }

    if (entry.intersectionRatio >= 0.22 && !columnIsOnScreen) {
      columnIsOnScreen = true
      isTitleEntering.value = !prefersReducedMotion.value
      startTyping()
    }
  }, { threshold: [0, 0.22] })

  columnObserver.observe(column)
})

watch(prefersReducedMotion, (reduceMotion) => {
  if (reduceMotion) stopTyping()
  else if (columnIsOnScreen) startTyping()
})

onBeforeUnmount(() => {
  columnObserver?.disconnect()
  stopTyping()
})
</script>

<style scoped>
.apex-feature-column__title { margin: 0; font-family: 'Space Grotesk', var(--font-heading); font-weight: 600; }
.apex-feature-column--group .apex-feature-column__title { max-width: 15ch; font-size: clamp(1.75rem, 2.7vw, 2.5rem); line-height: 1.15; letter-spacing: -0.03em; }
.apex-feature-column--item .apex-feature-column__title { font-size: 1.12rem; letter-spacing: -0.02em; }
.apex-feature-column__title--entering { animation: apex-feature-column-title-enter 500ms cubic-bezier(0.16, 1, 0.3, 1) both; will-change: transform, opacity; }
.apex-feature-column__description { display: grid; color: var(--apex-text-muted); }
.apex-feature-column--group .apex-feature-column__description { max-width: 33ch; margin: 1rem 0 0; line-height: 1.6; }
.apex-feature-column--item .apex-feature-column__description { margin: 0.75rem 0 1.6rem; font-size: 0.93rem; line-height: 1.65; }
.apex-feature-column__reserve,
.apex-feature-column__typed { grid-area: 1 / 1; }
.apex-feature-column__reserve { visibility: hidden; }
.apex-feature-column__caret { display: inline-block; width: 1px; height: 1em; margin-left: 0.08em; background: currentcolor; vertical-align: -0.12em; animation: apex-feature-column-caret 720ms steps(1, end) infinite; }
.apex-feature-column__detail { margin-top: auto; border-top: 1px solid var(--apex-border-soft); padding-top: 0.75rem; color: var(--apex-text-caption); font-size: 0.72rem; font-weight: 700; }

@keyframes apex-feature-column-title-enter {
  from { opacity: 0.35; transform: translate3d(-2.5rem, 0, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}

@keyframes apex-feature-column-caret {
  0%, 48% { opacity: 1; }
  49%, 100% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .apex-feature-column__title--entering { animation: none; }
  .apex-feature-column__caret { display: none; }
}

@media (max-width: 639px) {
  .apex-feature-column--item .apex-feature-column__description { margin-bottom: 1rem; }
}

@media (max-width: 639px) and (prefers-reduced-motion: no-preference) {
  .apex-feature-column__title--entering { animation: apex-feature-column-title-enter-mobile 360ms cubic-bezier(0.16, 1, 0.3, 1) both; }
}

@keyframes apex-feature-column-title-enter-mobile {
  from { opacity: 0.45; transform: translate3d(-0.75rem, 0, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
</style>

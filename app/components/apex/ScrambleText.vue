<template>
  <span ref="root" class="apex-scramble-text">
    <span
      v-for="word in words"
      :key="word"
      class="apex-scramble-text__measure"
    >{{ word }}</span>
    <span ref="valueElement" class="apex-scramble-text__value">{{ words[0] }}</span>
  </span>
</template>

<script setup lang="ts">
import { animate, useReducedMotion } from 'motion-v'

const props = withDefaults(defineProps<{
  words: string[]
  hold?: number
  duration?: number
  autoplay?: boolean
}>(), {
  hold: 2200,
  duration: 1,
  autoplay: true,
})

const root = ref<HTMLElement | null>(null)
const valueElement = ref<HTMLElement | null>(null)
const prefersReducedMotion = useReducedMotion()

const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const glyphInterval = 0.045
let activeWordIndex = 0
let timeout: ReturnType<typeof setTimeout> | undefined
let currentAnimation: ReturnType<typeof animate> | null = null
let observer: IntersectionObserver | undefined
let isVisible = false

function randomGlyph() {
  return glyphs[Math.floor(Math.random() * glyphs.length)]
}

function stop() {
  clearTimeout(timeout)
  timeout = undefined
  currentAnimation?.stop()
  currentAnimation = null
  if (valueElement.value) valueElement.value.textContent = props.words[activeWordIndex] ?? props.words[0] ?? ''
}

function canAnimate() {
  return isVisible
    && !prefersReducedMotion.value
    && document.visibilityState === 'visible'
    && props.words.length > (props.autoplay ? 1 : 0)
}

function scheduleNext() {
  clearTimeout(timeout)
  if (!props.autoplay || !canAnimate()) return

  timeout = setTimeout(scrambleNext, props.hold)
}

function scrambleNext() {
  const element = valueElement.value
  if (!element || !canAnimate()) return

  const nextIndex = props.autoplay
    ? (activeWordIndex + 1) % props.words.length
    : activeWordIndex
  const source = props.words[activeWordIndex]
  const target = props.words[nextIndex]
  const characterCount = Math.max(source.length, target.length)
  const glyphSteps = Math.ceil(props.duration / glyphInterval)
  const animatedIndices = Array.from({ length: characterCount }, (_, index) => index)
    .filter(index => (target[index] ?? source[index] ?? '') !== ' ')
  const sequenceDenominator = Math.max(animatedIndices.length - 1, 1)
  const characterOrder = new Map(animatedIndices.map((index, order) => [index, order]))
  let lastGlyphStep = -1
  let scrambledCharacters = Array.from({ length: characterCount }, randomGlyph)

  currentAnimation?.stop()
  currentAnimation = animate(0, 1, {
    duration: props.duration,
    ease: 'linear',
    onUpdate: (progress) => {
      const glyphStep = Math.floor(progress * glyphSteps)

      if (glyphStep !== lastGlyphStep) {
        scrambledCharacters = scrambledCharacters.map(randomGlyph)
        lastGlyphStep = glyphStep
      }

      element.textContent = Array.from({ length: characterCount }, (_, index) => {
        const sourceCharacter = source[index] ?? ''
        const targetCharacter = target[index] ?? ''
        if (sourceCharacter === ' ' && targetCharacter === ' ') return ' '

        const sequenceProgress = (characterOrder.get(index) ?? 0) / sequenceDenominator
        const scrambleAt = sequenceProgress * 0.1
        const settleAt = 0.48 + sequenceProgress * 0.44

        if (progress < scrambleAt) return sourceCharacter
        if (progress >= settleAt) return targetCharacter
        return scrambledCharacters[index]
      })
        .join('')
    },
    onComplete: () => {
      element.textContent = target
      activeWordIndex = nextIndex
      currentAnimation = null
      scheduleNext()
    },
  })
}

function replay() {
  clearTimeout(timeout)
  scrambleNext()
}

function handleVisibilityChange() {
  if (document.visibilityState === 'hidden') stop()
  else scheduleNext()
}

watch(prefersReducedMotion, (reduceMotion) => {
  if (reduceMotion) {
    stop()
    activeWordIndex = 0
    if (valueElement.value) valueElement.value.textContent = props.words[0]
  } else {
    scheduleNext()
  }
})

watch(() => props.words, () => {
  stop()
  activeWordIndex = 0
  if (valueElement.value) valueElement.value.textContent = props.words[0] ?? ''
  scheduleNext()
}, { deep: true })

onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    isVisible = entry?.isIntersecting ?? false
    if (isVisible) scheduleNext()
    else stop()
  }, { threshold: 0.2 })

  if (root.value) observer.observe(root.value)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  stop()
  observer?.disconnect()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

defineExpose({ replay })
</script>

<style scoped>
.apex-scramble-text {
  display: inline-grid;
  contain: layout;
}

.apex-scramble-text__measure,
.apex-scramble-text__value {
  grid-area: 1 / 1;
}

.apex-scramble-text__measure {
  visibility: hidden;
}

.apex-scramble-text__value {
  position: relative;
  z-index: 1;
}
</style>

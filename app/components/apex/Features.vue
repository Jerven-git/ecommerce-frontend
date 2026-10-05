<template>
  <section id="features" class="apex-features" aria-labelledby="apex-features-title">
    <div class="apex-features__inner">
      <div
        ref="introRef"
        class="apex-features__intro"
        :class="{ 'apex-features__intro--entering': isIntroEntering }"
      >
        <h2 id="apex-features-title">The work behind every sale, <span>in one place.</span></h2>
        <p>
          <span class="sr-only">{{ introDescription }}</span>
          <span class="apex-features__description-visual" aria-hidden="true">
            <span
              v-for="word in introWords"
              :key="word.index"
              class="apex-features__description-word"
            >
              <span
                v-for="letter in word.letters"
                :key="letter.index"
                class="apex-features__description-letter"
                :style="introLetterStyle(letter.index)"
                @animationend="handleIntroLetterEnd(letter.index)"
              >{{ letter.character }}</span>
            </span>
          </span>
        </p>
      </div>

      <div class="apex-features__groups">
        <article v-for="group in groups" :key="group.title" class="apex-features__group">
          <ApexFeatureColumnMotion
            class="apex-features__group-intro"
            :title="group.title"
            :description="group.description"
            variant="group"
          />
          <div class="apex-features__items">
            <ApexFeatureColumnMotion
              v-for="item in group.items"
              :key="item.title"
              class="apex-features__item"
              :title="item.title"
              :description="item.description"
              :detail="item.detail"
              variant="item"
            />
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import ApexFeatureColumnMotion from './FeatureColumnMotion.vue'

const introDescription = 'From what you offer to how you fulfil it, SSU brings the day-to-day parts of your store into one workspace.'
let introLetterIndex = 0
const introWords = introDescription.split(' ').map((word, index) => ({
  index,
  letters: Array.from(word).map(character => ({ character, index: introLetterIndex++ })),
}))
const introLetterCount = introLetterIndex
const introRef = ref<HTMLElement | null>(null)
const isIntroEntering = ref(false)

let introObserver: IntersectionObserver | undefined
let introIsOnScreen = false

function introLetterStyle(index: number) {
  const entrances = [
    ['-2.75rem', '1rem', '-6deg'],
    ['0rem', '3.25rem', '4deg'],
    ['2.75rem', '-1.25rem', '6deg'],
    ['-1.5rem', '-2.5rem', '-4deg'],
    ['1.5rem', '2.5rem', '5deg'],
  ]
  const [x, y, rotation] = entrances[index % entrances.length]!

  return {
    '--letter-x': x,
    '--letter-y': y,
    '--letter-rotation': rotation,
    '--letter-delay': `${380 + Math.min(index * 12, 620)}ms`,
  }
}

function handleIntroLetterEnd(index: number) {
  if (index === introLetterCount - 1) isIntroEntering.value = false
}

onMounted(() => {
  const intro = introRef.value
  if (!intro) return

  introObserver = new IntersectionObserver(([entry]) => {
    if (!entry) return

    if (!entry.isIntersecting) {
      introIsOnScreen = false
      isIntroEntering.value = false
      return
    }

    if (entry.intersectionRatio >= 0.22 && !introIsOnScreen) {
      introIsOnScreen = true
      isIntroEntering.value = true
    }
  }, { threshold: [0, 0.22] })

  introObserver.observe(intro)
})

onBeforeUnmount(() => introObserver?.disconnect())

const groups = [
  {
    title: 'Show what you sell',
    description: 'Build a storefront around your products, services and own visual identity.',
    items: [
      {
        title: 'Products and categories',
        description: 'Organise products, options, stock and collections so customers can browse what matters.',
        detail: 'Catalogue · Variants · Collections',
      },
      {
        title: 'Services and content',
        description: 'Present services alongside store pages, blog posts and a theme you can adjust from the admin.',
        detail: 'Services · Pages · Appearance',
      },
    ],
  },
  {
    title: 'Run the sale',
    description: 'Keep the operational decisions behind each order close to the customer-facing store.',
    items: [
      {
        title: 'Orders and promotions',
        description: 'Manage purchases and backorders, with discounts and gift cards in the same workspace.',
        detail: 'Orders · Backorders · Discounts',
      },
      {
        title: 'Checkout settings',
        description: 'Configure the payment, shipping and tax options that apply to your business.',
        detail: 'Payments · Shipping · Tax',
      },
    ],
  },
  {
    title: 'Make it yours',
    description: 'Keep your brand recognizable while controlling how your team works in SSU.',
    items: [
      {
        title: 'Storefront appearance',
        description: 'Adjust theme colours, fonts and homepage content without editing code.',
        detail: 'Theme · Homepage · Content',
      },
      {
        title: 'Domain and team access',
        description: 'A verified custom domain can be configured for your store, while admin roles and permissions control team access.',
        detail: 'Domain · Users · Roles',
      },
    ],
  },
]
</script>

<style scoped>
.apex-features { scroll-margin-top: 5rem; border-top: 1px solid #ececec; background: #fff; color: #1a1a1a; }
.apex-features__inner { width: min(100%, 82rem); margin: 0 auto; padding: clamp(5rem, 9vw, 8rem) 1.5rem; }
.apex-features__intro { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(17rem, 0.7fr); align-items: end; gap: 2rem; margin-bottom: 3rem; }
.apex-features__intro h2 { max-width: 15ch; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.5rem, 4.8vw, 4.5rem); font-weight: 600; line-height: 1.12; letter-spacing: -0.03em; text-wrap: balance; }
.apex-features__intro h2 span { color: #747474; }
.apex-features__intro p { max-width: 29rem; margin: 0 0 0.35rem; color: #525252; font-size: 1.05rem; line-height: 1.65; }
.apex-features__description-visual { display: block; }
.apex-features__description-word { display: inline-block; margin-inline-end: 0.24em; white-space: nowrap; }
.apex-features__description-word:last-child { margin-inline-end: 0; }
.apex-features__description-letter { display: inline-block; }
.apex-features__intro--entering h2 { transform-origin: 50% 100%; animation: apex-features-foam-drop 900ms both; will-change: transform, opacity; }
.apex-features__intro--entering .apex-features__description-letter { animation: apex-features-letter-arrive 650ms cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: var(--letter-delay); backface-visibility: hidden; will-change: transform, opacity; }
.apex-features__groups { border-top: 1px solid #dedede; }
.apex-features__group { display: grid; grid-template-columns: minmax(14rem, 0.7fr) minmax(0, 1.3fr); gap: clamp(2rem, 6vw, 6rem); border-bottom: 1px solid #dedede; padding: clamp(2rem, 4vw, 3.5rem) 0; }
.apex-features__items { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(1.5rem, 3vw, 3rem); }
.apex-features__item { display: flex; min-width: 0; flex-direction: column; }

@keyframes apex-features-foam-drop {
  0% { opacity: 0.25; transform: translate3d(0, -5.5rem, 0) scaleX(0.96) scaleY(1.04); }
  58% { opacity: 1; transform: translate3d(0, 0, 0) scaleX(1.075) scaleY(0.87); }
  72% { transform: translate3d(0, -0.65rem, 0) scaleX(0.985) scaleY(1.035); }
  84% { transform: translate3d(0, 0, 0) scaleX(1.025) scaleY(0.97); }
  93% { transform: translate3d(0, -0.12rem, 0) scaleX(0.995) scaleY(1.008); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

@keyframes apex-features-letter-arrive {
  from { opacity: 0; transform: translate3d(var(--letter-x), var(--letter-y), 0) rotate(var(--letter-rotation)) scale(0.94); }
  to { opacity: 1; transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .apex-features__intro--entering h2 { animation: apex-features-intro-fade 180ms ease-out both; }
  .apex-features__intro--entering .apex-features__description-letter { animation: apex-features-intro-fade 180ms ease-out both; animation-delay: 0ms; }

  @keyframes apex-features-intro-fade {
    from { opacity: 0.65; }
    to { opacity: 1; }
  }
}

@media (max-width: 900px) {
  .apex-features__intro, .apex-features__group { grid-template-columns: 1fr; }
  .apex-features__intro { gap: 1rem; }
  .apex-features__group { gap: 2rem; }
}

@media (max-width: 639px) {
  .apex-features__inner { padding: 4.5rem 1.25rem; }
  .apex-features__intro p { font-size: 0.95rem; }
  .apex-features__items { grid-template-columns: 1fr; gap: 1.7rem; }
}
</style>

<template>
  <section id="features" class="border-t border-gray-100 bg-white py-16 lg:py-20">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="max-w-2xl">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">Everything you need to sell</h2>
        <p class="mt-3 text-gray-600">Store, content and orders in one place, built from the capabilities already in your SSU admin.</p>
      </div>

      <div class="impact-row mt-10" @mouseleave="resetActiveCard">
        <article
          v-for="(feature, index) in features"
          :key="feature.title"
          class="impact-card relative min-w-0"
          :class="{ 'is-active': activeCard === index }"
          :style="{ '--feature-accent': feature.accent }"
          @pointerenter="activateCard(index)"
        >
          <motion.div
            class="impact-card-inner relative"
            :animate="{ rotateY: isFlipped(index) ? 180 : 0 }"
            :transition="{ duration: prefersReducedMotion ? 0 : 0.42, ease: 'easeOut' }"
          >
            <div class="impact-face impact-front" :aria-hidden="isFlipped(index)">
              <div class="impact-content">
                <div class="impact-copy">
                  <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ feature.category }}</span>

                  <div>
                    <h3 class="text-xl font-semibold tracking-[-0.03em] text-gray-900">{{ feature.title }}</h3>
                    <p :id="`feature-${index}-summary`" class="mt-3 text-sm leading-relaxed text-gray-600">{{ feature.summary }}</p>
                    <span class="impact-action mt-5 inline-flex items-center gap-2 text-xs font-semibold text-gray-900">
                      Click for details
                      <Icon name="heroicons:arrow-up-right" class="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </div>

                <div class="impact-visual">
                  <Icon :name="feature.icon" class="h-16 w-16 text-gray-900" aria-hidden="true" />
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="tag in feature.tags"
                      :key="tag"
                      class="rounded-md bg-white/75 px-2 py-1 text-[0.6875rem] font-semibold text-gray-800"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="impact-face impact-back" :aria-hidden="!isFlipped(index)">
              <div class="impact-content">
                <div class="impact-copy">
                  <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">Inside SSU</span>

                  <div>
                    <h3 class="text-xl font-semibold tracking-[-0.03em] text-gray-900">{{ feature.title }}</h3>
                    <p :id="`feature-${index}-details`" class="mt-3 text-sm leading-relaxed text-gray-700">{{ feature.description }}</p>
                    <span class="impact-action mt-5 inline-flex items-center gap-2 text-xs font-semibold text-gray-900">
                      Show overview
                      <Icon name="heroicons:arrow-uturn-left" class="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </div>

                <div class="impact-visual impact-visual-back">
                  <Icon :name="feature.icon" class="h-14 w-14 text-gray-900" aria-hidden="true" />
                  <p class="max-w-44 text-sm font-semibold leading-snug text-gray-900">{{ feature.detail }}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <button
            type="button"
            class="impact-card-toggle absolute inset-0 z-10 rounded-2xl"
            :aria-label="`${feature.title}: ${isFlipped(index) ? 'show overview' : 'show details'}`"
            :aria-describedby="isFlipped(index) ? `feature-${index}-details` : `feature-${index}-summary`"
            :aria-controls="`feature-${index}-details`"
            :aria-expanded="isFlipped(index)"
            @focus="activateCard(index)"
            @click="toggleCard(index)"
          />
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { motion, useReducedMotion } from 'motion-v'

const activeCard = ref(0)
const flippedCard = ref<number | null>(null)
const prefersReducedMotion = useReducedMotion()

function isFlipped(index: number) {
  return flippedCard.value === index
}

function activateCard(index: number) {
  if (flippedCard.value === null) {
    activeCard.value = index
  }
}

function resetActiveCard() {
  activeCard.value = flippedCard.value ?? 0
}

function toggleCard(index: number) {
  activeCard.value = index
  flippedCard.value = isFlipped(index) ? null : index
}

const features = [
  {
    title: 'Products & Categories',
    category: 'Catalog',
    summary: 'Build a flexible catalog that stays easy to browse and manage.',
    description: 'Create products, variants, stock, categories and collections from one connected catalog.',
    detail: 'One catalog for every product, option and collection.',
    tags: ['Products', 'Variants', 'Collections'],
    icon: 'heroicons:squares-2x2',
    accent: '#D8F7A7',
  },
  {
    title: 'Services & Booking',
    category: 'Scheduling',
    summary: 'Sell time and expertise alongside your physical products.',
    description: 'Offer services with their own categories and make scheduling part of your storefront.',
    detail: 'Turn your services into a bookable storefront offer.',
    tags: ['Services', 'Categories', 'Booking'],
    icon: 'heroicons:calendar-days',
    accent: '#C9D9FF',
  },
  {
    title: 'Orders & Backorders',
    category: 'Fulfilment',
    summary: 'Keep every purchase, promotion and delayed item organised.',
    description: 'Track orders and backorders while managing discounts and gift cards in the same workflow.',
    detail: 'A clear path from new order to fulfilled purchase.',
    tags: ['Orders', 'Backorders', 'Discounts'],
    icon: 'heroicons:clipboard-document-check',
    accent: '#E2D8FF',
  },
  {
    title: 'Shipping, Tax & Payments',
    category: 'Checkout',
    summary: 'Configure the essentials behind a dependable checkout.',
    description: 'Set up shipping carriers, tax rules and payment gateways for the way your business sells.',
    detail: 'Checkout settings that fit the way you operate.',
    tags: ['Shipping', 'Tax', 'Payments'],
    icon: 'heroicons:credit-card',
    accent: '#FFD8C2',
  },
  {
    title: 'Blog, Pages & Theme',
    category: 'Content',
    summary: 'Shape your storefront and publish content without touching code.',
    description: 'Manage posts, pages, hero content, theme colours and fonts directly from your admin.',
    detail: 'Keep the storefront on-brand without a developer.',
    tags: ['Blog', 'Pages', 'Theme'],
    icon: 'heroicons:paint-brush',
    accent: '#F8E1A6',
  },
  {
    title: 'Custom Domain & Roles',
    category: 'Administration',
    summary: 'Use your own domain and give the right access to your team.',
    description: 'Point and verify your domain, then manage admin users with clear roles and permissions.',
    detail: 'Own your address and keep team access controlled.',
    tags: ['Domain', 'Users', 'Permissions'],
    icon: 'heroicons:globe-alt',
    accent: '#BDECE3',
  },
]
</script>

<style scoped>
.impact-row {
  display: grid;
  gap: 0.75rem;
}

.impact-card {
  container-type: inline-size;
  min-height: 26rem;
  perspective: 1100px;
}

.impact-card-toggle {
  cursor: pointer;
  background: transparent;
}

.impact-card-toggle:focus-visible {
  outline: 2px solid var(--apex-focus-on-light);
  outline-offset: 4px;
}

.impact-card-inner {
  display: grid;
  min-height: inherit;
  height: 100%;
  transform-style: preserve-3d;
}

.impact-face {
  position: relative;
  display: flex;
  grid-area: 1 / 1;
  min-width: 0;
  border-radius: 1rem;
  background: #f8f8f3;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.impact-back {
  transform: rotateY(180deg);
}

.impact-content {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column-reverse;
  gap: 0.75rem;
  padding: 0.75rem;
}

.impact-copy {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  overflow-wrap: anywhere;
}

.impact-copy > * {
  min-width: 0;
}

.impact-action {
  flex-wrap: wrap;
}

.impact-visual {
  display: flex;
  min-width: 0;
  min-height: 10.5rem;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  border-radius: 0.75rem;
  background: var(--feature-accent);
  padding: 1.25rem;
  overflow-wrap: anywhere;
}

.impact-visual > * {
  max-width: 100%;
}

.impact-visual-back {
  justify-content: space-between;
}

@media (min-width: 640px) and (max-width: 1279px) {
  .impact-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .impact-row {
    display: flex;
    min-height: 28rem;
    align-items: stretch;
    gap: 0.5rem;
  }

  .impact-card {
    min-height: 28rem;
    flex: 1 1 0;
    transition: flex-grow 420ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .impact-card.is-active {
    flex-grow: 3.25;
  }

  .impact-card:not(.is-active) .impact-content {
    width: 100%;
    gap: 0;
  }

  .impact-card:not(.is-active) .impact-copy {
    width: 100%;
    flex: 1 1 auto;
    padding: 1.25rem 1rem;
  }

  .impact-card:not(.is-active) .impact-visual {
    display: none;
  }

  .impact-card:not(.is-active) .impact-action {
    gap: 0.25rem;
    font-size: 0.6875rem;
  }

  @container (min-width: 24rem) {
    .impact-card.is-active .impact-content {
      flex-direction: row;
      gap: 1.5rem;
    }

    .impact-card.is-active .impact-copy {
      flex: 1 1 40%;
      padding: 1.25rem 0 1.25rem 1.25rem;
    }

    .impact-card.is-active .impact-visual {
      min-width: 0;
      flex: 1 1 60%;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .impact-card {
    transition-duration: 0.01ms;
  }
}
</style>

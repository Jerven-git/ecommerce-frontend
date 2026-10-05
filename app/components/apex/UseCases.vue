<template>
  <section id="use-cases" class="apex-use-cases" aria-labelledby="apex-use-cases-title">
    <div class="apex-use-cases__inner">
      <div class="apex-use-cases__intro">
        <h2 id="apex-use-cases-title">Built for the business you have in mind.</h2>
        <p>Start with a new idea or set up the business you already run.</p>
      </div>

      <div
        ref="journeyRef"
        class="apex-use-cases__journey"
        :class="{ 'apex-use-cases__journey--engaged': activeCaseIndex !== null }"
        @focusout="handleFocusOut"
        @pointerleave="handlePointerLeave"
      >
        <div class="apex-use-cases__origin">
          <span>SSU</span>
          <strong>Storefront + workspace</strong>
        </div>

        <svg class="apex-use-cases__connectors apex-use-cases__connectors--branch" viewBox="0 0 1000 112" preserveAspectRatio="none" aria-hidden="true">
          <path v-for="path in branchPaths" :key="`branch-${path}`" :d="path" class="apex-use-cases__connector-base" />
          <path
            v-for="(path, index) in branchPaths"
            :key="`branch-active-${path}`"
            :d="path"
            class="apex-use-cases__connector-active"
            :class="{ 'is-active': activeCaseIndex === index }"
            pathLength="1"
          />
        </svg>

        <div class="apex-use-cases__paths">
          <article
            v-for="(useCase, caseIndex) in useCases"
            :key="useCase.title"
            class="apex-use-cases__case"
            :class="{ 'is-active': activeCaseIndex === caseIndex }"
            @focusin="activateCase(caseIndex)"
            @pointerenter="activateCase(caseIndex)"
          >
            <figure class="apex-use-cases__visual">
              <div class="apex-use-cases__image">
                <img
                  :src="useCase.image.src"
                  :srcset="useCase.image.srcset"
                  sizes="(min-width: 901px) 40rem, 100vw"
                  width="960"
                  height="640"
                  :alt="useCase.image.alt"
                  loading="lazy"
                  decoding="async"
                >
              </div>
              <figcaption>{{ useCase.image.caption }}</figcaption>
            </figure>

            <div class="apex-use-cases__copy">
              <h3>{{ useCase.title }}</h3>
              <p>{{ useCase.description }}</p>

              <ol class="apex-use-cases__steps" :aria-label="`${useCase.title} journey`">
                <li v-for="(step, stepIndex) in useCase.steps" :key="step">
                  <button
                    type="button"
                    class="apex-use-cases__step"
                    :class="{ 'is-active': isStepActive(caseIndex, stepIndex) }"
                    :aria-pressed="isStepActive(caseIndex, stepIndex)"
                    @focus="activateStep(caseIndex, stepIndex)"
                    @pointerenter="activateStep(caseIndex, stepIndex)"
                    @click="activateStep(caseIndex, stepIndex)"
                  >
                    <span class="apex-use-cases__step-node" aria-hidden="true" />
                    <span>{{ step }}</span>
                    <Icon name="heroicons:arrow-right" aria-hidden="true" />
                  </button>
                </li>
              </ol>
            </div>
          </article>
        </div>

        <svg class="apex-use-cases__connectors apex-use-cases__connectors--merge" viewBox="0 0 1000 104" preserveAspectRatio="none" aria-hidden="true">
          <path v-for="path in mergePaths" :key="`merge-${path}`" :d="path" class="apex-use-cases__connector-base" />
          <path
            v-for="(path, index) in mergePaths"
            :key="`merge-active-${path}`"
            :d="path"
            class="apex-use-cases__connector-active"
            :class="{ 'is-active': activeCaseIndex === index }"
            pathLength="1"
          />
        </svg>

        <div class="apex-use-cases__outcome">
          <p>Your storefront and your day-to-day tools stay connected.</p>
          <NuxtLink :to="isAuthenticated ? '/admin' : '/register'" class="apex-use-cases__action">
            {{ isAuthenticated ? 'Open dashboard' : 'Create your store' }}
            <Icon name="heroicons:arrow-up-right" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ isAuthenticated: boolean }>()

const journeyRef = ref<HTMLElement | null>(null)
const activeCaseIndex = ref<number | null>(null)
const activeStepKey = ref<string | null>(null)

const branchPaths = [
  'M500 0V30Q500 42 488 42H250Q238 42 238 54V112',
  'M500 0V30Q500 42 512 42H750Q762 42 762 54V112',
]

const mergePaths = [
  'M238 0V50Q238 62 250 62H488Q500 62 500 74V104',
  'M762 0V50Q762 62 750 62H512Q500 62 500 74V104',
]

const useCases = [
  {
    title: 'Start something new.',
    description: 'Choose a look, add your products or services, and set up the store settings you need before you begin selling.',
    image: {
      src: '/images/ForestGreen/food-960.webp',
      srcset: '/images/ForestGreen/food-640.webp 640w, /images/ForestGreen/food-960.webp 960w, /images/ForestGreen/food-1440.webp 1440w',
      alt: 'Food photography used in an SSU demonstration storefront theme',
      caption: 'Demonstration theme visual',
    },
    steps: ['Choose your look', 'Add what you sell', 'Run your store'],
  },
  {
    title: 'Set up your existing business.',
    description: 'Add your current catalogue and configure your brand, checkout and fulfilment settings on SSU at your own pace.',
    image: {
      src: '/images/MinimalMono/laptop-960.webp',
      srcset: '/images/MinimalMono/laptop-640.webp 640w, /images/MinimalMono/laptop-960.webp 960w, /images/MinimalMono/laptop-1440.webp 1440w',
      alt: 'Desk photography used in an SSU demonstration storefront theme',
      caption: 'Demonstration theme visual',
    },
    steps: ['Add your catalogue', 'Set your preferences', 'Manage from SSU'],
  },
]

function stepKey(caseIndex: number, stepIndex: number) {
  return `${caseIndex}-${stepIndex}`
}

function isStepActive(caseIndex: number, stepIndex: number) {
  return activeStepKey.value === stepKey(caseIndex, stepIndex)
}

function activateCase(caseIndex: number) {
  activeCaseIndex.value = caseIndex
  if (!activeStepKey.value?.startsWith(`${caseIndex}-`)) activeStepKey.value = null
}

function activateStep(caseIndex: number, stepIndex: number) {
  activeCaseIndex.value = caseIndex
  activeStepKey.value = stepKey(caseIndex, stepIndex)
}

function clearActivePath() {
  activeCaseIndex.value = null
  activeStepKey.value = null
}

function handleFocusOut(event: FocusEvent) {
  const nextTarget = event.relatedTarget
  if (!(nextTarget instanceof Node) || !journeyRef.value?.contains(nextTarget)) clearActivePath()
}

function handlePointerLeave(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return

  const focusedElement = document.activeElement
  if (!(focusedElement instanceof Node) || !journeyRef.value?.contains(focusedElement)) clearActivePath()
}
</script>

<style scoped>
.apex-use-cases { scroll-margin-top: 5rem; background: #f7f7f5; color: #1a1a1a; }
.apex-use-cases__inner { width: min(100%, 82rem); margin: 0 auto; padding: clamp(5rem, 9vw, 8rem) 1.5rem; }
.apex-use-cases__intro { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(17rem, 0.7fr); align-items: end; gap: 2rem; margin-bottom: clamp(3.5rem, 7vw, 6rem); }
.apex-use-cases__intro h2 { max-width: 15ch; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.5rem, 4.8vw, 4.5rem); font-weight: 600; line-height: 1.12; letter-spacing: -0.03em; text-wrap: balance; }
.apex-use-cases__intro p { max-width: 29rem; margin: 0 0 0.35rem; color: #525252; font-size: 1.05rem; line-height: 1.65; }
.apex-use-cases__origin { display: flex; width: max-content; max-width: 100%; flex-direction: column; align-items: center; gap: 0.18rem; margin: 0 auto; border-block: 1px solid #cfcfca; padding: 0.85rem 1.5rem; text-align: center; }
.apex-use-cases__origin span { font-size: 0.72rem; font-weight: 800; letter-spacing: 0.14em; }
.apex-use-cases__origin strong { font-family: 'Space Grotesk', var(--font-heading); font-size: 1rem; font-weight: 600; }
.apex-use-cases__connectors { display: block; width: 100%; overflow: visible; }
.apex-use-cases__connectors--branch { height: clamp(4.5rem, 8vw, 7rem); }
.apex-use-cases__connectors--merge { height: clamp(4rem, 7.5vw, 6.5rem); }
.apex-use-cases__connector-base,
.apex-use-cases__connector-active { fill: none; vector-effect: non-scaling-stroke; stroke-linecap: round; stroke-linejoin: round; }
.apex-use-cases__connector-base { stroke: #cecec8; stroke-width: 1; }
.apex-use-cases__connector-active { opacity: 0; stroke: #1a1a1a; stroke-width: 1.5; stroke-dasharray: 1; stroke-dashoffset: 1; transition: opacity 220ms ease, stroke-dashoffset 480ms cubic-bezier(0.16, 1, 0.3, 1); }
.apex-use-cases__connector-active.is-active { opacity: 1; stroke-dashoffset: 0; }
.apex-use-cases__paths { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr); gap: clamp(2.5rem, 6vw, 6rem); }
.apex-use-cases__case { min-width: 0; border-top: 1px solid #bdbdb7; padding-top: clamp(1.25rem, 2.5vw, 2rem); transition: opacity 280ms ease, transform 380ms cubic-bezier(0.16, 1, 0.3, 1); }
.apex-use-cases__journey--engaged .apex-use-cases__case:not(.is-active) { opacity: 0.42; transform: scale(0.985); }
.apex-use-cases__case.is-active { transform: translateY(-0.3rem); }
.apex-use-cases__visual { position: relative; margin: 0 0 clamp(1.5rem, 3vw, 2.25rem); }
.apex-use-cases__image { height: clamp(14rem, 25vw, 21rem); overflow: hidden; border-radius: 0.75rem; background: #e6e3df; }
.apex-use-cases__image img { display: block; width: 100%; height: 100%; object-fit: cover; transform: scale(1.001); transition: transform 480ms cubic-bezier(0.16, 1, 0.3, 1), filter 320ms ease; }
.apex-use-cases__case.is-active .apex-use-cases__image img { filter: saturate(1.04) contrast(1.02); transform: scale(1.025); }
.apex-use-cases__visual figcaption { position: absolute; right: 0.75rem; bottom: 0.75rem; border-radius: 0.35rem; background: #fff; padding: 0.42rem 0.62rem; color: #242424; font-size: 0.68rem; font-weight: 700; }
.apex-use-cases__copy { display: grid; grid-template-columns: minmax(0, 1fr) minmax(10.5rem, 0.6fr); column-gap: clamp(1.5rem, 3vw, 2.75rem); }
.apex-use-cases__copy h3 { grid-column: 1 / -1; max-width: 18ch; margin: 0; font-family: 'Space Grotesk', var(--font-heading); font-size: clamp(1.65rem, 2.7vw, 2.4rem); font-weight: 600; line-height: 1.16; letter-spacing: -0.03em; }
.apex-use-cases__copy > p { max-width: 43ch; margin: 0.8rem 0 0; color: #525252; line-height: 1.65; }
.apex-use-cases__steps { display: grid; align-content: start; gap: 0; margin: 0.9rem 0 0; padding: 0; list-style: none; }
.apex-use-cases__steps li { position: relative; }
.apex-use-cases__steps li:not(:last-child)::after { position: absolute; top: 1.6rem; bottom: -0.35rem; left: 0.27rem; width: 1px; background: #cfcfca; content: ''; transition: background-color 260ms ease; }
.apex-use-cases__step { display: grid; width: 100%; min-height: 2.25rem; grid-template-columns: 0.6rem minmax(0, 1fr) 0.9rem; align-items: center; gap: 0.55rem; border: 0; border-radius: 0.4rem; background: transparent; padding: 0.3rem 0; color: #5d5d5a; font: inherit; font-size: 0.76rem; font-weight: 700; text-align: left; cursor: pointer; transition: color 220ms ease, transform 320ms cubic-bezier(0.16, 1, 0.3, 1); }
.apex-use-cases__step:hover,
.apex-use-cases__step.is-active { color: #1a1a1a; transform: translateX(0.25rem); }
.apex-use-cases__step:focus-visible { outline: 2px solid var(--apex-focus-on-light); outline-offset: 3px; }
.apex-use-cases__step-node { position: relative; z-index: 1; width: 0.6rem; height: 0.6rem; border: 1px solid #9d9d98; border-radius: 50%; background: #f7f7f5; transition: border-color 220ms ease, background-color 220ms ease, transform 320ms cubic-bezier(0.16, 1, 0.3, 1); }
.apex-use-cases__step:hover .apex-use-cases__step-node,
.apex-use-cases__step.is-active .apex-use-cases__step-node { border-color: #1a1a1a; background: #1a1a1a; transform: scale(1.15); }
.apex-use-cases__step :deep(svg) { width: 0.85rem; height: 0.85rem; opacity: 0; transform: translateX(-0.35rem); transition: opacity 220ms ease, transform 320ms cubic-bezier(0.16, 1, 0.3, 1); }
.apex-use-cases__step:hover :deep(svg),
.apex-use-cases__step.is-active :deep(svg) { opacity: 1; transform: translateX(0); }
.apex-use-cases__outcome { display: flex; width: min(100%, 48rem); align-items: center; justify-content: space-between; gap: 2rem; margin: 0 auto; border-block: 1px solid #cfcfca; padding: clamp(1.25rem, 2.5vw, 1.75rem) 0; }
.apex-use-cases__outcome p { max-width: 24ch; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(1.4rem, 2.4vw, 2rem); font-weight: 600; line-height: 1.25; letter-spacing: -0.02em; }
.apex-use-cases__action { display: inline-flex; min-height: 3.25rem; flex: 0 0 auto; align-items: center; gap: 0.75rem; border-radius: 0.75rem; background: #1a1a1a; padding: 0.75rem 1.1rem; color: #fff; font-size: 0.85rem; font-weight: 700; text-decoration: none; transition: background-color 180ms ease, transform 180ms ease; }
.apex-use-cases__action:hover { background: #353535; transform: translateY(-2px); }
.apex-use-cases__action:focus-visible { outline: 2px solid var(--apex-focus-on-light); outline-offset: 4px; }
.apex-use-cases__action :deep(svg) { width: 1.1rem; height: 1.1rem; }

@media (max-width: 1100px) {
  .apex-use-cases__copy { grid-template-columns: 1fr; }
  .apex-use-cases__copy > p { margin-bottom: 0.5rem; }
}

@media (max-width: 900px) {
  .apex-use-cases__intro { grid-template-columns: 1fr; gap: 1rem; }
  .apex-use-cases__origin { width: 100%; align-items: flex-start; padding-inline: 0; text-align: left; }
  .apex-use-cases__connectors { display: none; }
  .apex-use-cases__paths { position: relative; grid-template-columns: 1fr; gap: 0; padding-left: 2rem; }
  .apex-use-cases__paths::before { position: absolute; top: 0; bottom: 0; left: 0.5rem; width: 1px; background: #cecec8; content: ''; }
  .apex-use-cases__case { position: relative; border-top: 0; border-bottom: 1px solid #cecec8; padding: 2.5rem 0; }
  .apex-use-cases__case::before { position: absolute; top: 2.85rem; left: -1.78rem; width: 0.55rem; height: 0.55rem; border: 1px solid #9d9d98; border-radius: 50%; background: #f7f7f5; content: ''; transition: border-color 220ms ease, background-color 220ms ease, transform 320ms cubic-bezier(0.16, 1, 0.3, 1); }
  .apex-use-cases__case.is-active { transform: none; }
  .apex-use-cases__case.is-active::before { border-color: #1a1a1a; background: #1a1a1a; transform: scale(1.15); }
  .apex-use-cases__image { height: clamp(16rem, 52vw, 27rem); }
  .apex-use-cases__copy { grid-template-columns: minmax(0, 1fr) minmax(11rem, 0.55fr); }
  .apex-use-cases__outcome { width: auto; margin: 2rem 0 0 2rem; }
}

@media (max-width: 639px) {
  .apex-use-cases__inner { padding: 4.5rem 1.25rem; }
  .apex-use-cases__intro { margin-bottom: 3.5rem; }
  .apex-use-cases__intro p { font-size: 0.95rem; }
  .apex-use-cases__paths { padding-left: 1.5rem; }
  .apex-use-cases__paths::before { left: 0.3rem; }
  .apex-use-cases__case::before { left: -1.47rem; }
  .apex-use-cases__image { height: 15rem; border-radius: 0.65rem; }
  .apex-use-cases__visual figcaption { right: 0.6rem; bottom: 0.6rem; }
  .apex-use-cases__copy { grid-template-columns: 1fr; }
  .apex-use-cases__copy > p { margin-bottom: 0.7rem; }
  .apex-use-cases__steps { margin-top: 0; }
  .apex-use-cases__step { min-height: 2.75rem; }
  .apex-use-cases__steps li:not(:last-child)::after { top: 1.9rem; bottom: -0.45rem; }
  .apex-use-cases__outcome { flex-direction: column; align-items: stretch; gap: 1.25rem; margin-left: 1.5rem; }
  .apex-use-cases__action { width: 100%; justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .apex-use-cases__connector-active,
  .apex-use-cases__case,
  .apex-use-cases__case::before,
  .apex-use-cases__image img,
  .apex-use-cases__step,
  .apex-use-cases__step-node,
  .apex-use-cases__step :deep(svg),
  .apex-use-cases__action { transition-duration: 0ms; }

  .apex-use-cases__action:hover,
  .apex-use-cases__case.is-active,
  .apex-use-cases__journey--engaged .apex-use-cases__case:not(.is-active),
  .apex-use-cases__step:hover,
  .apex-use-cases__step.is-active { transform: none; }
}
</style>

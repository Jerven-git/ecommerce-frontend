<template>
  <section class="apex-final" aria-labelledby="apex-final-title">
    <div class="apex-final__inner">
      <h2 id="apex-final-title" :aria-label="finalTitle">
        <ApexScrambleText
          ref="titleScramble"
          :words="finalTitleWords"
          :autoplay="false"
          aria-hidden="true"
        />
      </h2>
      <p v-if="isAuthenticated">Your DATABASY workspace is ready when you are.</p>
      <p v-else>Create an account, choose a plan to activate selling, and shape a storefront that feels like your business.</p>
      <NuxtLink
        :to="isAuthenticated ? '/admin' : '/register'"
        class="apex-final__action"
        @pointerenter="replayTitle"
        @focus="replayTitle"
      >
        {{ isAuthenticated ? 'Open dashboard' : 'Create your store' }}
        <Icon name="heroicons:arrow-up-right" aria-hidden="true" />
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{ isAuthenticated: boolean }>()

const titleScramble = ref<{ replay: () => void } | null>(null)
const finalTitle = computed(() => props.isAuthenticated
  ? 'Ready to keep building?'
  : 'Ready to create your store?')
const finalTitleWords = computed(() => [finalTitle.value])

function replayTitle() {
  titleScramble.value?.replay()
}
</script>

<style scoped>
.apex-final { background: var(--apex-action); color: var(--apex-on-action); }
.apex-final__inner { width: min(100%, 82rem); margin: 0 auto; padding: clamp(5rem, 9vw, 8rem) 1.5rem; text-align: center; }
.apex-final h2 { max-width: 17ch; margin: 0 auto; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.8rem, 5.5vw, 5.3rem); font-weight: 600; line-height: 1.08; letter-spacing: -0.03em; text-wrap: balance; }
.apex-final p { max-width: 40rem; margin: 1.35rem auto 2rem; color: var(--apex-on-dark-muted); font-size: 1.05rem; line-height: 1.65; }
.apex-final__action { display: inline-flex; min-height: 3.4rem; align-items: center; justify-content: center; gap: 0.75rem; border-radius: 0.75rem; background: var(--apex-surface); padding: 0.8rem 1.3rem; color: var(--apex-text); font-size: 0.9rem; font-weight: 700; text-decoration: none; transition: background-color 180ms ease, transform 180ms ease; }
.apex-final__action:hover { background: var(--apex-inverse-hover); transform: translateY(-2px); }
.apex-final__action:focus-visible { outline: 2px solid var(--apex-focus-on-dark); outline-offset: 4px; }
.apex-final__action :deep(svg) { width: 1.15rem; height: 1.15rem; }

@media (max-width: 639px) {
  .apex-final__inner { padding: 4.5rem 1.25rem; }
  .apex-final p { font-size: 0.95rem; }
  .apex-final__action { width: 100%; }
}

@media (hover: none) {
  .apex-final__action:hover { transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .apex-final__action { transition: none; }
  .apex-final__action:hover { transform: none; }
}
</style>

<template>
  <section v-if="showStatement" class="border-t border-gray-100 bg-white py-16 lg:py-28">
    <div class="mx-auto max-w-6xl px-6 lg:px-8">
      <div class="grid items-center gap-10 lg:gap-16" :class="statement?.image_url ? 'md:grid-cols-2' : 'md:grid-cols-1'">
        <div v-if="statement?.image_url" :ref="addRevealRef" class="reveal">
          <img :src="statement.image_url" :alt="statement.attribution || statement.eyebrow || 'Statement'" class="aspect-[4/5] w-full rounded-2xl object-cover" />
        </div>

        <div :ref="addRevealRef" class="reveal" :class="statement?.image_url ? '' : 'mx-auto max-w-3xl text-center'" style="transition-delay: 0.1s">
          <p v-if="statement?.eyebrow" class="mb-5 text-sm font-medium" :style="{ color: 'var(--color-primary-700)' }">{{ statement.eyebrow }}</p>
          <blockquote class="whitespace-pre-line text-[1.6rem] font-light leading-[1.4] text-gray-900 sm:text-3xl lg:text-[2.1rem]">{{ statement?.quote }}</blockquote>
          <div v-if="statement?.attribution" class="mt-7">
            <p class="text-sm font-semibold text-gray-900">{{ statement.attribution }}</p>
            <p v-if="statement.role" class="mt-0.5 text-xs text-gray-500">{{ statement.role }}</p>
          </div>
          <NuxtLink
            v-if="statement?.cta_label && statement?.cta_link"
            :to="statement.cta_link"
            class="link-arrow mt-8"
          >
            {{ statement.cta_label }}
            <Icon name="heroicons:arrow-right" class="h-4 w-4" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomepageStatement } from '~/composables/useSiteConfig'

const props = defineProps<{
  statement: HomepageStatement | null
}>()

const showStatement = computed(() => !!(props.statement?.enabled && props.statement.quote?.trim()))
const { addRevealRef } = useScrollRevealAll()
</script>

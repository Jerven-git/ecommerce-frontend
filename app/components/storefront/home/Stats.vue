<template>
  <section v-if="stats.length" class="section-accent py-14 lg:py-20">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="grid grid-cols-2 gap-y-10 md:grid-cols-4">
        <div
          v-for="(stat, index) in stats"
          :key="stat.label"
          :ref="addRevealRef"
          class="reveal text-center md:px-8 md:text-left md:first:pl-0"
          :class="index > 0 ? 'md:border-l md:border-gray-300' : ''"
          :style="{ transitionDelay: `${index * 0.1}s` }"
        >
          <div v-if="stat.value" class="text-3xl font-bold tabular-nums text-gray-900 md:text-5xl" :style="{ fontFamily: 'var(--font-heading)' }">{{ stat.value }}</div>
          <div v-if="stat.label" class="mt-2 text-sm text-gray-600">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomepageStat, HomepageStats } from '~/composables/useSiteConfig'

const props = defineProps<{
  config: HomepageStats | null
}>()

const defaultStats: HomepageStat[] = [
  { value: '500+', label: 'Products' },
  { value: '1,200+', label: 'Happy Customers' },
  { value: '99%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Support' },
]

const stats = computed(() => props.config
  ? (props.config.items ?? []).filter(stat => stat.value || stat.label)
  : defaultStats,
)
const { addRevealRef } = useScrollRevealAll()
</script>

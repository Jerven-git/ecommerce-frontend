<template>
  <section
    v-if="banner?.enabled && banner.heading"
    :style="{ backgroundColor: banner.background_color, color: banner.text_color }"
    class="py-8 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
      <div class="flex-1">
        <p class="text-lg md:text-xl font-semibold tracking-tight">{{ banner.heading }}</p>
        <p v-if="banner.subtitle" class="text-sm opacity-80 mt-1">{{ banner.subtitle }}</p>
      </div>
      <NuxtLink
        v-if="banner.button_label && banner.button_link"
        :to="banner.button_link"
        class="inline-flex items-center px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wide bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-colors border border-white/20"
      >{{ banner.button_label }}</NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const { siteConfig } = useSiteConfig()
const banner = computed(() => siteConfig.value?.footer_banner ?? null)
</script>

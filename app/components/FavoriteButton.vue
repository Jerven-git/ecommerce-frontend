<template>
  <button
    v-if="enabled"
    @click.prevent="toggle"
    :class="buttonClass"
    :aria-label="isFavorited ? 'Remove from favorites' : 'Add to favorites'"
  >
    <Icon name="heroicons:heart" class="transition-colors duration-200" :class="[iconSizeClass, isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-400']" :fill="isFavorited ? 'currentColor' : 'none'" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  productId: number
  size?: 'sm' | 'md'
}>(), {
  size: 'sm',
})

const favoritesStore = useFavoritesStore()
const { siteConfig } = useSiteConfig()

const enabled = computed(() => siteConfig.value?.favorites_enabled ?? false)
const isFavorited = computed(() => favoritesStore.isFavorited(props.productId))

const toggle = () => {
  favoritesStore.toggle(props.productId)
}

const buttonClass = computed(() => {
  const base = 'absolute top-2 right-2 z-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all duration-200 hover:scale-110'
  const size = props.size === 'md' ? 'w-10 h-10 top-4 right-4' : 'w-9 h-9'
  return `${base} ${size}`
})

const iconSizeClass = computed(() => props.size === 'md' ? 'w-5 h-5' : 'w-5 h-5')
</script>

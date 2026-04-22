<template>
  <button
    v-if="enabled"
    @click.prevent="toggle"
    :class="buttonClass"
    :aria-label="isFavorited ? 'Remove from favorites' : 'Add to favorites'"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="transition-colors duration-200"
      :class="[iconSizeClass, isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-400']"
      :fill="isFavorited ? 'currentColor' : 'none'"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
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

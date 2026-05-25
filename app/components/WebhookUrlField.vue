<template>
  <div v-if="url">
    <label class="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1.5">Webhook URL</label>
    <div class="flex items-center gap-2">
      <input
        :value="url"
        type="text"
        readonly
        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-mono"
        @focus="(e) => (e.target as HTMLInputElement).select()"
      />
      <button
        type="button"
        @click="copy"
        class="shrink-0 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
    </div>
    <p class="text-[11px] text-gray-400 mt-1">Paste this into the provider's dashboard so events reach this store.</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  url?: string
}>()

const copied = ref(false)

const copy = async () => {
  if (!props.url) return
  try {
    await navigator.clipboard.writeText(props.url)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // Clipboard unavailable — the field is selectable as a fallback.
  }
}
</script>

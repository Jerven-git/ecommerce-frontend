<template>
  <div class="space-y-3">
    <div>
      <label :for="searchId" class="mb-1.5 block text-sm font-medium text-admin-text">Find store</label>
      <input
        :id="searchId"
        v-model="search"
        type="search"
        autocomplete="off"
        placeholder="Search by name or slug"
        class="admin-input"
        :aria-describedby="statusId"
      />
    </div>

    <div>
      <label :for="id" class="mb-1.5 block text-sm font-medium text-admin-text">Store</label>
      <select
        :id="id"
        :value="modelValue ?? ''"
        :required="required"
        class="admin-input"
        :aria-describedby="statusId"
        @change="$emit('update:modelValue', Number(($event.target as HTMLSelectElement).value) || null)"
      >
        <option value="" disabled>{{ loading ? 'Loading stores…' : 'Select a store…' }}</option>
        <option v-for="store in options" :key="store.id" :value="store.id">
          {{ store.name }} ({{ store.slug }})
        </option>
      </select>
    </div>

    <p :id="statusId" class="text-xs text-admin-muted" role="status" aria-live="polite">
      <template v-if="error">{{ error }}</template>
      <template v-else-if="loading">Searching stores…</template>
      <template v-else-if="search && options.length === 0">No matching stores.</template>
      <template v-else>Showing up to 20 matching stores.</template>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { StoreOption } from '~/composables/useSuperAdminApi'

const props = withDefaults(defineProps<{
  id: string
  modelValue: number | null
  required?: boolean
}>(), {
  required: false,
})

defineEmits<{ 'update:modelValue': [value: number | null] }>()

const api = useSuperAdminApi()
const search = ref('')
const options = ref<StoreOption[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchId = computed(() => `${props.id}-search`)
const statusId = computed(() => `${props.id}-status`)

let timer: ReturnType<typeof setTimeout> | undefined
let sequence = 0

const load = async () => {
  const current = ++sequence
  loading.value = true
  error.value = null
  try {
    const result = await api.listStoreOptions({
      search: search.value.trim() || undefined,
      selected_id: props.modelValue ?? undefined,
    })
    if (current === sequence) options.value = result.data
  } catch (err: any) {
    if (current === sequence) error.value = err?.data?.message || 'Couldn’t load stores. Try another search.'
  } finally {
    if (current === sequence) loading.value = false
  }
}

watch(search, () => {
  clearTimeout(timer)
  timer = setTimeout(load, 300)
})

watch(() => props.modelValue, load)
onMounted(load)
onUnmounted(() => clearTimeout(timer))
</script>

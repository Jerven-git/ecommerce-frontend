<template>
  <div :class="compact ? 'grid gap-3 sm:grid-cols-2' : 'space-y-3'">
    <div>
      <label :for="searchId" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-admin-muted">Find store</label>
      <div class="relative">
        <input
          :id="searchId"
          v-model="search"
          type="search"
          autocomplete="off"
          placeholder="Search by name or slug"
          class="admin-input pl-9"
          :aria-describedby="statusId"
        />
        <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-admin-muted">
          <Icon name="heroicons:magnifying-glass" class="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </div>

    <div>
      <label :id="`${id}-label`" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-admin-muted">Store</label>
      <AdminFilterSelect
        v-model="selectedStoreId"
        :options="storeSelectOptions"
        :ariaLabel="required ? 'Select a store' : 'Filter by store'"
        list-label="Available stores"
        :described-by="statusId"
      />
    </div>

    <p :id="statusId" class="text-xs text-admin-muted" :class="compact ? 'sm:col-span-2' : ''" role="status" aria-live="polite">
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
  compact?: boolean
  allowAll?: boolean
}>(), {
  required: false,
  compact: false,
  allowAll: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()

const api = useSuperAdminApi()
const search = ref('')
const options = ref<StoreOption[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchId = computed(() => `${props.id}-search`)
const statusId = computed(() => `${props.id}-status`)
const selectedStoreId = computed({
  get: () => props.modelValue?.toString() ?? '',
  set: value => emit('update:modelValue', Number(value) || null),
})
const storeSelectOptions = computed(() => [
  {
    value: '',
    label: loading.value ? 'Loading stores…' : (props.allowAll ? 'All stores' : 'Select a store…'),
    icon: props.allowAll ? 'heroicons:squares-2x2' : 'heroicons:building-storefront',
    disabled: loading.value || (!props.allowAll && props.required),
  },
  ...options.value.map(store => ({
    value: String(store.id),
    label: `${store.name} · ${store.slug}`,
    icon: 'heroicons:building-storefront',
  })),
])

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

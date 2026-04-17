<template>
  <div>
    <!-- Category row -->
    <div
      class="flex items-center gap-2 px-3 py-1.5 transition-colors duration-100"
      :class="hasChildren ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50'"
      :style="{ paddingLeft: `${depth * 20 + 12}px` }"
      @click="!hasChildren && $emit('toggle-category', category.id)"
    >
      <!-- Expand/collapse toggle -->
      <button
        v-if="hasChildren"
        type="button"
        @click.stop="$emit('toggle', category.id)"
        class="w-4 h-4 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 shrink-0"
      >
        <svg
          class="w-3 h-3 transition-transform duration-200"
          :class="{ 'rotate-90': isExpanded }"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div v-else class="w-4 h-4 shrink-0"></div>

      <!-- Checkbox (leaf nodes only) -->
      <div
        v-if="!hasChildren"
        class="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors duration-150"
        :class="isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300 bg-white'"
      >
        <svg v-if="isSelected" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <!-- Disabled indicator for parent nodes -->
      <div
        v-else
        class="w-4 h-4 rounded border-2 border-gray-200 bg-gray-100 shrink-0"
        title="Parent categories cannot be selected directly"
      ></div>

      <!-- Name -->
      <span
        class="text-sm truncate transition-colors duration-100"
        :class="[
          hasChildren ? 'text-gray-400' : (isSelected ? 'text-primary-700 font-medium' : 'text-gray-700')
        ]"
      >{{ category.name }}</span>

      <!-- Child count -->
      <span v-if="hasChildren" class="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">{{ category.children?.length }}</span>
    </div>

    <!-- Children -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out overflow-hidden"
      leave-active-class="transition-all duration-150 ease-in overflow-hidden"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="isExpanded && hasChildren">
        <!-- Vertical tree line -->
        <div class="relative">
          <div
            class="absolute top-0 bottom-0 border-l border-gray-200"
            :style="{ left: `${depth * 20 + 22}px` }"
          ></div>
          <CategoryTreeItem
            v-for="child in category.children"
            :key="child.id"
            :category="child"
            :depth="depth + 1"
            :selected-ids="selectedIds"
            :expanded-ids="expandedIds"
            @toggle-category="$emit('toggle-category', $event)"
            @toggle="$emit('toggle', $event)"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: number
  name: string
  parent_id: number | null
  children?: Category[]
}

const props = defineProps<{
  category: Category
  depth: number
  selectedIds: Set<number>
  expandedIds: Set<number>
}>()

defineEmits<{
  'toggle-category': [id: number]
  toggle: [id: number]
}>()

const hasChildren = computed(() => (props.category.children?.length ?? 0) > 0)
const isExpanded = computed(() => props.expandedIds.has(props.category.id))
const isSelected = computed(() => props.selectedIds.has(props.category.id))
</script>

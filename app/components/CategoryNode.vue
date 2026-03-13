<template>
  <div class="relative">
    <!-- Vertical tree line from parent -->
    <div
      v-if="depth > 0"
      class="absolute top-0 border-l border-gray-200"
      :style="{ left: `${(depth - 1) * 24 + 22}px`, height: isLast ? '20px' : '100%' }"
    ></div>

    <!-- Horizontal branch line -->
    <div
      v-if="depth > 0"
      class="absolute top-5 border-t border-gray-200"
      :style="{ left: `${(depth - 1) * 24 + 22}px`, width: '12px' }"
    ></div>

    <!-- Category row -->
    <div
      class="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150 group hover:bg-gray-50"
      :style="{ paddingLeft: `${depth * 24 + 12}px` }"
    >
      <!-- Expand/collapse toggle -->
      <button
        v-if="category.children?.length"
        @click="$emit('toggle', category.id)"
        class="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
      >
        <svg
          class="w-3.5 h-3.5 transition-transform duration-200"
          :class="{ 'rotate-90': isExpanded }"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div v-else class="w-5 h-5 flex items-center justify-center shrink-0">
        <div class="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0 flex items-center gap-2">
        <!-- Edit mode -->
        <template v-if="editingId === category.id">
          <input
            :value="editName"
            @input="$emit('update:edit-name', ($event.target as HTMLInputElement).value)"
            type="text"
            class="input-field text-sm py-1 flex-1"
            @keydown.enter="$emit('save-edit', category)"
            @keydown.escape="$emit('cancel-edit')"
            autofocus
          />
          <button @click="$emit('save-edit', category)" class="p-1 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </button>
          <button @click="$emit('cancel-edit')" class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </template>

        <!-- Display mode -->
        <template v-else>
          <span
            v-if="searchQuery && isHighlighted"
            class="text-sm font-medium text-gray-800 truncate"
            v-html="highlightMatch(category.name)"
          ></span>
          <span v-else class="text-sm font-medium text-gray-800 truncate">{{ category.name }}</span>
          <span v-if="category.children?.length" class="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">{{ category.children.length }}</span>
        </template>
      </div>

      <!-- Actions -->
      <div v-if="editingId !== category.id" class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button @click="$emit('start-add', category.id)" class="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Add subcategory">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        </button>
        <button @click="$emit('start-edit', category)" class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Rename">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </button>
        <button @click="$emit('confirm-delete', category)" class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>

    <!-- Inline add child form -->
    <div
      v-if="addingParentId === category.id"
      class="relative flex items-center gap-2 py-2"
      :style="{ paddingLeft: `${(depth + 1) * 24 + 12 + 20 + 8}px`, paddingRight: '12px' }"
    >
      <input
        :value="addingName"
        @input="$emit('update:adding-name', ($event.target as HTMLInputElement).value)"
        type="text"
        class="input-field text-sm py-1.5 flex-1"
        placeholder="Subcategory name..."
        @keydown.enter="$emit('save-add', category.id)"
        @keydown.escape="$emit('cancel-add')"
        autofocus
      />
      <button @click="$emit('save-add', category.id)" class="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors" :disabled="!addingName.trim() || saving">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
      </button>
      <button @click="$emit('cancel-add')" class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>

    <!-- Children (recursive) with transition -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="isExpanded && category.children?.length" class="relative">
        <CategoryNode
          v-for="(child, index) in category.children"
          :key="child.id"
          :category="child"
          :depth="depth + 1"
          :is-last="index === category.children!.length - 1"
          :editing-id="editingId"
          :edit-name="editName"
          :expanded-ids="expandedIds"
          :adding-parent-id="addingParentId"
          :adding-name="addingName"
          :saving="saving"
          :search-query="searchQuery"
          @toggle="$emit('toggle', $event)"
          @start-edit="$emit('start-edit', $event)"
          @save-edit="$emit('save-edit', $event)"
          @cancel-edit="$emit('cancel-edit')"
          @update:edit-name="$emit('update:edit-name', $event)"
          @confirm-delete="$emit('confirm-delete', $event)"
          @start-add="$emit('start-add', $event)"
          @save-add="$emit('save-add', $event)"
          @cancel-add="$emit('cancel-add')"
          @update:adding-name="$emit('update:adding-name', $event)"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: number
  name: string
  parent_id: number | null
  sort_order: number
  children?: Category[]
}

const props = defineProps<{
  category: Category
  depth: number
  isLast: boolean
  editingId: number | null
  editName: string
  expandedIds: Set<number>
  addingParentId: number | null
  addingName: string
  saving: boolean
  searchQuery: string
}>()

defineEmits<{
  toggle: [id: number]
  'start-edit': [cat: Category]
  'save-edit': [cat: Category]
  'cancel-edit': []
  'update:edit-name': [value: string]
  'confirm-delete': [cat: Category]
  'start-add': [parentId: number]
  'save-add': [parentId: number]
  'cancel-add': []
  'update:adding-name': [value: string]
}>()

const isExpanded = computed(() => props.expandedIds.has(props.category.id))

const isHighlighted = computed(() => {
  if (!props.searchQuery) return false
  return props.category.name.toLowerCase().includes(props.searchQuery.toLowerCase())
})

function highlightMatch(text: string): string {
  if (!props.searchQuery) return text
  const q = props.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${q})`, 'gi'), '<mark class="bg-yellow-200 text-yellow-900 rounded px-0.5">$1</mark>')
}
</script>

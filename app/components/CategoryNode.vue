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

    <!-- Row wrapper (relative for drop indicator) -->
    <div class="relative">
      <!-- Drop-before indicator -->
      <div
        v-if="showBeforeLine"
        class="absolute top-0 h-0.5 bg-blue-500 z-10 rounded-full pointer-events-none"
        :style="{ left: `${depth * 24 + 12}px`, right: '12px' }"
      ></div>
      <!-- Drop-after indicator -->
      <div
        v-if="showAfterLine"
        class="absolute bottom-0 h-0.5 bg-blue-500 z-10 rounded-full pointer-events-none"
        :style="{ left: `${depth * 24 + 12}px`, right: '12px' }"
      ></div>

      <!-- Category row -->
      <div
        ref="rowRef"
        class="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150 group hover:bg-gray-50"
        :class="{ 'opacity-30': isDragging, 'bg-blue-50/50': isDragOver }"
        :style="{ paddingLeft: `${depth * 24 + 12}px` }"
        :draggable="isDraggable"
        @dragstart="onDragStart"
        @dragend="onDragEnd"
        @dragenter="onDragEnter"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop"
      >
        <!-- Drag handle -->
        <div
          v-if="isDraggable"
          class="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -ml-1"
          title="Drag to reorder"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3.5" r="1.25"/><circle cx="11" cy="3.5" r="1.25"/>
            <circle cx="5" cy="8" r="1.25"/><circle cx="11" cy="8" r="1.25"/>
            <circle cx="5" cy="12.5" r="1.25"/><circle cx="11" cy="12.5" r="1.25"/>
          </svg>
        </div>

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
            <button @click="$emit('save-edit', category)" class="p-1 rounded-lg text-primary-600 hover:text-primary-800 hover:bg-primary-50 transition-colors">
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
          <button @click="$emit('edit-cover', category)" class="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" :class="{ 'text-amber-500': category.image_url }" title="Cover image">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </button>
          <button @click="$emit('start-edit', category)" class="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Rename">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button @click="$emit('confirm-delete', category)" class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
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
      <button @click="$emit('save-add', category.id)" class="p-1.5 rounded-lg text-primary-600 hover:text-primary-800 hover:bg-primary-50 transition-colors" :disabled="!addingName.trim() || saving">
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
          :dragging-id="draggingId"
          :dragging-parent-id="draggingParentId"
          @toggle="$emit('toggle', $event)"
          @start-edit="$emit('start-edit', $event)"
          @save-edit="$emit('save-edit', $event)"
          @cancel-edit="$emit('cancel-edit')"
          @edit-cover="$emit('edit-cover', $event)"
          @update:edit-name="$emit('update:edit-name', $event)"
          @confirm-delete="$emit('confirm-delete', $event)"
          @start-add="$emit('start-add', $event)"
          @save-add="$emit('save-add', $event)"
          @cancel-add="$emit('cancel-add')"
          @update:adding-name="$emit('update:adding-name', $event)"
          @drag-start="(id, pid) => $emit('drag-start', id, pid)"
          @drag-end="() => $emit('drag-end')"
          @drag-drop="(did, tid, pid, pos) => $emit('drag-drop', did, tid, pid, pos)"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: number
  name: string
  slug?: string | null
  image_url?: string | null
  overlay_opacity?: number | null
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
  draggingId: number | null
  draggingParentId: number | null | undefined
}>()

const emit = defineEmits<{
  toggle: [id: number]
  'start-edit': [cat: Category]
  'save-edit': [cat: Category]
  'cancel-edit': []
  'edit-cover': [cat: Category]
  'update:edit-name': [value: string]
  'confirm-delete': [cat: Category]
  'start-add': [parentId: number]
  'save-add': [parentId: number]
  'cancel-add': []
  'update:adding-name': [value: string]
  'drag-start': [catId: number, parentId: number | null]
  'drag-end': []
  'drag-drop': [draggedId: number, targetId: number, parentId: number | null, pos: 'before' | 'after']
}>()

const rowRef = ref<HTMLElement | null>(null)
const dragDepth = ref(0)
const dragPos = ref<'before' | 'after' | null>(null)

const isExpanded = computed(() => props.expandedIds.has(props.category.id))

const isDraggable = computed(() => !props.searchQuery && props.editingId !== props.category.id)

const isDragging = computed(() => props.draggingId === props.category.id)

const canDropHere = computed(() => {
  if (!props.draggingId) return false
  if (props.draggingId === props.category.id) return false
  return props.draggingParentId === props.category.parent_id
})

const isDragOver = computed(() => canDropHere.value && dragPos.value !== null)
const showBeforeLine = computed(() => canDropHere.value && dragPos.value === 'before')
const showAfterLine = computed(() => canDropHere.value && dragPos.value === 'after')

const isHighlighted = computed(() => {
  if (!props.searchQuery) return false
  return props.category.name.toLowerCase().includes(props.searchQuery.toLowerCase())
})

function highlightMatch(text: string): string {
  if (!props.searchQuery) return text
  const q = props.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${q})`, 'gi'), '<mark class="bg-yellow-200 text-yellow-900 rounded px-0.5">$1</mark>')
}

function onDragStart(e: DragEvent) {
  e.stopPropagation()
  if (!e.dataTransfer) return
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', String(props.category.id))
  emit('drag-start', props.category.id, props.category.parent_id)
}

function onDragEnd(e: DragEvent) {
  e.stopPropagation()
  dragDepth.value = 0
  dragPos.value = null
  emit('drag-end')
}

function onDragEnter(e: DragEvent) {
  e.stopPropagation()
  if (!canDropHere.value) return
  dragDepth.value++
}

function onDragOver(e: DragEvent) {
  e.stopPropagation()
  if (!canDropHere.value) return
  if (rowRef.value) {
    const rect = rowRef.value.getBoundingClientRect()
    dragPos.value = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
  }
}

function onDragLeave(e: DragEvent) {
  e.stopPropagation()
  dragDepth.value--
  if (dragDepth.value <= 0) {
    dragDepth.value = 0
    dragPos.value = null
  }
}

function onDrop(e: DragEvent) {
  e.stopPropagation()
  const pos = dragPos.value
  dragDepth.value = 0
  dragPos.value = null
  if (!canDropHere.value || !pos || !e.dataTransfer) return
  const draggedId = Number(e.dataTransfer.getData('text/plain'))
  emit('drag-drop', draggedId, props.category.id, props.category.parent_id, pos)
}
</script>

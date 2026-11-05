<template>
  <AdminWebsiteSectionMenuRow
    :label="label" :icon="icon" :selected="selected" :visible="visible"
    :composable="composable" :disabled="disabled" :first="first" :last="last"
    :status="status" :warning="visible && editable && (!hasContent || incomplete)"
    @select="$emit('select')" @move="$emit('move', $event)" @toggle="$emit('toggle')"
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  icon: string
  selected: boolean
  visible: boolean
  editable: boolean
  hasContent: boolean
  incomplete?: boolean
  first: boolean
  last: boolean
  disabled?: boolean
  composable?: boolean
}>(), {
  disabled: false,
  composable: true,
  incomplete: false,
})

defineEmits<{
  select: []
  move: [direction: -1 | 1]
  toggle: []
}>()

const status = computed(() => {
  if (!props.visible) return 'Hidden'
  if (!props.editable) return 'Managed elsewhere'
  if (!props.hasContent) return 'Empty'
  if (props.incomplete) return 'Incomplete'
  return 'Ready'
})
</script>

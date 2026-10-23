import { computed, nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'

interface WebsiteEditorUndoHistoryOptions {
  disabled: Readonly<Ref<boolean>>
  delay?: number
  limit?: number
}

export function useWebsiteEditorUndoHistory<T>(
  value: Ref<T | null>,
  options: WebsiteEditorUndoHistoryOptions,
) {
  const snapshots = ref<string[]>([])
  const index = ref(-1)
  const delay = options.delay ?? 300
  const limit = options.limit ?? 60
  let applyingSnapshot = false
  let timer: number | null = null

  const serialize = (entry: T) => JSON.stringify(entry)
  const canUndo = computed(() => index.value > 0)
  const canRedo = computed(() => index.value >= 0 && index.value < snapshots.value.length - 1)

  function clearTimer() {
    if (timer !== null) window.clearTimeout(timer)
    timer = null
  }

  function initialize() {
    if (import.meta.client) clearTimer()
    snapshots.value = value.value ? [serialize(value.value)] : []
    index.value = value.value ? 0 : -1
  }

  function commit() {
    timer = null
    if (!value.value || applyingSnapshot || options.disabled.value) return

    const current = serialize(value.value)
    if (snapshots.value[index.value] === current) return

    snapshots.value = snapshots.value.slice(0, index.value + 1)
    snapshots.value.push(current)
    if (snapshots.value.length > limit) snapshots.value.shift()
    index.value = snapshots.value.length - 1
  }

  function schedule() {
    if (!import.meta.client || applyingSnapshot || options.disabled.value) return
    clearTimer()
    timer = window.setTimeout(commit, delay)
  }

  function apply(indexToApply: number) {
    const serialized = snapshots.value[indexToApply]
    if (!serialized) return

    applyingSnapshot = true
    value.value = JSON.parse(serialized) as T
    index.value = indexToApply
    nextTick(() => { applyingSnapshot = false })
  }

  function undo() {
    if (!value.value || options.disabled.value) return
    if (import.meta.client) clearTimer()

    const current = serialize(value.value)
    if (snapshots.value[index.value] !== current) {
      snapshots.value = snapshots.value.slice(0, index.value + 1)
      snapshots.value.push(current)
      index.value = snapshots.value.length - 1
    }
    if (index.value > 0) apply(index.value - 1)
  }

  function redo() {
    if (!canRedo.value || options.disabled.value) return
    apply(index.value + 1)
  }

  watch(value, schedule, { deep: true })
  onBeforeUnmount(() => {
    if (import.meta.client) clearTimer()
  })

  return {
    canUndo,
    canRedo,
    initialize,
    undo,
    redo,
  }
}

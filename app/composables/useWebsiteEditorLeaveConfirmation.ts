import { onBeforeUnmount, ref } from 'vue'

/** Keep route navigation pending until the editor's confirmation dialog is answered. */
export function useWebsiteEditorLeaveConfirmation() {
  const open = ref(false)
  let pending: Promise<boolean> | null = null
  let resolvePending: ((leave: boolean) => void) | null = null

  function request(): Promise<boolean> {
    if (pending) return pending
    pending = new Promise(resolve => { resolvePending = resolve })
    open.value = true
    return pending
  }

  function finish(leave: boolean) {
    const resolve = resolvePending
    resolvePending = null
    pending = null
    open.value = false
    resolve?.(leave)
  }

  onBeforeUnmount(() => finish(false))
  return { open, request, finish }
}

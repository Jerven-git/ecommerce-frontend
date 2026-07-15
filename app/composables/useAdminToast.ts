export interface AdminToastAction {
  label: string
  handler: () => void
}

export interface AdminToast {
  id: number
  message: string
  variant: 'success' | 'error' | 'info'
  action?: AdminToastAction
}

// Module-level singleton so any component can raise a toast and the single
// mounted <AdminToast /> renders the whole stack.
const toasts = ref<AdminToast[]>([])
const timers = new Map<number, ReturnType<typeof setTimeout>>()
let seq = 0
const MAX_VISIBLE = 4

export function useAdminToast() {
  function dismiss(id: number) {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function push(
    message: string,
    variant: AdminToast['variant'] = 'success',
    opts: { action?: AdminToastAction; duration?: number } = {},
  ): number {
    const id = ++seq
    // Cap the stack — drop the oldest when full.
    while (toasts.value.length >= MAX_VISIBLE) dismiss(toasts.value[0]!.id)
    toasts.value = [...toasts.value, { id, message, variant, action: opts.action }]

    // Errors and actionable toasts linger; plain successes are brief.
    const duration = opts.duration
      ?? (variant === 'error' ? 6000 : opts.action ? 7000 : 3500)
    if (duration > 0) {
      timers.set(id, setTimeout(() => dismiss(id), duration))
    }
    return id
  }

  // Back-compat: existing callers use showToast(message, variant?).
  const showToast = (message: string, variant: AdminToast['variant'] = 'success') => push(message, variant)
  const toastSuccess = (message: string, opts?: { action?: AdminToastAction; duration?: number }) => push(message, 'success', opts)
  const toastError = (message: string, opts?: { action?: AdminToastAction; duration?: number }) => push(message, 'error', opts)
  const clearToast = () => toasts.value.slice().forEach(t => dismiss(t.id))

  // Back-compat: some callers referenced the old single `toast` ref.
  const toast = computed(() => toasts.value[toasts.value.length - 1] ?? null)

  return { toasts, toast, showToast, toastSuccess, toastError, push, dismiss, clearToast }
}

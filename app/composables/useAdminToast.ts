interface AdminToast {
  message: string
  variant: 'success' | 'error'
}

const toast = ref<AdminToast | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

export function useAdminToast() {
  function showToast(message: string, variant: AdminToast['variant'] = 'success') {
    if (timer) clearTimeout(timer)
    toast.value = { message, variant }
    timer = setTimeout(() => { toast.value = null }, 3500)
  }

  function clearToast() {
    if (timer) clearTimeout(timer)
    toast.value = null
  }

  return { toast, showToast, clearToast }
}

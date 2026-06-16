/**
 * Admin help assistant – chat state + API call.
 *
 * Talks to the backend `/admin-assistant` endpoint, which holds the AI provider
 * key server-side. The full conversation is sent each turn (the API is stateless).
 */

export interface AssistantMessage {
  role: 'user' | 'assistant'
  content: string
}

export function useAdminAssistant() {
  const { $apiFetch } = useNuxtApp()

  const messages = ref<AssistantMessage[]>([])
  const sending = ref(false)
  const error = ref<string | null>(null)

  const send = async (text: string) => {
    const message = text.trim()
    if (!message || sending.value) return

    error.value = null
    // History = everything before this new question.
    const history = messages.value.map(m => ({ role: m.role, content: m.content }))
    messages.value.push({ role: 'user', content: message })
    sending.value = true

    try {
      const res = await $apiFetch<{ message: string }>('/admin-assistant', {
        method: 'POST',
        body: { message, history },
      })
      messages.value.push({ role: 'assistant', content: res.message })
    } catch (e: any) {
      error.value = e?.data?.message || 'Something went wrong. Please try again.'
    } finally {
      sending.value = false
    }
  }

  const reset = () => {
    messages.value = []
    error.value = null
  }

  return { messages, sending, error, send, reset }
}

<template>
  <div>
    <!-- Floating launcher -->
    <div v-if="!open && !hidden" class="assistant-launcher">
      <button
        type="button"
        class="assistant-launcher__open"
        aria-label="Open help assistant"
        @click="open = true"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Help</span>
      </button>
      <button
        type="button"
        class="assistant-launcher__hide"
        aria-label="Hide help button"
        title="Hide help button"
        @click="hideLauncher"
      >
        <Icon name="heroicons:chevron-right" class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>

    <!-- Narrow restore handle when the launcher is hidden -->
    <button
      v-else-if="!open && hidden"
      type="button"
      class="assistant-restore"
      aria-label="Show help button"
      title="Show help"
      @click="showLauncher"
    >
      <Icon name="heroicons:question-mark-circle" class="h-5 w-5" aria-hidden="true" />
      <Icon name="heroicons:chevron-left" class="h-3.5 w-3.5" aria-hidden="true" />
    </button>

    <!-- Chat panel -->
    <Transition name="assistant-fade">
      <div
        v-if="open"
        class="fixed bottom-5 right-5 z-[90] w-[380px] max-w-[calc(100vw-2.5rem)] h-[560px] max-h-[calc(100vh-2.5rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-primary-600 text-white shrink-0">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-sm font-bold">Help Assistant</h3>
          </div>
          <div class="flex items-center gap-1">
            <button
              v-if="messages.length"
              @click="reset"
              class="px-2 py-1 text-[11px] font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              Clear
            </button>
            <button
              @click="open = false"
              class="w-7 h-7 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              aria-label="Close"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div ref="scrollRef" class="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
          <!-- Empty state -->
          <div v-if="!messages.length" class="text-center text-gray-500 pt-6">
            <p class="text-sm font-semibold text-gray-700 mb-1">Ask me anything about your dashboard</p>
            <p class="text-xs mb-4">e.g. "How do I add a product?"</p>
            <div class="space-y-1.5">
              <button
                v-for="s in suggestions"
                :key="s"
                @click="submit(s)"
                class="block w-full text-left text-[13px] text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                {{ s }}
              </button>
            </div>
          </div>

          <div
            v-for="(m, i) in messages"
            :key="i"
            class="flex"
            :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap break-words"
              :class="m.role === 'user'
                ? 'bg-primary-600 text-white rounded-br-md'
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'"
            >{{ m.content }}</div>
          </div>

          <!-- Typing indicator -->
          <div v-if="sending" class="flex justify-start">
            <div class="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-3.5 py-3">
              <div class="flex gap-1">
                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style="animation-delay:0ms" />
                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style="animation-delay:150ms" />
                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style="animation-delay:300ms" />
              </div>
            </div>
          </div>

          <p v-if="error" class="text-xs text-red-500 text-center">{{ error }}</p>
        </div>

        <!-- Composer -->
        <form @submit.prevent="submit()" class="border-t border-gray-100 p-3 flex items-end gap-2 shrink-0 bg-white">
          <textarea
            ref="inputRef"
            v-model="draft"
            rows="1"
            placeholder="Type your question…"
            class="flex-1 resize-none max-h-28 text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
            @keydown.enter.exact.prevent="submit()"
          />
          <button
            type="submit"
            :disabled="sending || !draft.trim()"
            class="w-9 h-9 shrink-0 flex items-center justify-center bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Send"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { messages, sending, error, send, reset } = useAdminAssistant()

const open = ref(false)
const hidden = ref(false)
const draft = ref('')
const scrollRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)

const suggestions = [
  'How do I add a product?',
  'How do I publish a blog post?',
  'Where do I set up shipping?',
]

const HELP_HIDDEN_KEY = 'ssu:admin-help-hidden'

const hideLauncher = () => {
  hidden.value = true
  localStorage.setItem(HELP_HIDDEN_KEY, 'true')
}

const showLauncher = () => {
  hidden.value = false
  localStorage.removeItem(HELP_HIDDEN_KEY)
}

const submit = async (preset?: string) => {
  const text = preset ?? draft.value
  if (!text.trim() || sending.value) return
  draft.value = ''
  await send(text)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollRef.value) scrollRef.value.scrollTop = scrollRef.value.scrollHeight
  })
}

watch(() => messages.value.length, scrollToBottom)
watch(sending, scrollToBottom)
watch(open, (isOpen) => {
  if (isOpen) nextTick(() => inputRef.value?.focus())
})

onMounted(() => {
  hidden.value = localStorage.getItem(HELP_HIDDEN_KEY) === 'true'
})
</script>

<style scoped>
.assistant-launcher {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 90;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: 9999px;
  color: #ffffff;
  background: var(--color-primary-600);
  box-shadow: 0 12px 28px -12px rgb(15 23 42 / 45%);
}

.assistant-launcher__open,
.assistant-launcher__hide,
.assistant-restore {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.assistant-launcher__open {
  min-height: 3rem;
  gap: 0.5rem;
  padding-inline: 0.875rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.assistant-launcher__hide {
  width: 2.75rem;
  min-height: 3rem;
  border-inline-start: 1px solid rgb(255 255 255 / 25%);
}

.assistant-launcher__open:hover,
.assistant-launcher__hide:hover {
  background: var(--color-primary-700);
}

.assistant-launcher__open:focus-visible,
.assistant-launcher__hide:focus-visible,
.assistant-restore:focus-visible {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
}

.assistant-restore {
  position: fixed;
  right: 0;
  bottom: 1.5rem;
  z-index: 90;
  width: 2.75rem;
  height: 2.75rem;
  flex-direction: column;
  gap: 0.0625rem;
  border-radius: 0.75rem 0 0 0.75rem;
  color: #ffffff;
  background: var(--color-primary-600);
  box-shadow: 0 10px 24px -12px rgb(15 23 42 / 45%);
  transition: background-color 140ms ease, transform 140ms ease;
}

.assistant-restore:hover {
  background: var(--color-primary-700);
  transform: translateX(-0.125rem);
}

.assistant-fade-enter-active,
.assistant-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.assistant-fade-enter-from,
.assistant-fade-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .assistant-fade-enter-active,
  .assistant-fade-leave-active {
    transition: none;
  }
}
</style>

// @vitest-environment happy-dom

import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useWebsiteEditorUndoHistory } from '~/composables/useWebsiteEditorUndoHistory'

describe('useWebsiteEditorUndoHistory', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('records debounced edits and restores them in both directions', async () => {
    vi.useFakeTimers()
    const draft = ref<{ heading: string } | null>({ heading: 'Original' })
    const disabled = ref(false)
    let history!: ReturnType<typeof useWebsiteEditorUndoHistory<{ heading: string }>>

    const wrapper = mount(defineComponent({
      setup() {
        history = useWebsiteEditorUndoHistory(draft, { disabled })
        history.initialize()
        return () => h('div')
      },
    }))

    draft.value = { heading: 'Edited' }
    await nextTick()
    vi.advanceTimersByTime(300)

    expect(history.canUndo.value).toBe(true)
    history.undo()
    expect(draft.value?.heading).toBe('Original')

    await nextTick()
    expect(history.canRedo.value).toBe(true)
    history.redo()
    expect(draft.value?.heading).toBe('Edited')

    wrapper.unmount()
  })

  it('does not record or apply history while a historical version is selected', async () => {
    vi.useFakeTimers()
    const draft = ref<{ heading: string } | null>({ heading: 'Published' })
    const disabled = ref(true)
    let history!: ReturnType<typeof useWebsiteEditorUndoHistory<{ heading: string }>>

    const wrapper = mount(defineComponent({
      setup() {
        history = useWebsiteEditorUndoHistory(draft, { disabled })
        history.initialize()
        return () => h('div')
      },
    }))

    draft.value = { heading: 'Historical preview' }
    await nextTick()
    vi.advanceTimersByTime(300)

    expect(history.canUndo.value).toBe(false)
    history.undo()
    expect(draft.value?.heading).toBe('Historical preview')

    wrapper.unmount()
  })
})

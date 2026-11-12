// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import { useWebsiteEditorLeaveConfirmation } from '~/composables/useWebsiteEditorLeaveConfirmation'

function setup() {
  let confirmation!: ReturnType<typeof useWebsiteEditorLeaveConfirmation>
  const wrapper = mount(defineComponent({ setup() { confirmation = useWebsiteEditorLeaveConfirmation(); return () => null } }))
  return { wrapper, get confirmation() { return confirmation } }
}
describe('editor leave confirmation', () => {
  it('waits for a response, shares concurrent requests, and cancels safely', async () => {
    const { wrapper, confirmation } = setup()
    const first = confirmation.request()
    expect(confirmation.open.value).toBe(true)
    expect(confirmation.request()).toBe(first)
    confirmation.finish(false)
    await expect(first).resolves.toBe(false)
    expect(confirmation.open.value).toBe(false)
    const second = confirmation.request()
    confirmation.finish(true)
    await expect(second).resolves.toBe(true)
    wrapper.unmount()
  })
  it('cancels pending navigation when its workspace is unmounted', async () => {
    const { wrapper, confirmation } = setup()
    const result = confirmation.request()
    wrapper.unmount()
    await expect(result).resolves.toBe(false)
    expect(confirmation.open.value).toBe(false)
  })
})

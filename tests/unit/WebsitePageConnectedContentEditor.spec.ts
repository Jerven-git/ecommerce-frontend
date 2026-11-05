// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { computed, defineComponent, onBeforeUnmount, ref, watch } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WebsitePageConnectedContentEditor from '~/components/admin/WebsitePageConnectedContentEditor.vue'
import type { WebsitePageBlock } from '~/types/websitePage'

const contentOptions = vi.fn()
const IconStub = defineComponent({ template: '<span />' })

function block(itemIds: number[] = [2, 1]): WebsitePageBlock {
  return {
    id: '3fb6a7d5-d1d5-46b4-b5e8-a075e3c84c8f',
    type: 'product-list',
    schema_version: 1,
    visible: true,
    variant: 'grid',
    content: { heading: '', body: '' },
    settings: { source: 'selected', item_ids: itemIds, category_id: null, limit: 8 },
  }
}

describe('WebsitePageConnectedContentEditor', () => {
  beforeEach(() => {
    contentOptions.mockReset().mockResolvedValue({
      data: {
        items: [
          { id: 2, title: 'Second product', summary: null, url: '/product/second', image_url: null },
          { id: 1, title: 'First product', summary: null, url: '/product/first', image_url: null },
          { id: 3, title: 'Third product', summary: null, url: '/product/third', image_url: null },
        ],
        categories: [{ id: 10, title: 'Furniture' }],
      },
    })
    vi.stubGlobal('computed', computed)
    vi.stubGlobal('onBeforeUnmount', onBeforeUnmount)
    vi.stubGlobal('ref', ref)
    vi.stubGlobal('watch', watch)
    vi.stubGlobal('useWebsitePages', () => ({ contentOptions }))
  })

  it('uses named tenant records and emits ordered selections instead of raw IDs', async () => {
    const wrapper = mount(WebsitePageConnectedContentEditor, {
      props: {
        block: block(),
        sources: ['selected', 'recent', 'category'],
      },
      global: { components: { Icon: IconStub } },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Second product')
    expect(wrapper.text()).toContain('First product')
    expect(wrapper.text()).not.toContain('Item IDs')

    await wrapper.get('button[aria-label="Move First product up"]').trigger('click')
    expect(wrapper.emitted('patch')?.at(-1)?.[0]).toEqual({ item_ids: [1, 2] })

    await wrapper.findAll('button').find(button => button.text() === 'Add')!.trigger('click')
    expect(wrapper.emitted('patch')?.at(-1)?.[0]).toEqual({ item_ids: [2, 1, 3] })
  })
})

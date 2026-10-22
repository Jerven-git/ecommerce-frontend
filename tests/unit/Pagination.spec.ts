// @vitest-environment happy-dom
import { computed } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Pagination from '~/components/admin/Pagination.vue'

describe('AdminPagination', () => {
  beforeEach(() => {
    vi.stubGlobal('computed', computed)
  })

  const mountPagination = (currentPage = 5) => mount(Pagination, {
    props: {
      currentPage,
      totalPages: 10,
      totalItems: 96,
      perPage: 10,
      itemLabel: 'orders',
    },
    global: {
      stubs: { Icon: true },
    },
  })

  it('announces the current result range and page', () => {
    const wrapper = mountPagination()

    expect(wrapper.get('nav').attributes('aria-label')).toBe('orders pagination')
    expect(wrapper.get('[aria-live="polite"]').text()).toContain('Showing 41 to 50 of 96 orders. Page 5 of 10.')
  })

  it('renders a bounded page range with ellipses', () => {
    const wrapper = mountPagination()
    const labels = wrapper.findAll('button[aria-label^="Go to page"]').map(button => button.text())

    expect(labels).toEqual(['1', '4', '5', '6', '10'])
    expect(wrapper.findAll('.admin-pagination__ellipsis')).toHaveLength(2)
    expect(wrapper.get('[aria-current="page"]').text()).toBe('5')
  })

  it('emits the selected page and disables the previous action on page one', async () => {
    const wrapper = mountPagination(1)
    const previous = wrapper.get('button[aria-label="Go to previous page"]')
    expect(previous.attributes()).toHaveProperty('disabled')

    await wrapper.get('button[aria-label="Go to page 2"]').trigger('click')
    expect(wrapper.emitted('goToPage')).toEqual([[2]])
  })
})

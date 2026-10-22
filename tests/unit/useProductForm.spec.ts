import { computed, nextTick, ref, watch } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProductForm } from '~/composables/useProductForm'

describe('useProductForm characterization', () => {
  let apiFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    apiFetch = vi.fn(async () => ({ data: { id: 91 } }))
    vi.stubGlobal('ref', ref)
    vi.stubGlobal('computed', computed)
    vi.stubGlobal('watch', watch)
    vi.stubGlobal('useNuxtApp', () => ({ $apiFetch: apiFetch }))
  })

  it('generates the cartesian product of option values', () => {
    const product = useProductForm()
    product.variantOptions.value = [
      {
        id: 1,
        name: 'Color',
        position: 0,
        values: [
          { id: 10, label: 'Black', image_url: null, position: 0 },
          { id: 11, label: 'Silver', image_url: null, position: 1 },
        ],
      },
      {
        id: 2,
        name: 'Size',
        position: 1,
        values: [
          { id: 20, label: 'Small', image_url: null, position: 0 },
          { id: 21, label: 'Large', image_url: null, position: 1 },
        ],
      },
    ]

    product.generateVariants()

    expect(product.variantDrafts.value.map(draft => draft.selectedValueIds)).toEqual([
      { 0: 0, 1: 0 },
      { 0: 0, 1: 1 },
      { 0: 1, 1: 0 },
      { 0: 1, 1: 1 },
    ])
  })

  it('reindexes and deduplicates variants when an option is removed', () => {
    const product = useProductForm()
    product.variantOptions.value = [
      { id: 1, name: 'Color', position: 0, values: [{ id: 10, label: 'Black', image_url: null, position: 0 }] },
      { id: 2, name: 'Size', position: 1, values: [{ id: 20, label: 'Small', image_url: null, position: 0 }] },
    ]
    product.variantDrafts.value = [
      { id: 1, sku: 'A', price: null, stock: 1, image_url: null, is_active: true, selectedValueIds: { 0: 0, 1: 0 } },
      { id: 2, sku: 'B', price: null, stock: 1, image_url: null, is_active: true, selectedValueIds: { 0: 0, 1: 0 } },
    ]

    product.removeOption(0)

    expect(product.variantOptions.value[0]!.position).toBe(0)
    expect(product.variantDrafts.value).toHaveLength(1)
    expect(product.variantDrafts.value[0]!.selectedValueIds).toEqual({ 0: 0 })
  })

  it('preserves the current product-create API and FormData contract', async () => {
    const product = useProductForm()
    product.form.value = {
      ...product.form.value,
      name: 'Test product',
      description: 'Description',
      price: 125,
      stock: 4,
      category: 'watches',
      category_id: 3,
      category_ids: [3, 8],
      is_active: true,
      allow_backorder: true,
      backorder_charge_policy: 'charged_later',
      noindex: true,
    }

    await product.saveProduct()

    const [url, request] = apiFetch.mock.calls[0]!
    const body = request.body as FormData
    expect(url).toBe('/products')
    expect(request.method).toBe('POST')
    expect(body.get('name')).toBe('Test product')
    expect(body.getAll('category_ids[]')).toEqual(['3', '8'])
    expect(body.get('allow_backorder')).toBe('1')
    expect(body.get('backorder_charge_policy')).toBe('charged_later')
    expect(body.get('noindex')).toBe('1')
  })

  it('uses the PATCH-over-POST upload contract for an existing product', async () => {
    const product = useProductForm()
    product.editingProduct.value = { id: 44 } as never
    product.form.value.name = 'Existing product'

    await product.saveProduct()
    await nextTick()

    const [url, request] = apiFetch.mock.calls[0]!
    expect(url).toBe('/products/44')
    expect(request.method).toBe('POST')
    expect((request.body as FormData).get('_method')).toBe('PATCH')
  })
})

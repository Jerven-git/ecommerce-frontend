// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import * as Vue from 'vue'
import { createMemoryHistory, createRouter, onBeforeRouteLeave, onBeforeRouteUpdate, RouterView, useRoute } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Editor from '~/pages/admin/website-editor.vue'
import LegacyPage from '~/pages/admin/website-pages/[uuid].vue'
import { resolveWebsiteEditorSelection, websiteEditorDocumentKey } from '~/utils/websiteEditorSelection'

const dirty = Vue.ref(false)
const confirmLeave = vi.fn(() => false)
const mounted = { builtin: 0, custom: [] as string[] }
function workspace(kind: 'builtin' | 'custom') {
  return Vue.defineComponent({ props: ['uuid'], setup(props, { expose }) {
    const canLeave = () => !dirty.value || confirmLeave()
    expose({ canLeave })
    onBeforeRouteLeave(canLeave)
    if (kind === 'builtin') mounted.builtin++
    else mounted.custom.push(props.uuid)
    return () => Vue.h('h1', { tabindex: -1 }, `${kind}:${props.uuid || 'home'}`)
  } })
}
async function render(path = '/admin/website-editor') {
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/admin/website-editor', component: Editor },
    { path: '/admin/website-pages/:uuid', component: LegacyPage },
    { path: '/elsewhere', component: { template: '<p>Elsewhere</p>' } },
  ] })
  vi.stubGlobal('navigateTo', (location: any) => router.replace(location))
  await router.push(path)
  const wrapper = mount({ render: () => Vue.h(Vue.Suspense, null, { default: () => Vue.h(RouterView) }) }, { global: { plugins: [router], stubs: {
    AdminWebsiteBuiltinEditorWorkspace: workspace('builtin'),
    AdminWebsitePageEditorWorkspace: workspace('custom'),
    AdminWebsiteEditorLoading: { template: '<p>Loading</p>' },
  } } })
  await flushPromises()
  return { wrapper, router }
}
beforeEach(() => {
  dirty.value = false; confirmLeave.mockReset().mockReturnValue(false); mounted.builtin = 0; mounted.custom = []
  for (const name of ['ref', 'computed', 'nextTick'] as const) vi.stubGlobal(name, Vue[name])
  vi.stubGlobal('useRoute', useRoute)
  vi.stubGlobal('onBeforeRouteUpdate', onBeforeRouteUpdate)
  vi.stubGlobal('definePageMeta', vi.fn())
})
describe('unified workspace routing', () => {
  it('opens custom deep links and changes document identity by UUID', async () => {
    const { wrapper, router } = await render('/admin/website-editor?customPage=first')
    expect(wrapper.text()).toContain('custom:first')
    await router.push('/admin/website-editor?customPage=second'); await flushPromises()
    expect(wrapper.text()).toContain('custom:second')
    expect(mounted.custom).toEqual(['first', 'second'])
    wrapper.unmount()
  })
  it('blocks query-only document changes when unsaved work is not discarded', async () => {
    const { wrapper, router } = await render()
    dirty.value = true
    await router.push('/admin/website-editor?customPage=first'); await flushPromises()
    expect(router.currentRoute.value.query.customPage).toBeUndefined()
    expect(wrapper.text()).toContain('builtin:home')
    expect(confirmLeave).toHaveBeenCalledOnce()
    confirmLeave.mockReturnValue(true)
    await router.push('/admin/website-editor?customPage=first'); await flushPromises()
    expect(wrapper.text()).toContain('custom:first')
    wrapper.unmount()
  })
  it('keeps one built-in draft instance when selecting another built-in page', async () => {
    const { wrapper, router } = await render()
    dirty.value = true
    await router.push('/admin/website-editor?page=contact'); await flushPromises()
    expect(mounted.builtin).toBe(1)
    expect(confirmLeave).not.toHaveBeenCalled()
    wrapper.unmount()
  })
  it('preserves the document when a custom-page switch or route leave is cancelled', async () => {
    const { wrapper, router } = await render('/admin/website-editor?customPage=first')
    dirty.value = true
    await router.push('/admin/website-editor?customPage=second'); await flushPromises()
    await router.push('/elsewhere'); await flushPromises()
    expect(wrapper.text()).toContain('custom:first')
    expect(mounted.custom).toEqual(['first'])
    wrapper.unmount()
  })
  it('opens legacy custom-page URLs in the unified workspace', async () => {
    const { wrapper, router } = await render('/admin/website-pages/legacy')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/admin/website-editor?customPage=legacy')
    expect(wrapper.text()).toContain('custom:legacy')
    wrapper.unmount()
  })
  it('distinguishes a custom UUID from built-in names and rejects array query identities', () => {
    expect(resolveWebsiteEditorSelection({ customPage: 'home' })).toEqual({ kind: 'custom', uuid: 'home' })
    expect(resolveWebsiteEditorSelection({ customPage: ['a', 'b'], page: 'missing' })).toEqual({ kind: 'builtin', page: 'home' })
    expect(websiteEditorDocumentKey({ kind: 'builtin', page: 'contact' })).toBe('builtin')
  })
})

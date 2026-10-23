import { describe, expect, it } from 'vitest'
import { websiteEditorShortcutAction } from '~/composables/useWebsiteEditorShell'

function shortcut(key: string, overrides = {}) {
  return {
    key,
    ctrlKey: true,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    repeat: false,
    ...overrides,
  }
}

describe('Website Editor shell shortcuts', () => {
  it.each([
    [shortcut('k'), false, 'navigator'],
    [shortcut('s'), false, 'save'],
    [shortcut('z'), false, 'undo'],
    [shortcut('z', { shiftKey: true }), false, 'redo'],
    [shortcut('y'), false, 'redo'],
    [shortcut('k', { ctrlKey: false, metaKey: true }), false, 'navigator'],
  ] as const)('resolves supported keyboard commands', (event, versionPreviewActive, action) => {
    expect(websiteEditorShortcutAction(event, versionPreviewActive)).toBe(action)
  })

  it('pauses editing shortcuts for historical previews while preserving navigation', () => {
    expect(websiteEditorShortcutAction(shortcut('s'), true)).toBeNull()
    expect(websiteEditorShortcutAction(shortcut('z'), true)).toBeNull()
    expect(websiteEditorShortcutAction(shortcut('k'), true)).toBe('navigator')
  })

  it('ignores repeated, alternate, and unmodified key presses', () => {
    expect(websiteEditorShortcutAction(shortcut('s', { repeat: true }))).toBeNull()
    expect(websiteEditorShortcutAction(shortcut('s', { altKey: true }))).toBeNull()
    expect(websiteEditorShortcutAction(shortcut('s', { ctrlKey: false }))).toBeNull()
  })
})

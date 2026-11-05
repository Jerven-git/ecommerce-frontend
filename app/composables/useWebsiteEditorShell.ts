import { computed, nextTick, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

export type WebsiteEditorDeviceId = 'desktop' | 'tablet' | 'mobile'
export type WebsiteEditorShortcutAction = 'navigator' | 'save' | 'undo' | 'redo'

interface WebsiteEditorShortcutEvent {
  key: string
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
  shiftKey: boolean
  repeat: boolean
}

interface WebsiteEditorShellOptions {
  isDirty: Readonly<Ref<boolean>>
  selectedVersionId: Readonly<Ref<number | null>>
  loadingDraft: Readonly<Ref<boolean>>
  saving: Readonly<Ref<boolean>>
  saveChanges: () => unknown
  undoChange: () => unknown
  redoChange: () => unknown
}

const devices = [
  { id: 'desktop' as const, label: 'Desktop', icon: 'heroicons:computer-desktop', width: '100%', widthLabel: 'Responsive width' },
  { id: 'tablet' as const, label: 'Tablet', icon: 'heroicons:device-tablet', width: '768px', widthLabel: '768 px' },
  { id: 'mobile' as const, label: 'Mobile', icon: 'heroicons:device-phone-mobile', width: '390px', widthLabel: '390 px' },
]

export function websiteEditorShortcutAction(
  event: WebsiteEditorShortcutEvent,
  versionPreviewActive = false,
): WebsiteEditorShortcutAction | null {
  if (!(event.ctrlKey || event.metaKey) || event.altKey || event.repeat) return null
  const key = event.key.toLowerCase()
  if (key === 'k') return 'navigator'
  if (versionPreviewActive) return null
  if (key === 's') return 'save'
  if (key === 'z') return event.shiftKey ? 'redo' : 'undo'
  if (key === 'y') return 'redo'
  return null
}

export function useWebsiteEditorShell(options: WebsiteEditorShellOptions) {
  const navigatorOpen = ref(false)
  const activeDevice = ref<WebsiteEditorDeviceId>('desktop')
  const controlsOpen = ref(false)
  const controlsDocked = ref(false)
  const controlsCollapsed = ref(false)
  const controlsTrigger = ref<HTMLButtonElement | null>(null)
  const controlsClose = ref<HTMLButtonElement | null>(null)
  let controlsMediaQuery: MediaQueryList | null = null

  const activeDeviceConfig = computed(() => devices.find(device => device.id === activeDevice.value) ?? devices[0]!)
  const controlsVisible = computed(() => controlsDocked.value ? !controlsCollapsed.value : controlsOpen.value)
  const controlsToggleLabel = computed(() => controlsDocked.value
    ? (controlsCollapsed.value ? 'Show editor sidebar' : 'Hide editor sidebar')
    : 'Open sections panel')
  const previewFrameStyle = computed(() => ({
    width: activeDeviceConfig.value.width,
    maxWidth: '100%',
    height: '100%',
  }))

  function openControls() {
    controlsOpen.value = true
    nextTick(() => controlsClose.value?.focus())
  }

  function closeControls() {
    if (!controlsOpen.value) return
    controlsOpen.value = false
    nextTick(() => controlsTrigger.value?.focus())
  }

  function toggleControls() {
    if (controlsDocked.value) {
      controlsCollapsed.value = !controlsCollapsed.value
      return
    }
    if (controlsOpen.value) closeControls()
    else openControls()
  }

  function collapseControls() {
    controlsCollapsed.value = true
    nextTick(() => controlsTrigger.value?.focus())
  }

  function syncControlsViewport(event: MediaQueryList | MediaQueryListEvent) {
    controlsDocked.value = event.matches
    if (event.matches) controlsOpen.value = false
  }

  function onBeforeUnload(event: BeforeUnloadEvent) {
    if (!options.isDirty.value) return
    event.preventDefault()
    event.returnValue = ''
  }

  function onEditorKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && controlsOpen.value) {
      closeControls()
      return
    }

    const action = websiteEditorShortcutAction(event, Boolean(options.selectedVersionId.value))
    if (!action) return
    event.preventDefault()

    if (action === 'navigator') navigatorOpen.value = true
    else if (action === 'save') {
      if (options.isDirty.value && !options.loadingDraft.value && !options.saving.value) void options.saveChanges()
    } else if (action === 'undo') options.undoChange()
    else options.redoChange()
  }

  onMounted(() => {
    controlsMediaQuery = window.matchMedia('(min-width: 1280px)')
    syncControlsViewport(controlsMediaQuery)
    controlsMediaQuery.addEventListener('change', syncControlsViewport)
    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('keydown', onEditorKeydown)
  })

  onBeforeUnmount(() => {
    controlsMediaQuery?.removeEventListener('change', syncControlsViewport)
    window.removeEventListener('beforeunload', onBeforeUnload)
    window.removeEventListener('keydown', onEditorKeydown)
  })

  return {
    devices,
    navigatorOpen,
    activeDevice,
    activeDeviceConfig,
    previewFrameStyle,
    controlsOpen,
    controlsDocked,
    controlsCollapsed,
    controlsVisible,
    controlsToggleLabel,
    controlsTrigger,
    controlsClose,
    toggleControls,
    collapseControls,
    closeControls,
  }
}

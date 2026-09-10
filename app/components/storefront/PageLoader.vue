<template>
  <div
    v-show="active"
    ref="loaderRoot"
    class="fixed inset-0 z-[11000] flex min-h-dvh items-center justify-center bg-white"
    role="status"
    aria-live="polite"
    aria-label="Loading page"
    data-page-loader
  >
    <div v-if="brandingReady" class="flex flex-col items-center px-6 text-center">
      <StorefrontLoaderMark
        :logo-url="preparedLogoUrl"
        :animation="loaderAnimation"
        aria-hidden="true"
      />

      <p class="mt-5 text-sm font-medium text-gray-700">Loading page</p>

      <div class="mt-3 h-0.5 w-24 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
        <span class="loader-progress block h-full w-1/2 origin-left rounded-full bg-primary-600" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { animate, useReducedMotion } from 'motion-v'
import type { LoaderLogoAnimation } from '~/composables/useSiteConfig'

const route = useRoute()
const router = useRouter()
const prefersReducedMotion = useReducedMotion()
const { siteConfig, pending: siteConfigPending, fetchSiteConfig } = useSiteConfig()

const loaderLogoUrl = computed(() => siteConfig.value?.loader_logo_url || '')
const loaderAnimation = computed<LoaderLogoAnimation>(() => siteConfig.value?.loader_animation || 'bounce')
const brandingReady = ref(false)
const preparedLogoUrl = ref('')

const excludedPrefixes = [
  '/admin',
  '/super-admin',
  '/payment',
  '/backorder/pay',
]

const isStorefrontPath = (path: string) => !excludedPrefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`))

const active = ref(isStorefrontPath(route.path))
const loaderRoot = ref<HTMLElement | null>(null)

const minimumVisibleMs = 240
let shownAt = Date.now()
let actionSequence = 0
let currentAnimation: ReturnType<typeof animate> | null = null
let fallbackTimer: ReturnType<typeof setTimeout> | undefined
let removeBeforeGuard: (() => void) | undefined
let removeAfterHook: (() => void) | undefined
let removeErrorHook: (() => void) | undefined
let brandingSequence = 0

function stopCurrentAnimation() {
  currentAnimation?.stop()
  currentAnimation = null
}

function setDocumentBusy(busy: boolean) {
  if (!import.meta.client) return

  if (busy) {
    document.documentElement.setAttribute('aria-busy', 'true')
  } else {
    document.documentElement.removeAttribute('aria-busy')
  }
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds))
}

function waitForSiteConfig(): Promise<void> {
  if (!siteConfigPending.value) return Promise.resolve()

  return new Promise((resolve) => {
    const timeout = setTimeout(finish, 2500)
    const stop = watch(siteConfigPending, (isPending) => {
      if (!isPending) finish()
    })

    function finish() {
      clearTimeout(timeout)
      stop()
      resolve()
    }
  })
}

function preloadLogo(url: string): Promise<boolean> {
  if (!url || !import.meta.client) return Promise.resolve(false)

  return new Promise((resolve) => {
    const image = new Image()
    const timeout = setTimeout(() => finish(false), 2000)
    let settled = false

    function finish(loaded: boolean) {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      image.onload = null
      image.onerror = null
      resolve(loaded)
    }

    image.onload = () => finish(true)
    image.onerror = () => finish(false)
    image.src = url

    if (image.complete) finish(image.naturalWidth > 0)
  })
}

async function prepareBranding() {
  const sequence = ++brandingSequence

  await fetchSiteConfig()
  await waitForSiteConfig()
  const logoUrl = loaderLogoUrl.value
  const logoLoaded = await preloadLogo(logoUrl)

  if (sequence !== brandingSequence) return
  preparedLogoUrl.value = logoLoaded ? logoUrl : ''
  brandingReady.value = true
  shownAt = Date.now()
  await nextTick()
}

watch(loaderLogoUrl, async (logoUrl) => {
  if (!import.meta.client || !brandingReady.value) return

  const sequence = ++brandingSequence
  const logoLoaded = await preloadLogo(logoUrl)
  if (sequence === brandingSequence) {
    preparedLogoUrl.value = logoLoaded ? logoUrl : ''
  }
})

async function show() {
  const sequence = ++actionSequence
  clearTimeout(fallbackTimer)
  stopCurrentAnimation()

  if (active.value) {
    setDocumentBusy(true)
    fallbackTimer = setTimeout(() => void hide(), 8000)
    return
  }

  active.value = true
  shownAt = Date.now()
  setDocumentBusy(true)
  if (!brandingReady.value) await prepareBranding()
  await nextTick()

  const root = loaderRoot.value
  if (!root || sequence !== actionSequence) return

  if (prefersReducedMotion.value) {
    root.style.opacity = '1'
  } else {
    root.style.opacity = '0'
    const animation = animate(root, { opacity: 1 }, {
      duration: 0.16,
      ease: [0.16, 1, 0.3, 1],
    })
    currentAnimation = animation

    try {
      await animation.finished
    } catch {
      // A newer loading state owns the overlay.
    } finally {
      if (currentAnimation === animation) currentAnimation = null
    }
  }

  if (sequence !== actionSequence) return
  fallbackTimer = setTimeout(() => void hide(), 8000)
}

async function hide() {
  if (!active.value) return

  const sequence = ++actionSequence
  clearTimeout(fallbackTimer)

  const remaining = Math.max(0, minimumVisibleMs - (Date.now() - shownAt))
  if (remaining > 0) await wait(remaining)
  if (sequence !== actionSequence) return

  stopCurrentAnimation()
  const root = loaderRoot.value

  if (root && !prefersReducedMotion.value) {
    const animation = animate(root, { opacity: 0 }, {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    })
    currentAnimation = animation

    try {
      await animation.finished
    } catch {
      // Teardown and a new navigation may interrupt the fade safely.
    } finally {
      if (currentAnimation === animation) currentAnimation = null
    }
  }

  if (sequence !== actionSequence) return
  active.value = false
  setDocumentBusy(false)
  if (root) root.style.opacity = '1'
}

function hideImmediately() {
  ++actionSequence
  clearTimeout(fallbackTimer)
  stopCurrentAnimation()
  active.value = false
  setDocumentBusy(false)
  if (loaderRoot.value) loaderRoot.value.style.opacity = '1'
}

useRuntimeHook('page:finish', () => {
  if (!import.meta.client) return
  if (isStorefrontPath(route.path)) {
    if (brandingReady.value) void hide()
    return
  }

  hideImmediately()
})

onMounted(async () => {
  shownAt = Date.now()
  setDocumentBusy(active.value)

  removeBeforeGuard = router.beforeEach((to, from) => {
    if (isStorefrontPath(to.path) && to.path !== from.path) void show()
    else hideImmediately()
    return true
  })

  removeAfterHook = router.afterEach((to, _from, failure) => {
    if (failure || !isStorefrontPath(to.path)) hideImmediately()
  })

  removeErrorHook = router.onError(() => hideImmediately())
  if (active.value) {
    fallbackTimer = setTimeout(() => void hide(), 8000)
    await prepareBranding()
    requestAnimationFrame(() => void hide())
  } else {
    brandingReady.value = true
  }
})

onBeforeUnmount(() => {
  clearTimeout(fallbackTimer)
  stopCurrentAnimation()
  setDocumentBusy(false)
  removeBeforeGuard?.()
  removeAfterHook?.()
  removeErrorHook?.()
})
</script>

<style scoped>
.loader-progress {
  animation: loader-progress 900ms cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

@keyframes loader-progress {
  0% { opacity: 0; transform: translateX(-110%) scaleX(0.55); }
  35% { opacity: 1; }
  100% { opacity: 0; transform: translateX(210%) scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .loader-progress {
    animation: none;
  }

  .loader-progress { opacity: 0.7; transform: none; }
}
</style>

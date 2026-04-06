/**
 * Scroll Reveal Composable
 *
 * Adds a CSS class when an element scrolls into view using IntersectionObserver.
 * Use with the `.reveal` / `.reveal-visible` CSS classes.
 *
 * Usage:
 *   const { revealRef } = useScrollReveal()
 *   <div ref="revealRef" class="reveal"> ... </div>
 *
 * For multiple refs in a loop, use useScrollRevealAll():
 *   const { addRevealRef } = useScrollRevealAll()
 *   <div v-for="..." :ref="addRevealRef" class="reveal"> ... </div>
 */

export function useScrollReveal(options?: { threshold?: number }) {
  const revealRef = ref<HTMLElement | null>(null)

  onMounted(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: options?.threshold ?? 0.15 },
    )

    // Watch ref so elements that appear after v-if/loading resolves are observed
    watch(revealRef, (el, oldEl) => {
      if (oldEl) observer.unobserve(oldEl)
      if (el) observer.observe(el)
    }, { immediate: true })

    onUnmounted(() => observer.disconnect())
  })

  return { revealRef }
}

export function useScrollRevealAll(options?: { threshold?: number }) {
  const pending: Set<HTMLElement> = new Set()
  let observer: IntersectionObserver | null = null

  const addRevealRef = (el: any) => {
    if (el instanceof HTMLElement) {
      if (observer) {
        // Observer ready — observe immediately (handles elements created after loading)
        observer.observe(el)
      } else {
        // Collect before observer is ready (initial hydration)
        pending.add(el)
      }
    }
  }

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold: options?.threshold ?? 0.15 },
    )

    pending.forEach((el) => observer!.observe(el))
    pending.clear()
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return { addRevealRef }
}

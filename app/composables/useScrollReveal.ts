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
    if (!revealRef.value) return

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

    observer.observe(revealRef.value)

    onUnmounted(() => observer.disconnect())
  })

  return { revealRef }
}

export function useScrollRevealAll(options?: { threshold?: number }) {
  const elements: HTMLElement[] = []
  let observer: IntersectionObserver | null = null

  const addRevealRef = (el: any) => {
    if (el instanceof HTMLElement) {
      elements.push(el)
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

    elements.forEach((el) => observer!.observe(el))
  })

  onUnmounted(() => observer?.disconnect())

  return { addRevealRef }
}

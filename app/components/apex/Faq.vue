<template>
  <section id="faq" class="apex-faq" aria-labelledby="apex-faq-title">
    <div class="apex-faq__inner">
      <div class="apex-faq__intro">
        <h2 id="apex-faq-title">Questions before you start?</h2>
        <p>The practical details of setting up and running a store on SSU.</p>
      </div>

      <MotionConfig reduced-motion="user">
        <AccordionRoot
          v-model="openItem"
          type="single"
          collapsible
          class="apex-faq__questions"
        >
          <AccordionItem
            v-for="(item, index) in questions"
            :key="item.question"
            :value="itemValue(index)"
            class="apex-faq__item"
          >
            <AccordionHeader as="h3" class="apex-faq__header">
              <AccordionTrigger class="apex-faq__trigger">
                <span>{{ item.question }}</span>
                <motion.span
                  class="apex-faq__icon"
                  :initial="false"
                  :animate="{ rotate: openItem === itemValue(index) ? 45 : 0 }"
                  :transition="iconTransition"
                  aria-hidden="true"
                >
                  <Icon name="heroicons:plus" />
                </motion.span>
              </AccordionTrigger>
            </AccordionHeader>

            <AccordionContent
              force-mount
              as-child
              :aria-hidden="openItem === itemValue(index) ? undefined : 'true'"
            >
              <motion.div
                class="apex-faq__content"
                :initial="false"
                :animate="{ height: openItem === itemValue(index) ? 'auto' : 0 }"
                :transition="panelTransition"
              >
                <div class="apex-faq__answer">
                  <p>{{ item.answer }}</p>
                </div>
              </motion.div>
            </AccordionContent>
          </AccordionItem>
        </AccordionRoot>
      </MotionConfig>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from 'reka-ui'
import { MotionConfig, motion, useReducedMotion } from 'motion-v'

const openItem = ref<string>()
const prefersReducedMotion = useReducedMotion()

const itemValue = (index: number) => `faq-${index}`

const panelTransition = computed(() => prefersReducedMotion.value
  ? { duration: 0 }
  : { duration: 0.28, ease: [0.16, 1, 0.3, 1] })

const iconTransition = computed(() => prefersReducedMotion.value
  ? { duration: 0 }
  : { type: 'spring', stiffness: 430, damping: 32, mass: 0.65 })

const questions = [
  {
    question: 'Can I use SSU for an existing business?',
    answer: 'Yes. Add your current products or services and configure your brand and store settings at your own pace. SSU does not automatically import data from another platform.',
  },
  {
    question: 'What happens after I create an account?',
    answer: 'Your store account is created first. You then choose an available subscription plan and complete checkout to activate selling.',
  },
  {
    question: 'Can I use my own domain?',
    answer: 'Stores can use an SSU subdomain. A custom domain requires DNS setup and verification by an SSU platform administrator before it serves your store.',
  },
  {
    question: 'Can I sell products and services?',
    answer: 'SSU has tools for product catalogues and service listings. The sections shown on your storefront depend on how your store is configured.',
  },
  {
    question: 'How do payments work?',
    answer: 'SSU subscription checkout uses Stripe. Payment methods for your own storefront are configured separately in the admin and depend on the gateways you enable.',
  },
  {
    question: 'Where do I manage my subscription?',
    answer: 'After signing in, use the Subscription page in your admin to review plans and open the Stripe billing portal for invoices, payment methods or cancellation.',
  },
]
</script>

<style scoped>
.apex-faq { scroll-margin-top: 5rem; border-top: 1px solid var(--apex-border-soft); background: var(--apex-surface); color: var(--apex-text); }
.apex-faq__inner { display: grid; width: min(100%, 82rem); grid-template-columns: minmax(17rem, 0.8fr) minmax(0, 1.2fr); gap: clamp(3rem, 7vw, 8rem); margin: 0 auto; padding: clamp(5rem, 9vw, 8rem) 1.5rem; }
.apex-faq__intro h2 { max-width: 13ch; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.5rem, 4.8vw, 4.5rem); font-weight: 600; line-height: 1.12; letter-spacing: -0.03em; text-wrap: balance; }
.apex-faq__intro p { max-width: 27rem; margin: 1.25rem 0 0; color: var(--apex-text-muted); font-size: 1.05rem; line-height: 1.65; }
.apex-faq__questions { border-top: 1px solid var(--apex-border); }
.apex-faq__item { border-bottom: 1px solid var(--apex-border); }
.apex-faq__header { margin: 0; }
.apex-faq__trigger { display: flex; width: 100%; min-height: 5rem; align-items: center; justify-content: space-between; gap: 1.5rem; padding: 1.3rem 0; border: 0; background: transparent; color: inherit; cursor: pointer; font-family: 'Space Grotesk', var(--font-heading); font-size: clamp(1rem, 1.45vw, 1.2rem); font-weight: 600; line-height: 1.4; text-align: left; }
.apex-faq__trigger:focus-visible { border-radius: 0.25rem; outline: 2px solid var(--apex-focus-on-light); outline-offset: 4px; }
.apex-faq__icon { display: grid; flex: 0 0 auto; width: 1.15rem; height: 1.15rem; place-items: center; transform-origin: center; }
.apex-faq__icon :deep(svg) { width: 100%; height: 100%; }
.apex-faq__content { overflow: hidden; }
.apex-faq__answer { padding: 0 0 1.6rem; }
.apex-faq__answer p { max-width: 62ch; margin: -0.2rem 0 0; color: var(--apex-text-muted); font-size: 0.95rem; line-height: 1.7; }

@media (max-width: 900px) {
  .apex-faq__inner { grid-template-columns: 1fr; gap: 2.5rem; }
}

@media (max-width: 639px) {
  .apex-faq__inner { padding: 4.5rem 1.25rem; }
  .apex-faq__intro p { font-size: 0.95rem; }
  .apex-faq__trigger { min-height: 4.5rem; }
}

</style>

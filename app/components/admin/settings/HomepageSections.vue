<template>
  <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      </div>
      <div>
        <h2 class="text-sm font-semibold text-gray-900">Homepage Sections</h2>
        <p class="text-xs text-gray-400">Customize the content blocks on your homepage</p>
      </div>
    </div>

    <div class="p-6 space-y-8">
      <!-- How It Works / Steps -->
      <div>
        <h3 class="text-sm font-semibold text-gray-800 mb-4">How It Works</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Label</label>
            <input :value="localSteps.label" @input="updateStepsField('label', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Simple & Easy" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Heading</label>
            <input :value="localSteps.heading" @input="updateStepsField('heading', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="How It Works" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Subtitle</label>
            <input :value="localSteps.subtitle" @input="updateStepsField('subtitle', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Start shopping in just three easy steps" />
          </div>
        </div>
        <div class="space-y-3">
          <div v-for="(step, i) in localSteps.items" :key="i" class="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
            <span class="text-xs font-bold text-gray-400 mt-2.5 shrink-0 w-5 text-center">{{ i + 1 }}</span>
            <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input :value="step.title" @input="updateStepItem(i, 'title', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Step title" />
              <input :value="step.description" @input="updateStepItem(i, 'description', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Step description" />
            </div>
            <button v-if="localSteps.items.length > 1" type="button" class="mt-2 text-gray-300 hover:text-red-500 transition-colors" @click="removeStepItem(i)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <button v-if="localSteps.items.length < 6" type="button" class="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors" @click="addStepItem">+ Add step</button>
        </div>
      </div>

      <hr class="border-gray-100" />

      <!-- Feature Strip -->
      <div>
        <h3 class="text-sm font-semibold text-gray-800 mb-4">Features</h3>
        <div class="space-y-3">
          <div v-for="(feature, i) in localFeatures.items" :key="i" class="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
            <span class="text-xs font-bold text-gray-400 mt-2.5 shrink-0 w-5 text-center">{{ i + 1 }}</span>
            <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input :value="feature.title" @input="updateFeatureItem(i, 'title', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Feature title" />
              <input :value="feature.description" @input="updateFeatureItem(i, 'description', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Feature description" />
            </div>
            <button v-if="localFeatures.items.length > 1" type="button" class="mt-2 text-gray-300 hover:text-red-500 transition-colors" @click="removeFeatureItem(i)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <button v-if="localFeatures.items.length < 6" type="button" class="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors" @click="addFeatureItem">+ Add feature</button>
        </div>
      </div>

      <hr class="border-gray-100" />

      <!-- Stats -->
      <div>
        <h3 class="text-sm font-semibold text-gray-800 mb-4">Stats Banner</h3>
        <div class="space-y-3">
          <div v-for="(stat, i) in localStats.items" :key="i" class="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
            <span class="text-xs font-bold text-gray-400 mt-2.5 shrink-0 w-5 text-center">{{ i + 1 }}</span>
            <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input :value="stat.value" @input="updateStatItem(i, 'value', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="500+" />
              <input :value="stat.label" @input="updateStatItem(i, 'label', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Products" />
            </div>
            <button v-if="localStats.items.length > 1" type="button" class="mt-2 text-gray-300 hover:text-red-500 transition-colors" @click="removeStatItem(i)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <button v-if="localStats.items.length < 8" type="button" class="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors" @click="addStatItem">+ Add stat</button>
        </div>
      </div>

      <hr class="border-gray-100" />

      <!-- Newsletter -->
      <div>
        <h3 class="text-sm font-semibold text-gray-800 mb-4">Newsletter</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Label</label>
            <input :value="localNewsletter.label" @input="updateNewsletterField('label', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Stay in the loop" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Heading</label>
            <input :value="localNewsletter.heading" @input="updateNewsletterField('heading', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Don't miss a deal." />
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-medium text-gray-500 mb-1">Subtitle</label>
            <input :value="localNewsletter.subtitle" @input="updateNewsletterField('subtitle', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Get the latest products..." />
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-medium text-gray-500 mb-1">Disclaimer</label>
            <input :value="localNewsletter.disclaimer" @input="updateNewsletterField('disclaimer', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="No spam, ever. Unsubscribe anytime." />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomepageSteps, HomepageFeatures, HomepageStats, HomepageNewsletter } from '~/composables/useSiteConfig'

interface Props {
  steps: HomepageSteps
  features: HomepageFeatures
  stats: HomepageStats
  newsletter: HomepageNewsletter
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:steps': [value: HomepageSteps]
  'update:features': [value: HomepageFeatures]
  'update:stats': [value: HomepageStats]
  'update:newsletter': [value: HomepageNewsletter]
}>()

const localSteps = computed(() => props.steps)
const localFeatures = computed(() => props.features)
const localStats = computed(() => props.stats)
const localNewsletter = computed(() => props.newsletter)

// Steps
function updateStepsField(key: 'label' | 'heading' | 'subtitle', value: string) {
  emit('update:steps', { ...localSteps.value, [key]: value })
}
function updateStepItem(index: number, key: 'title' | 'description', value: string) {
  const items = localSteps.value.items.map((item, i) => i === index ? { ...item, [key]: value } : item)
  emit('update:steps', { ...localSteps.value, items })
}
function addStepItem() {
  emit('update:steps', { ...localSteps.value, items: [...localSteps.value.items, { title: '', description: '' }] })
}
function removeStepItem(index: number) {
  emit('update:steps', { ...localSteps.value, items: localSteps.value.items.filter((_, i) => i !== index) })
}

// Features
function updateFeatureItem(index: number, key: 'title' | 'description', value: string) {
  const items = localFeatures.value.items.map((item, i) => i === index ? { ...item, [key]: value } : item)
  emit('update:features', { items })
}
function addFeatureItem() {
  emit('update:features', { items: [...localFeatures.value.items, { title: '', description: '' }] })
}
function removeFeatureItem(index: number) {
  emit('update:features', { items: localFeatures.value.items.filter((_, i) => i !== index) })
}

// Stats
function updateStatItem(index: number, key: 'value' | 'label', value: string) {
  const items = localStats.value.items.map((item, i) => i === index ? { ...item, [key]: value } : item)
  emit('update:stats', { items })
}
function addStatItem() {
  emit('update:stats', { items: [...localStats.value.items, { value: '', label: '' }] })
}
function removeStatItem(index: number) {
  emit('update:stats', { items: localStats.value.items.filter((_, i) => i !== index) })
}

// Newsletter
function updateNewsletterField(key: 'label' | 'heading' | 'subtitle' | 'disclaimer', value: string) {
  emit('update:newsletter', { ...localNewsletter.value, [key]: value })
}
</script>

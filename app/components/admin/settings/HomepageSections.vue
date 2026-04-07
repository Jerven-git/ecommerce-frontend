<template>
  <section data-guide="settings-homepage-sections" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      </div>
      <div>
        <h2 class="text-sm font-semibold text-gray-900">Homepage Sections</h2>
        <p class="text-xs text-gray-400">Click directly on text to edit &middot; Hover cards for options</p>
      </div>
    </div>

    <div class="p-4 space-y-6">
      <!-- ═══════════ How It Works ═══════════ -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
          <span class="ml-2 text-[10px] text-gray-400 font-medium">How It Works</span>
        </div>
        <div class="bg-white p-6 text-center">
          <!-- Editable header -->
          <input
            :value="localSteps.label"
            @input="updateStepsField('label', ($event.target as HTMLInputElement).value)"
            type="text"
            class="edit-inline text-[10px] font-semibold uppercase tracking-widest text-gray-400 text-center mb-1"
            placeholder="Label (e.g. Simple & Easy)"
          />
          <input
            :value="localSteps.heading"
            @input="updateStepsField('heading', ($event.target as HTMLInputElement).value)"
            type="text"
            class="edit-inline text-lg font-bold text-gray-900 text-center mb-1"
            placeholder="Heading"
          />
          <input
            :value="localSteps.subtitle"
            @input="updateStepsField('subtitle', ($event.target as HTMLInputElement).value)"
            type="text"
            class="edit-inline text-xs text-gray-400 text-center mb-5 max-w-sm mx-auto"
            placeholder="Subtitle"
          />

          <!-- Step cards grid -->
          <div class="grid gap-3" :style="{ gridTemplateColumns: `repeat(${Math.min(localSteps.items.length + 1, 4)}, minmax(0, 1fr))` }">
            <div
              v-for="(step, i) in localSteps.items"
              :key="i"
              class="group/card relative rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center bg-white hover:border-primary-200 hover:shadow-md transition-all"
            >
              <!-- Delete button -->
              <button
                v-if="localSteps.items.length > 1"
                type="button"
                class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-10"
                @click="removeStepItem(i)"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <!-- Icon -->
              <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3 ring-2 ring-white shadow-sm" :class="STEP_COLORS[i % STEP_COLORS.length]!.bg">
                <AdminIconPicker :model-value="step.icon || DEFAULT_ICON" @update:model-value="updateStepItem(i, 'icon', $event)" />
              </div>

              <span class="text-[9px] font-bold uppercase tracking-wider mb-1" :class="STEP_COLORS[i % STEP_COLORS.length]!.text">Step {{ i + 1 }}</span>

              <input
                :value="step.title"
                @input="updateStepItem(i, 'title', ($event.target as HTMLInputElement).value)"
                type="text"
                class="edit-inline text-sm font-semibold text-gray-900 mb-1 text-center"
                placeholder="Title"
              />
              <input
                :value="step.description"
                @input="updateStepItem(i, 'description', ($event.target as HTMLInputElement).value)"
                type="text"
                class="edit-inline text-xs text-gray-500 text-center leading-relaxed"
                placeholder="Description"
              />
            </div>

            <!-- Add step card -->
            <button
              v-if="localSteps.items.length < 6"
              type="button"
              class="rounded-xl border-2 border-dashed border-gray-200 p-4 flex flex-col items-center justify-center text-gray-300 hover:text-primary-500 hover:border-primary-300 transition-all min-h-[120px]"
              @click="addStepItem"
            >
              <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              <span class="text-[10px] font-medium">Add Step</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ═══════════ Features ═══════════ -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
          <span class="ml-2 text-[10px] text-gray-400 font-medium">Features</span>
        </div>
        <div class="bg-gray-50/80 p-6">
          <div class="grid gap-3" :style="{ gridTemplateColumns: `repeat(${Math.min(localFeatures.items.length + 1, 4)}, minmax(0, 1fr))` }">
            <div
              v-for="(feature, i) in localFeatures.items"
              :key="i"
              class="group/card relative rounded-xl border border-gray-100 shadow-sm p-4 bg-white hover:border-primary-200 hover:shadow-md transition-all"
            >
              <!-- Delete button -->
              <button
                v-if="localFeatures.items.length > 1"
                type="button"
                class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-10"
                @click="removeFeatureItem(i)"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <!-- Icon -->
              <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3" :class="FEATURE_COLORS[i % FEATURE_COLORS.length]!.bg">
                <AdminIconPicker :model-value="feature.icon || DEFAULT_ICON" @update:model-value="updateFeatureItem(i, 'icon', $event)" />
              </div>

              <input
                :value="feature.title"
                @input="updateFeatureItem(i, 'title', ($event.target as HTMLInputElement).value)"
                type="text"
                class="edit-inline text-sm font-semibold text-gray-900 mb-1"
                placeholder="Title"
              />
              <input
                :value="feature.description"
                @input="updateFeatureItem(i, 'description', ($event.target as HTMLInputElement).value)"
                type="text"
                class="edit-inline text-xs text-gray-500 leading-relaxed"
                placeholder="Description"
              />
            </div>

            <!-- Add feature card -->
            <button
              v-if="localFeatures.items.length < 6"
              type="button"
              class="rounded-xl border-2 border-dashed border-gray-200 p-4 flex flex-col items-center justify-center text-gray-300 hover:text-primary-500 hover:border-primary-300 transition-all min-h-[100px]"
              @click="addFeatureItem"
            >
              <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              <span class="text-[10px] font-medium">Add Feature</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ═══════════ Stats Banner ═══════════ -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
          <span class="ml-2 text-[10px] text-gray-400 font-medium">Stats Banner</span>
        </div>
        <div class="py-8 px-6 text-white text-center" :style="{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }">
          <div class="flex gap-3 justify-center items-start flex-wrap">
            <div
              v-for="(stat, i) in localStats.items"
              :key="i"
              class="group/card relative flex-1 min-w-[80px] max-w-[140px]"
            >
              <!-- Delete button -->
              <button
                v-if="localStats.items.length > 1"
                type="button"
                class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-10"
                @click="removeStatItem(i)"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <input
                :value="stat.value"
                @input="updateStatItem(i, 'value', ($event.target as HTMLInputElement).value)"
                type="text"
                class="edit-inline-light text-2xl font-extrabold text-white drop-shadow text-center mb-0.5"
                placeholder="0+"
              />
              <input
                :value="stat.label"
                @input="updateStatItem(i, 'label', ($event.target as HTMLInputElement).value)"
                type="text"
                class="edit-inline-light text-[10px] text-white/70 font-semibold uppercase tracking-widest text-center"
                placeholder="Label"
              />
            </div>

            <!-- Add stat -->
            <button
              v-if="localStats.items.length < 8"
              type="button"
              class="flex-1 min-w-[60px] max-w-[80px] rounded-lg border-2 border-dashed border-white/20 py-4 flex flex-col items-center justify-center text-white/30 hover:text-white/70 hover:border-white/40 transition-all"
              @click="addStatItem"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              <span class="text-[8px] font-medium">Add</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ═══════════ Newsletter ═══════════ -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
          <span class="ml-2 text-[10px] text-gray-400 font-medium">Newsletter</span>
        </div>
        <div class="py-10 px-6 text-white text-center relative overflow-hidden" :style="{ backgroundColor: themeColors.secondary }">
          <!-- Decorative blobs -->
          <div class="absolute inset-0 opacity-5 pointer-events-none">
            <div class="absolute top-0 left-1/4 w-48 h-48 rounded-full bg-white blur-3xl"></div>
            <div class="absolute bottom-0 right-1/4 w-36 h-36 rounded-full bg-white blur-3xl"></div>
          </div>

          <div class="relative max-w-md mx-auto">
            <input
              :value="localNewsletter.label"
              @input="updateNewsletterField('label', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline-light text-[10px] font-semibold uppercase tracking-widest text-white/80 text-center mb-1"
              placeholder="Label"
            />
            <input
              :value="localNewsletter.heading"
              @input="updateNewsletterField('heading', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline-light text-xl font-bold text-white text-center mb-1"
              placeholder="Heading"
            />
            <input
              :value="localNewsletter.subtitle"
              @input="updateNewsletterField('subtitle', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline-light text-xs text-white/70 text-center mb-5 max-w-sm mx-auto"
              placeholder="Subtitle"
            />

            <!-- Mock form (non-functional, just for display) -->
            <div class="flex gap-2 max-w-xs mx-auto mb-3">
              <div class="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white/35 text-left">Enter your email</div>
              <div class="px-5 py-2.5 rounded-xl text-xs font-semibold text-white cursor-default" :style="{ backgroundColor: themeColors.primary }">Subscribe</div>
            </div>

            <input
              :value="localNewsletter.disclaimer"
              @input="updateNewsletterField('disclaimer', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline-light text-[10px] text-white/50 text-center"
              placeholder="Disclaimer"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomepageSteps, HomepageFeatures, HomepageStats, HomepageNewsletter } from '~/composables/useSiteConfig'
import { DEFAULT_THEME } from '~/composables/useSiteConfig'
import { DEFAULT_ICON } from '~/composables/useHighlightIcons'

const STEP_COLORS = [
  { bg: 'bg-primary-50', text: 'text-primary-600' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { bg: 'bg-purple-50', text: 'text-purple-600' },
]

const FEATURE_COLORS = [
  { bg: 'bg-primary-50', text: 'text-primary-600' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { bg: 'bg-purple-50', text: 'text-purple-600' },
]

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

const { siteConfig } = useSiteConfig()
const themeColors = computed(() => ({
  primary: siteConfig.value?.theme?.primary_color || DEFAULT_THEME.primary_color,
  secondary: siteConfig.value?.theme?.secondary_color || DEFAULT_THEME.secondary_color,
}))

const localSteps = computed(() => props.steps)
const localFeatures = computed(() => props.features)
const localStats = computed(() => props.stats)
const localNewsletter = computed(() => props.newsletter)

// Steps
function updateStepsField(key: 'label' | 'heading' | 'subtitle', value: string) {
  emit('update:steps', { ...localSteps.value, [key]: value })
}
function updateStepItem(index: number, key: 'icon' | 'title' | 'description', value: string) {
  const items = localSteps.value.items.map((item, i) => i === index ? { ...item, [key]: value } : item)
  emit('update:steps', { ...localSteps.value, items })
}
function addStepItem() {
  emit('update:steps', { ...localSteps.value, items: [...localSteps.value.items, { icon: DEFAULT_ICON, title: '', description: '' }] })
}
function removeStepItem(index: number) {
  emit('update:steps', { ...localSteps.value, items: localSteps.value.items.filter((_, i) => i !== index) })
}

// Features
function updateFeatureItem(index: number, key: 'icon' | 'title' | 'description', value: string) {
  const items = localFeatures.value.items.map((item, i) => i === index ? { ...item, [key]: value } : item)
  emit('update:features', { items })
}
function addFeatureItem() {
  emit('update:features', { items: [...localFeatures.value.items, { icon: DEFAULT_ICON, title: '', description: '' }] })
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

<style scoped>
.edit-inline {
  display: block; width: 100%; background: transparent;
  border: 1px dashed transparent; border-radius: 0.375rem;
  padding: 0.25rem 0.5rem; outline: none; transition: all 0.15s ease;
}
.edit-inline:hover { border-color: rgb(165,180,252); background: rgb(238,242,255); }
.edit-inline:focus { border-color: rgb(99,102,241); border-style: solid; background: white; box-shadow: 0 0 0 2px rgba(99,102,241,0.15); }
.edit-inline::placeholder { color: rgb(199,210,254); font-style: italic; }

.edit-inline-light {
  display: block; width: 100%; background: transparent;
  border: 1px dashed transparent; border-radius: 0.375rem;
  padding: 0.125rem 0.375rem; outline: none; transition: all 0.15s ease;
}
.edit-inline-light:hover { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); }
.edit-inline-light:focus { border-color: rgba(255,255,255,0.5); border-style: solid; background: rgba(255,255,255,0.1); box-shadow: 0 0 0 2px rgba(255,255,255,0.12); }
.edit-inline-light::placeholder { color: rgba(255,255,255,0.3); font-style: italic; }
</style>

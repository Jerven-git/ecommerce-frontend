<template>
  <section data-guide="settings-theme" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </div>
      <div>
        <h2 class="text-sm font-semibold text-gray-900">Theme</h2>
        <p class="text-xs text-gray-400">Colors, fonts, and presets</p>
      </div>
    </div>

    <div class="p-6 space-y-5">
      <!-- Theme Presets -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Theme Presets</label>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            v-for="preset in themePresets"
            :key="preset.name"
            type="button"
            class="group relative rounded-xl border-2 p-3 transition-all hover:shadow-md text-left"
            :class="isActivePreset(preset) ? 'border-primary-500 ring-2 ring-primary-200 shadow-sm' : 'border-gray-200 hover:border-gray-300'"
            :title="isActivePreset(preset) ? 'Click to deselect' : `Apply ${preset.name}`"
            @click="togglePreset(preset)"
          >
            <!-- Mini preview -->
            <div class="rounded-lg overflow-hidden border border-gray-100 mb-2.5">
              <div class="h-6 flex items-center px-2 gap-1" :style="{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }">
                <span class="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-white/50"></span>
              </div>
              <div class="relative h-16 overflow-hidden" :style="{ backgroundColor: preset.accent }">
                <img
                  v-if="preset.heroImage"
                  :src="preset.heroImage"
                  class="absolute inset-0 w-full h-full object-cover"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <div class="absolute inset-0" :style="{ backgroundColor: preset.primary, opacity: 0.35 }"></div>
                <div class="relative p-1.5">
                  <div class="h-2 rounded-sm w-3/4 mb-1 bg-white/85"></div>
                  <div class="h-1.5 rounded-sm w-full bg-white/55"></div>
                  <div class="h-1.5 rounded-sm w-2/3 mt-0.5 bg-white/40"></div>
                </div>
              </div>
            </div>
            <p class="text-xs font-semibold text-gray-800 leading-tight">{{ preset.name }}</p>
            <p class="text-[10px] text-gray-400 mt-0.5">{{ preset.headingFont }} · {{ preset.bodyFont }}</p>
            <div class="flex gap-1 mt-1.5">
              <span class="w-3 h-3 rounded-full border border-white shadow-sm" :style="{ backgroundColor: preset.primary }"></span>
              <span class="w-3 h-3 rounded-full border border-white shadow-sm" :style="{ backgroundColor: preset.secondary }"></span>
              <span class="w-3 h-3 rounded-full border border-gray-200 shadow-sm" :style="{ backgroundColor: preset.accent }"></span>
            </div>
            <div
              v-if="isActivePreset(preset)"
              class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center group-hover:bg-red-500 transition-colors"
            >
              <svg class="w-3 h-3 text-white group-hover:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <svg class="w-3 h-3 text-white hidden group-hover:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- Color Pickers -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div v-for="color in colorFields" :key="color.key">
          <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ color.label }}</label>
          <div class="flex items-center gap-2">
            <div class="relative shrink-0">
              <input :value="modelValue[color.key]" @input="updateField(color.key, ($event.target as HTMLInputElement).value)" type="color" class="sr-only" :id="color.key + 'Picker'" />
              <label
                :for="color.key + 'Picker'"
                class="block w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow ring-1 ring-gray-200 hover:scale-105 transition-transform"
                :style="{ backgroundColor: modelValue[color.key] }"
              />
            </div>
            <input :value="modelValue[color.key]" @input="updateField(color.key, ($event.target as HTMLInputElement).value)" type="text" class="input-field font-mono text-sm" :placeholder="color.placeholder" />
          </div>
        </div>
      </div>

      <!-- Preview bar (click any swatch to open a colour picker) -->
      <div class="rounded-xl overflow-hidden border border-gray-100 h-14 flex">
        <label
          for="primary_colorPickerLg"
          class="flex-1 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:brightness-110 transition-all"
          :style="{ backgroundColor: modelValue.primary_color }"
          title="Click to change primary colour"
        >
          Primary
          <input
            id="primary_colorPickerLg"
            :value="modelValue.primary_color"
            @input="updateField('primary_color', ($event.target as HTMLInputElement).value)"
            type="color"
            class="sr-only"
          />
        </label>
        <label
          for="secondary_colorPickerLg"
          class="flex-1 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:brightness-110 transition-all"
          :style="{ backgroundColor: modelValue.secondary_color }"
          title="Click to change secondary colour"
        >
          Secondary
          <input
            id="secondary_colorPickerLg"
            :value="modelValue.secondary_color"
            @input="updateField('secondary_color', ($event.target as HTMLInputElement).value)"
            type="color"
            class="sr-only"
          />
        </label>
        <label
          for="accent_colorPickerLg"
          class="flex-1 flex items-center justify-center text-sm font-semibold text-gray-600 cursor-pointer hover:brightness-95 transition-all"
          :style="{ backgroundColor: modelValue.accent_color }"
          title="Click to change accent colour"
        >
          Accent
          <input
            id="accent_colorPickerLg"
            :value="modelValue.accent_color"
            @input="updateField('accent_color', ($event.target as HTMLInputElement).value)"
            type="color"
            class="sr-only"
          />
        </label>
      </div>

      <!-- Fonts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Heading Font</label>
          <select :value="modelValue.heading_font" @change="updateField('heading_font', ($event.target as HTMLSelectElement).value)" class="input-field text-sm">
            <option v-for="font in availableFonts" :key="font" :value="font">{{ font }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Body Font</label>
          <select :value="modelValue.body_font" @change="updateField('body_font', ($event.target as HTMLSelectElement).value)" class="input-field text-sm">
            <option v-for="font in availableFonts" :key="font" :value="font">{{ font }}</option>
          </select>
        </div>
      </div>

      <!-- Badge Colors -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Badge Colors</label>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div v-for="color in badgeColorFields" :key="color.key">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ color.label }}</label>
            <div class="flex items-center gap-2">
              <div class="relative shrink-0">
                <input :value="modelValue[color.key]" @input="updateField(color.key, ($event.target as HTMLInputElement).value)" type="color" class="sr-only" :id="color.key + 'Picker'" />
                <label
                  :for="color.key + 'Picker'"
                  class="block w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow ring-1 ring-gray-200 hover:scale-105 transition-transform"
                  :style="{ backgroundColor: modelValue[color.key] }"
                />
              </div>
              <input :value="modelValue[color.key]" @input="updateField(color.key, ($event.target as HTMLInputElement).value)" type="text" class="input-field font-mono text-sm" :placeholder="color.placeholder" />
            </div>
          </div>
        </div>
      </div>

      <!-- Texture -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Background Texture</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tex in availableTextures"
            :key="tex.id"
            type="button"
            class="relative w-16 h-16 rounded-xl border-2 transition-all hover:shadow-sm overflow-hidden"
            :class="modelValue.texture === tex.id ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300'"
            @click="updateField('texture', tex.id)"
          >
            <div
              v-if="tex.id !== 'none'"
              class="absolute inset-0"
              :style="{
                backgroundColor: modelValue.accent_color,
                backgroundImage: tex.css,
                backgroundSize: { dots: '20px 20px', grid: '20px 20px', waves: '40px 20px', polka: '30px 30px', zigzag: '20px 20px', diamond: '24px 24px' }[tex.id] || 'auto',
                color: modelValue.primary_color + '15',
              }"
            ></div>
            <div v-else class="absolute inset-0 bg-gray-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <span class="absolute bottom-0 inset-x-0 text-[9px] font-medium text-center pb-0.5 text-gray-500 bg-white/80">{{ tex.name }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { AVAILABLE_FONTS, AVAILABLE_TEXTURES, THEME_PRESETS, type ThemePreset } from '~/composables/useTheme'

export interface ThemeForm {
  primary_color: string
  secondary_color: string
  accent_color: string
  heading_font: string
  body_font: string
  texture: string
  badge_in_stock_color: string
}

interface PresetCovers {
  about: string
  blog: string
  services: string
  contact: string
}

interface Props {
  modelValue: ThemeForm
  savedTheme: ThemeForm
  savedHero: { image: string, mime: string }
  savedCovers: PresetCovers
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: ThemeForm]
  'preset-applied': [value: { heroImage: string, heroMediaMime: string, covers: PresetCovers }]
}>()

const availableFonts = AVAILABLE_FONTS
const availableTextures = AVAILABLE_TEXTURES
const themePresets = THEME_PRESETS

const colorFields = [
  { key: 'primary_color' as const, label: 'Primary Color', placeholder: '#6898ED' },
  { key: 'secondary_color' as const, label: 'Secondary Color', placeholder: '#4B5979' },
  { key: 'accent_color' as const, label: 'Accent / Surface Color', placeholder: '#F3F4F6' },
]

const badgeColorFields = [
  { key: 'badge_in_stock_color' as const, label: 'In Stock Badge', placeholder: '#16a34a' },
]

function updateField(key: keyof ThemeForm, value: string) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const DEFAULT_THEME: ThemeForm = {
  primary_color: '#6898ED',
  secondary_color: '#4B5979',
  accent_color: '#F3F4F6',
  heading_font: 'Inter',
  body_font: 'Inter',
  texture: 'none',
  badge_in_stock_color: '#16a34a',
}

function themeMatches(a: ThemeForm, b: ThemeForm): boolean {
  return a.primary_color.toLowerCase() === b.primary_color.toLowerCase()
    && a.secondary_color.toLowerCase() === b.secondary_color.toLowerCase()
    && a.accent_color.toLowerCase() === b.accent_color.toLowerCase()
    && a.heading_font === b.heading_font
    && a.body_font === b.body_font
    && a.texture === b.texture
}

function presetToTheme(preset: ThemePreset): ThemeForm {
  return {
    primary_color: preset.primary,
    secondary_color: preset.secondary,
    accent_color: preset.accent,
    heading_font: preset.headingFont,
    body_font: preset.bodyFont,
    texture: preset.texture,
    badge_in_stock_color: props.modelValue.badge_in_stock_color,
  }
}

function isActivePreset(preset: ThemePreset): boolean {
  return themeMatches(props.modelValue, presetToTheme(preset))
}

function togglePreset(preset: ThemePreset) {
  if (!isActivePreset(preset)) {
    emit('update:modelValue', presetToTheme(preset))
    emit('preset-applied', {
      heroImage: preset.heroImage,
      heroMediaMime: preset.heroMediaMime,
      covers: {
        about: preset.aboutImage,
        blog: preset.blogImage,
        services: preset.servicesImage,
        contact: preset.contactImage,
      },
    })
    return
  }
  // Deselect: revert to the last-saved theme + hero/covers. If the saved state
  // IS this preset, fall back to empty so the toggle still does something visible.
  const target = themeMatches(props.savedTheme, presetToTheme(preset))
    ? DEFAULT_THEME
    : props.savedTheme
  emit('update:modelValue', { ...target })

  const heroMatchesPreset = props.savedHero.image === preset.heroImage
  emit('preset-applied', {
    heroImage: heroMatchesPreset ? '' : props.savedHero.image,
    heroMediaMime: heroMatchesPreset ? '' : props.savedHero.mime,
    covers: {
      about: props.savedCovers.about === preset.aboutImage ? '' : props.savedCovers.about,
      blog: props.savedCovers.blog === preset.blogImage ? '' : props.savedCovers.blog,
      services: props.savedCovers.services === preset.servicesImage ? '' : props.savedCovers.services,
      contact: props.savedCovers.contact === preset.contactImage ? '' : props.savedCovers.contact,
    },
  })
}
</script>

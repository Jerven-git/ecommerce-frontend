<template>
  <section data-guide="settings-modules" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <h2 class="text-sm font-semibold text-gray-900">Site Modules</h2>
        <p class="text-xs text-gray-400">Turn entire sections of the site on or off. Disabled pages redirect to the homepage.</p>
      </div>
    </div>

    <div class="p-4 space-y-2">
      <div
        v-for="mod in MODULE_LIST"
        :key="mod.key"
        class="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
      >
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900">{{ mod.label }}</p>
          <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ mod.description }}</p>
        </div>
        <button
          type="button"
          @click="toggle(mod.key)"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 mt-0.5"
          :class="modelValue[mod.key] ? 'bg-primary-600' : 'bg-gray-200'"
          :aria-checked="modelValue[mod.key]"
          role="switch"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
            :class="modelValue[mod.key] ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>

      <div class="rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-3 mt-4">
        <p class="text-xs text-amber-800 leading-relaxed">
          <span class="font-semibold">Heads up:</span>
          disabling a module hides its pages, nav links, and related UI (e.g. the header cart icon when Shop is off).
          Admins see the same view as visitors — log in as admin to re-enable from this tab.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ModulesEnabled, ModuleKey } from '~/composables/useSiteConfig'
import { MODULE_LIST } from '~/composables/useModules'

const props = defineProps<{
  modelValue: ModulesEnabled
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ModulesEnabled]
}>()

function toggle(key: ModuleKey) {
  emit('update:modelValue', { ...props.modelValue, [key]: !props.modelValue[key] })
}
</script>

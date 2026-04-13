<template>
  <div class="space-y-5">
    <!-- Shipping Method (radio — pick one) -->
    <div v-if="methods.length > 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Shipping Method</h2>
      <div class="space-y-3">
        <label
          v-for="method in methods"
          :key="method.id"
          class="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50/50 transition-all"
          :class="selectedMethod === method.id ? 'border-primary-400 bg-primary-50/40 ring-1 ring-primary-200' : 'border-gray-200'"
        >
          <input
            type="radio"
            name="shipping_method"
            :value="method.id"
            :checked="selectedMethod === method.id"
            @change="$emit('update:selectedMethod', method.id)"
            class="mt-0.5 h-4 w-4 accent-primary-600 shrink-0"
          />
          <div class="flex-1 min-w-0 flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-gray-900">{{ method.name }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ method.description }}</p>
            </div>
            <span class="text-sm font-bold text-primary-700 shrink-0 text-right">
              <template v-if="method.pricing_mode === 'zone_based'">
                Zone rates
              </template>
              <template v-else-if="method.pricing_mode === 'weight_tiered'">
                Weight-based
              </template>
              <template v-else-if="method.fee != null">
                +${{ parseFloat(method.fee || 0).toFixed(2) }}
              </template>
            </span>
          </div>
        </label>
      </div>
    </div>

    <!-- Add-ons (checkboxes) -->
    <div v-if="addOns.length > 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Additional Services</h2>
      <div class="space-y-3">
        <label
          v-for="addOn in addOns"
          :key="addOn.id"
          class="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50/50 transition-all"
        >
          <input
            type="checkbox"
            :value="addOn.id"
            :checked="selectedAddOns.includes(addOn.id)"
            @change="onToggleAddOn(addOn.id, ($event.target as HTMLInputElement).checked)"
            class="mt-0.5 h-4 w-4 accent-primary-600 rounded shrink-0"
          />
          <div class="flex-1 min-w-0 flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-gray-900">{{ addOn.name }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ addOn.description }}</p>
            </div>
            <span class="text-sm font-bold text-primary-700 shrink-0 text-right">
              <template v-if="addOn.value_based">
                {{ parseFloat(addOn.rate_percent || 0).toFixed(2) }}% of order
                <span v-if="addOn.min_fee > 0" class="block text-xs font-normal text-gray-500">min ${{ parseFloat(addOn.min_fee).toFixed(2) }}</span>
              </template>
              <template v-else>
                +${{ parseFloat(addOn.fee || 0).toFixed(2) }}
              </template>
            </span>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  methods: any[]
  addOns: any[]
  selectedMethod: string
  selectedAddOns: string[]
}>()

const emit = defineEmits<{
  'update:selectedMethod': [value: string]
  'update:selectedAddOns': [value: string[]]
}>()

const onToggleAddOn = (id: string, checked: boolean) => {
  const updated = checked
    ? [...props.selectedAddOns, id]
    : props.selectedAddOns.filter(v => v !== id)
  emit('update:selectedAddOns', updated)
}
</script>

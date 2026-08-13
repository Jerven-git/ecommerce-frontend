<template>
  <div ref="wrapperRef" class="relative min-w-0">
    <button
      ref="triggerRef"
      type="button"
      class="group flex h-10 w-full min-w-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 text-left text-sm shadow-sm transition-[border-color,box-shadow] hover:border-primary-300 focus-visible:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20"
      :aria-label="ariaLabel"
      :aria-expanded="isOpen"
      :aria-controls="dialogId"
      aria-haspopup="dialog"
      @click="toggle"
      @keydown.down.prevent="openPicker"
      @keydown.escape.prevent="closePicker"
    >
      <span
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors group-hover:bg-primary-50 group-hover:text-primary-700"
        :class="isOpen ? 'bg-primary-50 text-primary-700' : ''"
      >
        <Icon name="heroicons:calendar-days" class="h-4 w-4" aria-hidden="true" />
      </span>
      <span class="min-w-0 flex-1 truncate font-medium" :class="modelValue ? 'text-gray-700' : 'text-gray-500'">
        {{ displayValue }}
      </span>
      <Icon
        name="heroicons:chevron-down"
        class="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-150 motion-reduce:transition-none"
        :class="isOpen ? 'rotate-180 text-primary-600' : ''"
        aria-hidden="true"
      />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out motion-reduce:transition-none"
      enter-from-class="-translate-y-1 opacity-0 motion-reduce:transform-none"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-1 opacity-0 motion-reduce:transform-none"
    >
      <div
        v-if="isOpen"
        :id="dialogId"
        role="dialog"
        :aria-label="`${ariaLabel} calendar`"
        class="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[19rem] max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-3 shadow-[0_22px_55px_-22px_rgba(15,23,42,0.48)]"
        @keydown.escape.prevent="closePicker({ restoreFocus: true })"
      >
        <div class="mb-3 flex items-center justify-between gap-2 px-1">
          <p class="text-sm font-semibold text-gray-900" aria-live="polite">{{ monthLabel }}</p>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-35"
              :disabled="!canGoPrevious"
              aria-label="Previous month"
              @click="changeMonth(-1)"
            >
              <Icon name="heroicons:chevron-left" class="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-35"
              :disabled="!canGoNext"
              aria-label="Next month"
              @click="changeMonth(1)"
            >
              <Icon name="heroicons:chevron-right" class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-7 gap-1" role="grid" :aria-label="monthLabel">
          <span
            v-for="weekday in weekdays"
            :key="weekday"
            role="columnheader"
            class="flex h-8 items-center justify-center text-[11px] font-semibold text-gray-500"
          >
            {{ weekday }}
          </span>

          <button
            v-for="day in calendarDays"
            :key="day.iso"
            type="button"
            role="gridcell"
            :data-date="day.iso"
            :tabindex="day.iso === focusedDateIso ? 0 : -1"
            :disabled="day.disabled"
            :aria-label="day.accessibleLabel"
            :aria-selected="day.selected"
            :aria-current="day.today ? 'date' : undefined"
            class="relative flex h-9 items-center justify-center rounded-lg text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-500/35 disabled:cursor-not-allowed disabled:opacity-25"
            :class="dayClass(day)"
            @click="selectDate(day.date)"
            @focus="focusedDateIso = day.iso"
            @keydown="handleDayKeydown($event, day.date)"
          >
            {{ day.date.getDate() }}
            <span
              v-if="day.today && !day.selected"
              class="absolute bottom-1 h-1 w-1 rounded-full bg-primary-600"
              aria-hidden="true"
            />
          </button>
        </div>

        <div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <button
            type="button"
            class="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!modelValue"
            @click="clearDate"
          >
            Clear
          </button>
          <button
            type="button"
            class="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!isDateAllowed(today)"
            @click="selectDate(today)"
          >
            Today
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface CalendarDay {
  date: Date
  iso: string
  currentMonth: boolean
  selected: boolean
  today: boolean
  disabled: boolean
  accessibleLabel: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  ariaLabel: string
  placeholder?: string
  min?: string
  max?: string
}>(), {
  placeholder: 'Select date',
  min: '',
  max: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const instanceId = useId()
const dialogId = `admin-date-picker-${instanceId}`
const wrapperRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const isOpen = ref(false)
const today = startOfDay(new Date())
const visibleMonth = ref(startOfMonth(parseIsoDate(props.modelValue) ?? today))
const focusedDateIso = ref(dateToIso(parseIsoDate(props.modelValue) ?? today))

const selectedDate = computed(() => parseIsoDate(props.modelValue))
const minDate = computed(() => parseIsoDate(props.min))
const maxDate = computed(() => parseIsoDate(props.max))

const displayValue = computed(() => {
  if (!selectedDate.value) return props.placeholder
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(selectedDate.value)
})

const monthLabel = computed(() =>
  new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(visibleMonth.value),
)

const calendarDays = computed<CalendarDay[]>(() => {
  const firstDay = startOfMonth(visibleMonth.value)
  const mondayOffset = (firstDay.getDay() + 6) % 7
  const firstVisibleDate = addDays(firstDay, -mondayOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(firstVisibleDate, index)
    const iso = dateToIso(date)
    return {
      date,
      iso,
      currentMonth: date.getMonth() === visibleMonth.value.getMonth(),
      selected: iso === props.modelValue,
      today: iso === dateToIso(today),
      disabled: !isDateAllowed(date),
      accessibleLabel: new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date),
    }
  })
})

const canGoPrevious = computed(() => {
  if (!minDate.value) return true
  return startOfMonth(visibleMonth.value).getTime() > startOfMonth(minDate.value).getTime()
})

const canGoNext = computed(() => {
  if (!maxDate.value) return true
  return startOfMonth(visibleMonth.value).getTime() < startOfMonth(maxDate.value).getTime()
})

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)
  return Number.isNaN(date.getTime()) ? null : startOfDay(date)
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12)
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return startOfDay(next)
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1, 12)
}

function dateToIso(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isDateAllowed(date: Date) {
  const time = startOfDay(date).getTime()
  if (minDate.value && time < minDate.value.getTime()) return false
  if (maxDate.value && time > maxDate.value.getTime()) return false
  return true
}

function dayClass(day: CalendarDay) {
  if (day.selected) return 'bg-primary-600 text-white shadow-sm'
  if (!day.currentMonth) return 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
  if (day.today) return 'bg-primary-50 text-primary-800 hover:bg-primary-100'
  return 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
}

async function openPicker() {
  if (isOpen.value) return
  const focusDate = selectedDate.value ?? today
  visibleMonth.value = startOfMonth(focusDate)
  focusedDateIso.value = dateToIso(focusDate)
  isOpen.value = true
  await nextTick()
  focusDay(focusDate)
}

function closePicker({ restoreFocus = false } = {}) {
  if (!isOpen.value) return
  isOpen.value = false
  if (restoreFocus) nextTick(() => triggerRef.value?.focus())
}

function toggle() {
  if (isOpen.value) closePicker()
  else openPicker()
}

function changeMonth(amount: number) {
  visibleMonth.value = addMonths(visibleMonth.value, amount)
  const firstAllowedDay = calendarDays.value.find(day => day.currentMonth && !day.disabled)
  if (firstAllowedDay) focusedDateIso.value = firstAllowedDay.iso
}

function selectDate(date: Date) {
  if (!isDateAllowed(date)) return
  emit('update:modelValue', dateToIso(date))
  closePicker({ restoreFocus: true })
}

function clearDate() {
  emit('update:modelValue', '')
  closePicker({ restoreFocus: true })
}

function handleDayKeydown(event: KeyboardEvent, date: Date) {
  let nextDate: Date | null = null
  if (event.key === 'ArrowLeft') nextDate = addDays(date, -1)
  else if (event.key === 'ArrowRight') nextDate = addDays(date, 1)
  else if (event.key === 'ArrowUp') nextDate = addDays(date, -7)
  else if (event.key === 'ArrowDown') nextDate = addDays(date, 7)
  else if (event.key === 'Home') nextDate = addDays(date, -((date.getDay() + 6) % 7))
  else if (event.key === 'End') nextDate = addDays(date, 6 - ((date.getDay() + 6) % 7))
  else if (event.key === 'PageUp') nextDate = addMonths(date, -1)
  else if (event.key === 'PageDown') nextDate = addMonths(date, 1)

  if (!nextDate) return
  event.preventDefault()
  if (!isDateAllowed(nextDate)) return
  visibleMonth.value = startOfMonth(nextDate)
  focusedDateIso.value = dateToIso(nextDate)
  focusDay(nextDate)
}

function focusDay(date: Date) {
  nextTick(() => {
    wrapperRef.value
      ?.querySelector<HTMLButtonElement>(`[data-date="${dateToIso(date)}"]`)
      ?.focus()
  })
}

function handleOutsidePointer(event: PointerEvent) {
  if (!wrapperRef.value?.contains(event.target as Node)) closePicker()
}

watch(() => props.modelValue, (value) => {
  const date = parseIsoDate(value)
  if (date && !isOpen.value) visibleMonth.value = startOfMonth(date)
})

onMounted(() => document.addEventListener('pointerdown', handleOutsidePointer))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleOutsidePointer))
</script>

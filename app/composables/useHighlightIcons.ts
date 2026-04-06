/**
 * Curated icon set for admin icon pickers.
 * Uses Iconify names (heroicons-outline set) compatible with @nuxt/icon.
 *
 * Usage:
 *   <Icon :name="icon" />  — in templates (renders via @nuxt/icon)
 *   ICON_SET              — for the picker grid
 *   DEFAULT_ICON          — fallback when no icon is set
 */

export interface IconOption {
  name: string  // Iconify icon name, e.g. 'heroicons:check-circle'
  label: string // Human-readable label for tooltip
}

export const ICON_SET: IconOption[] = [
  { name: 'heroicons:check-circle', label: 'Checkmark' },
  { name: 'heroicons:star', label: 'Star' },
  { name: 'heroicons:heart', label: 'Heart' },
  { name: 'heroicons:shield-check', label: 'Shield' },
  { name: 'heroicons:truck', label: 'Truck' },
  { name: 'heroicons:clock', label: 'Clock' },
  { name: 'heroicons:globe-alt', label: 'Globe' },
  { name: 'heroicons:bolt', label: 'Lightning' },
  { name: 'heroicons:gift', label: 'Gift' },
  { name: 'heroicons:cube', label: 'Package' },
  { name: 'heroicons:tag', label: 'Tag' },
  { name: 'heroicons:users', label: 'Users' },
  { name: 'heroicons:sparkles', label: 'Sparkles' },
  { name: 'heroicons:hand-thumb-up', label: 'Thumbs Up' },
  { name: 'heroicons:lock-closed', label: 'Lock' },
  { name: 'heroicons:chat-bubble-left', label: 'Chat' },
  { name: 'heroicons:arrow-path', label: 'Refresh' },
  { name: 'heroicons:sun', label: 'Sun' },
  { name: 'heroicons:credit-card', label: 'Credit Card' },
  { name: 'heroicons:eye', label: 'Eye' },
  { name: 'heroicons:face-smile', label: 'Smile' },
  { name: 'heroicons:currency-dollar', label: 'Dollar' },
  { name: 'heroicons:inbox', label: 'Inbox' },
  { name: 'heroicons:map-pin', label: 'Location' },
  { name: 'heroicons:cog-6-tooth', label: 'Settings' },
  { name: 'heroicons:fire', label: 'Fire' },
  { name: 'heroicons:rocket-launch', label: 'Rocket' },
  { name: 'heroicons:trophy', label: 'Trophy' },
  { name: 'heroicons:light-bulb', label: 'Idea' },
  { name: 'heroicons:shopping-cart', label: 'Cart' },
  { name: 'heroicons:academic-cap', label: 'Education' },
  { name: 'heroicons:chart-bar', label: 'Chart' },
  { name: 'heroicons:megaphone', label: 'Megaphone' },
  { name: 'heroicons:puzzle-piece', label: 'Puzzle' },
  { name: 'heroicons:wrench-screwdriver', label: 'Tools' },
  { name: 'heroicons:phone', label: 'Phone' },
  { name: 'heroicons:magnifying-glass', label: 'Search' },
]

export const DEFAULT_ICON = 'heroicons:check-circle'

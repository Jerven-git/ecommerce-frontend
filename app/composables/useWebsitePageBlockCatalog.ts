import { computed, ref } from 'vue'
import { useWebsitePages } from '~/composables/useWebsitePages'
import type { WebsiteBlockType } from '~/themes/contracts'
import type {
  WebsitePageBlock,
  WebsitePageBlockDefinition,
  WebsitePageBlockFieldDefinition,
} from '~/types/websitePage'

function randomId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function useWebsitePageBlockCatalog() {
  const pagesApi = useWebsitePages()
  const definitions = ref<WebsitePageBlockDefinition[]>([])
  const schemaVersion = ref(1)
  const byType = computed(() => new Map(definitions.value.map(definition => [definition.type, definition])))

  async function load() {
    const response = await pagesApi.definitions()
    definitions.value = response.data
    schemaVersion.value = response.schema_version
  }

  function definition(type: WebsiteBlockType) {
    const match = byType.value.get(type)
    if (!match) throw new Error(`Unsupported website page section: ${type}`)
    return match
  }

  function createBlock(type: WebsiteBlockType): WebsitePageBlock {
    const contract = definition(type)

    return {
      id: randomId(),
      type,
      schema_version: schemaVersion.value,
      visible: true,
      variant: contract.default_variant,
      content: clone(contract.defaults.content),
      settings: clone(contract.defaults.settings),
    }
  }

  function label(type: WebsiteBlockType) {
    return definition(type).label
  }

  function icon(type: WebsiteBlockType) {
    return definition(type).icon
  }

  function variants(type: WebsiteBlockType) {
    return definition(type).variants
  }

  function fields(block: WebsitePageBlock): WebsitePageBlockFieldDefinition[] {
    return definition(block.type).editor.fields
  }

  function hasMedia(block: WebsitePageBlock) {
    return definition(block.type).editor.media !== null
  }

  function hasAction(block: WebsitePageBlock) {
    return actions(block).length > 0
  }

  function actions(block: WebsitePageBlock) {
    const editor = definition(block.type).editor
    return editor.actions?.length ? editor.actions : editor.action ? [editor.action] : []
  }

  function settings(block: WebsitePageBlock) {
    return definition(block.type).editor.settings ?? []
  }

  function isConnected(block: WebsitePageBlock) {
    return definition(block.type).content_mode === 'connected'
  }

  function dynamicSources(block: WebsitePageBlock) {
    return definition(block.type).editor.dynamic?.sources ?? []
  }

  function repeater(block: WebsitePageBlock) {
    return definition(block.type).editor.repeater
  }

  function addRepeaterItem(block: WebsitePageBlock) {
    const contract = repeater(block)
    if (!contract) return
    block.content.items ??= []
    if (block.content.items.length >= contract.max_items) return
    block.content.items.push(clone(contract.default_item))
  }

  function canAddRepeaterItem(block: WebsitePageBlock) {
    const contract = repeater(block)
    return Boolean(contract && (block.content.items?.length ?? 0) < contract.max_items)
  }

  function moveRepeaterItem(block: WebsitePageBlock, index: number, direction: -1 | 1) {
    const items = block.content.items
    if (!Array.isArray(items)) return
    const target = index + direction
    if (index < 0 || target < 0 || index >= items.length || target >= items.length) return
    const [item] = items.splice(index, 1)
    if (item) items.splice(target, 0, item)
  }

  function removeRepeaterItem(block: WebsitePageBlock, index: number) {
    if (!Array.isArray(block.content.items) || index < 0 || index >= block.content.items.length) return
    block.content.items.splice(index, 1)
  }

  return {
    definitions,
    load,
    definition,
    createBlock,
    label,
    icon,
    variants,
    fields,
    settings,
    hasMedia,
    hasAction,
    actions,
    isConnected,
    dynamicSources,
    repeater,
    addRepeaterItem,
    canAddRepeaterItem,
    moveRepeaterItem,
    removeRepeaterItem,
  }
}

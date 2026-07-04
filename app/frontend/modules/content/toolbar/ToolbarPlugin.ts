/**
 * 工具栏插件
 *
 * 设计原则：
 * - 工具栏项可配置
 * - 支持分组
 * - 支持自定义项
 */
import type { ToolbarItemId, ToolbarGroup } from '@/types'
import { toolbarRegistry } from './ToolbarRegistry'

/** 默认工具栏分组 */
export const DEFAULT_TOOLBAR_GROUPS: ToolbarGroup[] = [
  { id: 'history', items: ['undo', 'redo'] },
  { id: 'format', items: ['bold', 'italic', 'underline', 'strikethrough', 'code'] },
  { id: 'block', items: ['heading', 'quote'] },
  { id: 'list', items: ['bullet-list', 'numbered-list'] },
  { id: 'insert', items: ['link', 'image', 'table'] },
  { id: 'align', items: ['align-left', 'align-center', 'align-right'] },
]

/** 获取工具栏项元数据（从注册表） */
export function getToolbarItemMeta(id: ToolbarItemId): { label: string; shortcut?: string; group: string } | undefined {
  const item = toolbarRegistry.getItem(id)
  if (!item) return undefined
  return {
    label: item.label,
    shortcut: item.shortcut,
    group: item.group,
  }
}

/** 解析工具栏配置为分组 */
export function parseToolbarConfig(config: ToolbarGroup[] | ToolbarItemId[]): ToolbarGroup[] {
  if (config.length === 0) return DEFAULT_TOOLBAR_GROUPS

  // 如果是字符串数组，按默认分组整理
  if (typeof config[0] === 'string') {
    const items = config as ToolbarItemId[]
    const groupMap = new Map<string, ToolbarItemId[]>()

    for (const item of items) {
      const meta = getToolbarItemMeta(item)
      if (!meta) continue
      const group = groupMap.get(meta.group) || []
      group.push(item)
      groupMap.set(meta.group, group)
    }

    return Array.from(groupMap.entries()).map(([id, groupItems]) => ({
      id,
      items: groupItems,
    }))
  }

  return config as ToolbarGroup[]
}

/**
 * 工具栏插件
 *
 * 设计原则：
 * - 工具栏项可配置
 * - 支持分组
 * - 支持自定义项
 */
import type { ToolbarItem, ToolbarItemId, ToolbarGroup } from '../../types'

/** 默认工具栏分组 */
export const DEFAULT_TOOLBAR_GROUPS: ToolbarGroup[] = [
  { id: 'history', items: ['undo', 'redo'] },
  { id: 'format', items: ['bold', 'italic', 'underline', 'strikethrough', 'code'] },
  { id: 'block', items: ['heading', 'quote'] },
  { id: 'list', items: ['bullet-list', 'numbered-list'] },
  { id: 'insert', items: ['link', 'image', 'table'] },
  { id: 'align', items: ['align-left', 'align-center', 'align-right'] },
]

/** 工具栏项元数据 */
export const TOOLBAR_ITEM_META: Record<ToolbarItemId, { label: string; shortcut?: string; group: string }> = {
  undo: { label: '撤销', shortcut: 'Ctrl+Z', group: 'history' },
  redo: { label: '重做', shortcut: 'Ctrl+Y', group: 'history' },
  bold: { label: '加粗', shortcut: 'Ctrl+B', group: 'format' },
  italic: { label: '斜体', shortcut: 'Ctrl+I', group: 'format' },
  underline: { label: '下划线', shortcut: 'Ctrl+U', group: 'format' },
  strikethrough: { label: '删除线', shortcut: 'Ctrl+Shift+S', group: 'format' },
  code: { label: '行内代码', shortcut: 'Ctrl+E', group: 'format' },
  heading: { label: '标题', group: 'block' },
  quote: { label: '引用', group: 'block' },
  'bullet-list': { label: '无序列表', group: 'list' },
  'numbered-list': { label: '有序列表', group: 'list' },
  link: { label: '链接', shortcut: 'Ctrl+K', group: 'insert' },
  image: { label: '图片', group: 'insert' },
  table: { label: '表格', group: 'insert' },
  divider: { label: '分割线', group: 'insert' },
  'align-left': { label: '左对齐', group: 'align' },
  'align-center': { label: '居中', group: 'align' },
  'align-right': { label: '右对齐', group: 'align' },
}

/** 解析工具栏配置为分组 */
export function parseToolbarConfig(config: ToolbarGroup[] | ToolbarItemId[]): ToolbarGroup[] {
  if (config.length === 0) return DEFAULT_TOOLBAR_GROUPS

  // 如果是字符串数组，按默认分组整理
  if (typeof config[0] === 'string') {
    const items = config as ToolbarItemId[]
    const groupMap = new Map<string, ToolbarItemId[]>()

    for (const item of items) {
      const meta = TOOLBAR_ITEM_META[item]
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

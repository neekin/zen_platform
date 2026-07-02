/**
 * 插件工厂
 *
 * 提供创建插件的工具函数
 */
import type { Plugin, PluginContext, ToolbarItem, PluginCommand, KeyboardShortcut } from '../../types'

/** 插件定义 */
export interface PluginDefinition {
  id: string
  name: string
  version?: string
  toolbarItems?: ToolbarItem[]
  commands?: PluginCommand[]
  shortcuts?: KeyboardShortcut[]
  init?: (context: PluginContext) => void
  destroy?: () => void
}

/** 创建插件 */
export function createPlugin(definition: PluginDefinition): Plugin {
  return {
    id: definition.id,
    name: definition.name,
    version: definition.version,
    getToolbarItems: () => definition.toolbarItems || [],
    getCommands: () => definition.commands || [],
    getShortcuts: () => definition.shortcuts || [],
    init: definition.init,
    destroy: definition.destroy,
    getNodes: () => [],
    renderUI: () => null,
  }
}

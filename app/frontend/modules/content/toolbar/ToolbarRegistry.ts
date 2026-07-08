/**
 * 工具栏注册表
 *
 * 插件自注册工具栏项，无需修改核心文件
 */
import type { ToolbarItemId } from '../types'

/** 工具栏项定义 */
export interface ToolbarItemDefinition {
  id: ToolbarItemId
  label: string
  icon: React.ReactNode
  shortcut?: string
  group: string
  execute: (editor: any) => void
  isActive?: (editor: any) => boolean
}

/** 工具栏注册表 */
class ToolbarRegistry {
  private items = new Map<ToolbarItemId, ToolbarItemDefinition>()

  /** 注册工具栏项 */
  register(item: ToolbarItemDefinition): void {
    this.items.set(item.id, item)
  }

  /** 获取工具栏项 */
  getItem(id: ToolbarItemId): ToolbarItemDefinition | undefined {
    return this.items.get(id)
  }

  /** 获取所有注册的工具栏项 */
  getAllItems(): ToolbarItemDefinition[] {
    return Array.from(this.items.values())
  }

  /** 检查是否已注册 */
  has(id: ToolbarItemId): boolean {
    return this.items.has(id)
  }
}

/** 全局工具栏注册表实例 */
export const toolbarRegistry = new ToolbarRegistry()

/**
 * Link 插件
 *
 * 链接插入/编辑
 * 快捷键: Ctrl+K
 */
import { createPlugin } from '../factory'
import type { PluginContext } from '../../../types'

export const linkPlugin = createPlugin({
  id: 'link',
  name: '链接',
  version: '1.0.0',
  toolbarItems: [
    {
      id: 'link',
      label: '链接',
      shortcut: 'Ctrl+K',
      group: 'insert',
      execute: () => {},
    },
  ],
  commands: [
    {
      id: 'link:insert',
      label: '插入链接',
      execute: (context: PluginContext, payload?: { url: string; text?: string }) => {
        // TODO: 实现链接插入逻辑
        console.log('Insert link:', payload)
      },
    },
    {
      id: 'link:remove',
      label: '移除链接',
      execute: (context: PluginContext) => {
        // TODO: 实现链接移除逻辑
        console.log('Remove link')
      },
    },
  ],
  shortcuts: [
    { key: 'k', modifiers: ['ctrl'], command: 'link:insert' },
    { key: 'k', modifiers: ['meta'], command: 'link:insert' },
  ],
})

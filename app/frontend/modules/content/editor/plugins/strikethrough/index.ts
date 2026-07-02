/**
 * Strikethrough 插件
 *
 * 快捷键: Ctrl+Shift+S
 */
import { FORMAT_TEXT_COMMAND } from 'lexical'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../../types'

export const strikethroughPlugin = createPlugin({
  id: 'strikethrough',
  name: '删除线',
  version: '1.0.0',
  toolbarItems: [
    {
      id: 'strikethrough',
      label: '删除线',
      shortcut: 'Ctrl+Shift+S',
      group: 'format',
      execute: () => {},
    },
  ],
  commands: [
    {
      id: 'strikethrough',
      label: '删除线',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
      },
    },
  ],
  shortcuts: [
    { key: 's', modifiers: ['ctrl', 'shift'], command: 'strikethrough' },
  ],
})

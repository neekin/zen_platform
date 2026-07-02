/**
 * Bold 插件
 *
 * 快捷键: Ctrl+B
 */
import { FORMAT_TEXT_COMMAND } from 'lexical'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../../types'

export const boldPlugin = createPlugin({
  id: 'bold',
  name: '加粗',
  version: '1.0.0',
  toolbarItems: [
    {
      id: 'bold',
      label: '加粗',
      shortcut: 'Ctrl+B',
      group: 'format',
      execute: () => {},
    },
  ],
  commands: [
    {
      id: 'bold',
      label: '加粗',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
      },
    },
  ],
  shortcuts: [
    { key: 'b', modifiers: ['ctrl'], command: 'bold' },
    { key: 'b', modifiers: ['meta'], command: 'bold' },
  ],
})

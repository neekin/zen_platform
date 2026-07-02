/**
 * Code 插件
 *
 * 行内代码
 * 快捷键: Ctrl+E
 */
import { FORMAT_TEXT_COMMAND } from 'lexical'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../../types'

export const codePlugin = createPlugin({
  id: 'code',
  name: '行内代码',
  version: '1.0.0',
  toolbarItems: [
    {
      id: 'code',
      label: '行内代码',
      shortcut: 'Ctrl+E',
      group: 'format',
      execute: () => {},
    },
  ],
  commands: [
    {
      id: 'code',
      label: '行内代码',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
      },
    },
  ],
  shortcuts: [
    { key: 'e', modifiers: ['ctrl'], command: 'code' },
    { key: 'e', modifiers: ['meta'], command: 'code' },
  ],
})

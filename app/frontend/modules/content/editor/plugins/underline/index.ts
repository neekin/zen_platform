/**
 * Underline 插件
 *
 * 快捷键: Ctrl+U
 */
import { FORMAT_TEXT_COMMAND } from 'lexical'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../../types'

export const underlinePlugin = createPlugin({
  id: 'underline',
  name: '下划线',
  version: '1.0.0',
  toolbarItems: [
    {
      id: 'underline',
      label: '下划线',
      shortcut: 'Ctrl+U',
      group: 'format',
      execute: () => {},
    },
  ],
  commands: [
    {
      id: 'underline',
      label: '下划线',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
      },
    },
  ],
  shortcuts: [
    { key: 'u', modifiers: ['ctrl'], command: 'underline' },
    { key: 'u', modifiers: ['meta'], command: 'underline' },
  ],
})

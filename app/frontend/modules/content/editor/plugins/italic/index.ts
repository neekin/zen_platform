/**
 * Italic 插件
 *
 * 快捷键: Ctrl+I
 */
import { FORMAT_TEXT_COMMAND } from 'lexical'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../../types'

export const italicPlugin = createPlugin({
  id: 'italic',
  name: '斜体',
  version: '1.0.0',
  toolbarItems: [
    {
      id: 'italic',
      label: '斜体',
      shortcut: 'Ctrl+I',
      group: 'format',
      execute: () => {},
    },
  ],
  commands: [
    {
      id: 'italic',
      label: '斜体',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
      },
    },
  ],
  shortcuts: [
    { key: 'i', modifiers: ['ctrl'], command: 'italic' },
    { key: 'i', modifiers: ['meta'], command: 'italic' },
  ],
})

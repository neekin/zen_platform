/**
 * History 插件
 *
 * 撤销/重做
 * 快捷键: Ctrl+Z / Ctrl+Y
 */
import { UNDO_COMMAND, REDO_COMMAND } from 'lexical'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../../types'

export const historyPlugin = createPlugin({
  id: 'history',
  name: '历史',
  version: '1.0.0',
  toolbarItems: [
    {
      id: 'undo',
      label: '撤销',
      shortcut: 'Ctrl+Z',
      group: 'history',
      execute: () => {},
    },
    {
      id: 'redo',
      label: '重做',
      shortcut: 'Ctrl+Y',
      group: 'history',
      execute: () => {},
    },
  ],
  commands: [
    {
      id: 'undo',
      label: '撤销',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(UNDO_COMMAND, undefined)
      },
    },
    {
      id: 'redo',
      label: '重做',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(REDO_COMMAND, undefined)
      },
    },
  ],
  shortcuts: [
    { key: 'z', modifiers: ['ctrl'], command: 'undo' },
    { key: 'z', modifiers: ['meta'], command: 'undo' },
    { key: 'y', modifiers: ['ctrl'], command: 'redo' },
    { key: 'y', modifiers: ['meta'], command: 'redo' },
  ],
})

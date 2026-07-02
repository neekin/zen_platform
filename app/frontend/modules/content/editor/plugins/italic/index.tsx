/**
 * Italic 插件
 *
 * 快捷键: Ctrl+I
 */
import { FORMAT_TEXT_COMMAND } from 'lexical'
import { ItalicOutlined } from '@ant-design/icons'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../../types'
import { toolbarRegistry } from '../../../toolbar/ToolbarRegistry'

// 自注册工具栏项
toolbarRegistry.register({
  id: 'italic',
  label: '斜体',
  icon: <ItalicOutlined />,
  shortcut: 'Ctrl+I',
  group: 'format',
  execute: (editor) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic'),
})

export const italicPlugin = createPlugin({
  id: 'italic',
  name: '斜体',
  version: '1.0.0',
  toolbarItems: [
    { id: 'italic', label: '斜体', shortcut: 'Ctrl+I', group: 'format', execute: () => {} },
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

/**
 * Strikethrough 插件
 *
 * 快捷键: Ctrl+Shift+S
 */
import { FORMAT_TEXT_COMMAND } from 'lexical'
import { StrikethroughOutlined } from '@ant-design/icons'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../../types'
import { toolbarRegistry } from '../../../toolbar/ToolbarRegistry'

// 自注册工具栏项
toolbarRegistry.register({
  id: 'strikethrough',
  label: '删除线',
  icon: <StrikethroughOutlined />,
  shortcut: 'Ctrl+Shift+S',
  group: 'format',
  execute: (editor) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough'),
})

export const strikethroughPlugin = createPlugin({
  id: 'strikethrough',
  name: '删除线',
  version: '1.0.0',
  toolbarItems: [
    { id: 'strikethrough', label: '删除线', shortcut: 'Ctrl+Shift+S', group: 'format', execute: () => {} },
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

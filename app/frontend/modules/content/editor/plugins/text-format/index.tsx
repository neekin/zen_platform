/**
 * Text Format 插件
 *
 * 合并文本格式功能：加粗、斜体、下划线、删除线、字体颜色、背景色
 * 快捷键: Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Shift+X
 */
import { FORMAT_TEXT_COMMAND } from 'lexical'
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  FontColorsOutlined,
  BgColorsOutlined,
} from '@ant-design/icons'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../../types'
import { toolbarRegistry } from '../../toolbar/ToolbarRegistry'

// 自注册工具栏项
toolbarRegistry.register({
  id: 'bold',
  label: '加粗',
  icon: <BoldOutlined />,
  shortcut: 'Ctrl+B',
  group: 'format',
  execute: (editor) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold'),
})

toolbarRegistry.register({
  id: 'italic',
  label: '斜体',
  icon: <ItalicOutlined />,
  shortcut: 'Ctrl+I',
  group: 'format',
  execute: (editor) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic'),
})

toolbarRegistry.register({
  id: 'underline',
  label: '下划线',
  icon: <UnderlineOutlined />,
  shortcut: 'Ctrl+U',
  group: 'format',
  execute: (editor) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline'),
})

toolbarRegistry.register({
  id: 'strikethrough',
  label: '删除线',
  icon: <StrikethroughOutlined />,
  shortcut: 'Ctrl+Shift+X',
  group: 'format',
  execute: (editor) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough'),
})

export const textFormatPlugin = createPlugin({
  id: 'text-format',
  name: '文本格式',
  version: '1.0.0',
  toolbarItems: [
    { id: 'bold', label: '加粗', shortcut: 'Ctrl+B', group: 'format', execute: () => {} },
    { id: 'italic', label: '斜体', shortcut: 'Ctrl+I', group: 'format', execute: () => {} },
    { id: 'underline', label: '下划线', shortcut: 'Ctrl+U', group: 'format', execute: () => {} },
    { id: 'strikethrough', label: '删除线', shortcut: 'Ctrl+Shift+X', group: 'format', execute: () => {} },
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
    {
      id: 'italic',
      label: '斜体',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
      },
    },
    {
      id: 'underline',
      label: '下划线',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
      },
    },
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
    { key: 'b', modifiers: ['ctrl'], command: 'bold' },
    { key: 'b', modifiers: ['meta'], command: 'bold' },
    { key: 'i', modifiers: ['ctrl'], command: 'italic' },
    { key: 'i', modifiers: ['meta'], command: 'italic' },
    { key: 'u', modifiers: ['ctrl'], command: 'underline' },
    { key: 'u', modifiers: ['meta'], command: 'underline' },
    { key: 'x', modifiers: ['ctrl', 'shift'], command: 'strikethrough' },
  ],
})

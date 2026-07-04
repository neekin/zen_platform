/**
 * Text Format 插件
 *
 * 合并文本格式功能：加粗、斜体、下划线、删除线、字体颜色、背景色、字体大小
 * 快捷键: Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Shift+X
 */
import { FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection } from 'lexical'
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
} from '@ant-design/icons'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../types'
import { toolbarRegistry } from '../../toolbar/ToolbarRegistry'
import { $isExtendedTextNode, $createExtendedTextNode } from '../../nodes/ExtendedTextNode'

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

// 辅助函数：设置选中文本的颜色
function setSelectionColor(color: string, type: 'color' | 'backgroundColor') {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return

  const nodes = selection.getNodes()
  nodes.forEach((node) => {
    if ($isExtendedTextNode(node)) {
      if (type === 'color') {
        node.setColor(color)
      } else {
        node.setBackgroundColor(color)
      }
    } else if (node.getType() === 'text') {
      // 普通 TextNode 转换为 ExtendedTextNode
      const textNode = node as any
      const extendedNode = $createExtendedTextNode(textNode.getTextContent())
      extendedNode.setFormat(textNode.getFormat())
      if (type === 'color') {
        extendedNode.setColor(color)
      } else {
        extendedNode.setBackgroundColor(color)
      }
      textNode.replace(extendedNode)
    }
  })
}

// 辅助函数：设置选中文本的字号
function setSelectionFontSize(size: string) {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return

  const nodes = selection.getNodes()
  nodes.forEach((node) => {
    if ($isExtendedTextNode(node)) {
      node.setFontSize(size)
    } else if (node.getType() === 'text') {
      const textNode = node as any
      const extendedNode = $createExtendedTextNode(textNode.getTextContent())
      extendedNode.setFormat(textNode.getFormat())
      extendedNode.setFontSize(size)
      textNode.replace(extendedNode)
    }
  })
}

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
    {
      id: 'fontColor',
      label: '字体颜色',
      execute: (context: PluginContext) => {
        const color = (context.getData()?.color as string) || '#000000'
        const editor = context.getEditor() as any
        editor.update(() => setSelectionColor(color, 'color'))
      },
    },
    {
      id: 'bgColor',
      label: '背景色',
      execute: (context: PluginContext) => {
        const color = (context.getData()?.color as string) || '#ffff00'
        const editor = context.getEditor() as any
        editor.update(() => setSelectionColor(color, 'backgroundColor'))
      },
    },
    {
      id: 'fontSize',
      label: '字体大小',
      execute: (context: PluginContext) => {
        const size = (context.getData()?.size as string) || '16px'
        const editor = context.getEditor() as any
        editor.update(() => setSelectionFontSize(size))
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

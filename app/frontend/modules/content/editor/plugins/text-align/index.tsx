/**
 * Text Align 插件
 *
 * 文本对齐：居左、居中、居右、平铺
 */
import {
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $isElementNode,
} from 'lexical'
import {
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  MenuOutlined,
} from '@ant-design/icons'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../types'
import { toolbarRegistry } from '../../toolbar/ToolbarRegistry'

// 自注册工具栏项
toolbarRegistry.register({
  id: 'align-left',
  label: '居左',
  icon: <AlignLeftOutlined />,
  group: 'align',
  execute: (editor) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left'),
})

toolbarRegistry.register({
  id: 'align-center',
  label: '居中',
  icon: <AlignCenterOutlined />,
  group: 'align',
  execute: (editor) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center'),
})

toolbarRegistry.register({
  id: 'align-right',
  label: '居右',
  icon: <AlignRightOutlined />,
  group: 'align',
  execute: (editor) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right'),
})

toolbarRegistry.register({
  id: 'align-justify',
  label: '平铺',
  icon: <MenuOutlined />,
  group: 'align',
  execute: (editor) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify'),
})

export const textAlignPlugin = createPlugin({
  id: 'text-align',
  name: '文本对齐',
  version: '1.0.0',
  toolbarItems: [
    { id: 'align-left', label: '居左', group: 'align', execute: () => {} },
    { id: 'align-center', label: '居中', group: 'align', execute: () => {} },
    { id: 'align-right', label: '居右', group: 'align', execute: () => {} },
    { id: 'align-justify', label: '平铺', group: 'align', execute: () => {} },
  ],
  commands: [
    {
      id: 'align-left',
      label: '居左',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')
      },
    },
    {
      id: 'align-center',
      label: '居中',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')
      },
    },
    {
      id: 'align-right',
      label: '居右',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')
      },
    },
    {
      id: 'align-justify',
      label: '平铺',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')
      },
    },
  ],
  shortcuts: [],
})

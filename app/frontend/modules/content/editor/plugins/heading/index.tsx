/**
 * Heading 插件
 *
 * 支持 H1, H2, H3
 */
import { $getSelection, $isRangeSelection } from 'lexical'
import { $createHeadingNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../../types'
import { toolbarRegistry } from '../../../toolbar/ToolbarRegistry'

// 自注册工具栏项
toolbarRegistry.register({
  id: 'heading',
  label: '标题',
  icon: <span style={{ fontWeight: 'bold' }}>H</span>,
  group: 'block',
  execute: (editor) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode('h2'))
      }
    })
  },
})

export const headingPlugin = createPlugin({
  id: 'heading',
  name: '标题',
  version: '1.0.0',
  toolbarItems: [
    { id: 'heading', label: '标题', group: 'block', execute: () => {} },
  ],
  commands: [
    {
      id: 'heading:h1',
      label: '标题 1',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h1'))
          }
        })
      },
    },
    {
      id: 'heading:h2',
      label: '标题 2',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h2'))
          }
        })
      },
    },
    {
      id: 'heading:h3',
      label: '标题 3',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h3'))
          }
        })
      },
    },
    {
      id: 'paragraph',
      label: '正文',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => ({ type: 'paragraph', version: 1 }))
          }
        })
      },
    },
  ],
})

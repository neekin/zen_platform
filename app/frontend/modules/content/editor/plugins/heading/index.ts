/**
 * Heading 插件
 *
 * 支持 H1, H2, H3
 */
import { $getSelection, $isRangeSelection } from 'lexical'
import { $createHeadingNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { createPlugin } from '../factory'
import type { PluginContext, ToolbarItem } from '../../../types'

type HeadingTag = 'h1' | 'h2' | 'h3'

function createHeadingToolbarItem(tag: HeadingTag): ToolbarItem {
  return {
    id: 'heading',
    label: tag.toUpperCase(),
    group: 'block',
    execute: () => {},
  }
}

export const headingPlugin = createPlugin({
  id: 'heading',
  name: '标题',
  version: '1.0.0',
  toolbarItems: [createHeadingToolbarItem('h1')],
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

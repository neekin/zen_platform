/**
 * Quote 插件
 *
 * 块引用
 */
import { $getSelection, $isRangeSelection } from 'lexical'
import { $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { createPlugin } from '../factory'
import type { PluginContext } from '@/../types'
import { toolbarRegistry } from '@/../toolbar/ToolbarRegistry'

// 自注册工具栏项
toolbarRegistry.register({
  id: 'quote',
  label: '引用',
  icon: <span style={{ fontWeight: 'bold' }}>"</span>,
  group: 'block',
  execute: (editor) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  },
})

export const quotePlugin = createPlugin({
  id: 'quote',
  name: '引用',
  version: '1.0.0',
  toolbarItems: [
    { id: 'quote', label: '引用', group: 'block', execute: () => {} },
  ],
  commands: [
    {
      id: 'quote',
      label: '引用',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode())
          }
        })
      },
    },
  ],
})

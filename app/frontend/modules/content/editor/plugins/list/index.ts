/**
 * List 插件
 *
 * 无序列表 / 有序列表
 */
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../../types'

export const listPlugin = createPlugin({
  id: 'list',
  name: '列表',
  version: '1.0.0',
  toolbarItems: [
    {
      id: 'bullet-list',
      label: '无序列表',
      group: 'list',
      execute: () => {},
    },
    {
      id: 'numbered-list',
      label: '有序列表',
      group: 'list',
      execute: () => {},
    },
  ],
  commands: [
    {
      id: 'bullet-list',
      label: '无序列表',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
      },
    },
    {
      id: 'numbered-list',
      label: '有序列表',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
      },
    },
    {
      id: 'remove-list',
      label: '移除列表',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
      },
    },
  ],
})

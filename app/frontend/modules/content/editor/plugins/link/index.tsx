/**
 * Link 插件
 *
 * 链接插入/编辑
 * 快捷键: Ctrl+K
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { TOGGLE_LINK_COMMAND } from '@lexical/link'
import { LinkOutlined } from '@ant-design/icons'
import { useState, useCallback, useEffect } from 'react'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../../types'
import { toolbarRegistry } from '../../../toolbar/ToolbarRegistry'
import { LinkDialog } from './LinkDialog'

/** Link 插件配置 */
export interface LinkPluginConfig {
  /** 自定义 URL 验证 */
  validateUrl?: (url: string) => boolean
}

// 自注册工具栏项
// 注意：实际的对话框逻辑在 LinkPluginComponent 中处理
let showLinkDialogFn: (() => void) | null = null

toolbarRegistry.register({
  id: 'link',
  label: '链接',
  icon: <LinkOutlined />,
  shortcut: 'Ctrl+K',
  group: 'insert',
  execute: () => {
    if (showLinkDialogFn) {
      showLinkDialogFn()
    }
  },
})

/** Link Plugin React 组件 */
export function LinkPluginComponent({ config }: { config?: LinkPluginConfig }) {
  const [editor] = useLexicalComposerContext()
  const [dialogOpen, setDialogOpen] = useState(false)

  // 注册显示对话框的函数
  useEffect(() => {
    showLinkDialogFn = () => setDialogOpen(true)
    return () => {
      showLinkDialogFn = null
    }
  }, [])

  // 处理确认
  const handleConfirm = useCallback(
    (url: string, text?: string) => {
      // 验证 URL
      if (config?.validateUrl && !config.validateUrl(url)) {
        console.error('Invalid URL:', url)
        return
      }

      // 添加协议前缀
      const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`

      editor.dispatchCommand(TOGGLE_LINK_COMMAND, fullUrl)
      setDialogOpen(false)
    },
    [editor, config],
  )

  // 注册快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setDialogOpen(true)
      }
    }

    const rootElement = editor.getRootElement()
    if (rootElement) {
      rootElement.addEventListener('keydown', handleKeyDown)
      return () => rootElement.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor])

  return (
    <LinkDialog
      open={dialogOpen}
      onConfirm={handleConfirm}
      onCancel={() => setDialogOpen(false)}
    />
  )
}

export const linkPlugin = createPlugin({
  id: 'link',
  name: '链接',
  version: '1.0.0',
  toolbarItems: [
    { id: 'link', label: '链接', shortcut: 'Ctrl+K', group: 'insert', execute: () => {} },
  ],
  commands: [
    {
      id: 'link:insert',
      label: '插入链接',
      execute: (context: PluginContext, payload?: { url: string; text?: string }) => {
        const editor = context.getEditor() as any
        if (payload?.url) {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, payload.url)
        }
      },
    },
    {
      id: 'link:remove',
      label: '移除链接',
      execute: (context: PluginContext) => {
        const editor = context.getEditor() as any
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
      },
    },
  ],
  shortcuts: [
    { key: 'k', modifiers: ['ctrl'], command: 'link:insert' },
    { key: 'k', modifiers: ['meta'], command: 'link:insert' },
  ],
})

/**
 * Slash Commands Plugin
 *
 * 功能：
 * - 输入 / 触发命令菜单
 * - 支持键盘导航
 * - 支持搜索过滤
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection, $createParagraphNode } from 'lexical'
import { $createHeadingNode } from '@lexical/rich-text'
import { $createQuoteNode } from '@lexical/rich-text'
import { $createCodeNode } from '@lexical/code'
import { $setBlocksType } from '@lexical/selection'
import { INSERT_TABLE_COMMAND } from '@lexical/table'
import {
  OrderedListOutlined,
  UnorderedListOutlined,
  CodeOutlined,
  PictureOutlined,
  TableOutlined,
  MinusOutlined,
} from '@ant-design/icons'
import { useState, useCallback, useEffect, useRef } from 'react'
import { createPlugin } from '../factory'
import type { PluginContext } from '@/../types'
import { toolbarRegistry } from '@/toolbar/ToolbarRegistry'
import { INSERT_IMAGE_COMMAND } from '../image'

/** 命令定义 */
interface SlashCommand {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  keywords: string[]
  action: (editor: any) => void
}

/** 创建默认命令列表 */
function createDefaultCommands(): SlashCommand[] {
  return [
    {
      id: 'heading1',
      label: '标题 1',
      description: '大标题',
      icon: <span style={{ fontWeight: 'bold' }}>H1</span>,
      keywords: ['h1', 'heading', '标题', '大标题'],
      action: (editor) => {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h1'))
          }
        })
      },
    },
    {
      id: 'heading2',
      label: '标题 2',
      description: '中标题',
      icon: <span style={{ fontWeight: 'bold' }}>H2</span>,
      keywords: ['h2', 'heading', '标题', '中标题'],
      action: (editor) => {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h2'))
          }
        })
      },
    },
    {
      id: 'heading3',
      label: '标题 3',
      description: '小标题',
      icon: <span style={{ fontWeight: 'bold' }}>H3</span>,
      keywords: ['h3', 'heading', '标题', '小标题'],
      action: (editor) => {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h3'))
          }
        })
      },
    },
    {
      id: 'bullet-list',
      label: '无序列表',
      description: '创建无序列表',
      icon: <UnorderedListOutlined />,
      keywords: ['ul', 'list', '列表', '无序'],
      action: (editor) => {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode())
          }
        })
      },
    },
    {
      id: 'numbered-list',
      label: '有序列表',
      description: '创建有序列表',
      icon: <OrderedListOutlined />,
      keywords: ['ol', 'list', '列表', '有序'],
      action: (editor) => {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode())
          }
        })
      },
    },
    {
      id: 'quote',
      label: '引用',
      description: '创建引用块',
      icon: <span style={{ fontWeight: 'bold' }}>"</span>,
      keywords: ['quote', 'blockquote', '引用'],
      action: (editor) => {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode())
          }
        })
      },
    },
    {
      id: 'code-block',
      label: '代码块',
      description: '插入代码块',
      icon: <CodeOutlined />,
      keywords: ['code', 'pre', '代码'],
      action: (editor) => {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createCodeNode('javascript'))
          }
        })
      },
    },
    {
      id: 'table',
      label: '表格',
      description: '插入表格',
      icon: <TableOutlined />,
      keywords: ['table', '表格'],
      action: (editor) => {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: 3, columns: 3 })
      },
    },
    {
      id: 'divider',
      label: '分割线',
      description: '插入水平分割线',
      icon: <MinusOutlined />,
      keywords: ['hr', 'divider', '分割线', '水平线'],
      action: (editor) => {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            selection.insertNodes([$createParagraphNode()])
          }
        })
      },
    },
  ]
}

/** Slash Commands 菜单组件 */
function SlashMenu({
  open,
  commands,
  selectedIndex,
  onSelect,
  onClose,
  position,
}: {
  open: boolean
  commands: SlashCommand[]
  selectedIndex: number
  onSelect: (command: SlashCommand) => void
  onClose: () => void
  position: { top: number; left: number }
}) {
  const menuRef = useRef<HTMLDivElement>(null)

  // 滚动到选中项
  useEffect(() => {
    if (menuRef.current && open) {
      const selectedElement = menuRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex, open])

  if (!open || commands.length === 0) return null

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 1000,
        width: 240,
        maxHeight: 320,
        background: 'var(--ant-color-bg-elevated)',
        border: '1px solid var(--ant-color-border)',
        borderRadius: 'var(--ant-border-radius)',
        boxShadow: 'var(--ant-box-shadow-secondary)',
        overflowY: 'auto',
        padding: 4,
      }}
    >
      {commands.map((command, index) => (
        <div
          key={command.id}
          onClick={() => onSelect(command)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            cursor: 'pointer',
            borderRadius: 'var(--ant-border-radius)',
            background: index === selectedIndex ? 'var(--ant-color-primary-bg)' : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (index !== selectedIndex) {
              e.currentTarget.style.background = 'var(--ant-color-bg-text-hover)'
            }
          }}
          onMouseLeave={(e) => {
            if (index !== selectedIndex) {
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--ant-border-radius)',
              background: 'var(--ant-color-fill-secondary)',
              fontSize: 14,
            }}
          >
            {command.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{command.label}</div>
            <div style={{ fontSize: 11, color: 'var(--ant-color-text-secondary)' }}>
              {command.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Slash Commands Plugin 配置 */
export interface SlashCommandsPluginConfig {
  /** 自定义命令列表 */
  commands?: SlashCommand[]
  /** 触发字符 */
  trigger?: string
}

/** Slash Commands Plugin React 组件 */
export function SlashCommandsPluginComponent({ config }: { config?: SlashCommandsPluginConfig }) {
  const [editor] = useLexicalComposerContext()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const commands = config?.commands || createDefaultCommands()
  const trigger = config?.trigger || '/'

  // 过滤命令
  const filteredCommands = commands.filter((cmd) => {
    const query = search.toLowerCase()
    return (
      cmd.label.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query) ||
      cmd.keywords.some((kw) => kw.toLowerCase().includes(query))
    )
  })

  // 处理选择命令
  const handleSelect = useCallback(
    (command: SlashCommand) => {
      command.action(editor)
      setOpen(false)
      setSearch('')
      setSelectedIndex(0)

      // 删除触发字符和搜索文本
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const anchor = selection.anchor
          const node = anchor.getNode()
          const text = node.getTextContent()
          const offset = anchor.offset
          const triggerIndex = text.lastIndexOf(trigger, offset)
          if (triggerIndex !== -1) {
            // 删除从触发字符到当前位置的文本
            const deleteCount = offset - triggerIndex
            for (let i = 0; i < deleteCount; i++) {
              selection.deleteCharacter(false)
            }
          }
        }
      })
    },
    [editor, trigger],
  )

  // 监听键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            handleSelect(filteredCommands[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          setOpen(false)
          setSearch('')
          setSelectedIndex(0)
          break
        case 'Backspace':
          if (search.length === 0) {
            setOpen(false)
          }
          break
      }
    }

    const rootElement = editor.getRootElement()
    if (rootElement) {
      rootElement.addEventListener('keydown', handleKeyDown)
      return () => rootElement.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor, open, filteredCommands, selectedIndex, search, handleSelect])

  // 监听输入以检测触发字符
  useEffect(() => {
    const removeListener = editor.registerTextContentListener((text) => {
      // 检查是否输入了触发字符
      if (text.endsWith(trigger)) {
        // 获取光标位置
        editor.getEditorState().read(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const anchor = selection.anchor
            const node = anchor.getNode()
            const domElement = editor.getElementByKey(node.getKey())
            if (domElement) {
              const rect = domElement.getBoundingClientRect()
              const editorRect = editor.getRootElement()!.getBoundingClientRect()
              setPosition({
                top: rect.bottom - editorRect.top + 4,
                left: rect.left - editorRect.left,
              })
            }
          }
        })
        setOpen(true)
        setSearch('')
        setSelectedIndex(0)
      } else if (open) {
        // 更新搜索文本
        const lastTriggerIndex = text.lastIndexOf(trigger)
        if (lastTriggerIndex !== -1) {
          setSearch(text.substring(lastTriggerIndex + 1))
          setSelectedIndex(0)
        } else {
          setOpen(false)
          setSearch('')
        }
      }
    })

    return removeListener
  }, [editor, trigger, open])

  return (
    <SlashMenu
      open={open}
      commands={filteredCommands}
      selectedIndex={selectedIndex}
      onSelect={handleSelect}
      onClose={() => {
        setOpen(false)
        setSearch('')
        setSelectedIndex(0)
      }}
      position={position}
    />
  )
}

export const slashCommandsPlugin = createPlugin({
  id: 'slash-commands',
  name: '斜杠命令',
  version: '1.0.0',
  toolbarItems: [],
  commands: [],
  shortcuts: [],
})

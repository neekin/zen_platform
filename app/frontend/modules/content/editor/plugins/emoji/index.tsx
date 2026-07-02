/**
 * Emoji Plugin
 *
 * 功能：
 * - 插入表情符号
 * - 分类浏览
 * - 搜索功能
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, $getSelection, $isRangeSelection, createCommand, COMMAND_PRIORITY_LOW } from 'lexical'
import { useState, useCallback, useEffect, useRef } from 'react'
import { SmileOutlined } from '@ant-design/icons'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../../types'
import { toolbarRegistry } from '../../../toolbar/ToolbarRegistry'

/** 表情分类 */
interface EmojiCategory {
  name: string
  icon: string
  emojis: string[]
}

/** 内置表情数据 */
const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: '常用',
    icon: '😀',
    emojis: ['😀', '😂', '🤣', '😊', '😍', '🥰', '😎', '🤔', '😅', '😢', '😭', '😤', '🥺', '😴', '🙄', '😬'],
  },
  {
    name: '手势',
    icon: '👋',
    emojis: ['👋', '👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '🤟', '🤘', '👌', '🤌', '👈', '👉', '👆', '👇'],
  },
  {
    name: '人物',
    icon: '👤',
    emojis: ['👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '🧓', '👵', '👴', '👱', '👲', '👳', '🧕', '🤵', '👸'],
  },
  {
    name: '动物',
    icon: '🐶',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'],
  },
  {
    name: '食物',
    icon: '🍎',
    emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅'],
  },
  {
    name: '活动',
    icon: '⚽',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🥍', '🏏'],
  },
  {
    name: '旅行',
    icon: '🚗',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍', '🚲'],
  },
  {
    name: '符号',
    icon: '❤️',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗'],
  },
]

/** 插入 Emoji 命令 */
export const INSERT_EMOJI_COMMAND = createCommand<{ emoji: string }>('INSERT_EMOJI_COMMAND')

/** Emoji 选择器组件 */
function EmojiPicker({
  open,
  onSelect,
  onClose,
  position,
}: {
  open: boolean
  onSelect: (emoji: string) => void
  onClose: () => void
  position: { top: number; left: number }
}) {
  const [activeCategory, setActiveCategory] = useState(0)
  const [search, setSearch] = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  if (!open) return null

  // 过滤表情
  const filteredEmojis = search
    ? EMOJI_CATEGORIES.flatMap((cat) => cat.emojis).filter((emoji) => {
        // 简单搜索 - 实际应该搜索表情名称
        return true
      })
    : EMOJI_CATEGORIES[activeCategory]?.emojis || []

  return (
    <div
      ref={pickerRef}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 1000,
        width: 320,
        background: 'var(--ant-color-bg-elevated)',
        border: '1px solid var(--ant-color-border)',
        borderRadius: 'var(--ant-border-radius-lg)',
        boxShadow: 'var(--ant-box-shadow-secondary)',
        overflow: 'hidden',
      }}
    >
      {/* 搜索框 */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--ant-color-border)' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索表情..."
          style={{
            width: '100%',
            padding: '6px 10px',
            border: '1px solid var(--ant-color-border)',
            borderRadius: 'var(--ant-border-radius)',
            fontSize: 13,
            outline: 'none',
          }}
          autoFocus
        />
      </div>

      {/* 分类标签 */}
      {!search && (
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--ant-color-border)',
            overflowX: 'auto',
          }}
        >
          {EMOJI_CATEGORIES.map((cat, index) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(index)}
              style={{
                flex: '0 0 auto',
                padding: '8px 12px',
                border: 'none',
                background: index === activeCategory ? 'var(--ant-color-primary-bg)' : 'transparent',
                cursor: 'pointer',
                fontSize: 16,
                borderBottom: index === activeCategory ? '2px solid var(--ant-color-primary)' : '2px solid transparent',
              }}
              title={cat.name}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* 表情网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: 4,
          padding: 8,
          maxHeight: 200,
          overflowY: 'auto',
        }}
      >
        {filteredEmojis.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            onClick={() => {
              onSelect(emoji)
              onClose()
            }}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 20,
              padding: 4,
              borderRadius: 'var(--ant-border-radius)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--ant-color-bg-text-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* 分类名称 */}
      {!search && (
        <div
          style={{
            padding: '6px 12px',
            borderTop: '1px solid var(--ant-color-border)',
            fontSize: 12,
            color: 'var(--ant-color-text-secondary)',
            textAlign: 'center',
          }}
        >
          {EMOJI_CATEGORIES[activeCategory]?.name}
        </div>
      )}
    </div>
  )
}

// 显示选择器函数引用
let showEmojiPickerFn: ((position: { top: number; left: number }) => void) | null = null

// 自注册工具栏项
toolbarRegistry.register({
  id: 'emoji',
  label: '表情',
  icon: <SmileOutlined />,
  group: 'insert',
  execute: (editor) => {
    if (showEmojiPickerFn) {
      // 获取光标位置
      let position = { top: 0, left: 0 }
      editor.getEditorState().read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const anchor = selection.anchor
          const node = anchor.getNode()
          const domElement = editor.getElementByKey(node.getKey())
          if (domElement) {
            const rect = domElement.getBoundingClientRect()
            const editorRect = editor.getRootElement()!.getBoundingClientRect()
            position = {
              top: rect.bottom - editorRect.top + 4,
              left: rect.left - editorRect.left,
            }
          }
        }
      })
      showEmojiPickerFn(position)
    }
  },
})

/** Emoji Plugin React 组件 */
export function EmojiPluginComponent() {
  const [editor] = useLexicalComposerContext()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  // 注册显示选择器的函数
  useEffect(() => {
    showEmojiPickerFn = (pos) => {
      setPosition(pos)
      setPickerOpen(true)
    }
    return () => {
      showEmojiPickerFn = null
    }
  }, [])

  // 注册插入命令
  useEffect(() => {
    return editor.registerCommand(
      INSERT_EMOJI_COMMAND,
      (payload) => {
        const { emoji } = payload as { emoji: string }
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            selection.insertText(emoji)
          }
        })
        return true
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor])

  // 处理选择表情
  const handleSelect = useCallback(
    (emoji: string) => {
      editor.dispatchCommand(INSERT_EMOJI_COMMAND, { emoji })
    },
    [editor],
  )

  // 监听 : 触发
  useEffect(() => {
    const removeListener = editor.registerTextContentListener((text) => {
      if (text.endsWith(':')) {
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
        setPickerOpen(true)
      }
    })

    return removeListener
  }, [editor])

  return (
    <EmojiPicker
      open={pickerOpen}
      onSelect={handleSelect}
      onClose={() => setPickerOpen(false)}
      position={position}
    />
  )
}

export const emojiPlugin = createPlugin({
  id: 'emoji',
  name: '表情',
  version: '1.0.0',
  toolbarItems: [
    { id: 'emoji', label: '表情', group: 'insert', execute: () => {} },
  ],
  commands: [
    {
      id: 'emoji:insert',
      label: '插入表情',
      execute: (context: PluginContext, payload?: { emoji: string }) => {
        const editor = context.getEditor() as any
        if (payload?.emoji) {
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              selection.insertText(payload.emoji)
            }
          })
        }
      },
    },
  ],
  shortcuts: [],
})

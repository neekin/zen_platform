/**
 * Mention Plugin
 *
 * 功能：
 * - @提及用户
 * - 用户搜索和选择
 * - 键盘导航
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { DecoratorNode, DOMExportOutput, LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical'
import { $insertNodes, $getSelection, $isRangeSelection, createCommand, COMMAND_PRIORITY_LOW } from 'lexical'
import { useState, useCallback, useEffect, useRef } from 'react'
import { UserOutlined } from '@ant-design/icons'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../../types'
import { toolbarRegistry } from '../../../toolbar/ToolbarRegistry'

/** 用户数据 */
export interface MentionUser {
  id: string
  name: string
  avatar?: string
}

/** Mention 节点序列化类型 */
export type SerializedMentionNode = Spread<
  {
    type: 'mention'
    version: 1
    userId: string
    name: string
  },
  SerializedLexicalNode
>

/** Mention 组件 */
function MentionComponent({
  nodeKey,
  userId,
  name,
  editor,
}: {
  nodeKey: NodeKey
  userId: string
  name: string
  editor: LexicalEditor
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 'var(--ant-border-radius)',
        background: hovered ? 'var(--ant-color-primary-bg-hover)' : 'var(--ant-color-primary-bg)',
        color: 'var(--ant-color-primary)',
        cursor: 'pointer',
        transition: 'background 0.2s',
        userSelect: 'all',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-user-id={userId}
    >
      <UserOutlined style={{ fontSize: 12 }} />
      <span style={{ fontWeight: 500 }}>@{name}</span>
    </span>
  )
}

/** Mention 节点 */
export class MentionNode extends DecoratorNode<JSX.Element> {
  __userId: string
  __name: string

  static getType(): string {
    return 'mention'
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__userId, node.__name, node.__key)
  }

  constructor(userId: string, name: string, key?: NodeKey) {
    super(key)
    this.__userId = userId
    this.__name = name
  }

  getUserId(): string {
    return this.__userId
  }

  getName(): string {
    return this.__name
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span')
    span.style.display = 'inline'
    return span
  }

  updateDOM(): false {
    return false
  }

  exportJSON(): SerializedMentionNode {
    return {
      type: 'mention',
      version: 1,
      userId: this.__userId,
      name: this.__name,
    }
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    return new MentionNode(serializedNode.userId, serializedNode.name)
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span')
    element.className = 'zen-mention'
    element.setAttribute('data-user-id', this.__userId)
    element.textContent = `@${this.__name}`
    return { element }
  }

  static importDOM(): any {
    return {
      span: (element: HTMLElement) => {
        if (element.classList.contains('zen-mention')) {
          return {
            conversion: (element: HTMLElement) => {
              const userId = element.getAttribute('data-user-id') || ''
              const name = element.textContent?.replace('@', '') || ''
              return { node: new MentionNode(userId, name) }
            },
            priority: 0,
          }
        }
        return null
      },
    }
  }

  decorate(): JSX.Element {
    return <MentionComponent nodeKey={this.__key} userId={this.__userId} name={this.__name} editor={this.getEditor()} />
  }
}

/** 创建 Mention 节点 */
export function $createMentionNode(userId: string, name: string): MentionNode {
  return new MentionNode(userId, name)
}

/** 判断是否为 Mention 节点 */
export function $isMentionNode(node: any): node is MentionNode {
  return node instanceof MentionNode
}

/** 插入 Mention 命令 */
export const INSERT_MENTION_COMMAND = createCommand<{ userId: string; name: string }>('INSERT_MENTION_COMMAND')

/** Mention 菜单组件 */
function MentionMenu({
  open,
  users,
  selectedIndex,
  onSelect,
  position,
}: {
  open: boolean
  users: MentionUser[]
  selectedIndex: number
  onSelect: (user: MentionUser) => void
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

  if (!open || users.length === 0) return null

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 1000,
        width: 200,
        maxHeight: 240,
        background: 'var(--ant-color-bg-elevated)',
        border: '1px solid var(--ant-color-border)',
        borderRadius: 'var(--ant-border-radius)',
        boxShadow: 'var(--ant-box-shadow-secondary)',
        overflowY: 'auto',
        padding: 4,
      }}
    >
      {users.map((user, index) => (
        <div
          key={user.id}
          onClick={() => onSelect(user)}
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
              borderRadius: '50%',
              background: 'var(--ant-color-fill-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              overflow: 'hidden',
            }}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <UserOutlined />
            )}
          </div>
          <span style={{ fontSize: 13 }}>{user.name}</span>
        </div>
      ))}
    </div>
  )
}

/** Mention Plugin 配置 */
export interface MentionPluginConfig {
  /** 用户搜索函数 */
  searchUsers?: (query: string) => Promise<MentionUser[]>
  /** 静态用户列表（如果没有 searchUsers） */
  users?: MentionUser[]
}

/** Mention Plugin React 组件 */
export function MentionPluginComponent({ config }: { config?: MentionPluginConfig }) {
  const [editor] = useLexicalComposerContext()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<MentionUser[]>(config?.users || [])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const trigger = '@'

  // 搜索用户
  useEffect(() => {
    if (!open) return

    const doSearch = async () => {
      if (config?.searchUsers) {
        const results = await config.searchUsers(search)
        setUsers(results)
      } else if (config?.users) {
        const filtered = config.users.filter((u) =>
          u.name.toLowerCase().includes(search.toLowerCase()),
        )
        setUsers(filtered)
      }
      setSelectedIndex(0)
    }

    doSearch()
  }, [search, open, config])

  // 处理选择用户
  const handleSelect = useCallback(
    (user: MentionUser) => {
      editor.dispatchCommand(INSERT_MENTION_COMMAND, { userId: user.id, name: user.name })
      setOpen(false)
      setSearch('')
      setSelectedIndex(0)

      // 删除 @ 和搜索文本
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const anchor = selection.anchor
          const node = anchor.getNode()
          const text = node.getTextContent()
          const offset = anchor.offset
          const triggerIndex = text.lastIndexOf(trigger, offset)
          if (triggerIndex !== -1) {
            const deleteCount = offset - triggerIndex
            for (let i = 0; i < deleteCount; i++) {
              selection.deleteCharacter(false)
            }
          }
        }
      })
    },
    [editor],
  )

  // 监听键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, users.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (users[selectedIndex]) {
            handleSelect(users[selectedIndex])
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
  }, [editor, open, users, selectedIndex, search, handleSelect])

  // 监听输入以检测 @ 触发
  useEffect(() => {
    const removeListener = editor.registerTextContentListener((text) => {
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
  }, [editor, open])

  // 注册插入命令
  useEffect(() => {
    return editor.registerCommand(
      INSERT_MENTION_COMMAND,
      (payload) => {
        const { userId, name } = payload as { userId: string; name: string }
        const mentionNode = $createMentionNode(userId, name)
        $insertNodes([mentionNode])
        return true
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor])

  return (
    <MentionMenu
      open={open}
      users={users}
      selectedIndex={selectedIndex}
      onSelect={handleSelect}
      position={position}
    />
  )
}

export const mentionPlugin = createPlugin({
  id: 'mention',
  name: '@提及',
  version: '1.0.0',
  toolbarItems: [],
  commands: [
    {
      id: 'mention:insert',
      label: '@提及用户',
      execute: (context: PluginContext, payload?: { userId: string; name: string }) => {
        const editor = context.getEditor() as any
        if (payload) {
          editor.dispatchCommand(INSERT_MENTION_COMMAND, payload)
        }
      },
    },
  ],
  shortcuts: [],
})

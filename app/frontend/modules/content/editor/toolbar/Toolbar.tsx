/**
 * 工具栏组件
 *
 * 设计原则：
 * - 使用 Ant Design 6 Design Token
 * - 支持 Light/Dark 主题
 * - 可配置项
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Button, Space, Tooltip, Divider } from 'antd'
import {
  UndoOutlined,
  RedoOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  CodeOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  PictureOutlined,
  TableOutlined,
  MinusOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
} from '@ant-design/icons'
import { FORMAT_TEXT_COMMAND, UNDO_COMMAND, REDO_COMMAND } from 'lexical'
import { useCallback, useEffect, useState } from 'react'
import type { ToolbarItemId, ToolbarGroup } from '../../types'
import { parseToolbarConfig, TOOLBAR_ITEM_META } from './ToolbarPlugin'

/** 工具栏图标映射 */
const TOOLBAR_ICONS: Record<ToolbarItemId, React.ReactNode> = {
  undo: <UndoOutlined />,
  redo: <RedoOutlined />,
  bold: <BoldOutlined />,
  italic: <ItalicOutlined />,
  underline: <UnderlineOutlined />,
  strikethrough: <StrikethroughOutlined />,
  code: <CodeOutlined />,
  heading: <span style={{ fontWeight: 'bold' }}>H</span>,
  quote: <span style={{ fontWeight: 'bold' }}>"</span>,
  'bullet-list': <UnorderedListOutlined />,
  'numbered-list': <OrderedListOutlined />,
  link: <LinkOutlined />,
  image: <PictureOutlined />,
  table: <TableOutlined />,
  divider: <MinusOutlined />,
  'align-left': <AlignLeftOutlined />,
  'align-center': <AlignCenterOutlined />,
  'align-right': <AlignRightOutlined />,
}

/** 工具栏属性 */
interface ToolbarProps {
  /** 工具栏配置 */
  config: ToolbarGroup[]
  /** 是否禁用 */
  disabled?: boolean
}

export default function Toolbar({ config, disabled }: ToolbarProps) {
  const [editor] = useLexicalComposerContext()
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())

  // 监听格式变化
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        // 获取当前格式状态
        // 这里简化实现，实际需要检查选区的格式
      })
    })
  }, [editor])

  // 执行工具栏命令
  const executeCommand = useCallback(
    (id: ToolbarItemId) => {
      switch (id) {
        case 'undo':
          editor.dispatchCommand(UNDO_COMMAND, undefined)
          break
        case 'redo':
          editor.dispatchCommand(REDO_COMMAND, undefined)
          break
        case 'bold':
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
          break
        case 'italic':
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
          break
        case 'underline':
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
          break
        case 'strikethrough':
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
          break
        case 'code':
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
          break
        // 其他命令需要在插件中实现
        default:
          console.warn(`Command not implemented: ${id}`)
      }
    },
    [editor],
  )

  // 渲染工具栏项
  const renderItem = (id: ToolbarItemId) => {
    const meta = TOOLBAR_ITEM_META[id]
    if (!meta) return null

    const isActive = activeFormats.has(id)

    return (
      <Tooltip key={id} title={meta.shortcut ? `${meta.label} (${meta.shortcut})` : meta.label}>
        <Button
          type="text"
          size="small"
          icon={TOOLBAR_ICONS[id]}
          disabled={disabled}
          style={isActive ? { background: 'var(--ant-color-primary-bg)' } : undefined}
          onClick={() => executeCommand(id)}
        />
      </Tooltip>
    )
  }

  const groups = parseToolbarConfig(config)

  return (
    <div
      style={{
        borderBottom: '1px solid var(--ant-color-border)',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      {groups.map((group, index) => (
        <span key={group.id}>
          {index > 0 && <Divider type="vertical" />}
          <Space size={2}>
            {group.items.map((id) => renderItem(id))}
          </Space>
        </span>
      ))}
    </div>
  )
}

/**
 * 工具栏组件
 *
 * 设计原则：
 * - 使用 Ant Design 6 Design Token
 * - 支持 Light/Dark 主题
 * - 可配置项
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Button, Space, Tooltip } from 'antd'
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
import { $getSelection, $isRangeSelection } from 'lexical'
import { $createHeadingNode } from '@lexical/rich-text'
import { $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list'
import { useCallback, useEffect, useState, useRef } from 'react'
import type { ToolbarItemId, ToolbarGroup } from '../../types'
import { parseToolbarConfig, TOOLBAR_ITEM_META } from '../../toolbar/ToolbarPlugin'
import { INSERT_IMAGE_COMMAND } from '../plugins/image'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        case 'heading':
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode('h2'))
            }
          })
          break
        case 'quote':
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createQuoteNode())
            }
          })
          break
        case 'bullet-list':
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
          break
        case 'numbered-list':
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
          break
        case 'link':
          // TODO: 打开链接对话框
          console.log('Link command')
          break
        case 'image':
          // 打开文件选择器
          fileInputRef.current?.click()
          break
        default:
          console.warn(`Command not implemented: ${id}`)
      }
    },
    [editor],
  )

  // 处理文件选择
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      const file = files[0]
      if (!file.type.startsWith('image/')) return

      // 读取文件并转为 base64 临时显示
      // 实际应该通过 uploader 上传
      const reader = new FileReader()
      reader.onload = () => {
        const src = reader.result as string
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src,
          alt: file.name,
        })
      }
      reader.readAsDataURL(file)

      // 重置 input
      e.target.value = ''
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
    <>
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
            {index > 0 && (
              <span
                style={{
                  display: 'inline-block',
                  width: 1,
                  height: 20,
                  margin: '0 4px',
                  background: 'var(--ant-color-border)',
                }}
              />
            )}
            <Space size={2}>
              {group.items.map((id) => renderItem(id))}
            </Space>
          </span>
        ))}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  )
}

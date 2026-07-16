/**
 * Lexical 富文本编辑器 - 工具栏
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import { $getSelection, $isRangeSelection } from 'lexical'
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list'
import { $createHeadingNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { useCallback, useEffect, useState } from 'react'
import { Button, Space, Tooltip, Divider } from 'antd'
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  UndoOutlined,
  RedoOutlined,
} from '@ant-design/icons'

type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3'

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
    }
  }, [])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar()
        return false
      },
      1,
    )
  }, [editor, updateToolbar])

  return (
    <div style={{ borderBottom: '1px solid #d9d9d9', padding: '4px 8px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
      <Space size={4}>
        <Tooltip title="撤销">
          <Button type="text" size="small" icon={<UndoOutlined />} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} />
        </Tooltip>
        <Tooltip title="重做">
          <Button type="text" size="small" icon={<RedoOutlined />} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} />
        </Tooltip>
      </Space>

      <Divider orientation="vertical" />

      <Space size={4}>
        <Tooltip title="加粗">
          <Button type="text" size="small" icon={<BoldOutlined />} style={isBold ? { background: '#e6f4ff' } : {}} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} />
        </Tooltip>
        <Tooltip title="斜体">
          <Button type="text" size="small" icon={<ItalicOutlined />} style={isItalic ? { background: '#e6f4ff' } : {}} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} />
        </Tooltip>
        <Tooltip title="下划线">
          <Button type="text" size="small" icon={<UnderlineOutlined />} style={isUnderline ? { background: '#e6f4ff' } : {}} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} />
        </Tooltip>
        <Tooltip title="删除线">
          <Button type="text" size="small" icon={<StrikethroughOutlined />} style={isStrikethrough ? { background: '#e6f4ff' } : {}} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')} />
        </Tooltip>
      </Space>

      <Divider orientation="vertical" />

      <Space size={4}>
        <Tooltip title="无序列表">
          <Button type="text" size="small" icon={<UnorderedListOutlined />} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} />
        </Tooltip>
        <Tooltip title="有序列表">
          <Button type="text" size="small" icon={<OrderedListOutlined />} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} />
        </Tooltip>
      </Space>
    </div>
  )
}

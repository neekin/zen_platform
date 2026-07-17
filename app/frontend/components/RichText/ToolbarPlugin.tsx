/** Lexical 富文本编辑器 - 工具栏 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  createCommand,
  LexicalCommand,
} from 'lexical'
import { $getSelection, $isRangeSelection, $isRootOrShadowRoot } from 'lexical'
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { $findMatchingParent } from '@lexical/utils'
import { useCallback, useEffect, useState, useRef } from 'react'
import { Button, Space, Tooltip, Divider, Upload, Modal, Input, message } from 'antd'
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  UndoOutlined,
  RedoOutlined,
  PictureOutlined,
  LinkOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  CodeOutlined,
  MinusOutlined,
} from '@ant-design/icons'
import { $createImageNode } from './ImageNode'
import type { UploadProps } from 'antd'

export const INSERT_IMAGE_COMMAND: LexicalCommand<{ src: string; alt: string }> = createCommand('INSERT_IMAGE_COMMAND')

type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'quote'

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [blockType, setBlockType] = useState<BlockType>('paragraph')
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))

      const anchorNode = selection.anchor.getNode()
      const element = $findMatchingParent(anchorNode, (e) => {
        const parent = e.getParent()
        return parent !== null && $isRootOrShadowRoot(parent)
      }) || anchorNode.getTopLevelElement()

      const type = element?.getType()
      if (!element) { setBlockType('paragraph') } else if (!element) { setBlockType('paragraph') } else if (type === 'heading') {
        const tag = (element as any).__tag
        setBlockType(tag as BlockType)
      } else if (type === 'quote') {
        setBlockType('quote')
      } else {
        setBlockType('paragraph')
      }
    }
  }, [])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => { updateToolbar(); return false },
      1,
    )
  }, [editor, updateToolbar])

  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        editor.update(() => {
          const imageNode = $createImageNode(payload.src, payload.alt)
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            selection.insertNodes([imageNode])
          }
        })
        return true
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor])

  const handleHeading = (tag: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag))
      }
    })
  }

  const handleQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }

  const handleInsertLink = () => {
    if (!linkUrl) return
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        // Simple link insertion via HTML
        const linkNode = document.createElement('a')
        linkNode.href = linkUrl
        linkNode.target = '_blank'
      }
    })
    setLinkModalOpen(false)
    setLinkUrl('')
  }

  const handleInsertImage = () => {
    if (!imageUrl) return
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: imageUrl, alt: '图片' })
    setImageModalOpen(false)
    setImageUrl('')
  }

  const handleUploadImage: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options
    const formData = new FormData()
    formData.append('cms_medium[file]', file)
    formData.append('cms_medium[name]', (file as File).name)

    try {
      const res = await fetch('/admin/cms/media', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      })
      if (res.ok) {
        const data = await res.json()
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: data.url || data.file_url, alt: (file as File).name })
        onSuccess?.(data)
      } else {
        onError?.(new Error('上传失败'))
      }
    } catch (e) {
      onError?.(e as Error)
    }
  }

  return (
    <div style={{ borderBottom: '1px solid #d9d9d9', padding: '4px 8px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
      {/* 撤销/重做 */}
      <Space size={4}>
        <Tooltip title="撤销"><Button type="text" size="small" icon={<UndoOutlined />} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} /></Tooltip>
        <Tooltip title="重做"><Button type="text" size="small" icon={<RedoOutlined />} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} /></Tooltip>
      </Space>

      <Divider orientation="vertical" />

      {/* 标题 */}
      <Space size={4}>
        <Tooltip title="正文"><Button type="text" size="small" style={blockType === 'paragraph' ? { background: '#e6f4ff' } : {}} onClick={() => editor.update(() => { const s = $getSelection(); if ($isRangeSelection(s)) $setBlocksType(s, () => ({ getType: () => 'paragraph' } as any)) })}>P</Button></Tooltip>
        <Tooltip title="标题1"><Button type="text" size="small" style={blockType === 'h1' ? { background: '#e6f4ff' } : {}} onClick={() => handleHeading('h1')}>H1</Button></Tooltip>
        <Tooltip title="标题2"><Button type="text" size="small" style={blockType === 'h2' ? { background: '#e6f4ff' } : {}} onClick={() => handleHeading('h2')}>H2</Button></Tooltip>
        <Tooltip title="标题3"><Button type="text" size="small" style={blockType === 'h3' ? { background: '#e6f4ff' } : {}} onClick={() => handleHeading('h3')}>H3</Button></Tooltip>
      </Space>

      <Divider orientation="vertical" />

      {/* 文本格式 */}
      <Space size={4}>
        <Tooltip title="加粗"><Button type="text" size="small" icon={<BoldOutlined />} style={isBold ? { background: '#e6f4ff' } : {}} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} /></Tooltip>
        <Tooltip title="斜体"><Button type="text" size="small" icon={<ItalicOutlined />} style={isItalic ? { background: '#e6f4ff' } : {}} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} /></Tooltip>
        <Tooltip title="下划线"><Button type="text" size="small" icon={<UnderlineOutlined />} style={isUnderline ? { background: '#e6f4ff' } : {}} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} /></Tooltip>
        <Tooltip title="删除线"><Button type="text" size="small" icon={<StrikethroughOutlined />} style={isStrikethrough ? { background: '#e6f4ff' } : {}} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')} /></Tooltip>
      </Space>

      <Divider orientation="vertical" />

      {/* 列表 */}
      <Space size={4}>
        <Tooltip title="无序列表"><Button type="text" size="small" icon={<UnorderedListOutlined />} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} /></Tooltip>
        <Tooltip title="有序列表"><Button type="text" size="small" icon={<OrderedListOutlined />} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} /></Tooltip>
        <Tooltip title="引用"><Button type="text" size="small" icon={<CodeOutlined />} style={blockType === 'quote' ? { background: '#e6f4ff' } : {}} onClick={handleQuote} /></Tooltip>
      </Space>

      <Divider orientation="vertical" />

      {/* 插入 */}
      <Space size={4}>
        <Tooltip title="插入图片">
          <Button type="text" size="small" icon={<PictureOutlined />} onClick={() => setImageModalOpen(true)} />
        </Tooltip>
        <Tooltip title="插入链接">
          <Button type="text" size="small" icon={<LinkOutlined />} onClick={() => setLinkModalOpen(true)} />
        </Tooltip>
        <Tooltip title="上传图片">
          <Upload customRequest={handleUploadImage} showUploadList={false} accept="image/*">
            <Button type="text" size="small" icon={<PictureOutlined />} />
          </Upload>
        </Tooltip>
      </Space>

      {/* 图片 URL 弹窗 */}
      <Modal title="插入图片" open={imageModalOpen} onOk={handleInsertImage} onCancel={() => { setImageModalOpen(false); setImageUrl('') }} okText="插入" cancelText="取消">
        <Input placeholder="输入图片 URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
      </Modal>

      {/* 链接弹窗 */}
      <Modal title="插入链接" open={linkModalOpen} onOk={handleInsertLink} onCancel={() => { setLinkModalOpen(false); setLinkUrl('') }} okText="插入" cancelText="取消">
        <Input placeholder="输入链接 URL" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
      </Modal>
    </div>
  )
}

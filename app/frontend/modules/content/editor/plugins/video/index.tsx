/**
 * Video Plugin
 *
 * 功能：
 * - 插入视频（YouTube, Bilibili 等）
 * - 响应式 iframe
 * - URL 自动检测
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { DecoratorNode, DOMExportOutput, LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical'
import { $insertNodes, createCommand, COMMAND_PRIORITY_LOW } from 'lexical'
import { useState, useCallback, useEffect, useRef } from 'react'
import { createPlugin } from '../factory'
import type { PluginContext } from '../../../types'
import { toolbarRegistry } from '../../../toolbar/ToolbarRegistry'

/** Video 节点序列化类型 */
export type SerializedVideoNode = Spread<
  {
    type: 'video'
    version: 1
    src: string
    title?: string
    width?: number
    height?: number
  },
  SerializedLexicalNode
>

/** 从 URL 提取嵌入链接 */
function getEmbedUrl(url: string): string | null {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/)
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }

  // Bilibili
  const bilibiliMatch = url.match(/bilibili\.com\/video\/(BV[\w]+)/)
  if (bilibiliMatch) {
    return `https://player.bilibili.com/player.html?bvid=${bilibiliMatch[1]}`
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  // 直接嵌入链接
  if (url.includes('youtube.com/embed/') || url.includes('player.bilibili.com/')) {
    return url
  }

  return null
}

/** Video 组件 */
function VideoComponent({
  nodeKey,
  src,
  title,
  width,
  height,
  editor,
}: {
  nodeKey: NodeKey
  src: string
  title?: string
  width?: number
  height?: number
  editor: LexicalEditor
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editUrl, setEditUrl] = useState(src)
  const embedUrl = getEmbedUrl(src)

  // 保存编辑
  const handleSave = useCallback(() => {
    const newEmbedUrl = getEmbedUrl(editUrl)
    if (newEmbedUrl) {
      editor.update(() => {
        const { $getNodeByKey } = require('lexical')
        const node = $getNodeByKey(nodeKey)
        if (node instanceof VideoNode) {
          node.setSrc(newEmbedUrl)
        }
      })
      setIsEditing(false)
    }
  }, [editor, nodeKey, editUrl])

  if (isEditing) {
    return (
      <div style={{ margin: '16px 0', padding: 16, border: '1px solid var(--ant-color-border)', borderRadius: 'var(--ant-border-radius)' }}>
        <div style={{ marginBottom: 8, fontSize: 13 }}>输入视频链接</div>
        <input
          type="text"
          value={editUrl}
          onChange={(e) => setEditUrl(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid var(--ant-color-border)',
            borderRadius: 'var(--ant-border-radius)',
            marginBottom: 8,
          }}
          placeholder="https://www.youtube.com/watch?v=..."
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') setIsEditing(false)
          }}
        />
        <div style={{ fontSize: 11, color: 'var(--ant-color-text-secondary)' }}>
          支持 YouTube, Bilibili, Vimeo 等
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => setIsEditing(false)} style={{ padding: '4px 12px', cursor: 'pointer' }}>取消</button>
          <button
            onClick={handleSave}
            disabled={!getEmbedUrl(editUrl)}
            style={{
              padding: '4px 12px',
              cursor: getEmbedUrl(editUrl) ? 'pointer' : 'not-allowed',
              background: getEmbedUrl(editUrl) ? 'var(--ant-color-primary)' : 'var(--ant-color-bg-secondary)',
              color: getEmbedUrl(editUrl) ? '#fff' : 'var(--ant-color-text-secondary)',
              border: 'none',
              borderRadius: 'var(--ant-border-radius)',
            }}
          >
            保存
          </button>
        </div>
      </div>
    )
  }

  if (!embedUrl) {
    return (
      <div
        style={{
          margin: '16px 0',
          padding: 24,
          border: '1px dashed var(--ant-color-border)',
          borderRadius: 'var(--ant-border-radius)',
          textAlign: 'center',
          cursor: 'pointer',
        }}
        onClick={() => setIsEditing(true)}
      >
        <div style={{ fontSize: 13, color: 'var(--ant-color-text-secondary)' }}>点击添加视频</div>
      </div>
    )
  }

  return (
    <div
      style={{ margin: '16px 0', position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}
    >
      <iframe
        src={embedUrl}
        title={title || 'Video'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: 'var(--ant-border-radius)',
        }}
        allowFullScreen
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          cursor: 'pointer',
        }}
        onClick={() => setIsEditing(true)}
      />
    </div>
  )
}

/** Video 节点 */
export class VideoNode extends DecoratorNode<JSX.Element> {
  __src: string
  __title: string
  __width: number
  __height: number

  static getType(): string {
    return 'video'
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__src, node.__title, node.__width, node.__height, node.__key)
  }

  constructor(src: string, title?: string, width?: number, height?: number, key?: NodeKey) {
    super(key)
    this.__src = src
    this.__title = title || ''
    this.__width = width || 560
    this.__height = height || 315
  }

  getSrc(): string {
    return this.__src
  }

  setSrc(src: string): void {
    const writable = this.getWritable()
    writable.__src = src
  }

  getTitle(): string {
    return this.__title
  }

  setTitle(title: string): void {
    const writable = this.getWritable()
    writable.__title = title
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div')
    div.style.display = 'block'
    return div
  }

  updateDOM(): false {
    return false
  }

  exportJSON(): SerializedVideoNode {
    return {
      type: 'video',
      version: 1,
      src: this.__src,
      title: this.__title,
      width: this.__width,
      height: this.__height,
    }
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    return new VideoNode(serializedNode.src, serializedNode.title, serializedNode.width, serializedNode.height)
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.className = 'zen-video'
    element.setAttribute('data-src', this.__src)
    if (this.__title) {
      element.setAttribute('data-title', this.__title)
    }
    return { element }
  }

  static importDOM(): any {
    return {
      div: (element: HTMLElement) => {
        if (element.classList.contains('zen-video')) {
          return {
            conversion: (element: HTMLElement) => {
              const src = element.getAttribute('data-src') || ''
              const title = element.getAttribute('data-title') || ''
              return { node: new VideoNode(src, title) }
            },
            priority: 0,
          }
        }
        return null
      },
    }
  }

  decorate(): JSX.Element {
    return <VideoComponent nodeKey={this.__key} src={this.__src} title={this.__title} width={this.__width} height={this.__height} editor={this.getEditor()} />
  }
}

/** 创建 Video 节点 */
export function $createVideoNode(src: string, title?: string, width?: number, height?: number): VideoNode {
  return new VideoNode(src, title, width, height)
}

/** 判断是否为 Video 节点 */
export function $isVideoNode(node: any): node is VideoNode {
  return node instanceof VideoNode
}

/** 插入 Video 命令 */
export const INSERT_VIDEO_COMMAND = createCommand<{ src: string; title?: string }>('INSERT_VIDEO_COMMAND')

// 显示对话框函数引用
let showVideoDialogFn: (() => void) | null = null

// 自注册工具栏项
toolbarRegistry.register({
  id: 'video',
  label: '视频',
  icon: <span style={{ fontSize: 14 }}>▶</span>,
  group: 'insert',
  execute: () => {
    if (showVideoDialogFn) {
      showVideoDialogFn()
    }
  },
})

/** Video Plugin React 组件 */
export function VideoPluginComponent() {
  const [editor] = useLexicalComposerContext()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [url, setUrl] = useState('')

  // 注册显示对话框的函数
  useEffect(() => {
    showVideoDialogFn = () => setDialogOpen(true)
    return () => {
      showVideoDialogFn = null
    }
  }, [])

  // 注册插入命令
  useEffect(() => {
    return editor.registerCommand(
      INSERT_VIDEO_COMMAND,
      (payload) => {
        const { src, title } = payload as { src: string; title?: string }
        const embedUrl = getEmbedUrl(src)
        if (embedUrl) {
          const videoNode = $createVideoNode(embedUrl, title)
          $insertNodes([videoNode])
        }
        return true
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor])

  // 处理插入
  const handleInsert = useCallback(() => {
    const embedUrl = getEmbedUrl(url)
    if (embedUrl) {
      editor.dispatchCommand(INSERT_VIDEO_COMMAND, { src: url })
      setDialogOpen(false)
      setUrl('')
    }
  }, [editor, url])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: dialogOpen ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={() => setDialogOpen(false)}
    >
      <div
        style={{
          background: 'var(--ant-color-bg-elevated)',
          borderRadius: 'var(--ant-border-radius-lg)',
          padding: 24,
          width: 400,
          maxWidth: '90vw',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>插入视频</h3>
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--ant-color-border)',
              borderRadius: 'var(--ant-border-radius)',
            }}
            placeholder="https://www.youtube.com/watch?v=..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInsert()
            }}
          />
          <div style={{ marginTop: 4, fontSize: 11, color: 'var(--ant-color-text-secondary)' }}>
            支持 YouTube, Bilibili, Vimeo
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => setDialogOpen(false)} style={{ padding: '8px 16px', cursor: 'pointer' }}>取消</button>
          <button
            onClick={handleInsert}
            disabled={!getEmbedUrl(url)}
            style={{
              padding: '8px 16px',
              cursor: getEmbedUrl(url) ? 'pointer' : 'not-allowed',
              background: getEmbedUrl(url) ? 'var(--ant-color-primary)' : 'var(--ant-color-bg-secondary)',
              color: getEmbedUrl(url) ? '#fff' : 'var(--ant-color-text-secondary)',
              border: 'none',
              borderRadius: 'var(--ant-border-radius)',
            }}
          >
            插入
          </button>
        </div>
      </div>
    </div>
  )
}

export const videoPlugin = createPlugin({
  id: 'video',
  name: '视频',
  version: '1.0.0',
  toolbarItems: [
    { id: 'video', label: '视频', group: 'insert', execute: () => {} },
  ],
  commands: [
    {
      id: 'video:insert',
      label: '插入视频',
      execute: (context: PluginContext, payload?: { src: string; title?: string }) => {
        const editor = context.getEditor() as any
        if (payload?.src) {
          editor.dispatchCommand(INSERT_VIDEO_COMMAND, payload)
        }
      },
    },
  ],
  shortcuts: [],
})

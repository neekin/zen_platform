/**
 * Attachment Plugin
 *
 * 功能：
 * - 上传文件附件
 * - 拖拽上传
 * - 文件图标和下载链接
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { DecoratorNode, DOMExportOutput, LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical'
import { $insertNodes, createCommand, COMMAND_PRIORITY_LOW } from 'lexical'
import { useState, useCallback, useEffect, useRef } from 'react'
import { FileOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons'
import { createPlugin } from '../factory'
import type { PluginContext, UploadAdapter } from '../../../types'
import { toolbarRegistry } from '../../../toolbar/ToolbarRegistry'

/** Attachment 节点序列化类型 */
export type SerializedAttachmentNode = Spread<
  {
    type: 'attachment'
    version: 1
    url: string
    filename: string
    size: number
    contentType: string
  },
  SerializedLexicalNode
>

/** 格式化文件大小 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

/** 获取文件图标颜色 */
function getFileIconColor(contentType: string): string {
  if (contentType.includes('pdf')) return '#ff4d4f'
  if (contentType.includes('word') || contentType.includes('doc')) return '#1890ff'
  if (contentType.includes('excel') || contentType.includes('sheet')) return '#52c41a'
  if (contentType.includes('powerpoint') || contentType.includes('presentation')) return '#fa8c16'
  if (contentType.includes('zip') || contentType.includes('rar') || contentType.includes('7z')) return '#722ed1'
  if (contentType.includes('image')) return '#13c2c2'
  return '#8c8c8c'
}

/** Attachment 组件 */
function AttachmentComponent({
  nodeKey,
  url,
  filename,
  size,
  contentType,
  editor,
}: {
  nodeKey: NodeKey
  url: string
  filename: string
  size: number
  contentType: string
  editor: LexicalEditor
}) {
  const [hovered, setHovered] = useState(false)

  // 删除附件
  const handleDelete = useCallback(() => {
    editor.update(() => {
      const { $getNodeByKey } = require('lexical')
      const node = $getNodeByKey(nodeKey)
      if (node) {
        node.remove()
      }
    })
  }, [editor, nodeKey])

  return (
    <div
      style={{
        margin: '8px 0',
        padding: '12px 16px',
        border: '1px solid var(--ant-color-border)',
        borderRadius: 'var(--ant-border-radius)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: hovered ? 'var(--ant-color-bg-text-hover)' : 'transparent',
        transition: 'background 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <FileOutlined style={{ fontSize: 24, color: getFileIconColor(contentType) }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {filename}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ant-color-text-secondary)' }}>
          {formatFileSize(size)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <a
          href={url}
          download={filename}
          style={{ color: 'var(--ant-color-primary)', fontSize: 16 }}
          onClick={(e) => e.stopPropagation()}
        >
          <DownloadOutlined />
        </a>
        {hovered && (
          <span
            style={{ color: 'var(--ant-color-error)', fontSize: 16, cursor: 'pointer' }}
            onClick={handleDelete}
          >
            <DeleteOutlined />
          </span>
        )}
      </div>
    </div>
  )
}

/** Attachment 节点 */
export class AttachmentNode extends DecoratorNode<JSX.Element> {
  __url: string
  __filename: string
  __size: number
  __contentType: string

  static getType(): string {
    return 'attachment'
  }

  static clone(node: AttachmentNode): AttachmentNode {
    return new AttachmentNode(node.__url, node.__filename, node.__size, node.__contentType, node.__key)
  }

  constructor(url: string, filename: string, size: number, contentType: string, key?: NodeKey) {
    super(key)
    this.__url = url
    this.__filename = filename
    this.__size = size
    this.__contentType = contentType
  }

  getUrl(): string {
    return this.__url
  }

  getFilename(): string {
    return this.__filename
  }

  getSize(): number {
    return this.__size
  }

  getContentType(): string {
    return this.__contentType
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div')
    div.style.display = 'block'
    return div
  }

  updateDOM(): false {
    return false
  }

  exportJSON(): SerializedAttachmentNode {
    return {
      type: 'attachment',
      version: 1,
      url: this.__url,
      filename: this.__filename,
      size: this.__size,
      contentType: this.__contentType,
    }
  }

  static importJSON(serializedNode: SerializedAttachmentNode): AttachmentNode {
    return new AttachmentNode(serializedNode.url, serializedNode.filename, serializedNode.size, serializedNode.contentType)
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('a')
    element.className = 'zen-attachment'
    element.href = this.__url
    element.download = this.__filename
    element.textContent = this.__filename
    element.setAttribute('data-size', String(this.__size))
    element.setAttribute('data-content-type', this.__contentType)
    return { element }
  }

  static importDOM(): any {
    return {
      a: (element: HTMLElement) => {
        if (element.classList.contains('zen-attachment')) {
          return {
            conversion: (element: HTMLAnchorElement) => {
              const url = element.href || ''
              const filename = element.textContent || ''
              const size = parseInt(element.getAttribute('data-size') || '0')
              const contentType = element.getAttribute('data-content-type') || ''
              return { node: new AttachmentNode(url, filename, size, contentType) }
            },
            priority: 0,
          }
        }
        return null
      },
    }
  }

  decorate(): JSX.Element {
    return (
      <AttachmentComponent
        nodeKey={this.__key}
        url={this.__url}
        filename={this.__filename}
        size={this.__size}
        contentType={this.__contentType}
        editor={this.getEditor()}
      />
    )
  }
}

/** 创建 Attachment 节点 */
export function $createAttachmentNode(url: string, filename: string, size: number, contentType: string): AttachmentNode {
  return new AttachmentNode(url, filename, size, contentType)
}

/** 判断是否为 Attachment 节点 */
export function $isAttachmentNode(node: any): node is AttachmentNode {
  return node instanceof AttachmentNode
}

/** 插入 Attachment 命令 */
export const INSERT_ATTACHMENT_COMMAND = createCommand<{ url: string; filename: string; size: number; contentType: string }>('INSERT_ATTACHMENT_COMMAND')

// 上传器引用
let attachmentUploaderRef: UploadAdapter | null = null

// 文件输入引用
let fileInputRefFn: (() => void) | null = null

// 自注册工具栏项
toolbarRegistry.register({
  id: 'attachment',
  label: '附件',
  icon: <FileOutlined />,
  group: 'insert',
  execute: () => {
    if (fileInputRefFn) {
      fileInputRefFn()
    }
  },
})

/** Attachment Plugin 配置 */
export interface AttachmentPluginConfig {
  /** 上传适配器 */
  uploader?: UploadAdapter
  /** 最大文件大小（字节） */
  maxSize?: number
  /** 允许的文件类型 */
  accept?: string[]
}

/** Attachment Plugin React 组件 */
export function AttachmentPluginComponent({ config }: { config?: AttachmentPluginConfig }) {
  const [editor] = useLexicalComposerContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploader, maxSize = 50 * 1024 * 1024, accept } = config || {}

  // 设置上传器引用
  useEffect(() => {
    attachmentUploaderRef = uploader || null
  }, [uploader])

  // 注册文件输入触发函数
  useEffect(() => {
    fileInputRefFn = () => {
      fileInputRef.current?.click()
    }
    return () => {
      fileInputRefFn = null
    }
  }, [])

  // 注册插入命令
  useEffect(() => {
    return editor.registerCommand(
      INSERT_ATTACHMENT_COMMAND,
      (payload) => {
        const { url, filename, size, contentType } = payload as { url: string; filename: string; size: number; contentType: string }
        const attachmentNode = $createAttachmentNode(url, filename, size, contentType)
        $insertNodes([attachmentNode])
        return true
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor])

  // 处理文件选择
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      const file = files[0]

      // 验证文件大小
      if (file.size > maxSize) {
        console.error('File too large:', file.size)
        return
      }

      // 上传文件
      if (uploader) {
        try {
          const result = await uploader.upload(file)
          editor.dispatchCommand(INSERT_ATTACHMENT_COMMAND, {
            url: result.url,
            filename: result.filename,
            size: result.size,
            contentType: result.contentType,
          })
        } catch (error) {
          console.error('Attachment upload failed:', error)
        }
      } else {
        // 没有上传器，使用本地 URL
        const url = URL.createObjectURL(file)
        editor.dispatchCommand(INSERT_ATTACHMENT_COMMAND, {
          url,
          filename: file.name,
          size: file.size,
          contentType: file.type,
        })
      }

      // 重置 input
      e.target.value = ''
    },
    [editor, uploader, maxSize],
  )

  // 拖拽上传
  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement) return

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        for (const file of Array.from(files)) {
          // 跳过图片（由 Image Plugin 处理）
          if (file.type.startsWith('image/')) continue

          if (file.size > maxSize) {
            console.error('File too large:', file.name)
            continue
          }

          if (uploader) {
            try {
              const result = await uploader.upload(file)
              editor.dispatchCommand(INSERT_ATTACHMENT_COMMAND, {
                url: result.url,
                filename: result.filename,
                size: result.size,
                contentType: result.contentType,
              })
            } catch (error) {
              console.error('Attachment upload failed:', error)
            }
          } else {
            const url = URL.createObjectURL(file)
            editor.dispatchCommand(INSERT_ATTACHMENT_COMMAND, {
              url,
              filename: file.name,
              size: file.size,
              contentType: file.type,
            })
          }
        }
      }
    }

    rootElement.addEventListener('dragover', handleDragOver)
    rootElement.addEventListener('drop', handleDrop)

    return () => {
      rootElement.removeEventListener('dragover', handleDragOver)
      rootElement.removeEventListener('drop', handleDrop)
    }
  }, [editor, uploader, maxSize])

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept={accept?.join(',')}
      style={{ display: 'none' }}
      onChange={handleFileChange}
    />
  )
}

export const attachmentPlugin = createPlugin({
  id: 'attachment',
  name: '附件',
  version: '1.0.0',
  toolbarItems: [
    { id: 'attachment', label: '附件', group: 'insert', execute: () => {} },
  ],
  commands: [
    {
      id: 'attachment:insert',
      label: '插入附件',
      execute: (context: PluginContext, payload?: { url: string; filename: string; size: number; contentType: string }) => {
        const editor = context.getEditor() as any
        if (payload) {
          editor.dispatchCommand(INSERT_ATTACHMENT_COMMAND, payload)
        }
      },
    },
  ],
  shortcuts: [],
})

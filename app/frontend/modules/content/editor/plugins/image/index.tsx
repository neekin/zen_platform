/**
 * Image Plugin
 *
 * 功能：
 * - 上传
 * - 拖拽
 * - 粘贴
 * - 缩放
 * - 对齐
 * - 标题
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, createCommand } from 'lexical'
import { PictureOutlined } from '@ant-design/icons'
import { useEffect, useCallback, useRef } from 'react'
import { $createImageNode, $isImageNode, ImageNode } from './ImageNode'
import type { UploadAdapter, PluginContext } from '@/../types'
import { createPlugin } from '../factory'
import { toolbarRegistry } from '@/../toolbar/ToolbarRegistry'

/** Image 插件配置 */
export interface ImagePluginConfig {
  /** 上传适配器 */
  uploader?: UploadAdapter
  /** 最大宽度 */
  maxWidth?: number
  /** 允许的图片类型 */
  accept?: string[]
}

/** 插入图片命令 */
export const INSERT_IMAGE_COMMAND = createCommand<{ src: string; alt?: string; width?: number; height?: number }>('INSERT_IMAGE_COMMAND')

// 文件选择器引用
let fileInputRefFn: (() => void) | null = null

// 自注册工具栏项
toolbarRegistry.register({
  id: 'image',
  label: '图片',
  icon: <PictureOutlined />,
  group: 'insert',
  execute: () => {
    if (fileInputRefFn) {
      fileInputRefFn()
    }
  },
})

/** Image Plugin React 组件 */
export function ImagePluginComponent({ config }: { config: ImagePluginConfig }) {
  const [editor] = useLexicalComposerContext()
  const { uploader, maxWidth = 800, accept = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] } = config
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 注册文件选择器触发函数
  useEffect(() => {
    fileInputRefFn = () => {
      fileInputRef.current?.click()
    }
    return () => {
      fileInputRefFn = null
    }
  }, [])

  // 注册图片节点
  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagePlugin: ImageNode not registered')
    }
  }, [editor])

  // 注册插入图片命令
  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const imageNode = $createImageNode(payload)
        $insertNodes([imageNode])
        return true
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor])

  // 处理文件上传
  const handleFileUpload = useCallback(
    async (file: File) => {
      // 验证文件类型
      if (!accept.some((type) => file.type.startsWith(type.replace('/*', '/')))) {
        console.error('Invalid file type:', file.type)
        return
      }

      // 如果有上传器，使用上传器
      if (uploader) {
        try {
          const result = await uploader.upload(file)
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            src: result.url,
            alt: result.filename,
            width: result.width || maxWidth,
            height: result.height,
          })
        } catch (error) {
          console.error('Image upload failed:', error)
          // 上传失败时回退到 base64
          insertBase64Image(file)
        }
      } else {
        // 没有上传器，使用 base64
        insertBase64Image(file)
      }
    },
    [editor, uploader, accept, maxWidth],
  )

  // 插入 base64 图片（临时方案）
  const insertBase64Image = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        const src = reader.result as string
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src,
          alt: file.name,
        })
      }
      reader.readAsDataURL(file)
    },
    [editor],
  )

  // 处理文件选择
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      const file = files[0]
      handleFileUpload(file)

      // 重置 input
      e.target.value = ''
    },
    [handleFileUpload],
  )

  // 拖拽上传
  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement) return

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        for (const file of Array.from(files)) {
          if (file.type.startsWith('image/')) {
            handleFileUpload(file)
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
  }, [editor, handleFileUpload])

  // 粘贴上传
  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement) return

    const handlePaste = (e: ClipboardEvent) => {
      const files = e.clipboardData?.files
      if (files && files.length > 0) {
        for (const file of Array.from(files)) {
          if (file.type.startsWith('image/')) {
            e.preventDefault()
            handleFileUpload(file)
          }
        }
      }
    }

    rootElement.addEventListener('paste', handlePaste)
    return () => {
      rootElement.removeEventListener('paste', handlePaste)
    }
  }, [editor, handleFileUpload])

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept={accept.join(',')}
      style={{ display: 'none' }}
      onChange={handleFileChange}
    />
  )
}

/** 创建 Image Plugin */
export function createImagePlugin(config: ImagePluginConfig = {}) {
  return createPlugin({
    id: 'image',
    name: '图片',
    version: '1.0.0',
    toolbarItems: [
      { id: 'image', label: '图片', group: 'insert', execute: () => {} },
    ],
    commands: [
      {
        id: 'image:insert',
        label: '插入图片',
        execute: (context: PluginContext, payload?: { file?: File; url?: string; alt?: string }) => {
          if (!payload) return

          const editor = context.getEditor() as any

          if (payload.url) {
            // 直接插入 URL
            editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
              src: payload.url,
              alt: payload.alt,
            })
          } else if (payload.file && config.uploader) {
            // 上传文件
            config.uploader.upload(payload.file).then((result) => {
              editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                src: result.url,
                alt: result.filename,
                width: result.width,
                height: result.height,
              })
            })
          }
        },
      },
    ],
    shortcuts: [],
  })
}

/** 默认图片插件 */
export const imagePlugin = createImagePlugin()

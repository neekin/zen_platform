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
import { useEffect, useCallback, useRef } from 'react'
import { $createImageNode, $isImageNode, ImageNode } from './ImageNode'
import type { UploadAdapter, PluginContext } from '../../../types'
import { createPlugin } from '../factory'

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

/** Image Plugin React 组件 */
export function ImagePluginComponent({ config }: { config: ImagePluginConfig }) {
  const [editor] = useLexicalComposerContext()
  const { uploader, maxWidth = 800, accept = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] } = config

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
      if (!uploader) {
        console.warn('No uploader configured')
        return
      }

      // 验证文件类型
      if (!accept.some((type) => file.type.startsWith(type.replace('/*', '/')))) {
        console.error('Invalid file type:', file.type)
        return
      }

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
      }
    },
    [editor, uploader, accept, maxWidth],
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

  return null
}

/** 创建 Image Plugin */
export function createImagePlugin(config: ImagePluginConfig = {}) {
  return createPlugin({
    id: 'image',
    name: '图片',
    version: '1.0.0',
    toolbarItems: [
      {
        id: 'image',
        label: '图片',
        group: 'insert',
        execute: () => {},
      },
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

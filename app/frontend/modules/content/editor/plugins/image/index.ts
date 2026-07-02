/**
 * Image 插件
 *
 * 功能：
 * - 上传
 * - 拖拽
 * - 粘贴
 * - 缩放
 * - 对齐
 * - 标题
 */
import { createPlugin } from '../factory'
import type { PluginContext, UploadAdapter } from '../../../types'

/** Image 插件配置 */
export interface ImagePluginConfig {
  /** 上传适配器 */
  uploader?: UploadAdapter
  /** 最大宽度 */
  maxWidth?: number
  /** 允许的图片类型 */
  accept?: string[]
}

export function createImagePlugin(config: ImagePluginConfig = {}) {
  const {
    uploader,
    maxWidth = 800,
    accept = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = config

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
        execute: async (context: PluginContext, payload?: { file?: File; url?: string; alt?: string }) => {
          if (!payload) return

          let url = payload.url

          // 如果是文件，先上传
          if (payload.file && uploader) {
            try {
              const result = await uploader.upload(payload.file)
              url = result.url
            } catch (error) {
              console.error('Image upload failed:', error)
              return
            }
          }

          if (!url) return

          // 插入图片节点
          // TODO: 使用 Lexical 图片节点插入
          console.log('Insert image:', { url, alt: payload.alt })
        },
      },
      {
        id: 'image:resize',
        label: '调整图片大小',
        execute: (context: PluginContext, payload?: { width: number; height: number }) => {
          console.log('Resize image:', payload)
        },
      },
      {
        id: 'image:align',
        label: '图片对齐',
        execute: (context: PluginContext, payload?: { alignment: 'left' | 'center' | 'right' }) => {
          console.log('Align image:', payload)
        },
      },
      {
        id: 'image:delete',
        label: '删除图片',
        execute: (context: PluginContext) => {
          console.log('Delete image')
        },
      },
    ],
    shortcuts: [],
  })
}

/** 默认图片插件 */
export const imagePlugin = createImagePlugin()

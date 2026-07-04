/**
 * 图片上传组件
 *
 * 支持预览、拖拽上传、裁剪（可选）
 */
import { useState, useCallback } from 'react'
import { Upload, Image, App } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import type { UploadAdapter } from '@/content'

export interface ImageUploadProps {
  /** 上传适配器 */
  uploader?: UploadAdapter
  /** 值（URL 或 ID） */
  value?: string
  /** 变化回调 */
  onChange?: (value: string | undefined) => void
  /** 接受的图片类型 */
  accept?: string[]
  /** 最大文件大小（MB） */
  maxSize?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 占位符文本 */
  placeholder?: string
}

export default function ImageUpload({
  uploader,
  value,
  onChange,
  accept = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize = 10,
  disabled = false,
  placeholder = '上传图片',
}: ImageUploadProps) {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  // 处理上传
  const handleUpload: UploadProps['customRequest'] = useCallback(
    async (options) => {
      const { file, onSuccess, onError } = options

      // 验证文件类型
      const fileObj = file as File
      if (!accept.some((type) => fileObj.type.startsWith(type.replace('/*', '/')))) {
        message.error('不支持的图片格式')
        onError?.(new Error('Invalid file type'))
        return
      }

      // 验证文件大小
      if (fileObj.size > maxSize * 1024 * 1024) {
        message.error(`图片大小不能超过 ${maxSize}MB`)
        onError?.(new Error('File too large'))
        return
      }

      setLoading(true)

      try {
        if (uploader) {
          // 使用上传器上传
          const result = await uploader.upload(fileObj)
          onChange?.(result.url)
          onSuccess?.(result)
        } else {
          // 没有上传器，使用 base64
          const reader = new FileReader()
          reader.onload = () => {
            onChange?.(reader.result as string)
            onSuccess?.(reader.result)
          }
          reader.onerror = () => {
            onError?.(new Error('Failed to read file'))
          }
          reader.readAsDataURL(fileObj)
        }
      } catch (error) {
        message.error('上传失败')
        onError?.(error as Error)
      } finally {
        setLoading(false)
      }
    },
    [uploader, accept, maxSize, onChange],
  )

  // 处理删除
  const handleRemove = useCallback(() => {
    onChange?.(undefined)
  }, [onChange])

  // 上传按钮
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{placeholder}</div>
    </div>
  )

  return (
    <div>
      <Upload
        listType="picture-card"
        showUploadList={false}
        customRequest={handleUpload}
        accept={accept.join(',')}
        disabled={disabled || loading}
      >
        {value ? (
          <div style={{ position: 'relative' }}>
            <Image
              src={value}
              alt="uploaded"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              preview={{
                visible: previewOpen,
                onVisibleChange: setPreviewOpen,
              }}
            />
            {!disabled && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  padding: '4px',
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '0 0 0 4px',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
              >
                <DeleteOutlined style={{ color: '#fff' }} />
              </div>
            )}
          </div>
        ) : (
          uploadButton
        )}
      </Upload>
    </div>
  )
}

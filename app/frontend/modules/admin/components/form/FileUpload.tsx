/**
 * 文件上传组件
 *
 * 支持多文件上传、进度显示、文件列表
 */
import { useState, useCallback } from 'react'
import { Upload, Button, List, App } from 'antd'
import { UploadOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import type { UploadAdapter } from '@/content'

export type FileUploadProps = {
  /** 上传适配器 */
  uploader?: UploadAdapter
  /** 值（URL 或 ID 列表） */
  value?: string[]
  /** 变化回调 */
  onChange?: (value: string[]) => void
  /** 接受的文件类型 */
  accept?: string[]
  /** 最大文件大小（MB） */
  maxSize?: number
  /** 最大文件数量 */
  maxCount?: number
  /** 是否支持多选 */
  multiple?: boolean
  /** 是否禁用 */
  disabled?: boolean
}

export default function FileUpload({
  uploader,
  value = [],
  onChange,
  accept = [],
  maxSize = 50,
  maxCount = 10,
  multiple = true,
  disabled = false,
}: FileUploadProps) {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)

  // 处理上传
  const handleUpload: UploadProps['customRequest'] = useCallback(
    async (options) => {
      const { file, onSuccess, onError } = options

      // 验证文件大小
      const fileObj = file as File
      if (fileObj.size > maxSize * 1024 * 1024) {
        message.error(`文件大小不能超过 ${maxSize}MB`)
        onError?.(new Error('File too large'))
        return
      }

      // 验证文件数量
      if (value.length >= maxCount) {
        message.error(`最多上传 ${maxCount} 个文件`)
        onError?.(new Error('Too many files'))
        return
      }

      setLoading(true)

      try {
        if (uploader) {
          // 使用上传器上传
          const result = await uploader.upload(fileObj)
          onChange?.([...value, result.url])
          onSuccess?.(result)
        } else {
          // 没有上传器，使用 base64
          const reader = new FileReader()
          reader.onload = () => {
            onChange?.([...value, reader.result as string])
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
    [uploader, accept, maxSize, maxCount, value, onChange],
  )

  // 处理删除
  const handleRemove = useCallback(
    (index: number) => {
      const newValue = [...value]
      newValue.splice(index, 1)
      onChange?.(newValue)
    },
    [value, onChange],
  )

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <Upload
        customRequest={handleUpload}
        accept={accept.length > 0 ? accept.join(',') : undefined}
        multiple={multiple}
        showUploadList={false}
        disabled={disabled || loading || value.length >= maxCount}
      >
        <Button icon={<UploadOutlined />} loading={loading} disabled={disabled}>
          上传文件 {value.length > 0 && `(${value.length}/${maxCount})`}
        </Button>
      </Upload>

      {value.length > 0 && (
        <List
          size="small"
          style={{ marginTop: 8 }}
          dataSource={value}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                !disabled && (
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(index)}
                  />
                ),
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={<FileOutlined />}
                title={
                  <a href={item} target="_blank" rel="noopener noreferrer">
                    {item.split('/').pop() || '文件'}
                  </a>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  )
}

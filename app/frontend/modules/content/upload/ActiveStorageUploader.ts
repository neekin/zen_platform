/**
 * Active Storage 上传适配器
 *
 * 使用 Rails Active Storage Direct Upload 实现
 * 文档: https://edgeguides.rubyonrails.org/active_storage_overview.html#direct-uploads
 */
import type { UploadAdapter, UploadResult, UploadProgress } from '../types'
import { UploadError, createFileValidator, type UploaderConfig } from './UploadAdapter'

/** Active Storage Direct Upload 响应 */
interface DirectUploadResponse {
  id: string
  key: string
  filename: string
  content_type: string
  byte_size: number
  checksum: string
  signed_id: string
  direct_upload: {
    url: string
    headers: Record<string, string>
  }
}

/** Rails CSRF Token */
function getCSRFToken(): string {
  // 从 meta 标签获取（Rails 默认方式）
  const meta = document.querySelector('meta[name="csrf-token"]')
  if (meta) return meta.getAttribute('content') || ''

  // 从 cookie 获取（备用方式）
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'csrf_token' || name === '_csrf_token') {
      return decodeURIComponent(value)
    }
  }

  return ''
}

/** Active Storage 上传器 */
export class ActiveStorageUploader implements UploadAdapter {
  private config: UploaderConfig
  private validate: (file: File) => { valid: boolean; error?: string }

  constructor(config: UploaderConfig = {}) {
    this.config = config
    this.validate = createFileValidator(config)
  }

  async upload(file: File, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
    // 1. 验证文件
    const validation = this.validate(file)
    if (!validation.valid) {
      throw new UploadError(validation.error!, 'VALIDATION_ERROR')
    }

    // 2. 创建 Direct Upload
    const directUpload = await this.createDirectUpload(file)

    // 3. 上传文件到存储服务
    await this.uploadToStorage(directUpload.direct_upload, file, onProgress)

    // 4. 返回结果
    return {
      id: directUpload.signed_id,
      url: this.buildBlobUrl(directUpload.signed_id),
      filename: directUpload.filename,
      size: directUpload.byte_size,
      contentType: directUpload.content_type,
    }
  }

  async delete(signedId: string): Promise<void> {
    const response = await fetch(`/rails/active_storage/blobs/${signedId}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': getCSRFToken(),
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new UploadError('删除文件失败', 'DELETE_ERROR', { status: response.status })
    }
  }

  /** 创建 Direct Upload */
  private async createDirectUpload(file: File): Promise<DirectUploadResponse> {
    const response = await fetch('/rails/active_storage/direct_uploads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
        ...this.config.headers,
      },
      body: JSON.stringify({
        blob: {
          filename: file.name,
          byte_size: file.size,
          content_type: file.type,
          checksum: await this.calculateChecksum(file),
        },
      }),
    })

    if (!response.ok) {
      throw new UploadError('创建上传任务失败', 'DIRECT_UPLOAD_ERROR', { status: response.status })
    }

    return response.json()
  }

  /** 上传文件到存储服务 */
  private async uploadToStorage(
    directUpload: DirectUploadResponse['direct_upload'],
    file: File,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.open('PUT', directUpload.url)

      // 设置请求头
      Object.entries(directUpload.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })

      // 进度回调
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          })
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new UploadError('上传失败', 'UPLOAD_ERROR', { status: xhr.status }))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new UploadError('网络错误', 'NETWORK_ERROR'))
      })

      xhr.send(file)
    })
  }

  /** 计算文件校验和 */
  private async calculateChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const hash = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hash))
    return btoa(String.fromCharCode(...hashArray))
  }

  /** 构建 Blob URL */
  private buildBlobUrl(signedId: string): string {
    return `/rails/active_storage/blobs/${signedId}`
  }
}

/** 创建图片上传器（预设配置） */
export function createImageUploader(config?: UploaderConfig): ActiveStorageUploader {
  return new ActiveStorageUploader({
    accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    maxSize: 10 * 1024 * 1024, // 10MB
    ...config,
  })
}

/** 创建文件上传器（预设配置） */
export function createFileUploader(config?: UploaderConfig): ActiveStorageUploader {
  return new ActiveStorageUploader({
    maxSize: 50 * 1024 * 1024, // 50MB
    ...config,
  })
}

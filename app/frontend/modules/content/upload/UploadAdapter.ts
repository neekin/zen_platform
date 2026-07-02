/**
 * 上传适配器抽象层
 *
 * 设计原则：
 * - 编辑器只依赖 UploadAdapter 接口
 * - 具体实现（如 ActiveStorageUploader）可替换
 * - 支持多种存储后端
 */
import type { UploadAdapter, UploadResult, UploadProgress, ValidationResult } from '../types'

/** 上传配置 */
export interface UploaderConfig {
  /** 允许的 MIME 类型 */
  accept?: string[]
  /** 最大文件大小（字节） */
  maxSize?: number
  /** 自定义请求头 */
  headers?: Record<string, string>
  /** 上传端点（如不使用 Active Storage） */
  endpoint?: string
}

/** 上传错误 */
export class UploadError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'UploadError'
  }
}

/** 文件验证器 */
export function createFileValidator(config: UploaderConfig) {
  return (file: File): ValidationResult => {
    if (config.accept && config.accept.length > 0) {
      const isAccepted = config.accept.some((type) => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', '/'))
        }
        return file.type === type
      })
      if (!isAccepted) {
        return { valid: false, error: `不支持的文件类型: ${file.type}` }
      }
    }

    if (config.maxSize && file.size > config.maxSize) {
      const sizeMB = (config.maxSize / 1024 / 1024).toFixed(1)
      return { valid: false, error: `文件大小超过限制: ${sizeMB}MB` }
    }

    return { valid: true }
  }
}

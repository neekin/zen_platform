/**
 * Admin 组件库入口
 *
 * 导出所有表单和展示组件
 */

// ==================== 表单组件 ====================
export { default as ImageUpload } from './form/ImageUpload'
export type { ImageUploadProps } from './form/ImageUpload'

export { default as FileUpload } from './form/FileUpload'
export type { FileUploadProps } from './form/FileUpload'

export { default as TagInput } from './form/TagInput'
export type { TagInputProps } from './form/TagInput'

// ==================== 展示组件 ====================
export { default as StatusBadge } from './display/StatusBadge'
export type { StatusBadgeProps } from './display/StatusBadge'

export { default as RelativeTime } from './display/RelativeTime'
export type { RelativeTimeProps } from './display/RelativeTime'

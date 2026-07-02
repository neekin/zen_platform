/**
 * Content Engine 类型定义
 *
 * 核心类型：所有业务模块共享
 */

// ==================== 编辑器类型 ====================

/** 编辑器内容格式 - Lexical JSON */
export type EditorContent = string

/** 编辑器状态 */
export type EditorState = 'idle' | 'editing' | 'uploading' | 'saving' | 'error'

/** 编辑器配置 */
export interface EditorConfig {
  /** 是否只读 */
  readOnly?: boolean
  /** 占位符 */
  placeholder?: string
  /** 自动聚焦 */
  autoFocus?: boolean
  /** 最大长度（字符数） */
  maxLength?: number
  /** 主题模式 */
  theme?: EditorTheme
  /** 上传适配器 */
  uploader?: UploadAdapter
  /** 工具栏配置 */
  toolbar?: ToolbarConfig
  /** 插件列表 */
  plugins?: Plugin[]
  /** 事件回调 */
  onChange?: (content: EditorContent) => void
  onFocus?: () => void
  onBlur?: () => void
  onError?: (error: EditorError) => void
}

/** 编辑器主题 */
export interface EditorTheme {
  mode: 'light' | 'dark'
  tokens?: Record<string, string>
}

/** 编辑器错误 */
export interface EditorError {
  code: string
  message: string
  details?: unknown
}

// ==================== 工具栏类型 ====================

/** 工具栏项标识 - 使用字符串以支持插件自定义 */
export type ToolbarItemId = string

/** 工具栏配置 */
export type ToolbarConfig = ToolbarItemId[] | ToolbarGroup[] | boolean

/** 工具栏分组 */
export interface ToolbarGroup {
  id: string
  items: ToolbarItemId[]
}

/** 工具栏项定义 */
export interface ToolbarItem {
  id: ToolbarItemId
  label: string
  icon?: React.ReactNode
  shortcut?: string
  group: string
  isActive?: () => boolean
  isDisabled?: () => boolean
  execute: () => void
}

// ==================== 上传类型 ====================

/** 上传结果 */
export interface UploadResult {
  /** 资源 ID */
  id: string
  /** 资源 URL */
  url: string
  /** 文件名 */
  filename: string
  /** 文件大小 */
  size: number
  /** MIME 类型 */
  contentType: string
  /** 缩略图 URL（图片专用） */
  thumbnailUrl?: string
  /** 宽度（图片/视频专用） */
  width?: number
  /** 高度（图片/视频专用） */
  height?: number
}

/** 上传进度 */
export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

/** 上传适配器接口 */
export interface UploadAdapter {
  /** 上传文件 */
  upload(file: File, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult>
  /** 删除文件 */
  delete?(id: string): Promise<void>
  /** 验证文件 */
  validate?(file: File): ValidationResult
}

/** 验证结果 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

/** 上传配置 */
export interface UploadConfig {
  /** 允许的 MIME 类型 */
  accept?: string[]
  /** 最大文件大小（字节） */
  maxSize?: number
  /** 最多文件数量 */
  maxCount?: number
  /** 是否允许多选 */
  multiple?: boolean
}

// ==================== 插件类型 ====================

/** 插件生命周期 */
export interface Plugin {
  /** 插件唯一标识 */
  id: string
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version?: string
  /** 初始化插件 */
  init?: (context: PluginContext) => void
  /** 销毁插件 */
  destroy?: () => void
  /** 获取工具栏项 */
  getToolbarItems?: () => ToolbarItem[]
  /** 获取命令 */
  getCommands?: () => PluginCommand[]
  /** 获取快捷键 */
  getShortcuts?: () => KeyboardShortcut[]
  /** 获取自定义节点 */
  getNodes?: () => PluginNode[]
  /** 渲染扩展 UI（如弹窗、面板） */
  renderUI?: () => React.ReactNode | null
}

/** 插件上下文 */
export interface PluginContext {
  /** 获取编辑器实例 */
  getEditor: () => unknown
  /** 注册命令 */
  registerCommand: (command: PluginCommand) => void
  /** 注册工具栏项 */
  registerToolbarItem: (item: ToolbarItem) => void
  /** 触发事件 */
  emit: (event: string, data?: unknown) => void
  /** 监听事件 */
  on: (event: string, handler: (data?: unknown) => void) => void
  /** 获取当前内容 */
  getContent: () => EditorContent
  /** 设置内容 */
  setContent: (content: EditorContent) => void
}

/** 插件命令 */
export interface PluginCommand {
  id: string
  label: string
  execute: (payload?: unknown) => void
}

/** 键盘快捷键 */
export interface KeyboardShortcut {
  key: string
  modifiers?: ('ctrl' | 'meta' | 'shift' | 'alt')[]
  command: string
}

/** 插件节点 */
export interface PluginNode {
  type: string
  component: React.ComponentType<unknown>
}

// ==================== 渲染器类型 ====================

/** 渲染器配置 */
export interface ViewerConfig {
  /** 内容 */
  content: EditorContent
  /** 主题 */
  theme?: EditorTheme
  /** 是否显示边框 */
  bordered?: boolean
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 自定义类名 */
  className?: string
}

// ==================== 序列化类型 ====================

/** 序列化格式 */
export type SerializationFormat = 'lexical' | 'html' | 'markdown'

/** 序列化器接口 */
export interface Serializer {
  /** 序列化 */
  serialize: (content: EditorContent, format: SerializationFormat) => string
  /** 反序列化 */
  deserialize: (data: string, format: SerializationFormat) => EditorContent
}

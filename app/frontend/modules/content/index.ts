/**
 * Content Engine 模块入口
 *
 * 业务模块只从这里导入
 *
 * @example
 * import { RichTextEditor, RichTextViewer, ActiveStorageUploader } from '@/modules/content'
 */
// ==================== 组件 ====================
export { default as RichTextEditor } from './editor/RichTextEditor'
export { default as RichTextViewer } from './renderer/RichTextViewer'

// ==================== 上传 ====================
export { ActiveStorageUploader, createImageUploader, createFileUploader } from './upload/ActiveStorageUploader'

// ==================== 序列化 ====================
export { serializeEditorState, deserializeEditorState, isEmptyContent, EMPTY_STATE } from './serializer/lexical'
export { extractPlainText, getContentSummary } from './serializer/html'

// ==================== 插件 ====================
export {
  builtinPlugins,
  pluginMap,
  getPlugin,
  registerPlugin,
  boldPlugin,
  italicPlugin,
  underlinePlugin,
  strikethroughPlugin,
  codePlugin,
  historyPlugin,
  headingPlugin,
  quotePlugin,
  listPlugin,
  linkPlugin,
  imagePlugin,
  createImagePlugin,
} from './editor/plugins'

export type { ImagePluginConfig } from './editor/plugins/image'

// ==================== 类型 ====================
export type {
  EditorContent,
  EditorConfig,
  EditorState,
  EditorTheme,
  EditorError,
  ToolbarConfig,
  ToolbarItemId,
  ToolbarGroup,
  ToolbarItem,
  UploadAdapter,
  UploadResult,
  UploadProgress,
  UploadConfig,
  ValidationResult,
  ViewerConfig,
  Plugin,
  PluginContext,
  PluginCommand,
  KeyboardShortcut,
  PluginNode,
  SerializationFormat,
  Serializer,
} from './types'

export type { RichTextEditorProps } from './editor/RichTextEditor'
export type { RichTextViewerProps } from './renderer/RichTextViewer'
export type { UploaderConfig } from './upload/UploadAdapter'

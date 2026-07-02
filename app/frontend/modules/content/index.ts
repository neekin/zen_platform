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

// ==================== 工具栏 ====================
export { toolbarRegistry } from './toolbar/ToolbarRegistry'
export type { ToolbarItemDefinition } from './toolbar/ToolbarRegistry'

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
export { LinkPluginComponent } from './editor/plugins/link'
export type { LinkPluginConfig } from './editor/plugins/link'
export { tablePlugin, TablePluginComponent } from './editor/plugins/table'
export type { TablePluginConfig } from './editor/plugins/table'
export { codeBlockPlugin, CodeBlockPluginComponent } from './editor/plugins/code-block'
export type { CodeBlockPluginConfig } from './editor/plugins/code-block'
export { slashCommandsPlugin, SlashCommandsPluginComponent } from './editor/plugins/slash-commands'
export type { SlashCommandsPluginConfig } from './editor/plugins/slash-commands'
export { mermaidPlugin, MermaidPluginComponent, MermaidNode, $createMermaidNode, $isMermaidNode } from './editor/plugins/mermaid'
export type { SerializedMermaidNode } from './editor/plugins/mermaid'
export { mathPlugin, MathPluginComponent, MathNode, $createMathNode, $isMathNode } from './editor/plugins/math'
export type { SerializedMathNode } from './editor/plugins/math'
export { videoPlugin, VideoPluginComponent, VideoNode, $createVideoNode, $isVideoNode } from './editor/plugins/video'
export type { SerializedVideoNode } from './editor/plugins/video'
export { attachmentPlugin, AttachmentPluginComponent, AttachmentNode, $createAttachmentNode, $isAttachmentNode } from './editor/plugins/attachment'
export type { SerializedAttachmentNode, AttachmentPluginConfig } from './editor/plugins/attachment'
export { mentionPlugin, MentionPluginComponent, MentionNode, $createMentionNode, $isMentionNode } from './editor/plugins/mention'
export type { SerializedMentionNode, MentionPluginConfig, MentionUser } from './editor/plugins/mention'
export { emojiPlugin, EmojiPluginComponent } from './editor/plugins/emoji'

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

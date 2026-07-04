/**
 * 插件注册表
 *
 * 所有内置插件在这里注册
 */
import { textFormatPlugin } from './text-format'
import { codePlugin } from './code'
import { historyPlugin } from './history'
import { headingPlugin } from './heading'
import { quotePlugin } from './quote'
import { listPlugin } from './list'
import { linkPlugin } from './link'
import { imagePlugin, createImagePlugin } from './image'
import { tablePlugin } from './table'
import { codeBlockPlugin } from './code-block'
import { slashCommandsPlugin } from './slash-commands'
import { mermaidPlugin } from './mermaid'
import { mathPlugin } from './math'
import { videoPlugin } from './video'
import { attachmentPlugin } from './attachment'
import { mentionPlugin } from './mention'
import { emojiPlugin } from './emoji'
import type { Plugin } from '../../types'

/** 内置插件列表 */
export const builtinPlugins: Plugin[] = [
  historyPlugin,
  textFormatPlugin,
  codePlugin,
  headingPlugin,
  quotePlugin,
  listPlugin,
  linkPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  slashCommandsPlugin,
  mermaidPlugin,
  mathPlugin,
  videoPlugin,
  attachmentPlugin,
  mentionPlugin,
  emojiPlugin,
]

/** 插件 ID 映射 */
export const pluginMap = new Map<string, Plugin>(
  builtinPlugins.map((plugin) => [plugin.id, plugin]),
)

/** 获取插件 */
export function getPlugin(id: string): Plugin | undefined {
  return pluginMap.get(id)
}

/** 注册自定义插件 */
export function registerPlugin(plugin: Plugin): void {
  pluginMap.set(plugin.id, plugin)
}

/** 导出各个插件 */
export { textFormatPlugin } from './text-format'
export { codePlugin } from './code'
export { historyPlugin } from './history'
export { headingPlugin } from './heading'
export { quotePlugin } from './quote'
export { listPlugin } from './list'
export { linkPlugin, LinkPluginComponent } from './link'
export type { LinkPluginConfig } from './link'
export { imagePlugin, createImagePlugin } from './image'
export type { ImagePluginConfig } from './image'
export { tablePlugin, TablePluginComponent } from './table'
export type { TablePluginConfig } from './table'
export { codeBlockPlugin, CodeBlockPluginComponent } from './code-block'
export type { CodeBlockPluginConfig } from './code-block'
export { slashCommandsPlugin, SlashCommandsPluginComponent } from './slash-commands'
export type { SlashCommandsPluginConfig } from './slash-commands'
export { mermaidPlugin, MermaidPluginComponent, MermaidNode, $createMermaidNode, $isMermaidNode } from './mermaid'
export type { SerializedMermaidNode } from './mermaid'
export { mathPlugin, MathPluginComponent, MathNode, $createMathNode, $isMathNode } from './math'
export type { SerializedMathNode } from './math'
export { videoPlugin, VideoPluginComponent, VideoNode, $createVideoNode, $isVideoNode } from './video'
export type { SerializedVideoNode } from './video'
export { attachmentPlugin, AttachmentPluginComponent, AttachmentNode, $createAttachmentNode, $isAttachmentNode } from './attachment'
export type { SerializedAttachmentNode, AttachmentPluginConfig } from './attachment'
export { mentionPlugin, MentionPluginComponent, MentionNode, $createMentionNode, $isMentionNode } from './mention'
export type { SerializedMentionNode, MentionPluginConfig, MentionUser } from './mention'
export { emojiPlugin, EmojiPluginComponent } from './emoji'

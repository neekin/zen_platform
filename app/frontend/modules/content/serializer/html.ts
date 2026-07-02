/**
 * HTML 序列化器
 *
 * 处理 Lexical EditorState 与 HTML 之间的转换
 * 用于：
 * - 旧数据迁移
 * - 邮件模板渲染
 * - SEO 预览
 */
import type { EditorContent } from '../types'

/** HTML 序列化选项 */
export interface HtmlSerializeOptions {
  /** 是否包含样式 */
  includeStyles?: boolean
  /** 是否包含图片 data 属性 */
  includeImageAttributes?: boolean
  /** 自定义标签映射 */
  tagMap?: Record<string, string>
}

/** HTML 反序列化选项 */
export interface HtmlDeserializeOptions {
  /** 是否保留空白 */
  preserveWhitespace?: boolean
  /** 自定义标签映射 */
  tagMap?: Record<string, string>
}

/** 序列化：EditorState → HTML（需要 Lexical 运行时） */
export function serializeToHtml(
  editorState: unknown,
  editor: unknown,
  options: HtmlSerializeOptions = {},
): string {
  // 此方法需要在 Lexical 上下文中调用
  // 使用 $generateHtmlFromNodes
  try {
    // 注意：实际实现需要在 editor.update 回调中调用 $generateHtmlFromNodes
    // 这里只是接口定义
    console.warn('serializeToHtml: 需要在 Lexical 上下文中调用')
    return ''
  } catch {
    console.error('Failed to serialize to HTML')
    return ''
  }
}

/** 反序列化：HTML → EditorState（需要 Lexical 运行时） */
export function deserializeFromHtml(
  html: string,
  editor: unknown,
  options: HtmlDeserializeOptions = {},
): unknown {
  // 此方法需要在 Lexical 上下文中调用
  // 使用 $generateNodesFromDOM
  try {
    console.warn('deserializeFromHtml: 需要在 Lexical 上下文中调用')
    return null
  } catch {
    console.error('Failed to deserialize from HTML')
    return null
  }
}

/** 纯文本提取（不需要 Lexical 运行时） */
export function extractPlainText(content: EditorContent): string {
  try {
    if (!content || content === '{}') return ''
    const state = JSON.parse(content)
    return extractTextFromNodes(state.root?.children || [])
  } catch {
    return ''
  }
}

/** 递归提取文本 */
function extractTextFromNodes(nodes: unknown[]): string {
  const texts: string[] = []
  for (const node of nodes) {
    if (typeof node !== 'object' || node === null) continue
    const n = node as Record<string, unknown>
    if (n.type === 'text' && typeof n.text === 'string') {
      texts.push(n.text)
    }
    if (Array.isArray(n.children)) {
      texts.push(extractTextFromNodes(n.children))
    }
  }
  return texts.join(' ')
}

/** 内容摘要（取前 N 个字符） */
export function getContentSummary(content: EditorContent, maxLength: number = 200): string {
  const text = extractPlainText(content)
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

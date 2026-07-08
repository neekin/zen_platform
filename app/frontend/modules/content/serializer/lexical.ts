/**
 * Lexical 序列化器
 *
 * 处理 Lexical EditorState 与 JSON 之间的转换
 */
import type { EditorContent } from '../types'

/** Lexical 节点 JSON 格式 */
export interface LexicalNodeJSON {
  type: string
  version: number
  [key: string]: unknown
}

/** Lexical EditorState JSON 格式 */
export interface LexicalStateJSON {
  root: {
    children: LexicalNodeJSON[]
    direction: 'ltr' | 'rtl'
    format: string
    indent: number
    type: 'root'
    version: number
  }
}

/** 序列化：EditorState → JSON 字符串 */
export function serializeEditorState(state: unknown): EditorContent {
  try {
    return JSON.stringify(state)
  } catch {
    console.error('Failed to serialize editor state')
    return '{}'
  }
}

/** 反序列化：JSON 字符串 → EditorState */
export function deserializeEditorState(json: EditorContent): LexicalStateJSON | null {
  try {
    if (!json || json === '{}' || json === 'null' || json === 'undefined') return null
    const parsed = JSON.parse(json)
    if (isValidLexicalState(parsed)) {
      return parsed
    }
    return null
  } catch {
    // Only warn if the value looks like it should be valid JSON
    if (json && json.length > 2 && json !== '{}') {
      console.warn('RichText: content is not valid Lexical JSON, starting with empty editor')
    }
    return null
  }
}

/** 验证是否为有效的 Lexical State */
function isValidLexicalState(state: unknown): state is LexicalStateJSON {
  if (typeof state !== 'object' || state === null) return false
  const s = state as Record<string, unknown>
  if (s.root === null || typeof s.root !== 'object') return false
  const root = s.root as Record<string, unknown>
  return root.type === 'root' && Array.isArray(root.children)
}

/** 清空内容的默认 State */
export const EMPTY_STATE: EditorContent = '{}'

/** 检查内容是否为空 */
export function isEmptyContent(content: EditorContent): boolean {
  if (!content || content === '{}') return true
  try {
    const state = JSON.parse(content)
    if (!state.root?.children) return true
    return state.root.children.length === 0
  } catch {
    return true
  }
}

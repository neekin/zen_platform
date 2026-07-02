/**
 * 富文本查看器
 *
 * 只读渲染 Lexical 内容
 * 不加载编辑器插件，独立 bundle
 *
 * 用法：
 * <RichTextViewer content={lexicalJSON} />
 */
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect, useRef } from 'react'
import type { EditorContent, EditorTheme } from '../types'
import { deserializeEditorState } from '../serializer/lexical'

// ==================== 内部插件 ====================

/** 加载内容插件 */
function ContentLoaderPlugin({ content }: { content: EditorContent }) {
  const [editor] = useLexicalComposerContext()
  const isLoaded = useRef(false)

  useEffect(() => {
    if (!isLoaded.current && content && content !== '{}') {
      const state = deserializeEditorState(content)
      if (state) {
        editor.setEditorState(editor.parseEditorState(state))
      }
      isLoaded.current = true
    }
  }, [editor, content])

  return null
}

// ==================== 查看器组件 ====================

/** 查看器属性 */
export interface RichTextViewerProps {
  /** 内容（Lexical JSON） */
  content: EditorContent
  /** 主题 */
  theme?: EditorTheme
  /** 是否显示边框 */
  bordered?: boolean
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 自定义类名 */
  className?: string
  /** 错误回调 */
  onError?: (error: Error) => void
}

export default function RichTextViewer({
  content,
  theme,
  bordered = false,
  style,
  className,
  onError,
}: RichTextViewerProps) {
  // Lexical 初始配置（只读）
  const initialConfig = {
    namespace: 'ZenContentViewer',
    theme: {
      paragraph: 'zen-paragraph',
      heading: {
        h1: 'zen-h1',
        h2: 'zen-h2',
        h3: 'zen-h3',
      },
      list: {
        nested: { listitem: 'zen-nested-listitem' },
        ol: 'zen-ol',
        ul: 'zen-ul',
        listitem: 'zen-listitem',
      },
      quote: 'zen-quote',
      code: 'zen-code',
      text: {
        bold: 'zen-text-bold',
        italic: 'zen-text-italic',
        underline: 'zen-text-underline',
        strikethrough: 'zen-text-strikethrough',
        code: 'zen-text-code',
      },
    },
    nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, LinkNode],
    editable: false,
    onError: (error: Error) => {
      console.error('Lexical viewer error:', error)
      onError?.(error)
    },
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className={className}
        style={{
          border: bordered ? '1px solid var(--ant-color-border)' : 'none',
          borderRadius: bordered ? 'var(--ant-border-radius)' : 0,
          overflow: 'hidden',
          ...style,
        }}
      >
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              style={{
                padding: bordered ? '12px 16px' : 0,
                outline: 'none',
                fontSize: 14,
                lineHeight: 1.7,
              }}
            />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ContentLoaderPlugin content={content} />
      </div>
    </LexicalComposer>
  )
}

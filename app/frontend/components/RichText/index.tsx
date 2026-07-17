/**
 * Lexical 富文本编辑器
 *
 * 用法：
 * <RichText value={html} onChange={setHtml} />
 *
 * 与 Ant Design Form 集成：
 * <Form.Item name="content" label="内容">
 *   <RichText />
 * </Form.Item>
 */
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { $getRoot } from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect, useRef } from 'react'
import type { EditorState, LexicalEditor } from 'lexical'
import ToolbarPlugin from './ToolbarPlugin'

// 同步外部值到编辑器
function DefaultValuePlugin({ value }: { value?: string }) {
  const [editor] = useLexicalComposerContext()
  const isInit = useRef(false)

  useEffect(() => {
    if (!isInit.current && value) {
      editor.update(() => {
        const parser = new DOMParser()
        const dom = parser.parseFromString(value, 'text/html')
        const nodes = $generateNodesFromDOM(editor, dom)
        const root = $getRoot()
        root.clear()
        const elementNodes = nodes.filter(node => "getChildren" in node)
        root.append(...elementNodes)
      })
      isInit.current = true
    }
  }, [editor, value])

  return null
}

export type RichTextProps = {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  style?: React.CSSProperties
  minHeight?: number
}

function InnerEditor({ onChange }: { onChange?: (value: string) => void }) {
  const handleChange = (editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor)
      onChange?.(html)
    })
  }

  return <OnChangePlugin onChange={handleChange} />
}

export default function RichText({
  value,
  onChange,
  placeholder = '请输入内容...',
  style,
  minHeight = 200,
}: RichTextProps) {
  const initialConfig = {
    namespace: 'RichTextEditor',
    theme: {
      paragraph: 'rich-text-paragraph',
      heading: {
        h1: 'rich-text-h1',
        h2: 'rich-text-h2',
        h3: 'rich-text-h3',
      },
      list: {
        nested: {
          listitem: 'rich-text-nested-listitem',
        },
        ol: 'rich-text-ol',
        ul: 'rich-text-ul',
        listitem: 'rich-text-listitem',
      },
    },
    nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, LinkNode],
    onError: (error: Error) => {
      console.error('Lexical error:', error)
    },
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        style={{
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          overflow: 'hidden',
          ...style,
        }}
        className="rich-text-container"
      >
        <ToolbarPlugin />
        <div style={{ position: 'relative' }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                style={{
                  minHeight,
                  padding: '8px 12px',
                  outline: 'none',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              />
            }
            placeholder={
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 12,
                  color: '#bfbfbf',
                  pointerEvents: 'none',
                  fontSize: 14,
                }}
              >
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <DefaultValuePlugin value={value} />
          <InnerEditor onChange={onChange} />
        </div>
      </div>
    </LexicalComposer>
  )
}

/**
 * 富文本编辑器
 *
 * 对外暴露的唯一编辑器组件
 * 业务模块不应直接导入 Lexical
 *
 * 用法：
 * <RichTextEditor
 *   value={json}
 *   onChange={setJson}
 *   toolbar={['bold', 'italic', 'heading']}
 *   uploader={activeStorageUploader}
 * />
 */
import '../styles/editor.css'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table'
import { CodeNode } from '@lexical/code'
import {
  HEADING,
  QUOTE,
  CODE,
  UNORDERED_LIST,
  ORDERED_LIST,
  BOLD_ITALIC_STAR,
  BOLD_STAR,
  ITALIC_STAR,
  STRIKETHROUGH,
  INLINE_CODE,
  LINK,
} from '@lexical/markdown'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $getSelection, $isRangeSelection } from 'lexical'
import { useEffect, useRef, useState } from 'react'
import type { EditorState, LexicalEditor } from 'lexical'
import type {
  EditorContent,
  EditorConfig,
  ToolbarConfig,
  UploadAdapter,
  Plugin,
  EditorTheme,
} from '../types'
import Toolbar from './toolbar/Toolbar'
import { parseToolbarConfig } from '../toolbar/ToolbarPlugin'
import { serializeEditorState, deserializeEditorState, EMPTY_STATE } from '../serializer/lexical'
import { ImageNode } from './plugins/image/ImageNode'
import { ImagePluginComponent } from './plugins/image'
import { LinkPluginComponent } from './plugins/link'
import { TablePluginComponent } from './plugins/table'
import { CodeBlockPluginComponent } from './plugins/code-block'
import { SlashCommandsPluginComponent } from './plugins/slash-commands'
import { MermaidNode } from './plugins/mermaid'
import { MermaidPluginComponent } from './plugins/mermaid'
import { MathNode } from './plugins/math'
import { MathPluginComponent } from './plugins/math'
import { VideoNode } from './plugins/video'
import { VideoPluginComponent } from './plugins/video'
import { AttachmentNode } from './plugins/attachment'
import { AttachmentPluginComponent } from './plugins/attachment'
import { MentionNode } from './plugins/mention'
import { MentionPluginComponent } from './plugins/mention'
import { EmojiPluginComponent } from './plugins/emoji'

// ==================== 内部插件 ====================

/** 同步外部值到编辑器 */
function InitialValuePlugin({ value }: { value?: EditorContent }) {
  const [editor] = useLexicalComposerContext()
  const isInit = useRef(false)

  useEffect(() => {
    if (!isInit.current && value && value !== '{}') {
      const state = deserializeEditorState(value)
      if (state) {
        editor.setEditorState(editor.parseEditorState(state))
      }
      isInit.current = true
    }
  }, [editor, value])

  return null
}

/** 内容变化监听 */
function ChangePlugin({ onChange }: { onChange?: (content: EditorContent) => void }) {
  const [editor] = useLexicalComposerContext()

  const handleChange = (editorState: EditorState, _editor: LexicalEditor) => {
    editorState.read(() => {
      const json = serializeEditorState(editorState.toJSON())
      onChange?.(json)
    })
  }

  return <OnChangePlugin onChange={handleChange} />
}

/** 字数限制插件 */
function MaxLengthPlugin({ maxLength }: { maxLength?: number }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!maxLength) return

    const removeListener = editor.registerTextContentListener((textContent) => {
      if (textContent.length > maxLength) {
        editor.update(() => {
          const root = $getRoot()
          const text = root.getTextContent()
          if (text.length > maxLength) {
            root.selectStart()
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              // Truncate by deleting excess characters from end
              const excess = text.length - maxLength
              for (let i = 0; i < excess; i++) {
                selection.deleteForward(true)
              }
            }
          }
        })
      }
    })

    return () => removeListener()
  }, [editor, maxLength])

  return null
}

// ==================== 编辑器组件 ====================

/** 编辑器属性 */
export interface RichTextEditorProps {
  /** 内容（Lexical JSON） */
  value?: EditorContent
  /** 内容变化回调 */
  onChange?: (content: EditorContent) => void
  /** 工具栏配置 */
  toolbar?: ToolbarConfig
  /** 上传适配器 */
  uploader?: UploadAdapter
  /** 占位符 */
  placeholder?: string
  /** 是否只读 */
  readOnly?: boolean
  /** 自动聚焦 */
  autoFocus?: boolean
  /** 最大字数 */
  maxLength?: number
  /** 主题 */
  theme?: EditorTheme
  /** 插件列表 */
  plugins?: Plugin[]
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 自定义类名 */
  className?: string
  /** 错误回调 */
  onError?: (error: Error) => void
}

export default function RichTextEditor({
  value,
  onChange,
  toolbar = ['bold', 'italic', 'underline', 'heading', 'quote', 'bullet-list', 'numbered-list', 'link', 'image'],
  uploader,
  placeholder = '请输入内容...',
  readOnly = false,
  maxLength,
  plugins = [],
  style,
  className,
  onError,
}: RichTextEditorProps) {
  // Lexical 初始配置
  const initialConfig = {
    namespace: 'ZenContentEditor',
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
    nodes: [
      HeadingNode, ListNode, ListItemNode, QuoteNode, LinkNode, ImageNode,
      TableNode, TableRowNode, TableCellNode, CodeNode,
      MermaidNode, MathNode, VideoNode, AttachmentNode, MentionNode,
    ],
    editable: !readOnly,
    editorState: value ? undefined : EMPTY_STATE,
    onError: (error: Error) => {
      console.error('Lexical error:', error)
      onError?.(error)
    },
  }

  // 解析工具栏配置
  const toolbarConfig = toolbar === false ? [] : parseToolbarConfig(Array.isArray(toolbar) ? toolbar : [])

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className={className}
        style={{
          border: '1px solid var(--ant-color-border)',
          borderRadius: 'var(--ant-border-radius)',
          overflow: 'hidden',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          ...style,
        }}
      >
        {/* 工具栏 */}
        {toolbar !== false && toolbarConfig.length > 0 && (
          <Toolbar config={toolbarConfig} disabled={readOnly} />
        )}

        {/* 编辑区 */}
        <div style={{ position: 'relative' }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                style={{
                  minHeight: 200,
                  padding: '12px 16px',
                  outline: 'none',
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              />
            }
            placeholder={
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 16,
                  color: 'var(--ant-color-text-tertiary)',
                  pointerEvents: 'none',
                  fontSize: 14,
                }}
              >
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />

          {/* 内置插件 */}
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={[
            HEADING,
            QUOTE,
            CODE,
            UNORDERED_LIST,
            ORDERED_LIST,
            BOLD_ITALIC_STAR,
            BOLD_STAR,
            ITALIC_STAR,
            STRIKETHROUGH,
            INLINE_CODE,
            LINK,
          ]} />
          <InitialValuePlugin value={value} />
          <ChangePlugin onChange={onChange} />
          <MaxLengthPlugin maxLength={maxLength} />

          {/* 图片插件 */}
          <ImagePluginComponent config={{ uploader, maxWidth: 800 }} />

          {/* 链接插件 */}
          <LinkPluginComponent />

          {/* 表格插件 */}
          <TablePluginComponent />

          {/* 代码块插件 */}
          <CodeBlockPluginComponent />

          {/* 斜杠命令插件 */}
          <SlashCommandsPluginComponent />

          {/* Mermaid 图表插件 */}
          <MermaidPluginComponent />

          {/* 数学公式插件 */}
          <MathPluginComponent />

          {/* 视频插件 */}
          <VideoPluginComponent />

          {/* 附件插件 */}
          <AttachmentPluginComponent config={{ uploader }} />

          {/* @提及插件 */}
          <MentionPluginComponent />

          {/* 表情插件 */}
          <EmojiPluginComponent />

          {/* 业务插件 */}
          {plugins.map((plugin) => plugin.renderUI?.())}
        </div>
      </div>
    </LexicalComposer>
  )
}

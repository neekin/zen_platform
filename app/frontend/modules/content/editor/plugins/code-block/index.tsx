/**
 * Code Block Plugin
 *
 * 功能：
 * - 插入代码块
 * - 语言选择
 * - 语法高亮（可选）
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createCodeNode, CodeNode } from '@lexical/code'
import { $getSelection, $isRangeSelection } from 'lexical'
import { $setBlocksType } from '@lexical/selection'
import { CodeOutlined } from '@ant-design/icons'
import { useState, useCallback, useEffect } from 'react'
import { createPlugin } from '../factory'
import type { PluginContext } from '@/../types'
import { toolbarRegistry } from '@/../toolbar/ToolbarRegistry'

/** Code Block 插件配置 */
export interface CodeBlockPluginConfig {
  /** 支持的语言列表 */
  languages?: string[]
}

/** 默认支持的语言 */
const DEFAULT_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'sql',
  'html',
  'css',
  'json',
  'yaml',
  'markdown',
  'bash',
  'shell',
  'plaintext',
]

// 显示语言选择器函数引用
let showLanguagePickerFn: (() => void) | null = null

// 自注册工具栏项
toolbarRegistry.register({
  id: 'code-block',
  label: '代码块',
  icon: <CodeOutlined />,
  group: 'block',
  execute: () => {
    if (showLanguagePickerFn) {
      showLanguagePickerFn()
    }
  },
})

/** 语言选择器组件 */
function LanguagePickerDialog({
  open,
  languages,
  onConfirm,
  onCancel,
}: {
  open: boolean
  languages: string[]
  onConfirm: (language: string) => void
  onCancel: () => void
}) {
  const [search, setSearch] = useState('')

  const filteredLanguages = languages.filter((lang) =>
    lang.toLowerCase().includes(search.toLowerCase()),
  )

  if (!open) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        zIndex: 1000,
        width: 200,
        maxHeight: 300,
        background: 'var(--ant-color-bg-elevated)',
        border: '1px solid var(--ant-color-border)',
        borderRadius: 'var(--ant-border-radius)',
        boxShadow: 'var(--ant-box-shadow-secondary)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--ant-color-border)' }}>
        <input
          type="text"
          placeholder="搜索语言..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '1px solid var(--ant-color-border)',
            borderRadius: 'var(--ant-border-radius)',
            outline: 'none',
            fontSize: 12,
          }}
          autoFocus
        />
      </div>
      <div style={{ maxHeight: 250, overflowY: 'auto' }}>
        {filteredLanguages.map((lang) => (
          <div
            key={lang}
            onClick={() => onConfirm(lang)}
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 12,
              hover: {
                background: 'var(--ant-color-bg-text-hover)',
              },
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--ant-color-bg-text-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {lang}
          </div>
        ))}
        {filteredLanguages.length === 0 && (
          <div style={{ padding: '6px 12px', fontSize: 12, color: 'var(--ant-color-text-secondary)' }}>
            未找到匹配语言
          </div>
        )}
      </div>
    </div>
  )
}

/** Code Block Plugin React 组件 */
export function CodeBlockPluginComponent({ config }: { config?: CodeBlockPluginConfig }) {
  const [editor] = useLexicalComposerContext()
  const [pickerOpen, setPickerOpen] = useState(false)
  const languages = config?.languages || DEFAULT_LANGUAGES

  // 注册显示语言选择器的函数
  useEffect(() => {
    showLanguagePickerFn = () => {
      setPickerOpen(true)
    }
    return () => {
      showLanguagePickerFn = null
    }
  }, [])

  // 处理确认插入代码块
  const handleConfirm = useCallback(
    (language: string) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createCodeNode(language))
        }
      })
      setPickerOpen(false)
    },
    [editor],
  )

  return (
    <LanguagePickerDialog
      open={pickerOpen}
      languages={languages}
      onConfirm={handleConfirm}
      onCancel={() => setPickerOpen(false)}
    />
  )
}

export const codeBlockPlugin = createPlugin({
  id: 'code-block',
  name: '代码块',
  version: '1.0.0',
  toolbarItems: [
    { id: 'code-block', label: '代码块', group: 'block', execute: () => {} },
  ],
  commands: [
    {
      id: 'code-block:insert',
      label: '插入代码块',
      execute: (context: PluginContext, payload?: { language?: string }) => {
        const editor = context.getEditor() as any
        const language = payload?.language || 'plaintext'
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createCodeNode(language))
          }
        })
      },
    },
  ],
  shortcuts: [],
})

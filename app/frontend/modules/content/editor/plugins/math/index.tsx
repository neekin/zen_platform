/**
 * Math Formula Plugin
 *
 * 功能：
 * - 插入数学公式
 * - 支持行内和块级公式
 * - 使用 KaTeX 渲染
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { DecoratorNode, DOMExportOutput, LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical'
import { $insertNodes, $getSelection, $isRangeSelection, createCommand, COMMAND_PRIORITY_LOW } from 'lexical'
import { useState, useCallback, useEffect, useRef } from 'react'
import { createPlugin } from '../factory'
import type { PluginContext } from '@/../types'
import { toolbarRegistry } from '@/../toolbar/ToolbarRegistry'

/** Math 节点序列化类型 */
export type SerializedMathNode = Spread<
  {
    type: 'math'
    version: 1
    formula: string
    displayMode: boolean
  },
  SerializedLexicalNode
>

/** KaTeX 渲染组件 */
function MathComponent({
  nodeKey,
  formula,
  displayMode,
  editor,
}: {
  nodeKey: NodeKey
  formula: string
  displayMode: boolean
  editor: LexicalEditor
}) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormula, setEditFormula] = useState(formula)

  // 渲染 KaTeX 公式
  useEffect(() => {
    if (!containerRef.current || isEditing) return

    const renderFormula = async () => {
      try {
        const katex = (await import('katex')).default
        katex.render(formula, containerRef.current!, {
          displayMode,
          throwOnError: false,
          trust: true,
        })
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : '公式渲染失败')
      }
    }

    renderFormula()
  }, [formula, displayMode, isEditing])

  // 保存编辑
  const handleSave = useCallback(() => {
    editor.update(() => {
      const { $getNodeByKey } = require('lexical')
      const node = $getNodeByKey(nodeKey)
      if (node instanceof MathNode) {
        node.setFormula(editFormula)
      }
    })
    setIsEditing(false)
  }, [editor, nodeKey, editFormula])

  // 取消编辑
  const handleCancel = useCallback(() => {
    setEditFormula(formula)
    setIsEditing(false)
  }, [formula])

  if (isEditing) {
    return (
      <span style={{ display: 'inline-block', border: '1px solid var(--ant-color-border)', borderRadius: 'var(--ant-border-radius)', padding: 4 }}>
        <input
          type="text"
          value={editFormula}
          onChange={(e) => setEditFormula(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            fontFamily: 'monospace',
            fontSize: displayMode ? 14 : 13,
            width: Math.max(100, editFormula.length * 8),
          }}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave()
            } else if (e.key === 'Escape') {
              handleCancel()
            }
          }}
        />
        <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--ant-color-text-secondary)' }}>
          Enter 保存 | Esc 取消
        </span>
      </span>
    )
  }

  return (
    <span
      ref={containerRef}
      style={{
        cursor: 'pointer',
        padding: displayMode ? '8px 0' : '0 2px',
        display: displayMode ? 'block' : 'inline',
        textAlign: displayMode ? 'center' : 'inherit',
      }}
      onClick={() => setIsEditing(true)}
      title="点击编辑公式"
    />
  )
}

/** Math 节点 */
export class MathNode extends DecoratorNode<JSX.Element> {
  __formula: string
  __displayMode: boolean

  static getType(): string {
    return 'math'
  }

  static clone(node: MathNode): MathNode {
    return new MathNode(node.__formula, node.__displayMode, node.__key)
  }

  constructor(formula: string, displayMode: boolean = false, key?: NodeKey) {
    super(key)
    this.__formula = formula
    this.__displayMode = displayMode
  }

  getFormula(): string {
    return this.__formula
  }

  setFormula(formula: string): void {
    const writable = this.getWritable()
    writable.__formula = formula
  }

  getDisplayMode(): boolean {
    return this.__displayMode
  }

  setDisplayMode(displayMode: boolean): void {
    const writable = this.getWritable()
    writable.__displayMode = displayMode
  }

  createDOM(): HTMLElement {
    const element = document.createElement('span')
    element.style.display = this.__displayMode ? 'block' : 'inline'
    return element
  }

  updateDOM(): false {
    return false
  }

  exportJSON(): SerializedMathNode {
    return {
      type: 'math',
      version: 1,
      formula: this.__formula,
      displayMode: this.__displayMode,
    }
  }

  static importJSON(serializedNode: SerializedMathNode): MathNode {
    return new MathNode(serializedNode.formula, serializedNode.displayMode)
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement(this.__displayMode ? 'div' : 'span')
    element.className = this.__displayMode ? 'zen-math-block' : 'zen-math-inline'
    element.setAttribute('data-formula', this.__formula)
    return { element }
  }

  static importDOM(): any {
    return {
      'span,div': (element: HTMLElement) => {
        if (element.classList.contains('zen-math-block') || element.classList.contains('zen-math-inline')) {
          return {
            conversion: (element: HTMLElement) => {
              const formula = element.getAttribute('data-formula') || ''
              const displayMode = element.classList.contains('zen-math-block')
              return { node: new MathNode(formula, displayMode) }
            },
            priority: 0,
          }
        }
        return null
      },
    }
  }

  decorate(): JSX.Element {
    return <MathComponent nodeKey={this.__key} formula={this.__formula} displayMode={this.__displayMode} editor={this.getEditor()} />
  }
}

/** 创建 Math 节点 */
export function $createMathNode(formula: string, displayMode?: boolean): MathNode {
  return new MathNode(formula, displayMode)
}

/** 判断是否为 Math 节点 */
export function $isMathNode(node: any): node is MathNode {
  return node instanceof MathNode
}

/** 插入 Math 命令 */
export const INSERT_MATH_COMMAND = createCommand<{ formula: string; displayMode?: boolean }>('INSERT_MATH_COMMAND')

/** Math 对话框组件 */
function MathDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean
  onConfirm: (formula: string, displayMode: boolean) => void
  onCancel: () => void
}) {
  const [formula, setFormula] = useState('')
  const [displayMode, setDisplayMode] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // 预览公式
  useEffect(() => {
    if (!previewRef.current || !formula) return

    const renderPreview = async () => {
      try {
        const katex = (await import('katex')).default
        katex.render(formula, previewRef.current!, {
          displayMode,
          throwOnError: false,
        })
      } catch {
        if (previewRef.current) {
          previewRef.current.innerHTML = '<span style="color: var(--ant-color-error)">公式语法错误</span>'
        }
      }
    }

    renderPreview()
  }, [formula, displayMode])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--ant-color-bg-elevated)',
          borderRadius: 'var(--ant-border-radius-lg)',
          padding: 24,
          width: 500,
          maxWidth: '90vw',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>插入数学公式</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>LaTeX 公式</label>
          <textarea
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            style={{
              width: '100%',
              minHeight: 80,
              padding: 12,
              border: '1px solid var(--ant-color-border)',
              borderRadius: 'var(--ant-border-radius)',
              fontFamily: 'monospace',
              fontSize: 13,
              resize: 'vertical',
            }}
            placeholder="E = mc^2"
            autoFocus
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={displayMode}
              onChange={(e) => setDisplayMode(e.target.checked)}
            />
            <span style={{ fontSize: 13 }}>块级公式（独立一行）</span>
          </label>
        </div>
        {formula && (
          <div style={{ marginBottom: 16, padding: 12, background: 'var(--ant-color-bg-secondary)', borderRadius: 'var(--ant-border-radius)' }}>
            <div style={{ fontSize: 12, color: 'var(--ant-color-text-secondary)', marginBottom: 8 }}>预览</div>
            <div ref={previewRef} style={{ textAlign: displayMode ? 'center' : 'left' }} />
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 16px', cursor: 'pointer' }}>取消</button>
          <button
            onClick={() => onConfirm(formula, displayMode)}
            disabled={!formula.trim()}
            style={{
              padding: '8px 16px',
              cursor: formula.trim() ? 'pointer' : 'not-allowed',
              background: formula.trim() ? 'var(--ant-color-primary)' : 'var(--ant-color-bg-secondary)',
              color: formula.trim() ? '#fff' : 'var(--ant-color-text-secondary)',
              border: 'none',
              borderRadius: 'var(--ant-border-radius)',
            }}
          >
            插入
          </button>
        </div>
      </div>
    </div>
  )
}

// 显示对话框函数引用
let showMathDialogFn: (() => void) | null = null

// 自注册工具栏项
toolbarRegistry.register({
  id: 'math',
  label: '数学公式',
  icon: <span style={{ fontSize: 14, fontStyle: 'italic' }}>∑</span>,
  group: 'insert',
  execute: () => {
    if (showMathDialogFn) {
      showMathDialogFn()
    }
  },
})

/** Math Plugin React 组件 */
export function MathPluginComponent() {
  const [editor] = useLexicalComposerContext()
  const [dialogOpen, setDialogOpen] = useState(false)

  // 注册显示对话框的函数
  useEffect(() => {
    showMathDialogFn = () => setDialogOpen(true)
    return () => {
      showMathDialogFn = null
    }
  }, [])

  // 注册插入命令
  useEffect(() => {
    return editor.registerCommand(
      INSERT_MATH_COMMAND,
      (payload) => {
        const { formula, displayMode } = payload as { formula: string; displayMode?: boolean }
        const mathNode = $createMathNode(formula, displayMode)
        $insertNodes([mathNode])
        return true
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor])

  // 处理确认
  const handleConfirm = useCallback(
    (formula: string, displayMode: boolean) => {
      editor.dispatchCommand(INSERT_MATH_COMMAND, { formula, displayMode })
      setDialogOpen(false)
    },
    [editor],
  )

  return (
    <MathDialog
      open={dialogOpen}
      onConfirm={handleConfirm}
      onCancel={() => setDialogOpen(false)}
    />
  )
}

export const mathPlugin = createPlugin({
  id: 'math',
  name: '数学公式',
  version: '1.0.0',
  toolbarItems: [
    { id: 'math', label: '数学公式', group: 'insert', execute: () => {} },
  ],
  commands: [
    {
      id: 'math:insert',
      label: '插入数学公式',
      execute: (context: PluginContext, payload?: { formula: string; displayMode?: boolean }) => {
        const editor = context.getEditor() as any
        if (payload?.formula) {
          editor.dispatchCommand(INSERT_MATH_COMMAND, payload)
        }
      },
    },
  ],
  shortcuts: [],
})

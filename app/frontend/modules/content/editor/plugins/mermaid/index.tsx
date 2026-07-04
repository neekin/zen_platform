/**
 * Mermaid Chart Plugin
 *
 * 功能：
 * - 插入 Mermaid 图表
 * - 实时预览
 * - 支持多种图表类型
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { DecoratorNode, DOMExportOutput, LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical'
import { $insertNodes, $getSelection, $isRangeSelection, createCommand, COMMAND_PRIORITY_LOW } from 'lexical'
import { useState, useCallback, useEffect, useRef } from 'react'
import { createPlugin } from '../factory'
import type { PluginContext } from '@/../types'
import { toolbarRegistry } from '@/../toolbar/ToolbarRegistry'

/** Mermaid 节点序列化类型 */
export type SerializedMermaidNode = Spread<
  {
    type: 'mermaid'
    version: 1
    code: string
    caption?: string
  },
  SerializedLexicalNode
>

/** Mermaid 图表组件 */
function MermaidComponent({
  nodeKey,
  code,
  caption,
  editor,
}: {
  nodeKey: NodeKey
  code: string
  caption?: string
  editor: LexicalEditor
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editCode, setEditCode] = useState(code)

  // 渲染 Mermaid 图表
  useEffect(() => {
    if (!containerRef.current || isEditing) return

    const renderChart = async () => {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
        })

        const id = `mermaid-${nodeKey}-${Date.now()}`
        const { svg } = await mermaid.render(id, code)
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
          setError(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '图表渲染失败')
      }
    }

    renderChart()
  }, [code, nodeKey, isEditing])

  // 保存编辑
  const handleSave = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node instanceof MermaidNode) {
        node.setCode(editCode)
      }
    })
    setIsEditing(false)
  }, [editor, nodeKey, editCode])

  // 取消编辑
  const handleCancel = useCallback(() => {
    setEditCode(code)
    setIsEditing(false)
  }, [code])

  if (isEditing) {
    return (
      <div style={{ margin: '16px 0', border: '1px solid var(--ant-color-border)', borderRadius: 'var(--ant-border-radius)' }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--ant-color-border)', background: 'var(--ant-color-bg-secondary)' }}>
          <span style={{ fontSize: 12, color: 'var(--ant-color-text-secondary)' }}>编辑 Mermaid 图表</span>
        </div>
        <textarea
          value={editCode}
          onChange={(e) => setEditCode(e.target.value)}
          style={{
            width: '100%',
            minHeight: 150,
            padding: 12,
            border: 'none',
            resize: 'vertical',
            fontFamily: 'monospace',
            fontSize: 13,
            outline: 'none',
          }}
          autoFocus
        />
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--ant-color-border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={handleCancel} style={{ padding: '4px 12px', cursor: 'pointer' }}>取消</button>
          <button onClick={handleSave} style={{ padding: '4px 12px', cursor: 'pointer', background: 'var(--ant-color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--ant-border-radius)' }}>保存</button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        margin: '16px 0',
        padding: 16,
        border: '1px solid var(--ant-color-border)',
        borderRadius: 'var(--ant-border-radius)',
        background: 'var(--ant-color-bg-secondary)',
        cursor: 'pointer',
      }}
      onClick={() => setIsEditing(true)}
    >
      {error ? (
        <div style={{ color: 'var(--ant-color-error)', fontSize: 13 }}>
          <p>图表渲染失败:</p>
          <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{error}</pre>
          <p style={{ fontSize: 12, marginTop: 8, color: 'var(--ant-color-text-secondary)' }}>点击编辑修复语法</p>
        </div>
      ) : (
        <div ref={containerRef} style={{ textAlign: 'center' }} />
      )}
      {caption && (
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ant-color-text-secondary)', marginTop: 8 }}>
          {caption}
        </div>
      )}
    </div>
  )
}

/** 获取节点（辅助函数） */
function $getNodeByKey(key: NodeKey) {
  const { $getNodeByKey: getNodeByKey } = require('lexical')
  return getNodeByKey(key)
}

/** Mermaid 节点 */
export class MermaidNode extends DecoratorNode<JSX.Element> {
  __code: string
  __caption: string

  static getType(): string {
    return 'mermaid'
  }

  static clone(node: MermaidNode): MermaidNode {
    return new MermaidNode(node.__code, node.__caption, node.__key)
  }

  constructor(code: string, caption?: string, key?: NodeKey) {
    super(key)
    this.__code = code
    this.__caption = caption || ''
  }

  getCode(): string {
    return this.__code
  }

  setCode(code: string): void {
    const writable = this.getWritable()
    writable.__code = code
  }

  getCaption(): string {
    return this.__caption
  }

  setCaption(caption: string): void {
    const writable = this.getWritable()
    writable.__caption = caption
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div')
    div.style.display = 'block'
    return div
  }

  updateDOM(): false {
    return false
  }

  exportJSON(): SerializedMermaidNode {
    return {
      type: 'mermaid',
      version: 1,
      code: this.__code,
      caption: this.__caption,
    }
  }

  static importJSON(serializedNode: SerializedMermaidNode): MermaidNode {
    return new MermaidNode(serializedNode.code, serializedNode.caption)
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.className = 'zen-mermaid'
    element.setAttribute('data-code', this.__code)
    if (this.__caption) {
      element.setAttribute('data-caption', this.__caption)
    }
    return { element }
  }

  static importDOM(): any {
    return {
      div: (element: HTMLElement) => {
        if (element.classList.contains('zen-mermaid')) {
          return {
            conversion: (element: HTMLElement) => {
              const code = element.getAttribute('data-code') || ''
              const caption = element.getAttribute('data-caption') || ''
              return { node: new MermaidNode(code, caption) }
            },
            priority: 0,
          }
        }
        return null
      },
    }
  }

  decorate(): JSX.Element {
    return <MermaidComponent nodeKey={this.__key} code={this.__code} caption={this.__caption} editor={this.getEditor()} />
  }
}

/** 创建 Mermaid 节点 */
export function $createMermaidNode(code: string, caption?: string): MermaidNode {
  return new MermaidNode(code, caption)
}

/** 判断是否为 Mermaid 节点 */
export function $isMermaidNode(node: any): node is MermaidNode {
  return node instanceof MermaidNode
}

/** 插入 Mermaid 命令 */
export const INSERT_MERMAID_COMMAND = createCommand<{ code: string; caption?: string }>('INSERT_MERMAID_COMMAND')

/** Mermaid 对话框组件 */
function MermaidDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean
  onConfirm: (code: string, caption?: string) => void
  onCancel: () => void
}) {
  const [code, setCode] = useState(`graph TD
    A[开始] --> B{条件}
    B -->|是| C[执行]
    B -->|否| D[跳过]
    C --> E[结束]
    D --> E`)
  const [caption, setCaption] = useState('')

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
          width: 600,
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>插入 Mermaid 图表</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Mermaid 代码</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              width: '100%',
              minHeight: 200,
              padding: 12,
              border: '1px solid var(--ant-color-border)',
              borderRadius: 'var(--ant-border-radius)',
              fontFamily: 'monospace',
              fontSize: 13,
              resize: 'vertical',
            }}
            placeholder="graph TD&#10;    A[开始] --> B[结束]"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>图表说明（可选）</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--ant-color-border)',
              borderRadius: 'var(--ant-border-radius)',
            }}
            placeholder="图表说明"
          />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 16px', cursor: 'pointer' }}>取消</button>
          <button
            onClick={() => onConfirm(code, caption || undefined)}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              background: 'var(--ant-color-primary)',
              color: '#fff',
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
let showMermaidDialogFn: (() => void) | null = null

// 自注册工具栏项（使用自定义图标）
toolbarRegistry.register({
  id: 'mermaid',
  label: 'Mermaid 图表',
  icon: <span style={{ fontSize: 12, fontWeight: 'bold' }}>M</span>,
  group: 'insert',
  execute: () => {
    if (showMermaidDialogFn) {
      showMermaidDialogFn()
    }
  },
})

/** Mermaid Plugin React 组件 */
export function MermaidPluginComponent() {
  const [editor] = useLexicalComposerContext()
  const [dialogOpen, setDialogOpen] = useState(false)

  // 注册显示对话框的函数
  useEffect(() => {
    showMermaidDialogFn = () => setDialogOpen(true)
    return () => {
      showMermaidDialogFn = null
    }
  }, [])

  // 注册插入命令
  useEffect(() => {
    return editor.registerCommand(
      INSERT_MERMAID_COMMAND,
      (payload) => {
        const { code, caption } = payload as { code: string; caption?: string }
        const mermaidNode = $createMermaidNode(code, caption)
        $insertNodes([mermaidNode])
        return true
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor])

  // 处理确认
  const handleConfirm = useCallback(
    (code: string, caption?: string) => {
      editor.dispatchCommand(INSERT_MERMAID_COMMAND, { code, caption })
      setDialogOpen(false)
    },
    [editor],
  )

  return (
    <MermaidDialog
      open={dialogOpen}
      onConfirm={handleConfirm}
      onCancel={() => setDialogOpen(false)}
    />
  )
}

export const mermaidPlugin = createPlugin({
  id: 'mermaid',
  name: 'Mermaid 图表',
  version: '1.0.0',
  toolbarItems: [
    { id: 'mermaid', label: 'Mermaid 图表', group: 'insert', execute: () => {} },
  ],
  commands: [
    {
      id: 'mermaid:insert',
      label: '插入 Mermaid 图表',
      execute: (context: PluginContext, payload?: { code: string; caption?: string }) => {
        const editor = context.getEditor() as any
        if (payload?.code) {
          editor.dispatchCommand(INSERT_MERMAID_COMMAND, payload)
        }
      },
    },
  ],
  shortcuts: [],
})

/**
 * Table Plugin
 *
 * 功能：
 * - 插入表格
 * - 编辑单元格
 * - 行列增删
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { TableNode, TableRowNode, TableCellNode, $createTableNodeWithDimensions, INSERT_TABLE_COMMAND } from '@lexical/table'
import { TableOutlined } from '@ant-design/icons'
import { useState, useCallback, useEffect } from 'react'
import { createPlugin } from '../factory'
import type { PluginContext } from '@/../types'
import { toolbarRegistry } from '@/../toolbar/ToolbarRegistry'

/** Table 插件配置 */
export interface TablePluginConfig {
  /** 默认行数 */
  defaultRows?: number
  /** 默认列数 */
  defaultColumns?: number
}

// 显示表格选择器函数引用
let showTablePickerFn: ((rows: number, cols: number) => void) | null = null

// 自注册工具栏项
toolbarRegistry.register({
  id: 'table',
  label: '表格',
  icon: <TableOutlined />,
  group: 'insert',
  execute: () => {
    // 显示表格尺寸选择器
    if (showTablePickerFn) {
      // 默认插入 3x3 表格
      showTablePickerFn(3, 3)
    }
  },
})

/** 表格尺寸选择器组件 */
function TablePickerDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean
  onConfirm: (rows: number, cols: number) => void
  onCancel: () => void
}) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [hoveredRow, setHoveredRow] = useState(0)
  const [hoveredCol, setHoveredCol] = useState(0)

  const handleCellHover = (r: number, c: number) => {
    setHoveredRow(r)
    setHoveredCol(c)
  }

  const handleCellClick = (r: number, c: number) => {
    onConfirm(r + 1, c + 1)
  }

  if (!open) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        zIndex: 1000,
        background: 'var(--ant-color-bg-elevated)',
        border: '1px solid var(--ant-color-border)',
        borderRadius: 'var(--ant-border-radius)',
        padding: 8,
        boxShadow: 'var(--ant-box-shadow-secondary)',
      }}
    >
      <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--ant-color-text-secondary)' }}>
        {hoveredRow + 1} x {hoveredCol + 1}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 20px)',
          gridTemplateRows: 'repeat(8, 20px)',
          gap: 2,
        }}
      >
        {Array.from({ length: 8 }, (_, r) =>
          Array.from({ length: 8 }, (_, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                width: 20,
                height: 20,
                border: '1px solid var(--ant-color-border)',
                borderRadius: 2,
                background:
                  r <= hoveredRow && c <= hoveredCol
                    ? 'var(--ant-color-primary-bg)'
                    : 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={() => handleCellHover(r, c)}
              onClick={() => handleCellClick(r, c)}
            />
          )),
        )}
      </div>
    </div>
  )
}

/** Table Plugin React 组件 */
export function TablePluginComponent({ config }: { config?: TablePluginConfig }) {
  const [editor] = useLexicalComposerContext()
  const [pickerOpen, setPickerOpen] = useState(false)

  // 注册显示表格选择器的函数
  useEffect(() => {
    showTablePickerFn = (rows: number, cols: number) => {
      setPickerOpen(true)
    }
    return () => {
      showTablePickerFn = null
    }
  }, [])

  // 处理确认插入表格
  const handleConfirm = useCallback(
    (rows: number, cols: number) => {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows, columns: cols })
      setPickerOpen(false)
    },
    [editor],
  )

  // 注册表格相关命令
  useEffect(() => {
    // 注册插入表格命令
    const removeInsertCommand = editor.registerCommand(
      INSERT_TABLE_COMMAND,
      (payload) => {
        const { rows, columns } = payload as { rows: number; columns: number }
        editor.update(() => {
          const tableNode = $createTableNodeWithDimensions(rows, columns)
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            selection.insertNodes([tableNode])
          }
        })
        return true
      },
      0,
    )

    return () => {
      removeInsertCommand()
    }
  }, [editor])

  return (
    <TablePickerDialog
      open={pickerOpen}
      onConfirm={handleConfirm}
      onCancel={() => setPickerOpen(false)}
    />
  )
}

// 需要导入这些
import { $getSelection, $isRangeSelection } from 'lexical'

export const tablePlugin = createPlugin({
  id: 'table',
  name: '表格',
  version: '1.0.0',
  toolbarItems: [
    { id: 'table', label: '表格', group: 'insert', execute: () => {} },
  ],
  commands: [
    {
      id: 'table:insert',
      label: '插入表格',
      execute: (context: PluginContext, payload?: { rows?: number; columns?: number }) => {
        const editor = context.getEditor() as any
        const rows = payload?.rows || 3
        const columns = payload?.columns || 3
        editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows, columns })
      },
    },
  ],
  shortcuts: [],
})

/**
 * 工具栏组件
 *
 * 设计原则：
 * - 使用 Ant Design 6 Design Token
 * - 支持 Light/Dark 主题
 * - 可配置项
 * - 使用注册表动态获取图标和执行命令
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Button, Space, Tooltip } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import type { ToolbarItemId, ToolbarGroup } from '../../types'
import { parseToolbarConfig } from '../../toolbar/ToolbarPlugin'
import { toolbarRegistry } from '../../toolbar/ToolbarRegistry'
import TextFormatToolbar from './TextFormatToolbar'

/** 工具栏属性 */
interface ToolbarProps {
  /** 工具栏配置 */
  config: ToolbarGroup[]
  /** 是否禁用 */
  disabled?: boolean
}

export default function Toolbar({ config, disabled }: ToolbarProps) {
  const [editor] = useLexicalComposerContext()
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())

  // 监听格式变化
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        // 获取当前格式状态
        // 这里简化实现，实际需要检查选区的格式
      })
    })
  }, [editor])

  // 执行工具栏命令
  const executeCommand = useCallback(
    (id: ToolbarItemId) => {
      const item = toolbarRegistry.getItem(id)
      if (item) {
        item.execute(editor)
      } else {
        console.warn(`Toolbar item not found: ${id}`)
      }
    },
    [editor],
  )

  // 渲染工具栏项
  const renderItem = (id: ToolbarItemId) => {
    const item = toolbarRegistry.getItem(id)
    if (!item) return null

    const isActive = activeFormats.has(id)

    return (
      <Tooltip key={id} title={item.shortcut ? `${item.label} (${item.shortcut})` : item.label}>
        <Button
          type="text"
          size="small"
          icon={item.icon}
          disabled={disabled}
          style={isActive ? { background: 'var(--ant-color-primary-bg)' } : undefined}
          onClick={() => executeCommand(id)}
        />
      </Tooltip>
    )
  }

  const groups = parseToolbarConfig(config)

  return (
    <div
      style={{
        borderBottom: '1px solid var(--ant-color-border)',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      {groups.map((group, index) => (
        <span key={group.id}>
          {index > 0 && (
            <span
              style={{
                display: 'inline-block',
                width: 1,
                height: 20,
                margin: '0 4px',
                background: 'var(--ant-color-border)',
              }}
            />
          )}
          <Space size={2}>
            {group.items.map((id) => renderItem(id))}
          </Space>
        </span>
      ))}

      {/* 文本样式工具栏（颜色、字号） */}
      <span
        style={{
          display: 'inline-block',
          width: 1,
          height: 20,
          margin: '0 4px',
          background: 'var(--ant-color-border)',
        }}
      />
      <TextFormatToolbar />
    </div>
  )
}

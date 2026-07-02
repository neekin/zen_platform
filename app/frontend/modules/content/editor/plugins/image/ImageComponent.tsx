/**
 * Image 组件
 *
 * 图片渲染组件，支持：
 * - 缩放
 * - 对齐
 * - 标题编辑
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { useState, useRef, useCallback, useEffect } from 'react'
import { ImageNode } from './ImageNode'
import type { NodeKey } from 'lexical'

interface ImageComponentProps {
  src: string
  alt: string
  width: number
  height: number
  alignment: 'left' | 'center' | 'right'
  caption: string
  nodeKey: NodeKey
}

export function ImageComponent({
  src,
  alt,
  width,
  height,
  alignment,
  caption,
  nodeKey,
}: ImageComponentProps) {
  const [editor] = useLexicalComposerContext()
  const [isResizing, setIsResizing] = useState(false)
  const [currentWidth, setCurrentWidth] = useState(width)
  const imageRef = useRef<HTMLImageElement>(null)
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null)

  // 更新节点属性
  const updateNode = useCallback(
    (updates: Partial<{ width: number; height: number; alignment: string; caption: string }>) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if (node instanceof ImageNode) {
          if (updates.width !== undefined) node.setWidth(updates.width)
          if (updates.height !== undefined) node.setHeight(updates.height)
          if (updates.alignment !== undefined) node.setAlignment(updates.alignment as 'left' | 'center' | 'right')
          if (updates.caption !== undefined) node.setCaption(updates.caption)
        }
      })
    },
    [editor, nodeKey],
  )

  // 开始缩放
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    resizeStartRef.current = {
      x: e.clientX,
      width: currentWidth,
    }
  }, [currentWidth])

  // 缩放中
  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return
      const diff = e.clientX - resizeStartRef.current.x
      const newWidth = Math.max(100, Math.min(800, resizeStartRef.current.width + diff))
      setCurrentWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      if (resizeStartRef.current) {
        updateNode({ width: currentWidth })
      }
      resizeStartRef.current = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, currentWidth, updateNode])

  // 对齐按钮
  const alignmentButtons = [
    { value: 'left', label: '左对齐' },
    { value: 'center', label: '居中' },
    { value: 'right', label: '右对齐' },
  ] as const

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
        margin: '8px 0',
        position: 'relative',
      }}
    >
      {/* 图片容器 */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          style={{
            width: currentWidth,
            height: 'auto',
            borderRadius: 4,
            cursor: 'pointer',
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+'
          }}
        />

        {/* 缩放手柄 */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 8,
            cursor: 'ew-resize',
            background: isResizing ? 'var(--ant-color-primary)' : 'transparent',
            transition: 'background 0.2s',
          }}
          onMouseDown={handleResizeStart}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            cursor: 'ew-resize',
            background: isResizing ? 'var(--ant-color-primary)' : 'transparent',
            transition: 'background 0.2s',
          }}
          onMouseDown={handleResizeStart}
        />
      </div>

      {/* 标题 */}
      <input
        type="text"
        value={caption}
        onChange={(e) => updateNode({ caption: e.target.value })}
        placeholder="添加图片标题..."
        style={{
          marginTop: 4,
          padding: '2px 4px',
          border: 'none',
          background: 'transparent',
          color: 'var(--ant-color-text-secondary)',
          fontSize: 12,
          textAlign: alignment,
          width: currentWidth,
          outline: 'none',
        }}
      />

      {/* 对齐按钮（悬浮） */}
      <div
        style={{
          position: 'absolute',
          top: -32,
          right: 0,
          display: 'flex',
          gap: 4,
          background: 'var(--ant-color-bg-elevated)',
          borderRadius: 4,
          padding: 4,
          boxShadow: 'var(--ant-box-shadow-secondary)',
        }}
      >
        {alignmentButtons.map(({ value, label }) => (
          <button
            key={value}
            title={label}
            onClick={() => updateNode({ alignment: value })}
            style={{
              padding: '2px 6px',
              border: 'none',
              background: alignment === value ? 'var(--ant-color-primary)' : 'transparent',
              color: alignment === value ? '#fff' : 'var(--ant-color-text)',
              borderRadius: 2,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {value === 'left' ? '⫷' : value === 'center' ? '⫼' : '⫸'}
          </button>
        ))}
      </div>
    </div>
  )
}

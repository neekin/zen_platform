/**
 * 标签输入组件
 *
 * 支持输入标签、建议列表、远程搜索
 */
import { useState, useCallback, useRef } from 'react'
import { Select, Tag } from 'antd'
import type { SelectProps } from 'antd'

export interface TagInputProps {
  /** 值（标签列表） */
  value?: string[]
  /** 变化回调 */
  onChange?: (value: string[]) => void
  /** 建议列表 */
  suggestions?: string[]
  /** 远程搜索函数 */
  onSearch?: (query: string) => Promise<string[]>
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 最大标签数量 */
  maxCount?: number
}

export default function TagInput({
  value = [],
  onChange,
  suggestions = [],
  onSearch,
  placeholder = '输入标签',
  disabled = false,
  maxCount,
}: TagInputProps) {
  const [searchValue, setSearchValue] = useState('')
  const [options, setOptions] = useState<{ label: string; value: string }[]>([])
  const [loading, setLoading] = useState(false)

  // 处理搜索
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchValue(query)

      if (!query) {
        setOptions(suggestions.map((s) => ({ label: s, value: s })))
        return
      }

      // 本地过滤
      const filtered = suggestions.filter((s) =>
        s.toLowerCase().includes(query.toLowerCase()),
      )
      setOptions(filtered.map((s) => ({ label: s, value: s })))

      // 远程搜索
      if (onSearch) {
        setLoading(true)
        try {
          const results = await onSearch(query)
          setOptions(results.map((r) => ({ label: r, value: r })))
        } catch (error) {
          console.error('Tag search failed:', error)
        } finally {
          setLoading(false)
        }
      }
    },
    [suggestions, onSearch],
  )

  // 处理选择
  const handleChange = useCallback(
    (newValue: string[]) => {
      onChange?.(newValue)
      setSearchValue('')
    },
    [onChange],
  )

  // 处理输入确认（回车）
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && searchValue && !value.includes(searchValue)) {
        e.preventDefault()
        if (!maxCount || value.length < maxCount) {
          onChange?.([...value, searchValue])
          setSearchValue('')
        }
      }
    },
    [searchValue, value, maxCount, onChange],
  )

  // 渲染标签
  const tagRender: SelectProps['tagRender'] = (props) => {
    const { label, closable, onClose } = props
    return (
      <Tag
        closable={closable && !disabled}
        onClose={onClose}
        style={{ marginRight: 4 }}
      >
        {label}
      </Tag>
    )
  }

  return (
    <Select
      mode="tags"
      value={value}
      onChange={handleChange}
      onSearch={handleSearch}
      onKeyDown={handleKeyDown}
      options={options}
      loading={loading}
      placeholder={placeholder}
      disabled={disabled}
      tokenSeparators={[',']}
      style={{ width: '100%' }}
      tagRender={tagRender}
      maxCount={maxCount}
      showSearch
      filterOption={false}
    />
  )
}

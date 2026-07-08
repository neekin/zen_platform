import { Modal, Input, List, Typography, Spin, Empty } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import { useState, useEffect, useCallback, useRef } from 'react'

const { Text } = Typography

interface SearchResult {
  id: number
  model: string
  title: string
  subtitle: string
  url: string
}

interface MenuItem {
  title: string
  url: string
  icon: string
}

interface QuickAction {
  title: string
  url: string
  icon: string
  category: string
}

type CommandPaletteProps = {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<SearchResult[]>([])
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [actions, setActions] = useState<QuickAction[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<any>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setRecords([])
      setMenus([])
      setActions([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/admin/search?q=${encodeURIComponent(q)}`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      })
      if (res.ok) {
        const data = await res.json()
        setRecords(data.records || [])
        setMenus(data.menus || [])
        setActions(data.actions || [])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200)
    return () => clearTimeout(timer)
  }, [query, search])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const allItems = [...menus, ...actions, ...records]
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, allItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && allItems[activeIndex]) {
      e.preventDefault()
      handleSelect(allItems[activeIndex])
    }
  }

  const handleSelect = (item: any) => {
    if (item.url) {
      router.visit(item.url)
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      styles={{ body: { padding: 0 } }}
      closable={false}
      mask={{ closable: true }}
      style={{ top: 100 }}
    >
      <div onKeyDown={handleKeyDown}>
        <Input
          ref={inputRef}
          size="large"
          placeholder="搜索记录、页面、操作..."
          prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />}
          value={query}
          onChange={e => setQuery(e.target.value)}
          variant="borderless"
          style={{ padding: '16px 20px' }}
        />

        {loading && <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>}

        {!loading && query && allItems.length === 0 && (
          <Empty description="无匹配结果" style={{ padding: 24 }} />
        )}

        {!loading && (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {menus.length > 0 && (
              <List
                size="small"
                header={<Text type="secondary" style={{ fontSize: 12, padding: '0 20px' }}>页面</Text>}
                dataSource={menus}
                renderItem={(item, index) => (
                  <List.Item
                    style={{
                      padding: '10px 20px',
                      cursor: 'pointer',
                      background: activeIndex === index ? 'rgba(22,119,255,0.08)' : 'transparent',
                    }}
                    onClick={() => handleSelect(item)}
                  >
                    <Text>{item.title}</Text>
                  </List.Item>
                )}
              />
            )}
            {records.length > 0 && (
              <List
                size="small"
                header={<Text type="secondary" style={{ fontSize: 12, padding: '0 20px' }}>记录</Text>}
                dataSource={records}
                renderItem={(item, index) => (
                  <List.Item
                    style={{
                      padding: '10px 20px',
                      cursor: 'pointer',
                      background: activeIndex === menus.length + index ? 'rgba(22,119,255,0.08)' : 'transparent',
                    }}
                    onClick={() => handleSelect(item)}
                  >
                    <div>
                      <Text strong>{item.title}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.subtitle}</Text>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>
        )}

        <div style={{ padding: '8px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 16, fontSize: 12 }}>
          <Text type="secondary">↑↓ 导航</Text>
          <Text type="secondary">↵ 选择</Text>
          <Text type="secondary">Esc 关闭</Text>
        </div>
      </div>
    </Modal>
  )
}

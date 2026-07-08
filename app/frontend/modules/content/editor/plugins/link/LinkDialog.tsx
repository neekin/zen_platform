/**
 * Link 对话框组件
 *
 * 使用 Ant Design Modal 输入链接 URL
 */
import { useState, useEffect } from 'react'
import { DslModal } from '@/../../dsl'
import { Input, Space } from 'antd'

export type LinkDialogProps = {
  /** 是否显示 */
  open: boolean
  /** 初始 URL */
  initialUrl?: string
  /** 初始文本 */
  initialText?: string
  /** 确认回调 */
  onConfirm: (url: string, text?: string) => void
  /** 取消回调 */
  onCancel: () => void
}

export function LinkDialog({ open, initialUrl = '', initialText = '', onConfirm, onCancel }: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl)
  const [text, setText] = useState(initialText)

  useEffect(() => {
    if (open) {
      setUrl(initialUrl)
      setText(initialText)
    }
  }, [open, initialUrl, initialText])

  const handleOk = () => {
    if (url.trim()) {
      onConfirm(url.trim(), text.trim() || undefined)
    }
  }

  return (
    <DslModal
      title="插入链接"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okButtonProps={{ disabled: !url.trim() }}
      destroyOnHidden
      maxBodyHeight="calc(100vh - 300px)"
    >
      <Space orientation="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <div style={{ marginBottom: 4, fontSize: 14, color: 'var(--ant-color-text)' }}>链接地址</div>
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPressEnter={handleOk}
            autoFocus
          />
        </div>
        <div>
          <div style={{ marginBottom: 4, fontSize: 14, color: 'var(--ant-color-text)' }}>显示文本（可选）</div>
          <Input
            placeholder="链接文本"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPressEnter={handleOk}
          />
        </div>
      </Space>
    </DslModal>
  )
}

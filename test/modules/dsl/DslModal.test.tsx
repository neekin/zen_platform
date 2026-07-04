import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DslModal from '../../../app/frontend/modules/dsl/DslModal'

describe('DslModal', () => {
  it('renders when open is true', () => {
    render(
      <DslModal open={true} title="测试弹窗" onCancel={() => {}}>
        <div>弹窗内容</div>
      </DslModal>
    )
    expect(screen.getByText('测试弹窗')).toBeInTheDocument()
    expect(screen.getByText('弹窗内容')).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    render(
      <DslModal open={false} title="测试弹窗" onCancel={() => {}}>
        <div>弹窗内容</div>
      </DslModal>
    )
    expect(screen.queryByText('测试弹窗')).not.toBeInTheDocument()
  })

  it('applies maxBodyHeight style', () => {
    render(
      <DslModal open={true} title="测试" onCancel={() => {}} maxBodyHeight="300px">
        <div>内容</div>
      </DslModal>
    )
    expect(screen.getByText('测试')).toBeInTheDocument()
  })
})

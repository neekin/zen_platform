import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge from '@/modules/admin/components/display/StatusBadge'

describe('StatusBadge', () => {
  it('renders draft status with Chinese label', () => {
    render(<StatusBadge value="draft" />)
    expect(screen.getByText('草稿')).toBeInTheDocument()
  })

  it('renders published status with Chinese label', () => {
    render(<StatusBadge value="published" />)
    expect(screen.getByText('已发布')).toBeInTheDocument()
  })

  it('renders unknown status with raw value', () => {
    render(<StatusBadge value="custom" />)
    expect(screen.getByText('custom')).toBeInTheDocument()
  })
})

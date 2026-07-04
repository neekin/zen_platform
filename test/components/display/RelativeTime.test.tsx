import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RelativeTime from '@/modules/admin/components/display/RelativeTime'

describe('RelativeTime', () => {
  it('renders relative time for past date', () => {
    const pastDate = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    render(<RelativeTime value={pastDate} />)
    expect(screen.getByText(/前/)).toBeInTheDocument()
  })

  it('renders relative time for recent date', () => {
    const recentDate = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    render(<RelativeTime value={recentDate} />)
    expect(screen.getByText(/前/)).toBeInTheDocument()
  })
})

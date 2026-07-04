import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../../app/frontend/components/ErrorBoundary'

// Mock antd
vi.mock('antd', () => ({
  Result: ({ title, subTitle, extra }: any) => (
    <div data-testid="error-result">
      <h1>{title}</h1>
      <p>{subTitle}</p>
      <div>{extra}</div>
    </div>
  ),
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}))

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })

  it('renders error result when child throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const ThrowingComponent = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('error-result')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
    consoleSpy.mockRestore()
  })

  it('renders custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const ThrowingComponent = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
    consoleSpy.mockRestore()
  })
})

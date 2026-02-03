import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../src/App'

describe('Project Setup', () => {
  it('renders the app without crashing', () => {
    render(<App />)
    expect(screen.getByText(/GI Supervision Tracker/i)).toBeInTheDocument()
  })

  it('has Tailwind styles applied', () => {
    render(<App />)
    // Get the main heading (h1) specifically
    const heading = screen.getByRole('heading', { level: 1 })
    // Responsive styling uses text-xl on mobile, md:text-2xl on larger screens
    expect(heading).toHaveClass('font-bold')
  })
})

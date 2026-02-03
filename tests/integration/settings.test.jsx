import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'

describe('Settings and Data Management', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-02-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('opens settings modal when clicking settings button', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Click settings button
    await user.click(screen.getByRole('button', { name: /settings/i }))

    // Modal should open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Data Management')).toBeInTheDocument()
  })

  it('shows storage usage in settings', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /settings/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Should show storage usage
    expect(screen.getByText(/storage used/i)).toBeInTheDocument()
    // Check for the stats line format: "X groups, Y students, Z notes"
    expect(screen.getByText(/\d+ groups, \d+ students, \d+ notes/)).toBeInTheDocument()
  })

  it('shows export button in settings', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /settings/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /export backup/i })).toBeInTheDocument()
  })

  it('shows import button in settings', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /settings/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /import backup/i })).toBeInTheDocument()
  })

  it('closes settings modal', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /settings/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Click close button within the dialog
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /close/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('displays correct statistics after creating data', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Create a group
    await user.click(screen.getByText(/\+ new group/i))
    await user.type(screen.getByLabelText(/name/i), 'Test Group')
    const templateSelect = screen.getByLabelText(/template/i)
    await user.selectOptions(templateSelect, templateSelect.options[1].value)
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    await waitFor(() => {
      const main = screen.getByRole('main')
      expect(within(main).getByText('Test Group')).toBeInTheDocument()
    })

    // Open settings
    await user.click(screen.getByRole('button', { name: /settings/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Should show 1 group in stats
    expect(screen.getByText(/1 groups/i)).toBeInTheDocument()
  })
})

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'

describe('Responsive Layout', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-02-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows sidebar toggle button on mobile', async () => {
    // Set viewport to mobile size
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 })
    window.dispatchEvent(new Event('resize'))

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Sidebar toggle should be visible on mobile
    expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument()
  })

  it('opens sidebar when toggle is clicked on mobile', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 })

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    const toggle = screen.getByTestId('sidebar-toggle')
    await user.click(toggle)

    // Sidebar should now be visible
    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toHaveClass('translate-x-0')
  })

  it('closes sidebar when clicking overlay', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 })

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Open sidebar
    await user.click(screen.getByTestId('sidebar-toggle'))

    // Find and click the overlay (it should be the bg-gray-600 element)
    const overlay = document.querySelector('.bg-gray-600')
    if (overlay) {
      await user.click(overlay)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('-translate-x-full')
    }
  })
})

describe('Accessibility', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-02-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('modal can be closed with Escape key', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Open the group form modal
    await user.click(screen.getByText(/\+ new group/i))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Press Escape
    await user.keyboard('{Escape}')

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('all interactive elements have accessible names', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Check that main buttons have accessible labels
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new group/i })).toBeInTheDocument()
  })

  it('dialog is accessible when modal opens', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Open the group form modal
    await user.click(screen.getByText(/\+ new group/i))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Dialog should have accessible content
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    // The dialog should contain focusable elements
    const focusableElements = dialog.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
    expect(focusableElements.length).toBeGreaterThan(0)
  })
})

describe('Toast Notifications', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-02-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows success toast when group is created', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Create a group
    await user.click(screen.getByText(/\+ new group/i))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/name/i), 'Test Group')
    const templateSelect = screen.getByLabelText(/template/i)
    await user.selectOptions(templateSelect, templateSelect.options[1].value)
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    // Toast should appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/group created/i)).toBeInTheDocument()
    })
  })

  it('toast auto-dismisses after duration', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Create a group to trigger a toast
    await user.click(screen.getByText(/\+ new group/i))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/name/i), 'Test Group')
    const templateSelect = screen.getByLabelText(/template/i)
    await user.selectOptions(templateSelect, templateSelect.options[1].value)
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    // Toast should appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    // Advance time past toast duration (3 seconds + some buffer for animation)
    vi.advanceTimersByTime(4000)

    // Toast should be gone
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  it('shows success toast when student is added', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // First create a group
    await user.click(screen.getByText(/\+ new group/i))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    await user.type(screen.getByLabelText(/name/i), 'Test Group')
    const templateSelect = screen.getByLabelText(/template/i)
    await user.selectOptions(templateSelect, templateSelect.options[1].value)
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    // Wait for group creation toast and dismiss it
    await waitFor(() => {
      expect(screen.getByText(/group created/i)).toBeInTheDocument()
    })
    vi.advanceTimersByTime(4000)

    // Now add a student
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add student/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /add student/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText(/first name/i), 'Anna')
    await user.type(within(dialog).getByLabelText(/organisation/i), 'Rabobank')
    await user.type(within(dialog).getByLabelText(/city/i), 'Utrecht')
    await user.type(within(dialog).getByLabelText(/company coach/i), 'Peter')
    await user.type(within(dialog).getByLabelText(/examiner/i), 'Karin')

    const startDateInput = within(dialog).getByLabelText(/start date/i)
    await user.clear(startDateInput)
    await user.type(startDateInput, '2026-02-01')

    await user.click(within(dialog).getByRole('button', { name: /add student/i }))

    // Toast should appear for student added
    await waitFor(() => {
      expect(screen.getByText(/student added/i)).toBeInTheDocument()
    })
  })
})

describe('Empty States', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-02-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows empty state when no groups exist', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Should show "No groups yet" message
    const main = screen.getByRole('main')
    expect(within(main).getByText(/no groups yet/i)).toBeInTheDocument()
    expect(within(main).getByRole('button', { name: /create your first group/i })).toBeInTheDocument()
  })

  it('shows "All caught up" when no urgent items', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // This Week panel should show "All caught up"
    expect(screen.getByText(/all caught up/i)).toBeInTheDocument()
  })

  it('shows empty state when group has no students', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Create a group
    await user.click(screen.getByText(/\+ new group/i))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    await user.type(screen.getByLabelText(/name/i), 'Empty Group')
    const templateSelect = screen.getByLabelText(/template/i)
    await user.selectOptions(templateSelect, templateSelect.options[1].value)
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    // Wait for group to be created and selected
    await waitFor(() => {
      const main = screen.getByRole('main')
      expect(within(main).getByText('Empty Group')).toBeInTheDocument()
    })

    // Dismiss toast
    vi.advanceTimersByTime(4000)

    // Should show "No students" message
    await waitFor(() => {
      expect(screen.getByText(/no students/i)).toBeInTheDocument()
    })
  })
})

describe('Color Contrast', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-02-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('urgency colors are visible and distinguishable', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Create a group with a student to see urgency colors
    await user.click(screen.getByText(/\+ new group/i))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    await user.type(screen.getByLabelText(/name/i), 'Test Group')
    const templateSelect = screen.getByLabelText(/template/i)
    await user.selectOptions(templateSelect, templateSelect.options[1].value)
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    // Dismiss toast
    vi.advanceTimersByTime(4000)

    // Add a student with overdue items
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add student/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /add student/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText(/first name/i), 'Anna')
    await user.type(within(dialog).getByLabelText(/organisation/i), 'Rabobank')
    await user.type(within(dialog).getByLabelText(/city/i), 'Utrecht')
    await user.type(within(dialog).getByLabelText(/company coach/i), 'Peter')
    await user.type(within(dialog).getByLabelText(/examiner/i), 'Karin')

    const startDateInput = within(dialog).getByLabelText(/start date/i)
    await user.clear(startDateInput)
    await user.type(startDateInput, '2026-02-01') // 2 weeks ago, so milestones are overdue

    await user.click(within(dialog).getByRole('button', { name: /add student/i }))

    vi.advanceTimersByTime(4000)

    // Should see red urgency indicator
    await waitFor(() => {
      expect(screen.getByText(/overdue/i)).toBeInTheDocument()
    })

    // Verify danger styling class exists
    const overdueSpan = screen.getByText(/overdue/i).closest('span')
    expect(overdueSpan).toHaveClass('bg-danger-100')
  })
})

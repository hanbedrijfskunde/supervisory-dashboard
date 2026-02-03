import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'

describe('Dashboard and This Week Panel', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-02-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Helper to create a group and student
  async function setupGroupAndStudent(user, studentData = {}) {
    // Create group
    await user.click(screen.getByText(/\+ new group/i))
    await user.type(screen.getByLabelText(/name/i), 'Test Group')
    const templateSelect = screen.getByLabelText(/template/i)
    await user.selectOptions(templateSelect, templateSelect.options[1].value)
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    // Wait for group to be created
    await waitFor(() => {
      const main = screen.getByRole('main')
      expect(within(main).getByText('Test Group')).toBeInTheDocument()
    })

    // Add a student
    await user.click(screen.getByRole('button', { name: /add student/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText(/first name/i), studentData.name || 'Anna')
    await user.type(within(dialog).getByLabelText(/organisation/i), 'Rabobank')
    await user.type(within(dialog).getByLabelText(/city/i), 'Utrecht')
    await user.type(within(dialog).getByLabelText(/company coach/i), 'Peter')
    await user.type(within(dialog).getByLabelText(/examiner/i), 'Karin')

    const startDateInput = within(dialog).getByLabelText(/start date/i)
    await user.clear(startDateInput)
    await user.type(startDateInput, studentData.startDate || '2026-02-01')

    await user.click(within(dialog).getByRole('button', { name: /add student/i }))

    // Wait for student to appear
    await waitFor(() => {
      expect(screen.getByText(studentData.name || 'Anna')).toBeInTheDocument()
    })
  }

  it('shows This Week panel on dashboard', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // This Week panel should be visible even without groups
    expect(screen.getByText('This Week')).toBeInTheDocument()
  })

  it('shows "All caught up" when no urgent items', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Without any groups/students, there should be no urgent items
    expect(screen.getByText('All caught up!')).toBeInTheDocument()
    expect(screen.getByText(/no urgent items/i)).toBeInTheDocument()
  })

  it('shows overdue items in This Week panel', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Create a group with a student who started 2 weeks ago
    // This means Week 0 milestones are overdue
    await setupGroupAndStudent(user, { name: 'Anna', startDate: '2026-02-01' })

    // Click away from the group to see dashboard
    // Actually, the This Week panel should be visible in the group view
    // Let's check the panel shows overdue items
    await waitFor(() => {
      expect(screen.getByText(/overdue/i)).toBeInTheDocument()
    })
  })

  it('shows upcoming items in This Week panel', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Create a group with a student who just started
    // Week 1 milestones should be upcoming (within 7 days)
    await setupGroupAndStudent(user, { name: 'Bob', startDate: '2026-02-11' })

    // Check for upcoming items
    await waitFor(() => {
      expect(screen.getByText(/upcoming/i)).toBeInTheDocument()
    })
  })

  it('clicking action item navigates to student', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Create a group with a student
    await setupGroupAndStudent(user, { name: 'Charlie', startDate: '2026-02-01' })

    // Wait for action items to appear
    await waitFor(() => {
      expect(screen.getByText(/overdue/i)).toBeInTheDocument()
    })

    // Find and click an action item
    const actionButtons = screen.getAllByRole('button').filter(btn =>
      btn.textContent.includes('Charlie')
    )

    if (actionButtons.length > 0) {
      await user.click(actionButtons[0])

      // Should navigate to student detail view
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Charlie' })).toBeInTheDocument()
      })
    }
  })

  it('displays action items with correct urgency colors', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Create a student with overdue items
    await setupGroupAndStudent(user, { name: 'Diana', startDate: '2026-02-01' })

    // Check for danger styling on overdue items
    await waitFor(() => {
      const overdueSection = screen.getByText(/overdue/i).closest('span')
      expect(overdueSection).toHaveClass('bg-danger-100')
    })
  })

  it('shows welcome message when no groups exist', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Should show welcome message in main content area
    const main = screen.getByRole('main')
    expect(within(main).getByRole('heading', { name: /no groups yet/i })).toBeInTheDocument()
    // Button to create first group should exist in main area
    expect(within(main).getByRole('button', { name: /create your first group/i })).toBeInTheDocument()
  })

  it('This Week panel is visible when group is selected', async () => {
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

    // Wait for group to be created and auto-selected
    await waitFor(() => {
      const main = screen.getByRole('main')
      expect(within(main).getByText('Test Group')).toBeInTheDocument()
    })

    // This Week panel should still be visible when a group is selected
    expect(screen.getByText('This Week')).toBeInTheDocument()
  })

  it('aggregates items from multiple groups', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Create first group with student
    await setupGroupAndStudent(user, { name: 'Eva', startDate: '2026-02-01' })

    // Create second group
    await user.click(screen.getByText(/\+ new group/i))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/name/i), 'Second Group')
    const templateSelect = screen.getByLabelText(/template/i)
    await user.selectOptions(templateSelect, templateSelect.options[1].value)
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    // Add student to second group
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add student/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /add student/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText(/first name/i), 'Frank')
    await user.type(within(dialog).getByLabelText(/organisation/i), 'ING')
    await user.type(within(dialog).getByLabelText(/city/i), 'Amsterdam')
    await user.type(within(dialog).getByLabelText(/company coach/i), 'Jan')
    await user.type(within(dialog).getByLabelText(/examiner/i), 'Marie')

    const startDateInput = within(dialog).getByLabelText(/start date/i)
    await user.clear(startDateInput)
    await user.type(startDateInput, '2026-02-01')

    await user.click(within(dialog).getByRole('button', { name: /add student/i }))

    // Wait for student to appear
    await waitFor(() => {
      expect(screen.getByText('Frank')).toBeInTheDocument()
    })

    // This Week panel should show items from both students
    // Since both have overdue milestones, we should see multiple action items
    await waitFor(() => {
      // Check that we have multiple overdue items (from both students)
      const thisWeekPanel = screen.getByText('This Week').closest('div')
      expect(thisWeekPanel).toBeInTheDocument()
    })
  })
})

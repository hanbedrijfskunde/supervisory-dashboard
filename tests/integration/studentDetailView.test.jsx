import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'

describe('Student Detail View', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-02-15')) // About 2 weeks after typical start
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Helper to create a group and student
  async function setupGroupAndStudent(user) {
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
    await user.type(within(dialog).getByLabelText(/first name/i), 'Anna')
    await user.type(within(dialog).getByLabelText(/organisation/i), 'Rabobank')
    await user.type(within(dialog).getByLabelText(/city/i), 'Utrecht')
    await user.type(within(dialog).getByLabelText(/company coach/i), 'Peter')
    await user.type(within(dialog).getByLabelText(/examiner/i), 'Karin')

    const startDateInput = within(dialog).getByLabelText(/start date/i)
    await user.clear(startDateInput)
    await user.type(startDateInput, '2026-02-01')

    await user.click(within(dialog).getByRole('button', { name: /add student/i }))

    // Wait for student to appear
    await waitFor(() => {
      expect(screen.getByText('Anna')).toBeInTheDocument()
    })
  }

  it('displays student information correctly', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await setupGroupAndStudent(user)

    // Click on the student row to view details
    await user.click(screen.getByText('Anna'))

    // Should show student detail view
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Anna' })).toBeInTheDocument()
    })

    // Check student info
    expect(screen.getByText('Rabobank')).toBeInTheDocument()
    expect(screen.getByText('Utrecht')).toBeInTheDocument()
    expect(screen.getByText(/Coach:/)).toBeInTheDocument()
    expect(screen.getByText(/Peter/)).toBeInTheDocument()
    expect(screen.getByText(/Week \d+ of 21/)).toBeInTheDocument()
  })

  it('navigates back to group view', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await setupGroupAndStudent(user)

    // Click on the student row
    await user.click(screen.getByText('Anna'))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Anna' })).toBeInTheDocument()
    })

    // Click back button (find the specific back button in the header, exact match)
    const backButton = screen.getByRole('button', { name: /^back$/i })
    await user.click(backButton)

    // Should be back in the group view showing the student table
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('adds a note', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await setupGroupAndStudent(user)

    // Click on the student row
    await user.click(screen.getByText('Anna'))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Anna' })).toBeInTheDocument()
    })

    // Click add note button
    await user.click(screen.getByRole('button', { name: /add note/i }))

    // Wait for modal
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Type note
    await user.type(screen.getByPlaceholderText(/enter note/i), 'Good progress on research phase.')

    // Save note
    await user.click(screen.getByRole('button', { name: /save/i }))

    // Wait for modal to close and note to appear
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Good progress on research phase.')).toBeInTheDocument()
    expect(screen.getByText(/just now/i)).toBeInTheDocument()
  })

  it('deletes a note with confirmation', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await setupGroupAndStudent(user)

    // Click on the student row
    await user.click(screen.getByText('Anna'))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Anna' })).toBeInTheDocument()
    })

    // First add a note
    await user.click(screen.getByRole('button', { name: /add note/i }))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    await user.type(screen.getByPlaceholderText(/enter note/i), 'Test note to delete')
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText('Test note to delete')).toBeInTheDocument()
    })

    // Click delete button on the note
    await user.click(screen.getByTestId('delete-note-0'))

    // Confirm delete
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    // Note should be gone
    await waitFor(() => {
      expect(screen.queryByText('Test note to delete')).not.toBeInTheDocument()
    })
  })

  it('shows progress summary', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await setupGroupAndStudent(user)

    // Click on the student row
    await user.click(screen.getByText('Anna'))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Anna' })).toBeInTheDocument()
    })

    // Should show progress (0/X milestones initially)
    expect(screen.getByText(/0\/\d+ milestones/i)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('displays milestones from template', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await setupGroupAndStudent(user)

    // Click on the student row
    await user.click(screen.getByText('Anna'))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Anna' })).toBeInTheDocument()
    })

    // Should show milestones from template
    expect(screen.getByText(/Meet & greet/i)).toBeInTheDocument()
    expect(screen.getByText(/PIP submitted/i)).toBeInTheDocument()
  })

  it('can edit student from detail view', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await setupGroupAndStudent(user)

    // Click on the student row
    await user.click(screen.getByText('Anna'))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Anna' })).toBeInTheDocument()
    })

    // Click edit button
    await user.click(screen.getByRole('button', { name: /edit/i }))

    // Wait for form
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Change the name
    const nameInput = screen.getByLabelText(/first name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Anna Updated')

    // Save
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    // Verify update in the header
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Anna Updated' })).toBeInTheDocument()
    })
  })
})

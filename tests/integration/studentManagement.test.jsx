import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'

describe('Student Management', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-02-03'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Helper to create a group first
  async function createTestGroup(user) {
    await user.click(screen.getByText(/\+ new group/i))
    await user.type(screen.getByLabelText(/name/i), 'Test Group')
    const templateSelect = screen.getByLabelText(/template/i)
    await user.selectOptions(templateSelect, templateSelect.options[1].value)
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    // Wait for group to be created and selected
    await waitFor(() => {
      const main = screen.getByRole('main')
      expect(within(main).getByText('Test Group')).toBeInTheDocument()
    })
  }

  // Helper to add a student
  async function addStudent(user, { firstName, organisation, city, specialisation, startDate }) {
    await user.click(screen.getByRole('button', { name: /add student/i }))

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Scope all form interactions to the dialog to avoid conflicts with filter dropdowns
    const dialog = screen.getByRole('dialog')

    await user.type(within(dialog).getByLabelText(/first name/i), firstName)
    await user.type(within(dialog).getByLabelText(/organisation/i), organisation)

    if (city) {
      await user.type(within(dialog).getByLabelText(/city/i), city)
    }

    if (specialisation) {
      await user.selectOptions(within(dialog).getByLabelText(/specialisation/i), specialisation)
    }

    if (startDate) {
      const startDateInput = within(dialog).getByLabelText(/start date/i)
      await user.clear(startDateInput)
      await user.type(startDateInput, startDate)
    }

    await user.click(within(dialog).getByRole('button', { name: /save/i }))

    // Wait for modal to close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Wait for student to appear in the table
    await waitFor(() => {
      expect(screen.getByText(firstName)).toBeInTheDocument()
    })
  }

  it('shows empty state when group has no students', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await createTestGroup(user)

    // Should show empty state
    const main = screen.getByRole('main')
    expect(within(main).getByText(/no students yet/i)).toBeInTheDocument()
    expect(within(main).getByRole('button', { name: /add student/i })).toBeInTheDocument()
  })

  it('adds a student to a group', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await createTestGroup(user)

    // Click add student
    await user.click(screen.getByRole('button', { name: /add student/i }))

    // Wait for modal
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Fill form
    await user.type(screen.getByLabelText(/first name/i), 'Anna')
    await user.type(screen.getByLabelText(/organisation/i), 'Rabobank')
    await user.type(screen.getByLabelText(/city/i), 'Utrecht')
    await user.type(screen.getByLabelText(/company coach/i), 'Peter')
    await user.type(screen.getByLabelText(/examiner/i), 'Karin')

    // Set start date
    const startDateInput = screen.getByLabelText(/start date/i)
    await user.clear(startDateInput)
    await user.type(startDateInput, '2026-02-02')

    // Submit
    await user.click(screen.getByRole('button', { name: /save/i }))

    // Verify student appears in table
    await waitFor(() => {
      expect(screen.getByText('Anna')).toBeInTheDocument()
      expect(screen.getByText('Rabobank')).toBeInTheDocument()
      expect(screen.getByText('Utrecht')).toBeInTheDocument()
    })
  })

  it('displays student table with columns', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await createTestGroup(user)

    // Add a student
    await addStudent(user, {
      firstName: 'Anna',
      organisation: 'Rabobank',
      city: 'Utrecht',
      specialisation: 'Finance',
      startDate: '2026-02-02'
    })

    // Verify table has correct columns
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Organisation')).toBeInTheDocument()
    expect(screen.getByText('Specialisation')).toBeInTheDocument()
    expect(screen.getByText('Progress')).toBeInTheDocument()

    // Verify student data in table (use within to scope to table)
    expect(within(table).getByText('Anna')).toBeInTheDocument()
    expect(within(table).getByText('Rabobank')).toBeInTheDocument()
    expect(within(table).getByText('Finance')).toBeInTheDocument()
  })

  it('filters students by specialisation', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await createTestGroup(user)

    // Add first student with Finance specialisation
    await addStudent(user, {
      firstName: 'Anna',
      organisation: 'Rabobank',
      specialisation: 'Finance',
      startDate: '2026-02-02'
    })

    // Add second student with Marketing specialisation
    await addStudent(user, {
      firstName: 'Mark',
      organisation: 'Shell',
      specialisation: 'Marketing & Sales',
      startDate: '2026-02-02'
    })

    // Now both students should be visible in table
    const table = screen.getByRole('table')
    expect(within(table).getByText('Anna')).toBeInTheDocument()
    expect(within(table).getByText('Mark')).toBeInTheDocument()

    // Filter by Finance
    await user.selectOptions(screen.getByLabelText(/filter by specialisation/i), 'Finance')

    // Anna should be visible, Mark should not
    await waitFor(() => {
      expect(within(table).getByText('Anna')).toBeInTheDocument()
      expect(within(table).queryByText('Mark')).not.toBeInTheDocument()
    })
  })

  it('displays multiple students and can sort by columns', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await createTestGroup(user)

    // Add first student
    await addStudent(user, {
      firstName: 'AliceStudent',
      organisation: 'CompanyA',
      startDate: '2026-02-01'
    })

    // Add second student
    await addStudent(user, {
      firstName: 'BobStudent',
      organisation: 'CompanyB',
      startDate: '2026-02-02'
    })

    // Both students should be visible
    const table = screen.getByRole('table')
    expect(within(table).getByText('AliceStudent')).toBeInTheDocument()
    expect(within(table).getByText('BobStudent')).toBeInTheDocument()

    // Should show 2 of 2 students
    expect(screen.getByText(/showing 2 of 2/i)).toBeInTheDocument()

    // Click on Name column to sort alphabetically
    await user.click(screen.getByText('Name'))

    // Get all table rows (skip header)
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows.length).toBe(2)
    // After clicking Name once, it should sort by name
    expect(rows[0]).toHaveTextContent('AliceStudent')
  })

  it('deletes a student with confirmation', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await createTestGroup(user)

    // Add a student
    await addStudent(user, {
      firstName: 'ToDelete',
      organisation: 'TestCorp',
      startDate: '2026-02-02'
    })

    // Find and click the student menu button
    const menuButton = screen.getByTestId(/student-menu-/i)
    await user.click(menuButton)

    // Click delete in menu
    const deleteButton = await screen.findByRole('menuitem', { name: /delete/i })
    await user.click(deleteButton)

    // Confirm delete in dialog
    const confirmDialog = screen.getByRole('dialog')
    const confirmButton = within(confirmDialog).getByRole('button', { name: /delete/i })
    await user.click(confirmButton)

    // Student should be gone
    await waitFor(() => {
      expect(screen.queryByText('ToDelete')).not.toBeInTheDocument()
    })
  })

  it('edits a student', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await createTestGroup(user)

    // Add a student
    await addStudent(user, {
      firstName: 'OriginalName',
      organisation: 'OriginalOrg',
      startDate: '2026-02-02'
    })

    // Open menu and click edit
    const menuButton = screen.getByTestId(/student-menu-/i)
    await user.click(menuButton)
    const editButton = await screen.findByRole('menuitem', { name: /edit/i })
    await user.click(editButton)

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Edit the student
    const firstNameInput = screen.getByLabelText(/first name/i)
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'UpdatedName')
    await user.click(screen.getByRole('button', { name: /save/i }))

    // Verify update
    await waitFor(() => {
      expect(screen.getByText('UpdatedName')).toBeInTheDocument()
      expect(screen.queryByText('OriginalName')).not.toBeInTheDocument()
    })
  })

  it('shows correct results count in StudentTable', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await createTestGroup(user)

    // Add first student
    await addStudent(user, {
      firstName: 'Student1',
      organisation: 'Org1',
      startDate: '2026-02-02'
    })

    // Table should show "Showing 1 of 1 students"
    expect(screen.getByText(/showing 1 of 1/i)).toBeInTheDocument()

    // Add second student
    await addStudent(user, {
      firstName: 'Student2',
      organisation: 'Org2',
      startDate: '2026-02-02'
    })

    // Table should show "Showing 2 of 2 students"
    expect(screen.getByText(/showing 2 of 2/i)).toBeInTheDocument()
  })
})

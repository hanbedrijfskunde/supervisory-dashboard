import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'

describe('Group Management', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('displays empty state when no groups exist', async () => {
    render(<App />)

    // Look in the main content area for the empty state
    await waitFor(() => {
      const main = screen.getByRole('main')
      expect(within(main).getByText(/no groups yet/i)).toBeInTheDocument()
    })
  })

  it('creates a new group', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Click new group button
    await user.click(screen.getByText(/\+ new group/i))

    // Fill form
    await user.type(screen.getByLabelText(/name/i), 'Semester 2 - Feb 2026')

    // Select template
    const templateSelect = screen.getByLabelText(/template/i)
    await user.selectOptions(templateSelect, templateSelect.options[1].value)

    // Submit
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    // Verify group appears in sidebar
    await waitFor(() => {
      const aside = document.querySelector('aside')
      expect(within(aside).getByText('Semester 2 - Feb 2026')).toBeInTheDocument()
    })
  })

  it('shows group form validation errors', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await user.click(screen.getByText(/\+ new group/i))

    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })
  })

  it('selects a group and shows it in main content', async () => {
    const user = userEvent.setup()
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
  })

  it('shows student count on group card', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await user.click(screen.getByText(/\+ new group/i))
    await user.type(screen.getByLabelText(/name/i), 'Group With Count')
    const templateSelect = screen.getByLabelText(/template/i)
    await user.selectOptions(templateSelect, templateSelect.options[1].value)
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    // Should show "0 students" in sidebar
    await waitFor(() => {
      const aside = document.querySelector('aside')
      expect(within(aside).getByText(/0 students/i)).toBeInTheDocument()
    })
  })

  it('closes modal with cancel button', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    await user.click(screen.getByText(/\+ new group/i))

    // Modal should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Click cancel
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('deletes a group with confirmation', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    // Create a group
    await user.click(screen.getByText(/\+ new group/i))
    await user.type(screen.getByLabelText(/name/i), 'To Delete')
    const templateSelect = screen.getByLabelText(/template/i)
    await user.selectOptions(templateSelect, templateSelect.options[1].value)
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    // Wait for group to appear
    await waitFor(() => {
      const aside = document.querySelector('aside')
      expect(within(aside).getByText('To Delete')).toBeInTheDocument()
    })

    // Open menu
    const menuButton = screen.getByTestId('group-menu-To Delete')
    await user.click(menuButton)

    // Click delete in menu
    const deleteButton = await screen.findByRole('button', { name: /^delete$/i })
    await user.click(deleteButton)

    // Confirm delete in dialog
    const confirmDialog = screen.getByRole('dialog')
    const confirmButton = within(confirmDialog).getByRole('button', { name: /^delete$/i })
    await user.click(confirmButton)

    // Group should be gone
    await waitFor(() => {
      const aside = document.querySelector('aside')
      expect(within(aside).queryByText('To Delete')).not.toBeInTheDocument()
    })
  })
})

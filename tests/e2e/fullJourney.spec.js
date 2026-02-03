import { test, expect } from '@playwright/test'

// Helper to create a group
async function createGroup(page, name) {
  await page.getByRole('button', { name: /new group/i }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByLabel(/name/i).fill(name)
  await dialog.getByLabel(/template/i).selectOption({ index: 1 })
  // Dispatch proper click event
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button')
    for (const button of buttons) {
      if (button.textContent.trim() === 'Create') {
        const event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window })
        button.dispatchEvent(event)
        break
      }
    }
  })
  await expect(dialog).not.toBeVisible({ timeout: 10000 })
  await expect(page.getByText(name).first()).toBeVisible()
}

// Helper to add a student
async function addStudent(page, firstName, organisation, city, startDate = '2026-02-02') {
  await page.getByRole('button', { name: /add student/i }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByLabel(/first name/i).fill(firstName)
  await dialog.getByLabel(/organisation/i).fill(organisation)
  await dialog.getByLabel(/city/i).fill(city)
  await dialog.getByLabel(/company coach/i).fill('Coach')
  await dialog.getByLabel(/examiner/i).fill('Examiner')
  await dialog.getByLabel(/start date/i).fill(startDate)
  // Dispatch proper click event
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button')
    for (const button of buttons) {
      if (button.textContent.trim() === 'Save') {
        const event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window })
        button.dispatchEvent(event)
        break
      }
    }
  })
  await expect(dialog).not.toBeVisible({ timeout: 10000 })
  await expect(page.getByRole('table').getByText(firstName)).toBeVisible()
}

test.describe('Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await expect(page.getByText(/GI Supervision Tracker/i)).toBeVisible()
  })

  test('first-time user can create a group and add students', async ({ page }) => {
    // Verify initial state
    await expect(page.getByRole('heading', { name: /no groups yet/i })).toBeVisible()

    // Create a group
    await createGroup(page, 'Test Semester')

    // Add a student
    await addStudent(page, 'Anna', 'Rabobank', 'Utrecht')

    // Verify student is in the table
    await expect(page.getByRole('table').getByText('Rabobank')).toBeVisible()
  })

  test('data persists across browser sessions', async ({ page }) => {
    // Create data
    await createGroup(page, 'Persistent Group')

    // Reload the page
    await page.reload()

    // Verify data persisted
    await expect(page.getByText('Persistent Group')).toBeVisible()
  })

  test('student detail view shows correctly', async ({ page }) => {
    // Create group and student
    await createGroup(page, 'Detail Test')
    await addStudent(page, 'Bob', 'ING Bank', 'Amsterdam')

    // Navigate to student detail - click on the row
    await page.locator('[data-testid^="student-row-"]').first().click()

    // Verify student detail view shows
    await expect(page.getByRole('heading', { name: 'Bob' })).toBeVisible()
    await expect(page.getByText('ING Bank').first()).toBeVisible()

    // Back button should work - use JavaScript click
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button')
      for (const button of buttons) {
        if (button.textContent.includes('Back') || button.getAttribute('aria-label')?.includes('Back')) {
          const event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window })
          button.dispatchEvent(event)
          break
        }
      }
    })
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('milestones can be tracked', async ({ page }) => {
    // Create group and student
    await createGroup(page, 'Milestone Test')
    await addStudent(page, 'Charlie', 'ABN AMRO', 'Rotterdam')

    // Navigate to student detail
    await page.getByRole('table').getByText('Charlie').click()
    await expect(page.getByRole('heading', { name: 'Charlie' })).toBeVisible()

    // Check off a milestone
    const meetGreet = page.getByLabel(/meet.*greet/i)
    await meetGreet.click()
    await expect(meetGreet).toBeChecked()
  })

  test('export backup can be downloaded', async ({ page }) => {
    // Create some data first
    await createGroup(page, 'Export Test')

    // Open settings
    await page.getByRole('button', { name: /settings/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Export data - use JavaScript click
    const downloadPromise = page.waitForEvent('download')
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button')
      for (const button of buttons) {
        if (button.textContent.includes('Export Backup')) {
          const event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window })
          button.dispatchEvent(event)
          break
        }
      }
    })
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/gi-tracker-backup.*\.json/)
  })
})

test.describe('Performance', () => {
  test('loads quickly with data', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await expect(page.getByText(/GI Supervision Tracker/i)).toBeVisible()

    // Create a group
    await createGroup(page, 'Performance Group')

    // Add a few students
    await addStudent(page, 'Student 1', 'Company 1', 'City 1')
    await addStudent(page, 'Student 2', 'Company 2', 'City 2')

    // Measure reload time
    const startTime = Date.now()
    await page.reload()
    await page.waitForSelector('text=Performance Group')
    const loadTime = Date.now() - startTime

    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })
})

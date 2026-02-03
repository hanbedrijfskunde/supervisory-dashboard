import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderHook, act } from '@testing-library/react'
import { AppProvider } from '../../src/context/AppContext'
import { MilestoneChecklist } from '../../src/components/milestones/MilestoneChecklist'
import { MilestoneItem } from '../../src/components/milestones/MilestoneItem'
import { MilestoneStatusBadge } from '../../src/components/milestones/MilestoneStatusBadge'
import { useMilestoneActions } from '../../src/hooks/useMilestoneActions'
import { useStudents } from '../../src/hooks/useStudents'
import { useGroups } from '../../src/hooks/useGroups'
import { storageService } from '../../src/services/storageService'
import { initializeApp } from '../../src/services/initService'

describe('Milestone Tracking', () => {
  beforeEach(() => {
    localStorage.clear()
    initializeApp()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-02-15')) // About 2 weeks after typical start
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('MilestoneStatusBadge', () => {
    it('renders overdue status correctly', () => {
      render(<MilestoneStatusBadge status="overdue" />)
      expect(screen.getByText('Overdue')).toBeInTheDocument()
    })

    it('renders upcoming status correctly', () => {
      render(<MilestoneStatusBadge status="upcoming" />)
      expect(screen.getByText('Due soon')).toBeInTheDocument()
    })

    it('renders pending status correctly', () => {
      render(<MilestoneStatusBadge status="pending" />)
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })

    it('renders completed status correctly', () => {
      render(<MilestoneStatusBadge status="completed" />)
      expect(screen.getByText('Done')).toBeInTheDocument()
    })
  })

  describe('MilestoneItem', () => {
    const baseMilestone = {
      id: 'test-m1',
      name: 'Test Milestone',
      week: 1,
      type: 'deliverable',
      tracking: 'checkbox_date'
    }

    it('renders checkbox for checkbox type', () => {
      const milestone = { ...baseMilestone, tracking: 'checkbox' }
      render(
        <MilestoneItem
          milestone={milestone}
          status={{ done: false }}
          startDate="2026-02-01"
        />
      )
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('renders checkbox with date for checkbox_date type', () => {
      render(
        <MilestoneItem
          milestone={baseMilestone}
          status={{ done: false }}
          startDate="2026-02-01"
        />
      )
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(screen.getByTestId('milestone-test-m1-date')).toBeInTheDocument()
    })

    it('renders counter controls for counter type', () => {
      const milestone = { ...baseMilestone, tracking: 'counter', counterMax: 4 }
      render(
        <MilestoneItem
          milestone={milestone}
          status={{ count: 2, done: false }}
          startDate="2026-02-01"
        />
      )
      expect(screen.getByText('2/4')).toBeInTheDocument()
      expect(screen.getByTestId('test-m1-increment')).toBeInTheDocument()
      expect(screen.getByTestId('test-m1-decrement')).toBeInTheDocument()
    })

    it('renders date picker for date type', () => {
      const milestone = { ...baseMilestone, tracking: 'date' }
      render(
        <MilestoneItem
          milestone={milestone}
          status={{ date: '' }}
          startDate="2026-02-01"
        />
      )
      expect(screen.getByTestId('milestone-test-m1-date')).toBeInTheDocument()
    })

    it('shows overdue styling for past-due incomplete milestones', () => {
      // Student started Feb 1, today is Feb 15, week 1 milestone (Feb 8) is overdue
      render(
        <MilestoneItem
          milestone={baseMilestone}
          status={{ done: false }}
          startDate="2026-02-01"
        />
      )
      const milestoneEl = screen.getByTestId('milestone-test-m1')
      expect(milestoneEl).toHaveClass('milestone-overdue')
    })

    it('shows upcoming styling for milestones due within 7 days', () => {
      // Today is Feb 15
      // Set milestone to week 1, student started Feb 11, so week 1 = Feb 18 (3 days from Feb 15)
      const milestone = { ...baseMilestone, week: 1 }
      render(
        <MilestoneItem
          milestone={milestone}
          status={{ done: false }}
          startDate="2026-02-11"
        />
      )
      const milestoneEl = screen.getByTestId('milestone-test-m1')
      expect(milestoneEl).toHaveClass('milestone-upcoming')
    })

    it('shows completed styling when done', () => {
      render(
        <MilestoneItem
          milestone={baseMilestone}
          status={{ done: true }}
          startDate="2026-02-01"
        />
      )
      const milestoneEl = screen.getByTestId('milestone-test-m1')
      expect(milestoneEl).toHaveClass('milestone-completed')
    })

    it('shows pending styling for future milestones', () => {
      // Set milestone to week 10, student started Feb 15, so week 10 = Apr 26 (far in future)
      const milestone = { ...baseMilestone, week: 10 }
      render(
        <MilestoneItem
          milestone={milestone}
          status={{ done: false }}
          startDate="2026-02-15"
        />
      )
      const milestoneEl = screen.getByTestId('milestone-test-m1')
      expect(milestoneEl).toHaveClass('milestone-pending')
    })

    it('calls onToggle when checkbox is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const onToggle = vi.fn()
      render(
        <MilestoneItem
          milestone={baseMilestone}
          status={{ done: false }}
          startDate="2026-02-01"
          onToggle={onToggle}
        />
      )

      await user.click(screen.getByRole('checkbox'))
      expect(onToggle).toHaveBeenCalledWith('test-m1', 'checkbox_date')
    })

    it('calls onIncrement/onDecrement for counter type', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const onIncrement = vi.fn()
      const onDecrement = vi.fn()
      const milestone = { ...baseMilestone, tracking: 'counter', counterMax: 4 }

      render(
        <MilestoneItem
          milestone={milestone}
          status={{ count: 2, done: false }}
          startDate="2026-02-01"
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      )

      await user.click(screen.getByTestId('test-m1-increment'))
      expect(onIncrement).toHaveBeenCalledWith('test-m1', 4)

      await user.click(screen.getByTestId('test-m1-decrement'))
      expect(onDecrement).toHaveBeenCalledWith('test-m1')
    })

    it('shows format selector for visit type', () => {
      const milestone = { ...baseMilestone, type: 'visit' }
      render(
        <MilestoneItem
          milestone={milestone}
          status={{ done: false }}
          startDate="2026-02-01"
        />
      )
      expect(screen.getByLabelText(/format/i)).toBeInTheDocument()
      expect(screen.getByText('Physical')).toBeInTheDocument()
      expect(screen.getByText('Teams')).toBeInTheDocument()
    })
  })

  describe('MilestoneChecklist', () => {
    const mockTemplate = {
      durationWeeks: 21,
      milestones: [
        { id: 'm1', name: 'Meet & greet', week: 0, type: 'meeting', tracking: 'checkbox_date' },
        { id: 'm2', name: 'PIP submitted', week: 1, type: 'deliverable', tracking: 'checkbox_date' },
        { id: 'm3', name: '1st company visit', week: 2, type: 'visit', tracking: 'checkbox_date' },
        { id: 'm4', name: 'Meeting report', week: 3, type: 'deliverable', tracking: 'checkbox_date' },
        { id: 'm5', name: 'Feedback forms', week: 9, type: 'deliverable', tracking: 'counter', counterMax: 4 },
        { id: 'm6', name: 'Final portfolio', week: 19, type: 'deliverable', tracking: 'checkbox_date' },
        { id: 'resit', name: 'Resit (if applicable)', week: null, type: 'deliverable', tracking: 'checkbox_date' }
      ]
    }

    const mockStudent = {
      id: 'student-1',
      firstName: 'Anna',
      startDate: '2026-02-01',
      milestones: {}
    }

    it('displays all milestones from template', () => {
      render(
        <AppProvider>
          <MilestoneChecklist
            groupId="test-group"
            studentId="student-1"
            student={mockStudent}
            template={mockTemplate}
          />
        </AppProvider>
      )

      expect(screen.getByText(/meet & greet/i)).toBeInTheDocument()
      expect(screen.getByText(/PIP submitted/i)).toBeInTheDocument()
      expect(screen.getByText(/1st company visit/i)).toBeInTheDocument()
      expect(screen.getByText(/Feedback forms/i)).toBeInTheDocument()
      expect(screen.getByText(/Final portfolio/i)).toBeInTheDocument()
      expect(screen.getByText(/Resit/i)).toBeInTheDocument()
    })

    it('groups milestones by phase', () => {
      render(
        <AppProvider>
          <MilestoneChecklist
            groupId="test-group"
            studentId="student-1"
            student={mockStudent}
            template={mockTemplate}
          />
        </AppProvider>
      )

      // Check that the phases that have milestones are rendered
      expect(screen.getByText(/Start \(Week 0-2\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Early Phase \(Week 3-8\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Mid Phase \(Week 9-14\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Final Phase \(Week 15\+\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Unscheduled/i)).toBeInTheDocument()
    })
  })

  describe('useMilestoneActions', () => {
    // Combined hook that uses both groups and students to setup test data
    function useCombinedHook() {
      const groups = useGroups()
      const students = useStudents()
      const milestoneActions = useMilestoneActions()
      return { groups, students, milestoneActions }
    }

    it('toggleMilestone toggles done status', async () => {
      const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>
      const { result } = renderHook(() => useCombinedHook(), { wrapper })

      let groupId, studentId

      // Create group
      act(() => {
        const group = result.current.groups.addGroup({
          name: 'Test Group',
          templateId: 'default-ib-cs-2025-26'
        })
        groupId = group.id
      })

      // Get template and add student
      const data = storageService.getData()
      const template = data.templates['default-ib-cs-2025-26']

      act(() => {
        const student = result.current.students.addStudent(
          groupId,
          {
            firstName: 'Anna',
            organisation: 'Test Corp',
            startDate: '2026-02-01'
          },
          template
        )
        studentId = student.id
      })

      // Toggle milestone
      act(() => {
        result.current.milestoneActions.toggleMilestone(groupId, studentId, 'm04', 'checkbox_date')
      })

      const updatedData = storageService.getData()
      expect(updatedData.groups[groupId].students[studentId].milestones.m04.done).toBe(true)
    })

    it('toggleMilestone sets date for checkbox_date type when marking done', async () => {
      const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>
      const { result } = renderHook(() => useCombinedHook(), { wrapper })

      let groupId, studentId

      act(() => {
        const group = result.current.groups.addGroup({
          name: 'Test Group',
          templateId: 'default-ib-cs-2025-26'
        })
        groupId = group.id
      })

      const data = storageService.getData()
      const template = data.templates['default-ib-cs-2025-26']

      act(() => {
        const student = result.current.students.addStudent(
          groupId,
          { firstName: 'Anna', organisation: 'Test Corp', startDate: '2026-02-01' },
          template
        )
        studentId = student.id
      })

      act(() => {
        result.current.milestoneActions.toggleMilestone(groupId, studentId, 'm04', 'checkbox_date')
      })

      const updatedData = storageService.getData()
      expect(updatedData.groups[groupId].students[studentId].milestones.m04.date).toBe('2026-02-15')
    })

    it('setMilestoneDate updates the date', async () => {
      const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>
      const { result } = renderHook(() => useCombinedHook(), { wrapper })

      let groupId, studentId

      act(() => {
        const group = result.current.groups.addGroup({
          name: 'Test Group',
          templateId: 'default-ib-cs-2025-26'
        })
        groupId = group.id
      })

      const data = storageService.getData()
      const template = data.templates['default-ib-cs-2025-26']

      act(() => {
        const student = result.current.students.addStudent(
          groupId,
          { firstName: 'Anna', organisation: 'Test Corp', startDate: '2026-02-01' },
          template
        )
        studentId = student.id
      })

      act(() => {
        result.current.milestoneActions.setMilestoneDate(groupId, studentId, 'm04', '2026-02-20')
      })

      const updatedData = storageService.getData()
      expect(updatedData.groups[groupId].students[studentId].milestones.m04.date).toBe('2026-02-20')
    })

    it('incrementMilestoneCount increases count', async () => {
      const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>
      const { result } = renderHook(() => useCombinedHook(), { wrapper })

      let groupId, studentId

      act(() => {
        const group = result.current.groups.addGroup({
          name: 'Test Group',
          templateId: 'default-ib-cs-2025-26'
        })
        groupId = group.id
      })

      const data = storageService.getData()
      const template = data.templates['default-ib-cs-2025-26']

      act(() => {
        const student = result.current.students.addStudent(
          groupId,
          { firstName: 'Anna', organisation: 'Test Corp', startDate: '2026-02-01' },
          template
        )
        studentId = student.id
      })

      // m08 is 1st round 360° feedback forms with counterMax: 4
      act(() => {
        result.current.milestoneActions.incrementMilestoneCount(groupId, studentId, 'm08', 4)
      })
      act(() => {
        result.current.milestoneActions.incrementMilestoneCount(groupId, studentId, 'm08', 4)
      })
      act(() => {
        result.current.milestoneActions.incrementMilestoneCount(groupId, studentId, 'm08', 4)
      })

      const updatedData = storageService.getData()
      expect(updatedData.groups[groupId].students[studentId].milestones.m08.count).toBe(3)
    })

    it('incrementMilestoneCount marks done when reaching max', async () => {
      const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>
      const { result } = renderHook(() => useCombinedHook(), { wrapper })

      let groupId, studentId

      act(() => {
        const group = result.current.groups.addGroup({
          name: 'Test Group',
          templateId: 'default-ib-cs-2025-26'
        })
        groupId = group.id
      })

      const data = storageService.getData()
      const template = data.templates['default-ib-cs-2025-26']

      act(() => {
        const student = result.current.students.addStudent(
          groupId,
          { firstName: 'Anna', organisation: 'Test Corp', startDate: '2026-02-01' },
          template
        )
        studentId = student.id
      })

      // Increment to max
      act(() => {
        result.current.milestoneActions.incrementMilestoneCount(groupId, studentId, 'm08', 4)
      })
      act(() => {
        result.current.milestoneActions.incrementMilestoneCount(groupId, studentId, 'm08', 4)
      })
      act(() => {
        result.current.milestoneActions.incrementMilestoneCount(groupId, studentId, 'm08', 4)
      })
      act(() => {
        result.current.milestoneActions.incrementMilestoneCount(groupId, studentId, 'm08', 4)
      })

      const updatedData = storageService.getData()
      expect(updatedData.groups[groupId].students[studentId].milestones.m08.count).toBe(4)
      expect(updatedData.groups[groupId].students[studentId].milestones.m08.done).toBe(true)
    })

    it('decrementMilestoneCount decreases count', async () => {
      const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>
      const { result } = renderHook(() => useCombinedHook(), { wrapper })

      let groupId, studentId

      act(() => {
        const group = result.current.groups.addGroup({
          name: 'Test Group',
          templateId: 'default-ib-cs-2025-26'
        })
        groupId = group.id
      })

      const data = storageService.getData()
      const template = data.templates['default-ib-cs-2025-26']

      act(() => {
        const student = result.current.students.addStudent(
          groupId,
          { firstName: 'Anna', organisation: 'Test Corp', startDate: '2026-02-01' },
          template
        )
        studentId = student.id
      })

      // Set count first then decrement
      act(() => {
        result.current.milestoneActions.setMilestoneCount(groupId, studentId, 'm08', 3)
      })
      act(() => {
        result.current.milestoneActions.decrementMilestoneCount(groupId, studentId, 'm08')
      })

      const updatedData = storageService.getData()
      expect(updatedData.groups[groupId].students[studentId].milestones.m08.count).toBe(2)
    })

    it('setMilestoneFormat updates format', async () => {
      const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>
      const { result } = renderHook(() => useCombinedHook(), { wrapper })

      let groupId, studentId

      act(() => {
        const group = result.current.groups.addGroup({
          name: 'Test Group',
          templateId: 'default-ib-cs-2025-26'
        })
        groupId = group.id
      })

      const data = storageService.getData()
      const template = data.templates['default-ib-cs-2025-26']

      act(() => {
        const student = result.current.students.addStudent(
          groupId,
          { firstName: 'Anna', organisation: 'Test Corp', startDate: '2026-02-01' },
          template
        )
        studentId = student.id
      })

      act(() => {
        result.current.milestoneActions.setMilestoneFormat(groupId, studentId, 'm05', 'physical')
      })

      const updatedData = storageService.getData()
      expect(updatedData.groups[groupId].students[studentId].milestones.m05.format).toBe('physical')
    })
  })

  describe('Milestone initialization', () => {
    it('initializes all milestones when student is created', async () => {
      const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>

      // Use combined hook to share state
      function useCombinedHook() {
        const groups = useGroups()
        const students = useStudents()
        return { groups, students }
      }

      const { result } = renderHook(() => useCombinedHook(), { wrapper })

      let groupId, studentId

      act(() => {
        const group = result.current.groups.addGroup({
          name: 'Test Group',
          templateId: 'default-ib-cs-2025-26'
        })
        groupId = group.id
      })

      const data = storageService.getData()
      const template = data.templates['default-ib-cs-2025-26']

      act(() => {
        const student = result.current.students.addStudent(
          groupId,
          {
            firstName: 'Anna',
            organisation: 'Test Corp',
            startDate: '2026-02-01'
          },
          template
        )
        studentId = student.id
      })

      const updatedData = storageService.getData()
      const milestones = updatedData.groups[groupId].students[studentId].milestones

      // Should have all milestones from template initialized
      expect(Object.keys(milestones).length).toBe(template.milestones.length)

      // Check specific milestone types
      expect(milestones.m01.done).toBe(false)
      expect(milestones.m08.count).toBe(0) // Counter type
      expect(milestones.m05.format).toBe(null) // Visit type
    })
  })
})

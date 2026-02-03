import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AppProvider } from '../../src/context/AppContext'
import { useGroups } from '../../src/hooks/useGroups'
import { useStudents } from '../../src/hooks/useStudents'
import { useTemplates } from '../../src/hooks/useTemplates'
import { storageService } from '../../src/services/storageService'

// Wrapper component for hooks
const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>

describe('Hooks Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('useGroups', () => {
    it('adds and retrieves groups', async () => {
      const { result } = renderHook(() => useGroups(), { wrapper })

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addGroup({ name: 'Sem 2', templateId: 't1' })
      })

      expect(result.current.groups.length).toBe(1)
      expect(result.current.groups[0].name).toBe('Sem 2')
    })

    it('archives a group', async () => {
      const { result } = renderHook(() => useGroups(), { wrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let group
      act(() => {
        group = result.current.addGroup({ name: 'To Archive', templateId: 't1' })
      })

      act(() => {
        result.current.archiveGroup(group.id)
      })

      expect(result.current.activeGroups.length).toBe(0)
      expect(result.current.archivedGroups.length).toBe(1)
    })

    it('deletes a group', async () => {
      const { result } = renderHook(() => useGroups(), { wrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let group
      act(() => {
        group = result.current.addGroup({ name: 'To Delete', templateId: 't1' })
      })

      act(() => {
        result.current.deleteGroup(group.id)
      })

      expect(result.current.groups.length).toBe(0)
    })
  })

  describe('useStudents', () => {
    // Combined hook to test students within the same context
    function useCombined() {
      const groups = useGroups()
      const students = useStudents()
      return { groups, students }
    }

    it('adds a student to a group', async () => {
      const { result } = renderHook(() => useCombined(), { wrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let group
      act(() => {
        group = result.current.groups.addGroup({ name: 'Test Group', templateId: 't1' })
      })

      act(() => {
        result.current.students.addStudent(group.id, {
          firstName: 'Anna',
          organisation: 'Rabobank'
        })
      })

      const students = result.current.students.getStudentsForGroup(group.id)
      expect(students.length).toBe(1)
      expect(students[0].firstName).toBe('Anna')
    })

    it('updates a student', async () => {
      const { result } = renderHook(() => useCombined(), { wrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let group, student
      act(() => {
        group = result.current.groups.addGroup({ name: 'Test Group', templateId: 't1' })
      })

      act(() => {
        student = result.current.students.addStudent(group.id, {
          firstName: 'Anna',
          organisation: 'Rabobank'
        })
      })

      act(() => {
        result.current.students.updateStudent(group.id, student.id, {
          organisation: 'ING Bank'
        })
      })

      const updated = result.current.students.getStudent(group.id, student.id)
      expect(updated.organisation).toBe('ING Bank')
    })
  })

  describe('useTemplates', () => {
    it('loads default templates', async () => {
      const { result } = renderHook(() => useTemplates(), { wrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.templates.length).toBe(2)
      expect(result.current.defaultTemplate).toBeDefined()
      expect(result.current.defaultTemplate.isDefault).toBe(true)
    })

    it('duplicates a template', async () => {
      const { result } = renderHook(() => useTemplates(), { wrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const originalId = result.current.defaultTemplate.id
      const initialCount = result.current.templates.length

      act(() => {
        result.current.duplicateTemplate(originalId, 'Duplicated Template')
      })

      expect(result.current.templates.length).toBe(initialCount + 1)
      const duplicate = result.current.templates.find(t => t.name === 'Duplicated Template')
      expect(duplicate).toBeDefined()
      expect(duplicate.isDefault).toBe(false)
    })
  })

  describe('Data Persistence', () => {
    it('persists data to localStorage on change', async () => {
      const { result } = renderHook(() => useGroups(), { wrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addGroup({ name: 'Persistent Group', templateId: 't1' })
      })

      // Small delay for persistence
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      const stored = storageService.getData()
      expect(Object.values(stored.groups).find(g => g.name === 'Persistent Group')).toBeDefined()
    })
  })
})

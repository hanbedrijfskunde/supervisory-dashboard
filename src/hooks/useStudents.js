import { useMemo, useCallback } from 'react'
import { useAppContext, ActionTypes } from '../context/AppContext'
import { generateId } from '../utils/idUtils'

/**
 * Hook for student management
 * @returns {Object} Student data and actions
 */
export function useStudents() {
  const { state, dispatch } = useAppContext()

  // Get students for a specific group
  const getStudentsForGroup = useCallback((groupId) => {
    const group = state.groups[groupId]
    if (!group) return []
    return Object.values(group.students || {})
  }, [state.groups])

  // Get a single student
  const getStudent = useCallback((groupId, studentId) => {
    const group = state.groups[groupId]
    if (!group) return null
    return group.students?.[studentId] || null
  }, [state.groups])

  // Add a student to a group
  // Optionally accepts a template to initialize milestones
  const addStudent = useCallback((groupId, studentData, template = null) => {
    // Initialize milestones from template if provided
    const initialMilestones = {}
    if (template?.milestones) {
      template.milestones.forEach(milestone => {
        initialMilestones[milestone.id] = {
          done: false,
          date: null,
          count: milestone.tracking === 'counter' ? 0 : undefined,
          format: milestone.type === 'visit' ? null : undefined
        }
      })
    }

    const student = {
      id: generateId(),
      milestones: initialMilestones,
      notes: [],
      ...studentData
    }
    dispatch({
      type: ActionTypes.ADD_STUDENT,
      payload: { groupId, student }
    })
    return student
  }, [dispatch])

  // Update a student
  const updateStudent = useCallback((groupId, studentId, updates) => {
    dispatch({
      type: ActionTypes.UPDATE_STUDENT,
      payload: { groupId, studentId, updates }
    })
  }, [dispatch])

  // Delete a student
  const deleteStudent = useCallback((groupId, studentId) => {
    dispatch({
      type: ActionTypes.DELETE_STUDENT,
      payload: { groupId, studentId }
    })
  }, [dispatch])

  // Get all students across all active groups
  const getAllStudents = useMemo(() => {
    const students = []
    Object.entries(state.groups).forEach(([groupId, group]) => {
      if (group.status !== 'archived') {
        Object.values(group.students || {}).forEach(student => {
          students.push({ ...student, groupId, groupName: group.name })
        })
      }
    })
    return students
  }, [state.groups])

  return {
    getStudentsForGroup,
    getStudent,
    addStudent,
    updateStudent,
    deleteStudent,
    getAllStudents
  }
}

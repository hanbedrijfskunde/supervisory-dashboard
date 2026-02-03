/**
 * Action types for app state management
 */
export const ActionTypes = {
  LOAD_DATA: 'LOAD_DATA',
  ADD_GROUP: 'ADD_GROUP',
  UPDATE_GROUP: 'UPDATE_GROUP',
  DELETE_GROUP: 'DELETE_GROUP',
  ARCHIVE_GROUP: 'ARCHIVE_GROUP',
  ADD_STUDENT: 'ADD_STUDENT',
  UPDATE_STUDENT: 'UPDATE_STUDENT',
  DELETE_STUDENT: 'DELETE_STUDENT',
  UPDATE_MILESTONE_STATUS: 'UPDATE_MILESTONE_STATUS',
  ADD_NOTE: 'ADD_NOTE',
  DELETE_NOTE: 'DELETE_NOTE',
  ADD_TEMPLATE: 'ADD_TEMPLATE',
  UPDATE_TEMPLATE: 'UPDATE_TEMPLATE',
  ARCHIVE_TEMPLATE: 'ARCHIVE_TEMPLATE',
  ADD_CUSTOM_ROLE: 'ADD_CUSTOM_ROLE',
  DELETE_CUSTOM_ROLE: 'DELETE_CUSTOM_ROLE'
}

/**
 * Standard instructor roles
 */
export const STANDARD_ROLES = [
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'assessor', label: 'Assessor' }
]

/**
 * App state reducer
 * @param {Object} state - Current state
 * @param {Object} action - Action with type and payload
 * @returns {Object} New state
 */
export function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.LOAD_DATA:
      return { ...action.payload }

    case ActionTypes.ADD_GROUP:
      return {
        ...state,
        groups: {
          ...state.groups,
          [action.payload.id]: action.payload
        }
      }

    case ActionTypes.UPDATE_GROUP:
      return {
        ...state,
        groups: {
          ...state.groups,
          [action.payload.id]: {
            ...state.groups[action.payload.id],
            ...action.payload.updates
          }
        }
      }

    case ActionTypes.DELETE_GROUP: {
      const { [action.payload.id]: deleted, ...remainingGroups } = state.groups
      return {
        ...state,
        groups: remainingGroups
      }
    }

    case ActionTypes.ARCHIVE_GROUP:
      return {
        ...state,
        groups: {
          ...state.groups,
          [action.payload.id]: {
            ...state.groups[action.payload.id],
            status: 'archived'
          }
        }
      }

    case ActionTypes.ADD_STUDENT:
      return {
        ...state,
        groups: {
          ...state.groups,
          [action.payload.groupId]: {
            ...state.groups[action.payload.groupId],
            students: {
              ...state.groups[action.payload.groupId].students,
              [action.payload.student.id]: action.payload.student
            }
          }
        }
      }

    case ActionTypes.UPDATE_STUDENT:
      return {
        ...state,
        groups: {
          ...state.groups,
          [action.payload.groupId]: {
            ...state.groups[action.payload.groupId],
            students: {
              ...state.groups[action.payload.groupId].students,
              [action.payload.studentId]: {
                ...state.groups[action.payload.groupId].students[action.payload.studentId],
                ...action.payload.updates
              }
            }
          }
        }
      }

    case ActionTypes.DELETE_STUDENT: {
      const group = state.groups[action.payload.groupId]
      const { [action.payload.studentId]: deleted, ...remainingStudents } = group.students
      return {
        ...state,
        groups: {
          ...state.groups,
          [action.payload.groupId]: {
            ...group,
            students: remainingStudents
          }
        }
      }
    }

    case ActionTypes.UPDATE_MILESTONE_STATUS: {
      const { groupId, studentId, milestoneId, status, updates } = action.payload
      const student = state.groups[groupId].students[studentId]
      const currentStatus = student.milestones?.[milestoneId] || { done: false }

      // Support both direct status object and updates function
      const newStatus = updates
        ? { ...currentStatus, ...updates(currentStatus) }
        : { ...currentStatus, ...status }

      return {
        ...state,
        groups: {
          ...state.groups,
          [groupId]: {
            ...state.groups[groupId],
            students: {
              ...state.groups[groupId].students,
              [studentId]: {
                ...student,
                milestones: {
                  ...student.milestones,
                  [milestoneId]: newStatus
                }
              }
            }
          }
        }
      }
    }

    case ActionTypes.ADD_NOTE: {
      const { groupId, studentId, note } = action.payload
      const student = state.groups[groupId].students[studentId]
      return {
        ...state,
        groups: {
          ...state.groups,
          [groupId]: {
            ...state.groups[groupId],
            students: {
              ...state.groups[groupId].students,
              [studentId]: {
                ...student,
                notes: [...(student.notes || []), note]
              }
            }
          }
        }
      }
    }

    case ActionTypes.DELETE_NOTE: {
      const { groupId, studentId, noteId } = action.payload
      const student = state.groups[groupId].students[studentId]
      return {
        ...state,
        groups: {
          ...state.groups,
          [groupId]: {
            ...state.groups[groupId],
            students: {
              ...state.groups[groupId].students,
              [studentId]: {
                ...student,
                notes: student.notes.filter(n => n.id !== noteId)
              }
            }
          }
        }
      }
    }

    case ActionTypes.ADD_TEMPLATE:
      return {
        ...state,
        templates: {
          ...state.templates,
          [action.payload.id]: action.payload
        }
      }

    case ActionTypes.UPDATE_TEMPLATE:
      return {
        ...state,
        templates: {
          ...state.templates,
          [action.payload.id]: {
            ...state.templates[action.payload.id],
            ...action.payload.updates
          }
        }
      }

    case ActionTypes.ARCHIVE_TEMPLATE:
      return {
        ...state,
        templates: {
          ...state.templates,
          [action.payload.id]: {
            ...state.templates[action.payload.id],
            archived: true
          }
        }
      }

    case ActionTypes.ADD_CUSTOM_ROLE:
      return {
        ...state,
        customRoles: [...(state.customRoles || []), action.payload.role]
      }

    case ActionTypes.DELETE_CUSTOM_ROLE:
      return {
        ...state,
        customRoles: (state.customRoles || []).filter(r => r !== action.payload.role)
      }

    default:
      return state
  }
}

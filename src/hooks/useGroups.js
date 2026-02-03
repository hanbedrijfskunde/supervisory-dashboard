import { useMemo, useCallback } from 'react'
import { useAppContext, ActionTypes } from '../context/AppContext'
import { generateId } from '../utils/idUtils'

/**
 * Hook for group management
 * @returns {Object} Groups data and actions
 */
export function useGroups() {
  const { state, dispatch } = useAppContext()

  // All groups as array
  const groups = useMemo(() => {
    return Object.values(state.groups)
  }, [state.groups])

  // Active (non-archived) groups
  const activeGroups = useMemo(() => {
    return groups.filter(g => g.status !== 'archived')
  }, [groups])

  // Archived groups
  const archivedGroups = useMemo(() => {
    return groups.filter(g => g.status === 'archived')
  }, [groups])

  // Get a single group by ID
  const getGroup = useCallback((id) => {
    return state.groups[id]
  }, [state.groups])

  // Add a new group
  const addGroup = useCallback((groupData) => {
    const group = {
      id: generateId(),
      status: 'active',
      createdAt: new Date().toISOString(),
      students: {},
      ...groupData
    }
    dispatch({ type: ActionTypes.ADD_GROUP, payload: group })
    return group
  }, [dispatch])

  // Update a group
  const updateGroup = useCallback((id, updates) => {
    dispatch({
      type: ActionTypes.UPDATE_GROUP,
      payload: { id, updates }
    })
  }, [dispatch])

  // Delete a group
  const deleteGroup = useCallback((id) => {
    dispatch({
      type: ActionTypes.DELETE_GROUP,
      payload: { id }
    })
  }, [dispatch])

  // Archive a group
  const archiveGroup = useCallback((id) => {
    dispatch({
      type: ActionTypes.ARCHIVE_GROUP,
      payload: { id }
    })
  }, [dispatch])

  // Unarchive a group
  const unarchiveGroup = useCallback((id) => {
    dispatch({
      type: ActionTypes.UPDATE_GROUP,
      payload: { id, updates: { status: 'active' } }
    })
  }, [dispatch])

  return {
    groups,
    activeGroups,
    archivedGroups,
    getGroup,
    addGroup,
    updateGroup,
    deleteGroup,
    archiveGroup,
    unarchiveGroup
  }
}

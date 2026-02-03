import { useCallback } from 'react'
import { useAppContext, ActionTypes } from '../context/AppContext'
import { generateId } from '../utils/idUtils'

/**
 * Hook for managing student notes
 * @returns {Object} Note actions
 */
export function useNotes() {
  const { dispatch } = useAppContext()

  /**
   * Add a note to a student
   * @param {string} groupId
   * @param {string} studentId
   * @param {string} text - Note content
   */
  const addNote = useCallback((groupId, studentId, text) => {
    const note = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      text: text.trim()
    }
    dispatch({
      type: ActionTypes.ADD_NOTE,
      payload: { groupId, studentId, note }
    })
    return note
  }, [dispatch])

  /**
   * Delete a note from a student
   * @param {string} groupId
   * @param {string} studentId
   * @param {string} noteId
   */
  const deleteNote = useCallback((groupId, studentId, noteId) => {
    dispatch({
      type: ActionTypes.DELETE_NOTE,
      payload: { groupId, studentId, noteId }
    })
  }, [dispatch])

  return {
    addNote,
    deleteNote
  }
}

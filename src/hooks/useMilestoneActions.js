import { useCallback } from 'react'
import { useAppContext, ActionTypes } from '../context/AppContext'

/**
 * Hook for milestone actions (toggle, set date, set count, etc.)
 * @returns {Object} Milestone action functions
 */
export function useMilestoneActions() {
  const { dispatch } = useAppContext()

  /**
   * Toggle a milestone's done status
   * For checkbox_date type, also sets the date to today when checking
   * @param {string} groupId
   * @param {string} studentId
   * @param {string} milestoneId
   * @param {string} trackingType - The tracking type of the milestone
   */
  const toggleMilestone = useCallback((groupId, studentId, milestoneId, trackingType) => {
    dispatch({
      type: ActionTypes.UPDATE_MILESTONE_STATUS,
      payload: {
        groupId,
        studentId,
        milestoneId,
        updates: (currentStatus) => {
          const newDone = !currentStatus?.done
          const updates = { done: newDone }

          // For checkbox_date type, set date to today when marking as done
          if (trackingType === 'checkbox_date' && newDone) {
            updates.date = new Date().toISOString().slice(0, 10)
          }

          return updates
        }
      }
    })
  }, [dispatch])

  /**
   * Set a milestone's date
   * @param {string} groupId
   * @param {string} studentId
   * @param {string} milestoneId
   * @param {string} date - ISO date string
   */
  const setMilestoneDate = useCallback((groupId, studentId, milestoneId, date) => {
    dispatch({
      type: ActionTypes.UPDATE_MILESTONE_STATUS,
      payload: {
        groupId,
        studentId,
        milestoneId,
        status: { date }
      }
    })
  }, [dispatch])

  /**
   * Set a milestone's counter value
   * @param {string} groupId
   * @param {string} studentId
   * @param {string} milestoneId
   * @param {number} count
   */
  const setMilestoneCount = useCallback((groupId, studentId, milestoneId, count) => {
    dispatch({
      type: ActionTypes.UPDATE_MILESTONE_STATUS,
      payload: {
        groupId,
        studentId,
        milestoneId,
        status: { count }
      }
    })
  }, [dispatch])

  /**
   * Increment a milestone's counter value
   * @param {string} groupId
   * @param {string} studentId
   * @param {string} milestoneId
   * @param {number} max - Maximum value for the counter
   */
  const incrementMilestoneCount = useCallback((groupId, studentId, milestoneId, max) => {
    dispatch({
      type: ActionTypes.UPDATE_MILESTONE_STATUS,
      payload: {
        groupId,
        studentId,
        milestoneId,
        updates: (currentStatus) => {
          const currentCount = currentStatus?.count || 0
          const newCount = Math.min(currentCount + 1, max)
          return {
            count: newCount,
            done: newCount >= max
          }
        }
      }
    })
  }, [dispatch])

  /**
   * Decrement a milestone's counter value
   * @param {string} groupId
   * @param {string} studentId
   * @param {string} milestoneId
   */
  const decrementMilestoneCount = useCallback((groupId, studentId, milestoneId) => {
    dispatch({
      type: ActionTypes.UPDATE_MILESTONE_STATUS,
      payload: {
        groupId,
        studentId,
        milestoneId,
        updates: (currentStatus) => {
          const currentCount = currentStatus?.count || 0
          const newCount = Math.max(currentCount - 1, 0)
          return {
            count: newCount,
            done: false
          }
        }
      }
    })
  }, [dispatch])

  /**
   * Set a milestone's format (e.g., 'physical' or 'teams' for visits)
   * @param {string} groupId
   * @param {string} studentId
   * @param {string} milestoneId
   * @param {string} format
   */
  const setMilestoneFormat = useCallback((groupId, studentId, milestoneId, format) => {
    dispatch({
      type: ActionTypes.UPDATE_MILESTONE_STATUS,
      payload: {
        groupId,
        studentId,
        milestoneId,
        status: { format }
      }
    })
  }, [dispatch])

  /**
   * Update milestone with multiple values at once
   * @param {string} groupId
   * @param {string} studentId
   * @param {string} milestoneId
   * @param {Object} status - Status updates (done, date, count, format)
   */
  const updateMilestone = useCallback((groupId, studentId, milestoneId, status) => {
    dispatch({
      type: ActionTypes.UPDATE_MILESTONE_STATUS,
      payload: {
        groupId,
        studentId,
        milestoneId,
        status
      }
    })
  }, [dispatch])

  return {
    toggleMilestone,
    setMilestoneDate,
    setMilestoneCount,
    incrementMilestoneCount,
    decrementMilestoneCount,
    setMilestoneFormat,
    updateMilestone
  }
}

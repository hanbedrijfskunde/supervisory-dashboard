import { useMemo, useCallback } from 'react'
import { getMilestoneStatus, getMilestoneDeadline } from '../utils/dateUtils'

/**
 * Hook for student calculations (status, deadlines, progress)
 * @returns {Object} Calculation functions
 */
export function useStudentCalculations() {
  /**
   * Get count of overdue milestones for a student
   * @param {Object} student - Student object
   * @param {Object} template - Template object
   * @returns {number} Count of overdue milestones
   */
  const getOverdueCount = useCallback((student, template) => {
    if (!student || !template) return 0
    const scheduledMilestones = template.milestones.filter(m => m.week !== null)
    return scheduledMilestones.filter(milestone => {
      const status = getMilestoneStatus(milestone, student.milestones, student.startDate)
      return status === 'overdue'
    }).length
  }, [])

  /**
   * Get count of upcoming milestones (due within 7 days) for a student
   * @param {Object} student - Student object
   * @param {Object} template - Template object
   * @returns {number} Count of upcoming milestones
   */
  const getUpcomingCount = useCallback((student, template) => {
    if (!student || !template) return 0
    const scheduledMilestones = template.milestones.filter(m => m.week !== null)
    return scheduledMilestones.filter(milestone => {
      const status = getMilestoneStatus(milestone, student.milestones, student.startDate)
      return status === 'upcoming'
    }).length
  }, [])

  /**
   * Get the next upcoming deadline for a student
   * @param {Object} student - Student object
   * @param {Object} template - Template object
   * @returns {Object|null} Next deadline info { milestone, deadline, status }
   */
  const getNextDeadline = useCallback((student, template) => {
    if (!student || !template) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all incomplete milestones with deadlines
    const incompleteMilestones = template.milestones
      .filter(m => m.week !== null && !student.milestones?.[m.id]?.done)
      .map(milestone => ({
        milestone,
        deadline: getMilestoneDeadline(student.startDate, milestone.week),
        status: getMilestoneStatus(milestone, student.milestones, student.startDate)
      }))
      .sort((a, b) => a.deadline - b.deadline)

    // Return the first one (closest deadline)
    return incompleteMilestones[0] || null
  }, [])

  /**
   * Get overall student status (urgency level)
   * @param {Object} student - Student object
   * @param {Object} template - Template object
   * @returns {'red'|'yellow'|'green'} Urgency status
   */
  const getStudentStatus = useCallback((student, template) => {
    if (!student || !template) return 'green'

    const overdueCount = getOverdueCount(student, template)
    if (overdueCount > 0) return 'red'

    const upcomingCount = getUpcomingCount(student, template)
    if (upcomingCount > 0) return 'yellow'

    return 'green'
  }, [getOverdueCount, getUpcomingCount])

  /**
   * Get completed milestone count
   * @param {Object} student - Student object
   * @param {Object} template - Template object
   * @returns {number} Count of completed milestones
   */
  const getCompletedCount = useCallback((student, template) => {
    if (!student || !template) return 0
    return Object.values(student.milestones || {}).filter(m => m.done).length
  }, [])

  /**
   * Get total scheduled milestone count (excludes optional/resit milestones)
   * @param {Object} template - Template object
   * @returns {number} Count of scheduled milestones
   */
  const getScheduledMilestoneCount = useCallback((template) => {
    if (!template) return 0
    return template.milestones.filter(m => m.week !== null).length
  }, [])

  return {
    getStudentStatus,
    getNextDeadline,
    getOverdueCount,
    getUpcomingCount,
    getCompletedCount,
    getScheduledMilestoneCount
  }
}

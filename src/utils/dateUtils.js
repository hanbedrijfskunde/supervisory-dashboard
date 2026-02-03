const MILLIS_PER_DAY = 24 * 60 * 60 * 1000
const MILLIS_PER_WEEK = 7 * MILLIS_PER_DAY

/**
 * Calculate current week number from start date
 * @param {string} startDate - ISO date string
 * @returns {number} Current week (0-indexed)
 */
export function getCurrentWeek(startDate) {
  const start = new Date(startDate)
  const today = new Date()
  // Reset time to midnight for accurate day calculation
  start.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  const diffMs = today - start
  return Math.floor(diffMs / MILLIS_PER_WEEK)
}

/**
 * Calculate end date from start date and duration
 * @param {string} startDate - ISO date string
 * @param {number} durationWeeks - Number of weeks
 * @returns {Date} End date
 */
export function getEndDate(startDate, durationWeeks) {
  const start = new Date(startDate)
  return new Date(start.getTime() + durationWeeks * MILLIS_PER_WEEK)
}

/**
 * Calculate milestone deadline from start date and week offset
 * @param {string} startDate - ISO date string
 * @param {number} weekOffset - Week number for the milestone
 * @returns {Date} Deadline date
 */
export function getMilestoneDeadline(startDate, weekOffset) {
  const start = new Date(startDate)
  return new Date(start.getTime() + weekOffset * MILLIS_PER_WEEK)
}

/**
 * Format a date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (e.g., "3 Feb 2026")
 */
export function formatDate(date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Parse an ISO date string
 * @param {string} dateString - ISO date string
 * @returns {Date} Parsed date
 */
export function parseDate(dateString) {
  return new Date(dateString)
}

/**
 * Get milestone status based on deadline and completion
 * @param {Object} milestone - Milestone definition with week property
 * @param {Object} studentMilestones - Student's milestone statuses
 * @param {string} startDate - Student's start date
 * @returns {'completed'|'overdue'|'upcoming'|'pending'} Status
 */
export function getMilestoneStatus(milestone, studentMilestones, startDate) {
  const status = studentMilestones?.[milestone.id]
  if (status?.done) return 'completed'

  const deadline = getMilestoneDeadline(startDate, milestone.week)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  deadline.setHours(0, 0, 0, 0)

  const daysUntil = (deadline - today) / MILLIS_PER_DAY

  if (daysUntil < 0) return 'overdue'
  if (daysUntil <= 7) return 'upcoming'
  return 'pending'
}

/**
 * Calculate progress for a student
 * @param {Object} studentMilestones - Student's milestone statuses
 * @param {number} totalMilestones - Total number of milestones
 * @returns {Object} Progress info with done, total, and percentage
 */
export function getProgress(studentMilestones, totalMilestones) {
  const done = Object.values(studentMilestones || {}).filter(m => m.done).length
  return {
    done,
    total: totalMilestones,
    percentage: totalMilestones > 0 ? done / totalMilestones : 0
  }
}

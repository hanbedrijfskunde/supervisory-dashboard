import { useMemo } from 'react'
import { useAppContext } from '../context/AppContext'
import { getMilestoneDeadline, getMilestoneStatus } from '../utils/dateUtils'

/**
 * Hook to get all urgent items (overdue and upcoming) across all active groups
 * @returns {Object} Overdue and upcoming items, plus counts
 */
export function useThisWeekItems() {
  const { state } = useAppContext()

  return useMemo(() => {
    const overdueItems = []
    const upcomingItems = []

    // Iterate through all active groups
    Object.entries(state.groups || {}).forEach(([groupId, group]) => {
      if (group.status === 'archived') return

      const template = state.templates?.[group.templateId]
      if (!template?.milestones) return

      // Iterate through all students in the group
      Object.entries(group.students || {}).forEach(([studentId, student]) => {
        // Check each milestone
        template.milestones.forEach(milestone => {
          // Skip milestones without a scheduled week
          if (milestone.week === null || milestone.week === undefined) return

          const status = getMilestoneStatus(milestone, student.milestones, student.startDate)
          const deadline = getMilestoneDeadline(student.startDate, milestone.week)

          if (status === 'overdue') {
            overdueItems.push({
              id: `${studentId}-${milestone.id}`,
              studentId,
              studentName: student.firstName,
              groupId,
              groupName: group.name,
              milestoneId: milestone.id,
              milestoneName: milestone.name,
              deadline,
              status: 'overdue'
            })
          } else if (status === 'upcoming') {
            upcomingItems.push({
              id: `${studentId}-${milestone.id}`,
              studentId,
              studentName: student.firstName,
              groupId,
              groupName: group.name,
              milestoneId: milestone.id,
              milestoneName: milestone.name,
              deadline,
              status: 'upcoming'
            })
          }
        })
      })
    })

    // Sort overdue items by deadline (oldest first - most urgent)
    overdueItems.sort((a, b) => a.deadline - b.deadline)

    // Sort upcoming items by deadline (soonest first)
    upcomingItems.sort((a, b) => a.deadline - b.deadline)

    return {
      overdueItems,
      upcomingItems,
      overdueCount: overdueItems.length,
      upcomingCount: upcomingItems.length,
      totalCount: overdueItems.length + upcomingItems.length
    }
  }, [state.groups, state.templates])
}

/**
 * Get count of items needing attention for a specific group
 * @param {string} groupId
 * @returns {number} Count of overdue + upcoming items
 */
export function useGroupAttentionCount(groupId) {
  const { state } = useAppContext()

  return useMemo(() => {
    const group = state.groups?.[groupId]
    if (!group || group.status === 'archived') return 0

    const template = state.templates?.[group.templateId]
    if (!template?.milestones) return 0

    let count = 0

    Object.values(group.students || {}).forEach(student => {
      template.milestones.forEach(milestone => {
        if (milestone.week === null || milestone.week === undefined) return

        const status = getMilestoneStatus(milestone, student.milestones, student.startDate)
        if (status === 'overdue' || status === 'upcoming') {
          count++
        }
      })
    })

    return count
  }, [state.groups, state.templates, groupId])
}

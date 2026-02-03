import { useMemo } from 'react'

/**
 * Displays a group card with summary info
 */
export function GroupCard({
  group,
  template,
  onSelect,
  onMenuAction,
  isSelected = false
}) {
  const studentCount = Object.keys(group.students || {}).length

  // Calculate needs-attention count (students with overdue items)
  const needsAttentionCount = useMemo(() => {
    if (!template) return 0

    let count = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    Object.values(group.students || {}).forEach(student => {
      const startDate = new Date(student.startDate)

      // Check if any milestone is overdue
      const hasOverdue = template.milestones.some(milestone => {
        if (milestone.week === null) return false // Skip optional milestones
        const status = student.milestones?.[milestone.id]
        if (status?.done) return false

        const deadline = new Date(startDate.getTime() + milestone.week * 7 * 24 * 60 * 60 * 1000)
        deadline.setHours(0, 0, 0, 0)
        return deadline < today
      })

      if (hasOverdue) count++
    })

    return count
  }, [group.students, template])

  const isArchived = group.status === 'archived'

  return (
    <div
      data-testid={`group-card-${group.id}`}
      onClick={() => onSelect(group.id)}
      className={`
        p-4 rounded-lg border cursor-pointer transition-all
        ${isSelected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
        ${isArchived ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {group.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {studentCount} {studentCount === 1 ? 'student' : 'students'}
          </p>
          {needsAttentionCount > 0 && !isArchived && (
            <p className="text-sm text-red-600 mt-1">
              {needsAttentionCount} need attention
            </p>
          )}
          {isArchived && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 mt-2">
              Archived
            </span>
          )}
        </div>

        {/* Menu button */}
        <button
          data-testid={`group-menu-${group.name}`}
          onClick={(e) => {
            e.stopPropagation()
            onMenuAction(group.id)
          }}
          className="p-1 text-gray-400 hover:text-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Menu for ${group.name}`}
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

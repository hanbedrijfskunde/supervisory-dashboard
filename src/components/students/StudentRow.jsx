import { getCurrentWeek, formatDate } from '../../utils/dateUtils'
import { STANDARD_ROLES } from '../../context/appReducer'

/**
 * Format role for display
 */
function formatRole(role) {
  if (!role) return '-'
  const standardRole = STANDARD_ROLES.find(r => r.value === role)
  return standardRole ? standardRole.label : role
}

/**
 * Status indicator dot component
 */
function StatusIndicator({ status }) {
  const colors = {
    red: 'bg-danger-500',
    yellow: 'bg-warning-500',
    green: 'bg-success-500'
  }

  return (
    <span
      className={`inline-block w-3 h-3 rounded-full ${colors[status]}`}
      title={status === 'red' ? 'Overdue items' : status === 'yellow' ? 'Upcoming deadlines' : 'On track'}
    />
  )
}

/**
 * Progress bar component
 */
function ProgressBar({ completed, total }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">
        {completed}/{total}
      </span>
    </div>
  )
}

/**
 * Single student row in the table
 */
export function StudentRow({
  student,
  template,
  status,
  completedCount,
  totalMilestones,
  nextDeadline,
  onSelect,
  onMenu
}) {
  const currentWeek = getCurrentWeek(student.startDate)

  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
      onClick={() => onSelect(student.id)}
      data-testid={`student-row-${student.id}`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <StatusIndicator status={status} />
          <span className="font-medium text-gray-900">{student.firstName}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-600">{formatRole(student.role)}</td>
      <td className="px-4 py-3 text-gray-600">{student.organisation}</td>
      <td className="px-4 py-3 text-gray-600">{student.organisationCity}</td>
      <td className="px-4 py-3 text-gray-600">{student.specialisation || '-'}</td>
      <td className="px-4 py-3 text-gray-600">
        <span className="whitespace-nowrap">
          Week {currentWeek} / {template.durationWeeks}
        </span>
      </td>
      <td className="px-4 py-3 w-40">
        <ProgressBar completed={completedCount} total={totalMilestones} />
      </td>
      <td className="px-4 py-3 text-gray-600 text-sm">
        {nextDeadline ? (
          <span className={nextDeadline.status === 'overdue' ? 'text-danger-600 font-medium' : ''}>
            {nextDeadline.milestone.name}
            <br />
            <span className="text-xs text-gray-400">
              {formatDate(nextDeadline.deadline)}
            </span>
          </span>
        ) : (
          <span className="text-success-600">All done</span>
        )}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMenu(student.id, e)
          }}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          data-testid={`student-menu-${student.id}`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </td>
    </tr>
  )
}

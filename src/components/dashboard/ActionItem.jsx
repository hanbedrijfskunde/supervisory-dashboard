import { formatDate } from '../../utils/dateUtils'

/**
 * Single action item in the This Week panel
 */
export function ActionItem({ item, onClick }) {
  const { studentName, groupName, milestoneName, deadline, status } = item

  const statusColors = {
    overdue: 'border-l-red-500 bg-red-50',
    upcoming: 'border-l-yellow-500 bg-yellow-50'
  }

  const dotColors = {
    overdue: 'bg-red-500',
    upcoming: 'bg-yellow-500'
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 border-l-4 rounded-r-lg hover:opacity-80 transition-opacity ${statusColors[status]}`}
    >
      <div className="flex items-start gap-2">
        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColors[status]}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {studentName} - {milestoneName}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
            <span>{groupName}</span>
            <span>•</span>
            <span>{status === 'overdue' ? 'Was due' : 'Due'}: {formatDate(deadline)}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

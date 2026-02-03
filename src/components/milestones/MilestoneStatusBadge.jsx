/**
 * Visual badge showing milestone status (overdue/upcoming/pending/completed)
 */
export function MilestoneStatusBadge({ status }) {
  const config = {
    overdue: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'Overdue'
    },
    upcoming: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: 'Due soon'
    },
    pending: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      label: 'Pending'
    },
    completed: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Done'
    }
  }

  const { bg, text, label } = config[status] || config.pending

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  )
}

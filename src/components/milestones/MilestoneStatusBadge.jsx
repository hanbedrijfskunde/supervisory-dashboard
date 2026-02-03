/**
 * Visual badge showing milestone status (overdue/upcoming/pending/completed)
 */
export function MilestoneStatusBadge({ status }) {
  const config = {
    overdue: {
      bg: 'bg-danger-100',
      text: 'text-danger-700',
      label: 'Overdue'
    },
    upcoming: {
      bg: 'bg-warning-100',
      text: 'text-warning-700',
      label: 'Due soon'
    },
    pending: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      label: 'Pending'
    },
    completed: {
      bg: 'bg-success-100',
      text: 'text-success-700',
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

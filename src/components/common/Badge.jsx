/**
 * Badge component for status indicators and labels
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className = ''
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    danger: 'bg-danger-100 text-danger-700',
    secondary: 'bg-secondary-100 text-secondary-700'
  }

  const dotColors = {
    default: 'bg-gray-500',
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    secondary: 'bg-secondary-500'
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm'
  }

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1.5 -mr-1 h-4 w-4 inline-flex items-center justify-center rounded-full hover:bg-black/10 focus:outline-none"
          aria-label="Remove"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  )
}

/**
 * Status badge with predefined status-to-variant mapping
 */
export function StatusBadge({ status, className = '' }) {
  const statusConfig = {
    overdue: { variant: 'danger', label: 'Overdue', dot: true },
    upcoming: { variant: 'warning', label: 'Due soon', dot: true },
    pending: { variant: 'default', label: 'Pending', dot: true },
    completed: { variant: 'success', label: 'Done', dot: true },
    active: { variant: 'success', label: 'Active', dot: true },
    archived: { variant: 'default', label: 'Archived', dot: true }
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <Badge variant={config.variant} dot={config.dot} className={className}>
      {config.label}
    </Badge>
  )
}

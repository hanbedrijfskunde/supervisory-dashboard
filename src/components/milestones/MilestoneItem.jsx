import { getMilestoneDeadline, formatDate, getMilestoneStatus } from '../../utils/dateUtils'
import { MilestoneStatusBadge } from './MilestoneStatusBadge'

/**
 * Single milestone item - renders based on tracking type
 * @param {Object} props
 * @param {Object} props.milestone - Milestone definition from template
 * @param {Object} props.status - Current milestone status for the student
 * @param {string} props.startDate - Student's start date
 * @param {Function} props.onToggle - Toggle done status
 * @param {Function} props.onDateChange - Change date
 * @param {Function} props.onCountChange - Change count value
 * @param {Function} props.onIncrement - Increment counter
 * @param {Function} props.onDecrement - Decrement counter
 * @param {Function} props.onFormatChange - Change format (for visits)
 */
export function MilestoneItem({
  milestone,
  status = {},
  startDate,
  onToggle,
  onDateChange,
  onCountChange,
  onIncrement,
  onDecrement,
  onFormatChange
}) {
  const { id, name, week, tracking, counterMax, type } = milestone
  const { done = false, date = '', count = 0, format = null } = status

  // Calculate deadline and status
  const deadline = week !== null ? getMilestoneDeadline(startDate, week) : null
  const milestoneStatus = week !== null
    ? getMilestoneStatus(milestone, { [id]: status }, startDate)
    : done ? 'completed' : 'pending'

  // Status-based styling
  const statusClasses = {
    overdue: 'border-red-200 bg-red-50',
    upcoming: 'border-yellow-200 bg-yellow-50',
    pending: 'border-gray-200 bg-white',
    completed: 'border-green-200 bg-green-50'
  }

  const handleCheckboxChange = () => {
    onToggle?.(id, tracking)
  }

  const handleDateChange = (e) => {
    onDateChange?.(id, e.target.value)
  }

  const handleCountChange = (e) => {
    const value = parseInt(e.target.value, 10) || 0
    const clampedValue = Math.max(0, Math.min(value, counterMax || 10))
    onCountChange?.(id, clampedValue)
  }

  const handleIncrement = () => {
    onIncrement?.(id, counterMax || 10)
  }

  const handleDecrement = () => {
    onDecrement?.(id)
  }

  const handleFormatChange = (e) => {
    onFormatChange?.(id, e.target.value)
  }

  const renderTrackingControl = () => {
    switch (tracking) {
      case 'checkbox':
        return (
          <input
            type="checkbox"
            id={`milestone-${id}`}
            checked={done}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            aria-label={name}
          />
        )

      case 'checkbox_date':
        return (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={`milestone-${id}`}
              checked={done}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              aria-label={name}
            />
            <input
              type="date"
              value={date || ''}
              onChange={handleDateChange}
              data-testid={`milestone-${id}-date`}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={!done}
            />
          </div>
        )

      case 'counter':
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={count <= 0}
              data-testid={`${id}-decrement`}
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Decrease ${name}`}
            >
              −
            </button>
            <span className="text-sm font-medium w-12 text-center" data-testid={`${id}-count`}>
              {count}/{counterMax || 0}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={count >= (counterMax || 0)}
              data-testid={`${id}-increment`}
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Increase ${name}`}
            >
              +
            </button>
          </div>
        )

      case 'date':
        return (
          <input
            type="date"
            id={`milestone-${id}`}
            value={date || ''}
            onChange={handleDateChange}
            data-testid={`milestone-${id}-date`}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        )

      default:
        return null
    }
  }

  return (
    <div
      className={`p-3 border rounded-lg ${statusClasses[milestoneStatus]} milestone-${milestoneStatus}`}
      data-testid={`milestone-${id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <label
              htmlFor={`milestone-${id}`}
              className={`font-medium text-sm ${done ? 'text-gray-500 line-through' : 'text-gray-900'}`}
            >
              {name}
            </label>
            <MilestoneStatusBadge status={milestoneStatus} />
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            {week !== null && (
              <>
                <span>Week {week}</span>
                <span>•</span>
                <span>Due: {formatDate(deadline)}</span>
              </>
            )}
            {type === 'visit' && (
              <select
                value={format || ''}
                onChange={handleFormatChange}
                className="text-xs border-gray-300 rounded py-0.5 px-1"
                aria-label={`${name} format`}
              >
                <option value="">Format</option>
                <option value="physical">Physical</option>
                <option value="teams">Teams</option>
              </select>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          {renderTrackingControl()}
        </div>
      </div>
    </div>
  )
}

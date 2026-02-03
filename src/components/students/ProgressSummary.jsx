import { useStudentCalculations } from '../../hooks/useStudentCalculations'

/**
 * Summary of student progress with progress bar
 */
export function ProgressSummary({ student, template }) {
  const {
    getCompletedCount,
    getScheduledMilestoneCount,
    getOverdueCount,
    getUpcomingCount
  } = useStudentCalculations()

  if (!student || !template) return null

  const completed = getCompletedCount(student, template)
  const total = getScheduledMilestoneCount(template)
  const overdue = getOverdueCount(student, template)
  const upcoming = getUpcomingCount(student, template)
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Progress</h3>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-900 font-medium">{completed}/{total} milestones</span>
          <span className="text-gray-500">{percentage}%</span>
        </div>
        <div
          className="h-2 bg-gray-200 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`Progress: ${completed} of ${total} milestones completed`}
        >
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex gap-4">
        {overdue > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-danger-500 rounded-full" />
            <span className="text-sm text-gray-600">{overdue} overdue</span>
          </div>
        )}
        {upcoming > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-warning-500 rounded-full" />
            <span className="text-sm text-gray-600">{upcoming} upcoming</span>
          </div>
        )}
        {overdue === 0 && upcoming === 0 && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-success-500 rounded-full" />
            <span className="text-sm text-gray-600">On track</span>
          </div>
        )}
      </div>
    </div>
  )
}

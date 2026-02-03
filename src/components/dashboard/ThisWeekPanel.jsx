import { useThisWeekItems } from '../../hooks/useThisWeekItems'
import { ActionItem } from './ActionItem'

/**
 * Panel displaying aggregated urgent items across all active groups
 */
export function ThisWeekPanel({ onSelectItem }) {
  const { overdueItems, upcomingItems, overdueCount, upcomingCount, totalCount } = useThisWeekItems()

  if (totalCount === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week</h2>
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium">All caught up!</p>
          <p className="text-sm mt-1">No urgent items this week</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week</h2>

      {/* Summary badges */}
      <div className="flex gap-3 mb-4">
        {overdueCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-danger-100 text-danger-700">
            <span className="w-2 h-2 rounded-full bg-danger-500" />
            {overdueCount} overdue
          </span>
        )}
        {upcomingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-warning-100 text-warning-700">
            <span className="w-2 h-2 rounded-full bg-warning-500" />
            {upcomingCount} upcoming
          </span>
        )}
      </div>

      {/* Items list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {/* Overdue items first */}
        {overdueItems.map(item => (
          <ActionItem
            key={item.id}
            item={item}
            onClick={() => onSelectItem?.(item)}
          />
        ))}

        {/* Then upcoming items */}
        {upcomingItems.map(item => (
          <ActionItem
            key={item.id}
            item={item}
            onClick={() => onSelectItem?.(item)}
          />
        ))}
      </div>
    </div>
  )
}

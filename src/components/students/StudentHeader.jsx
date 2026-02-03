import { Button } from '../common/Button'
import { getCurrentWeek, formatDate, getEndDate } from '../../utils/dateUtils'
import { STANDARD_ROLES } from '../../context/appReducer'

/**
 * Format role for display
 */
function formatRole(role) {
  if (!role) return null
  const standardRole = STANDARD_ROLES.find(r => r.value === role)
  return standardRole ? standardRole.label : role
}

/**
 * Header displaying student information
 */
export function StudentHeader({
  student,
  template,
  onBack,
  onEdit
}) {
  if (!student) return null

  const currentWeek = getCurrentWeek(student.startDate)
  const endDate = template ? getEndDate(student.startDate, template.durationWeeks) : null
  const formattedStartDate = formatDate(student.startDate)
  const formattedEndDate = endDate ? formatDate(endDate) : null

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      {/* Top row: Back button and Edit */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>

      {/* Student name and main info */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{student.firstName}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-gray-600">
          <span>{student.organisation}</span>
          {student.organisationCity && (
            <>
              <span className="text-gray-300">•</span>
              <span>{student.organisationCity}</span>
            </>
          )}
          {student.specialisation && (
            <>
              <span className="text-gray-300">•</span>
              <span>{student.specialisation}</span>
            </>
          )}
        </div>
      </div>

      {/* Secondary info row */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
        {formatRole(student.role) && (
          <div>
            <span className="text-gray-400">My role:</span>{' '}
            <span className="font-medium text-blue-600">{formatRole(student.role)}</span>
          </div>
        )}
        {student.companyCoachName && (
          <div>
            <span className="text-gray-400">Coach:</span> {student.companyCoachName}
          </div>
        )}
        {student.examinerName && (
          <div>
            <span className="text-gray-400">Examiner:</span> {student.examinerName}
          </div>
        )}
        <div>
          <span className="text-gray-400">Start:</span> {formattedStartDate}
        </div>
        {formattedEndDate && (
          <div>
            <span className="text-gray-400">End:</span> {formattedEndDate}
          </div>
        )}
        {template && (
          <div className="font-medium text-blue-600">
            Week {currentWeek + 1} of {template.durationWeeks}
          </div>
        )}
      </div>
    </div>
  )
}

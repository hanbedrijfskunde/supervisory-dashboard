import { useState, useMemo } from 'react'
import { StudentRow } from './StudentRow'
import { useStudentCalculations } from '../../hooks/useStudentCalculations'

/**
 * Table displaying all students in a group with filtering and sorting
 */
export function StudentTable({
  students,
  template,
  onSelectStudent,
  onMenuStudent,
  onAddStudent
}) {
  const [filterSpecialisation, setFilterSpecialisation] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortField, setSortField] = useState('status')
  const [sortDirection, setSortDirection] = useState('asc')

  const {
    getStudentStatus,
    getNextDeadline,
    getCompletedCount,
    getScheduledMilestoneCount
  } = useStudentCalculations()

  const totalMilestones = getScheduledMilestoneCount(template)

  // Compute student data with calculations
  const studentsWithData = useMemo(() => {
    return students.map(student => ({
      student,
      status: getStudentStatus(student, template),
      completedCount: getCompletedCount(student, template),
      nextDeadline: getNextDeadline(student, template)
    }))
  }, [students, template, getStudentStatus, getCompletedCount, getNextDeadline])

  // Apply filters
  const filteredStudents = useMemo(() => {
    return studentsWithData.filter(({ student, status }) => {
      // Filter by specialisation
      if (filterSpecialisation && student.specialisation !== filterSpecialisation) {
        return false
      }
      // Filter by status
      if (filterStatus === 'needs_attention' && status === 'green') {
        return false
      }
      if (filterStatus === 'on_track' && status !== 'green') {
        return false
      }
      return true
    })
  }, [studentsWithData, filterSpecialisation, filterStatus])

  // Apply sorting
  const sortedStudents = useMemo(() => {
    const statusOrder = { red: 0, yellow: 1, green: 2 }

    return [...filteredStudents].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'status':
          comparison = statusOrder[a.status] - statusOrder[b.status]
          break
        case 'name':
          comparison = a.student.firstName.localeCompare(b.student.firstName)
          break
        case 'organisation':
          comparison = a.student.organisation.localeCompare(b.student.organisation)
          break
        case 'city':
          comparison = (a.student.organisationCity || '').localeCompare(b.student.organisationCity || '')
          break
        case 'specialisation':
          comparison = (a.student.specialisation || '').localeCompare(b.student.specialisation || '')
          break
        case 'role':
          comparison = (a.student.role || '').localeCompare(b.student.role || '')
          break
        case 'progress':
          comparison = a.completedCount - b.completedCount
          break
        default:
          comparison = 0
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredStudents, sortField, sortDirection])

  // Get unique specialisations for filter dropdown
  const specialisations = useMemo(() => {
    const specs = new Set(students.map(s => s.specialisation).filter(Boolean))
    return Array.from(specs).sort()
  }, [students])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortHeader = ({ field, children }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-gray-400">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  )

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No students yet</h3>
        <p className="text-gray-500 mb-4">Add your first student to this group</p>
        <button
          onClick={onAddStudent}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          + Add Student
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          {/* Specialisation filter */}
          <div>
            <label htmlFor="filter-specialisation" className="sr-only">
              Filter by specialisation
            </label>
            <select
              id="filter-specialisation"
              value={filterSpecialisation}
              onChange={(e) => setFilterSpecialisation(e.target.value)}
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              aria-label="Filter by specialisation"
            >
              <option value="">All specialisations</option>
              {specialisations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label htmlFor="filter-status" className="sr-only">
              Filter by status
            </label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              aria-label="Filter by status"
            >
              <option value="all">All students</option>
              <option value="needs_attention">Needs attention</option>
              <option value="on_track">On track</option>
            </select>
          </div>
        </div>

        <button
          onClick={onAddStudent}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
        >
          + Add Student
        </button>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-2">
        Showing {sortedStudents.length} of {students.length} students
      </p>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full" role="table">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <SortHeader field="name">Name</SortHeader>
              <SortHeader field="role">My Role</SortHeader>
              <SortHeader field="organisation">Organisation</SortHeader>
              <SortHeader field="city">City</SortHeader>
              <SortHeader field="specialisation">Specialisation</SortHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Week
              </th>
              <SortHeader field="progress">Progress</SortHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Deadline
              </th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map(({ student, status, completedCount, nextDeadline }, index) => (
              <StudentRow
                key={student.id}
                student={student}
                template={template}
                status={status}
                completedCount={completedCount}
                totalMilestones={totalMilestones}
                nextDeadline={nextDeadline}
                onSelect={onSelectStudent}
                onMenu={onMenuStudent}
                index={index}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

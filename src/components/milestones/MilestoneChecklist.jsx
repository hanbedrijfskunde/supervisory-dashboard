import { MilestoneItem } from './MilestoneItem'
import { useMilestoneActions } from '../../hooks/useMilestoneActions'

/**
 * Displays all milestones for a student grouped by phase
 * @param {Object} props
 * @param {string} props.groupId - Group ID
 * @param {string} props.studentId - Student ID
 * @param {Object} props.student - Student object with milestones
 * @param {Object} props.template - Template with milestone definitions
 */
export function MilestoneChecklist({ groupId, studentId, student, template }) {
  const {
    toggleMilestone,
    setMilestoneDate,
    setMilestoneCount,
    incrementMilestoneCount,
    decrementMilestoneCount,
    setMilestoneFormat
  } = useMilestoneActions()

  if (!template?.milestones || !student) {
    return null
  }

  // Group milestones by phase based on week ranges
  const groupMilestonesByPhase = (milestones) => {
    const phases = {
      'Start (Week 0-2)': [],
      'Early Phase (Week 3-8)': [],
      'Mid Phase (Week 9-14)': [],
      'Final Phase (Week 15+)': [],
      'Unscheduled': []
    }

    milestones.forEach(milestone => {
      if (milestone.week === null || milestone.week === undefined) {
        phases['Unscheduled'].push(milestone)
      } else if (milestone.week <= 2) {
        phases['Start (Week 0-2)'].push(milestone)
      } else if (milestone.week <= 8) {
        phases['Early Phase (Week 3-8)'].push(milestone)
      } else if (milestone.week <= 14) {
        phases['Mid Phase (Week 9-14)'].push(milestone)
      } else {
        phases['Final Phase (Week 15+)'].push(milestone)
      }
    })

    // Filter out empty phases
    return Object.entries(phases).filter(([, items]) => items.length > 0)
  }

  const phases = groupMilestonesByPhase(template.milestones)

  const handleToggle = (milestoneId, trackingType) => {
    toggleMilestone(groupId, studentId, milestoneId, trackingType)
  }

  const handleDateChange = (milestoneId, date) => {
    setMilestoneDate(groupId, studentId, milestoneId, date)
  }

  const handleCountChange = (milestoneId, count) => {
    setMilestoneCount(groupId, studentId, milestoneId, count)
  }

  const handleIncrement = (milestoneId, max) => {
    incrementMilestoneCount(groupId, studentId, milestoneId, max)
  }

  const handleDecrement = (milestoneId) => {
    decrementMilestoneCount(groupId, studentId, milestoneId)
  }

  const handleFormatChange = (milestoneId, format) => {
    setMilestoneFormat(groupId, studentId, milestoneId, format)
  }

  return (
    <div className="space-y-6" data-testid="milestone-checklist">
      {phases.map(([phaseName, milestones]) => (
        <div key={phaseName}>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{phaseName}</h3>
          <div className="space-y-2">
            {milestones.map(milestone => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                status={student.milestones?.[milestone.id]}
                startDate={student.startDate}
                onToggle={handleToggle}
                onDateChange={handleDateChange}
                onCountChange={handleCountChange}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onFormatChange={handleFormatChange}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

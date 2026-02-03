import { StudentHeader } from '../components/students/StudentHeader'
import { ProgressSummary } from '../components/students/ProgressSummary'
import { MilestoneChecklist } from '../components/milestones/MilestoneChecklist'
import { NotesPanel } from '../components/notes/NotesPanel'
import { useNotes } from '../hooks/useNotes'

/**
 * Student detail view showing all information, milestones, and notes
 */
export function StudentDetail({
  groupId,
  student,
  template,
  onBack,
  onEdit
}) {
  const { addNote, deleteNote } = useNotes()

  if (!student) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Student not found</p>
      </div>
    )
  }

  const handleAddNote = (text) => {
    addNote(groupId, student.id, text)
  }

  const handleDeleteNote = (noteId) => {
    deleteNote(groupId, student.id, noteId)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <StudentHeader
        student={student}
        template={template}
        onBack={onBack}
        onEdit={onEdit}
      />

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Progress Summary */}
          <ProgressSummary student={student} template={template} />

          {/* Two column layout on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Milestones (2 columns) */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h3>
                <MilestoneChecklist
                  groupId={groupId}
                  studentId={student.id}
                  student={student}
                  template={template}
                />
              </div>
            </div>

            {/* Notes (1 column) */}
            <div className="lg:col-span-1">
              <NotesPanel
                notes={student.notes || []}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

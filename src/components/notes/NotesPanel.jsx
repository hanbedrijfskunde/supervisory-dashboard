import { useState } from 'react'
import { NoteItem } from './NoteItem'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'

/**
 * Panel for displaying and managing student notes
 */
export function NotesPanel({
  notes = [],
  onAddNote,
  onDeleteNote
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')
  const [deletingNoteId, setDeletingNoteId] = useState(null)

  // Sort notes by timestamp (newest first)
  const sortedNotes = [...notes].sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  )

  const handleAddNote = () => {
    if (newNoteText.trim()) {
      onAddNote(newNoteText)
      setNewNoteText('')
      setShowAddForm(false)
    }
  }

  const handleDeleteClick = (noteId) => {
    setDeletingNoteId(noteId)
  }

  const handleDeleteConfirm = () => {
    if (deletingNoteId) {
      onDeleteNote(deletingNoteId)
      setDeletingNoteId(null)
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAddForm(true)}
        >
          Add note
        </Button>
      </div>

      {sortedNotes.length === 0 ? (
        <p className="text-gray-500 text-sm">No notes yet. Add a note to track progress or important information.</p>
      ) : (
        <div className="space-y-3">
          {sortedNotes.map((note, index) => (
            <NoteItem
              key={note.id}
              note={note}
              index={index}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      <Modal
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false)
          setNewNoteText('')
        }}
        title="Add Note"
      >
        <div className="space-y-4">
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Enter note..."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddForm(false)
                setNewNoteText('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={!newNoteText.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingNoteId}
        onClose={() => setDeletingNoteId(null)}
        title="Delete Note"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to delete this note? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeletingNoteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

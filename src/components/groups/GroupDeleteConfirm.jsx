import { Modal } from '../common/Modal'
import { Button } from '../common/Button'

/**
 * Confirmation modal for group deletion
 */
export function GroupDeleteConfirm({
  isOpen,
  onClose,
  onConfirm,
  group
}) {
  if (!group) return null

  const studentCount = Object.keys(group.students || {}).length

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Group"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Are you sure you want to delete <strong>{group.name}</strong>?
        </p>

        {studentCount > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              <strong>Warning:</strong> This group contains {studentCount}{' '}
              {studentCount === 1 ? 'student' : 'students'}. All student data
              including milestones and notes will be permanently deleted.
            </p>
          </div>
        )}

        <p className="text-sm text-gray-500">
          This action cannot be undone.
        </p>
      </div>
    </Modal>
  )
}

import { useEffect, useRef } from 'react'

/**
 * Dropdown menu for group actions
 */
export function GroupMenu({
  isOpen,
  onClose,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  isArchived = false,
  position = { top: 0, left: 0 }
}) {
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[150px]"
      style={{ top: position.top, left: position.left }}
    >
      <button
        onClick={onEdit}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
      >
        Edit
      </button>

      {isArchived ? (
        <button
          onClick={onUnarchive}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          Unarchive
        </button>
      ) : (
        <button
          onClick={onArchive}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          Archive
        </button>
      )}

      <hr className="my-1 border-gray-200" />

      <button
        onClick={onDelete}
        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  )
}

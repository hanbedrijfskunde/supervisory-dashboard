import { Modal } from './Modal'
import { AVAILABLE_SHORTCUTS } from '../../hooks/useKeyboardShortcuts'

/**
 * Keyboard key display component
 */
function Kbd({ children }) {
  return (
    <kbd className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded shadow-sm">
      {children}
    </kbd>
  )
}

/**
 * Modal showing all available keyboard shortcuts
 */
export function KeyboardShortcutsHelp({ isOpen, onClose }) {
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Use these keyboard shortcuts to navigate quickly.
        </p>

        <div className="space-y-3">
          {AVAILABLE_SHORTCUTS.map((shortcut, index) => {
            const keys = isMac ? shortcut.keys : (shortcut.winKeys || shortcut.keys)

            return (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-700">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {keys.map((key, i) => (
                    <span key={i} className="flex items-center">
                      <Kbd>{key}</Kbd>
                      {i < keys.length - 1 && (
                        <span className="mx-1 text-gray-400">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Press <Kbd>?</Kbd> anytime to show this help
          </p>
        </div>
      </div>
    </Modal>
  )
}

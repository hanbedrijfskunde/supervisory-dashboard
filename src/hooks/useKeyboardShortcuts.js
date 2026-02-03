import { useEffect, useCallback } from 'react'

/**
 * Hook for managing keyboard shortcuts
 * @param {Object} shortcuts - Map of key combinations to callbacks
 * @param {boolean} enabled - Whether shortcuts are active
 *
 * Key format examples:
 * - 'k' - Single key
 * - 'ctrl+k' - Ctrl + key
 * - 'meta+k' - Cmd + key (Mac)
 * - 'ctrl+shift+p' - Multiple modifiers
 * - 'escape' - Special keys
 */
export function useKeyboardShortcuts(shortcuts = {}, enabled = true) {
  const handleKeyDown = useCallback((e) => {
    if (!enabled) return

    // Don't trigger shortcuts when typing in inputs
    const target = e.target
    const isInput = target.tagName === 'INPUT' ||
                   target.tagName === 'TEXTAREA' ||
                   target.isContentEditable

    // Build the key combination string
    const parts = []
    if (e.ctrlKey) parts.push('ctrl')
    if (e.metaKey) parts.push('meta')
    if (e.altKey) parts.push('alt')
    if (e.shiftKey) parts.push('shift')
    parts.push(e.key.toLowerCase())

    const keyCombo = parts.join('+')
    const keyOnly = e.key.toLowerCase()

    // Check for exact match first, then key-only match
    let handler = shortcuts[keyCombo]

    // Also check without modifiers for special keys like Escape
    if (!handler && !e.ctrlKey && !e.metaKey && !e.altKey) {
      handler = shortcuts[keyOnly]
    }

    // For Cmd/Ctrl shortcuts, check both variants
    if (!handler && (e.metaKey || e.ctrlKey)) {
      const altCombo = e.metaKey
        ? keyCombo.replace('meta', 'ctrl')
        : keyCombo.replace('ctrl', 'meta')
      handler = shortcuts[altCombo]
    }

    if (handler) {
      // Allow escape to work in inputs
      if (isInput && keyOnly !== 'escape') {
        return
      }

      e.preventDefault()
      handler(e)
    }
  }, [shortcuts, enabled])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * List of available shortcuts for display
 */
export const AVAILABLE_SHORTCUTS = [
  { keys: ['⌘', 'K'], description: 'Focus search', winKeys: ['Ctrl', 'K'] },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['Esc'], description: 'Close modal / Clear search' },
  { keys: ['N'], description: 'New student (when group selected)' },
  { keys: ['G'], description: 'New group' },
]

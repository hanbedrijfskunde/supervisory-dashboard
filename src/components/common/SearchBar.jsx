import { useState, useRef, useEffect } from 'react'

/**
 * Search bar with keyboard shortcut support
 */
export function SearchBar({
  placeholder = 'Search students...',
  value = '',
  onChange,
  onClear,
  shortcutKey = 'k',
  className = ''
}) {
  const inputRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcutKey) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur()
        onClear?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcutKey, isFocused, onClear])

  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)
  const shortcutHint = isMac ? '⌘K' : 'Ctrl+K'

  return (
    <div className={`relative ${className}`}>
      {/* Search icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="
          block w-full pl-10 pr-20 py-2
          border border-gray-300 rounded-lg
          text-sm placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          transition-all duration-200
        "
      />

      {/* Clear button or keyboard shortcut hint */}
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange?.('')
              onClear?.()
              inputRef.current?.focus()
            }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            {shortcutHint}
          </span>
        )}
      </div>
    </div>
  )
}

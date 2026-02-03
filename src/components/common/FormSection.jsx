import { useState } from 'react'

/**
 * Collapsible form section for progressive disclosure
 */
export function FormSection({
  title,
  description,
  children,
  collapsible = false,
  defaultOpen = true,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (!collapsible) {
    return (
      <div className={`space-y-4 ${className}`}>
        {title && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900">{title}</h4>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    )
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="text-left">
          <span className="text-sm font-medium text-gray-900">{title}</span>
          {description && !isOpen && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`
          transition-all duration-200 ease-in-out
          ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
        `}
      >
        <div className="p-4 space-y-4 border-t border-gray-200">
          {description && isOpen && (
            <p className="text-sm text-gray-500 -mt-2 mb-2">{description}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Form divider with optional label
 */
export function FormDivider({ label }) {
  if (!label) {
    return <hr className="border-gray-200 my-4" />
  }

  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-2 bg-white text-sm text-gray-500">{label}</span>
      </div>
    </div>
  )
}

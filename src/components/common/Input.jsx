/**
 * Reusable form input with label, validation, and help text
 */
export function Input({
  label,
  id,
  type = 'text',
  error,
  required = false,
  helpText,
  className = '',
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        required={required}
        className={`
          block w-full rounded-md shadow-sm text-sm transition-colors
          ${error
            ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
        }
        {...props}
      />
      {helpText && !error && (
        <p id={`${inputId}-help`} className="text-sm text-gray-500">
          {helpText}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-danger-600">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Reusable select dropdown
 */
export function Select({
  label,
  id,
  options = [],
  error,
  required = false,
  helpText,
  placeholder = 'Select...',
  className = '',
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={inputId}
        required={required}
        className={`
          block w-full rounded-md shadow-sm text-sm transition-colors
          ${error
            ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }
        `}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="text-sm text-danger-600">{error}</p>
      )}
    </div>
  )
}

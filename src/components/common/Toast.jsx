import { useEffect, useState } from 'react'

/**
 * Toast notification component
 * @param {Object} props
 * @param {string} props.message - The message to display
 * @param {'success'|'error'|'warning'|'info'} props.type - Type of toast
 * @param {number} props.duration - Duration in ms before auto-dismiss (default 3000)
 * @param {Function} props.onClose - Callback when toast is closed
 */
export function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, 200)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const styles = {
    success: 'bg-success-50 border-success-200 text-success-700',
    error: 'bg-danger-50 border-danger-200 text-danger-700',
    warning: 'bg-warning-50 border-warning-200 text-warning-700',
    info: 'bg-primary-50 border-primary-200 text-primary-700'
  }

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  return (
    <div
      role="alert"
      className={`
        fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3
        rounded-lg border shadow-lg transition-all duration-200
        animate-slide-in-up
        ${styles[type]}
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100'}
      `}
    >
      {icons[type]}
      <span className="font-medium">{message}</span>
      <button
        onClick={() => {
          setIsExiting(true)
          setTimeout(() => {
            setIsVisible(false)
            onClose?.()
          }, 200)
        }}
        className="ml-2 hover:opacity-70 transition-opacity"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

/**
 * Toast container to manage multiple toasts
 */
export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}

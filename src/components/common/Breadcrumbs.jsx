/**
 * Breadcrumbs navigation component
 */
export function Breadcrumbs({ items = [], className = '' }) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-sm ${className}`}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg
                  className="w-4 h-4 text-gray-400 mx-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}

              {isLast ? (
                <span className="text-gray-900 font-medium truncate max-w-[200px]">
                  {item.label}
                </span>
              ) : item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="text-gray-500 hover:text-primary-600 transition-colors truncate max-w-[200px]"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-gray-500 truncate max-w-[200px]">
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

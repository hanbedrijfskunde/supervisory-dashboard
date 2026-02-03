import { useState } from 'react'
import { GroupCard } from './GroupCard'
import { Button } from '../common/Button'

/**
 * Lists all groups with option to show archived
 */
export function GroupList({
  groups,
  archivedGroups,
  templates,
  selectedGroupId,
  onSelectGroup,
  onNewGroup,
  onMenuAction
}) {
  const [showArchived, setShowArchived] = useState(false)

  const getTemplate = (templateId) => templates[templateId]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Groups</h2>
        <Button size="sm" onClick={onNewGroup}>
          + New Group
        </Button>
      </div>

      {/* Groups list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {groups.length === 0 && archivedGroups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No groups yet</p>
            <Button onClick={onNewGroup}>Create your first group</Button>
          </div>
        ) : (
          <>
            {groups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                template={getTemplate(group.templateId)}
                isSelected={group.id === selectedGroupId}
                onSelect={onSelectGroup}
                onMenuAction={onMenuAction}
              />
            ))}

            {/* Archived groups toggle */}
            {archivedGroups.length > 0 && (
              <div className="pt-4 border-t border-gray-200 mt-4">
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <svg
                    className={`h-4 w-4 transition-transform ${showArchived ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {showArchived ? 'Hide' : 'Show'} archived ({archivedGroups.length})
                </button>

                {showArchived && (
                  <div className="mt-3 space-y-3">
                    {archivedGroups.map(group => (
                      <GroupCard
                        key={group.id}
                        group={group}
                        template={getTemplate(group.templateId)}
                        isSelected={group.id === selectedGroupId}
                        onSelect={onSelectGroup}
                        onMenuAction={onMenuAction}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

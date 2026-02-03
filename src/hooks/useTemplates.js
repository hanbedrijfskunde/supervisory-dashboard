import { useMemo, useCallback } from 'react'
import { useAppContext, ActionTypes } from '../context/AppContext'
import { generateId } from '../utils/idUtils'

/**
 * Hook for template management
 * @returns {Object} Template data and actions
 */
export function useTemplates() {
  const { state, dispatch } = useAppContext()

  // All templates as array
  const templates = useMemo(() => {
    return Object.values(state.templates)
  }, [state.templates])

  // Active (non-archived) templates
  const activeTemplates = useMemo(() => {
    return templates.filter(t => !t.archived)
  }, [templates])

  // Get a single template by ID
  const getTemplate = useCallback((id) => {
    return state.templates[id]
  }, [state.templates])

  // Get the default template
  const defaultTemplate = useMemo(() => {
    return templates.find(t => t.isDefault)
  }, [templates])

  // Add a new template
  const addTemplate = useCallback((templateData) => {
    const template = {
      id: generateId(),
      isDefault: false,
      archived: false,
      ...templateData
    }
    dispatch({ type: ActionTypes.ADD_TEMPLATE, payload: template })
    return template
  }, [dispatch])

  // Update a template
  const updateTemplate = useCallback((id, updates) => {
    dispatch({
      type: ActionTypes.UPDATE_TEMPLATE,
      payload: { id, updates }
    })
  }, [dispatch])

  // Archive a template
  const archiveTemplate = useCallback((id) => {
    dispatch({
      type: ActionTypes.ARCHIVE_TEMPLATE,
      payload: { id }
    })
  }, [dispatch])

  // Duplicate a template
  const duplicateTemplate = useCallback((id, newName) => {
    const original = state.templates[id]
    if (!original) return null

    const duplicate = {
      ...original,
      id: generateId(),
      name: newName || `${original.name} (Copy)`,
      isDefault: false,
      archived: false
    }
    dispatch({ type: ActionTypes.ADD_TEMPLATE, payload: duplicate })
    return duplicate
  }, [state.templates, dispatch])

  return {
    templates,
    activeTemplates,
    defaultTemplate,
    getTemplate,
    addTemplate,
    updateTemplate,
    archiveTemplate,
    duplicateTemplate
  }
}

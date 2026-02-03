import { useCallback } from 'react'
import { useAppContext, ActionTypes } from '../context/AppContext'

/**
 * Hook for managing custom instructor roles
 */
export function useCustomRoles() {
  const { state, dispatch } = useAppContext()

  const customRoles = state.customRoles || []

  const addCustomRole = useCallback((role) => {
    // Don't add duplicates
    if (!customRoles.includes(role)) {
      dispatch({
        type: ActionTypes.ADD_CUSTOM_ROLE,
        payload: { role }
      })
    }
  }, [customRoles, dispatch])

  const deleteCustomRole = useCallback((role) => {
    dispatch({
      type: ActionTypes.DELETE_CUSTOM_ROLE,
      payload: { role }
    })
  }, [dispatch])

  return {
    customRoles,
    addCustomRole,
    deleteCustomRole
  }
}

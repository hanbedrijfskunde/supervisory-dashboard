import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { appReducer, ActionTypes } from './appReducer'
import { storageService } from '../services/storageService'
import { initializeApp } from '../services/initService'

/**
 * Initial state structure
 */
const initialState = {
  version: '1.0',
  templates: {},
  groups: {},
  customRoles: []
}

/**
 * App context
 */
const AppContext = createContext(null)

/**
 * App context provider component
 */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load data on mount
  useEffect(() => {
    const data = initializeApp()
    dispatch({ type: ActionTypes.LOAD_DATA, payload: data })
  }, [])

  // Persist to localStorage on state change
  useEffect(() => {
    // Skip initial empty state
    if (Object.keys(state.templates).length > 0 || Object.keys(state.groups).length > 0) {
      storageService.setData(state)
    }
  }, [state])

  // Reload data from storage (used after import)
  const reloadFromStorage = useCallback(() => {
    const data = initializeApp()
    dispatch({ type: ActionTypes.LOAD_DATA, payload: data })
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch, reloadFromStorage }}>
      {children}
    </AppContext.Provider>
  )
}

/**
 * Hook to access app context
 * @returns {{ state: Object, dispatch: Function }}
 */
export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

export { ActionTypes }

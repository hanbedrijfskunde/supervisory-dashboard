import { useAppContext } from '../context/AppContext'

/**
 * Hook to access app data and dispatch
 * Provides convenient access to state and dispatch
 * @returns {{ data: Object, dispatch: Function }}
 */
export function useAppData() {
  const { state, dispatch } = useAppContext()

  return {
    data: state,
    dispatch,
    templates: state.templates,
    groups: state.groups
  }
}

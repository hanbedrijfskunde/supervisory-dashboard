const STORAGE_KEY = 'gi_tracker_data'

/**
 * Storage service for managing app data in localStorage
 */
export const storageService = {
  /**
   * Retrieve full app data from localStorage
   * @returns {Object|null} The stored data or null if empty
   */
  getData() {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return null
    try {
      return JSON.parse(data)
    } catch {
      return null
    }
  },

  /**
   * Save full app data to localStorage
   * @param {Object} data - The data to store
   */
  setData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  },

  /**
   * Clear all app data from localStorage
   * @param {boolean} confirm - Must be true to actually clear
   */
  clearData(confirm = false) {
    if (confirm) {
      localStorage.removeItem(STORAGE_KEY)
    }
  },

  /**
   * Get current storage usage in bytes
   * @returns {number} Bytes used by app data
   */
  getStorageUsage() {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return 0
    return new Blob([data]).size
  }
}

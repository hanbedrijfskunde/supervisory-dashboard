import { storageService } from './storageService'

const EXPORT_VERSION = '1.0'

/**
 * Export service for creating JSON backups
 */
export const exportService = {
  /**
   * Generate export data with metadata
   * @returns {Object} Complete export package
   */
  generateExportData() {
    const data = storageService.getData()

    return {
      exportVersion: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      appVersion: data?.version || '1.0',
      data: {
        templates: data?.templates || {},
        groups: data?.groups || {},
        customRoles: data?.customRoles || []
      }
    }
  },

  /**
   * Convert export data to JSON string
   * @returns {string} JSON string of export data
   */
  toJSON() {
    const exportData = this.generateExportData()
    return JSON.stringify(exportData, null, 2)
  },

  /**
   * Download export as JSON file
   * @param {string} filename - Optional custom filename
   */
  downloadAsFile(filename) {
    const json = this.toJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const defaultFilename = `gi-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    const finalFilename = filename || defaultFilename

    const link = document.createElement('a')
    link.href = url
    link.download = finalFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  /**
   * Get export statistics
   * @returns {Object} Statistics about the data being exported
   */
  getExportStats() {
    const data = storageService.getData()

    const groups = Object.values(data?.groups || {})
    const templates = Object.values(data?.templates || {})

    let totalStudents = 0
    let totalNotes = 0

    groups.forEach(group => {
      const students = Object.values(group.students || {})
      totalStudents += students.length
      students.forEach(student => {
        totalNotes += (student.notes || []).length
      })
    })

    return {
      groupCount: groups.length,
      templateCount: templates.length,
      studentCount: totalStudents,
      noteCount: totalNotes,
      sizeBytes: storageService.getStorageUsage()
    }
  }
}

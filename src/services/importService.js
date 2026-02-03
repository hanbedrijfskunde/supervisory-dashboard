import { storageService } from './storageService'

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the data is valid
 * @property {string[]} errors - List of validation errors
 * @property {Object} stats - Statistics about the import data
 */

/**
 * Import service for loading JSON backups
 */
export const importService = {
  /**
   * Parse JSON file content
   * @param {string} jsonString - Raw JSON string
   * @returns {Object|null} Parsed data or null if invalid
   */
  parseJSON(jsonString) {
    try {
      return JSON.parse(jsonString)
    } catch {
      return null
    }
  },

  /**
   * Validate import data structure
   * @param {Object} importData - Parsed import data
   * @returns {ValidationResult} Validation result
   */
  validate(importData) {
    const errors = []

    if (!importData) {
      return { valid: false, errors: ['Invalid JSON format'], stats: null }
    }

    // Check for required fields
    if (!importData.data) {
      errors.push('Missing "data" field in import file')
    }

    if (importData.data && !importData.data.templates) {
      errors.push('Missing "templates" field in data')
    }

    if (importData.data && !importData.data.groups) {
      errors.push('Missing "groups" field in data')
    }

    // Validate templates structure
    if (importData.data?.templates) {
      Object.entries(importData.data.templates).forEach(([id, template]) => {
        if (!template.name) {
          errors.push(`Template "${id}" is missing a name`)
        }
        if (!Array.isArray(template.milestones)) {
          errors.push(`Template "${id}" is missing milestones array`)
        }
      })
    }

    // Validate groups structure
    if (importData.data?.groups) {
      Object.entries(importData.data.groups).forEach(([id, group]) => {
        if (!group.name) {
          errors.push(`Group "${id}" is missing a name`)
        }
        if (!group.templateId) {
          errors.push(`Group "${id}" is missing a templateId`)
        }
      })
    }

    // Calculate stats
    const stats = this.getImportStats(importData)

    return {
      valid: errors.length === 0,
      errors,
      stats
    }
  },

  /**
   * Get statistics about import data
   * @param {Object} importData - Parsed import data
   * @returns {Object} Statistics
   */
  getImportStats(importData) {
    if (!importData?.data) return null

    const groups = Object.values(importData.data.groups || {})
    const templates = Object.values(importData.data.templates || {})

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
      exportedAt: importData.exportedAt || null,
      exportVersion: importData.exportVersion || 'unknown'
    }
  },

  /**
   * Import data with replace mode (replaces all existing data)
   * @param {Object} importData - Validated import data
   * @returns {boolean} Success status
   */
  importReplace(importData) {
    if (!importData?.data) return false

    const newData = {
      version: importData.appVersion || '1.0',
      templates: importData.data.templates || {},
      groups: importData.data.groups || {},
      customRoles: importData.data.customRoles || []
    }

    storageService.setData(newData)
    return true
  },

  /**
   * Import data with merge mode (adds to existing data)
   * @param {Object} importData - Validated import data
   * @returns {Object} Result with counts of merged items
   */
  importMerge(importData) {
    if (!importData?.data) return { success: false }

    const existingData = storageService.getData() || { version: '1.0', templates: {}, groups: {}, customRoles: [] }

    let templatesAdded = 0
    let groupsAdded = 0
    let groupsSkipped = 0
    let customRolesAdded = 0

    // Merge templates (add new ones, skip existing)
    Object.entries(importData.data.templates || {}).forEach(([id, template]) => {
      if (!existingData.templates[id]) {
        existingData.templates[id] = template
        templatesAdded++
      }
    })

    // Merge groups (add new ones, skip existing)
    Object.entries(importData.data.groups || {}).forEach(([id, group]) => {
      if (!existingData.groups[id]) {
        existingData.groups[id] = group
        groupsAdded++
      } else {
        groupsSkipped++
      }
    })

    // Merge custom roles (add new ones, skip duplicates)
    const existingRoles = existingData.customRoles || []
    const importRoles = importData.data.customRoles || []
    importRoles.forEach(role => {
      if (!existingRoles.includes(role)) {
        existingRoles.push(role)
        customRolesAdded++
      }
    })
    existingData.customRoles = existingRoles

    storageService.setData(existingData)

    return {
      success: true,
      templatesAdded,
      groupsAdded,
      groupsSkipped,
      customRolesAdded
    }
  },

  /**
   * Read file and return content as string
   * @param {File} file - File object from file input
   * @returns {Promise<string>} File content as string
   */
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }
}

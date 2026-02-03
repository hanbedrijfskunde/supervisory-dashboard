import { storageService } from './storageService'
import { defaultTemplate, DEFAULT_TEMPLATE_ID } from '../data/defaultTemplate'
import { bedrijfskundeTemplate, BEDRIJFSKUNDE_TEMPLATE_ID } from '../data/bedrijfskundeTemplate'

const APP_VERSION = '1.0'

/**
 * Initialize app data - seeds default templates if no data exists
 * @returns {Object} The initialized or existing app data
 */
export function initializeApp() {
  const existingData = storageService.getData()

  if (existingData) {
    // Check if we need to add new templates to existing data
    const updatedData = addMissingTemplates(existingData)
    if (updatedData !== existingData) {
      storageService.setData(updatedData)
      return updatedData
    }
    return existingData
  }

  // First run - seed with default templates
  const initialData = {
    version: APP_VERSION,
    templates: {
      [DEFAULT_TEMPLATE_ID]: defaultTemplate,
      [BEDRIJFSKUNDE_TEMPLATE_ID]: bedrijfskundeTemplate
    },
    groups: {}
  }

  storageService.setData(initialData)
  return initialData
}

/**
 * Add any missing default templates to existing data
 * @param {Object} data - Existing app data
 * @returns {Object} Updated data with any missing templates added
 */
function addMissingTemplates(data) {
  const defaultTemplates = {
    [DEFAULT_TEMPLATE_ID]: defaultTemplate,
    [BEDRIJFSKUNDE_TEMPLATE_ID]: bedrijfskundeTemplate
  }

  let updated = false
  const templates = { ...data.templates }

  for (const [id, template] of Object.entries(defaultTemplates)) {
    if (!templates[id]) {
      templates[id] = template
      updated = true
    }
  }

  if (updated) {
    return { ...data, templates }
  }

  return data
}

/**
 * Get app version
 * @returns {string} Current app version
 */
export function getAppVersion() {
  return APP_VERSION
}

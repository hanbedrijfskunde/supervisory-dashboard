import { describe, it, expect, beforeEach, vi } from 'vitest'
import { exportService } from '../../src/services/exportService'
import { importService } from '../../src/services/importService'
import { storageService } from '../../src/services/storageService'

describe('Export Service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('generates export data with metadata', () => {
    // Set up some data
    storageService.setData({
      version: '1.0',
      templates: { t1: { name: 'Test Template', milestones: [] } },
      groups: { g1: { name: 'Test Group', templateId: 't1', students: {} } }
    })

    const exportData = exportService.generateExportData()

    expect(exportData.exportVersion).toBe('1.0')
    expect(exportData.exportedAt).toBeDefined()
    expect(exportData.data.templates).toBeDefined()
    expect(exportData.data.groups).toBeDefined()
  })

  it('converts export data to JSON string', () => {
    storageService.setData({
      version: '1.0',
      templates: { t1: { name: 'Test', milestones: [] } },
      groups: {}
    })

    const json = exportService.toJSON()

    expect(typeof json).toBe('string')
    const parsed = JSON.parse(json)
    expect(parsed.exportVersion).toBe('1.0')
    expect(parsed.data.templates.t1.name).toBe('Test')
  })

  it('calculates export statistics', () => {
    storageService.setData({
      version: '1.0',
      templates: {
        t1: { name: 'Template 1', milestones: [] },
        t2: { name: 'Template 2', milestones: [] }
      },
      groups: {
        g1: {
          name: 'Group 1',
          templateId: 't1',
          students: {
            s1: { firstName: 'Anna', notes: [{ text: 'Note 1' }, { text: 'Note 2' }] },
            s2: { firstName: 'Bob', notes: [] }
          }
        },
        g2: {
          name: 'Group 2',
          templateId: 't2',
          students: {
            s3: { firstName: 'Charlie', notes: [{ text: 'Note 3' }] }
          }
        }
      }
    })

    const stats = exportService.getExportStats()

    expect(stats.groupCount).toBe(2)
    expect(stats.templateCount).toBe(2)
    expect(stats.studentCount).toBe(3)
    expect(stats.noteCount).toBe(3)
    expect(stats.sizeBytes).toBeGreaterThan(0)
  })

  it('handles empty data gracefully', () => {
    const exportData = exportService.generateExportData()

    expect(exportData.data.templates).toEqual({})
    expect(exportData.data.groups).toEqual({})

    const stats = exportService.getExportStats()
    expect(stats.groupCount).toBe(0)
    expect(stats.studentCount).toBe(0)
  })
})

describe('Import Service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('parses valid JSON', () => {
    const json = '{"exportVersion":"1.0","data":{"templates":{},"groups":{}}}'
    const parsed = importService.parseJSON(json)

    expect(parsed).not.toBeNull()
    expect(parsed.exportVersion).toBe('1.0')
  })

  it('returns null for invalid JSON', () => {
    const result = importService.parseJSON('not valid json')
    expect(result).toBeNull()
  })

  it('validates import data structure', () => {
    const validData = {
      exportVersion: '1.0',
      exportedAt: '2026-02-01T00:00:00Z',
      data: {
        templates: { t1: { name: 'Test', milestones: [] } },
        groups: { g1: { name: 'Group', templateId: 't1' } }
      }
    }

    const result = importService.validate(validData)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.stats).not.toBeNull()
  })

  it('detects missing data field', () => {
    const invalidData = { exportVersion: '1.0' }

    const result = importService.validate(invalidData)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing "data" field in import file')
  })

  it('detects missing templates field', () => {
    const invalidData = { data: { groups: {} } }

    const result = importService.validate(invalidData)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing "templates" field in data')
  })

  it('detects missing groups field', () => {
    const invalidData = { data: { templates: {} } }

    const result = importService.validate(invalidData)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing "groups" field in data')
  })

  it('validates template structure', () => {
    const invalidData = {
      data: {
        templates: {
          t1: { name: 'Valid', milestones: [] },
          t2: { milestones: [] } // missing name
        },
        groups: {}
      }
    }

    const result = importService.validate(invalidData)

    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('t2') && e.includes('name'))).toBe(true)
  })

  it('validates group structure', () => {
    const invalidData = {
      data: {
        templates: {},
        groups: {
          g1: { name: 'Valid', templateId: 't1' },
          g2: { name: 'Missing Template' } // missing templateId
        }
      }
    }

    const result = importService.validate(invalidData)

    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('g2') && e.includes('templateId'))).toBe(true)
  })

  it('calculates import statistics', () => {
    const importData = {
      exportVersion: '1.0',
      exportedAt: '2026-02-01T10:00:00Z',
      data: {
        templates: { t1: { name: 'Test', milestones: [] } },
        groups: {
          g1: {
            name: 'Group',
            templateId: 't1',
            students: {
              s1: { firstName: 'Anna', notes: [{ text: 'Note' }] }
            }
          }
        }
      }
    }

    const stats = importService.getImportStats(importData)

    expect(stats.groupCount).toBe(1)
    expect(stats.templateCount).toBe(1)
    expect(stats.studentCount).toBe(1)
    expect(stats.noteCount).toBe(1)
    expect(stats.exportedAt).toBe('2026-02-01T10:00:00Z')
    expect(stats.exportVersion).toBe('1.0')
  })

  it('imports with replace mode', () => {
    // Set up existing data
    storageService.setData({
      version: '1.0',
      templates: { existing: { name: 'Existing', milestones: [] } },
      groups: { existing: { name: 'Existing Group', templateId: 'existing' } }
    })

    const importData = {
      appVersion: '1.0',
      data: {
        templates: { new: { name: 'New', milestones: [] } },
        groups: { new: { name: 'New Group', templateId: 'new' } }
      }
    }

    const success = importService.importReplace(importData)

    expect(success).toBe(true)
    const data = storageService.getData()
    expect(data.templates.existing).toBeUndefined()
    expect(data.templates.new).toBeDefined()
    expect(data.groups.existing).toBeUndefined()
    expect(data.groups.new).toBeDefined()
  })

  it('imports with merge mode', () => {
    // Set up existing data
    storageService.setData({
      version: '1.0',
      templates: { existing: { name: 'Existing', milestones: [] } },
      groups: { existing: { name: 'Existing Group', templateId: 'existing' } }
    })

    const importData = {
      data: {
        templates: {
          existing: { name: 'Updated Existing', milestones: [] }, // Should be skipped
          new: { name: 'New', milestones: [] }
        },
        groups: {
          existing: { name: 'Updated Group', templateId: 'existing' }, // Should be skipped
          new: { name: 'New Group', templateId: 'new' }
        }
      }
    }

    const result = importService.importMerge(importData)

    expect(result.success).toBe(true)
    expect(result.templatesAdded).toBe(1)
    expect(result.groupsAdded).toBe(1)
    expect(result.groupsSkipped).toBe(1)

    const data = storageService.getData()
    // Existing data should be unchanged
    expect(data.templates.existing.name).toBe('Existing')
    expect(data.groups.existing.name).toBe('Existing Group')
    // New data should be added
    expect(data.templates.new).toBeDefined()
    expect(data.groups.new).toBeDefined()
  })

  it('handles null import data', () => {
    const replaceResult = importService.importReplace(null)
    expect(replaceResult).toBe(false)

    const mergeResult = importService.importMerge(null)
    expect(mergeResult.success).toBe(false)
  })

  it('exports custom roles', () => {
    storageService.setData({
      version: '1.0',
      templates: {},
      groups: {},
      customRoles: ['Second Reader', 'Portfolio Reviewer']
    })

    const exportData = exportService.generateExportData()

    expect(exportData.data.customRoles).toEqual(['Second Reader', 'Portfolio Reviewer'])
  })

  it('imports custom roles with replace mode', () => {
    storageService.setData({
      version: '1.0',
      templates: {},
      groups: {},
      customRoles: ['Existing Role']
    })

    const importData = {
      appVersion: '1.0',
      data: {
        templates: {},
        groups: {},
        customRoles: ['New Role', 'Another Role']
      }
    }

    importService.importReplace(importData)
    const data = storageService.getData()

    expect(data.customRoles).toEqual(['New Role', 'Another Role'])
  })

  it('merges custom roles without duplicates', () => {
    storageService.setData({
      version: '1.0',
      templates: {},
      groups: {},
      customRoles: ['Existing Role', 'Shared Role']
    })

    const importData = {
      data: {
        templates: {},
        groups: {},
        customRoles: ['Shared Role', 'New Role']
      }
    }

    const result = importService.importMerge(importData)
    const data = storageService.getData()

    expect(result.customRolesAdded).toBe(1)
    expect(data.customRoles).toContain('Existing Role')
    expect(data.customRoles).toContain('Shared Role')
    expect(data.customRoles).toContain('New Role')
    expect(data.customRoles.filter(r => r === 'Shared Role')).toHaveLength(1)
  })

  it('exports student role field', () => {
    storageService.setData({
      version: '1.0',
      templates: { t1: { name: 'Test', milestones: [] } },
      groups: {
        g1: {
          name: 'Group',
          templateId: 't1',
          students: {
            s1: { firstName: 'Anna', role: 'supervisor' }
          }
        }
      }
    })

    const exportData = exportService.generateExportData()

    expect(exportData.data.groups.g1.students.s1.role).toBe('supervisor')
  })
})

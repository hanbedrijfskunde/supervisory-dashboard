import { describe, it, expect, beforeEach } from 'vitest'
import { storageService } from '../../src/services/storageService'
import { initializeApp } from '../../src/services/initService'

describe('Initialization Service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('seeds default templates on first run', () => {
    initializeApp()
    const data = storageService.getData()
    expect(Object.keys(data.templates)).toHaveLength(2)
    const defaultTemplate = Object.values(data.templates).find(t => t.isDefault)
    expect(defaultTemplate).toBeDefined()
  })

  it('does not overwrite existing data', () => {
    const existingData = { version: '1.0', templates: { custom: { id: 'custom' } }, groups: {} }
    storageService.setData(existingData)
    initializeApp()
    expect(storageService.getData().templates.custom).toBeDefined()
  })

  it('returns the initialized data', () => {
    const data = initializeApp()
    expect(data.version).toBe('1.0')
    expect(data.templates).toBeDefined()
    expect(data.groups).toBeDefined()
  })

  it('includes all required milestone fields', () => {
    initializeApp()
    const data = storageService.getData()

    Object.values(data.templates).forEach(template => {
      expect(template.milestones.length).toBeGreaterThan(0)
      template.milestones.forEach(milestone => {
        expect(milestone.id).toBeDefined()
        expect(milestone.name).toBeDefined()
        expect(milestone.type).toBeDefined()
        expect(milestone.tracking).toBeDefined()
      })
    })
  })

  it('includes performance areas', () => {
    initializeApp()
    const data = storageService.getData()
    const defaultTemplate = Object.values(data.templates).find(t => t.isDefault)

    expect(defaultTemplate.performanceAreas.length).toBe(6)
  })

  it('includes specialisations', () => {
    initializeApp()
    const data = storageService.getData()
    const defaultTemplate = Object.values(data.templates).find(t => t.isDefault)

    expect(defaultTemplate.specialisations).toContain('Finance')
    expect(defaultTemplate.specialisations).toContain('Marketing & Sales')
  })

  it('adds missing templates to existing data', () => {
    // Start with only one custom template
    const existingData = {
      version: '1.0',
      templates: { custom: { id: 'custom', name: 'Custom Template' } },
      groups: {}
    }
    storageService.setData(existingData)

    initializeApp()
    const data = storageService.getData()

    // Should have custom + 2 default templates
    expect(Object.keys(data.templates)).toHaveLength(3)
    expect(data.templates.custom).toBeDefined()
  })
})

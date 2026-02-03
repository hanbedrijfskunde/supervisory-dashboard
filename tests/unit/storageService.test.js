import { describe, it, expect, beforeEach } from 'vitest'
import { storageService } from '../../src/services/storageService'

describe('Storage Service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and retrieves data correctly', () => {
    const testData = { version: '1.0', templates: {}, groups: {} }
    storageService.setData(testData)
    expect(storageService.getData()).toEqual(testData)
  })

  it('returns null for empty storage', () => {
    expect(storageService.getData()).toBeNull()
  })

  it('calculates storage usage', () => {
    storageService.setData({ test: 'data' })
    expect(storageService.getStorageUsage()).toBeGreaterThan(0)
  })

  it('clears data when confirmed', () => {
    storageService.setData({ test: 'data' })
    storageService.clearData(true)
    expect(storageService.getData()).toBeNull()
  })

  it('does not clear data without confirmation', () => {
    storageService.setData({ test: 'data' })
    storageService.clearData(false)
    expect(storageService.getData()).toEqual({ test: 'data' })
  })

  it('handles invalid JSON gracefully', () => {
    localStorage.setItem('gi_tracker_data', 'invalid json')
    expect(storageService.getData()).toBeNull()
  })
})

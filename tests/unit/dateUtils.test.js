import { describe, it, expect } from 'vitest'
import {
  getCurrentWeek,
  getEndDate,
  getMilestoneDeadline,
  formatDate,
  parseDate,
  getMilestoneStatus,
  getProgress
} from '../../src/utils/dateUtils'

describe('Date Utilities', () => {
  it('calculates current week correctly', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    expect(getCurrentWeek(twoWeeksAgo)).toBe(2)
  })

  it('calculates end date correctly', () => {
    const start = '2026-02-02'
    const end = getEndDate(start, 21)
    // 21 weeks = 147 days from Feb 2 = June 29
    expect(end.toISOString().slice(0, 10)).toBe('2026-06-29')
  })

  it('calculates milestone deadline correctly', () => {
    const start = '2026-02-02'
    const deadline = getMilestoneDeadline(start, 10)
    expect(deadline.toISOString().slice(0, 10)).toBe('2026-04-13')
  })

  it('formats date correctly', () => {
    const date = new Date('2026-02-03')
    const formatted = formatDate(date)
    expect(formatted).toMatch(/3.*Feb.*2026/)
  })

  it('parses date string correctly', () => {
    const dateString = '2026-02-03'
    const parsed = parseDate(dateString)
    expect(parsed.getFullYear()).toBe(2026)
    expect(parsed.getMonth()).toBe(1) // February is month 1 (0-indexed)
    expect(parsed.getDate()).toBe(3)
  })

  it('returns completed status for done milestone', () => {
    const milestone = { id: 'm1', week: 1 }
    const studentMilestones = { m1: { done: true } }
    const status = getMilestoneStatus(milestone, studentMilestones, '2026-01-01')
    expect(status).toBe('completed')
  })

  it('returns overdue status for past milestone', () => {
    const milestone = { id: 'm1', week: 0 }
    const studentMilestones = { m1: { done: false } }
    // Start date far in the past
    const status = getMilestoneStatus(milestone, studentMilestones, '2020-01-01')
    expect(status).toBe('overdue')
  })

  it('calculates progress correctly', () => {
    const milestones = {
      m1: { done: true },
      m2: { done: true },
      m3: { done: false }
    }
    const progress = getProgress(milestones, 5)
    expect(progress.done).toBe(2)
    expect(progress.total).toBe(5)
    expect(progress.percentage).toBe(0.4)
  })

  it('handles empty milestones in progress', () => {
    const progress = getProgress({}, 10)
    expect(progress.done).toBe(0)
    expect(progress.total).toBe(10)
    expect(progress.percentage).toBe(0)
  })
})

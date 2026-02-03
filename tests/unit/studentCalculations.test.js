import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useStudentCalculations } from '../../src/hooks/useStudentCalculations'

describe('Student Calculations', () => {
  const mockTemplate = {
    durationWeeks: 21,
    milestones: [
      { id: 'm1', name: 'PIP submitted', week: 1, type: 'deliverable', tracking: 'checkbox_date' },
      { id: 'm2', name: '1st visit', week: 2, type: 'visit', tracking: 'checkbox_date' },
      { id: 'm3', name: '2nd visit', week: 10, type: 'visit', tracking: 'checkbox_date' },
      { id: 'm4', name: 'Final portfolio', week: 19, type: 'deliverable', tracking: 'checkbox_date' },
      { id: 'resit', name: 'Resit (if applicable)', week: null, type: 'deliverable', tracking: 'checkbox_date' }
    ]
  }

  let hook

  beforeEach(() => {
    // Reset time to a known date for consistent tests
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15')) // About 2 weeks after typical start
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  beforeEach(() => {
    const { result } = renderHook(() => useStudentCalculations())
    hook = result.current
  })

  describe('getOverdueCount', () => {
    it('identifies overdue milestones', () => {
      // Student started Jan 1, so by Feb 15 (week 6), weeks 1 and 2 are overdue if not done
      const student = {
        startDate: '2026-01-01',
        milestones: {
          m1: { done: true }, // PIP done - not overdue
          m2: { done: false } // 1st visit not done, week 2 has passed - overdue
        }
      }
      expect(hook.getOverdueCount(student, mockTemplate)).toBe(1)
    })

    it('returns 0 when all milestones are on track', () => {
      // Student just started, nothing is overdue yet
      const student = {
        startDate: '2026-02-10', // Just started 5 days ago
        milestones: {}
      }
      expect(hook.getOverdueCount(student, mockTemplate)).toBe(0)
    })

    it('handles missing student gracefully', () => {
      expect(hook.getOverdueCount(null, mockTemplate)).toBe(0)
    })
  })

  describe('getUpcomingCount', () => {
    it('identifies upcoming milestones within 7 days', () => {
      // Student started Feb 8, so:
      // - m1 (week 1) = Feb 15 = today = 0 days = upcoming
      // - m2 (week 2) = Feb 22 = 7 days from today = upcoming
      // Both m1 and m2 are within 7 days, so both are upcoming
      const student = {
        startDate: '2026-02-08',
        milestones: {
          m1: { done: false }, // PIP at week 1 = Feb 15 = today = upcoming
          m2: { done: false }  // 1st visit at week 2 = Feb 22 = 7 days = upcoming
        }
      }
      expect(hook.getUpcomingCount(student, mockTemplate)).toBe(2)
    })

    it('does not count completed milestones', () => {
      const student = {
        startDate: '2026-02-08',
        milestones: {
          m1: { done: true }, // Already done
          m2: { done: true }  // Already done (both upcoming ones are completed)
        }
      }
      expect(hook.getUpcomingCount(student, mockTemplate)).toBe(0)
    })
  })

  describe('getNextDeadline', () => {
    it('returns correct next deadline', () => {
      const student = {
        startDate: '2026-02-01',
        milestones: {
          m1: { done: true }, // PIP done
          m2: { done: false }, // 1st visit not done - this should be next
          m3: { done: false }
        }
      }
      const next = hook.getNextDeadline(student, mockTemplate)
      expect(next.milestone.id).toBe('m2')
    })

    it('returns null when all milestones are complete', () => {
      const student = {
        startDate: '2026-02-01',
        milestones: {
          m1: { done: true },
          m2: { done: true },
          m3: { done: true },
          m4: { done: true }
        }
      }
      const next = hook.getNextDeadline(student, mockTemplate)
      expect(next).toBeNull()
    })

    it('excludes milestones without a scheduled week', () => {
      const student = {
        startDate: '2026-02-01',
        milestones: {
          m1: { done: true },
          m2: { done: true },
          m3: { done: true },
          m4: { done: true },
          resit: { done: false } // No scheduled week
        }
      }
      const next = hook.getNextDeadline(student, mockTemplate)
      expect(next).toBeNull()
    })
  })

  describe('getStudentStatus', () => {
    it('returns red when student has overdue milestones', () => {
      const student = {
        startDate: '2026-01-01', // 6+ weeks ago
        milestones: {
          m1: { done: false } // Week 1 is overdue
        }
      }
      expect(hook.getStudentStatus(student, mockTemplate)).toBe('red')
    })

    it('returns yellow when student has upcoming milestones but no overdue', () => {
      // Set time to when something is upcoming but nothing overdue
      vi.setSystemTime(new Date('2026-02-07')) // 6 days after student start

      const student = {
        startDate: '2026-02-01',
        milestones: {} // Week 1 milestone coming up in 1 day
      }
      expect(hook.getStudentStatus(student, mockTemplate)).toBe('yellow')
    })

    it('returns green when student is on track', () => {
      // For green status, need no overdue and no upcoming (within 7 days)
      // Today is Feb 15, if student starts Feb 9, week 1 is Feb 16 (1 day = upcoming = yellow)
      // If student starts Feb 8, week 1 is Feb 15 (today = 0 days = upcoming)
      // For green, week 1 must be > 7 days away
      // If student starts Feb 16, week 1 is Feb 23 (8 days away = pending = green)
      const student = {
        startDate: '2026-02-16', // Starts tomorrow, week 1 is Feb 23 (8 days away)
        milestones: {}
      }
      expect(hook.getStudentStatus(student, mockTemplate)).toBe('green')
    })
  })

  describe('getCompletedCount', () => {
    it('counts completed milestones', () => {
      const student = {
        milestones: {
          m1: { done: true },
          m2: { done: true },
          m3: { done: false }
        }
      }
      expect(hook.getCompletedCount(student, mockTemplate)).toBe(2)
    })

    it('returns 0 for student with no milestones', () => {
      const student = { milestones: {} }
      expect(hook.getCompletedCount(student, mockTemplate)).toBe(0)
    })
  })

  describe('getScheduledMilestoneCount', () => {
    it('counts only scheduled milestones (excludes week: null)', () => {
      // mockTemplate has 4 scheduled milestones and 1 with week: null
      expect(hook.getScheduledMilestoneCount(mockTemplate)).toBe(4)
    })
  })
})

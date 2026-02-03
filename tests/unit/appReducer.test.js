import { describe, it, expect } from 'vitest'
import { appReducer, ActionTypes } from '../../src/context/appReducer'

describe('App Reducer', () => {
  const initialState = { version: '1.0', templates: {}, groups: {} }

  it('loads data', () => {
    const payload = { version: '1.0', templates: { t1: {} }, groups: { g1: {} } }
    const newState = appReducer(initialState, { type: ActionTypes.LOAD_DATA, payload })
    expect(newState).toEqual(payload)
  })

  it('adds a group', () => {
    const action = {
      type: ActionTypes.ADD_GROUP,
      payload: { id: 'g1', name: 'Test Group', students: {} }
    }
    const newState = appReducer(initialState, action)
    expect(newState.groups.g1).toBeDefined()
    expect(newState.groups.g1.name).toBe('Test Group')
  })

  it('updates a group', () => {
    const state = {
      ...initialState,
      groups: { g1: { id: 'g1', name: 'Old Name', students: {} } }
    }
    const action = {
      type: ActionTypes.UPDATE_GROUP,
      payload: { id: 'g1', updates: { name: 'New Name' } }
    }
    const newState = appReducer(state, action)
    expect(newState.groups.g1.name).toBe('New Name')
  })

  it('deletes a group', () => {
    const state = {
      ...initialState,
      groups: { g1: { id: 'g1' }, g2: { id: 'g2' } }
    }
    const action = { type: ActionTypes.DELETE_GROUP, payload: { id: 'g1' } }
    const newState = appReducer(state, action)
    expect(newState.groups.g1).toBeUndefined()
    expect(newState.groups.g2).toBeDefined()
  })

  it('archives a group', () => {
    const state = {
      ...initialState,
      groups: { g1: { id: 'g1', status: 'active' } }
    }
    const action = { type: ActionTypes.ARCHIVE_GROUP, payload: { id: 'g1' } }
    const newState = appReducer(state, action)
    expect(newState.groups.g1.status).toBe('archived')
  })

  it('adds a student to a group', () => {
    const state = {
      ...initialState,
      groups: { g1: { id: 'g1', students: {} } }
    }
    const action = {
      type: ActionTypes.ADD_STUDENT,
      payload: { groupId: 'g1', student: { id: 's1', firstName: 'Anna' } }
    }
    const newState = appReducer(state, action)
    expect(newState.groups.g1.students.s1).toBeDefined()
    expect(newState.groups.g1.students.s1.firstName).toBe('Anna')
  })

  it('updates a student', () => {
    const state = {
      ...initialState,
      groups: { g1: { students: { s1: { id: 's1', firstName: 'Anna' } } } }
    }
    const action = {
      type: ActionTypes.UPDATE_STUDENT,
      payload: { groupId: 'g1', studentId: 's1', updates: { firstName: 'Anne' } }
    }
    const newState = appReducer(state, action)
    expect(newState.groups.g1.students.s1.firstName).toBe('Anne')
  })

  it('deletes a student', () => {
    const state = {
      ...initialState,
      groups: { g1: { students: { s1: { id: 's1' }, s2: { id: 's2' } } } }
    }
    const action = {
      type: ActionTypes.DELETE_STUDENT,
      payload: { groupId: 'g1', studentId: 's1' }
    }
    const newState = appReducer(state, action)
    expect(newState.groups.g1.students.s1).toBeUndefined()
    expect(newState.groups.g1.students.s2).toBeDefined()
  })

  it('updates milestone status', () => {
    const state = {
      ...initialState,
      groups: { g1: { students: { s1: { milestones: { m1: { done: false } } } } } }
    }
    const action = {
      type: ActionTypes.UPDATE_MILESTONE_STATUS,
      payload: {
        groupId: 'g1',
        studentId: 's1',
        milestoneId: 'm1',
        status: { done: true, date: '2026-02-03' }
      }
    }
    const newState = appReducer(state, action)
    expect(newState.groups.g1.students.s1.milestones.m1.done).toBe(true)
    expect(newState.groups.g1.students.s1.milestones.m1.date).toBe('2026-02-03')
  })

  it('adds a note', () => {
    const state = {
      ...initialState,
      groups: { g1: { students: { s1: { notes: [] } } } }
    }
    const action = {
      type: ActionTypes.ADD_NOTE,
      payload: {
        groupId: 'g1',
        studentId: 's1',
        note: { id: 'n1', text: 'Test note', timestamp: '2026-02-03T10:00:00Z' }
      }
    }
    const newState = appReducer(state, action)
    expect(newState.groups.g1.students.s1.notes).toHaveLength(1)
    expect(newState.groups.g1.students.s1.notes[0].text).toBe('Test note')
  })

  it('deletes a note', () => {
    const state = {
      ...initialState,
      groups: {
        g1: {
          students: {
            s1: {
              notes: [
                { id: 'n1', text: 'Note 1' },
                { id: 'n2', text: 'Note 2' }
              ]
            }
          }
        }
      }
    }
    const action = {
      type: ActionTypes.DELETE_NOTE,
      payload: { groupId: 'g1', studentId: 's1', noteId: 'n1' }
    }
    const newState = appReducer(state, action)
    expect(newState.groups.g1.students.s1.notes).toHaveLength(1)
    expect(newState.groups.g1.students.s1.notes[0].id).toBe('n2')
  })

  it('adds a template', () => {
    const action = {
      type: ActionTypes.ADD_TEMPLATE,
      payload: { id: 't1', name: 'Custom Template' }
    }
    const newState = appReducer(initialState, action)
    expect(newState.templates.t1).toBeDefined()
    expect(newState.templates.t1.name).toBe('Custom Template')
  })

  it('updates a template', () => {
    const state = {
      ...initialState,
      templates: { t1: { id: 't1', name: 'Old Name' } }
    }
    const action = {
      type: ActionTypes.UPDATE_TEMPLATE,
      payload: { id: 't1', updates: { name: 'New Name' } }
    }
    const newState = appReducer(state, action)
    expect(newState.templates.t1.name).toBe('New Name')
  })

  it('archives a template', () => {
    const state = {
      ...initialState,
      templates: { t1: { id: 't1', archived: false } }
    }
    const action = { type: ActionTypes.ARCHIVE_TEMPLATE, payload: { id: 't1' } }
    const newState = appReducer(state, action)
    expect(newState.templates.t1.archived).toBe(true)
  })

  it('returns same state for unknown action', () => {
    const state = { ...initialState, groups: { g1: {} } }
    const newState = appReducer(state, { type: 'UNKNOWN_ACTION' })
    expect(newState).toEqual(state)
  })

  describe('Custom Roles', () => {
    it('adds a custom role', () => {
      const state = { ...initialState, customRoles: [] }
      const action = {
        type: ActionTypes.ADD_CUSTOM_ROLE,
        payload: { role: 'Second Reader' }
      }
      const newState = appReducer(state, action)
      expect(newState.customRoles).toContain('Second Reader')
    })

    it('adds a custom role to undefined customRoles', () => {
      const action = {
        type: ActionTypes.ADD_CUSTOM_ROLE,
        payload: { role: 'Portfolio Reviewer' }
      }
      const newState = appReducer(initialState, action)
      expect(newState.customRoles).toContain('Portfolio Reviewer')
    })

    it('deletes a custom role', () => {
      const state = { ...initialState, customRoles: ['Second Reader', 'Mentor'] }
      const action = {
        type: ActionTypes.DELETE_CUSTOM_ROLE,
        payload: { role: 'Second Reader' }
      }
      const newState = appReducer(state, action)
      expect(newState.customRoles).not.toContain('Second Reader')
      expect(newState.customRoles).toContain('Mentor')
    })
  })
})

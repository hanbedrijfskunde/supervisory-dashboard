# Technical Design Document: GI Supervision Tracker

## 1. Technical Overview

### 1.1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React SPA                            │
├─────────────────────────────────────────────────────────────┤
│  Views              │  Components          │  Hooks          │
│  ─────              │  ──────────          │  ─────          │
│  Dashboard          │  GroupCard           │  useLocalStorage│
│  StudentDetail      │  StudentTable        │  useGroups      │
│  GroupManagement    │  MilestoneChecklist  │  useStudents    │
│  TemplateEditor     │  NotesPanel          │  useTemplates   │
│  Settings           │  ThisWeekPanel       │  useMilestones  │
│                     │  ProgressBar         │  useCalculations│
├─────────────────────┴──────────────────────┴─────────────────┤
│                      Services Layer                          │
│  ────────────────────────────────────────────────────────    │
│  StorageService     │  ExportService       │  DateService    │
│  TemplateService    │  ImportService       │  ValidationSvc  │
├─────────────────────────────────────────────────────────────┤
│                    localStorage API                          │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Choices

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | React 18+ | Component-based, wide ecosystem |
| Styling | Tailwind CSS | Utility-first, rapid prototyping |
| Build | Vite | Fast dev server, optimized builds |
| Testing | Vitest + React Testing Library | Fast, React-native testing |
| State | React Context + useReducer | Simple, no external dependencies |
| IDs | crypto.randomUUID() | Native, no dependencies |

### 1.3 File Structure

```
graduation-tracker/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── groups/
│   │   ├── milestones/
│   │   ├── templates/
│   │   └── common/
│   ├── hooks/
│   ├── services/
│   ├── context/
│   ├── utils/
│   ├── data/
│   │   └── defaultTemplate.js
│   └── types/
│       └── index.js (JSDoc type definitions)
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 2. Data Structures

### 2.1 TypeScript-style Definitions (for reference, implemented as JSDoc)

```javascript
/**
 * @typedef {Object} Milestone
 * @property {string} id
 * @property {string} name
 * @property {number} week - Week offset from start date
 * @property {'meeting'|'admin'|'deliverable'|'visit'|'assessment'} type
 * @property {'checkbox'|'checkbox_date'|'counter'|'date'} tracking
 * @property {number} [counterMax] - For counter type, e.g., 4 for feedback forms
 */

/**
 * @typedef {Object} PerformanceArea
 * @property {string} id
 * @property {string} name
 * @property {string} short - Abbreviation
 */

/**
 * @typedef {Object} Template
 * @property {string} id
 * @property {string} name
 * @property {number} durationWeeks
 * @property {Milestone[]} milestones
 * @property {PerformanceArea[]} performanceAreas
 * @property {string[]} specialisations
 * @property {boolean} isDefault
 * @property {boolean} archived
 */

/**
 * @typedef {Object} MilestoneStatus
 * @property {boolean} done
 * @property {string|null} date - ISO date string
 * @property {number} [count] - For counter type
 * @property {'physical'|'teams'|null} [format] - For visit type
 */

/**
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} timestamp - ISO datetime string
 * @property {string} text
 */

/**
 * @typedef {Object} Student
 * @property {string} id
 * @property {string} firstName
 * @property {string} organisation
 * @property {string} organisationCity
 * @property {string} companyCoachName
 * @property {string} examinerName
 * @property {string} specialisation
 * @property {string} startDate - ISO date string
 * @property {Object.<string, MilestoneStatus>} milestones - keyed by milestone ID
 * @property {Note[]} notes
 */

/**
 * @typedef {Object} Group
 * @property {string} id
 * @property {string} name
 * @property {string} templateId
 * @property {'active'|'archived'} status
 * @property {string} createdAt - ISO datetime string
 * @property {string} [description]
 * @property {Object.<string, Student>} students - keyed by student ID
 */

/**
 * @typedef {Object} AppData
 * @property {string} version
 * @property {Object.<string, Template>} templates
 * @property {Object.<string, Group>} groups
 */
```

### 2.2 localStorage Key

Single key: `gi_tracker_data`

---

## 3. Core Calculations

```javascript
// Date utilities (to be implemented in src/utils/dateUtils.js)

const MILLIS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function getCurrentWeek(startDate) {
  const start = new Date(startDate);
  const today = new Date();
  const diffMs = today - start;
  return Math.floor(diffMs / MILLIS_PER_WEEK);
}

function getEndDate(startDate, durationWeeks) {
  const start = new Date(startDate);
  return new Date(start.getTime() + durationWeeks * MILLIS_PER_WEEK);
}

function getMilestoneDeadline(startDate, weekOffset) {
  const start = new Date(startDate);
  return new Date(start.getTime() + weekOffset * MILLIS_PER_WEEK);
}

function getMilestoneStatus(milestone, studentMilestones, startDate) {
  const status = studentMilestones[milestone.id];
  if (status?.done) return 'completed';

  const deadline = getMilestoneDeadline(startDate, milestone.week);
  const today = new Date();
  const daysUntil = (deadline - today) / (24 * 60 * 60 * 1000);

  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 7) return 'upcoming';
  return 'pending';
}

function getProgress(studentMilestones, totalMilestones) {
  const done = Object.values(studentMilestones).filter(m => m.done).length;
  return { done, total: totalMilestones, percentage: done / totalMilestones };
}
```

---

## 4. Task List

> **Testing Protocol**: Each task group ends with a test gate. The next task group cannot begin until all tests in the current gate pass. Tests should be run with `npm test` (unit/integration) or `npm run test:e2e` (end-to-end).

### Progress Summary

| Task | Description | Status |
|------|-------------|--------|
| 1 | Project Setup | [x] |
| 2 | Storage Service & Data Layer | [x] |
| 3 | State Management (Context + Hooks) | [x] |
| 4 | Group Management UI | [x] |
| 5 | Student Management UI | [x] |
| 6 | Milestone Tracking UI | [x] |
| 7 | Student Detail View | [x] |
| 8 | Dashboard & "This Week" Panel | [x] |
| 9 | Export/Import Functionality | [x] |
| 10 | Responsive Layout & Polish | [x] |
| 11 | E2E Testing & Final Verification | [x] |

---

### Task 1: Project Setup

#### Subtasks

- [x] **1.1.** Initialize project with Vite + React
```bash
npm create vite@latest . -- --template react
```

- [x] **1.2.** Install and configure Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- [x] **1.3.** Install testing dependencies
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [x] **1.4.** Configure Vitest in `vite.config.js`

- [x] **1.5.** Create base file structure (folders for components, hooks, services, utils, tests)

- [x] **1.6.** Create placeholder `App.jsx` with "GI Supervision Tracker" heading

- [x] **1.7.** Verify dev server runs: `npm run dev`

- [x] **1.8.** Test Gate 1 passes

#### Test Gate 1
```javascript
// tests/unit/setup.test.js
describe('Project Setup', () => {
  it('renders the app without crashing', () => {
    render(<App />);
    expect(screen.getByText(/GI Supervision Tracker/i)).toBeInTheDocument();
  });

  it('has Tailwind styles applied', () => {
    render(<App />);
    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('text-2xl'); // or any Tailwind class
  });
});
```

---

### Task 2: Storage Service & Data Layer

#### Subtasks

- [x] **2.1.** Create `src/services/storageService.js` with methods:
  - `getData()` - retrieve full app data from localStorage
  - `setData(data)` - save full app data to localStorage
  - `clearData()` - clear all app data (with confirmation flag)
  - `getStorageUsage()` - return bytes used

- [x] **2.2.** Create `src/utils/dateUtils.js` with calculation functions:
  - `getCurrentWeek(startDate)`
  - `getEndDate(startDate, durationWeeks)`
  - `getMilestoneDeadline(startDate, weekOffset)`
  - `formatDate(date)` - display format
  - `parseDate(dateString)` - parse ISO string

- [x] **2.3.** Create `src/utils/idUtils.js`:
  - `generateId()` - wrapper around crypto.randomUUID()

- [x] **2.4.** Create `src/data/defaultTemplate.js` with complete IB/CS template data per PRD section 3.3

- [x] **2.5.** Create `src/services/initService.js`:
  - `initializeApp()` - check if data exists, if not seed with default template

- [x] **2.6.** Test Gate 2 passes

#### Test Gate 2
```javascript
// tests/unit/storageService.test.js
describe('Storage Service', () => {
  beforeEach(() => localStorage.clear());

  it('saves and retrieves data correctly', () => {
    const testData = { version: '1.0', templates: {}, groups: {} };
    storageService.setData(testData);
    expect(storageService.getData()).toEqual(testData);
  });

  it('returns null for empty storage', () => {
    expect(storageService.getData()).toBeNull();
  });

  it('calculates storage usage', () => {
    storageService.setData({ test: 'data' });
    expect(storageService.getStorageUsage()).toBeGreaterThan(0);
  });
});

// tests/unit/dateUtils.test.js
describe('Date Utilities', () => {
  it('calculates current week correctly', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    expect(getCurrentWeek(twoWeeksAgo)).toBe(2);
  });

  it('calculates end date correctly', () => {
    const start = '2026-02-02';
    const end = getEndDate(start, 21);
    expect(end.toISOString().slice(0, 10)).toBe('2026-07-06');
  });

  it('calculates milestone deadline correctly', () => {
    const start = '2026-02-02';
    const deadline = getMilestoneDeadline(start, 10);
    expect(deadline.toISOString().slice(0, 10)).toBe('2026-04-13');
  });
});

// tests/unit/initService.test.js
describe('Initialization Service', () => {
  beforeEach(() => localStorage.clear());

  it('seeds default template on first run', () => {
    initializeApp();
    const data = storageService.getData();
    expect(Object.keys(data.templates)).toHaveLength(1);
    expect(Object.values(data.templates)[0].isDefault).toBe(true);
  });

  it('does not overwrite existing data', () => {
    const existingData = { version: '1.0', templates: { custom: {} }, groups: {} };
    storageService.setData(existingData);
    initializeApp();
    expect(storageService.getData().templates.custom).toBeDefined();
  });
});
```

---

### Task 3: State Management (Context + Hooks)

#### Subtasks

- [x] **3.1.** Create `src/context/AppContext.jsx`:
  - AppProvider component wrapping children
  - Holds full app state (templates, groups)
  - Provides dispatch for state mutations

- [x] **3.2.** Create `src/context/appReducer.js` with actions:
  - `LOAD_DATA`
  - `ADD_GROUP`, `UPDATE_GROUP`, `DELETE_GROUP`, `ARCHIVE_GROUP`
  - `ADD_STUDENT`, `UPDATE_STUDENT`, `DELETE_STUDENT`
  - `UPDATE_MILESTONE_STATUS`
  - `ADD_NOTE`, `DELETE_NOTE`
  - `ADD_TEMPLATE`, `UPDATE_TEMPLATE`, `ARCHIVE_TEMPLATE`

- [x] **3.3.** Create `src/hooks/useAppData.js`:
  - Hook to access context
  - Auto-persist to localStorage on state change

- [x] **3.4.** Create `src/hooks/useGroups.js`:
  - `groups` - all groups
  - `activeGroups` - non-archived groups
  - `addGroup(group)`, `updateGroup(id, updates)`, `deleteGroup(id)`, `archiveGroup(id)`

- [x] **3.5.** Create `src/hooks/useStudents.js`:
  - `getStudentsForGroup(groupId)`
  - `addStudent(groupId, student)`, `updateStudent(groupId, studentId, updates)`, `deleteStudent(groupId, studentId)`

- [x] **3.6.** Create `src/hooks/useTemplates.js`:
  - `templates`, `getTemplate(id)`
  - `addTemplate(template)`, `updateTemplate(id, updates)`

- [x] **3.7.** Test Gate 3 passes

#### Test Gate 3
```javascript
// tests/unit/appReducer.test.js
describe('App Reducer', () => {
  const initialState = { templates: {}, groups: {} };

  it('adds a group', () => {
    const action = { type: 'ADD_GROUP', payload: { id: 'g1', name: 'Test Group', students: {} } };
    const newState = appReducer(initialState, action);
    expect(newState.groups.g1).toBeDefined();
    expect(newState.groups.g1.name).toBe('Test Group');
  });

  it('adds a student to a group', () => {
    const state = { ...initialState, groups: { g1: { students: {} } } };
    const action = { type: 'ADD_STUDENT', payload: { groupId: 'g1', student: { id: 's1', firstName: 'Anna' } } };
    const newState = appReducer(state, action);
    expect(newState.groups.g1.students.s1.firstName).toBe('Anna');
  });

  it('updates milestone status', () => {
    const state = {
      ...initialState,
      groups: { g1: { students: { s1: { milestones: { m1: { done: false } } } } } }
    };
    const action = {
      type: 'UPDATE_MILESTONE_STATUS',
      payload: { groupId: 'g1', studentId: 's1', milestoneId: 'm1', status: { done: true, date: '2026-02-03' } }
    };
    const newState = appReducer(state, action);
    expect(newState.groups.g1.students.s1.milestones.m1.done).toBe(true);
  });
});

// tests/integration/hooks.test.js
describe('Hooks Integration', () => {
  it('useGroups adds and retrieves groups', () => {
    const { result } = renderHook(() => useGroups(), { wrapper: AppProvider });

    act(() => {
      result.current.addGroup({ name: 'Sem 2', templateId: 't1' });
    });

    expect(result.current.groups).toHaveLength(1);
    expect(result.current.groups[0].name).toBe('Sem 2');
  });

  it('persists data to localStorage on change', async () => {
    const { result } = renderHook(() => useGroups(), { wrapper: AppProvider });

    act(() => {
      result.current.addGroup({ name: 'Persistent Group', templateId: 't1' });
    });

    const stored = storageService.getData();
    expect(Object.values(stored.groups)[0].name).toBe('Persistent Group');
  });
});
```

---

### Task 4: Group Management UI

#### Subtasks

- [x] **4.1.** Create `src/components/common/Button.jsx` - reusable button with variants (primary, secondary, danger)

- [x] **4.2.** Create `src/components/common/Modal.jsx` - reusable modal dialog

- [x] **4.3.** Create `src/components/common/Input.jsx` - form input with label and validation

- [x] **4.4.** Create `src/components/groups/GroupCard.jsx`:
  - Displays group name, student count, needs-attention count
  - Click to select group
  - Visual indicator for active vs archived

- [x] **4.5.** Create `src/components/groups/GroupList.jsx`:
  - Lists all active groups
  - "New Group" button
  - Option to show archived groups

- [x] **4.6.** Create `src/components/groups/GroupForm.jsx`:
  - Form for creating/editing a group
  - Fields: name, template (dropdown), description
  - Validation: name required, template required

- [x] **4.7.** Create `src/components/groups/GroupDeleteConfirm.jsx`:
  - Confirmation modal for group deletion
  - Shows warning about permanent data loss

- [x] **4.8.** Wire up group CRUD in `App.jsx`:
  - Render GroupList
  - Handle group creation, selection, deletion

- [x] **4.9.** Test Gate 4 passes

#### Test Gate 4
```javascript
// tests/integration/groupManagement.test.js
describe('Group Management', () => {
  beforeEach(() => {
    localStorage.clear();
    initializeApp();
  });

  it('displays empty state when no groups exist', () => {
    render(<App />);
    expect(screen.getByText(/no groups yet/i)).toBeInTheDocument();
  });

  it('creates a new group', async () => {
    render(<App />);

    await userEvent.click(screen.getByText(/new group/i));
    await userEvent.type(screen.getByLabelText(/name/i), 'Semester 2 - Feb 2026');
    await userEvent.selectOptions(screen.getByLabelText(/template/i), 'default-template-id');
    await userEvent.click(screen.getByText(/create/i));

    expect(screen.getByText('Semester 2 - Feb 2026')).toBeInTheDocument();
  });

  it('deletes a group with confirmation', async () => {
    // Setup: create a group first
    render(<App />);
    await userEvent.click(screen.getByText(/new group/i));
    await userEvent.type(screen.getByLabelText(/name/i), 'To Delete');
    await userEvent.click(screen.getByText(/create/i));

    // Delete
    await userEvent.click(screen.getByTestId('group-menu-To Delete'));
    await userEvent.click(screen.getByText(/delete/i));
    await userEvent.click(screen.getByText(/confirm/i));

    expect(screen.queryByText('To Delete')).not.toBeInTheDocument();
  });

  it('shows student count on group card', async () => {
    // Setup: create group with students
    render(<App />);
    // ... add group and students

    expect(screen.getByText(/3 students/i)).toBeInTheDocument();
  });
});
```

---

### Task 5: Student Management UI

#### Subtasks

- [x] **5.1.** Create `src/components/students/StudentTable.jsx`:
  - Columns: Name, Organisation, City, Specialisation, Week, Progress, Status
  - Sortable columns
  - Row click navigates to student detail

- [x] **5.2.** Create `src/components/students/StudentForm.jsx`:
  - Fields: firstName, organisation, organisationCity, companyCoachName, examinerName, specialisation (dropdown from template), startDate
  - Validation: firstName required, organisation required, startDate required

- [x] **5.3.** Create `src/components/students/StudentRow.jsx`:
  - Single table row component
  - Shows progress bar
  - Shows urgency indicator (red/yellow/green dot)
  - Shows next upcoming deadline

- [x] **5.4.** Create `src/hooks/useStudentCalculations.js`:
  - `getStudentStatus(student, template)` - returns urgency level
  - `getNextDeadline(student, template)` - returns next milestone info
  - `getOverdueCount(student, template)`
  - `getUpcomingCount(student, template)`

- [x] **5.5.** Create `src/components/students/StudentDeleteConfirm.jsx`:
  - Confirmation modal for student deletion

- [x] **5.6.** Implement student filtering in StudentTable:
  - Filter by specialisation
  - Filter by status (all, needs attention, on track)

- [x] **5.7.** Implement student sorting in StudentTable:
  - Sort by any column
  - Default sort by urgency (red first, then yellow, then green)

- [x] **5.8.** Test Gate 5 passes

#### Test Gate 5
```javascript
// tests/unit/studentCalculations.test.js
describe('Student Calculations', () => {
  const mockTemplate = {
    milestones: [
      { id: 'm1', name: 'PIP submitted', week: 1 },
      { id: 'm2', name: '1st visit', week: 3 },
      { id: 'm3', name: 'Final portfolio', week: 19 },
    ]
  };

  it('identifies overdue milestones', () => {
    const student = {
      startDate: '2026-01-01', // Assuming today is 2026-02-03 (week 4+)
      milestones: {
        m1: { done: true },
        m2: { done: false }, // Week 3 - should be overdue
      }
    };
    expect(getOverdueCount(student, mockTemplate)).toBe(1);
  });

  it('identifies upcoming milestones within 7 days', () => {
    // Create student where a milestone is due within 7 days
    const today = new Date();
    const startDate = new Date(today.getTime() - 2.5 * 7 * 24 * 60 * 60 * 1000); // 2.5 weeks ago
    const student = {
      startDate: startDate.toISOString(),
      milestones: { m1: { done: true }, m2: { done: false } }
    };
    expect(getUpcomingCount(student, mockTemplate)).toBe(1); // m2 at week 3
  });

  it('returns correct next deadline', () => {
    const student = {
      startDate: '2026-02-01',
      milestones: { m1: { done: true }, m2: { done: false }, m3: { done: false } }
    };
    const next = getNextDeadline(student, mockTemplate);
    expect(next.milestone.id).toBe('m2');
  });
});

// tests/integration/studentManagement.test.js
describe('Student Management', () => {
  beforeEach(async () => {
    localStorage.clear();
    initializeApp();
    // Create a test group
  });

  it('adds a student to a group', async () => {
    render(<App />);
    // Select group
    await userEvent.click(screen.getByText('Test Group'));

    // Add student
    await userEvent.click(screen.getByText(/add student/i));
    await userEvent.type(screen.getByLabelText(/first name/i), 'Anna');
    await userEvent.type(screen.getByLabelText(/organisation/i), 'Rabobank');
    await userEvent.type(screen.getByLabelText(/city/i), 'Utrecht');
    await userEvent.type(screen.getByLabelText(/start date/i), '2026-02-02');
    await userEvent.click(screen.getByText(/save/i));

    expect(screen.getByText('Anna')).toBeInTheDocument();
    expect(screen.getByText('Rabobank')).toBeInTheDocument();
  });

  it('filters students by specialisation', async () => {
    // Setup: add students with different specialisations
    render(<App />);

    await userEvent.selectOptions(screen.getByLabelText(/filter by specialisation/i), 'Finance');

    expect(screen.getByText('Anna')).toBeInTheDocument(); // Finance
    expect(screen.queryByText('Mark')).not.toBeInTheDocument(); // Marketing
  });

  it('sorts students by urgency by default', async () => {
    // Setup: add students with different statuses
    render(<App />);

    const rows = screen.getAllByRole('row').slice(1); // Skip header
    expect(rows[0]).toHaveTextContent('OverdueStudent'); // Red first
  });
});
```

---

### Task 6: Milestone Tracking UI

#### Subtasks

- [x] **6.1.** Create `src/components/milestones/MilestoneChecklist.jsx`:
  - Displays all milestones for a student
  - Groups by phase/period
  - Shows status indicator per milestone

- [x] **6.2.** Create `src/components/milestones/MilestoneItem.jsx`:
  - Renders based on tracking type:
    - `checkbox`: simple checkbox
    - `checkbox_date`: checkbox + date picker
    - `counter`: number input (0-N) with +/- buttons
    - `date`: date picker only
  - Shows status color (completed/overdue/upcoming/pending)
  - Shows calculated deadline

- [x] **6.3.** Create `src/components/milestones/MilestoneStatusBadge.jsx`:
  - Visual badge showing overdue/upcoming/pending/completed
  - Uses urgency colors

- [x] **6.4.** Create `src/hooks/useMilestoneActions.js`:
  - `toggleMilestone(groupId, studentId, milestoneId)`
  - `setMilestoneDate(groupId, studentId, milestoneId, date)`
  - `setMilestoneCount(groupId, studentId, milestoneId, count)`
  - `setMilestoneFormat(groupId, studentId, milestoneId, format)` (for visits)

- [x] **6.5.** Implement milestone initialization:
  - When student is created, initialize all milestone statuses from template
  - Set default values (done: false, date: null, count: 0)

- [x] **6.6.** Test Gate 6 passes

#### Test Gate 6
```javascript
// tests/integration/milestoneTracking.test.js
describe('Milestone Tracking', () => {
  let groupId, studentId;

  beforeEach(async () => {
    localStorage.clear();
    initializeApp();
    // Setup: create group and student
    groupId = 'test-group';
    studentId = 'test-student';
  });

  it('displays all milestones from template', () => {
    render(<StudentDetail groupId={groupId} studentId={studentId} />);

    expect(screen.getByText(/meet & greet/i)).toBeInTheDocument();
    expect(screen.getByText(/PIP submitted/i)).toBeInTheDocument();
    expect(screen.getByText(/1st company visit/i)).toBeInTheDocument();
    // ... verify all 18 milestones visible
  });

  it('checks off a milestone', async () => {
    render(<StudentDetail groupId={groupId} studentId={studentId} />);

    const pipCheckbox = screen.getByLabelText(/PIP submitted/i);
    await userEvent.click(pipCheckbox);

    expect(pipCheckbox).toBeChecked();
    // Verify persisted
    const data = storageService.getData();
    expect(data.groups[groupId].students[studentId].milestones.pip.done).toBe(true);
  });

  it('sets date when checking off checkbox_date milestone', async () => {
    render(<StudentDetail groupId={groupId} studentId={studentId} />);

    await userEvent.click(screen.getByLabelText(/PIP submitted/i));

    // Should auto-set today's date
    const dateInput = screen.getByTestId('milestone-pip-date');
    expect(dateInput.value).toBe(new Date().toISOString().slice(0, 10));
  });

  it('updates counter for feedback forms', async () => {
    render(<StudentDetail groupId={groupId} studentId={studentId} />);

    const incrementBtn = screen.getByTestId('feedback-round1-increment');
    await userEvent.click(incrementBtn);
    await userEvent.click(incrementBtn);
    await userEvent.click(incrementBtn);

    expect(screen.getByText('3/4')).toBeInTheDocument();
  });

  it('shows overdue status for past-due incomplete milestones', () => {
    // Student with start date 5 weeks ago, PIP (week 1) not done
    render(<StudentDetail groupId={groupId} studentId={studentId} />);

    const pipItem = screen.getByTestId('milestone-pip');
    expect(pipItem).toHaveClass('milestone-overdue'); // or check for red indicator
  });

  it('shows upcoming status for milestones due within 7 days', () => {
    // Student with start date such that a milestone is due in 5 days
    render(<StudentDetail groupId={groupId} studentId={studentId} />);

    const visitItem = screen.getByTestId('milestone-visit1');
    expect(visitItem).toHaveClass('milestone-upcoming'); // or check for yellow indicator
  });
});
```

---

### Task 7: Student Detail View

#### Subtasks

- [x] **7.1.** Create `src/views/StudentDetail.jsx`:
  - Header: student name, organisation, city, specialisation
  - Subheader: coach name, examiner name, start date, current week, end date
  - Back button to group view

- [x] **7.2.** Create `src/components/students/StudentHeader.jsx`:
  - Displays student info
  - Edit button to modify student details

- [x] **7.3.** Create `src/components/students/ProgressSummary.jsx`:
  - Shows overall progress (X/Y milestones)
  - Progress bar visualization
  - Overdue count, upcoming count

- [x] **7.4.** Integrate MilestoneChecklist into StudentDetail

- [x] **7.5.** Create `src/components/notes/NotesPanel.jsx`:
  - List of timestamped notes (newest first)
  - "Add note" button/input
  - Delete button per note (with confirmation)

- [x] **7.6.** Create `src/components/notes/NoteItem.jsx`:
  - Displays timestamp and text
  - Delete icon

- [x] **7.7.** Create `src/hooks/useNotes.js`:
  - `addNote(groupId, studentId, text)`
  - `deleteNote(groupId, studentId, noteId)`

- [x] **7.8.** Test Gate 7 passes

#### Test Gate 7
```javascript
// tests/integration/studentDetailView.test.js
describe('Student Detail View', () => {
  let groupId, studentId;

  beforeEach(() => {
    // Setup: create group with student
  });

  it('displays student information correctly', () => {
    render(<StudentDetail groupId={groupId} studentId={studentId} />);

    expect(screen.getByText('Anna')).toBeInTheDocument();
    expect(screen.getByText('Rabobank')).toBeInTheDocument();
    expect(screen.getByText('Utrecht')).toBeInTheDocument();
    expect(screen.getByText(/Coach: Peter/i)).toBeInTheDocument();
    expect(screen.getByText(/Week 3 of 21/i)).toBeInTheDocument();
  });

  it('navigates back to group view', async () => {
    const navigate = vi.fn();
    render(<StudentDetail groupId={groupId} studentId={studentId} />, { navigate });

    await userEvent.click(screen.getByText(/back/i));

    expect(navigate).toHaveBeenCalledWith(`/groups/${groupId}`);
  });

  it('adds a note', async () => {
    render(<StudentDetail groupId={groupId} studentId={studentId} />);

    await userEvent.click(screen.getByText(/add note/i));
    await userEvent.type(screen.getByPlaceholderText(/enter note/i), 'Good progress on research phase.');
    await userEvent.click(screen.getByText(/save/i));

    expect(screen.getByText('Good progress on research phase.')).toBeInTheDocument();
    expect(screen.getByText(/just now/i)).toBeInTheDocument(); // or formatted timestamp
  });

  it('deletes a note with confirmation', async () => {
    // Setup: add a note first
    render(<StudentDetail groupId={groupId} studentId={studentId} />);

    await userEvent.click(screen.getByTestId('delete-note-0'));
    await userEvent.click(screen.getByText(/confirm/i));

    expect(screen.queryByText('Test note')).not.toBeInTheDocument();
  });

  it('shows progress summary', () => {
    render(<StudentDetail groupId={groupId} studentId={studentId} />);

    expect(screen.getByText(/4\/18 milestones/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '22'); // ~22%
  });
});
```

---

### Task 8: Dashboard & "This Week" Panel

#### Subtasks

- [x] **8.1.** Create `src/views/Dashboard.jsx`:
  - Left sidebar: GroupList
  - Main area: selected group's StudentTable or welcome message
  - Right panel: ThisWeekPanel

- [x] **8.2.** Create `src/components/dashboard/ThisWeekPanel.jsx`:
  - Aggregates all urgent items across ALL active groups
  - Sections: Overdue (red), Upcoming 7 days (yellow)
  - Each item shows: student name, group name, milestone name, deadline

- [x] **8.3.** Create `src/hooks/useThisWeekItems.js`:
  - Collects all students from all active groups
  - Calculates overdue and upcoming milestones
  - Returns sorted list (overdue first, then by deadline)

- [x] **8.4.** Create `src/components/dashboard/ActionItem.jsx`:
  - Displays single action item
  - Click navigates to student detail
  - Shows urgency indicator

- [x] **8.5.** Create `src/components/dashboard/WelcomeMessage.jsx`:
  - Shown when no group is selected
  - Quick stats: total students, items needing attention
  - Prompts to select a group or create first group

- [x] **8.6.** Implement group selection state:
  - URL-based routing or local state
  - Remember last selected group

- [x] **8.7.** Test Gate 8 passes

#### Test Gate 8
```javascript
// tests/integration/dashboard.test.js
describe('Dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    initializeApp();
    // Setup: create groups with students at various stages
  });

  it('shows welcome message when no group selected', () => {
    render(<Dashboard />);
    expect(screen.getByText(/select a group/i)).toBeInTheDocument();
  });

  it('shows student table when group is selected', async () => {
    render(<Dashboard />);
    await userEvent.click(screen.getByText('Semester 2'));

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Anna')).toBeInTheDocument();
  });

  it('aggregates overdue items across all groups', () => {
    render(<Dashboard />);

    const thisWeekPanel = screen.getByTestId('this-week-panel');
    expect(within(thisWeekPanel).getByText(/2 overdue/i)).toBeInTheDocument();
    expect(within(thisWeekPanel).getByText('Anna - PIP submitted')).toBeInTheDocument();
  });

  it('aggregates upcoming items within 7 days', () => {
    render(<Dashboard />);

    const thisWeekPanel = screen.getByTestId('this-week-panel');
    expect(within(thisWeekPanel).getByText(/3 upcoming/i)).toBeInTheDocument();
  });

  it('clicking action item navigates to student', async () => {
    render(<Dashboard />);

    await userEvent.click(screen.getByText('Anna - 1st visit'));

    expect(screen.getByText(/student detail/i)).toBeInTheDocument();
    expect(screen.getByText('Anna')).toBeInTheDocument();
  });

  it('shows correct needs-attention count on group cards', () => {
    render(<Dashboard />);

    const groupCard = screen.getByTestId('group-card-sem2');
    expect(within(groupCard).getByText(/2 need attention/i)).toBeInTheDocument();
  });
});
```

---

### Task 9: Export/Import Functionality

#### Subtasks

- [x] **9.1.** Create `src/services/exportService.js`:
  - `exportData()` - returns full app data as JSON string
  - `downloadExport()` - triggers browser download of JSON file
  - Filename format: `gi-tracker-backup-YYYY-MM-DD.json`

- [x] **9.2.** Create `src/services/importService.js`:
  - `validateImport(jsonString)` - validates structure, returns errors or parsed data
  - `importData(data, mode)` - mode: 'replace' | 'merge'
  - Merge logic: add new groups/templates, skip duplicates by ID

- [x] **9.3.** Create `src/components/settings/ExportButton.jsx`:
  - One-click export button
  - Shows success toast

- [x] **9.4.** Create `src/components/settings/ImportDialog.jsx`:
  - File upload input (accepts .json)
  - Validation feedback
  - Replace/merge option selector
  - Preview of what will be imported
  - Confirm button

- [x] **9.5.** Create `src/views/Settings.jsx`:
  - Export section with ExportButton
  - Import section with ImportDialog
  - Storage usage indicator

- [x] **9.6.** Add Settings link to app header/navigation

- [x] **9.7.** Test Gate 9 passes

#### Test Gate 9
```javascript
// tests/unit/exportService.test.js
describe('Export Service', () => {
  it('exports all data as valid JSON', () => {
    const testData = { version: '1.0', templates: { t1: {} }, groups: { g1: {} } };
    storageService.setData(testData);

    const exported = exportService.exportData();
    expect(JSON.parse(exported)).toEqual(testData);
  });

  it('generates correct filename', () => {
    const filename = exportService.getExportFilename();
    expect(filename).toMatch(/gi-tracker-backup-\d{4}-\d{2}-\d{2}\.json/);
  });
});

// tests/unit/importService.test.js
describe('Import Service', () => {
  it('validates correct data structure', () => {
    const valid = { version: '1.0', templates: {}, groups: {} };
    const result = importService.validateImport(JSON.stringify(valid));
    expect(result.valid).toBe(true);
  });

  it('rejects invalid JSON', () => {
    const result = importService.validateImport('not json');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid JSON');
  });

  it('rejects missing required fields', () => {
    const result = importService.validateImport(JSON.stringify({ foo: 'bar' }));
    expect(result.valid).toBe(false);
  });

  it('replaces all data in replace mode', () => {
    storageService.setData({ version: '1.0', templates: { old: {} }, groups: {} });

    const newData = { version: '1.0', templates: { new: {} }, groups: {} };
    importService.importData(newData, 'replace');

    const result = storageService.getData();
    expect(result.templates.old).toBeUndefined();
    expect(result.templates.new).toBeDefined();
  });

  it('merges data in merge mode', () => {
    storageService.setData({ version: '1.0', templates: { existing: {} }, groups: { g1: {} } });

    const newData = { version: '1.0', templates: { new: {} }, groups: { g2: {} } };
    importService.importData(newData, 'merge');

    const result = storageService.getData();
    expect(result.templates.existing).toBeDefined();
    expect(result.templates.new).toBeDefined();
    expect(result.groups.g1).toBeDefined();
    expect(result.groups.g2).toBeDefined();
  });
});

// tests/integration/exportImport.test.js
describe('Export/Import UI', () => {
  it('exports data and downloads file', async () => {
    const downloadSpy = vi.spyOn(exportService, 'downloadExport');
    render(<Settings />);

    await userEvent.click(screen.getByText(/export backup/i));

    expect(downloadSpy).toHaveBeenCalled();
    expect(screen.getByText(/export successful/i)).toBeInTheDocument();
  });

  it('imports valid file', async () => {
    render(<Settings />);

    const file = new File([JSON.stringify({ version: '1.0', templates: {}, groups: {} })], 'backup.json', { type: 'application/json' });
    const input = screen.getByLabelText(/choose file/i);

    await userEvent.upload(input, file);
    await userEvent.click(screen.getByText(/import/i));

    expect(screen.getByText(/import successful/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid file', async () => {
    render(<Settings />);

    const file = new File(['invalid'], 'bad.json', { type: 'application/json' });
    await userEvent.upload(screen.getByLabelText(/choose file/i), file);

    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
    expect(screen.getByText(/import/i)).toBeDisabled();
  });
});
```

---

### Task 10: Responsive Layout & Polish

#### Subtasks

- [x] **10.1.** Implement responsive breakpoints:
  - Mobile (< 640px): Stack layout, collapsible sidebar
  - Tablet (640px - 1024px): Two-column layout
  - Desktop (> 1024px): Full three-column layout

- [x] **10.2.** Create `src/components/common/Sidebar.jsx`:
  - Collapsible on mobile
  - Toggle button
  - Overlay on mobile

- [x] **10.3.** Add keyboard navigation:
  - Tab through interactive elements
  - Enter to activate buttons
  - Escape to close modals

- [x] **10.4.** Verify color contrast meets WCAG AA:
  - Urgency colors (red/yellow/green) with text
  - All interactive elements

- [x] **10.5.** Add loading states:
  - Initial app load
  - Data operations

- [x] **10.6.** Add empty states:
  - No groups
  - No students in group
  - No notes for student

- [x] **10.7.** Add confirmation toasts:
  - Success/error feedback for CRUD operations

- [x] **10.8.** Create `src/components/common/Toast.jsx`:
  - Auto-dismiss after 3 seconds
  - Success/error/warning variants

- [x] **10.9.** Test Gate 10 passes

#### Test Gate 10
```javascript
// tests/integration/responsive.test.js
describe('Responsive Layout', () => {
  it('shows sidebar toggle on mobile', () => {
    window.innerWidth = 375;
    window.dispatchEvent(new Event('resize'));

    render(<Dashboard />);

    expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toHaveClass('hidden');
  });

  it('shows full layout on desktop', () => {
    window.innerWidth = 1280;
    window.dispatchEvent(new Event('resize'));

    render(<Dashboard />);

    expect(screen.queryByTestId('sidebar-toggle')).not.toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeVisible();
    expect(screen.getByTestId('this-week-panel')).toBeVisible();
  });
});

// tests/integration/accessibility.test.js
describe('Accessibility', () => {
  it('all interactive elements are keyboard accessible', async () => {
    render(<Dashboard />);

    // Tab through elements
    await userEvent.tab();
    expect(screen.getByText(/new group/i)).toHaveFocus();

    await userEvent.tab();
    // Continue verifying focus order
  });

  it('modals can be closed with Escape', async () => {
    render(<Dashboard />);
    await userEvent.click(screen.getByText(/new group/i));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// tests/integration/polish.test.js
describe('UI Polish', () => {
  it('shows empty state when no groups exist', () => {
    localStorage.clear();
    initializeApp();
    render(<Dashboard />);

    expect(screen.getByText(/no groups yet/i)).toBeInTheDocument();
    expect(screen.getByText(/create your first group/i)).toBeInTheDocument();
  });

  it('shows toast on successful action', async () => {
    render(<Dashboard />);

    await userEvent.click(screen.getByText(/new group/i));
    await userEvent.type(screen.getByLabelText(/name/i), 'New Group');
    await userEvent.click(screen.getByText(/create/i));

    expect(screen.getByText(/group created/i)).toBeInTheDocument();

    // Auto-dismiss
    await waitFor(() => {
      expect(screen.queryByText(/group created/i)).not.toBeInTheDocument();
    }, { timeout: 4000 });
  });
});
```

---

### Task 11: End-to-End Testing & Final Verification

#### Subtasks

- [x] **11.1.** Install Playwright for E2E testing
```bash
npm install -D @playwright/test
npx playwright install
```

- [x] **11.2.** Create E2E test for complete user journey:
  - First-time user opens app
  - Creates a group
  - Adds students
  - Tracks milestones
  - Adds notes
  - Exports data
  - Clears and reimports

- [x] **11.3.** Create E2E test for data persistence:
  - Add data, close browser, reopen, verify data

- [x] **11.4.** Performance testing:
  - Create 50 students across 5 groups
  - Measure load time and interaction responsiveness

- [x] **11.5.** Production build verification:
  - Run `npm run build`
  - Serve built files locally
  - Verify all functionality works

- [x] **11.6.** Browser compatibility testing:
  - Chrome, Firefox, Safari, Edge
  - Note: localStorage must work

- [x] **11.7.** Test Gate 11 (Final) passes

#### Test Gate 11 (Final)
```javascript
// tests/e2e/fullJourney.spec.js
import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('first-time user can complete full workflow', async ({ page }) => {
    // Verify initial state
    await expect(page.getByText(/GI Supervision Tracker/i)).toBeVisible();
    await expect(page.getByText(/no groups yet/i)).toBeVisible();

    // Create a group
    await page.click('text=New Group');
    await page.fill('label:has-text("Name")', 'Semester 2 - Feb 2026');
    await page.click('text=Create');
    await expect(page.getByText('Semester 2 - Feb 2026')).toBeVisible();

    // Add a student
    await page.click('text=Semester 2 - Feb 2026');
    await page.click('text=Add Student');
    await page.fill('label:has-text("First name")', 'Anna');
    await page.fill('label:has-text("Organisation")', 'Rabobank');
    await page.fill('label:has-text("City")', 'Utrecht');
    await page.fill('label:has-text("Company coach")', 'Peter');
    await page.fill('label:has-text("Examiner")', 'Karin');
    await page.fill('label:has-text("Start date")', '2026-02-02');
    await page.click('text=Save');

    await expect(page.getByText('Anna')).toBeVisible();
    await expect(page.getByText('Rabobank')).toBeVisible();

    // View student detail
    await page.click('text=Anna');
    await expect(page.getByText(/Week \d+ of 21/)).toBeVisible();

    // Check off a milestone
    await page.click('label:has-text("Meet & greet")');
    await expect(page.getByLabel('Meet & greet')).toBeChecked();

    // Add a note
    await page.click('text=Add note');
    await page.fill('textarea', 'Great first meeting, student is motivated.');
    await page.click('text=Save');
    await expect(page.getByText('Great first meeting')).toBeVisible();

    // Go back and verify progress updated
    await page.click('text=Back');
    await expect(page.getByText(/1\/\d+ milestones/)).toBeVisible();

    // Export data
    await page.click('text=Settings');
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export Backup');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/gi-tracker-backup.*\.json/);

    // Clear and reimport
    await page.click('text=Clear All Data');
    await page.click('text=Confirm');
    await expect(page.getByText(/no groups yet/i)).toBeVisible();

    // Import
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Choose File');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(await download.path());
    await page.click('text=Import');

    // Verify data restored
    await expect(page.getByText('Semester 2 - Feb 2026')).toBeVisible();
  });

  test('data persists across browser sessions', async ({ page, context }) => {
    // Create data
    await page.click('text=New Group');
    await page.fill('label:has-text("Name")', 'Persistent Group');
    await page.click('text=Create');

    // Close and reopen
    await page.close();
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Verify data persisted
    await expect(newPage.getByText('Persistent Group')).toBeVisible();
  });

  test('handles 50+ students without performance degradation', async ({ page }) => {
    // Create 5 groups with 10 students each
    for (let g = 1; g <= 5; g++) {
      await page.click('text=New Group');
      await page.fill('label:has-text("Name")', `Group ${g}`);
      await page.click('text=Create');
      await page.click(`text=Group ${g}`);

      for (let s = 1; s <= 10; s++) {
        await page.click('text=Add Student');
        await page.fill('label:has-text("First name")', `Student ${g}-${s}`);
        await page.fill('label:has-text("Organisation")', `Company ${s}`);
        await page.fill('label:has-text("City")', 'City');
        await page.fill('label:has-text("Start date")', '2026-02-02');
        await page.click('text=Save');
      }

      await page.click('text=Dashboard');
    }

    // Measure load time
    const startTime = Date.now();
    await page.reload();
    await page.waitForSelector('text=Group 1');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000); // Should load in under 2 seconds

    // Verify This Week panel aggregates all students
    await expect(page.getByTestId('this-week-panel')).toBeVisible();
  });
});
```

---

## 5. Build Commands Reference

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build

# Testing
npm test             # Run unit + integration tests (Vitest)
npm run test:watch   # Watch mode
npm run test:coverage # With coverage report
npm run test:e2e     # Run Playwright E2E tests

# Linting (optional, add if desired)
npm run lint         # ESLint
```

---

## 6. Definition of Done

A task is complete when:
1. All subtasks are implemented
2. All tests in the Test Gate pass
3. No regressions in previous Test Gates
4. Code follows project conventions (React hooks, Tailwind classes)
5. No TypeScript/JSDoc type errors
6. UI matches PRD wireframes conceptually

---

## 7. Phase Summary

| Phase | Tasks | Deliverable |
|-------|-------|-------------|
| **Phase 1 MVP** | Tasks 1-11 | Fully functional tracker with all core features |
| Phase 2 (future) | Template editor, archiving, advanced filtering | Enhanced management |
| Phase 3 (future) | Search, bulk actions, notifications, print, dark mode | Quality of life |

This TDD covers Phase 1 (MVP). Future phases will have separate TDDs building on this foundation.

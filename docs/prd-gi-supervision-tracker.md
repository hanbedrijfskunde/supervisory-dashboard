# Product Requirements Document: GI Supervision Tracker

## 1. Product Overview

### 1.1 Problem Statement
Supervisors of Graduation Internship (GI) students at HAN International School of Business manage multiple students simultaneously — often across different start dates, specialisations, and study programmes. The 21-week GI process involves a dense sequence of deliverables, company visits, feedback rounds, and hard deadlines. Keeping track of where each student stands requires constant mental overhead and is currently managed through scattered emails, spreadsheets, and manual calendar checks.

### 1.2 Vision
A lightweight, privacy-first, browser-based supervision dashboard that gives the supervisor an immediate, at-a-glance overview of the status and progress of every GI student they supervise — eliminating the need to reconstruct this picture from memory or scattered sources each time a decision or action is needed.

### 1.3 Design Principles

| Principle | Meaning |
|---|---|
| **Light over heavy** | Minimal clicks. No onboarding. No accounts. Open and use. |
| **Privacy first** | First names only. No student numbers, no email addresses, no contact data. All data stays in the browser's local storage — never transmitted. |
| **Supervisor-centric** | Built for the supervisor's perspective: "What do I need to do or follow up on?" Not a student-facing tool. |
| **Reusable and parallel** | Multiple groups of students can run in parallel. Different study programmes (with their own milestones and assessment criteria) can coexist. |
| **Smart defaults, flexible overrides** | The system auto-calculates deadlines from a start date, but the supervisor can override any date. |

---

## 2. Users and Use Cases

### 2.1 Primary User
The GI Supervisor (who is also the 1st Examiner). This person typically supervises 5–15 students at a time, sometimes across overlapping cohorts, semesters, and study programmes.

### 2.2 Core Use Cases

| # | Use Case | Frequency |
|---|---|---|
| UC-1 | **Quick scan**: Open the dashboard, immediately see which students need attention this week (upcoming deadlines, overdue items, flagged risks). | Daily / several times per week |
| UC-2 | **Prepare for a company visit**: Pull up a single student's full timeline and notes before a scheduled visit. | Before each visit (~2× per student) |
| UC-3 | **Record progress**: After receiving a deliverable or completing a visit, tick it off and add a brief note. | After every milestone event |
| UC-4 | **Manage groups**: Create a new cohort group, archive a completed one, run multiple in parallel. | Start/end of each semester |
| UC-5 | **Configure for a different programme**: Set up a new study programme template with its own milestones and Performance Areas. | Occasionally (once per programme) |
| UC-6 | **Export/backup**: Export all data as JSON to safeguard against browser data loss. Re-import on another device or browser. | Periodically |

---

## 3. Information Architecture

### 3.1 Data Model

The system has four main entities:

```
Programme Template (reusable)
  └── defines: milestones, Performance Areas, grading rules
  
Group (a cohort of students)
  └── linked to: one Programme Template
  └── contains: multiple Students

Student (a single GI student within a Group)
  └── has: milestone statuses, notes, scores, flags

Supervisor Notes (per student, timestamped)
```

### 3.2 Programme Template

A programme template captures the rules, structure, and assessment criteria for a specific study programme. The system ships with a default template based on the HAN ISB GI Manual 2025–2026 for IB/CS. The supervisor can duplicate and adapt this for other programmes.

**Template fields:**

| Field | Type | Description |
|---|---|---|
| `name` | string | e.g. "GI – International Business 2025-26" |
| `duration_weeks` | number | Default: 21 |
| `milestones[]` | array | Ordered list of milestone definitions (see §3.3) |
| `performance_areas[]` | array | Ordered list of PAs with name + description (used as reference labels, not for scoring) |
| `specialisations[]` | array | Optional list of specialisation labels (e.g. M&S, FIN, SCM, O&C, Generic) |

**Default Performance Areas (IB/CS):**

| # | Performance Area | Short Description |
|---|---|---|
| PA1 | Entrepreneurial Behaviour | Pro-active behaviour and investigative attitude |
| PA2 | Innovative Capacity | Problem-solving attitude supported by analytical behaviour |
| PA3 | Collaborative Capacity | Effective collaboration across teams and backgrounds |
| PA4 | Intercultural Proficiency | Recognising cultural differences, effective intercultural communication |
| PA5 | Reflective Practitioner | Taking responsibility for own professional development |
| PP | Professional Products | Company-related tasks, activities and professional products at exit level |

### 3.3 Milestones (Default IB/CS Template)

Each milestone has a week offset (relative to start), a name, a type, and a tracking mode.

| Week | Milestone | Type | Tracking |
|---|---|---|---|
| 0 | Meet & greet with supervisor | meeting | checkbox + date |
| 0 | Agree PIP submission date | admin | date |
| 1 | Student starts at company | admin | date (= start date) |
| 1 | PIP submitted | deliverable | checkbox + date |
| 2–3 | 1st company visit | visit | checkbox + date + format (physical/Teams) |
| 2–3 | AI usage permission discussed & confirmed | admin | checkbox |
| 2–3 | Meeting report Wk 2/3 received | deliverable | checkbox + date |
| 9–10 | 1st round 360° feedback forms collected (4×) | deliverable | counter (0–4+) |
| 9–10 | 1st appraisal form (company coach) received | deliverable | checkbox + date |
| 9–10 | 1st interim portfolio submitted | deliverable | checkbox + date |
| 10–11 | 2nd company visit | visit | checkbox + date + format (physical/Teams) |
| 10–11 | Meeting report Wk 10/11 received | deliverable | checkbox + date |
| 10–11 | Student survey completed | admin | checkbox |
| 13–14 | 2nd interim portfolio submitted | deliverable | checkbox + date |
| 14–17 | 2nd round 360° feedback forms collected (4×) | deliverable | counter (0–4+) |
| 14–17 | 2nd appraisal form (company coach) received | deliverable | checkbox + date |
| 17 | Draft (concept) final portfolio submitted | deliverable | checkbox + date |
| 19 | Final portfolio submitted (HARD DEADLINE) | deliverable | checkbox + date |
| 19 | Portfolio uploaded in HandIn | admin | checkbox |
| 19 | Internship agreement included in HandIn | admin | checkbox |
| 21 | CBI held | assessment | checkbox + date + format |
| — | Resit portfolio submitted (if applicable) | deliverable | checkbox + date |
| — | Resit CBI held (if applicable) | assessment | checkbox + date |

### 3.4 Student Record

| Field | Type | Privacy | Description |
|---|---|---|---|
| `first_name` | string | ✓ safe | First name only |
| `organisation` | string | ✓ safe | Name of the external organisation |
| `organisation_city` | string | ✓ safe | City where the organisation / internship is located |
| `company_coach_name` | string | ✓ safe | First name of the company coach (contact person at the organisation) |
| `examiner_name` | string | ✓ safe | First name of the 2nd examiner |
| `specialisation` | enum | ✓ safe | Selected from programme template's list |
| `start_date` | date | ✓ safe | GI start date — all deadlines derived from this |
| `end_date` | date (auto) | ✓ safe | Auto-calculated: start + 21 weeks |
| `final_submission_date` | date | ✓ safe | Week 19 — can be overridden |
| `milestones{}` | object | ✓ safe | Status per milestone (see §3.3) |
| `notes[]` | array | ✓ safe | Timestamped supervisor notes (free text) |

**Explicitly excluded fields (privacy):** student number, email, phone, address, last name (of anyone), full company coach details, examiner contact info.

---

## 4. Functional Requirements

### 4.1 Dashboard (Home View)

**FR-1.1** On opening the app, the supervisor sees a list of their active groups. Each group shows a summary: group name, programme, number of students, and a count of items needing attention.

**FR-1.2** Selecting a group shows a **student overview table** with columns: name, company, specialisation, current week number (auto-calculated from start date), overall progress indicator (e.g. "7/18 milestones completed"), risk flag, and next upcoming deadline.

**FR-1.3** The table is **sortable** by any column and **filterable** by specialisation and milestone status.

**FR-1.4** A colour-coded **urgency system** highlights:
- 🔴 Red: overdue milestones (deadline passed, not checked off)
- 🟡 Yellow: upcoming milestones within the next 7 days
- 🟢 Green: on track (no overdue, no imminent deadlines)

**FR-1.5** A **"This Week" panel** aggregates all actions across all active groups: upcoming visits, deadlines approaching, overdue items. This is the supervisor's action list.

### 4.2 Student Detail View

**FR-2.1** A full-page view for a single student showing their complete timeline as a visual progress bar or checklist, with milestones marked as done/pending/overdue.

**FR-2.2** The supervisor can check off milestones, enter dates, and adjust counters (e.g. feedback forms received: 3/4).

**FR-2.3** A **notes section** where the supervisor can add timestamped free-text notes (e.g. "Discussed level concerns — tasks seem too operational. Follow up at visit 2."). Notes are append-only with option to delete.

**FR-2.4** The milestone checklist itself communicates status: the combination of overdue items (red), upcoming items (yellow), and completion progress tells the supervisor everything they need to know about where a student stands.

### 4.3 Group Management

**FR-3.1** Create a new group with: name (e.g. "Semester 2 – Feb 2026"), linked programme template, optional description.

**FR-3.2** Add students to a group via a simple form: first name, organisation, city, company coach (first name), examiner (first name), specialisation (dropdown from template), start date.

**FR-3.3** Archive a completed group (hides from active view, data retained).

**FR-3.4** Delete a group (with confirmation — permanent).

**FR-3.5** Delete an individual student from a group (with confirmation — permanent).

**FR-3.6** Duplicate a group (to reuse structure for a new cohort).

### 4.4 Programme Template Management

**FR-4.1** View and edit programme templates. The system ships with one default template: "GI – IB/CS (HAN ISB 2025-26)".

**FR-4.2** Duplicate a template to create a new one for a different study programme.

**FR-4.3** Edit milestones: add, remove, reorder, rename, change week offsets.

**FR-4.4** Edit Performance Areas: add, remove, rename (used as reference labels, not for scoring).

**FR-4.5** Templates are never deleted if a group references them. They can be archived.

### 4.5 Data Management

**FR-5.1** All data is stored in the browser's `localStorage`. No server, no account, no network required after initial page load.

**FR-5.2** **Export**: one-click export of all data (all groups, all templates, all students) as a single JSON file, downloaded to the user's device.

**FR-5.3** **Import**: upload a previously exported JSON file to restore data. Options: merge with existing data or replace all.

**FR-5.4** A **storage usage indicator** showing how much of the ~5–10MB local storage budget is in use.

**FR-5.5** On first launch, the app seeds the default IB/CS programme template automatically.

---

## 5. Non-Functional Requirements

| # | Requirement | Detail |
|---|---|---|
| NFR-1 | **Privacy** | Zero personal data beyond first names. No analytics, no telemetry, no cookies, no server calls after initial load. |
| NFR-2 | **Offline-capable** | Once loaded, the app works fully offline. |
| NFR-3 | **Performance** | Instant load. Must handle 50+ students across 5+ groups without lag. |
| NFR-4 | **Portability** | Single HTML file (or minimal static files). Runs in any modern browser. No install required. |
| NFR-5 | **Data resilience** | Clear warnings about browser data volatility. Prominent export/backup reminders. |
| NFR-6 | **Accessibility** | Keyboard navigable. Sufficient colour contrast. Readable on tablets. |
| NFR-7 | **Responsive** | Usable on laptop, desktop, and tablet screen sizes. |

---

## 6. Technical Architecture

### 6.1 Stack
- **Single-page application** (SPA) — no backend.
- **React** (via JSX artifact or bundled HTML) with Tailwind CSS for styling.
- **localStorage** for persistence.
- **JSON export/import** for data portability and backup.

### 6.2 Data Storage Schema (localStorage)

```json
{
  "gi_tracker_version": "1.0",
  "templates": {
    "<template_id>": {
      "name": "GI – IB/CS (HAN ISB 2025-26)",
      "duration_weeks": 21,
      "milestones": [
        {
          "id": "m1",
          "name": "Meet & greet with supervisor",
          "week": 0,
          "type": "meeting",
          "tracking": "checkbox_date"
        }
      ],
      "performance_areas": [
        { "id": "pa1", "name": "Entrepreneurial Behaviour", "short": "EB" }
      ],
      "specialisations": ["Finance", "Marketing & Sales", "SCM", "O&C", "Generic"]
    }
  },
  "groups": {
    "<group_id>": {
      "name": "Semester 2 – Feb 2026",
      "template_id": "<template_id>",
      "status": "active",
      "created_at": "2026-02-01T00:00:00Z",
      "students": {
        "<student_id>": {
          "first_name": "Anna",
          "organisation": "Rabobank",
          "organisation_city": "Utrecht",
          "company_coach_name": "Peter",
          "examiner_name": "Karin",
          "specialisation": "Finance",
          "start_date": "2026-02-02",
          "milestones": {
            "m1": { "done": true, "date": "2026-01-28" },
            "m2": { "done": false, "date": null }
          },
          "notes": [
            { "timestamp": "2026-02-03T10:30:00Z", "text": "Agreement received. Good first impression." }
          ]
        }
      }
    }
  }
}
```

### 6.3 Auto-Calculations

| Calculated Field | Logic |
|---|---|
| Current week | `floor((today - start_date) / 7)` |
| End date | `start_date + (duration_weeks × 7)` |
| Milestone deadline | `start_date + (milestone.week × 7)` |
| Milestone status | `overdue` if week passed and not done; `upcoming` if within 7 days; `pending` otherwise |
| Progress | `milestones_done / total_milestones` (as fraction and count) |

---

## 7. UI Wireframe Concepts

### 7.1 Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  GI Supervision Tracker                    [⚙ Settings] │
├────────────────────┬────────────────────────────────────┤
│                    │                                    │
│  GROUPS            │  THIS WEEK                         │
│  ─────             │  ─────────                         │
│  ● Sem 2 Feb '26   │  🔴 2 overdue items                │
│    8 students      │  🟡 3 upcoming this week            │
│    2 need action   │                                    │
│                    │  • Anna — 1st interim portfolio    │
│  ● Sem 1 Sep '25   │    due in 3 days                   │
│    6 students      │  • Mark — Meeting report Wk 2/3   │
│    (archived)      │    overdue by 2 days               │
│                    │  • ...                             │
│  [+ New Group]     │                                    │
│                    │                                    │
├────────────────────┴────────────────────────────────────┤
│  STUDENT OVERVIEW — Sem 2 Feb '26                       │
│  ──────────────────────────────────                     │
│  Name    Organisation    City     Spec  Wk  Progress    │
│  ─────── ─────────────── ──────── ───── ──  ────────    │
│  Anna    Rabobank        Utrecht  FIN    2  ███░░ 4/18  │
│  Mark    Heineken        A'dam    M&S    3  ██░░░ 3/18  │
│  Sarah   Philips         Eindhvn  SCM    1  █░░░░ 2/18  │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Student Detail Layout

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to group     Anna — Rabobank, Utrecht (Finance) │
│                       Coach: Peter | Examiner: Karin    │
│                       Start: 2 Feb 2026 | Week 2 of 21  │
├─────────────────────────────────────────────────────────┤
│  TIMELINE                                               │
│  ────────                                               │
│  ✅ Wk 0  Meet & greet                    28 Jan 2026   │
│  ✅ Wk 0  PIP date agreed                 28 Jan 2026   │
│  ✅ Wk 1  Started at company              02 Feb 2026   │
│  ✅ Wk 1  PIP submitted                   07 Feb 2026   │
│  🟡 Wk 2  1st company visit               [  /  /    ]  │
│  ○  Wk 2  AI usage confirmed              [ ]           │
│  ○  Wk 2  Meeting report received          [ ]           │
│  ○  Wk 9  360° forms round 1              [0/4]         │
│  ...                                                    │
├─────────────────────────────────────────────────────────┤
│  NOTES                              [+ Add note]        │
│  ─────                                                  │
│  3 Feb 2026, 10:30                                      │
│  Agreement received. Company seems well-structured.     │
│  Planning visit 1 for week of 17 Feb.                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 8. MVP Scope and Phasing

### Phase 1 — MVP (build first)
- Default IB/CS programme template, pre-loaded
- Group creation and student management (add, edit, remove)
- Full milestone checklist with auto-calculated deadlines
- Dashboard with "This Week" action panel
- Student detail view with timeline + notes
- JSON export/import
- Responsive layout (laptop + tablet)

### Phase 2 — Templates & Management
- Programme template editor (create, duplicate, edit milestones and PAs)
- Group archiving and duplication
- Filterable / sortable student overview by specialisation and milestone status

### Phase 3 — Quality of Life
- Search across all students and notes
- Bulk actions (e.g. "mark all Wk 9/10 milestones for selected students")
- Reminder/notification preferences (e.g. "warn me 7 days before any hard deadline")
- Print-friendly student summary (for taking to a company visit)
- Dark mode

---

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Browser localStorage cleared (cache wipe, new device) | All data lost | Prominent backup reminders + easy JSON export. Consider auto-download backup weekly. |
| localStorage size limit (~5–10MB) | Cannot add more students/notes | Storage indicator in settings. Notes are short text; 50 students with extensive notes ≈ 200KB — well within limits. |
| Different programmes have fundamentally different structures | Template system doesn't flex enough | Keep template structure generic: milestones are just a list; PAs are just a list; grading rules are configurable. |
| Supervisor forgets to open the app | Deadlines missed | The tool is intentionally passive (no push notifications). It replaces a spreadsheet, not a calendar app. |
| GDPR concerns even with first names | First name + organisation + city could be identifying in combination | Explicit design decision documented. Only first names stored. No data leaves the device. Supervisor's responsibility to handle appropriately. |

---

## 10. Success Criteria

The tool is successful if the supervisor can:

1. **In under 10 seconds**, answer "Which students need my attention this week?"
2. **In under 30 seconds**, pull up a student's full status before a company visit.
3. **In under 5 seconds**, record that a deliverable was received.
4. **Without any external tool**, track the full 21-week lifecycle of a GI student from start to CBI.
5. **Confidently reuse** the same tool for a new cohort or a different study programme without reconfiguring from scratch.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GI Supervision Tracker is a privacy-first, browser-based dashboard for supervisors managing Graduation Internship (GI) students at HAN International School of Business. The tool provides at-a-glance status tracking for 5-15 students across the 21-week GI process.

**Status**: Greenfield project - see [docs/prd-gi-supervision-tracker.md](docs/prd-gi-supervision-tracker.md) for full requirements.

## Tech Stack

- **React** SPA (no backend)
- **Tailwind CSS** for styling
- **localStorage** for all data persistence (no server, no accounts)
- **JSON export/import** for data portability

Target: Single HTML file or minimal static files, runs in any modern browser.

## Core Design Principles

1. **Privacy first**: First names only, no student numbers/emails/contact data. All data stays in browser localStorage - never transmitted.
2. **Light over heavy**: Minimal clicks, no onboarding, no accounts.
3. **Supervisor-centric**: Built for "What do I need to do or follow up on?" perspective.
4. **Offline-capable**: Works fully offline after initial load.

## Data Model

```
Programme Template (reusable)
  └── defines: milestones, Performance Areas, grading rules

Group (a cohort of students)
  └── linked to: one Programme Template
  └── contains: multiple Students

Student (within a Group)
  └── has: milestone statuses, notes, scores, flags
```

Key auto-calculations:
- Current week: `floor((today - start_date) / 7)`
- Milestone status: `overdue` if week passed and not done; `upcoming` if within 7 days
- Progress: `milestones_done / total_milestones`

## Urgency Color System

- Red: overdue milestones (deadline passed, not checked off)
- Yellow: upcoming milestones within 7 days
- Green: on track

## Privacy Constraints

**Allowed fields**: first names only, organisation name, organisation city, specialisation, dates, milestone statuses, free-text notes.

**Explicitly excluded**: student numbers, email, phone, address, last names, full contact details.

## Performance Requirements

Must handle 50+ students across 5+ groups without lag. Storage budget ~200KB for extensive usage (well within ~5-10MB localStorage limit).

## Task Tracking

**IMPORTANT**: When implementing features, always update the task list in [docs/tdd-gi-supervision-tracker.md](docs/tdd-gi-supervision-tracker.md):

1. **Before starting a subtask**: Identify which task you're working on
2. **After completing a subtask**: Mark it as done by changing `- [ ]` to `- [x]`
3. **After passing a test gate**: Mark the test gate subtask as complete and update the Progress Summary table
4. **Sequential execution**: Do not start a new Task until the previous Task's test gate passes

Example of marking a subtask complete:
```markdown
- [x] **1.1.** Initialize project with Vite + React  ← completed
- [ ] **1.2.** Install and configure Tailwind CSS    ← next task
```

Example of updating the Progress Summary (after Task 1 test gate passes):
```markdown
| 1 | Project Setup | [x] |
| 2 | Storage Service & Data Layer | [ ] |
```

This ensures progress is visible and the test-driven development workflow is followed correctly.

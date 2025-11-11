# Task Management System

This directory contains all tasks for the Loan Management Platform migration and development.

## Structure

```
.tasks/
├── README.md                 # This file
├── MASTER_TASK_LIST.md       # Complete task overview with status
├── 01-setup/                 # Project setup & infrastructure
├── 02-database/              # Database, Prisma, Server Actions
├── 03-ui-components/         # Shared UI components
├── 04-features/              # Core feature implementation
└── 05-polish/                # Testing, animations, accessibility
```

## Task File Format

Each task is a markdown file following this structure:

```markdown
# [TASK-XXX] Task Title

**Status:** NOT_STARTED | IN_PROGRESS | IN_REVIEW | COMPLETED | BLOCKED
**Phase:** Setup | Database | UI | Features | Polish
**Priority:** P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
**Estimated Effort:** XS | S | M | L | XL
**Branch:** `task/xxx-brief-description`

## Dependencies

- TASK-001
- TASK-002

## Description

[Detailed description of what needs to be done]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Implementation Approach

[Technical approach, architecture decisions]

## Tradeoffs & Alternatives

[Discussion of different approaches and why we chose this one]

## Testing Requirements

- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing steps

## Deployment Considerations

[Any deployment-specific notes]

## References

- [Link to PRD section]
- [Link to docs]
```

## Workflow

### 1. Starting a Task

```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b task/001-setup-nextjs

# Update task status to IN_PROGRESS
# Edit .tasks/XX-phase/TASK-XXX.md
```

### 2. During Development

- Follow the implementation approach outlined in the task
- Check off acceptance criteria as you complete them
- Commit frequently with clear messages
- Reference task ID in commits: `[TASK-001] Add Next.js configuration`

### 3. Completing a Task

```bash
# Push branch
git push origin task/001-setup-nextjs

# Create PR for review
# Update task status to IN_REVIEW
# After approval, merge and update status to COMPLETED
```

### 4. Review Process

- Each PR should reference the task file
- Reviewer checks acceptance criteria
- Tests must pass
- Code style and conventions followed

## Task Status Legend

- **NOT_STARTED**: Task defined but not begun
- **IN_PROGRESS**: Actively being worked on
- **IN_REVIEW**: PR created, awaiting review
- **BLOCKED**: Cannot proceed due to dependency or issue
- **COMPLETED**: Merged to main

## Task Priorities

- **P0**: Critical path items that block other work
- **P1**: Important features for MVP
- **P2**: Nice to have for MVP
- **P3**: Post-MVP enhancements

## Effort Estimates

- **XS**: < 2 hours
- **S**: 2-4 hours
- **M**: 4-8 hours (half day to full day)
- **L**: 1-2 days
- **XL**: 2+ days (consider breaking down)

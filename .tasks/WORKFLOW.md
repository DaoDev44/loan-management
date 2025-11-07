# Development Workflow Guide

## Task-Based Development Process

This project uses a structured task-based workflow to ensure quality, enable code review, and maintain clear progress tracking.

## Workflow Steps

### 1. Task Selection
- Review `MASTER_TASK_LIST.md` for available tasks
- Select task based on priority and dependencies
- Ensure all dependent tasks are completed

### 2. Pre-Implementation Discussion
- Review detailed task file in appropriate phase directory
- Discuss approach, tradeoffs, and alternatives
- Agree on implementation details
- Clarify any ambiguities

### 3. Create Feature Branch
```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create feature branch (use exact name from task file)
git checkout -b task/001-nextjs-setup
```

### 4. Implementation
- Follow implementation approach from task file
- Check off acceptance criteria as you complete them
- Commit frequently with descriptive messages
- Reference task ID in commit messages

**Commit Message Format:**
```
[TASK-001] Brief description of change

More detailed explanation if needed.

- Bullet points for multiple changes
- Keep commits atomic and focused
```

### 5. Testing
- Complete all testing requirements from task file
- Verify acceptance criteria are met
- Test edge cases and error handling

### 6. Update Task Status
Edit task file and update status:
```markdown
**Status:** IN_REVIEW
```

Update `MASTER_TASK_LIST.md` task status.

### 7. Create Pull Request
```bash
# Push branch
git push origin task/001-nextjs-setup

# Create PR via GitHub or:
gh pr create --title "[TASK-001] Initialize Next.js 14 Project" --body "$(cat .tasks/01-setup/TASK-001.md)"
```

**PR Template:**
```markdown
## Task
Closes TASK-001

## Description
[Brief description of changes]

## Acceptance Criteria
- [x] Criterion 1
- [x] Criterion 2
- [x] All criteria from task file

## Testing
- [x] All tests pass
- [x] Manual testing completed
- [x] No console errors

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Notes
[Any additional context or discussion points]
```

### 8. Code Review
- Reviewer checks:
  - [ ] All acceptance criteria met
  - [ ] Code follows project conventions
  - [ ] Tests pass
  - [ ] No obvious bugs or security issues
  - [ ] Documentation updated if needed

### 9. Merge & Cleanup
```bash
# After PR approval
git checkout main
git pull origin main

# Delete local branch
git branch -d task/001-nextjs-setup

# Update task status to COMPLETED in both files:
# - .tasks/XX-phase/TASK-XXX.md
# - .tasks/MASTER_TASK_LIST.md
```

### 10. Move to Next Task
- Update `MASTER_TASK_LIST.md` progress
- Select next task based on dependencies and priority
- Repeat process

## Branch Naming Convention

Format: `task/{task-id}-{brief-description}`

Examples:
- `task/001-nextjs-setup`
- `task/006-prisma-schema`
- `task/019-dashboard`

## Commit Message Guidelines

### Good Examples
```
[TASK-001] Add Next.js 14 configuration

- Initialize project with App Router
- Configure TypeScript with strict mode
- Set up Tailwind CSS
```

```
[TASK-006] Define Prisma schema for loans and payments

Implements complete database schema with:
- Loan model with flexible interest calculation types
- Payment model with loan relationship
- Enums for status, calculation type, and payment frequency
```

### Bad Examples
```
update stuff
```

```
fix bug
```

```
WIP
```

## Task Status Definitions

- **NOT_STARTED** - Task defined, ready to begin
- **IN_PROGRESS** - Actively being worked on
- **IN_REVIEW** - PR created, awaiting review
- **BLOCKED** - Cannot proceed (dependency or issue)
- **COMPLETED** - Merged to main

## Progress Tracking

### Update Master Task List
After each task completion, update:
1. Task status in `MASTER_TASK_LIST.md`
2. Task status in individual task file
3. Phase completion percentage
4. Overall completion percentage

### Daily Standup (if applicable)
- What task am I working on?
- What's blocking me?
- When do I expect to complete?

## Best Practices

### Do
- ✅ Read entire task file before starting
- ✅ Discuss tradeoffs before implementing
- ✅ Commit frequently with clear messages
- ✅ Test thoroughly before PR
- ✅ Keep PRs focused on single task
- ✅ Update documentation as you go

### Don't
- ❌ Skip pre-implementation discussion
- ❌ Work on multiple tasks in one branch
- ❌ Make unrelated changes in task branch
- ❌ Merge without review
- ❌ Leave tasks partially complete
- ❌ Forget to update task status

## Emergency Procedures

### Blocking Issue Found
1. Update task status to BLOCKED
2. Document blocking issue in task file
3. Create GitHub issue if needed
4. Work on different task or resolve blocker

### Need to Change Approach Mid-Task
1. Pause implementation
2. Discuss with team/reviewer
3. Update task file with new approach
4. Document reason for change
5. Continue with approved approach

### Task Scope Creep
If task grows beyond estimate:
1. Complete core acceptance criteria
2. Create new task for additional scope
3. Note in PR that scope was split
4. Don't gold-plate or over-engineer

## Questions?

If unclear about any task:
1. Check task file for details
2. Review related tasks for context
3. Check PRD for requirements
4. Ask before implementing

**Remember:** Quality over speed. It's better to discuss and get it right than to rush and refactor later.

# Workspace Guidelines

## Baseline Preservation Rule
Treat the entire current state of the project—including every feature, workflow, UI, backend logic, validations, security implementation, database changes, API modifications, and every change that the user has previously reviewed, accepted, and approved—as the permanent baseline of this project.

1. **Do not revert, overwrite, replace, remove, or regenerate** any previously approved implementation unless explicitly instructed to do so by the user.
2. Before implementing any new feature or modification, **first preserve all existing approved functionality** and ensure the new implementation is fully compatible with the current project without breaking or resetting any previously accepted work.
3. **Do not recreate** old UI designs, old workflows, old business logic, old database schemas, deprecated components, or previously rejected implementations.
4. If a new implementation conflicts with an existing approved feature, **ask for clarification** instead of making assumptions or reverting changes.
5. **The latest approved implementation must always be treated as the single source of truth** for the entire project, including all past and future approved changes. Never repeat previously fixed issues or restore features that have already been modified or removed.

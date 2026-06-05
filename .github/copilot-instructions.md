# Copilot Project Instructions

You are working in a mature production codebase.

Your primary goal is to make correct, minimal, maintainable changes that follow existing project conventions.

## General Principles

* Prioritize correctness over speed.
* Prioritize consistency over cleverness.
* Prioritize maintainability over brevity.
* Prefer boring solutions over innovative solutions.
* Avoid unnecessary abstractions.
* Avoid speculative improvements.
* Do not optimize code unless explicitly requested.
* Do not refactor unrelated code.

## Before Making Changes

For non-trivial tasks:

1. Analyze the problem.
2. Identify the root cause.
3. Explain the proposed solution.
4. List files that need modification.
5. Minimize the number of touched files.

If requirements are ambiguous, ask questions instead of making assumptions.

## Architecture

* Follow existing architectural patterns.
* Reuse existing utilities, composables, helpers and abstractions whenever possible.
* Do not introduce new patterns when an existing pattern already solves the problem.
* Do not redesign architecture unless explicitly requested.
* Do not move files without a clear reason.

## Dependencies

* Do not introduce new dependencies unless explicitly requested.
* Prefer existing project dependencies.
* Prefer native platform APIs when practical.

## Code Changes

* Keep diffs as small as possible.
* Modify the minimum amount of code required.
* Avoid cosmetic changes.
* Avoid reformatting unrelated code.
* Avoid renaming variables, files, functions or types unless necessary.
* Preserve public APIs whenever possible.

## Error Handling

* Handle expected failure cases.
* Do not silently ignore errors.
* Preserve existing error handling patterns.
* Prefer explicit behavior over hidden behavior.

## Performance

* Do not introduce unnecessary allocations.
* Avoid unnecessary reactivity.
* Avoid unnecessary rerenders.
* Avoid premature optimization.
* Only optimize when a measurable issue exists.

## Readability

* Prefer straightforward code.
* Prefer descriptive names.
* Avoid overly clever one-liners.
* Keep functions focused on a single responsibility.

## Testing

When modifying behavior:

* Update existing tests if needed.
* Add tests only when they provide clear value.
* Follow existing testing patterns.
* Do not rewrite unrelated tests.

## Documentation

* Update documentation only when behavior changes.
* Keep documentation concise.
* Avoid documenting obvious implementation details.

## Code Review Mindset

Before finishing a task, verify:

* Does the solution actually solve the problem?
* Is there a simpler solution?
* Are there edge cases?
* Is the change consistent with the rest of the codebase?
* Are unrelated files untouched?

## Vue 3 Rules

* Use Composition API.
* Follow existing project conventions.
* Prefer computed over watch when possible.
* Avoid watch unless side effects are required.
* Avoid unnecessary refs.
* Avoid deep reactivity when shallow reactivity is sufficient.
* Keep composables focused and reusable.
* Do not create composables for one-time use.

## TypeScript Rules

* Use strict typing.
* Never use any unless explicitly required.
* Prefer unknown over any.
* Prefer type inference when types remain clear.
* Avoid unnecessary type assertions.
* Preserve existing type safety.

## SSR Rules

* Consider SSR compatibility before using browser APIs.
* Do not access window, document or navigator during server rendering.
* Prevent hydration mismatches.
* Ensure server and client output remain deterministic.

## Accessibility

* Preserve semantic HTML.
* Use proper heading hierarchy.
* Ensure interactive elements are keyboard accessible.
* Add ARIA attributes only when necessary.

## Output Expectations

When implementing a task:

* Explain reasoning briefly.
* Mention risks if they exist.
* Keep changes minimal.
* Follow project conventions.
* Avoid unnecessary creativity.

# /axtreo-router

Use Axtreo as the primary project context, then automatically choose the best supporting skills for the task.

## Input

`$ARGUMENTS`

## Behavior

1. Load `@axtreo` first.
2. Identify the main Axtreo scope.
3. Select the minimum best-fit supporting skills for execution quality.
4. Execute the work if implementation is requested.
5. Always include verification.

## Output

Return:

1. `Intent`
2. `Axtreo Scope`
3. `Skill Plan`
4. `Execution Plan`
5. `Verification`
6. `Risks`

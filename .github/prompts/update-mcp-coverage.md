# Update MCP coverage for the Node SDK

You are working in the `kernel/kernel-mcp-server` checkout. Read its AGENTS.md first.
The published SDK source is in `../sdk`; the workflow has already pinned
`@onkernel/sdk` in package.json and bun.lock to the `SDK_VERSION` environment variable.
Do not downgrade or change that version.

## Audit and implement

1. Read `$RUNNER_TEMP/sdk-diff.patch`, `../sdk/api.md`, and the parameter types in
   `../sdk/src/resources`. Enumerate SDK methods and their parameters, including
   nested options, new enum values, pagination, streaming, and changed signatures.
2. Read `src/lib/mcp/register.ts`, `src/lib/mcp/tools/`, and shared MCP schemas.
   Map SDK methods/parameters to registered MCP tools, actions, and input fields.
   Check the entire SDK surface, not just the release diff, for missing coverage.
3. Implement missing user-facing capabilities using existing grouped tools and
   action dispatch patterns. Add new toolsets to the registration when necessary.
   Update input schemas, descriptions, request construction, response handling,
   pagination, and tests together. Each addition in the SDK diff must be covered
   or explicitly listed as intentionally excluded with a concrete reason.
4. Preserve existing authentication, project selection, entitlement checks,
   client-capability gates, secret handling, and error/response conventions.
   Internal hosted-login callbacks and transport-specific APIs are not automatically
   appropriate MCP tools. Do not expose secrets or internal endpoints just to claim
   complete coverage. Preserve deliberate exclusions and document them.
5. Add mocked tests for new actions, fields, and changed behavior, following nearby
   tests. Verify input schemas and forwarded SDK arguments, including false/zero
   values. Do not make production API calls or create real resources.

## Validate and report

Use Bun 1.3.3 for all MCP dependency and test commands. Run:

- `bun run check:managed-auth-app`
- `bunx tsc --noEmit --incremental false`
- `bun test`

Redis is available on localhost:6379, matching MCP CI. Do not disable tests or weaken
checks to make this update pass. Fix failures caused by your changes. Do not edit
unrelated code, workflows, generated App bundles, or authentication configuration.

Read the complete diff against origin/main before finishing. Remove unnecessary
comments, type casts, defensive wrappers, and unrelated changes.

Write `$RUNNER_TEMP/mcp-coverage-report.md` with concise sections describing:

- Added or updated MCP tools, actions, and fields, with their SDK counterparts.
- Intentional exclusions and reasons.
- Any validation limitations.

If no gaps exist, explicitly say that the complete SDK method/parameter audit found
no missing user-facing coverage. Never claim tests passed unless you ran them.
The report becomes part of a public PR: include no credentials, customer information,
private discussions, or internal URLs.

Do not commit, push, open or merge a PR. The workflow validates the changes and
opens or updates the evergreen PR only after all checks pass.

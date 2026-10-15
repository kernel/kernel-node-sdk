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

## Sync descriptions with the API spec

The Kernel API spec is at `$RUNNER_TEMP/kernel-api/packages/api/openapi.yaml`, and
`$RUNNER_TEMP/openapi-diff.patch` shows spec changes between the previous SDK release
and this one. The SDK is generated from this spec, so its endpoint, parameter, and
schema descriptions are the source of truth for what the API does.

1. For every changed `summary` or `description` in the spec diff that belongs to an
   endpoint, parameter, or field the MCP server exposes, update the matching tool
   description, action description, or input `.describe()` text. Use the spec text
   for anything you add in this run too.
2. Adapt the text; do not copy it verbatim. API descriptions are written for HTTP
   callers and often reference other endpoints, HTTP methods, status codes,
   headers, or JSON body paths that mean nothing to an MCP client. Rewrite those
   references in MCP terms: name the tool and action that does the equivalent and
   use the tool's parameter names. For example, "List connections with
   `GET /auth/connections`" becomes "list connections with manage_auth_connections
   action `list`". Drop API details that do not apply to the tool, and follow the
   existing description style (lowercase, concise, action prefixes like
   "(create)").
3. Preserve meaning exactly: limits, defaults, units, accepted values, deprecations,
   and caveats must match the spec. Do not invent behavior the spec does not state.
4. Change only text whose meaning the spec change affects, or existing text the
   spec now shows to be wrong. Do not restyle unrelated descriptions.

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
- Descriptions updated to match spec changes, with the spec operation or field each
  one follows.
- Intentional exclusions and reasons.
- Any validation limitations.

If no gaps exist, explicitly say that the complete SDK method/parameter audit found
no missing user-facing coverage. Never claim tests passed unless you ran them.
The report becomes part of a public PR: include no credentials, customer information,
private discussions, or internal URLs.

Do not commit, push, open or merge a PR. The workflow validates the changes and
opens or updates the evergreen PR only after all checks pass.

# Update docs for the Node SDK

You are working in the `kernel/docs` checkout, on a branch that may already hold
docs updates from earlier SDK releases. Read its AGENTS.md and
`.docs/code-example-guide.md` first and follow them for every change.

## Default to no change

Most SDK releases need no docs change. People write feature docs, usually within a
day of a release, and the API reference is generated from the published spec, so new
endpoints, parameters, response fields, and enum values already appear there. Be
skeptical: change the docs only when existing guide text or a code example is now
wrong or misleading for someone using this release. Finishing with no changes is
the expected outcome for most runs.

Change docs for:

- Code examples that call a renamed, removed, or re-signatured method or parameter.
- Prose that states a limit, default, accepted value, or behavior the release changed.
- Guidance that recommends something the release deprecates or removes.
- A short addition to an existing section, only when leaving the new option out would
  mislead a reader of that section, such as a list of accepted values that is
  presented as complete.

Do not:

- Create new pages or new top-level sections. List undocumented capabilities in the
  report as missing coverage instead.
- Document something already covered by a recent docs commit or an open docs PR.
- Restate the generated API reference in guides.
- Restyle, reorganize, or reword content the release does not affect.

## Inputs

- `$RUNNER_TEMP/sdk-diff.patch`: Node SDK changes for this release (`CHANGELOG.md`,
  `api.md`, `src/client.ts`, `src/lib`, `src/resources`). The audit covers this diff.
- `../sdk`: the published Node SDK for the `SDK_VERSION` environment variable.
- `../python-sdk` and `../go-sdk`: the Python and Go SDKs, at the matching release tag
  when one exists, otherwise their default branch.
- `$RUNNER_TEMP/kernel-api/packages/api/openapi.yaml` and `$RUNNER_TEMP/openapi-diff.patch`:
  the Kernel API spec and its changes over the same window.
- `$RUNNER_TEMP/recent-docs-commits.txt`: docs commits on main since the previous
  release, with the files they touched.
- `$RUNNER_TEMP/open-docs-prs.txt`: open docs PRs and the files they touch.
- `$RUNNER_TEMP/previous-report.md`, if present: the report for changes already on
  this branch from earlier releases.

The spec can be ahead of the released SDK. The SDK defines what exists in this
release: never document an operation, parameter, or field the checked-out SDKs do not
have. Use the spec only for the meaning of things the SDK has: limits, defaults,
units, accepted values, and caveats. Do not document operations marked `x-hidden` or
`x-stainless-skip` in the spec, even if an SDK exposes them.

## Audit

1. Enumerate the user-facing changes in the SDK diff: removed or renamed methods and
   parameters, changed signatures, changed defaults or limits, deprecations, and new
   capabilities. Skip codegen churn, dependency updates, type-only refactors, and
   internal or hosted-login callback endpoints.
2. For each change, search the `.mdx` files for the method names, parameter names, and
   related concepts, and decide whether any existing text is now wrong or misleading.
3. Check the recent commits and open PRs before editing a page they cover.

## Update

1. Fix only what the audit found. Follow the style of the surrounding page.
2. Every code example you touch must call methods and parameters that exist in the
   checked-out SDKs. Verify TypeScript against `../sdk/api.md` and `../sdk/src`, Python
   against `../python-sdk/api.md` and `../python-sdk/src/kernel/{resources,types}`, and
   Go against `../go-sdk/api.md` and the Go sources. Keep every language the example
   already shows. If a language's SDK does not have the method yet, leave the existing
   example in that language unchanged and say so in the report.
3. Preserve meaning exactly. Do not invent behavior the spec does not state. Plan or
   pricing availability is out of scope.

The CLI and MCP server reference (`reference/cli*`, `reference/mcp-server*`) and
`changelog.mdx` are maintained separately; do not edit them.

## Validate and report

If you changed anything, run `mint broken-links` from the docs checkout and fix any
broken links your changes introduce, and run `jq empty docs.json` if you edited it.
Do not run `mint dev`.

Read the complete diff against origin/main before finishing. It includes changes from
earlier releases still on this branch. Remove filler, unrelated changes, and anything
that does not follow AGENTS.md.

Write `$RUNNER_TEMP/docs-update-report.md`. It replaces the PR description, so it
must describe every change in the diff against origin/main, not only this run's.
Carry forward entries from `$RUNNER_TEMP/previous-report.md` that still match the
diff. Use concise sections:

- Pages changed, with the SDK release and the method, parameter, or spec change each
  change follows.
- Missing coverage: new capabilities with no guide coverage, for a person to decide on.
- Languages left unchanged because an SDK lacks the method.
- Any validation limitations.

If this release needed no docs change, say so in one line and list any missing
coverage. Never claim checks passed unless you ran them. The report becomes part of a
public PR: include no credentials, customer information, private discussions, or
internal URLs.

Do not commit, push, open or merge a PR. The workflow validates the changes and
opens or updates the evergreen PR only after all checks pass.

Only `docs.json` and `.mdx` files are published, excluding hidden paths,
`changelog.mdx`, and the CLI and MCP server reference; the workflow discards every
other change before validation. Do not add images. Keep scratch files, logs, and
command output outside the checkout, under `$RUNNER_TEMP`.

# Update docs for the Node SDK

You are working in the `kernel/docs` checkout. Read its AGENTS.md and
`.docs/code-example-guide.md` first and follow them for every change.
The published Node SDK source for the `SDK_VERSION` environment variable is in `../sdk`.
The Python and Go SDKs generated from the same API spec are in `../python-sdk` and
`../go-sdk`, checked out at the matching release tag when one exists.

## Audit

1. Read `$RUNNER_TEMP/sdk-diff.patch`. It covers `CHANGELOG.md`, `api.md`, and
   `src/resources` in the Node SDK since the last release the docs were updated for.
   Enumerate user-facing changes: new resources and methods, new or changed
   parameters and response fields, new enum values, deprecations, and removals.
2. Read `$RUNNER_TEMP/openapi-diff.patch` and the matching parts of
   `$RUNNER_TEMP/kernel-api/packages/api/openapi.yaml`. The SDKs are generated from
   this spec, so its summaries and descriptions are the source of truth for what the
   API does: limits, defaults, units, accepted values, and caveats.
3. Find every docs page that covers the affected features. Search the `.mdx` files for
   the SDK method names, parameter names, and related concepts. Check `docs.json` for
   navigation.

## Update

1. Update existing pages whose content the release makes wrong or incomplete: changed
   signatures, renamed or removed parameters, new options on a documented feature,
   new enum values in documented lists, and deprecations.
2. Document new user-facing capabilities. Prefer adding a section to the page that
   already covers the feature. Create a new page only for a capability no existing page
   covers, and add it to `docs.json` navigation next to related pages.
3. Every code example must call methods and parameters that exist in the checked-out
   SDKs. Verify TypeScript against `../sdk/api.md` and `../sdk/src/resources`, Python
   against `../python-sdk/api.md` and `../python-sdk/src/kernel/{resources,types}`, and Go
   against `../go-sdk/api.md` and the Go sources. Include TypeScript and Python
   versions, and a Go version wherever the surrounding page already shows Go. If a
   language's SDK does not have the method yet, leave that language out rather than
   guessing.
4. Preserve meaning exactly: limits, defaults, units, accepted values, deprecations,
   and caveats must match the spec. Do not invent behavior the spec does not state.
   Plan or pricing availability that the spec does not state is out of scope.
5. Follow the style of the surrounding page. Change only text the release affects or
   that the release shows to be wrong. Do not restyle, reorganize, or reword unrelated
   content.

Skip changes with no user-facing effect: internal or hosted-login callback endpoints,
SDK codegen and dependency churn, and type-only refactors. Not every release needs a
docs change. If none does, change nothing.

The API reference pages are generated from the published spec, so do not hand-write
endpoint reference pages. The CLI and MCP server reference (`reference/cli*`,
`reference/mcp-server*`) and `changelog.mdx` are maintained separately; do not edit them.

## Validate and report

Run `mint broken-links` from the docs checkout and fix any broken links your changes
introduce. Run `jq empty docs.json` if you edited `docs.json`. Do not run `mint dev`.

Read the complete diff against origin/main before finishing. Remove filler, unrelated
changes, and anything that does not follow AGENTS.md.

Write `$RUNNER_TEMP/docs-update-report.md` with concise sections describing:

- Pages updated or added, with the SDK methods, parameters, or spec changes each
  change follows.
- SDK changes intentionally left undocumented and why.
- Any languages left out of examples because an SDK lacks the method.
- Any validation limitations.

If no docs changes are needed, explicitly say that the audit of the SDK diff found
nothing user-facing to document. Never claim checks passed unless you ran them.
The report becomes part of a public PR: include no credentials, customer information,
private discussions, or internal URLs.

Do not commit, push, open or merge a PR. The workflow validates the changes and
opens or updates the evergreen PR only after all checks pass.

Only `docs.json` and `.mdx` files are published, excluding hidden directories,
`changelog.mdx`, and the CLI and MCP server reference; the workflow discards every
other change before validation. Do not add images. Keep scratch files, logs, and
command output outside the checkout, under `$RUNNER_TEMP`.

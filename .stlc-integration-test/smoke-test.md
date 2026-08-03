# stlc plumbing smoke test — SIMULATED OUTPUT

Written by the `integration-test` job of `.github/workflows/stlc-generate.yml`
in kernel/kernel. The stlc generator was not installed or run — this
marker file is the entire diff, and it says nothing about generator
output or parity with hosted Stainless.

What it proves: the workflow can mint a GitHub App token for this repo,
push a branch to it, open/update a draft PR, and clean up afterwards.

Source: kernel/kernel PR #3095
Run: https://github.com/kernel/kernel/actions/runs/30825504791
Branch: stlc/integration-test/pr-3095

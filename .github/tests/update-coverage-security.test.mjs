import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = readFileSync(new URL('../workflows/update-mcp-coverage.yml', import.meta.url), 'utf8');
const jobs = Object.fromEntries(
  workflow
    .slice(workflow.indexOf('\njobs:\n'))
    .split(/^  (?=[\w-]+:\n)/m)
    .slice(1)
    .map((job) => [job.slice(0, job.indexOf(':')), job.split(/(?=^      - )/m).slice(1)]),
);
const steps = Object.values(jobs).flat();
const step = (job, name) => {
  const value = jobs[job].find((entry) => entry.startsWith(`      - name: ${name}\n`));
  assert.ok(value, `missing ${job} step: ${name}`);
  return value;
};
const disallowedPaths = (paths) =>
  spawnSync('bash', [new URL('../scripts/mcp-update-disallowed-paths.sh', import.meta.url).pathname], {
    input: paths.map((path) => `${path}\0`).join(''),
    encoding: 'utf8',
  })
    .stdout.split('\0')
    .filter(Boolean);

test('actions are pinned and checkouts do not persist credentials', () => {
  for (const entry of steps.filter((entry) => entry.includes('uses: '))) {
    assert.match(entry, /uses: [\w/-]+@[a-f0-9]{40}(?:\s|$)/);
    if (entry.includes('uses: actions/checkout@')) {
      assert.match(entry, /persist-credentials: false/);
      assert.doesNotMatch(entry, /token:/);
    }
  }
});

test('API source access is read-only and revoked before generation', () => {
  const readToken = step('generate', 'Generate API read token');
  assert.match(readToken, /repositories: kernel\n/);
  assert.match(readToken, /permission-contents: read/);
  assert.doesNotMatch(readToken, /permission-[\w-]+: write/);
  const fetch = step('generate', 'Fetch API spec');
  assert.match(fetch, /GH_TOKEN: \$\{\{ steps\.api-read-token\.outputs\.token \}\}/);
  assert.match(fetch, /gh api --method DELETE \/installation\/token\s*$/);
  assert.match(fetch, /-f until="\$1"/);
  assert.doesNotMatch(fetch, /gh repo clone/);
  assert.ok(
    jobs.generate.indexOf(fetch) <
      jobs.generate.indexOf(step('generate', 'Update SDK dependency and MCP coverage')),
  );
});

test('changes are restricted to the allowlist before validation', () => {
  const snapshot = step('generate', 'Snapshot publishable changes');
  const verify = step('generate', 'Verify MCP changes');
  assert.ok(
    jobs.generate.indexOf(step('generate', 'Update SDK dependency and MCP coverage')) <
      jobs.generate.indexOf(snapshot),
  );
  assert.ok(jobs.generate.indexOf(snapshot) < jobs.generate.indexOf(verify));
  assert.match(snapshot, /mcp-update-disallowed-paths\.sh/);
  assert.match(snapshot, /git reset -q --hard\n\s+git clean -fdq/);
  assert.match(snapshot, /MAIN_SHA: \$\{\{ steps\.prepare\.outputs\.main_sha \}\}/);
  assert.match(snapshot, /git reset -q --soft "\$MAIN_SHA"\n\s+git add -A/);
  const prepare = step('generate', 'Prepare update branch and SDK diff');
  assert.match(prepare, /main_sha=\$\(git rev-parse origin\/main\)/);
  // Only a branch without human commits may be regenerated from main.
  assert.match(
    prepare,
    /git rebase --abort\n[\s\S]*grep -qvxF '260533166\+kernel-internal\[bot\]@users\.noreply\.github\.com'[\s\S]*exit 1\n[\s\S]*git switch -C /,
  );
  const scriptCalls = workflow.match(/^.*disallowed-paths\.sh.*$/gm);
  assert.equal(scriptCalls.length, 2);
  for (const line of scriptCalls) assert.match(line, /\| bash /);
  assert.match(verify, /has\("@onkernel\/sdk"\)/);
  assert.deepEqual(
    disallowedPaths([
      'package.json',
      'bun.lock',
      'src/lib/mcp/tools/browsers.ts',
      'src/app/layout.tsx',
      'src/lib/mcp/apps/generated/managed-auth-app.ts',
      'response.json',
      'src/lib/mcp/tools/output.json',
      '.github/workflows/ci.yml',
      'node_modules/x/index.ts',
    ]),
    [
      'src/lib/mcp/apps/generated/managed-auth-app.ts',
      'response.json',
      'src/lib/mcp/tools/output.json',
      '.github/workflows/ci.yml',
      'node_modules/x/index.ts',
    ],
  );
});

test('publishing runs in a separate job that never executes repository code', () => {
  assert.doesNotMatch(jobs.generate.join(''), /permission-[\w-]+: write/);
  assert.match(step('publish', 'Generate MCP repository token'), /repositories: kernel-mcp-server\n/);
  assert.match(step('publish', 'Generate MCP repository token'), /permission-contents: write/);
  const publishRuns = jobs.publish.filter((entry) => entry.includes('run: |')).join('');
  assert.doesNotMatch(publishRuns, /^\s*(bun|bunx|npm|npx|node|pi|make)\b/m);
  assert.doesNotMatch(jobs.publish.join(''), /secrets\.(ANTHROPIC|OPENAI)_API_KEY/);
  const apply = step('publish', 'Apply validated changes');
  assert.match(apply, /git apply --index "\$RUNNER_TEMP\/mcp-coverage-update\/changes\.patch"/);
  assert.match(apply, /mcp-update-disallowed-paths\.sh/);
  assert.match(apply, /100644\|100755\|000000/);
  const mint = jobs.publish.indexOf(step('publish', 'Generate MCP repository token'));
  assert.ok(jobs.publish.indexOf(apply) < mint);
  assert.doesNotMatch(jobs.publish.slice(0, mint).join(''), /GH_TOKEN:/);
  const publish = step('publish', 'Open or update MCP coverage PR');
  assert.match(publish, /GH_TOKEN: \$\{\{ steps\.app-token\.outputs\.token \}\}/);
  assert.match(publish, /gh auth setup-git\n\s+git push --force-with-lease="\$UPDATE_BRANCH:\$UPDATE_SHA"/);
  for (const entry of jobs.publish) {
    assert.doesNotMatch(entry, /continue-on-error: true|always\(\)/);
  }
});

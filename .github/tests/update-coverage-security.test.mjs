import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const load = (file) => {
  const text = readFileSync(new URL(`../workflows/${file}`, import.meta.url), 'utf8');
  const blocks = text
    .slice(text.indexOf('\njobs:\n'))
    .split(/^  (?=[\w-]+:\n)/m)
    .slice(1);
  const jobText = Object.fromEntries(blocks.map((job) => [job.slice(0, job.indexOf(':')), job]));
  const jobs = Object.fromEntries(
    Object.entries(jobText).map(([name, job]) => [name, job.split(/(?=^      - )/m).slice(1)]),
  );
  const step = (job, name) => {
    const value = jobs[job].find((entry) => entry.startsWith(`      - name: ${name}\n`));
    assert.ok(value, `missing ${job} step: ${name}`);
    return value;
  };
  return { text, jobText, jobs, steps: Object.values(jobs).flat(), step };
};

const updaters = [
  {
    file: 'update-mcp-coverage.yml',
    agentStep: 'Update SDK dependency and MCP coverage',
    context: 'mcp-coverage-context',
  },
  { file: 'update-docs.yml', agentStep: 'Update docs', context: 'sdk-docs-context' },
];

const mcp = load('update-mcp-coverage.yml');
const { text: workflow, jobs, step } = mcp;

const disallowedPaths = (paths) =>
  spawnSync('bash', [new URL('../scripts/mcp-update-disallowed-paths.sh', import.meta.url).pathname], {
    input: paths.map((path) => `${path}\0`).join(''),
    encoding: 'utf8',
  })
    .stdout.split('\0')
    .filter(Boolean);

const runScript = (entry) => {
  const lines = entry.split('\n');
  const start = lines.findIndex((line) => line === '        run: |');
  return lines
    .slice(start + 1)
    .map((line) => line.slice(10))
    .join('\n');
};

for (const { file, agentStep, context } of updaters) {
  const { jobText, jobs, steps, step } = load(file);

  test(`${file}: actions are pinned and checkouts do not persist credentials`, () => {
    for (const entry of steps.filter((entry) => entry.includes('uses: '))) {
      assert.match(entry, /uses: [\w/-]+@[a-f0-9]{40}(?:\s|$)/);
      if (entry.includes('uses: actions/checkout@')) {
        assert.match(entry, /persist-credentials: false/);
        assert.doesNotMatch(entry, /token:/);
      }
    }
  });

  test(`${file}: the job that runs Pi references only the model API keys`, () => {
    // A job's secrets stay in runner memory for the whole job, where an agent with
    // sudo can read them, so revoking a minted token before Pi starts is not enough.
    const agentJobs = Object.keys(jobs).filter((name) =>
      jobs[name].some((entry) => entry.includes('pi --print')),
    );
    assert.deepEqual(agentJobs, ['generate']);
    const secrets = [...jobText.generate.matchAll(/\bsecrets\b(?:\.(\w+))?/g)].map((match) => match[1]);
    assert.deepEqual([...new Set(secrets)].sort(), ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY']);
    assert.doesNotMatch(jobText.generate, /GH_TOKEN|github\.token|create-github-app-token|outputs\.token/);
    assert.match(step('generate', agentStep), /pi --print --no-session --approve/);
  });

  test(`${file}: GitHub reads happen in an earlier job that hands over only data`, () => {
    const readToken = step('context', 'Generate API read token');
    assert.match(readToken, /repositories: kernel\n/);
    assert.match(readToken, /permission-contents: read/);
    assert.doesNotMatch(readToken, /permission-[\w-]+: write/);
    const fetch = step('context', 'Fetch API spec');
    assert.match(fetch, /GH_TOKEN: \$\{\{ steps\.api-read-token\.outputs\.token \}\}/);
    assert.match(fetch, /gh api --method DELETE \/installation\/token\s*$/);
    assert.match(fetch, /-f until="\$1"/);
    assert.doesNotMatch(fetch, /gh repo clone/);
    assert.doesNotMatch(jobText.context, /pi --print|secrets\.(ANTHROPIC|OPENAI)_API_KEY/);
    assert.match(step('context', 'Upload update context'), new RegExp(`name: ${context}\\n`));
    assert.match(step('context', 'Upload update context'), /retention-days: 1/);
    assert.match(step('generate', 'Download update context'), new RegExp(`name: ${context}\\n`));
    assert.match(
      jobText.generate,
      /needs: \[sdk-version, context\]\n\s+if: needs\.context\.outputs\.update == 'true'/,
    );
    for (const output of ['main_sha', 'update_sha', 'rebased', 'agent_base_tree']) {
      assert.match(
        jobText.generate,
        new RegExp(`${output}: \\$\\{\\{ needs\\.context\\.outputs\\.${output} \\}\\}`),
      );
    }
    const rebuild = step('generate', 'Rebuild update branch');
    assert.ok(jobs.generate.indexOf(rebuild) < jobs.generate.indexOf(step('generate', agentStep)));
    assert.match(
      step('generate', 'Snapshot publishable changes'),
      /AGENT_BASE: \$\{\{ steps\.prepare\.outputs\.agent_base \}\}/,
    );
  });

  test(`${file}: generate rebuilds exactly the branch the context job prepared`, () => {
    const script = runScript(step('generate', 'Rebuild update branch'));
    const dir = mkdtempSync(join(tmpdir(), 'rebuild-'));
    try {
      const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim();
      const commit = (file, content, message) => {
        writeFileSync(join(dir, file), content);
        git('add', file);
        git('-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-qm', message);
        return git('rev-parse', 'HEAD');
      };
      git('init', '-q', '-b', 'main');
      const base = commit('a.mdx', 'a\n', 'base');
      git('switch', '-qc', 'update');
      const update = commit('b.mdx', 'b\n', 'bot update');
      git('switch', '-q', 'main');
      const main = commit('c.mdx', 'c\n', 'main moved');
      git('switch', '-q', '--detach', base);
      // What the context job's prepare step leaves behind: the update branch rebased onto main.
      git('switch', '-qc', 'expected', update);
      git('-c', 'user.name=t', '-c', 'user.email=t@example.com', 'rebase', '-q', main);
      const rebasedTree = git('rev-parse', 'HEAD^{tree}');

      const run = (env) => {
        git('switch', '-q', '--detach', base);
        spawnSync('git', ['branch', '-q', '-D', 'rebuilt'], { cwd: dir });
        const output = join(dir, '.git', 'output');
        writeFileSync(output, '');
        const result = spawnSync('bash', ['-e', '-c', script], {
          cwd: dir,
          encoding: 'utf8',
          env: { ...process.env, UPDATE_BRANCH: 'rebuilt', GITHUB_OUTPUT: output, ...env },
        });
        return { ...result, output: readFileSync(output, 'utf8') };
      };

      const rebased = run({
        REBASED: 'true',
        UPDATE_SHA: update,
        MAIN_SHA: main,
        AGENT_BASE_TREE: rebasedTree,
      });
      assert.equal(rebased.status, 0, rebased.stderr);
      assert.equal(git('rev-parse', 'HEAD^{tree}'), rebasedTree);
      assert.equal(rebased.output, `agent_base=${git('rev-parse', 'HEAD')}\n`);

      const fromMain = run({
        REBASED: '',
        UPDATE_SHA: update,
        MAIN_SHA: main,
        AGENT_BASE_TREE: git('rev-parse', `${main}^{tree}`),
      });
      assert.equal(fromMain.status, 0, fromMain.stderr);
      assert.equal(git('rev-parse', 'HEAD'), main);

      const moved = run({
        REBASED: 'true',
        UPDATE_SHA: update,
        MAIN_SHA: base,
        AGENT_BASE_TREE: rebasedTree,
      });
      assert.notEqual(moved.status, 0);
      assert.match(moved.stdout, /differs from the one the context job prepared/);
      assert.equal(moved.output, '');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}

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
  assert.match(snapshot, /git reset -q --soft "\$AGENT_BASE"\n\s+git add -A/);
  const prepare = step('context', 'Prepare update branch and SDK diff');
  assert.match(prepare, /main_sha=\$\(git rev-parse origin\/main\)/);
  assert.match(prepare, /git rebase origin\/main; then[\s\S]*else\n\s+echo "rebased=true"/);
  assert.match(prepare, /agent_base=\$\(git rev-parse HEAD\)[\s\S]*agent_base_tree=/);
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
  // Publishing rebuilds the exact head the changes were validated on, so human
  // commits on the update branch are never squashed or dropped.
  assert.match(
    apply,
    /if \[\[ "\$REBASED" == true \]\]; then\n\s+git switch -c \S+ "\$UPDATE_SHA"\n\s+git rebase -q "\$MAIN_SHA"/,
  );
  assert.match(apply, /"\$\(git rev-parse 'HEAD\^\{tree\}'\)" != "\$AGENT_BASE_TREE"[\s\S]*exit 1/);
  assert.ok(apply.indexOf('AGENT_BASE_TREE') < apply.indexOf('git apply --index'));
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

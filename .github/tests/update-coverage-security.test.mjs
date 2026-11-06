import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
    prompt: 'update-mcp-coverage.md',
  },
  {
    file: 'update-docs.yml',
    agentStep: 'Update docs',
    context: 'sdk-docs-context',
    prompt: 'update-docs.md',
  },
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

// Evaluates the job `if:` expressions these workflows use: always(), needs results
// and outputs, string literals, ==, != and &&.
const evaluate = (expression, needs) => {
  const js = expression
    .replace(/\balways\(\)/g, 'true')
    .replace(/needs\.([\w-]+)\.result/g, (_, job) => JSON.stringify(needs[job].result))
    .replace(/needs\.([\w-]+)\.outputs\.([\w-]+)/g, (_, job, name) =>
      JSON.stringify(needs[job].outputs?.[name] ?? ''),
    )
    .replace(/'([^']*)'/g, (_, value) => JSON.stringify(value))
    .replace(/([!=])=/g, '$1==');
  assert.match(js, /^(?:\s|"[^"]*"|true|===|!==|&&)+$/, `unsupported expression: ${expression}`);
  return Function(`return (${js});`)();
};

for (const { file, agentStep, context, prompt } of updaters) {
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
    // UPDATER_CONTEXT_KEY only decrypts the context this job is meant to read.
    const secrets = [...jobText.generate.matchAll(/\bsecrets\b(?:\.(\w+))?/g)].map((match) => match[1]);
    assert.deepEqual([...new Set(secrets)].sort(), [
      'ANTHROPIC_API_KEY',
      'OPENAI_API_KEY',
      'UPDATER_CONTEXT_KEY',
    ]);
    const keyUses = jobs.generate.filter((entry) => entry.includes('secrets.UPDATER_CONTEXT_KEY'));
    assert.deepEqual(keyUses, [step('generate', 'Decrypt update context')]);
    assert.doesNotMatch(
      jobText.generate.slice(0, jobText.generate.indexOf('    steps:\n')),
      /UPDATER_CONTEXT_KEY/,
    );
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
    assert.match(fetch, /gh api --method DELETE \/installation\/token\n(?:\s*#.*\n)*\s*$/);
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

  test(`${file}: private spec content is only uploaded encrypted and deleted after the run`, () => {
    // This repository is public, so anyone signed in can download its artifacts.
    for (const entry of steps.filter((entry) => entry.includes('actions/upload-artifact@'))) {
      assert.doesNotMatch(entry, /kernel-api|openapi|stainless/);
    }
    const upload = step('context', 'Upload update context');
    assert.match(upload, /path: \$\{\{ runner\.temp \}\}\/context\.tar\.gz\.cms\n/);
    assert.match(upload, /retention-days: 1\n/);
    const encrypt = step('context', 'Encrypt update context');
    assert.ok(jobs.context.indexOf(encrypt) < jobs.context.indexOf(upload));
    assert.match(
      jobText.context,
      /context_artifact_id: \$\{\{ steps\.upload-context\.outputs\.artifact-id \}\}/,
    );
    assert.match(jobText.cleanup, /needs: \[context, generate, publish\]\n/);
    assert.match(jobText.cleanup, /permissions:\n\s+actions: write\n\s+steps:/);
    assert.match(
      step('cleanup', 'Delete update context'),
      /ARTIFACT_ID: \$\{\{ needs\.context\.outputs\.context_artifact_id \}\}\n[\s\S]*gh api --method DELETE "repos\/\$GITHUB_REPOSITORY\/actions\/artifacts\/\$ARTIFACT_ID"/,
    );
    assert.doesNotMatch(jobText.cleanup, /secrets\./);

    const dir = mkdtempSync(join(tmpdir(), 'context-'));
    try {
      const workspace = join(dir, 'workspace');
      const temp = join(dir, 'temp');
      mkdirSync(join(workspace, '.github'), { recursive: true });
      mkdirSync(join(temp, 'kernel-api/packages/api'), { recursive: true });
      const marker = 'PRIVATE-SPEC-MARKER';
      for (const name of [
        'sdk-diff.patch',
        'openapi-diff.patch',
        'recent-docs-commits.txt',
        'open-docs-prs.txt',
      ]) {
        writeFileSync(join(temp, name), `${marker} ${name}\n`);
      }
      writeFileSync(join(temp, 'kernel-api/packages/api/openapi.yaml'), `${marker} spec\n`);
      const run = (script, env) =>
        spawnSync('bash', ['-e', '-c', script], {
          cwd: dir,
          encoding: 'utf8',
          env: { ...process.env, GITHUB_WORKSPACE: workspace, RUNNER_TEMP: temp, ...env },
        });

      const missing = run(runScript(encrypt));
      assert.notEqual(missing.status, 0);
      assert.match(missing.stdout, /::error::Missing .*updater-context\.pem/);
      assert.ok(!existsSync(join(temp, 'context.tar.gz.cms')));

      execFileSync(
        'openssl',
        [
          'req',
          '-x509',
          '-newkey',
          'rsa:2048',
          '-nodes',
          '-days',
          '1',
          '-subj',
          '/CN=test',
          '-keyout',
          join(dir, 'key.pem'),
          '-out',
          join(workspace, '.github/updater-context.pem'),
        ],
        { stdio: 'ignore' },
      );
      const encrypted = run(runScript(encrypt));
      assert.equal(encrypted.status, 0, encrypted.stderr);
      const ciphertext = readFileSync(join(temp, 'context.tar.gz.cms'));
      assert.ok(!ciphertext.includes(marker));
      assert.ok(!existsSync(join(temp, 'context.tar.gz')));

      rmSync(join(temp, 'kernel-api'), { recursive: true });
      const key = readFileSync(join(dir, 'key.pem')).toString('base64');
      const decrypted = run(runScript(step('generate', 'Decrypt update context')), { CONTEXT_KEY: key });
      assert.equal(decrypted.status, 0, decrypted.stderr);
      assert.equal(
        readFileSync(join(temp, 'kernel-api/packages/api/openapi.yaml'), 'utf8'),
        `${marker} spec\n`,
      );
      assert.ok(!existsSync(join(temp, 'context.tar.gz.cms')));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test(`${file}: retries keep the context until generate succeeds and tolerate a deleted context`, () => {
    // "Re-run failed jobs" does not rerun a successful context job, so generate
    // needs the context from the first attempt. Publish never downloads it.
    assert.doesNotMatch(jobText.publish, new RegExp(context));
    const condition = jobText.cleanup.match(/^    if: (.*)$/m)[1];
    const script = runScript(step('cleanup', 'Delete update context'));
    const dir = mkdtempSync(join(tmpdir(), 'cleanup-'));
    try {
      const store = join(dir, 'artifacts');
      mkdirSync(join(dir, 'bin'));
      writeFileSync(
        join(dir, 'bin/gh'),
        `#!/usr/bin/env bash
id="\${@: -1}"
id="\${id##*/}"
if grep -qx "$id" "$STORE"; then
  grep -vx "$id" "$STORE" > "$STORE.new" || true
  mv "$STORE.new" "$STORE"
  exit 0
fi
if [[ -n "$SERVER_ERROR" ]]; then
  echo "gh: Server Error (HTTP 500)" >&2
  exit 1
fi
echo '{"message":"Not Found","status":"404"}'
echo "gh: Not Found (HTTP 404)" >&2
exit 1
`,
        { mode: 0o755 },
      );
      const stored = () => readFileSync(store, 'utf8').split('\n').includes('42');
      const attempt = (generate, publish, env = {}, artifactId = '42') => {
        const needs = {
          context: { result: 'success', outputs: { context_artifact_id: artifactId } },
          generate: { result: generate },
          publish: { result: publish },
        };
        if (!evaluate(condition, needs)) return null;
        return spawnSync('bash', ['-e', '-c', script], {
          encoding: 'utf8',
          env: {
            ...process.env,
            PATH: `${join(dir, 'bin')}:${process.env.PATH}`,
            STORE: store,
            ARTIFACT_ID: artifactId,
            GITHUB_REPOSITORY: 'kernel/example',
            ...env,
          },
        });
      };

      // Generation fails or is cancelled: the context stays for the retry, which then deletes it.
      writeFileSync(store, '42\n');
      assert.equal(attempt('failure', 'skipped'), null);
      assert.equal(attempt('cancelled', 'skipped'), null);
      assert.ok(stored());
      let run = attempt('success', 'success');
      assert.equal(run.status, 0, run.stderr);
      assert.ok(!stored());

      // Publish fails after generate used the context: it is deleted, and the retry tolerates that.
      writeFileSync(store, '42\n');
      run = attempt('success', 'failure');
      assert.equal(run.status, 0, run.stderr);
      assert.ok(!stored());
      run = attempt('success', 'success');
      assert.equal(run.status, 0, run.stderr);
      assert.match(run.stdout, /already deleted/);

      run = attempt('success', 'success', { SERVER_ERROR: '1' });
      assert.notEqual(run.status, 0);
      assert.match(run.stderr, /HTTP 500/);
      assert.equal(attempt('success', 'skipped', {}, ''), null);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test(`${file}: the agent compares against the main commit the branch was rebuilt on`, () => {
    const text = readFileSync(new URL(`../prompts/${prompt}`, import.meta.url), 'utf8');
    assert.match(
      step('generate', agentStep),
      new RegExp(`@\\.\\./\\.github/prompts/${prompt.replace('.', '\\.')}`),
    );
    assert.match(text, /diff against `\$MAIN_SHA`/);
    assert.doesNotMatch(text.replaceAll('`origin/main` may have moved since', ''), /origin\/main/);
    assert.match(jobText.generate, /\n      MAIN_SHA: \$\{\{ needs\.context\.outputs\.main_sha \}\}\n/);
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

      // origin/main can move after the context job; the agent diffs against MAIN_SHA.
      git('switch', '-q', '--detach', main);
      git('update-ref', 'refs/remotes/origin/main', commit('d.mdx', 'd\n', 'main moved again'));
      const fromMain = run({
        REBASED: '',
        UPDATE_SHA: update,
        MAIN_SHA: main,
        AGENT_BASE_TREE: git('rev-parse', `${main}^{tree}`),
      });
      assert.equal(fromMain.status, 0, fromMain.stderr);
      assert.equal(git('rev-parse', 'HEAD'), main);
      assert.equal(git('diff', '--name-only', main), '');
      assert.equal(git('diff', '--name-only', 'origin/main'), 'd.mdx');

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

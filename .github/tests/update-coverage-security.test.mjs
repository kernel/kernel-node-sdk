import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = readFileSync(new URL('../workflows/update-mcp-coverage.yml', import.meta.url), 'utf8');
const steps = workflow.split(/(?=^      - )/m).slice(1);
const step = (name) => {
  const value = steps.find((entry) => entry.startsWith(`      - name: ${name}\n`));
  assert.ok(value, `missing step: ${name}`);
  return value;
};

test('actions are pinned and checkouts do not persist credentials', () => {
  for (const entry of steps.filter((entry) => entry.includes('uses: '))) {
    assert.match(entry, /uses: [\w/-]+@[a-f0-9]{40}(?:\s|$)/);
    if (entry.includes('uses: actions/checkout@')) {
      assert.match(entry, /persist-credentials: false/);
      assert.doesNotMatch(entry, /steps\.app-token\.outputs\.token/);
    }
  }
});

test('API source access is read-only and revoked before generation', () => {
  const readToken = step('Generate API read token');
  assert.match(readToken, /repositories: kernel\n/);
  assert.match(readToken, /permission-contents: read/);
  assert.doesNotMatch(readToken, /permission-[\w-]+: write/);
  const fetch = step('Fetch API spec');
  assert.match(fetch, /GH_TOKEN: \$\{\{ steps\.api-read-token\.outputs\.token \}\}/);
  assert.match(fetch, /gh api --method DELETE \/installation\/token\s*$/);
  assert.ok(steps.indexOf(fetch) < steps.indexOf(step('Update SDK dependency and MCP coverage')));
});

test('the write token is minted only after generation and validation', () => {
  const agent = steps.indexOf(step('Update SDK dependency and MCP coverage'));
  const verify = steps.indexOf(step('Verify MCP changes'));
  const mint = steps.indexOf(step('Generate MCP repository token'));
  const publish = steps.indexOf(step('Open or update MCP coverage PR'));
  assert.ok(agent < verify && verify < mint && mint < publish);
  assert.doesNotMatch(steps.slice(0, mint).join(''), /permission-[\w-]+: write/);
  assert.doesNotMatch(steps[agent], /GH_TOKEN:|GITHUB_TOKEN:|steps\.app-token/);
  assert.match(steps[mint], /repositories: kernel-mcp-server/);
  assert.match(steps[mint], /permission-contents: write/);
  assert.match(steps[publish], /GH_TOKEN: \$\{\{ steps\.app-token\.outputs\.token \}\}/);
  assert.match(steps[publish], /gh auth setup-git\n\s+git push/);
  for (const name of [
    'Verify MCP changes',
    'Generate MCP repository token',
    'Open or update MCP coverage PR',
  ]) {
    assert.match(step(name), /if: steps\.prepare\.outputs\.update == 'true'/);
    assert.doesNotMatch(step(name), /continue-on-error: true|always\(\)/);
  }
});

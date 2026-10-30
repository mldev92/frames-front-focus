import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('снятые legacy URL имеют точные правила после статических страниц и до Bitrix', async () => {
  const rules = await readFile('deploy/production.htaccess', 'utf8');
  const reviewed = JSON.parse(await readFile('deploy/reviewed-legacy-redirects.json', 'utf8'));
  const redirects = await readFile('deploy/redirects.production.txt', 'utf8');
  assert.equal(reviewed.paths.length, 31);
  assert.equal(new Set(reviewed.paths).size, 31);
  const block = rules.slice(rules.indexOf('# BEGIN O100 REVIEWED MISSING'), rules.indexOf('# END O100 REVIEWED MISSING'));
  assert.equal(block.split('\n').filter(x => x.startsWith('RewriteRule ')).length, 31);
  for (const path of reviewed.paths) {
    assert.ok(path.startsWith('/catalog_s/'));
    const matching = block.split('\n').filter(line => {
      const match = line.match(/^RewriteRule (\S+) - \[R=404,END\]$/);
      return match && new RegExp(match[1]).test(path.slice(1));
    });
    assert.equal(matching.length, 1, path);
  }
  assert.ok(rules.indexOf('/$1/index.html [END]') < rules.indexOf('# BEGIN O100 REVIEWED MISSING'));
  assert.ok(rules.indexOf('# END O100 REVIEWED MISSING') < rules.indexOf('/local/tools/o100-product-fallback.php [END]'));
  assert.ok(!redirects.includes('oprava_fantasy_1112_prozrachnaya'));
});

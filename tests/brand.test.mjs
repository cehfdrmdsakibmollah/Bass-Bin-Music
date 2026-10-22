import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sha=(name)=>createHash('sha256').update(readFileSync(new URL(name,import.meta.url))).digest('hex');
test('Original user-provided BASS BIN MUSIC logo remains intact in primary assets',()=>{
  const expected='e08a15bf0a1332f78f62c6fc29208b0e2e56f7aee052d2b13e394e9f1ed62669';
  assert.equal(sha('../public/bass-bin-logo.png'),expected);
  assert.equal(sha('../src/app/icon.png'),expected);
  assert.equal(sha('../demo/assets/bass-bin-logo.png'),expected);
});
test('Public route source includes technical SEO entrypoints',()=>{
  for(const name of ['../src/app/sitemap.ts','../src/app/robots.ts','../src/app/manifest.ts','../src/app/layout.tsx']){
    assert.ok(readFileSync(new URL(name,import.meta.url),'utf8').length>100);
  }
});

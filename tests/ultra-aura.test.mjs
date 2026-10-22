import test from 'node:test';
import assert from 'node:assert/strict';
import {createProject} from '../src/lib/templates.ts';
import {normalizeProject} from '../src/lib/project.ts';
import {AURA_PRESETS,auraSettings,previewTemplateSettings,commitTemplateChoice} from '../src/lib/ultra-aura.ts';

test('five Ultra Aura original presets have bounded non-strobing visual settings',()=>{
  assert.equal(AURA_PRESETS.length,5);
  assert.equal(new Set(AURA_PRESETS.map(t=>t.slug)).size,5);
  for(const preset of AURA_PRESETS){
    const s=auraSettings(createProject(1).settings,preset.slug);
    assert.equal(s.mode,'aura');
    assert.ok(s.glow<=100&&s.shake<=40&&s.beatPulse<=60);
    assert.match(s.primary,/^#[0-9a-f]{6}$/i);
    assert.match(s.secondary,/^#[0-9a-f]{6}$/i);
  }
});
test('preview never modifies project or media tracks, preserving Undo semantics',()=>{
  const original=createProject(10);
  const serialized=JSON.stringify(original);
  const show=previewTemplateSettings(original,'ultra-aura-hard');
  assert.equal(show.mode,'aura');
  assert.equal(JSON.stringify(original),serialized);
  const existing=previewTemplateSettings(original,'ncs-prism');
  assert.equal(existing.mode,'ncs');
  assert.equal(JSON.stringify(original),serialized);
});
test('apply/cancel behavior is explicit and preserves all existing tracks',()=>{
  const original=createProject(20);
  const updated=commitTemplateChoice(original,'ultra-aura');
  assert.notEqual(updated,original);
  assert.equal(updated.template,'ultra-aura');
  assert.equal(updated.settings.mode,'aura');
  assert.deepEqual(updated.tracks,original.tracks);
  assert.ok(normalizeProject(updated));
  assert.equal(commitTemplateChoice(original,'not-real'),original);
  assert.equal(original.settings.mode,'phonk-skull');
});
test('legacy template apply remains backwards compatible and saveable',()=>{
  const p=createProject(31);
  const q=commitTemplateChoice(p,'brazilian-phonk');
  assert.equal(q.settings.mode,'circle');
  assert.deepEqual(q.tracks,p.tracks);
  assert.ok(normalizeProject(q));
});

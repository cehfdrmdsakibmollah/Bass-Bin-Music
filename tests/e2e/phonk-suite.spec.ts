import {test,expect} from '@playwright/test';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';

test('Music Lab crossfades two creator-owned WAV files and downloads real stereo PCM',async({page})=>{
 test.setTimeout(95_000);
 await page.goto('/studio');
 await page.getByRole('navigation',{name:'Studio panels'}).getByRole('button',{name:/music/i}).click();
 await expect(page.getByRole('heading',{name:'Phonk Music Lab'})).toBeVisible();
 const demo=path.resolve('public/demo-beat.wav');
 await page.getByLabel('Music deck A upload').setInputFiles(demo);
 await expect(page.getByText(/Track A ready/)).toBeVisible();
 await page.getByLabel('Music deck B upload').setInputFiles(demo);
 await expect(page.getByText(/Track B ready/)).toBeVisible();
 const pending=page.waitForEvent('download',{timeout:75_000});
 await page.getByRole('button',{name:/Download 16-bit stereo WAV/}).click();
 const download=await pending;
 expect(download.suggestedFilename()).toBe('BASS-BIN-Phonk-Mashup.wav');
 expect(await download.failure()).toBeNull();
 const filename=await download.path();
 expect((await stat(filename!)).size).toBeGreaterThan(4096);
 const buf=await readFile(filename!);
 expect(buf.toString('ascii',0,4)).toBe('RIFF');
 expect(buf.toString('ascii',8,12)).toBe('WAVE');
 expect(buf.readUInt16LE(22)).toBe(2);
});

test('new original Avee/NCS modes and animated Phonk transitions are available',async({page})=>{
 await page.goto('/studio');
 const nav=page.getByRole('navigation',{name:'Studio panels'});
 await nav.getByRole('button',{name:/templates/i}).click();
 await page.getByRole('group',{name:'Template categories'}).getByRole('button',{name:'NCS Inspired'}).click();
 await page.getByRole('button',{name:/NCS Inspired Prism Halo/}).click();
 await expect(page.getByText(/Previewing: NCS Inspired Prism Halo/)).toBeVisible();
 await page.getByRole('button',{name:/Apply Template/}).click();
 await nav.getByRole('button',{name:/effects/i}).click();
 await expect(page.getByLabel('Spectrum style')).toHaveValue('ncs');
 await nav.getByRole('button',{name:/fxlab/i}).click();
 await expect(page.getByRole('heading',{name:'Phonk FX & Transitions'})).toBeVisible();
 await page.getByRole('button',{name:/Velocity Whip/}).click();
 await expect(page.getByText(/Velocity Whip applied/)).toBeVisible();
 await nav.getByRole('button',{name:/discover/i}).click();
 await expect(page.getByRole('heading',{name:'Phonk Trend Finder'})).toBeVisible();
 await expect(page.getByRole('link',{name:/NCS usage policy/})).toHaveAttribute('href',/ncs.io/);
});
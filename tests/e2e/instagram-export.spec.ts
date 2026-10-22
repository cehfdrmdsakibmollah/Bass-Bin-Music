import {test,expect} from '@playwright/test';
import {stat,readFile} from 'node:fs/promises';

test('Instagram preset exports a real MP4 file, not renamed WebM',async({page})=>{
  test.setTimeout(120_000);
  await page.goto('/studio');
  const format=page.getByRole('combobox',{name:'Export video format'});
  await expect(format).toHaveValue('instagram');
  const panels=page.getByRole('navigation',{name:'Studio panels'});
  await panels.getByRole('button',{name:/assets/i}).click();
  await page.getByRole('button',{name:/Try original demo beat/i}).click();
  await expect(page.getByText('Audio attached')).toBeVisible();
  await panels.getByRole('button',{name:/inspector/i}).click();
  const duration=page.getByRole('spinbutton',{name:'Duration (seconds)'}).last();
  await duration.fill('3');
  await duration.press('Tab');
  await expect(duration).toHaveValue('3');
  const pending=page.waitForEvent('download',{timeout:100_000});
  await page.getByRole('button',{name:'Export to device'}).click();
  const download=await pending;
  expect(download.suggestedFilename()).toMatch(/^bass-bin-instagram-\d+\.mp4$/);
  expect(await download.failure()).toBeNull();
  const file=await download.path();
  expect(file).toBeTruthy();
  expect((await stat(file!)).size).toBeGreaterThan(10_000);
  const raw=await readFile(file!);
  expect(raw.toString('latin1',4,8)).toBe('ftyp');
  await expect(page.getByText(/Instagram-ready MP4 saved/)).toBeVisible();
});
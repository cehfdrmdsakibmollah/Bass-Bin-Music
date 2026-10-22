import {test,expect} from '@playwright/test';

test('montage refuses synthetic assets and makes a real 9:16 edit from two imported clips',async({page})=>{
  test.setTimeout(120_000);
  await page.goto('/studio');
  const nav=page.getByRole('navigation',{name:'Studio panels'});
  await nav.getByRole('button',{name:/templates/i}).click();
  await expect(page.getByRole('heading',{name:'Phonk Video Maker'})).toBeVisible();
  await expect(page.getByRole('region',{name:'Phonk montage builder'})).toBeVisible();
  await page.getByRole('button',{name:/Create actual beat-synced Phonk edit/}).click();
  await expect(page.getByText(/Import at least two different images or video files/)).toBeVisible();
  await page.getByRole('button',{name:/Load original demo beat/}).click();
  await expect(page.getByText(/Music attached/)).toBeVisible();
  // Two distinct image assets in this test. The editor never fetches copyrighted clips.
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==','base64');
  await page.getByLabel('Import montage footage').setInputFiles([
    {name:'drift-shot-a.png',mimeType:'image/png',buffer:png},
    {name:'drift-shot-b.png',mimeType:'image/png',buffer:png}
  ]);
  await expect(page.getByText(/2 media layers/)).toBeVisible();
  await page.getByRole('button',{name:/Night Drift Edit/}).click();
  await page.getByRole('button',{name:/Create actual beat-synced Phonk edit/}).click();
  await expect(page.getByText(/Created \d+ editable clips/)).toBeVisible();
  await expect(page.getByLabel('Video aspect ratio')).toHaveValue('9:16');
  await expect(page.locator('[data-track^="montage-"]').first()).toBeVisible();
  await expect(page.getByRole('button',{name:/Undo/})).toBeEnabled();
});

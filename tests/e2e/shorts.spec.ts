import {test,expect} from '@playwright/test';

test('preview restarts at end and loop can be enabled',async({page})=>{
  await page.goto('/studio');
  await page.getByRole('navigation',{name:'Studio panels'}).getByRole('button',{name:/inspector/i}).click();
  const duration=page.getByRole('spinbutton',{name:'Duration (seconds)'}).last();
  await duration.fill('2');await duration.press('Tab');
  await expect(duration).toHaveValue('2');
  const seek=page.getByRole('slider',{name:'Seek timeline'});
  await seek.focus();await seek.press('End');
  await expect(seek).toHaveValue('2');
  await page.getByRole('button',{name:'Play preview'}).click();
  await expect(page.getByRole('button',{name:'Pause preview'})).toBeVisible();
  await expect.poll(async()=>Number(await seek.inputValue())).toBeLessThan(1.7);
  await page.getByRole('button',{name:'Pause preview'}).click();
  await page.getByRole('checkbox',{name:'Loop preview'}).check();
  await expect(page.getByRole('checkbox',{name:'Loop preview'})).toBeChecked();
});

test('Shorts Lab suggests optional crop from uploaded demo music',async({page})=>{
  await page.goto('/studio');
  const navigation=page.getByRole('navigation',{name:'Studio panels'});
  await navigation.getByRole('button',{name:/assets/i}).click();
  await page.getByRole('button',{name:/Try original demo beat/i}).click();
  await expect(page.getByRole('heading',{name:'Shorts Lab'})).toBeVisible();
  await expect(page.getByText(/Full song:/)).toBeVisible();
  await page.getByRole('combobox',{name:'Shorts clip length'}).selectOption('15');
  await expect(page.getByRole('button',{name:'Use this hook'}).first()).toBeEnabled();
  await page.getByRole('button',{name:'Use this hook'}).first().click();
  await expect(page.getByRole('combobox',{name:'Video aspect ratio'})).toHaveValue('9:16');
  await expect(page.getByRole('button',{name:/Restore full song/})).toBeEnabled();
  await page.getByRole('button',{name:/Restore full song/}).click();
  await expect(page.getByRole('checkbox',{name:'Loop preview'})).toBeVisible();
});

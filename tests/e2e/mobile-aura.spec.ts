import {test,expect} from '@playwright/test';

test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});

test('mobile studio has usable six-button bar, fixed drawers, Aura preview + confirm and reels shortcut',async({page})=>{
  await page.goto('/studio');
  const mobile=page.getByRole('navigation',{name:'Mobile studio tools'});
  await expect(mobile).toBeVisible();
  await expect(mobile.getByRole('button')).toHaveCount(6);
  await expect(page.locator('.studio-side')).toHaveCSS('visibility','hidden');
  await mobile.getByRole('button',{name:'Templates'}).click();
  await expect(page.locator('.studio-side')).toHaveCSS('visibility','visible');
  await expect(page.getByRole('heading',{name:'Phonk Video Maker'})).toBeVisible();
  await page.getByRole('group',{name:'Template categories'}).getByRole('button',{name:'Ultra Aura'}).click();
  const aura=page.locator('.mobile-template-grid .mini-template').filter({hasText:'Ultra Aura'}).first();
  await aura.click();
  await expect(page.getByText(/Previewing: Ultra Aura/)).toBeVisible();
  await page.getByRole('button',{name:'Cancel Preview'}).click();
  await expect(page.getByText(/Previewing: Ultra Aura/)).toHaveCount(0);
  await aura.click();
  await page.getByRole('button',{name:'Apply Template'}).click();
  await expect(page.locator('.studio-side')).toHaveCSS('visibility','hidden');
  await page.getByRole('button',{name:/Dark Phonk 15s/}).click();
  await expect(page.getByLabel('Video aspect ratio')).toHaveValue('9:16');
  await expect(page.getByText(/Dark Skull Bass 9:16 Reel ready/)).toBeVisible();
  await mobile.getByRole('button',{name:'Export'}).click();
  await expect(page.locator('.studio-right')).toHaveCSS('visibility','visible');
  await expect(page.getByRole('combobox',{name:'Export video format'})).toHaveValue('instagram');
  await page.getByRole('button',{name:'Close export sheet'}).click();
  await expect(page.locator('.studio-right')).toHaveCSS('visibility','hidden');
  const width=await page.evaluate(()=>({screen:window.innerWidth,document:document.documentElement.scrollWidth}));
  expect(width.document).toBeLessThanOrEqual(width.screen+2);
});
test('mobile FX and Inspector drawer expose real edit controls without horizontal tab pileup',async({page})=>{
 await page.goto('/studio');
 const nav=page.getByRole('navigation',{name:'Mobile studio tools'});
 await nav.getByRole('button',{name:'Aura FX'}).click();
 await expect(page.getByRole('heading',{name:'Phonk FX & Transitions'})).toBeVisible();
 await page.getByRole('button',{name:/Hard Phonk Punch/}).click();
 await expect(page.getByText(/Hard Phonk Punch applied/)).toBeVisible();
 await nav.getByRole('button',{name:'Tools'}).click();
 await expect(page.getByRole('heading',{name:'Layer inspector'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Close tool sheet'})).toBeVisible();
});

import {test,expect} from '@playwright/test';

// Rendering comparison is intentionally a structural/pixel differentiation smoke test.
// It does not claim an aesthetic quality score or actual-device certification.
test('three researched signature Phonk themes render distinct non-empty scenes',async({page})=>{
  const checks=[];
  for(const slug of ['signature-skull','signature-drift','signature-tape']){
    await page.goto('/studio?template='+slug);
    const canvas=page.getByRole('img',{name:'Animated music spectrum preview'});
    await expect(canvas).toBeVisible();
    await expect(page.getByRole('navigation',{name:'Studio panels'})).toBeVisible();
    await page.waitForTimeout(150);
    const result=await canvas.evaluate((element)=>{
      const c=element as HTMLCanvasElement,ctx=c.getContext('2d');
      if(!ctx||!c.width||!c.height)return {fingerprint:'empty',signal:0,width:0};
      const image=ctx.getImageData(0,0,c.width,c.height);
      let signal=0,fingerprint='';
      for(let y=5;y<29;y++)for(let x=5;x<27;x++){
        const px=Math.min(c.width-1,Math.floor(x/32*c.width)),py=Math.min(c.height-1,Math.floor(y/34*c.height));
        const i=(py*c.width+px)*4,r=image.data[i],g=image.data[i+1],b=image.data[i+2];
        const lum=Math.floor((r+g+b)/3);
        signal+=lum;
        fingerprint+=Math.floor(r/24).toString(16)+Math.floor(g/24).toString(16)+Math.floor(b/24).toString(16);
      }
      return {fingerprint,signal,width:c.width};
    });
    expect(result.width).toBeGreaterThanOrEqual(720);
    expect(result.signal).toBeGreaterThan(800);
    checks.push(result.fingerprint);
  }
  expect(new Set(checks).size).toBe(3);
});
test('signature Phonk template confirms before applying and respects cancellation',async({page})=>{
 await page.goto('/studio');
 const nav=page.getByRole('navigation',{name:'Studio panels'});
 await nav.getByRole('button',{name:/templates/i}).click();
 await page.getByRole('button',{name:/Midnight Drift/}).click();
 await expect(page.getByText(/Previewing: Midnight Drift/)).toBeVisible();
 await page.getByRole('button',{name:'Cancel Preview'}).click();
 await nav.getByRole('button',{name:/effects/i}).click();
 await expect(page.getByRole('combobox',{name:'Spectrum style'})).toHaveValue('phonk-skull');
 await nav.getByRole('button',{name:/templates/i}).click();
 await page.getByRole('button',{name:/Memphis Tape/}).click();
 await page.getByRole('button',{name:/Apply Template/}).click();
 await nav.getByRole('button',{name:/effects/i}).click();
 await expect(page.getByRole('combobox',{name:'Spectrum style'})).toHaveValue('phonk-tape');
});

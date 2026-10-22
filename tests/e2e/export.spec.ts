import { test, expect } from '@playwright/test';
import { stat } from 'node:fs/promises';

test('a short phonk audio project exports a real downloadable video in Chromium', async ({ page }) => {
  await page.goto('/studio');
  const exportButton = page.getByRole('button', { name: 'Export to device' });
  await expect(exportButton).toBeEnabled();

  const panels = page.getByRole('navigation', { name: 'Studio panels' });
  await panels.getByRole('button', { name: /inspector/i }).click();
  const duration = page.getByLabel('Duration (seconds)');
  await duration.fill('2');
  await duration.press('Tab');
  await expect(duration).toHaveValue('2');

  await panels.getByRole('button', { name: /assets/i }).click();
  await page.getByRole('button', { name: /Try original demo beat/i }).click();
  await expect(page.getByText('Original Demo Beat.wav added. Media stays on this device.')).toBeVisible();
  await expect(page.getByText('Audio attached')).toBeVisible();

  const pendingDownload = page.waitForEvent('download', { timeout: 45_000 });
  await exportButton.click();
  const download = await pendingDownload;
  expect(download.suggestedFilename()).toMatch(/^bass-bin-\d+\.(webm|mp4)$/);
  expect(await download.failure()).toBeNull();

  const localPath = await download.path();
  expect(localPath).toBeTruthy();
  const { size } = await stat(localPath!);
  expect(size).toBeGreaterThan(1024);
  await expect(page.getByText(/Export saved to your device as/)).toBeVisible();

  console.log(`Browser exported ${download.suggestedFilename()} (${size} bytes)`);
});

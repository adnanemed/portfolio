import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../public/projects/saveur-charme');

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    locale: 'fr-FR'
  });

  const page = await context.newPage();

  // Route mock for admin authentication
  await page.route('**/api/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'usr_1', username: 'owner', role: 'Super Admin', email: 'owner@saveurcharme.ma' }
      })
    });
  });

  console.log('Capturing 1. Hero...');
  await page.goto('https://restaurant-app-liart-seven.vercel.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const heroPng = await page.screenshot({ type: 'png' });

  console.log('Capturing 2. Menu...');
  await page.goto('https://restaurant-app-liart-seven.vercel.app/menu', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const menuPng = await page.screenshot({ type: 'png' });

  console.log('Capturing 3. Booking / Plan 2D...');
  await page.goto('https://restaurant-app-liart-seven.vercel.app/reservation', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  // Click on a table if present
  try {
    const tableBtn = page.locator('button:has-text("Table 3"), [role="button"]:has-text("Table 3")').first();
    if (await tableBtn.isVisible()) {
      await tableBtn.click();
      await page.waitForTimeout(500);
    }
  } catch (e) {}
  const bookingPng = await page.screenshot({ type: 'png' });

  console.log('Capturing 4. Cart...');
  // Add an item to cart from menu first, then go to cart
  await page.goto('https://restaurant-app-liart-seven.vercel.app/menu', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const addButtons = page.locator('button:has-text("Ajouter au Panier"), button:has-text("Ajouter")');
  const count = await addButtons.count();
  for (let i = 0; i < Math.min(count, 3); i++) {
    try {
      await addButtons.nth(i).click();
      await page.waitForTimeout(300);
    } catch (e) {}
  }
  await page.goto('https://restaurant-app-liart-seven.vercel.app/cart', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const cartPng = await page.screenshot({ type: 'png' });

  console.log('Capturing 5. Admin Dashboard...');
  await page.goto('https://saveur-and-charme.vercel.app/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const adminPng = await page.screenshot({ type: 'png' });

  await browser.close();

  const shots = [
    { name: 'saveur-charme-hero', buf: heroPng },
    { name: 'saveur-charme-menu', buf: menuPng },
    { name: 'saveur-charme-booking', buf: bookingPng },
    { name: 'saveur-charme-cart', buf: cartPng },
    { name: 'saveur-charme-admin', buf: adminPng }
  ];

  for (const s of shots) {
    const meta = await sharp(s.buf).metadata();
    console.log(s.name, 'Retina size:', meta.width, 'x', meta.height);
    const dest = path.join(outDir, `${s.name}.webp`);
    await sharp(s.buf)
      .webp({ quality: 90, effort: 5 })
      .toFile(dest);
    const stat = fs.statSync(dest);
    console.log(`Saved ${dest} (${(stat.size / 1024).toFixed(0)} KB)`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

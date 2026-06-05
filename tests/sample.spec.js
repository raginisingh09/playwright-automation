import { test } from '@playwright/test';

test('open google', async ({ page }) => {

  await page.goto('https://flyingflea.royalenfield.com/in/en/product/c6/');

  console.log(await page.title());

});
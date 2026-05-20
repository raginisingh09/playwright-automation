import { test, expect } from '@playwright/test';

test('OTP Login Flow', async ({ page }) => {

  // Open Website
  await page.goto('https://flyingflea.royalenfield.com/in/en/product/c6/');

  // Open Login Popup
  await page.locator('.header-profile').first().click();

  // Enter Mobile Number
  await page.getByRole('textbox', {
    name: 'Mobile Number* Mobile Number*'
  }).fill('9569736649');

  // Accept Terms Checkbox
  await page.locator('input[type="checkbox"]').check();

  // Wait Before Continue
  await page.waitForTimeout(2000);

  // Capture OTP Trigger API
  const sendOtpResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('send') &&
      response.status() === 200
  );

  // Click Continue
  await page.getByRole('button', {
    name: 'Continue'
  }).click();

  // Wait For OTP API Response
  const sendOtpResponse = await sendOtpResponsePromise;

  // Convert Response To JSON
  const sendOtpBody = await sendOtpResponse.json();

  console.log('Send OTP API Response:', sendOtpBody);

  // Validate OTP Screen Visible
  await expect(page.getByText('ENTER OTP')).toBeVisible();

  // OTP
  const otp = '184906';

  // Fill OTP Boxes
  for (let i = 0; i < otp.length; i++) {
    await page.getByRole('textbox', { name: '-' })
      .nth(i)
      .fill(otp[i]);
  }

  // Capture Verify OTP API
  const verifyOtpResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('verify') &&
      response.status() === 200
  );

  // Click Verify
  await page.getByRole('button', {
    name: 'Verify'
  }).click();

  // Wait For Verify OTP API Response
  const verifyOtpResponse = await verifyOtpResponsePromise;

  // Convert Verify Response To JSON
  const verifyOtpBody = await verifyOtpResponse.json();

  console.log('Verify OTP API Response:', verifyOtpBody);

  // Final Validation
  await expect(page).toHaveURL(/profile|home|dashboard/);

});
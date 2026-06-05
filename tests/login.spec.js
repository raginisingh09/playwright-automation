import { test } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';

import { USERS } from '../test-data/loginData';

test.describe.configure({ mode: 'serial' });

test.describe('OTP Login Flow', () => {

  test.setTimeout(0);

  test('Login with OTP', async ({ page }) => {

    const loginPage = new LoginPage(page);

    // Open Website
    await loginPage.navigate();

    // Open Login Popup
    await loginPage.openLoginPopup();

    // Enter Mobile Number
    await loginPage.enterMobileNumber(
      USERS.registeredUser.mobile
    );

    // Accept Terms
    await loginPage.acceptTerms();

    // Continue
    await loginPage.clickContinue();

    // Validate OTP Screen
    await loginPage.validateOtpScreen();

    // Enter OTP manually in the headed browser.
    await loginPage.waitForManualOtpEntry();

    // Verify OTP
    await loginPage.clickVerify();

  });
});

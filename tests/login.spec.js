import { test } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';

import { USERS } from '../test-data/loginData';

test.describe.configure({ mode: 'serial' });

test.describe('OTP Login Flow', () => {

  let page;
  let loginPage;

  test.beforeAll(async ({ browser }) => {

    page = await browser.newPage();

    loginPage = new LoginPage(page);

  });

  test.afterAll(async () => {

    await page.close();

  });

  test('Login with OTP', async () => {

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

    // Enter OTP
    await loginPage.enterOTP(
      USERS.registeredUser.otp
    );

    // Verify OTP
    await loginPage.clickVerify();

  });
});
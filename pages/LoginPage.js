import { expect } from '@playwright/test';

export class LoginPage {

  constructor(page) {

    this.page = page;

    // Locators
    this.profileIcon = page
      .getByAltText('Profile Icon');

    this.mobileInput = page
      .getByRole('textbox', {
        name: /mobile number/i
      });

    this.checkbox = page
      .locator('#loginForm #privacyPolicy');

    this.termsText = page
      .locator('#loginForm')
      .getByText(/by continuing/i);

    this.continueBtn = page
      .getByRole('button', {
        name: /continue/i
      });

    this.verifyBtn = page
      .getByRole('button', {
        name: /verify/i
      });

  }

  async navigate() {

    await this.page.goto(
      'https://flyingflea.royalenfield.com/in/en/product/c6/',
      {
        waitUntil: 'domcontentloaded',
        timeout: 120000
      }
    );

    // Extra wait for heavy AEM rendering
    await this.page.waitForTimeout(8000);

    // Accept cookies if visible
    const acceptCookies =
      this.page.getByRole('button', {
        name: /accept/i
      });

    if (
      await acceptCookies
        .isVisible()
        .catch(() => false)
    ) {

      await acceptCookies.click();

      await this.page.waitForTimeout(2000);
    }

    // Ensure page fully rendered
    await this.page.waitForLoadState('networkidle');

    console.log('Website loaded successfully');
  }

  async openLoginPopup() {

    // Scroll to top
    await this.page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    await this.page.waitForTimeout(3000);

    // Debug count
    console.log(
      'Profile Icons Found:',
      await this.profileIcon.count()
    );

    // Wait for icon
    await this.profileIcon.first().waitFor({
      state: 'visible',
      timeout: 20000
    });

    // Click profile icon
    await this.profileIcon
      .first()
      .click({
        force: true
      });

    console.log('Profile icon clicked');

    // Wait for login popup
    await this.page
      .locator('#loginForm')
      .waitFor({
        state: 'visible',
        timeout: 20000
      });

    console.log('Login popup opened');

    await this.page.waitForTimeout(2000);
  }

  async enterMobileNumber(mobile) {

    await this.mobileInput.waitFor({
      state: 'visible',
      timeout: 10000
    });

    await this.mobileInput.fill(mobile);

    console.log('Mobile number entered');
  }

  async acceptTerms() {

    await this.checkbox.waitFor({
      state: 'attached',
      timeout: 10000
    });

    await this.termsText.click({
      force: true
    });

    await expect(this.checkbox).toBeChecked();

    console.log('Terms checkbox selected');
  }

  async clickContinue() {

    await this.continueBtn.click();

    console.log('Continue button clicked');
  }

  async validateOtpScreen() {

    await expect(
      this.page.locator('h2.auth-heading:visible', {
        hasText: 'ENTER OTP'
      })
    ).toBeVisible({
      timeout: 20000
    });

    console.log('OTP screen visible');
  }

  async enterOTP(otp) {

    expect(otp).toMatch(/^\d{6}$/);

    const otpInputs =
      this.page
        .getByRole('textbox', {
          name: '-'
        });

    await expect(otpInputs).toHaveCount(6, {
      timeout: 10000
    });

    for (let i = 0; i < otp.length; i++) {

      await otpInputs
        .nth(i)
        .click();

      await otpInputs
        .nth(i)
        .press(otp[i]);
    }

    await expect(this.verifyBtn).toBeEnabled({
      timeout: 10000
    });

    console.log('OTP entered');
  }

  async waitForManualOtpEntry() {

    console.log('Enter OTP manually in the browser');

    await expect(this.verifyBtn).toBeEnabled({
      timeout: 0
    });

    console.log('Manual OTP entered');
  }

  async clickVerify() {

    const verifyResponses = [];

    const collectVerifyResponse = response => {
      if (
        response.url().includes('verify') &&
        response.request().method() !== 'OPTIONS'
      ) {
        verifyResponses.push(response);
      }
    };

    this.page.on('response', collectVerifyResponse);

    await this.verifyBtn.click();

    console.log('Verify button clicked');

    try {
      await expect
        .poll(
          () =>
            verifyResponses
              .map(response => response.status())
              .find(status => status === 200 || status !== 204),
          {
            timeout: 30000
          }
        )
        .not.toBeUndefined();
    } finally {
      this.page.off('response', collectVerifyResponse);
    }

    const verifyStatuses =
      verifyResponses.map(response => response.status());

    console.log(
      'Verify OTP API statuses:',
      verifyStatuses
    );

    expect(
      verifyStatuses,
      'Verify OTP should eventually return 200'
    ).toContain(200);
  }

}

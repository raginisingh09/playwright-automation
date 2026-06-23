import { expect } from '@playwright/test';

export class AccountPreparationPage {
  constructor(page) {
    this.page = page;
    this.baseUrl = 'https://flyingflea.royalenfield.com/in/en/product/c6/';

    this.profileIcon = page.getByAltText('Profile Icon').first();
    this.loginForm = page.locator('#loginForm');
    this.signupForm = page.locator('#signupForm');
    this.mobileInput = this.loginForm.getByRole('textbox', {
      name: /mobile number/i
    });
    this.consentCheckbox = this.loginForm.locator('input[type="checkbox"]').first();
    this.consentControl = this.loginForm.getByText(/by continuing/i);
    this.continueButton = this.loginForm.getByRole('button', {
      name: /continue/i
    });
    this.otpInputs = page.getByRole('textbox', { name: '-' });
    this.verifyButton = page.getByRole('button', { name: /verify/i });
  }

  async navigate() {
    await this.page.goto(this.baseUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 120000
    });

    await this.acceptCookiesIfVisible();
    await expect(this.profileIcon).toBeVisible({ timeout: 30000 });
  }

  async acceptCookiesIfVisible() {
    const acceptButton = this.page
      .getByRole('button', { name: /accept all|allow all|accept/i })
      .first();

    if (await acceptButton.isVisible().catch(() => false)) {
      await acceptButton.click();
    }
  }

  async openAuthentication() {
    await this.profileIcon.click({ force: true });
    await expect(this.loginForm).toBeVisible({ timeout: 20000 });
  }

  async submitMobileNumber(mobile) {
    expect(mobile).toMatch(/^\d{10}$/);

    await this.mobileInput.fill(mobile);
    await this.consentControl.click({ position: { x: 5, y: 5 } });

      await expect(this.consentCheckbox).toBeChecked({
        timeout: 10000
      });

      await expect(this.continueButton).toBeEnabled({
        timeout: 10000
      });

      await this.continueButton.click();

    return this.detectAuthFlow();
  }

  async detectAuthFlow() {
    await expect
      .poll(
        async () => {
          if (await this.signupForm.isVisible().catch(() => false)) {
            return 'signup';
          }

          if (
            await this.otpInputs.count() === 6 &&
            await this.otpInputs.first().isVisible().catch(() => false)
          ) {
            return 'login';
          }

          return null;
        },
        {
          message: 'Waiting to determine whether the mobile number exists',
          timeout: 20000
        }
      )
      .not.toBeNull();

    return await this.signupForm.isVisible().catch(() => false)
      ? 'signup'
      : 'login';
  }

  async waitForManualLoginOtp() {
    console.log(
      'Test data preparation: account exists. Enter the login OTP to delete it.'
    );

    await expect(this.verifyButton).toBeEnabled({ timeout: 0 });
  }

  async verifyLogin() {
    await this.verifyButton.click();
    await expect(this.loginForm).toBeHidden({ timeout: 30000 });
    await expect(this.profileIcon).toBeVisible({ timeout: 30000 });
  }
}

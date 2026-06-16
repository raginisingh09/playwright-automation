import { expect } from '@playwright/test';

export class SignupPage {
  constructor(page) {
    this.page = page;
    this.baseUrl = 'https://flyingflea.royalenfield.com/in/en/product/c6/';

    this.profileIcon = page.locator('.header-profile').first();
    this.loginForm = page.locator('#loginForm');
    this.signupForm = page.locator('#signupForm');
    this.mobileInput = this.loginForm.getByRole('textbox', {
      name: /mobile number/i
    });
    this.loginConsentCheckbox = this.loginForm
      .locator('input[type="checkbox"]')
      .first();
    this.loginConsentControl = this.loginForm.getByText(/by continuing/i);
    this.loginContinueButton = this.loginForm.getByRole('button', {
      name: /continue/i
    });

    this.firstNameInput = this.signupForm.getByRole('textbox', {
      name: /first name/i
    });
    this.lastNameInput = this.signupForm.getByRole('textbox', {
      name: /last name/i
    });
    this.emailInput = this.signupForm.locator('#emailId');
    this.signupConsentCheckboxes = this.signupForm.locator(
      'input[type="checkbox"]'
    );
    this.signupContinueButton = this.signupForm.getByRole('button', {
      name: /continue/i
    });

    this.otpInputs = page.getByRole('textbox', { name: '-' });
    this.verifyButton = page.getByRole('button', { name: /verify/i });
    this.discoverC6Link = page.getByRole('link', { name: /discover c6/i });
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

  async openSignupFlow() {
    await this.profileIcon.click({ force: true });
    await expect(this.loginForm).toBeVisible({ timeout: 20000 });
  }

  async submitMobileNumber(mobile) {
    expect(
      mobile,
      'Signup requires a valid unregistered 10-digit mobile number.'
    ).toMatch(/^\d{10}$/);

    await this.mobileInput.fill(mobile);
    await this.loginConsentControl.click({ position: { x: 5, y: 5 } });
    await expect(this.loginConsentCheckbox).toBeChecked();
    await this.loginContinueButton.click();

    const authFlow = await this.detectAuthFlow();

    expect(
      authFlow,
      'Expected an unregistered mobile number to open signup, but the login OTP flow opened.'
    ).toBe('signup');
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
          message: 'Waiting for login or signup flow after mobile submission',
          timeout: 20000
        }
      )
      .not.toBeNull();

    if (await this.signupForm.isVisible().catch(() => false)) {
      return 'signup';
    }

    return 'login';
  }

  async fillPersonalDetails(user) {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
  }

  async acceptSignupConsents() {
    const consentCount = await this.signupConsentCheckboxes.count();

    expect(
      consentCount,
      'Expected the signup form to contain consent checkboxes'
    ).toBeGreaterThanOrEqual(2);

    for (let index = 0; index < consentCount; index++) {
      const consentCheckbox = this.signupConsentCheckboxes.nth(index);

      if (!await consentCheckbox.isChecked()) {
        await consentCheckbox.evaluate((checkbox) => checkbox.click());
      }

      await expect(
        consentCheckbox,
        `Signup consent checkbox ${index + 1} was not selected.`
      ).toBeChecked();
    }
  }

  async submitSignupForm() {
    await expect(this.signupContinueButton).toBeEnabled();
    await this.signupContinueButton.click();
    await expect(this.otpInputs).toHaveCount(6, { timeout: 20000 });
  }

  async enterOtp(otp) {
    expect(otp).toMatch(/^\d{6}$/);

    for (let index = 0; index < otp.length; index++) {
      await this.otpInputs.nth(index).fill(otp[index]);
    }
  }

  async waitForManualOtpEntry() {
    console.log('Enter the signup OTP manually in the headed browser.');
    await expect(this.verifyButton).toBeEnabled({ timeout: 0 });
  }

  async verifySignup() {
    await this.verifyButton.click();
  }

  async verifyOnboarding() {
    await expect(this.discoverC6Link).toBeVisible({ timeout: 30000 });
  }

  async completeOnboarding() {
    await this.discoverC6Link.click();
  }

  async verifyHomeScreen() {
    await expect(this.page).toHaveURL(/\/product\/c6\/?/i);
    await expect(this.profileIcon).toBeVisible({ timeout: 30000 });
  }

  async completeSignupDetails(user) {
    await this.submitMobileNumber(user.mobile);
    await this.fillPersonalDetails(user);
    await this.acceptSignupConsents();
    await this.submitSignupForm();
  }
}

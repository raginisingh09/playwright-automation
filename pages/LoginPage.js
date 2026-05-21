import { expect } from '@playwright/test';

export class LoginPage {

  constructor(page) {

    this.page = page;

    // Locators
    this.profileIcon = page.locator('.header-profile').first();

    this.mobileInput = page.getByRole('textbox', {
      name: 'Mobile Number* Mobile Number*'
    });

    this.checkbox = page.locator('input[type="checkbox"]');

    this.continueBtn = page.getByRole('button', {
      name: 'Continue'
    });

    this.verifyBtn = page.getByRole('button', {
      name: 'Verify'
    });

  }

  async navigate() {
    await this.page.goto(
      'https://flyingflea.royalenfield.com/in/en/product/c6/'
    );
  }

  async openLoginPopup() {
    await this.profileIcon.click();
  }

  async enterMobileNumber(mobile) {
    await this.mobileInput.fill(mobile);
  }

  async acceptTerms() {
    await this.checkbox.check();
  }

  async clickContinue() {

    // Capture Send OTP API
    const sendOtpResponsePromise = this.page.waitForResponse(
      response =>
        response.url().includes('send') &&
        response.status() === 200
    );

    await this.continueBtn.click();

    const sendOtpResponse = await sendOtpResponsePromise;

    const sendOtpBody = await sendOtpResponse.json();

    console.log('Send OTP API Response:', sendOtpBody);
  }

  async validateOtpScreen() {
    await expect(
      this.page.getByText('ENTER OTP')
    ).toBeVisible();
  }

  async enterOTP(otp) {

    for (let i = 0; i < otp.length; i++) {

      await this.page
        .getByRole('textbox', { name: '-' })
        .nth(i)
        .fill(otp[i]);
    }
  }

  async clickVerify() {

    // Capture Verify OTP API
    const verifyOtpResponsePromise = this.page.waitForResponse(
      response =>
        response.url().includes('verify') &&
        response.status() === 200
    );

    await this.verifyBtn.click();

    const verifyOtpResponse =
      await verifyOtpResponsePromise;

    const verifyOtpBody =
      await verifyOtpResponse.json();

    console.log(
      'Verify OTP API Response:',
      verifyOtpBody
    );
  }

}
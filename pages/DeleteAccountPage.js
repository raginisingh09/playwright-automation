import { expect } from '@playwright/test';

export class DeleteAccountPage {
  constructor(page) {
    this.page = page;
    this.baseUrl = 'https://flyingflea.royalenfield.com/in/en/product/c6/';
    this.profileIcon = page.locator('.header-profile').first();
  }

  async navigateAsAuthenticatedUser() {
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

  async deleteAccount(mobile) {
    await this.profileIcon.click({ force: true });

    const deleteAccountLabel = this.page
      .getByText('Delete account', { exact: true })
      .filter({ visible: true })
      .first();

    await expect(
      deleteAccountLabel,
      'Account deletion control was not found after login.'
    ).toBeVisible({ timeout: 20000 });

    await deleteAccountLabel.evaluate((label) => {
      const control =
        label.closest('button, a, [role="button"]') ?? label.parentElement;

      if (!(control instanceof HTMLElement)) {
        throw new Error('Delete account label has no clickable parent.');
      }

      control.click();
    });

    const confirmationButton = this.page
      .getByRole('button', { name: 'Yes, Delete', exact: true })
      .filter({ visible: true })
      .first();

    await expect(
      confirmationButton,
      'Account deletion confirmation was not displayed.'
    ).toBeVisible({ timeout: 10000 });

    await confirmationButton.click();

    await this.page.waitForURL(/\/in\/en\/product\/c6\/?$/, {
      timeout: 30000
    });
    await expect(this.profileIcon).toBeVisible({ timeout: 30000 });

    await this.profileIcon.click({ force: true });

    const loginForm = this.page.locator('#loginForm');
    await expect(loginForm).toBeVisible({ timeout: 20000 });

    await loginForm
      .getByRole('textbox', { name: /mobile number/i })
      .fill(mobile);
    const consentCheckbox = loginForm.locator('input[type="checkbox"]').first();
    await loginForm.getByText(/by continuing/i).click({
      position: { x: 5, y: 5 }
    });
    await expect(consentCheckbox).toBeChecked();
    await loginForm.getByRole('button', { name: /continue/i }).click();

    await expect(
      this.page.locator('#signupForm'),
      'The deleted mobile number did not open the signup flow.'
    ).toBeVisible({ timeout: 30000 });
  }
}

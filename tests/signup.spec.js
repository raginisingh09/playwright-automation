import { expect, test } from '@playwright/test';

import { SignupPage } from '../pages/SignupPage';
import { SIGNUP_USER } from '../test-data/signupData';
import { readSignupPreparationState } from '../utils/signupPreparationState';

test.describe.configure({ mode: 'serial' });

test.describe('Signup Flow', () => {
  test.setTimeout(0);

  test('sign up a new user and discover C6', async ({ page }) => {
    const signupPage = new SignupPage(page);

    test.skip(
      !SIGNUP_USER.mobile,
      'Set an unregistered mobile number in test-data/signupData.js.'
    );

    const preparationState = await readSignupPreparationState();

    if (preparationState.accountExisted) {
      expect(
        preparationState.accountDeleted,
        'Signup must not start until the existing account has been deleted.'
      ).toBe(true);
    }

    await test.step('Submit signup details', async () => {
      await signupPage.navigate();
      await signupPage.openSignupFlow();
      await signupPage.completeSignupDetails(SIGNUP_USER);
    });

    await test.step('Verify signup OTP', async () => {
      await signupPage.waitForManualOtpEntry();
      await signupPage.verifySignup();
    });

    await test.step('Verify onboarding', async () => {
      await signupPage.verifyOnboarding();
      await signupPage.completeOnboarding();
    });

    await test.step('Verify home screen', async () => {
      await signupPage.verifyHomeScreen();
    });
  });
});

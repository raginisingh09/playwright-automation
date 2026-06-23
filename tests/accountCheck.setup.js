import { test } from '@playwright/test';

import { AccountPreparationPage } from '../pages/AccountPreparationPage';
import { TEST_USER } from '../test-data/testUser';
import {
  ensureSignupPreparationDirectory,
  signupPreparationPaths,
  writeSignupPreparationState
} from '../utils/signupPreparationState';

test.describe('Signup Account Check and Login', () => {
  test.setTimeout(0);

  test('check whether account exists and login when required', async ({ page }) => {
    test.skip(
    !TEST_USER.mobile,
    'Set a dedicated test number in test-data/testUser.js.'
);

    const accountPreparation = new AccountPreparationPage(page);

    await accountPreparation.navigate();
    await accountPreparation.openAuthentication();

    const authFlow = await accountPreparation.submitMobileNumber(
      TEST_USER.mobile
    );

    if (authFlow === 'signup') {
      await writeSignupPreparationState({
        accountExisted: false,
        accountDeleted: false
      });

      console.log('Account check: mobile number is already unregistered.');
      return;
    }

    await accountPreparation.waitForManualLoginOtp();
    await accountPreparation.verifyLogin();

    await ensureSignupPreparationDirectory();
    await page.context().storageState({
      path: signupPreparationPaths.storage
    });
    await writeSignupPreparationState({
      accountExisted: true,
      accountDeleted: false
    });
  });
});

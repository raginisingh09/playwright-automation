import { expect, test } from '@playwright/test';

import { DeleteAccountPage } from '../pages/DeleteAccountPage';
import { SIGNUP_USER } from '../test-data/signupData';
import {
  readSignupPreparationState,
  signupPreparationPaths,
  writeSignupPreparationState
} from '../utils/signupPreparationState';

test.describe('Signup Account Deletion', () => {
  test.setTimeout(0);

  test('delete the existing account when required', async ({ browser }) => {
    const preparationState = await readSignupPreparationState();

    if (!preparationState.accountExisted) {
      console.log('Account deletion: no existing account to delete.');
      return;
    }

    const context = await browser.newContext({
      storageState: signupPreparationPaths.storage
    });
    const page = await context.newPage();
    const deleteAccountPage = new DeleteAccountPage(page);

    try {
      await deleteAccountPage.navigateAsAuthenticatedUser();
      await deleteAccountPage.deleteAccount(SIGNUP_USER.mobile);
      await writeSignupPreparationState({
        accountExisted: true,
        accountDeleted: true
      });
    } finally {
      await context.close();
    }

    const finalState = await readSignupPreparationState();

    expect(
      finalState.accountDeleted,
      `Account deletion failed for ${SIGNUP_USER.mobile}.`
    ).toBe(true);
  });
});

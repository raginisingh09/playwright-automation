import { expect, test } from '@playwright/test';

import { DeleteAccountPage } from '../pages/DeleteAccountPage';
import { TEST_USER } from '../test-data/testUser';
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
      await deleteAccountPage.deleteAccount(TEST_USER.mobile);
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
      `Account deletion failed for ${TEST_USER.mobile}.`
    ).toBe(true);
  });
});

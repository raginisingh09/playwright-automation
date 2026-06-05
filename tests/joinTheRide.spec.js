import { test } from '@playwright/test';

import { JoinTheRidePage } from '../pages/JoinTheRidePage';

import { buildJoinTheRideUser } from '../test-data/joinTheRideData';

test.describe.configure({ mode: 'serial' });

test.describe('Join the Ride Flow', () => {

  test.setTimeout(0);

  test('submit Join the Ride form for every country in the form dropdown', async ({ page }) => {
    const joinTheRidePage = new JoinTheRidePage(page);

    await joinTheRidePage.navigate();

    const countries = getRequiredCountries(await joinTheRidePage.getSiteCountryOptions());

    console.log(
      'Join the Ride country execution order:',
      countries.map(country => `${country.label} (${country.value})`).join(' -> ')
    );

    for (const [index, country] of countries.entries()) {
      await test.step(`Join the Ride - ${country.label}`, async () => {
        const user = buildJoinTheRideUser();

        await joinTheRidePage.navigateToCountryHomePage(country.label);
        await joinTheRidePage.selectSiteCountry(country.label);
        await joinTheRidePage.openJoinTheRideForm();

        await joinTheRidePage.completeJoinTheRide(user, country.label);

        console.log(`Enter OTP manually in the browser for ${country.label}`);

        await joinTheRidePage.waitForManualOtpEntry(country.label);
        await joinTheRidePage.verifyOtp();
      });
    }
  });
});

function getRequiredCountries(countries) {
  const requiredCountries = [
    /united states|^us$|^usa$/i,
    /united kingdom|^gb$|^uk$/i,
    /germany|^de$/i,
    /italy|^it$/i,
    /spain|^es$/i,
    /france|^fr$/i
  ];

  const selectedCountries = [];
  const selectedValues = new Set();

  for (const requiredCountry of requiredCountries) {
    const country = countries.find(option =>
      requiredCountry.test(option.label) || requiredCountry.test(option.value)
    );

    if (country && !selectedValues.has(country.value)) {
      selectedCountries.push(country);
      selectedValues.add(country.value);
    }
  }

  return selectedCountries;
}

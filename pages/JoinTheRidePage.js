import { expect } from '@playwright/test';

export class JoinTheRidePage {

  constructor(page) {
    this.page = page;
    this.baseUrl = 'https://flyingflea.royalenfield.com/in/en/product/c6/';
    this.homeUrls = {
      unitedstates: 'https://flyingflea.royalenfield.com/us/en/home/',
      unitedkingdom: 'https://flyingflea.royalenfield.com/gb/en/home/',
      germany: 'https://flyingflea.royalenfield.com/de/de/home/',
      italy: 'https://flyingflea.royalenfield.com/it/it/home/',
      spain: 'https://flyingflea.royalenfield.com/es/es/home/',
      france: 'https://flyingflea.royalenfield.com/fr/fr/home/'
    };
    this.joinForm = page.locator('#experiencefragment-6715766b72');
    this.firstNameInput = this.joinForm.locator('#firstName:visible').first();
    this.lastNameInput = this.joinForm.locator('#lastName:visible').first();
    this.emailInput = this.joinForm.locator('#emailId:visible').first();
    this.countryField = this.joinForm
      .locator([
        'select#country',
        'select[name="country" i]',
        'select[id="country" i]',
        'select[name*="countryName" i]',
        'select[id*="countryName" i]',
        'select[name*="country" i]',
        'select[id*="country" i]',
        'input#country',
        'input[name="country" i]',
        'input[id="country" i]',
        'input[name*="countryName" i]',
        'input[id*="countryName" i]',
        'input[name*="country" i]',
        'input[id*="country" i]'
      ].join(', '))
      .first();
    this.countrySelect = this.joinForm
      .locator('select#country, select[name*="country" i], select[id*="country" i]')
      .and(page.locator(':visible'))
      .first();
    this.countryDropdown = this.joinForm
      .locator([
        '[role="combobox"][id*="country" i]',
        '[role="combobox"][aria-label*="country" i]',
        '[aria-haspopup="listbox"][id*="country" i]',
        '[aria-haspopup="listbox"][class*="country" i]',
        '[class*="country" i] [role="combobox"]',
        '[class*="country" i] [aria-haspopup="listbox"]',
        '[class*="country" i] .select-selected',
        '[class*="country" i] .selected',
        '[class*="country" i] .dropdown',
        '[class*="country" i]'
      ].join(', '))
      .and(page.locator(':visible'))
      .first();
    this.mobileInput = this.joinForm.locator('#mobileNo:visible').first();
    this.cityInput = this.joinForm.locator('#city:visible').first();
    this.pincodeInput = this.joinForm.locator('#pincode:visible').first();
    this.dobInput = this.joinForm.locator('#dob:visible').first();
    this.submitButton = page.getByRole('button', { name: /^submit$/i }).and(page.locator(':visible')).first();
    this.verifyButton = page.getByRole('button', { name: /^verify$/i }).and(page.locator(':visible')).first();
    this.resendOtpButton = page.getByText(/resend otp|resend/i).and(page.locator(':visible')).first();
    this.okayButton = page.getByRole('button', { name: /^okay$/i }).and(page.locator(':visible')).first();
    this.termsCheckbox = page
      .locator('.ff-club-modal__checkbox-custom.ff-club-modal__checkbox-custom--terms:visible')
      .first();
    this.termsLabel = page
      .getByText(/i agree to the terms and conditions and privacy policy/i)
      .first();
  }

  async navigate() {
    await this.installCookieAutoAccept();

    await this.page.goto(this.baseUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 120000
    });

    await this.acceptCookiesIfVisible();
    await this.waitForHeaderReady();
  }

  async navigateToCountryHomePage(countryName) {
    await this.installCookieAutoAccept();

    const homeUrl = this.homeUrls[normalizeCountry(countryName)];

    if (!homeUrl) {
      throw new Error(`Home URL not configured for country: ${countryName}`);
    }

    await this.page.goto(homeUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 120000
    });

    await this.acceptCookiesIfVisible();
    await this.waitForHeaderReady();
  }

  getLanguageButton() {
    return this.page
      .locator('button, [role="button"]')
      .filter({ hasText: /\((en|de|it|es|fr)\)|\b(en|de|it|es|fr)\b|select language/i })
      .first();
  }

  async waitForHeaderReady() {
    await this.acceptCookiesIfVisible();

    await expect(
      this.page.getByRole('button', { name: /join the ride/i })
        .or(this.getLanguageButton())
        .first()
    ).toBeVisible({ timeout: 30000 });
  }

  async acceptCookiesIfVisible() {
    await this.installCookieAutoAccept();
    await this.runCookieAutoAcceptNow();

    const cookieButtons = [
      this.page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll'),
      this.page.locator('#CybotCookiebotDialogBodyButtonAccept'),
      this.page.locator('#CybotCookiebotDialogBodyButtonDecline'),
      this.page.locator('#CybotCookiebotDialog').getByText(/^allow all$/i),
      this.page.locator('#CybotCookiebotDialog button').filter({ hasText: /^allow all$/i }),
      this.page.getByRole('button', { name: /allow all/i }),
      this.page.getByRole('button', { name: /allow selection/i }),
      this.page.locator('#onetrust-accept-btn-handler'),
      this.page.locator('#accept-recommended-btn-handler'),
      this.page.locator('button[id*="accept" i]'),
      this.page.getByRole('button', { name: /^accept$/i }),
      this.page.getByRole('button', { name: /accept all/i }),
      this.page.getByRole('button', { name: /allow all/i }),
      this.page.getByRole('button', { name: /got it/i }),
      this.page.locator('.onetrust-close-btn-handler'),
      this.page.locator('#onetrust-close-btn-container button'),
      this.page.locator('[aria-label*="close" i]').filter({ hasText: /cookie|privacy|consent/i })
    ];

    for (const cookieButton of cookieButtons) {
      const visibleCookieButton = cookieButton.first();

      if (await visibleCookieButton.isVisible().catch(() => false)) {
        await visibleCookieButton.click({ force: true });
        await this.waitForCookiePopupToClose();
        return;
      }
    }

    await this.hideCookiePopupIfBlocking();
  }

  async installCookieAutoAccept() {
    if (this.cookieAutoAcceptInstalled) {
      return;
    }

    this.cookieAutoAcceptInstalled = true;

    await this.page.addInitScript(() => {
      window.__ffIsVisible = element => {
        if (!element) {
          return false;
        }

        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0' &&
          rect.width > 0 &&
          rect.height > 0
        );
      };

      window.__ffAcceptCookiePopup = () => {
        const cookieContainers = [
          document.querySelector('#CybotCookiebotDialog'),
          document.querySelector('#onetrust-banner-sdk'),
          document.querySelector('#onetrust-consent-sdk')
        ].filter(container =>
          container &&
          window.__ffIsVisible(container)
        );

        if (cookieContainers.length === 0) {
          return false;
        }

        const buttonSelectors = [
          '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
          '#CybotCookiebotDialogBodyButtonAccept',
          '#onetrust-accept-btn-handler',
          '#accept-recommended-btn-handler',
          'button[id*="accept" i]'
        ];

        for (const selector of buttonSelectors) {
          const button = document.querySelector(selector);

          if (button && window.__ffIsVisible(button)) {
            button.click();
            return true;
          }
        }

        const textPattern = /^(allow all|accept all|accept)$/i;

        for (const container of cookieContainers) {
          const candidates = container.querySelectorAll(
            'button, a, [role="button"], input[type="button"], input[type="submit"]'
          );

          for (const candidate of candidates) {
            const text = (
              candidate.innerText ||
              candidate.value ||
              candidate.textContent ||
              ''
            ).trim();

            if (textPattern.test(text) && window.__ffIsVisible(candidate)) {
              candidate.click();
              return true;
            }
          }
        }

        return false;
      };

      window.__ffCookieWatcher = window.__ffCookieWatcher || setInterval(() => {
        window.__ffAcceptCookiePopup();
      }, 500);
    });

    await this.page.evaluate(() => {
      window.__ffIsVisible = element => {
        if (!element) {
          return false;
        }

        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0' &&
          rect.width > 0 &&
          rect.height > 0
        );
      };

      window.__ffAcceptCookiePopup = () => {
        const cookieContainers = [
          document.querySelector('#CybotCookiebotDialog'),
          document.querySelector('#onetrust-banner-sdk'),
          document.querySelector('#onetrust-consent-sdk')
        ].filter(container =>
          container &&
          window.__ffIsVisible(container)
        );

        if (cookieContainers.length === 0) {
          return false;
        }

        const buttonSelectors = [
          '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
          '#CybotCookiebotDialogBodyButtonAccept',
          '#onetrust-accept-btn-handler',
          '#accept-recommended-btn-handler',
          'button[id*="accept" i]'
        ];

        for (const selector of buttonSelectors) {
          const button = document.querySelector(selector);

          if (button && window.__ffIsVisible(button)) {
            button.click();
            return true;
          }
        }

        const textPattern = /^(allow all|accept all|accept)$/i;

        for (const container of cookieContainers) {
          const candidates = container.querySelectorAll(
            'button, a, [role="button"], input[type="button"], input[type="submit"]'
          );

          for (const candidate of candidates) {
            const text = (
              candidate.innerText ||
              candidate.value ||
              candidate.textContent ||
              ''
            ).trim();

            if (textPattern.test(text) && window.__ffIsVisible(candidate)) {
              candidate.click();
              return true;
            }
          }
        }

        return false;
      };

      window.__ffCookieWatcher = window.__ffCookieWatcher || setInterval(() => {
        window.__ffAcceptCookiePopup();
      }, 500);
    }).catch(() => {});
  }

  async runCookieAutoAcceptNow() {
    await this.page.evaluate(() => {
      if (window.__ffAcceptCookiePopup) {
        window.__ffAcceptCookiePopup();
      }
    }).catch(() => {});
  }

  async waitForCookiePopupToClose() {
    const cookiePopup = this.page
      .locator('#CybotCookiebotDialog, [id*="CybotCookiebot" i], #onetrust-banner-sdk, .ot-sdk-container, [id*="cookie" i], [class*="cookie" i]')
      .filter({ hasText: /cookie|privacy|accept|preferences/i })
      .first();

    await cookiePopup.waitFor({
      state: 'hidden',
      timeout: 5000
    }).catch(() => {});

    await this.page.waitForTimeout(500);
  }

  async hideCookiePopupIfBlocking() {
    const cookiePopup = this.page
      .locator('#CybotCookiebotDialog, [id*="CybotCookiebot" i], #onetrust-banner-sdk, #onetrust-consent-sdk, .ot-sdk-container')
      .first();

    if (!await cookiePopup.isVisible().catch(() => false)) {
      return;
    }

    await this.page.evaluate(() => {
      for (const selector of [
        '#CybotCookiebotDialog',
        '[id*="CybotCookiebot"]',
        '.CybotCookiebotDialog',
        '#onetrust-banner-sdk',
        '#onetrust-consent-sdk',
        '.ot-sdk-container',
        '.onetrust-pc-dark-filter',
        '.ot-fade-in'
      ]) {
        document.querySelectorAll(selector).forEach(element => {
          element.style.display = 'none';
          element.style.visibility = 'hidden';
          element.style.pointerEvents = 'none';
        });
      }

      document.body.classList.remove('ot-sdk-show-settings');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    });

    await this.page.waitForTimeout(500);
  }

  async selectSiteCountry(countryName) {
    await this.acceptCookiesIfVisible();

    console.log(`Selecting site country: ${countryName}`);

    await this.getLanguageButton().click();
    await this.page.getByRole('option', { name: new RegExp(countryName, 'i') }).click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
    await this.acceptCookiesIfVisible();
    await this.waitForHeaderReady();
  }

  async getSiteCountryOptions() {
    await this.getLanguageButton().click();

    const options = this.page.getByRole('option');

    await expect(options.first()).toBeVisible({ timeout: 10000 });

    const countries = await options.evaluateAll(optionElements =>
      optionElements
        .map(option => option.innerText || option.textContent || option.getAttribute('aria-label') || '')
        .map(option => option.replace(/.*flag icon/i, '').replace(/\(.*/g, '').trim())
        .filter(Boolean)
    );

    await this.page.keyboard.press('Escape');

    return [...new Set(countries)].map(country => ({
      label: country,
      value: country
    }));
  }

  async openJoinTheRideForm() {
    await this.acceptCookiesIfVisible();

    console.log('Opening Join the Ride form');

    const joinTheRideButton = this.page.getByText(/join the ride/i).first();

    await expect(joinTheRideButton).toBeVisible({ timeout: 20000 });
    const previousUrl = this.page.url();

    await Promise.all([
      this.page.waitForURL(url => url.toString() !== previousUrl, { timeout: 10000 }).catch(() => {}),
      joinTheRideButton.click({ force: true })
    ]);

    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
    await this.acceptCookiesIfVisible();

    await expect(this.firstNameInput).toBeVisible({ timeout: 20000 });
  }

  async getCountryOptions() {
    if (!await this.countrySelect.isVisible({ timeout: 20000 }).catch(() => false)) {
      return [];
    }

    return this.countrySelect.locator('option').evaluateAll(options =>
      options
        .map(option => ({
          label: option.textContent.trim(),
          value: option.value
        }))
        .filter(option => option.value && !option.label.match(/select/i))
    );
  }

  async fillForm(user, countryName) {
    await this.fillVisibleField(this.firstNameInput, user.firstName);
    await this.fillVisibleField(this.lastNameInput, user.lastName);
    await this.fillVisibleField(this.emailInput, user.email);
    await this.selectFormCountry(countryName);
    await this.fillVisibleField(this.mobileInput, user.mobile);
    await this.fillVisibleField(this.cityInput, user.city);
    await this.fillVisibleField(this.pincodeInput, user.pincode);
    await this.fillDateField(this.dobInput, user.dob);
  }

  async selectFormCountry(countryName) {
    const selectedNativeCountry = await this.setFormCountryValue(countryName);

    if (selectedNativeCountry) {
      console.log(`Selecting form country: ${countryName} -> ${selectedNativeCountry}`);
      return;
    }

    const selectedDropdownCountry = await this.selectCustomFormCountry(countryName);

    if (selectedDropdownCountry) {
      console.log(`Selecting custom form country: ${countryName} -> ${selectedDropdownCountry}`);
      return;
    }

    const diagnostics = await this.getCountryDiagnostics();

    throw new Error(
      `Form country option not found/selected for ${countryName}. Country controls found: ${diagnostics}`
    );
  }

  async setFormCountryValue(countryName) {
    const countryAliases = getCountryAliases(countryName);
    const fields = this.joinForm.locator([
      'select#country',
      'select[name="country" i]',
      'select[id="country" i]',
      'select[name*="countryName" i]',
      'select[id*="countryName" i]',
      'select[name*="country" i]',
      'select[id*="country" i]',
      'input#country',
      'input[name="country" i]',
      'input[id="country" i]',
      'input[name*="countryName" i]',
      'input[id*="countryName" i]',
      'input[name*="country" i]',
      'input[id*="country" i]'
    ].join(', '));

    const count = await fields.count();

    const selectedCountries = [];

    for (let index = 0; index < count; index++) {
      const field = fields.nth(index);
      const selectedCountry = await field.evaluate((element, { countryName: selectedCountryName, aliases }) => {
        const normalize = value => value.toLowerCase().replace(/[^a-z]/g, '');
        const setNativeValue = (input, value) => {
          const prototype = Object.getPrototypeOf(input);
          const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');

          if (descriptor?.set) {
            descriptor.set.call(input, value);
          } else {
            input.value = value;
          }
        };

        const fireValidationEvents = input => {
          for (const eventName of ['input', 'change', 'blur']) {
            input.dispatchEvent(new Event(eventName, { bubbles: true }));
          }
        };

        if (element.tagName.toLowerCase() === 'select') {
          const option = [...element.options].find(item => {
            const optionValues = [
              item.textContent || '',
              item.label || '',
              item.value || ''
            ].map(normalize);

            return optionValues.some(optionValue =>
              aliases.some(alias =>
                optionValue === alias ||
                optionValue.includes(alias) ||
                alias.includes(optionValue)
              )
            );
          });

          if (!option) {
            return null;
          }

          setNativeValue(element, option.value);
          option.selected = true;
          fireValidationEvents(element);

          return `${option.textContent.trim()} (${option.value})`;
        }

        setNativeValue(element, selectedCountryName);
        fireValidationEvents(element);

        return element.value;
      }, {
        countryName,
        aliases: countryAliases
      }).catch(() => null);

      if (selectedCountry) {
        selectedCountries.push(selectedCountry);
      }
    }

    return selectedCountries.length > 0
      ? selectedCountries.join(', ')
      : null;
  }

  async selectCustomFormCountry(countryName) {
    const countryAliases = getCountryAliases(countryName);
    const optionPattern = buildCountryOptionPattern(countryName);
    const countryControls = [
      this.joinForm.getByLabel(/country/i).first(),
      this.joinForm.getByPlaceholder(/country/i).first(),
      this.joinForm.getByText(/select country|country/i).first(),
      this.countryDropdown
    ];

    for (const countryControl of countryControls) {
      if (!await countryControl.isVisible({ timeout: 1000 }).catch(() => false)) {
        continue;
      }

      await countryControl.scrollIntoViewIfNeeded();
      await countryControl.click({ force: true });
      await this.page.waitForTimeout(500);

      const selectedCountry = await this.clickVisibleCountryOption(optionPattern, countryAliases);

      if (selectedCountry) {
        return selectedCountry;
      }
    }

    return null;
  }

  async getCountryDiagnostics() {
    return this.joinForm.evaluate(form => {
      const controls = [...form.querySelectorAll('input, select, button, [role="combobox"], [aria-haspopup="listbox"], [class*="country" i], [id*="country" i], [name*="country" i]')]
        .filter(element => {
          const haystack = [
            element.id,
            element.getAttribute('name'),
            element.getAttribute('aria-label'),
            element.getAttribute('placeholder'),
            element.className,
            element.innerText,
            element.textContent
          ].join(' ');

          return /country/i.test(haystack);
        })
        .map(element => ({
          tag: element.tagName,
          id: element.id,
          name: element.getAttribute('name'),
          value: element.value,
          text: (element.innerText || element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
          className: String(element.className || '').slice(0, 80)
        }));

      return JSON.stringify(controls);
    }).catch(error => `Unable to read country diagnostics: ${error.message}`);
  }

  async clickVisibleCountryOption(optionPattern, countryAliases) {
    const optionLocators = [
      this.page.getByRole('option', { name: optionPattern }).first(),
      this.page.getByRole('listitem').filter({ hasText: optionPattern }).first(),
      this.page.locator('[role="listbox"] [role="option"], [role="listbox"] li, .select-items div, .dropdown-menu li, .dropdown-menu div, [class*="option" i], [class*="dropdown" i] li')
        .filter({ hasText: optionPattern })
        .first(),
      this.page.getByText(optionPattern).and(this.page.locator(':visible')).first()
    ];

    for (const optionLocator of optionLocators) {
      if (!await optionLocator.isVisible({ timeout: 1000 }).catch(() => false)) {
        continue;
      }

      const optionText = await optionLocator.innerText().catch(() => '');

      await optionLocator.scrollIntoViewIfNeeded();
      await optionLocator.click({ force: true });
      await this.page.waitForTimeout(500);

      return optionText.trim() || countryAliases[0];
    }

    return null;
  }

  async setHiddenFormCountry(countryName) {
    if (await this.countryField.count() === 0) {
      return null;
    }

    const countryAliases = getCountryAliases(countryName);

    return this.countryField.evaluate((field, { countryName: selectedCountryName, aliases }) => {
      const normalize = value => value.toLowerCase().replace(/[^a-z]/g, '');

      if (field.tagName.toLowerCase() === 'select') {
        const option = [...field.options].find(item => {
          const optionValues = [
            item.textContent || '',
            item.label || '',
            item.value || ''
          ].map(normalize);

          return optionValues.some(optionValue =>
            aliases.some(alias =>
              optionValue === alias ||
              optionValue.includes(alias) ||
              alias.includes(optionValue)
            )
          );
        });

        if (!option) {
          return null;
        }

        field.value = option.value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));

        return `${option.textContent.trim()} (${option.value})`;
      }

      field.value = selectedCountryName;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));

      return field.value;
    }, {
      countryName,
      aliases: countryAliases
    });
  }

  async assertSelectedFormCountry(countryName) {
    const selectedCountry = await this.countrySelect.evaluate(select => {
      const option = select.selectedOptions[0];

      return {
        label: option?.textContent?.trim() || '',
        value: option?.value || ''
      };
    });

    if (!isSameCountry(selectedCountry, countryName)) {
      throw new Error(
        `Wrong form country selected. Expected ${countryName}, got ${selectedCountry.label} (${selectedCountry.value}).`
      );
    }
  }

  async acceptDisclaimer() {
    const checkboxInput = this.page
      .locator('input[type="checkbox"]:visible')
      .first();

    if (await this.termsCheckbox.isVisible().catch(() => false)) {
      await this.termsCheckbox.scrollIntoViewIfNeeded();
      await this.termsCheckbox.click({ force: true });
    } else if (await this.termsLabel.isVisible().catch(() => false)) {
      await this.termsLabel.scrollIntoViewIfNeeded();
      await this.termsLabel.click({ force: true });
    } else if (await checkboxInput.isVisible().catch(() => false)) {
      await checkboxInput.scrollIntoViewIfNeeded();
      await checkboxInput.check({ force: true });
    } else {
      await this.page.locator('input[type="checkbox"]').first().evaluate(checkbox => {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('input', { bubbles: true }));
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    await this.ensureTermsAccepted();
  }

  async ensureTermsAccepted() {
    const checkedCheckbox = this.page.locator('input[type="checkbox"]:checked').first();

    if (await checkedCheckbox.isVisible().catch(() => false)) {
      return;
    }

    await this.page.locator('input[type="checkbox"]').first().evaluate(checkbox => {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('input', { bubbles: true }));
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  async fillVisibleField(locator, value) {
    await locator.scrollIntoViewIfNeeded();
    await expect(locator).toBeVisible({ timeout: 10000 });
    await locator.fill(value);
    await locator.evaluate(input => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.blur();
    });
    await expect(locator).toHaveValue(value);
  }

  async fillDateField(locator, value) {
    await locator.scrollIntoViewIfNeeded();
    await expect(locator).toBeVisible({ timeout: 10000 });

    await locator.evaluate((input, dateValue) => {
      input.value = dateValue;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.blur();
    }, value);

    await expect(locator).toHaveValue(value);
  }

  async submit() {
    await expect(this.submitButton).toBeEnabled({ timeout: 10000 });

    await this.validateApiResponsesDuring(
      () => this.submitButton.click(),
      'Join the Ride submit / OTP send'
    );
  }

  async validateOtpScreen() {
    await expect(this.verifyButton).toBeVisible({ timeout: 30000 });
  }

  async enterOtp(otp) {
    expect(otp).toMatch(/^[a-zA-Z0-9]{6}$/);

    const otpInputs = this.page.getByRole('textbox', { name: '-' });

    await expect(otpInputs).toHaveCount(6, { timeout: 10000 });

    for (let i = 0; i < otp.length; i++) {
      await otpInputs.nth(i).fill(otp[i]);
    }
  }

  async waitForManualOtpEntry(countryName) {
    const otpTimeout = 120000;

    console.log(`Enter OTP manually for ${countryName}. Waiting up to 2 minutes.`);

    try {
      await expect(this.verifyButton).toBeEnabled({ timeout: otpTimeout });
      return;
    } catch {
      console.log(`OTP not entered for ${countryName} in 2 minutes. Trying Resend OTP.`);
    }

    await this.resendOtp();

    console.log(`Enter resent OTP manually for ${countryName}. Waiting up to 2 more minutes.`);

    try {
      await expect(this.verifyButton).toBeEnabled({ timeout: otpTimeout });
    } catch {
      throw new Error(`OTP was not entered for ${countryName} after resend and 4 minutes total wait.`);
    }
  }

  async resendOtp() {
    await expect(this.resendOtpButton).toBeVisible({ timeout: 10000 });
    await this.resendOtpButton.scrollIntoViewIfNeeded();

    await this.validateApiResponsesDuring(
      () => this.resendOtpButton.click({ force: true }),
      'Resend OTP'
    );
  }

  async verifyOtp() {
    await this.validateApiResponsesDuring(
      () => this.verifyButton.click(),
      'Verify OTP'
    );

    if (await this.okayButton.isVisible({ timeout: 10000 }).catch(() => false)) {
      await this.okayButton.click();
    }
  }

  async validateApiResponsesDuring(action, actionName, requiredUrlPattern) {
    const apiResponses = [];
    const collectApiResponse = response => {
      const request = response.request();
      const resourceType = request.resourceType();
      const method = request.method();
      const url = response.url();

      if (
        method !== 'OPTIONS' &&
        ['fetch', 'xhr'].includes(resourceType) &&
        isApplicationApiUrl(url)
      ) {
        apiResponses.push(response);
      }
    };

    this.page.on('response', collectApiResponse);

    try {
      await action();
      await this.page.waitForTimeout(3000);
    } finally {
      this.page.off('response', collectApiResponse);
    }

    const responsesToValidate = requiredUrlPattern
      ? apiResponses.filter(response => requiredUrlPattern.test(response.url()))
      : apiResponses;

    if (requiredUrlPattern && responsesToValidate.length === 0) {
      throw new Error(`${actionName} API response was not received.`);
    }

    for (const response of responsesToValidate) {
      await validateApiResponse(response, actionName);
    }

    console.log(
  `${actionName} API statuses:`,
  responsesToValidate.map(response => response.status())
);
  }

  async completeJoinTheRide(user, countryName) {
    await this.acceptCookiesIfVisible();
    await this.fillForm(user, countryName);
    await this.acceptDisclaimer();
    await this.acceptCookiesIfVisible();
    await this.submit();
    await this.validateOtpScreen();
  }
}

function normalizeCountry(country) {
  return country.toLowerCase().replace(/[^a-z]/g, '');
}

function isSameCountry(option, countryName) {
  const optionValues = [
    option.label,
    option.value
  ].map(normalizeCountry);

  const countryValues = getCountryAliases(countryName);

  return optionValues.some(optionValue =>
    countryValues.some(countryValue =>
      optionValue === countryValue ||
      optionValue.includes(countryValue) ||
      countryValue.includes(optionValue)
    )
  );
}

function getCountryAliases(countryName) {
  const normalizedCountry = normalizeCountry(countryName);
  const aliases = {
    unitedstates: ['unitedstates', 'us', 'usa', 'unitedstatesofamerica'],
    unitedkingdom: ['unitedkingdom', 'uk', 'gb', 'greatbritain', 'britain'],
    germany: ['germany', 'de', 'deutschland'],
    italy: ['italy', 'it', 'italia'],
    spain: ['spain', 'es', 'espana'],
    france: ['france', 'fr'],
    india: ['india', 'in']
  };

  return aliases[normalizedCountry] || [normalizedCountry];
}

function buildCountryOptionPattern(countryName) {
  const aliases = getCountryAliases(countryName)
    .filter(alias => alias.length > 2)
    .map(alias => alias.replace(/([.*+?^${}()|[\]\\])/g, '\\$1'));

  const escapedCountryName = countryName.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');

  return new RegExp(`\\b(${[escapedCountryName, ...aliases].join('|')})\\b`, 'i');
}

function isApplicationApiUrl(url) {
  return (
    /flyingflea\.royalenfield\.com|royalenfield\.com/i.test(url) &&
    !/cookiebot|usercentrics|googletagmanager|google-analytics|doubleclick|facebook|hotjar|clarity/i.test(url)
  );
}

async function validateApiResponse(response, actionName) {
  const status = response.status();
  const url = response.url();

  if (status < 200 || status >= 300) {
    throw new Error(`${actionName} API failed with status ${status}: ${url}`);
  }

  const contentType = response.headers()['content-type'] || '';

  if (!contentType.includes('application/json')) {
    return;
  }

  let body;

  try {
    body = await response.json();
  } catch {
    return;
  }

  const bodyText = JSON.stringify(body).toLowerCase();
  const explicitFailure =
    body?.success === false ||
    body?.status === false ||
    body?.verified === false ||
    body?.valid === false;
  const errorMessage =
    bodyText.includes('invalid') ||
    bodyText.includes('incorrect') ||
    bodyText.includes('expired') ||
    bodyText.includes('failed') ||
    bodyText.includes('error');

  if (explicitFailure || errorMessage) {
    throw new Error(`${actionName} API returned failure payload: ${JSON.stringify(body)}`);
  }
}



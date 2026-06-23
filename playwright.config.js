// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',

  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
  name: 'account-check',
  testMatch: '**/accountCheck.setup.js',
  use: { ...devices['Desktop Chrome'] },
},
{
  name: 'account-delete',
  testMatch: '**/deleteAccount.setup.js',
  dependencies: ['account-check'],
  use: { ...devices['Desktop Chrome'] },
},
{
  name: 'account-signup',
  testMatch: '**/signup.spec.js',
  dependencies: ['account-delete'],
  use: { ...devices['Desktop Chrome'] },
},
{
  name: 'account-login',
  testMatch: '**/login.spec.js',
  dependencies: ['account-signup'],
  use: { ...devices['Desktop Chrome'] },
},
{
  name: 'join-the-ride',
  testMatch: '**/joinTheRide.spec.js',
  use: { ...devices['Desktop Chrome'] },
},
  ],
});
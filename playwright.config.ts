import { defineConfig, devices } from '@playwright/test';

// Browser suite: the built catalogue, axe in every theme, token coverage and the phone width.
export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env['CI'],
  reporter: process.env['CI'] ? 'line' : 'list',
  use: { baseURL: 'http://127.0.0.1:4300' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node e2e/serve.mjs',
    url: 'http://127.0.0.1:4300',
    reuseExistingServer: !process.env['CI'],
  },
});

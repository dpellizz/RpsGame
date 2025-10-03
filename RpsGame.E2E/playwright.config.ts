import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.FRONTEND_PORT ?? '5173';
const HOST = process.env.FRONTEND_HOST ?? '127.0.0.1';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {
    timeout: 5_000
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html']],
  use: {
    baseURL: process.env.BASE_URL ?? `http://${HOST}:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: `npm run dev -- --host ${HOST} --port ${PORT}`,
    cwd: '../RpsGame.React',
    url: `http://${HOST}:${PORT}`,
    reuseExistingServer: !process.env.CI,
    stdout: process.env.CI ? 'ignore' : 'pipe'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ]
});

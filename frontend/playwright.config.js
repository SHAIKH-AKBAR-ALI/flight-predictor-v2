import { defineConfig } from '@playwright/test'

// Backend (uvicorn on :8000) must already be running — the vite dev server
// proxies API routes to it. See CLAUDE.md for the backend dev command.
export default defineConfig({
  testDir: './tests',
  timeout: 300000,
  expect: { timeout: 90000 },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
})

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      cwd: './',
    },
    {
      command: process.platform === 'win32' 
        ? 'set DATABASE_URL=sqlite:///db.sqlite3&& ..\\.venv\\Scripts\\python.exe manage.py migrate && ..\\.venv\\Scripts\\python.exe manage.py seed_e2e_data && ..\\.venv\\Scripts\\python.exe manage.py runserver 8000' 
        : 'export DATABASE_URL=sqlite:///db.sqlite3 && python manage.py migrate && python manage.py seed_e2e_data && python manage.py runserver 8000',
      url: 'http://127.0.0.1:8000/admin/login/',
      reuseExistingServer: !process.env.CI,
      cwd: '../backend',
    }
  ],
});

module.exports = {
  apps: [
    {
      name: "backend.test",
      cwd: "./apps/backend",
      script: "npm",
      args: "run start",
      env: {
        PORT: 4001,
        NODE_ENV: "production",
        APP_ENV: "test",
        DATABASE_PATH: '/var/lib/test.eto-ne-e123x/database',
        CONTENT_PATH: '/var/lib/test.eto-ne-e123x/content',
        UPLOADS_PATH: '/var/lib/test.eto-ne-e123x/uploads'
      },
    },
    {
      name: "frontend.test",
      cwd: "./apps/frontend",
      script: "npm",
      args: "run start",
      env: {
        PORT: 3001,
        NODE_ENV: "production",
        APP_ENV: "test",
        INTERNAL_API_URL: "http://127.0.0.1:4001",
        VITE_API_PREFIX: '/api'
      },
    },
  ],
};

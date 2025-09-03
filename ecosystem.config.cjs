module.exports = {
  apps: [
    {
      name: "backend",
      cwd: "./apps/backend",
      script: "npm",
      args: "run start",
      env: {
        PORT: 4000,
        NODE_ENV: "production",
        APP_ENV: "production",
        DATABASE_PATH: '/var/lib/test.eto-ne-e123x/database',
        CONTENT_PATH: '/var/lib/test.eto-ne-e123x/content',
        UPLOADS_PATH: '/var/lib/test.eto-ne-e123x/uploads'
      },
    },
    {
      name: "frontend",
      cwd: "./apps/frontend",
      script: "npm",
      args: "run start",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
        APP_ENV: "production",
        INTERNAL_API_URL: "http://127.0.0.1:4000",
        VITE_API_PREFIX: "/api",
      },
    },
  ],
};

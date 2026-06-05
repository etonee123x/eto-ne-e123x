# CI/CD Setup (GitHub Actions + Server Deploy)

This repository now includes:

- CI workflow: .github/workflows/ci.yml
- CD production workflow: .github/workflows/deploy.yml
- CD test workflow: .github/workflows/deploy-test.yml

## What CI does

- Runs on pull requests
- Runs on pushes to main and test
- Validates backend, frontend, and contracts

## What CD (production) does

- Runs on pushes to main and manual trigger
- Re-runs quality checks
- Connects to your server via SSH
- Pulls latest code
- Installs dependencies
- Regenerates API types
- Builds frontend
- Restarts backend and frontend using PM2

## What CD (test) does

- Runs on pushes to test and manual trigger
- Re-runs quality checks
- Connects to your test server via SSH
- Pulls latest code
- Installs dependencies
- Regenerates API types
- Builds frontend
- Restarts backend and frontend test processes using PM2

## Required GitHub Secrets

Set these in repository settings, Secrets and variables, Actions:

Production secrets:

- SERVER_HOST
- SERVER_USER
- SERVER_SSH_KEY
- SERVER_PORT (optional, defaults to 22)
- DEPLOY_PATH (optional, defaults to $HOME/apps/eto-ne-e123x)
- DEPLOY_BRANCH (optional, defaults to main)
- BACKEND_PM2_NAME (optional, defaults to backend)
- FRONTEND_PM2_NAME (optional, defaults to frontend)

Test secrets:

- TEST_SERVER_HOST
- TEST_SERVER_USER
- TEST_SERVER_SSH_KEY
- TEST_SERVER_PORT (optional, defaults to 22)
- TEST_DEPLOY_PATH (optional, defaults to $HOME/apps/eto-ne-e123x-test)
- TEST_DEPLOY_BRANCH (optional, defaults to test)
- TEST_BACKEND_PM2_NAME (optional, defaults to backend-test)
- TEST_FRONTEND_PM2_NAME (optional, defaults to frontend-test)

## Server prerequisites

- Git installed
- Node.js and npm installed
- PM2 installed globally
- Repository cloned once at DEPLOY_PATH
- PM2 processes already created for backend and frontend

## One-time server bootstrap example

Use this example only as a template and adjust paths/commands for your server:

```bash
mkdir -p "$HOME/apps"
cd "$HOME/apps"
git clone <your-repo-url> eto-ne-e123x
cd eto-ne-e123x/apps/backend
npm ci
pm2 start npm --name backend -- run start
cd ../frontend
npm ci
npm run build
pm2 start npm --name frontend -- run start
pm2 save
```

## First run checklist

1. Add production and test secrets listed above.
2. Ensure both servers have valid env files for backend and frontend.
3. Push to main for production deploy or to test for test deploy, or run manually from Actions tab.
4. Verify PM2 status and app health endpoints on each target server.

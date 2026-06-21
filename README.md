# Pulse — AI-Powered PR Gatekeeper

Pulse is a GitHub App that reviews pull requests against your product intent and security expectations, then posts a structured result (`APPROVE`, `WARN`, or `BLOCK`) on the PR.

## Project Overview

When a PR is opened or updated, Pulse:

1. Receives a GitHub webhook event
2. Fetches the PR diff and metadata
3. Loads `PRODUCT_INTENT.md`
4. Sends context to AI for analysis
5. Posts a PR comment with rationale
6. Updates a GitHub Check Run status

## Tech Stack

- Node.js + Express
- GitHub App APIs via Octokit
- OpenRouter for AI analysis
- TypeScript support (`src/index.ts`)

## Setup and Run

### Prerequisites

- Node.js 18+
- A GitHub account and repository where the app will be installed
- OpenRouter API key
- ngrok (for local webhook forwarding)

### 1) Clone and install

```bash
git clone https://github.com/Harsh-mahadik999/plus-ai-bot--specailly-github-project-made-.git
cd plus-ai-bot--specailly-github-project-made-
npm install
```

### 2) Configure environment

Create `.env` from `.env.example` and update values:

```env
PORT=3000
GITHUB_APP_ID=your_app_id_here
GITHUB_WEBHOOK_SECRET=your_secret_here
GITHUB_PRIVATE_KEY_PATH=./private-key.pem
OPENROUTER_API_KEY=your_openrouter_key_here
PULSE_LICENSE_ENFORCEMENT=false
PULSE_LICENSE_KEY=your_private_license_key_here
PULSE_LICENSE_KEY_SHA256=sha256_hash_of_the_license_key
```

> Never commit `.env` or `private-key.pem`.

### 3) Create and install GitHub App

Use <https://github.com/settings/apps/new> and configure:

- **Webhook URL:** `https://<your-ngrok-subdomain>.ngrok-free.app/webhook`
- **Webhook secret:** same as `GITHUB_WEBHOOK_SECRET`
- **Permissions:**
  - Pull requests: Read & Write
  - Checks: Read & Write
  - Contents: Read
- **Events:** Pull request

Install the app on the repository you want Pulse to analyze.

### 4) Define product intent

Create `PRODUCT_INTENT.md` in the target repository root. Example:

```md
# Product Intent

## Core Principles
- Prioritize user privacy and minimal data collection
- Avoid third-party tracking or analytics
- Keep the app fast and lightweight
```

### 5) Start local services

In one terminal:

```bash
ngrok http 3000
```

In another terminal (recommended for development):

```bash
npm run dev
```

Production-like run:

```bash
npm run build
npm start
```

## Testing the Flow

1. Open a test PR in a repository where your GitHub App is installed.
2. Push a commit to trigger `pull_request` webhook events.
3. Confirm Pulse posts analysis comments and updates the check run.

## Contributing

Contributions are welcome.

1. Create a new branch from the latest default branch.
2. Make focused, reviewable changes.
3. Run relevant checks locally (`npm run build` at minimum).
4. Open a pull request with:
   - What changed
   - Why it changed
   - How it was tested

## Security Notes

- Keep GitHub App private key and API keys out of source control.
- Rotate secrets if they are ever exposed.
- Enable webhook secret validation in all deployments.

## License

This project is licensed under the [MIT License](./LICENSE).

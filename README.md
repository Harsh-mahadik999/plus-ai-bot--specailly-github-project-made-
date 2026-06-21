# 🔵 Pulse — AI-Powered PR Gatekeeper yeahhh brushhh it is !!!! yess

> Pulse is a GitHub App that automatically analyzes every Pull Request using AI — checking intent alignment, security risk, and code quality — then posts a structured decision (APPROVE / WARN / BLOCK).

---

## 🚀 What Pulse Does

When a PR is opened or updated on your repo, Pulse:

1. **Receives the webhook** from GitHub instantly
2. **Fetches the actual code diff** — real files, real changes
3. **Reads your `PRODUCT_INTENT.md`** — your product's goals and rules
4. **Sends everything to AI** — analyzes alignment + security
5. **Posts a structured comment** on the PR with full analysis
6. **Creates a GitHub Check Run** — ✅ green / ⚠️ neutral / ❌ red on the PR

---

## 📸 Example Output

```
🔵 FeaturePulse Analysis

Decision: ❌ BLOCK

Product Intent Alignment: 25%
Detected Feature: Adds Google Analytics tracking to the app
- ❌ Conflicts with: "Avoid third-party tracking or analytics"
- 💡 Recommendation: Consider self-hosted analytics like Plausible or PostHog

Security Risk: 🟡 MEDIUM
- 🔒 Sensitive modules touched: user tracking, third-party scripts
- ✅ No vulnerabilities detected

Scope: 1 file(s) changed · +50 / -0 lines

Reasoning: The PR introduces third-party analytics which conflicts with the
product's privacy-first intent. Security risk is medium due to external scripts.

---
Pulse AI • Override by commenting `/pulse override` (requires admin)
```

---

## 🏗️ How It Works

```
GitHub Repo
    │
    │  PR opened/updated (webhook)
    ▼
Pulse Server (Node.js)
    │
    ├── 1. Create GitHub Check Run (in progress)
    ├── 2. Post "analyzing..." comment
    ├── 3. Fetch PR diff (real files + patches)
    ├── 4. Load PRODUCT_INTENT.md
    ├── 5. Send to AI (OpenRouter / GPT-3.5)
    ├── 6. Apply decision logic (FR-5.1)
    ├── 7. Post full analysis comment
    └── 8. Update Check Run (✅ / ⚠️ / ❌)
```

### Decision Logic

| Condition | Decision |
|---|---|
| Security = CRITICAL | BLOCK |
| Security = HIGH and Intent < 70% | BLOCK |
| Intent < 50% | BLOCK |
| Security = MEDIUM or Intent < 80% | WARN |
| Everything else | APPROVE |

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (CommonJS)
- **Framework:** Express.js
- **GitHub API:** @octokit/rest
- **AI:** OpenRouter API (GPT-3.5-turbo)
- **Auth:** GitHub App JWT + Installation Tokens
- **Tunnel (dev):** ngrok

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js v18+
- A GitHub Account
- An OpenRouter API key → [openrouter.ai](https://openrouter.ai)
- ngrok (for local development) → [ngrok.com](https://ngrok.com)

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/Harsh-mahadik999/plus-ai-bot--specailly-github-project-made-.git
cd plus-ai-bot--specailly-github-project-made-
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Create your `.env` file

Create a file called `.env` in the root of the project:

```env
PORT=3000
GITHUB_APP_ID=your_github_app_id
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_PRIVATE_KEY_PATH=./private-key.pem
OPENROUTER_API_KEY=your_openrouter_api_key
PULSE_LICENSE_ENFORCEMENT=false
PULSE_LICENSE_KEY=your_private_license_key
PULSE_LICENSE_KEY_SHA256=sha256_hash_of_your_private_license_key
```

> ⚠️ Never commit your `.env` file. It's already in `.gitignore`.

### Step 4 — Create a GitHub App

1. Go to [github.com/settings/apps/new](https://github.com/settings/apps/new)
2. Fill in:
   - **App Name:** anything you like
   - **Homepage URL:** `http://localhost:3000`
   - **Webhook URL:** your ngrok URL + `/webhook` (e.g. `https://xxxx.ngrok-free.app/webhook`)
   - **Webhook Secret:** same value as `GITHUB_WEBHOOK_SECRET` in your `.env`
3. Set **Permissions:**
   - Pull requests: **Read & Write**
   - Checks: **Read & Write**
   - Contents: **Read**
4. Subscribe to events: **Pull request**
5. Click **Create GitHub App**
6. Note your **App ID** → put in `.env`
7. Generate a **Private Key** → download and save as `private-key.pem` in project root

### Step 5 — Install the GitHub App on your repo

1. Go to your GitHub App settings
2. Click **Install App**
3. Select the repo you want Pulse to analyze

### Step 6 — Create your `PRODUCT_INTENT.md`

This is the most important file — it tells Pulse what your product should and shouldn't do:

```markdown
# Product Intent

## Core Principles
- Prioritize user privacy and minimal data collection
- Avoid third-party tracking or analytics
- Keep the app fast and lightweight

## What We Are Building
A privacy-focused SaaS tool for developers.

## What We Are NOT Building
- No admin dashboards in this phase
- No social features
```

Place this file in the **root of the repo you want Pulse to analyze** (not the Pulse app itself).

### Step 7 — Start ngrok

```bash
ngrok http 3000
```

Copy the `https://xxxx.ngrok-free.app` URL and update it in your GitHub App webhook settings.

### Step 8 — Start Pulse

```bash
npx kill-port 3000 && node src/index.js
```

You should see:
```
✅ PRODUCT_INTENT.md loaded
🚀 Pulse server running on port 3000
```

---

## 🧪 Testing

1. Go to your test repo on GitHub
2. Create a new branch
3. Make any change (even edit README)
4. Open a Pull Request
5. Watch Pulse analyze it in real time!

---

## 📁 Project Structure

```
pulse-app/
├── src/
│   └── index.js          # Main server — all the logic
├── PRODUCT_INTENT.md     # Your product goals (edit this!)
├── .env                  # Secrets — never commit! (not in repo)
├── .env.example          # Template for .env
├── private-key.pem       # GitHub App key — never commit! (not in repo)
├── package.json
├── LICENSE               # Project license
└── README.md
```

---

## 🔐 Security

- `.env` and `private-key.pem` are in `.gitignore` and never pushed
- All GitHub API calls use short-lived installation tokens
- Webhook secret validates all incoming GitHub events

### Runtime License Enforcement (optional)

To protect production usage, you can enforce a runtime license check:

- Set `PULSE_LICENSE_ENFORCEMENT=true`
- Set `PULSE_LICENSE_KEY` to your private runtime key
- Set `PULSE_LICENSE_KEY_SHA256` to the SHA-256 hash of that exact key

Example hash generation:

```bash
node -e "console.log(require('crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" "your_private_license_key"
```

When enforcement is enabled and the key is invalid (or missing), Pulse exits at startup.

---

## 🗺️ Roadmap

- [x] Webhook receiver
- [x] PR diff fetching
- [x] PRODUCT_INTENT alignment scoring
- [x] AI analysis (GPT-3.5)
- [x] GitHub Check Run (✅/⚠️/❌)
- [x] Structured PR comments
- [ ] Webhook signature verification
- [ ] Dependency vulnerability scanning (OSV)
- [ ] Advisory / Gatekeeper / Auto-Approve modes
- [ ] `/pulse override` command
- [ ] Deploy to Railway/Render (permanent URL)

---

## 👥 Contributing

We welcome contributions! Please follow the guidelines below:

### How to Contribute

1. **Open an Issue First**
   - Check [existing issues](../../issues) to avoid duplicates
   - Describe the feature, bug, or improvement clearly
   - Wait for admin review and approval before starting work

2. **Admin Assignment**
   - After issue approval, the project admin will assign it to you
   - Admin will confirm the scope and approach

3. **Create Your Feature Branch**
   - Once assigned, create a new branch from the latest `main`:
     ```bash
     git checkout main
     git pull origin main
     git checkout -b feature/your-feature-name
     ```
   - Use a clear branch naming convention:
     - `feature/` for new features
     - `bugfix/` for bug fixes
     - `docs/` for documentation updates
     - `refactor/` for code refactoring

4. **Make Your Changes**
   - Write clean, well-commented code
   - Follow the existing code style
   - Test your changes thoroughly

5. **Submit a Pull Request**
   - Link the PR to the related issue: `Closes #<issue-number>`
   - Provide a clear description of changes
   - Wait for code review and approval

6. **Review & Merge**
   - Address feedback from reviewers
   - Once approved and all checks pass, your PR will be merged

### Code of Conduct

- Be respectful and constructive
- Provide thoughtful feedback
- Help others succeed in their contributions
- Report any abusive behavior to the maintainers

### Development Setup

See [⚙️ Setup & Installation](#-setup--installation) above for local development instructions.

---

## 📄 License

This repository is **proprietary** and released under an **All Rights Reserved** license.

See [LICENSE](./LICENSE) for full terms. Unauthorized copying, modification,
distribution, or commercial use is prohibited without explicit written permission
from the copyright holder.

---

## 🤝 Support

- 📧 **Email:** (contact info to be added)
- 🐛 **Issues:** [GitHub Issues](../../issues)
- 💬 **Discussions:** [GitHub Discussions](../../discussions)

---

## 👨‍💻 Built By

**Harsh Mahadik** — built for hackathon 🚀

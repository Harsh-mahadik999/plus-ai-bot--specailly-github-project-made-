// Copyright (c) 2026 Harsh Mahadik. All rights reserved.
const express = require('express')
const fs = require('fs')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { Octokit } = require('@octokit/rest')
require('dotenv').config()

const app = express()
app.use(express.json())

// ─── Runtime License Guard (optional) ──────────────────────────────────────────
function enforceRuntimeLicense() {
  const enforcementEnabled = process.env.PULSE_LICENSE_ENFORCEMENT === 'true'
  if (!enforcementEnabled) return true

  const licenseKey = process.env.PULSE_LICENSE_KEY?.trim()
  const expectedHash = process.env.PULSE_LICENSE_KEY_SHA256?.trim().toLowerCase()

  if (!licenseKey || !expectedHash) {
    console.error('❌ License enforcement is enabled, but license configuration is missing.')
    return false
  }

  if (!/^[a-f0-9]{64}$/.test(expectedHash)) {
    console.error('❌ PULSE_LICENSE_KEY_SHA256 must be a valid 64-char SHA-256 hex string.')
    return false
  }

  const actualHash = crypto.createHash('sha256').update(licenseKey).digest('hex')
  const isValid =
    actualHash.length === expectedHash.length &&
    crypto.timingSafeEqual(Buffer.from(actualHash, 'utf8'), Buffer.from(expectedHash, 'utf8'))

  if (!isValid) {
    console.error('❌ Invalid runtime license key. Protected mode startup denied.')
    return false
  }

  console.log('✅ Runtime license validated.')
  return true
}

// ─── Private Key + App ID ────────────────────────────────────────────────────
let privateKey = fs.readFileSync(process.env.GITHUB_PRIVATE_KEY_PATH, 'utf8')
privateKey = privateKey.replace(/\\n/g, '\n').trim()
const appId = process.env.GITHUB_APP_ID // STRING, not Number()

// ─── Load PRODUCT_INTENT ─────────────────────────────────────────────────────
function loadProductIntent() {
  try {
    const raw = fs.readFileSync('./PRODUCT_INTENT.md', 'utf8')
    console.log('✅ PRODUCT_INTENT.md loaded')
    return raw.trim()
  } catch (e) {
    console.warn('⚠️  PRODUCT_INTENT.md not found — using default intent')
    return `- Build high-quality, maintainable software\n- Prioritize security and reliability\n- Avoid unnecessary dependencies`
  }
}

// ─── JWT ─────────────────────────────────────────────────────────────────────
function generateJWT() {
  const now = Math.floor(Date.now() / 1000)
  const payload = { iat: now - 60, exp: now + 500, iss: appId }
  console.log('🔑 Generating JWT | iss:', appId)
  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' })
  console.log('✅ JWT OK:', token.substring(0, 40) + '...')
  return token
}

// ─── Installation Token ───────────────────────────────────────────────────────
async function getInstallationToken(installationId) {
  const jwtToken = generateJWT()
  const response = await axios.post(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {},
    {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
  return response.data.token
}

// ─── Fetch PR Diff ────────────────────────────────────────────────────────────
async function fetchPRDiff(octokit, owner, repo, pullNumber) {
  try {
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner, repo, pull_number: pullNumber
    })

    const summary = files.map(f => {
      return `File: ${f.filename} | Status: ${f.status} | +${f.additions} -${f.deletions}\n${
        f.patch ? f.patch.substring(0, 500) : '(binary or no patch)'
      }`
    }).join('\n\n---\n\n')

    console.log(`📂 Fetched diff: ${files.length} files changed`)
    return {
      fileCount: files.length,
      files: files.map(f => f.filename),
      additions: files.reduce((s, f) => s + f.additions, 0),
      deletions: files.reduce((s, f) => s + f.deletions, 0),
      diffSummary: summary.substring(0, 3000)
    }
  } catch (err) {
    console.error('❌ Failed to fetch PR diff:', err.message)
    return { fileCount: 0, files: [], additions: 0, deletions: 0, diffSummary: 'Could not fetch diff.' }
  }
}

// ─── GitHub Check Run ─────────────────────────────────────────────────────────
async function createCheckRun(octokit, owner, repo, headSha) {
  const { data } = await octokit.rest.checks.create({
    owner, repo,
    name: 'Pulse Analysis',
    head_sha: headSha,
    status: 'in_progress',
    started_at: new Date().toISOString()
  })
  console.log('✅ Check run created, ID:', data.id)
  return data.id
}

async function updateCheckRun(octokit, owner, repo, checkRunId, decision, summary, details) {
  const conclusionMap = { APPROVE: 'success', WARN: 'neutral', BLOCK: 'failure' }
  const conclusion = conclusionMap[decision] || 'neutral'

  await octokit.rest.checks.update({
    owner, repo,
    check_run_id: checkRunId,
    status: 'completed',
    conclusion,
    completed_at: new Date().toISOString(),
    output: {
      title: `Pulse — ${decision}`,
      summary,
      text: details
    }
  })
  console.log(`✅ Check run updated: ${decision} → ${conclusion}`)
}

// ─── Decision Logic (FR-5.1) ──────────────────────────────────────────────────
function makeDecision(intentScore, securityRisk) {
  if (securityRisk === 'CRITICAL') return 'BLOCK'
  if (securityRisk === 'HIGH' && intentScore < 70) return 'BLOCK'
  if (intentScore < 50) return 'BLOCK'
  if (securityRisk === 'MEDIUM' || intentScore < 80) return 'WARN'
  return 'APPROVE'
}

// ─── AI Analysis ──────────────────────────────────────────────────────────────
async function analyzeWithAI(pr, diff, productIntent) {
  const prompt = `You are Pulse, an AI PR analyzer. Analyze this pull request against the product intent and return ONLY valid JSON.

## Product Intent
${productIntent}

## PR Details
Title: "${pr.title}"
Description: "${pr.body || 'none'}"
Files changed (${diff.fileCount}): ${diff.files.join(', ')}
Lines added: ${diff.additions}, Lines removed: ${diff.deletions}

## Code Diff (truncated)
${diff.diffSummary}

## Instructions
Respond ONLY with this exact JSON (no markdown, no extra text):
{
  "intentScore": <0-100>,
  "securityRisk": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "detectedFeature": "<one sentence: what this PR does>",
  "alignsWith": "<intent statement it supports, or 'none'>",
  "conflictsWith": "<intent statement it conflicts with, or 'none'>",
  "vulnerabilities": "<security concerns found, or 'none'>",
  "sensitiveModules": "<sensitive files touched, or 'none'>",
  "recommendation": "<specific actionable advice>",
  "reasoning": "<2-3 sentences explaining the decision>"
}`

  const aiRes = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://pulse-app.dev',
        'X-Title': 'Pulse'
      }
    }
  )

  const text = aiRes.data.choices[0].message.content.trim()
  console.log('🤖 AI raw response:', text)

  try {
    return JSON.parse(text.match(/\{[\s\S]*\}/)[0])
  } catch (e) {
    console.warn('⚠️ AI JSON parse failed, using fallback')
    return {
      intentScore: 60,
      securityRisk: 'LOW',
      detectedFeature: 'Could not parse AI response',
      alignsWith: 'unknown',
      conflictsWith: 'none',
      vulnerabilities: 'none',
      sensitiveModules: 'none',
      recommendation: 'Review this PR manually',
      reasoning: 'AI analysis failed to parse.'
    }
  }
}

// ─── Format PR Comment (FR-6.2) ───────────────────────────────────────────────
function formatComment(decision, result, diff) {
  const emojiMap = { APPROVE: '✅', WARN: '⚠️', BLOCK: '❌' }
  const riskEmoji = { LOW: '🟢', MEDIUM: '🟡', HIGH: '🟠', CRITICAL: '🔴' }
  const emoji = emojiMap[decision] || '⚠️'
  const risk = riskEmoji[result.securityRisk] || '🟡'

  return `## 🔵 FeaturePulse Analysis

**Decision: ${emoji} ${decision}**

**Product Intent Alignment: ${result.intentScore}%**
Detected Feature: ${result.detectedFeature}
${result.alignsWith !== 'none' ? `- ✅ Aligns with: "${result.alignsWith}"` : ''}
${result.conflictsWith !== 'none' ? `- ❌ Conflicts with: "${result.conflictsWith}"` : ''}
- 💡 Recommendation: ${result.recommendation}

**Security Risk: ${risk} ${result.securityRisk}**
${result.sensitiveModules !== 'none' ? `- 🔒 Sensitive modules touched: ${result.sensitiveModules}` : '- 🔒 No sensitive modules touched'}
${result.vulnerabilities !== 'none' ? `- 🚨 Concerns: ${result.vulnerabilities}` : '- ✅ No vulnerabilities detected'}

**Scope:** ${diff.fileCount} file(s) changed · +${diff.additions} / -${diff.deletions} lines

**Reasoning:** ${result.reasoning}

---
_Pulse AI • Override by commenting \`/pulse override\` (requires admin)_`
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'Pulse is running! 🔵',
    message: 'AI-powered PR gatekeeper ready'
  })
})

app.post('/webhook', async (req, res) => {
  const event = req.headers['x-github-event']
  const action = req.body?.action

  console.log('\n=== GitHub Event Received ===')
  console.log('Event:', event)
  console.log('Action:', action)
  console.log('PR Title:', req.body?.pull_request?.title || 'N/A')

  if (event !== 'pull_request' || !['opened', 'synchronize'].includes(action)) {
    return res.json({ received: true, processed: false })
  }

  res.json({ received: true }) // Respond to GitHub immediately

  const pr = req.body.pull_request
  const repo = req.body.repository
  const installationId = req.body.installation?.id
  const owner = repo.owner.login
  const repoName = repo.name
  const headSha = pr.head.sha

  console.log(`\n🔍 Analyzing PR #${pr.number}: "${pr.title}"`)
  console.log('Installation ID:', installationId)

  let checkRunId = null
  let token = null

  try {
    token = await getInstallationToken(installationId)
    const octokit = new Octokit({ auth: token })

    // 1. Create Check Run — shows "in progress" on the PR
    checkRunId = await createCheckRun(octokit, owner, repoName, headSha)

    // 2. Post "analyzing" comment
    await octokit.rest.issues.createComment({
      owner, repo: repoName, issue_number: pr.number,
      body: '## 🔵 Pulse is analyzing your PR...\n\n_Fetching diff · Checking intent alignment · Scanning security..._'
    })
    console.log('✅ Posted analyzing comment')

    // 3. Fetch actual PR diff
    const diff = await fetchPRDiff(octokit, owner, repoName, pr.number)

    // 4. Load PRODUCT_INTENT
    const productIntent = loadProductIntent()

    // 5. AI analysis with real diff + intent
    console.log('🤖 Sending to AI...')
    const aiResult = await analyzeWithAI(pr, diff, productIntent)
    console.log('📊 Intent Score:', aiResult.intentScore, '| Security Risk:', aiResult.securityRisk)

    // 6. Decision logic (FR-5.1)
    const decision = makeDecision(aiResult.intentScore, aiResult.securityRisk)
    console.log('⚖️  Decision:', decision)

    // 7. Post full analysis comment (FR-6.2)
    const commentBody = formatComment(decision, aiResult, diff)
    await octokit.rest.issues.createComment({
      owner, repo: repoName, issue_number: pr.number,
      body: commentBody
    })
    console.log('✅ Posted full analysis comment')

    // 8. Update Check Run with final result (FR-6.1)
    await updateCheckRun(
      octokit, owner, repoName, checkRunId,
      decision,
      `Intent Alignment: ${aiResult.intentScore}% | Security: ${aiResult.securityRisk}`,
      aiResult.reasoning
    )

    console.log('🎉 DONE! Full Pulse analysis complete.')

  } catch (err) {
    console.error('❌ ERROR:', err.message)
    if (err.response?.data) console.error(JSON.stringify(err.response.data))

    // Mark check run as failed if it was created
    if (checkRunId && token) {
      try {
        const octokit = new Octokit({ auth: token })
        await updateCheckRun(octokit, owner, repoName, checkRunId, 'WARN',
          'Pulse encountered an error during analysis', err.message)
      } catch (e2) {
        console.error('❌ Could not update failed check run:', e2.message)
      }
    }
  }
})

const PORT = process.env.PORT || 3000
if (!enforceRuntimeLicense()) process.exit(1)
app.listen(PORT, () => {
  console.log(`🚀 Pulse server running on port ${PORT}`)
})
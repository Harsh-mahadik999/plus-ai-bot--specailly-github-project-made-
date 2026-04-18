# Product Intent

This file defines the product vision and constraints for this repository.
Pulse uses this to evaluate whether incoming PRs align with the product direction.

## Core Principles

- Prioritize code quality and maintainability over speed of delivery
- Every PR must have a clear, single responsibility
- Avoid adding new dependencies unless absolutely necessary
- All changes touching authentication, payments, or user data require extra scrutiny
- Prefer simple, readable solutions over clever or complex ones

## What We Are Building

A developer tool (GitHub App) that analyzes pull requests using AI and provides
structured feedback on intent alignment, security risk, and code quality.

## What We Are NOT Building (MVP Scope)

- No dashboard or web UI in this phase
- No database or persistent storage
- No support for GitLab or Bitbucket yet
- No user authentication system

## Security Rules

- Never commit secrets, API keys, or credentials
- All external API calls must use HTTPS
- Validate all webhook payloads before processing
- Do not log sensitive user data
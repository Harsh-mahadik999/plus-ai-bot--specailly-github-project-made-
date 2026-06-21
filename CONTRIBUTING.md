# Contributing to Pulse

Thank you for your interest in contributing to Pulse! 🎉

We appreciate your effort in helping improve this project. Please follow the guidelines below to ensure a smooth contribution process.

---

## 📋 Contribution Workflow

### Step 1: Check Existing Issues
- Visit the [Issues page](../../issues)
- Search for similar issues to avoid duplicates
- If your idea doesn't exist, proceed to Step 2

### Step 2: Create an Issue
- Click "New Issue"
- Provide a clear title and description
- Include:
  - **What:** What feature, bug fix, or improvement?
  - **Why:** Why is this important?
  - **How:** If you have a suggestion, how should it be implemented?
- Labels will be added by maintainers

### Step 3: Wait for Admin Review
- The project admin will review your issue
- They may ask clarifying questions or suggest changes
- Once approved, the issue is ready for work

### Step 4: Admin Assignment
- After approval, the admin will assign the issue to you
- This confirms you're the one working on it
- Check the issue for any additional notes or constraints

### Step 5: Create Your Branch
Once assigned, create a feature branch:

```bash
# Get the latest code
git checkout main
git pull origin main

# Create your branch with a clear name
git checkout -b feature/issue-#123-short-description
```

**Branch naming conventions:**
- `feature/` — new features
- `bugfix/` — bug fixes
- `docs/` — documentation updates
- `refactor/` — code refactoring
- `chore/` — maintenance tasks

### Step 6: Make Your Changes
- Write clean, readable code
- Follow the existing code style
- Add comments where needed
- Test your changes thoroughly
- Keep commits atomic and descriptive

### Step 7: Submit Your Pull Request
```bash
git push origin feature/your-branch-name
```

In the PR description:
- Reference the issue: `Closes #<issue-number>`
- Explain what changes you made
- Note any testing you performed
- Mention if there are any breaking changes

**Example PR title:**
```
feat: add webhook signature verification (closes #42)
```

### Step 8: Address Feedback
- Review comments from maintainers
- Make requested changes
- Push updates to the same branch
- Re-request review once done

### Step 9: Merge
- Once approved and all checks pass, your PR will be merged
- Your contribution is now part of Pulse! 🚀

---

## 💡 Code Style Guidelines

- **Formatting:** Use consistent indentation (2 spaces for JavaScript)
- **Naming:** Use camelCase for variables/functions, PascalCase for classes
- **Comments:** Document complex logic and public APIs
- **Errors:** Include meaningful error messages
- **Testing:** Test edge cases and error conditions

---

## 🐛 Reporting Bugs

When creating a bug report, include:
1. **Steps to reproduce** — clear, step-by-step instructions
2. **Expected behavior** — what should happen
3. **Actual behavior** — what actually happened
4. **Environment** — OS, Node.js version, etc.
5. **Screenshots/logs** — if applicable

---

## ✨ Feature Requests

When suggesting a feature:
1. **Use case** — who needs this and why?
2. **Current workaround** — is there a way to do it now?
3. **Implementation idea** — how might this work?
4. **Impact** — does this affect other features?

---

## 📚 Getting Help

- **Questions?** Check existing discussions
- **Stuck?** Comment on your assigned issue
- **Ideas?** Open a discussion before creating an issue

---

## 🎯 Code of Conduct

- Be respectful and constructive
- Welcome diverse perspectives
- Give credit where it's due
- Help others succeed
- Report misconduct to maintainers

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the same **All Rights Reserved** license as this project.

---

## Questions?

- 📧 Open a discussion in the repo
- 🐛 Create an issue for bugs or features
- 💬 Comment on related issues

Thank you for contributing to Pulse! 💙

# Contributing to Thread Trade

Thank you for your interest in contributing! 🧵 Whether it's a bug fix, new feature, or documentation improvement — all contributions are welcome.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

Be respectful, inclusive, and constructive. Harassment of any kind will not be tolerated.

---

## Getting Started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/thread-trade.git
   cd thread-trade
   ```
3. Set up the project locally using the [Quick Start guide](README.md#-quick-start)
4. Create a new branch for your work (see [Branch Naming](#branch-naming))

---

## How to Contribute

### 🐛 Bug Fixes
1. Open an issue first describing the bug (unless it's trivial)
2. Create a branch: `fix/short-description`
3. Write the fix, test it locally
4. Open a PR referencing the issue

### ✨ New Features
1. Open a **Feature Request** issue first so we can discuss scope
2. Wait for approval before writing code (saves your time)
3. Create a branch: `feat/short-description`
4. Open a PR with screenshots/demo if it's a UI change

### 📚 Documentation
1. Branch: `docs/short-description`
2. Update or add markdown files as needed
3. Open a PR — no issue required for doc-only changes

---

## Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Bug fix | `fix/issue-description` | `fix/chat-not-loading` |
| New feature | `feat/feature-name` | `feat/dark-mode` |
| Documentation | `docs/what-changed` | `docs/api-reference` |
| Refactor | `refactor/what-changed` | `refactor/auth-middleware` |
| Chore | `chore/what-changed` | `chore/update-deps` |

---

## Commit Messages

Follow **Conventional Commits** format:

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure, no feature/fix |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies |

**Examples:**
```
feat(chat): add typing indicator timeout
fix(auth): refresh token not cleared on logout
docs(readme): add docker compose instructions
```

---

## Pull Request Process

1. Ensure your branch is up to date with `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. Run and verify nothing is broken locally
3. Fill out the **PR template** completely
4. Request a review — PRs are merged after at least one approval
5. Squash commits if there are many small "fixup" commits

---

## Code Style

### Backend (Node.js)
- Use `const`/`let`, never `var`
- `async/await` over promise chains
- All controllers must use `asyncHandler` wrapper
- All new routes must go through the `validate(schema)` middleware
- No raw `console.log` — use the Winston `logger` from `src/config/logger.js`

### Frontend (React)
- Functional components only — no class components
- Use Tailwind utility classes — avoid inline styles
- Responsive-first: all new UI must work on mobile (375px+)
- Keep components in `src/components/` if reused across pages
- Keep page-level components in `src/pages/`

### General
- No hardcoded secrets or API URLs — use `.env` variables
- Always handle loading and error states in UI components
- Add `// TODO:` comments for intentional stubs

---

## Reporting Bugs

Please use the [Bug Report issue template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- **What happened** vs **what you expected**
- Steps to reproduce
- Browser, OS, screen size (for UI bugs)
- Console errors (F12 → Console tab)
- Network tab screenshot if it's an API issue

---

## Suggesting Features

Use the [Feature Request issue template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- The problem you're trying to solve
- Your proposed solution
- Any alternatives you considered
- Whether you're willing to implement it yourself

---

## 🙏 Thank You

Every contribution, no matter how small, makes Thread Trade better. We appreciate your time!

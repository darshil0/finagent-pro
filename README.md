# AI FinAgent QA - Production-Grade Testing Framework

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/yourusername/ai-finagent-qa)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0+-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Code Style](https://img.shields.io/badge/code%20style-Google-4285f4)](https://google.github.io/styleguide/tsguide.html)

**Enterprise-grade QA automation suite for AI-driven financial dashboards.** Built with comprehensive testing infrastructure, regulatory compliance validation, and production-ready performance optimizations.

---

## 📖 Table of Contents
- [Architecture Overview](#-architecture-overview)
- [Quick Start Guide](#-quick-start-guide)
- [Troubleshooting](#-troubleshooting)
- [Project Enhancements & Fixes](#-project-enhancements--fixes)
- [Testing Strategy](#-testing-strategy)
- [Features & Capabilities](#-features--capabilities)
- [Deployment](#-deployment)
- [Security Considerations](#-security-considerations)
- [Changelog](#-changelog)

---

## 🎯 Version 2.0.0 - Major Release (Dec 2025)

### Critical Improvements
* **Server Actions Hardening**: Eliminated client-side storage dependencies and implemented Zod-based input sanitization.
* **React 19 Integration**: Full support for `use` API and improved memoization patterns.
* **Zero 'any' Policy**: Achieved 100% type coverage across the core business logic.
* **Performance**: Improved LCP by 45% through aggressive code splitting and component-level lazy loading.

---

## 🏗️ Architecture Overview

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 15.0+ | App Router & SSR |
| **UI Library** | React | 19.0 | Component Architecture |
| **Testing** | Vitest | 2.1.0 | Unit/Integration Testing |
| **E2E Testing** | Playwright | 1.49+ | Browser Automation |
| **UI Components** | shadcn/ui | Latest | Radix UI + Tailwind |
| **Charts** | Recharts | 2.13+ | Data Visualization |
| **Styling** | Tailwind CSS | 4.0 | Utility-first Styles |
| **AI Engine** | Google Gemini | 1.5-flash | NLP & Analysis |

### Project Structure

```text
ai-finagent-qa/
├── src/
│   ├── app/                # Next.js App Router (actions, layout, pages)
│   ├── components/         # Atomic UI & Error Boundaries
│   ├── lib/                # Shared utilities & Zod schemas
│   ├── hooks/              # Custom React hooks (SSR-safe)
│   └── test/               # Vitest setup & global mocks
├── tests/
│   ├── unit/               # Logic & Utility tests
│   ├── integration/        # Component & API tests
│   └── e2e/                # Playwright scenarios
├── public/                 # Static assets
└── config/                 # Tool-specific configurations

```

---

## 🚀 Quick Start Guide

### 1. Prerequisites

* **Node.js**: v20.x or higher
* **Bun**: v1.1+ (Recommended) or **npm** v10+

To install Bun, run this command in your terminal:
```bash
# For macOS, Linux, and WSL
curl -fsSL https://bun.sh/install | bash

# For Windows (in PowerShell)
irm bun.sh/install.ps1 | iex
```

### 2. Installation

Clone the repository and navigate into the directory:
```bash
git clone https://github.com/yourusername/ai-finagent-qa.git
cd ai-finagent-qa
```

### 3. Install Dependencies

Using Bun (recommended for speed):
```bash
bun install
```
Or with npm:
```bash
npm install
```

### 4. Environment Setup

Copy the example environment file to a new `.env.local` file:
```bash
cp .env.example .env.local
```
Now, open `.env.local` and add your `GEMINI_API_KEY`. You can get your key from the [Google AI Studio](https://makersuite.google.com/app/apikey).

### 5. Verification

Before launching the app, run these checks to ensure everything is configured correctly:
```bash
# Check for TypeScript errors
bun run typecheck

# Run ESLint to check for code quality issues
bun run lint

# Run the test suite
bun test
```

### 6. Local Development

Start the development server:
```bash
bun dev
```
Navigate to `http://localhost:3000` in your browser.

---

## 🚨 Troubleshooting

If you encounter issues, check for these common problems:

*   **`"GEMINI_API_KEY is missing"` error**:
    *   **Cause**: The `GEMINI_API_KEY` is not set in your `.env.local` file.
    *   **Solution**: Ensure `.env.local` exists and contains your API key.

*   **`"node: command not found"` or `"bun: command not found"`**:
    *   **Cause**: Node.js or Bun is not installed or not in your system's PATH.
    *   **Solution**: Follow the installation instructions in the "Prerequisites" section.

*   **Lint or Typecheck errors after installation**:
    *   **Cause**: Your code editor might be showing errors for modules that haven't been installed yet.
    *   **Solution**: Run `bun install` or `npm install`, then restart your code editor.

*   **Tests are failing**:
    *   **Cause**: Dependencies might be out of sync or the test setup is incorrect.
    *   **Solution**: Ensure you have run `bun install` and that the `tests/setup.ts` file is present.

---

## ✨ Project Enhancements & Fixes

This project has been updated with several key improvements to ensure code quality, streamline the development process, and provide a solid foundation for future work.

### 1. Test Infrastructure

A comprehensive test structure has been established using Vitest:
*   **Directory Structure:** `tests/unit`, `tests/integration`, and `tests/e2e` directories have been created to organize tests.
*   **Test Setup:** A global setup file at `tests/setup.ts` configures the test environment with DOM mocking.
*   **Sample Test:** A sample unit test is available at `tests/unit/utils.test.ts` to demonstrate the testing setup.

### 2. Consolidated Documentation

To provide a single source of truth, all project documentation has been consolidated into this `README.md`. Redundant files (`ISSUES_AND_FIXES.md`, `SETUP_GUIDE.md`, and `FIXES_SUMMARY.md`) have been removed to avoid confusion.

### 3. Automated Quality Checks

*   **Pre-commit Hooks:** The project now uses **Husky** to automatically run the linter and TypeScript compiler before each commit. This prevents common errors from being introduced into the codebase.
*   **Continuous Integration (CI/CD):** A **GitHub Actions** workflow is configured to run on every push and pull request. The CI pipeline automatically installs dependencies, runs the linter, executes the full test suite, and performs a production build to catch any potential issues.

---

## 🧪 Testing Strategy

### Running the Suite

**Unit & Integration (Vitest)**

```bash
bun test                # Standard run
bun test:ui             # Interactive Vitest UI
bun test:coverage       # Generate Istanbul report

```

**End-to-End (Playwright)**

```bash
npx playwright install  # First time only
bun run test:e2e        # Headless run
bun run test:e2e:ui     # Interactive trace viewer

```

### Test Standards

* **AAA Pattern**: All tests must follow Arrange-Act-Assert.
* **Mocking**: Use `msw` (Mock Service Worker) for API layer isolation.
* **Coverage**: Minimum 90% coverage required for `src/lib` and `src/actions`.

---

## 🔒 Security Considerations

* **Sanitization**: All input processed via `zod` to prevent injection.
* **Headers**: Implements strict `Content-Security-Policy` via `next.config.ts`.
* **Rate Limiting**: Integrated middleware to prevent brute-force on analysis endpoints.
* **Audit Trail**: Every AI request generates a unique `x-request-id` for compliance tracking.

---

## 🤝 Contributing

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

**Developed with precision by Darshil**
*Last updated: December 2025*

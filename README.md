# AI FinAgent QA - Production-Grade Testing Framework

[![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)](CHANGELOG.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0+-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0+-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Code Style](https://img.shields.io/badge/code%20style-Google-4285f4)](https://google.github.io/styleguide/tsguide.html)

**Enterprise-grade QA automation suite for AI-driven financial dashboards.** Built with comprehensive testing infrastructure, regulatory compliance validation, and production-ready performance optimizations.

---

## 📖 Table of Contents
- [Architecture Overview](#-architecture-overview)
- [Quick Start Guide](#-quick-start-guide)
- [Testing Strategy](#-testing-strategy)
- [Features & Capabilities](#-features--capabilities)
- [Contributing](#-contributing)
- [Deployment](#-deployment)
- [Security Considerations](#-security-considerations)
- [Changelog](#-changelog)

---

## 🎯 Version 2.2.0 - Structure Optimization (May 2026)

### Recent Improvements
* **Asset Cleanup**: Removed unused boilerplate SVG files and unused UI components (Spinner).
* **Refined Structure**: Consolidated React hooks into `src/hooks` and removed redundant `src/lib/hooks` and `src/visual-edits`.
* **Configuration Streamlining**: Simplified `tsconfig.json` and `vitest.config.ts` path aliases for better maintainability.
* **Dependency Refresh**: Updated to Next.js 16, React 19, and Tailwind CSS 4.

---

## 🚀 Quick Start Guide

### Prerequisites

* **Node.js**: v20.x or higher
* **Bun**: v1.1+ (Recommended) or **npm** v10+

### Installation

1. **Clone & Enter**
```bash
git clone https://github.com/darshil0/finagent-pro.git
cd finagent-pro
```

2. **Install Dependencies**
```bash
bun install
# OR
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env.local
```
*Add your `GEMINI_API_KEY` to `.env.local`. Get your key from [Google AI Studio](https://makersuite.google.com/app/apikey).*

4. **Verify Quality**
```bash
bun run lint       # Run ESLint
bun x tsc --noEmit  # Run Type Checking
bun test           # Run Vitest
```

### Local Development

```bash
bun dev
# OR
npm run dev
```
Navigate to `http://localhost:3000`.

---

## 🏗️ Architecture Overview

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 16.2+ | App Router & SSR |
| **UI Library** | React | 19.0 | Component Architecture |
| **Testing** | Vitest | 4.1+ | Unit/Integration Testing |
| **UI Components** | shadcn/ui | Latest | Radix UI + Tailwind |
| **Charts** | Recharts | 3.6+ | Data Visualization |
| **Styling** | Tailwind CSS | 4.2 | Utility-first Styles |
| **AI Engine** | Google Gemini | 1.5-flash | NLP & Analysis |

### Project Structure

```text
ai-finagent-qa/
├── src/
│   ├── app/                # Next.js App Router (actions, layout, pages)
│   ├── components/         # Atomic UI & Error Boundaries
│   ├── lib/                # Shared utilities & Zod schemas
│   ├── hooks/              # Custom React hooks (SSR-safe)
├── tests/
│   ├── unit/               # Logic & Utility tests
│   └── setup.ts            # Vitest setup & global mocks
├── public/                 # Static assets
└── config/                 # Tool-specific configurations
```

---

## 🧪 Testing Strategy

### Running the Suite

**Unit & Integration (Vitest)**

```bash
bun test                # Standard run
bun run test:watch      # Watch mode
```

### Test Standards

* **AAA Pattern**: All tests must follow Arrange-Act-Assert.
* **Mocking**: Use `msw` (Mock Service Worker) for API layer isolation.
* **Coverage**: Minimum 90% coverage required for `src/lib` and `src/app/actions.ts`.

---

## 🤝 Contributing

### Development Standards

1. **TypeScript & Typing**
   * **No `any`**: Use strict typing.
   * **Immutability**: Use `readonly` for interfaces where data should not be mutated.
   * **Server vs. Client**: Mark client components with `'use client'`.

2. **UI & Styling**
   * **Design System**: Use **shadcn/ui** components.
   * **Theming**: Ensure support for **Dark Mode**.
   * **Accessibility**: Use semantic HTML and provide `aria-labels`.

3. **Pull Request Process**
   * Use **Conventional Commits** (`feat:`, `fix:`, `docs:`, `test:`).
   * Update documentation for new features.
   * Include Problem, Solution, and Testing details in PR description.

---

## 🔒 Security Considerations

* **Sanitization**: All input processed via `zod` to prevent injection.
* **Headers**: Implements strict `Content-Security-Policy` via `next.config.ts`.
* **Rate Limiting**: Integrated middleware to prevent brute-force on analysis endpoints.
* **Mock Data Only**: Never commit real financial data or PII.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

**Developed with precision by Darshil**
*Last updated: May 2026*

# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2025-02-14

### Fixed
- Fixed `formatCurrency` utility function to correctly handle invalid inputs and match test expectations.
- Resolved TypeScript errors across the project including Server Actions, Chart components, and UI components.
- Fixed ESLint configuration for Flat Config compatibility and resolved circular dependency issues.
- Fixed redundant `@ts-expect-error` directives and type mismatches in components.

### Changed
- Migrated utility functions from `src/test/setup.ts` to `src/lib/utils.ts` for better project organization.
- Updated all dependencies to their latest stable compatible versions (Next.js 16, React 19, Tailwind CSS 4, ESLint 9).
- Consolidated documentation into a single source of truth in `README.md`.

### Removed
- Deleted redundant documentation files (`SETUP_GUIDE.md`, `CONTRIBUTING.md`, `ISSUES_AND_FIXES.md`, `FIXES_SUMMARY.md`).
- Removed `src/test/setup.ts` after migrating its contents.

## [2.0.0] - 2025-12-26

### Added
- Major release with AI FinAgent QA capabilities.
- Server Actions hardening with Zod-based validation.
- React 19 integration.
- 100% type coverage policy.

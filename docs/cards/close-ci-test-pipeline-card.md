Card: CI pipeline should run `npm test` to enforce test suite

**Acceptance Criteria:**
1. ✅ CI pipeline includes `npm test` step before `npm run build` (deploy.yml line 25)
2. ✅ All 13 test files (902 tests) pass via `npm test` (vitest run)
3. ✅ CI pipeline fails build if any test does not pass (npm test exits non-zero on failure)
4. ✅ Deployment workflow structure preserved: checkout → setup-node → npm ci → npm test → npm run build → deploy-with-retry

**Implementation Details:**
- The `npm test` step was added to `.github/workflows/deploy.yml` between `npm ci` and `npm run build`
- An infrastructure regression test was added in `tests/infrastructure.test.js` that validates:
  - `npm ci`, `npm test`, and `npm run build` all exist in deploy.yml
  - `npm test` appears between `npm ci` and `npm run build` (by line position)
  - Full workflow step ordering: checkout → setup-node → npm ci → npm test → npm run build → deploy-with-retry
- Tests were verified passing on CI-compatible environment (vitest run, 902/902 tests)

**Closure Date:** 2026-08-07

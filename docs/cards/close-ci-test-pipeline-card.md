Card: CI pipeline should run `npm test` to enforce test suite

Reason: Spec already satisfied — `npm test` step exists at correct position in `.github/workflows/deploy.yml` (between `npm ci` and `npm run build`), all 13 test files (902 tests) pass, and an infrastructure regression test was added in a previous attempt.

Conclusion: No code changes needed; card closed with verified implementation from prior work.

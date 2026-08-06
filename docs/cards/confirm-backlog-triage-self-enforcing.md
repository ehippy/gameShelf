Card: Confirm Backlog Triage & Scope Discipline convention is self-enforcing

Date: 2026-08-10

Verification Summary:
- The Backlog Triage & Scope Discipline convention (AGENTS.md lines 917-921) is self-enforcing
- No code or tooling changes are needed to implement or verify this convention
- The rule is enforced by human judgment during backlog triage — the PM rejects cards without real friction evidence before any spec is written

Evidence:
1. Pre-commit hooks only enforce implementation-level rules:
   - check-assertion-dupes.js: prevents copy-pasted test assertions
   - check-postmortems.js: prevents boilerplate struggles entries in AGENTS.md
   - check-reset-pattern.js: prevents state reassignment in handleKeydownTransition resetFn

2. CI/CD workflows only validate code quality:
   - deploy.yml: runs npm ci → npm test → npm run build pipeline
   - No workflow validates backlog items or card acceptance criteria

3. No GitHub automation exists for backlog triage:
   - No issue/PR templates validate card scope
   - No bots or apps enforce documentation-only card rejection
   - No workflows trigger on card creation or modification

4. Recent confirmation:
   - A guardrails card for documentation-only items was recently rejected
   - This reaffirmed the convention is working as intended through human judgment alone

Conclusion:
This is a process-level discipline, not an implementation-level one. The convention requires no pre-commit hooks, CI automation, or other tooling because the PM's backlog triage serves as the enforcement mechanism. Cards without real friction evidence are rejected during triage before any spec is written.

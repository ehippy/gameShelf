Card: Verify deploy-with-retry action.yml has 5 attempts

Reason: Self-closing verification card — no code changes needed.

Conclusion: All 6 verification criteria confirmed against .github/actions/deploy-with-retry/action.yml:
(1) Exactly 5 deploy steps with ids deploy_1 through deploy_5, each using _attempt.
(2) Chaining correct: deploy_2..deploy_5 gated on previous step's failure.
(3) set_output checks all 5 in descending order (deploy_5 through deploy_1).
(4) All-failed condition checks deploy_1 through deploy_5 all failing.
(5) Error message says 'all 5 retry attempts'; description says 'up to 5 attempts'.
(6) _attempt/action.yml was NOT modified.

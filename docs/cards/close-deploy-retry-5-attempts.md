Card: Expand deploy-with-retry action from 3 to 5 attempts

Reason: Spec says no implementation needed — .github/actions/deploy-with-retry/action.yml already supports 5 retry attempts with all five requested changes (deploy_4/deploy_5 steps, set_output priority from deploy_5, all-failed condition for 5 outcomes, error message update, description update) already present.

Conclusion: Verified all acceptance criteria are satisfied; card closes without code changes.

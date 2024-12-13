# AMP Build On-Duty

The AMP build on-duty is responsible for ensuring that the [main branch build](https://app.circleci.com/pipelines/github/ampproject/amphtml?branch=main) remains green. The AMP build on-duty responsibility rotates between members of the community.

Make sure you are a member of the [#contributing](https://amphtml.slack.com/messages/C9HRJ1GPN) channel on Slack while you are build on-duty.

-   If the build has been red for some time, please send a note to the #contributing channel if the issue is not already reported.
-   Pay attention for reports of issues with the build that the community may send to this channel. (You may want to enable notifications for this channel while you are build on-duty to make this easier.)

## Build On-Duty Tasks

1. Ensure the [main branch build](https://app.circleci.com/pipelines/github/ampproject/amphtml?branch=main) remains green. Your goal is to keep the build from being red for more than an hour.
    1. Note that yellow builds are in the process of being created/tested so you do not need to do anything special with them.
    2. Keep an eye out for emails sent to an address starting with amp-build-on-duty. **You are encouraged to set up a filter so that these emails will stand out to you.**
    3. You will need to investigate whether a red build is due to a flake or due to a real issue.
        - If the issue is due to a flaky test:
            - Create a ["Related to: Flaky Tests" issue](https://github.com/ampproject/amphtml/issues?q=is%3Aopen+is%3Aissue+label%3A%22Related+to%3A+Flaky+Tests%22). **Make sure to find an appropriate owner for the issue and assign it to them.**
            - If needed, send a PR to disable the flaky test:
                - For a normal `describe` test add [`.skip()`](https://mochajs.org/#inclusive-tests)
                - For an integration test failing on a specific browser, add the corresponding `skip` function (e.g. `skipEdge()`). See the `skipXXX` functions in [testing/test-config.js](https://github.com/ampproject/amphtml/blob/main/testing/test-config.js) for details.
            - Restart the failing parts of the build build on CircleCI by clicking the `Rerun workflow from failed` button on the build page (you must be signed into GitHub).
        - If the issue is due to a real breakage, work with the appropriate owner to rollback the offending PR. Rollbacks are preferable to fixes because fixes can often cause their own breakages.
2. [Triage new issues](https://github.com/ampproject/amphtml/issues), especially [unassigned ones](https://github.com/ampproject/amphtml/issues?q=is%3Aissue+is%3Aopen+no%3Aassignee)
    - You are not expected to fix all of these issues, just make sure they are assigned to an individual or a relevant working group.
3. Keep an eye on incoming [Renovate PRs](https://github.com/ampproject/amphtml/pulls/renovate-bot), which result from an automated process to update our dependencies.
    1. Make sure that the PR updates both package.json and package-lock.json
    2. Check the CircleCI logs for the PR for any new failures or unexpected results
        - If there’s a failure due to a flaky test, try restarting the job that failed
        - If that doesn’t work, try syncing the branch to HEAD by checking the `rebase/retry` checkbox in the PR description (tests will automatically be re-run)
        - If neither of the above works, it’s possible that the package update is a breaking change.
            - If you know how to fix the breaking change, follow the instructions by expanding the `How to resolve breaking changes` section of the PR description.
            - If not, assign the PR to someone who can look at what changed and determine how to fix it.
    3. Assuming the CircleCI build was green, make sure there are no diffs in the Percy build.
        - If there are diffs that look like flakes, click “Approve” on the Percy build to unblock the PR (and ping @danielrozenberg as an FYI).
    4. Approve and merge the PR.

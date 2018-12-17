# AMP Buildcop

The AMP buildcop is responsible for ensuring that the [master build](https://travis-ci.org/ampproject/amphtml/branches) remains green.  The AMP buildcop responsibility rotates between members of the community.

If the build has been red for some time, please send a note to the [#contributing](https://amphtml.slack.com/messages/C9HRJ1GPN) channel on Slack if the issue is not already reported.

## Buildcop Tasks

* Ensure the [master build](https://travis-ci.org/ampproject/amphtml/branches) remains green.  Your goal is to keep the build from being red for more than an hour.
  * Note that yellow builds are in the process of being created/tested so you do not need to do anything special with them.
  * Keep an eye out for emails sent to an address starting with amp-build-cop.  **You are encouraged to set up a filter so that these emails will stand out to you.**
  * You will need to investigate whether a red build is due to a flake or due to a real issue.
    * If the issue is due to a flaky test:
      * Create a ["Related to: Flaky Tests" issue](https://github.com/ampproject/amphtml/issues?q=is%3Aopen+is%3Aissue+label%3A%22Related+to%3A+Flaky+Tests%22).  **Make sure to find an appropriate owner for the issue and assign it to them.**
      * If needed, send a PR to disable the flaky test:
        * For a normal `describe` test add [`.skip()`](https://mochajs.org/#inclusive-tests)
        * For an integration test failing on a specific browser, add the corresponding `skip` function (e.g. `skipEdge()`).  See the `skipXXX` functions in [_init_tests.js](https://github.com/ampproject/amphtml/blob/master/test/_init_tests.js) for details.
      * Restart the build on Travis by clicking the "Restart build" button on the build page (you must be signed into GitHub).
    * If the issue is due to a real breakage, work with the appropriate owner to rollback the offending PR.  Rollbacks are preferable to fixes because fixes can often cause their own breakages.
* Keep an eye on incoming [Renovate PRs](https://github.com/ampproject/amphtml/pulls/renovate-bot), which result from an automated process to update our dependencies.
  * Make sure that the PR updates both package.json and yarn.lock
  * Check the Travis logs for the PR for any new failures or unexpected results
    * If there’s a failure due to a flaky test, try restarting the shard that failed
    * If that doesn’t work, try syncing the branch to HEAD (tests will automatically be re-run)
    * If neither of the above works, it’s possible that the package update is a breaking change. Assign the PR to someone who can look at what changed and determine how to fix it.
  * Assuming Travis was green, make sure there are no diffs in the Percy build.
    * If there are diffs that look like flakes, click “Approve” on the Percy build to unblock the PR (and ping Daniel Rozenberg as an FYI).
  * Approve and merge the PR.
* Report and triage any failing tests on *beta* browsers:
  * Check recent [master builds](https://travis-ci.org/ampproject/amphtml/branches) on Travis, even the green ones. Look for the `gulp test ... --saucelabs` task in the logs and check for any failing tests under the *beta* test batch(es). Create issues for those tests.

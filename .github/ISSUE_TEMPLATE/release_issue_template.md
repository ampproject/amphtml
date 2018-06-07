# Release tracking issue

<!--
Note to onduty:

Use comments on this issue to track anything else you think might be of
interest to the community (e.g. alerting the community to delays).

Once you have filed this issue post a link to it in the #release Slack channel.

As each step is completed, check it off so the community can see the state of
the current release at a glance.

To document cherry picks that interrupt the default release process, add
additional checkboxes at the stage the cherry pick was made, e.g. if the
cherry pick is made after the initial canary release was at 1%, add these lines
beneath the initial 1% checkbox and then check them as they occur:
  - [ ] Cherry pick release [<RELEASE_NUMBER>](https://github.com/ampproject/amphtml/releases/tag/<RELEASE_NUMBER>) pushed to Dev Channel
  - [ ] Cherry pick release pushed to 1%

When the release is pushed to production:
- update the "pushed to production" checkbox with a link to the release build
  that was actually pushed to production
- change "(Canary)" in the issue title to "(Production)" and remove
  "(Production)" from the title of the issue that was formerly in production
  (so that it's immediately clear when looking at Type: Release issues what
  is currently in canary and what is currently in production)

After the release is pushed to production, continue to use this issue to track
anything interesting about the release, including adding additional
checkboxes to track cherry picks into production.
-->
- [x] Canary release [<RELEASE_NUMBER>](https://github.com/ampproject/amphtml/releases/tag/<RELEASE_NUMBER>) is cut
- [ ] Canary release pushed to Dev Channel
- [ ] Canary release pushed to 1%
- [ ] Release build pushed to production

See the [release documentation](https://github.com/mrjoro/amphtml/contributing/release-schedule.md) for more information on the release process, including how to test changes in the Dev Channel.

If you find a bug in this build, please file an [issue](https://github.com/ampproject/amphtml/issues/new).  If you believe the bug should be fixed in this build, follow the instructions in the [cherry picks documentation](https://github.com/mrjoro/amphtml/contributing/release-schedule.md#cherry-picks).

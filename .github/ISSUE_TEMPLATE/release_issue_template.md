# Release tracking issue

<!--
Note to onduty:

Use comments on this issue to track anything else you think might be of
interest to the community (e.g. alerting the community to the delays).

As each step is completed, check it off in this issue so the community can see
the state of the current release at a glance.  Once you have filed this issue
post a link to it in the #release Slack channel.

When cherry picks are made add additional checkboxes at the stage the cherry
pick was made, i.e.
  - [ ] Cherry pick release [<RELEASE_NUMBER>](https://github.com/ampproject/amphtml/releases/tag/<RELEASE_NUMBER>) pushed to Dev Channel
  - [ ] Cherry pick release pushed to 1%

When the release is pushed to production:
- add a link to the release build that was actually pushed to production in
  the "pushed to production" checkbox
- change the "(Canary)" in the issue title to "(Production)" and remove
  "(Production)" from the title of the issue that was formerly in production

After the release is pushed to production, continue to use this issue to track
anything interesting about this release, including adding additional
checkboxes to track cherry picks into production.
-->
- [x] Canary release [<RELEASE_NUMBER>](https://github.com/ampproject/amphtml/releases/tag/<RELEASE_NUMBER>) is cut
- [ ] Canary release pushed to Dev Channel
- [ ] Canary release pushed to 1%
- [ ] Release build pushed to production

See the [release documentation](https://github.com/mrjoro/amphtml/contributing/release-schedule.md) for more information on the release process.

If you find a bug in this build, please file an [issue](https://github.com/ampproject/amphtml/issues/new).  If you believe the bug should be fixed in this build, follow the instructions in the [cherry picks documentation](https://github.com/mrjoro/amphtml/contributing/release-schedule.md#cherry-picks).

# Release tracking issue

<!--
Note to onduty:

This issue is used to track a single release of AMP from the canary cut to
the 1% push to production, plus any cherry picks along the way.  Note that
because the current onduty person handles pushing the build the previous onduty
created to production a single issue will generally be updated by at least
two onduty people.

When creating the issue replace <RELEASE_NUMBER> with the initial canary
release number and remove the backticks (`).  If you create
a cherry pick a new release number is created.  At each stage of the release
make sure to edit the checklist item to accurately reflect which release is
being used.

Once you have filed this issue post a link to it in the #release Slack channel.

As each step is completed, check it off so the community can see the state of
the current release at a glance.

In addition to using the checkboxes to track the state of the release, use
comments on this issue to track anything else you think might be of interest
to the community regarding this release (e.g. to alert the community to delays).

To document cherry picks that interrupt the default release process, add
additional checkboxes at the stage the cherry pick was made, e.g. if the
cherry pick is made after the initial canary release was at 1%, add these lines
beneath the initial 1% checkbox and then check them as they occur:
  - [ ] Cherry pick release [<RELEASE_NUMBER>](https://github.com/ampproject/amphtml/releases/tag/<RELEASE_NUMBER>) pushed to Dev Channel
  - [ ] Cherry pick release <RELEASE_NUMBER> pushed to 1%

If the cherry pick is made to the release in production, you may also need to
add a checkbox like:
  - [ ] Cherry pick release <RELEASE_NUMBER> pushed to production

When you push the release this issue is tracking to production:
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
- [x] Canary release `[<RELEASE_NUMBER>](https://github.com/ampproject/amphtml/releases/tag/<RELEASE_NUMBER>)` is cut
- [ ] Canary release <RELEASE_NUMBER> pushed to Dev Channel
- [ ] Canary release <RELEASE_NUMBER> pushed to 1%
- [ ] Release build <RELEASE_NUMBER> pushed to production

See the [release documentation](https://github.com/ampproject/amphtml/blob/master/contributing/release-schedule.md) for more information on the release process, including how to test changes in the Dev Channel.

If you find a bug in this build, please file an [issue](https://github.com/ampproject/amphtml/issues/new).  If you believe the bug should be fixed in this build, follow the instructions in the [cherry picks documentation](https://github.com/ampproject/amphtml/blob/master/contributing/release-schedule.md#cherry-picks).

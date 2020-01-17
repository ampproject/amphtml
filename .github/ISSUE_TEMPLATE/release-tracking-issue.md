---
name: Release tracking issue
about: Create a tracking issue for a new AMP release (to be used by release on-duty
  engineers)
title: "\U0001F684 Release tracking issue for release <RELEASE_NUMBER>"
labels: 'Type: Release'
assignees: ''

---

# Release tracking issue

<!--
Note to onduty:

Use this issue to track a release from the initial experimental/beta release build through
promotion to stable and LTS. The community uses this issue to keep track of what is going on
with the release so please keep this issue up to date:

- As you reach each stage of the release, check the appropriate checkbox and replace <CL submit time> with the "Submitted" text from the corresponding CL, e.g. "2:49 PM, Jul 25, 2018 UTC-4".
- If you need to perform cherry picks, add new checkboxes here (by editing this
  issue), making sure to use the release number for the new build. Link the
  release number to the GitHub tag page the first time a given release number
  appears in the checkboxes.
- Add any updates that may be of interest to the community (such as delays) as
  comments on this issue, including after the release is promoted to Stable (and, in some cases, LTS).
- Keep the title of the issue updated to reflect whether this issue is tracking
  the Experimental/Beta builds or the build in Stable.

Note: remove the backticks (``) from the link.
-->

- [x] Release `[<RELEASE_NUMBER>](https://github.com/ampproject/amphtml/releases/tag/<RELEASE_NUMBER>)` is cut as a new canary release
- [ ] Release <RELEASE_NUMBER> promoted to Experimental and Beta (opt-in) channels (<CL submit time>)
- [ ] Release <RELEASE_NUMBER> promoted to Experimental and Beta (1% traffic) channels (<CL submit time>)
- [ ] Release <RELEASE_NUMBER> promoted to Stable channel (<CL submit time>)

<!--
If this release will become the next LTS release, add/update the checkboxes above as needed e.g.

- [x] Release <RELEASE_NUMBER> will be the next LTS
- [ ] Release <RELEASE_NUMBER> promoted to LTS (<CL submit time>)

If you perform cherry picks, add/update the checkboxes above as needed e.g.

- [ ] Release `[<CHERRY_PICK_RELEASE_NUMBER>](...)` created with cherry picks
- [ ] Release <CHERRY_PICK_RELEASE_NUMBER> promoted to Experimental and Beta channels
-->

See the [release documentation](https://github.com/ampproject/amphtml/blob/master/contributing/release-schedule.md) for more information on the release process, including how to test changes in the Experimental channel.

If you find a bug in this build, please file an [issue](https://github.com/ampproject/amphtml/issues/new). If you believe the bug should be fixed in this build, follow the instructions in the [cherry picks documentation](https://go.amp.dev/cherry-picks).

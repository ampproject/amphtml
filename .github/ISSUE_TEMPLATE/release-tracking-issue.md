---
name: Release tracking issue
about:
  Create a tracking issue for a new AMP release (to be used by release on-duty
  engineers)
title: "\U0001F684 Release tracking issue for release <RELEASE_NUMBER>"
labels: 'Type: Release'
assignees: ''
---

# Release tracking issue

<!--
Note to onduty:

Use this issue to track a release from the initial Nightly release build, through promotions
to Beta/Experimental opt-in, Beta/Experimental traffic, and Stable and LTS. The community
uses this issue to keep track of what is going on with the release so please keep this issue
up to date:

- To update the new commits URL, find <LATEST_STABLE_RELEASE_NUMBER> at https://github.com/ampproject/amphtml/releases/latest. This needs to be updated when creating this issue and recording cherry picks.
- As you reach each stage of the release, check the appropriate checkbox and replace <CL submit time> with the "Submitted" text from the corresponding CL, e.g. "2:49 PM, Jul 25, 2018 UTC-4".
- If you need to perform cherry picks, add new checkboxes here (by editing this
  issue), making sure to use the release number for the new build. Link the
  release number to the GitHub tag page the first time a given release number
  appears in the checkboxes.
- Add any updates that may be of interest to the community (such as delays) as
  comments on this issue, including after the release is promoted to Stable (and, in some cases, LTS).

Note: remove the backticks (``) from the link. They are there to allow the template file for this issue to pass `gulp check-links`.
-->

This issue tracks release `[<RELEASE_NUMBER>](https://github.com/ampproject/amphtml/releases/tag/<RELEASE_NUMBER>)`. See what's new compared to stable `[here](https://github.com/ampproject/amphtml/compare/<LATEST_STABLE_RELEASE_NUMBER>...<RELEASE_NUMBER>)`.

- [ ] Release <RELEASE_NUMBER> promoted to Experimental and Beta (opt-in) channels (<CL submit time>)
- [ ] Release <RELEASE_NUMBER> promoted to Experimental and Beta (1% traffic) channels (<CL submit time>)
- [ ] Release <RELEASE_NUMBER> promoted to Stable channel (<CL submit time>)

<!--
On the second Monday of each month, the current Stable version will be promoted to the LTS release channel. In other words:

- If this release is promoted to Stable on the first Tuesday of a given month, it needs to be promoted to LTS on the second Monday of the same month.
- If this release is promoted to Stable on the second, third, fourth, or fifth Monday of a given month, it is not an LTS release candidate (but will be included in a later LTS release).

Based on the above, if this release must be promoted to LTS, copy-paste the following checkbox into the list above.

- [ ] Release <RELEASE_NUMBER> promoted to LTS (<CL submit time>)

If you perform cherry picks, add/update the checkboxes above as needed e.g.

- [ ] Release [<CHERRY_PICK_RELEASE_NUMBER>](https://github.com/ampproject/amphtml/releases/tag/<CHERRY_PICK_RELEASE_NUMBER>) created with cherry picks #<CHERRY_PICK_ISSUE_NUMBER>, [#<CHERRY_PICK_ISSUE_NUMBER>, ...]
- [ ] Release <CHERRY_PICK_RELEASE_NUMBER> promoted to Experimental and Beta channels (<CL submit time>)
-->

See the [release documentation](https://github.com/ampproject/amphtml/blob/master/contributing/release-schedule.md) for more information on the release process, including how to test changes in the Experimental channel.

If you find a bug in this build, please file an [issue](https://github.com/ampproject/amphtml/issues/new). If you believe the bug should be fixed in this build, follow the instructions in the [cherry picks documentation](https://go.amp.dev/cherry-picks).

/cc @ampproject/release-on-duty

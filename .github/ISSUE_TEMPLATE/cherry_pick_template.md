---
name: Cherry pick template
about: Used to request a cherry pick. See bit.ly/amp-cherry-pick
title: "\U0001F338 Cherry pick request for <YOUR_ISSUE_NUMBER> into <RELEASE_ISSUE_NUMBER>
  (Pending)"
labels: 'Type: Release'
assignees: cramforce

---

<!--
Replace *everything* in angle brackets in the title AND body of this issue. If you have any questions see the [cherry pick documentation](https://github.com/ampproject/amphtml/blob/master/contributing/release-schedule.md#cherry-picks).
-->


## GitHub issue your cherry pick is fixing:

Issue #<ISSUE_NUMBER>


## PR that you are requesting a cherry pick for:

<!--
Put N/A if you do not yet have a PR with a fix; edit this issue to add it when the PR is ready.
-->

PR #<PR_NUMBER>


## Release(s) you requesting this cherry pick into:

<!--
Release issues can be found at https://github.com/ampproject/amphtml/labels/Type%3A%20Release

If you are requesting a cherry pick into a production release you will most likely need to cherry pick into canary as well, otherwise when the canary is pushed to production your fix will be lost. See the [cherry pick documentation](https://github.com/ampproject/amphtml/blob/master/contributing/release-schedule.md#cherry-picks).
-->

Production Release? <YES/NO>

<!-- If yes: --> Release Issue #<PRODUCTION_RELEASE_ISSUE>

Canary release? <YES/NO>

<!-- If yes: --> Release Issue #<CANARY_RELEASE_ISSUE>
<!-- otherwise: --> <WHY_THIS_IS_NOT_NEEDED>

## Why does this issue meet the [cherry pick criteria](https://github.com/ampproject/amphtml/blob/master/contributing/release-schedule.md#cherry-pick-criteria)?

<!-- Be specific. -->
<YOUR_REASONS>

/cc @cramforce

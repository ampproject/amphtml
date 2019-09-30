---
name: Cherry-pick template
about: Used to request a cherry-pick. See bit.ly/amp-cherry-pick
title: "\U0001F338 Cherry-pick request for #<ISSUE_NUMBER> into #<RELEASE_ISSUE> (Pending)"
labels: 'Type: Release'
---

<!--
MUST: Replace *everything* in angle brackets in the title AND body of this issue.

If you have any questions see the [cherry-pick documentation](https://github.com/ampproject/amphtml/blob/master/contributing/release-schedule.md#cherry-picks).
-->
# Cherry-pick request

<!--
TIP: Cherry-picks into production most likely require a cherry-pick into RC too. Otherwise, your fix will be lost when the RC is promoted.
-->

| Issue | PR  | Production? | RC? | [Release issue](https://github.com/ampproject/amphtml/labels/Type%3A%20Release) |
| :---: | :-: | :---------: | :-: | :-----------: |
| #<_ISSUE_NUMBER_> | #<_PR_NUMBER_> | **<YES/NO>** | **<YES/NO>** | #<_RELEASE_ISSUE_> |

## Why does this issue meet the [cherry-pick criteria](https://github.com/ampproject/amphtml/blob/master/contributing/release-schedule.md#cherry-pick-criteria)?

<!--
TIP: Be specific.
-->
<_YOUR_REASONS_>

<!--
CONDITION: Cherry-picking into production but _not_ RC. Otherwise, delete.
-->
## Why is a RC cherry-pick not needed?

<_YOUR_REASONS_>

<!--
MUST: Filling out the mini-PM template is required _after_ the deployment of a production cherry-pick. If this cherry-pick does not include production, the mini-PM section can be deleted.

MUST: This issue cannot be closed until the mini-PM is written and its action items are completed.
-->
# Mini-postmortem

> **TODO:** This postmortem will be written after the cherry-pick deployment and before this issue is closed. Delete this TODO when the postmortem is ready.

## Summary

<!--
TIP: A few sentences summarizing the problem and impact.
-->
<_YOUR_SUMMARY_>

| Users affected | Impact |
| -------------- | ------ |
| <_Which users were affected? Roughly how many?_> | <_How were users affected? E.g. partial or complete loss of functionality?_> |

## Root Causes

1.

## Action Items

| Action Item | Type | Owner | PR # |
| ----------- | :--: | :---: | :--: |
| <_E.g. Add integration test_> | <_Investigate/Mitigate/Prevent_> | @<_USERNAME_> | #<_PR_NUMBER_> |

## Lessons Learned

### Things that went well

-

### Things that went wrong

-

---

/cc @ampproject/wg-approvers @ampproject/cherry-pick-approvers

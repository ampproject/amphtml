---
name: Cherry-pick template
about: Used to request a cherry-pick. See bit.ly/amp-cherry-pick
title: "\U0001F338 Cherry-pick request for #<ISSUE_NUMBER> into #<RELEASE_ISSUE>
  (Pending)"
labels: 'Type: Release'
assignees: cramforce
---

<!--
Replace *everything* in square brackets in the title AND body of this issue.

If you have any questions see the [cherry-pick documentation](https://github.com/ampproject/amphtml/blob/master/contributing/release-schedule.md#cherry-picks).
-->

# Cherry-pick request

<!--
Cherry-picks into production most likely require a cherry-pick into RC too. Otherwise, your fix will be lost when the RC is promoted.

Release issues: https://github.com/ampproject/amphtml/labels/Type%3A%20Release
-->

| Issue | PR  | Production? | RC? | Release issue |
| :---: | :-: | :---------: | :-: | :-----------: |
| #[_Issue number_] | #[_PR number_] | **[Y/N]** | **[Y/N]** | #[_Release issue_] |

## Why does this issue meet the [cherry-pick criteria](https://github.com/ampproject/amphtml/blob/master/contributing/release-schedule.md#cherry-pick-criteria)?

<!-- Be specific. -->
[_Your reasons_]

<!--
IF: Cherry-picking into production but _not_ RC.
-->
## Why is a RC cherry-pick not needed?

[_Your reasons_]

<!-- NOTE: Filling out this mini-PM template is required after the deployment of a production cherry-pick. -->
# Mini-postmortem

| Users affected | Impact |
| -------------- | ------ |
| [_Which users were affected? Roughly how many?_] | [_How were users affected? E.g. partial or complete loss of functionality?_] |

## Root Causes

1.
2.
3.

## Action Items

| Action Item | Type | Owner | PR # |
| ----------- | :--: | :---: | :--: |
| [_E.g. add integration test_] | [_Investigate/Mitigate/Prevent_] | @[_Username_] | #[_Issue_] |

## Lessons Learned

### Things that went well

-

### Things that went wrong

-

---

/cc @cramforce

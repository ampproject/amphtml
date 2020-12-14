---
name: Cherry-pick request
about: Used to request a cherry-pick. See go.amp.dev/cherry-picks
title: "\U0001F338 Cherry-pick request for #<ISSUE_NUMBER> into #<RELEASE_ISSUE> (Pending)"
labels: 'Cherry-pick: Beta, Cherry-pick: Experimental, Cherry-pick: LTS, Cherry-pick:
  Stable, Type: Release'
assignees: ''

---

<!--
MUST: Replace *everything* in angle brackets in the title AND body of this issue.
MUST: Update issue labels to indicate which channels the cherry-pick is going into.

If you have any questions see the [cherry-pick documentation](https://github.com/ampproject/amphtml/blob/master/contributing/contributing-code.md#Cherry-picks).
-->

# Cherry-pick request

<!--
TIP: Cherry-picks into Stable most likely require a cherry-pick into Beta / Experimental too. Otherwise, your fix will be lost when Beta is promoted.
-->

|       Issue       |       PR       | Beta / Experimental? |   Stable?    |     LTS?     | [Release issue](https://github.com/ampproject/amphtml/labels/Type%3A%20Release) |
| :---------------: | :------------: | :------------------: | :----------: | :----------: | ------------------------------------------------------------------------------- |
| #<_ISSUE_NUMBER_> | #<_PR_NUMBER_> |     **<YES/NO>**     | **<YES/NO>** | **<YES/NO>** | #<_RELEASE_ISSUE_>                                                              |

## Why does this issue meet the [cherry-pick criteria](https://github.com/ampproject/amphtml/blob/master/contributing/contributing-code.md#Cherry-picks)?

<!--
TIP: Be specific.
-->

<_YOUR_REASONS_>

<!--
CONDITION: Cherry-picking into Stable but _not_ Beta / Experimental. Otherwise, delete.
-->

## Why is a Beta / Experimental cherry-pick not needed?

<_YOUR_REASONS_>

<!--
CONDITION: Cherry-picking into LTS. Otherwise, delete.
-->

## Why is an LTS cherry-pick needed?

<_YOUR_REASONS_>

## List the steps to manually verify the changes in this cherry-pick

<_TEST_STEPS_>

<!--
MUST: Filling out the mini-PM template is required _after_ the deployment of a stable cherry-pick. If this cherry-pick does not include stable, the mini-PM section can be deleted.

MUST: This issue cannot be closed until the mini-PM is written and its action items are completed.
-->

# Mini-postmortem

> **TODO:** This postmortem will be written after the cherry-pick deployment and before this issue is closed. Delete this TODO when the postmortem is ready.

## Summary

<_1-2 sentences summarizing the problem and root causes._>

## Impact

- <_Which users were affected? Roughly how many?_>
- <_How were users affected? E.g. partial or complete loss of functionality?_>

## Action Items

<!--
TIP: How can we:
- Prevent this class of bugs in the future?
- Mitigate impact by detecting them sooner?
- Make investigating these issues easier?
-->

- #<_ISSUE_NUMBER_>: <_Add unit/integration/end-to-end test_>
- #<_ISSUE_NUMBER_>: <_Add monitoring for edge case via error logging_>
- #<_ISSUE_NUMBER_>: <_Refactor an easily misused API_>

---

/cc @ampproject/release-on-duty @ampproject/wg-approvers @ampproject/cherry-pick-approvers

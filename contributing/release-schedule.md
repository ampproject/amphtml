⚡⚡⚡

**Our last scheduled release for 2018 will be created on Tuesday, December 11, 2018 (targeting full rollout on December 18).**

After this the next scheduled release will be created on Wednesday, January 3, 2019 (targeting full rollout on January 9).

If necessary, fixes for P0 issues may be cherry-picked into the production release and pushed during this time.
⚡⚡⚡

# Release Schedule

- [Detailed schedule](#detailed-schedule)
- [Determining if your change is in production](#determining-if-your-change-is-in-production)
- [Cherry picks](#cherry-picks)
	- [Cherry pick criteria](#cherry-pick-criteria)
	- [Process for requesting a cherry pick](#process-for-requesting-a-cherry-pick)
- [AMP Dev Channel](#amp-dev-channel)
- [Release cadence](#release-cadence)

A new release of AMP is pushed to all AMP pages every week on Tuesday.  **Once a change in AMP is merged into the master branch of the amphtml repository, it will typically take 1-2 weeks for the change be live for all users.**

["Type: Release" GitHub issues](https://github.com/ampproject/amphtml/labels/Type%3A%20Release) are used to track the status of current and past releases (from the initial cut to canary testing to production).  Announcements about releases are made on the [AMP Slack #release channel](https://amphtml.slack.com/messages/C4NVAR0H3/) ([sign up for Slack](https://bit.ly/amp-slack-signup)).

## Detailed schedule

We try to stick to this schedule as closely as possible, though complications may cause delays.  You can track the latest status about any release in the ["Type: Release" GitHub issues](https://github.com/ampproject/amphtml/labels/Type%3A%20Release) and the [AMP Slack #release channel](https://amphtml.slack.com/messages/C4NVAR0H3/) ([sign up for Slack](https://bit.ly/amp-slack-signup)).

- Tuesday @ [11am Pacific](https://www.google.com/search?q=11am+pacific+in+current+time+zone): a new canary release build is created from the [latest master build that passes all of our tests](https://travis-ci.org/ampproject/amphtml/branches) and is pushed to users of AMP who opted into the [AMP Dev Channel](#amp-dev-channel)
- Wednesday:  we check bug reports for Dev Channel users and if everything looks fine, we push the canary to 1% of AMP pages
- Thursday-Monday: we continue to monitor error rates and bug reports for Dev Channel users and the 1% of pages with the canary build
- Tuesday (about a week after the canary release build was cut): the canary is fully pushed to production (i.e. all AMP pages will now use this build)

## Determining if your change is in production

You can determine what is in a given build using one of the following:

- The ["Type: Release" GitHub issues](https://github.com/ampproject/amphtml/labels/Type%3A%20Release) for each release build will include a link to the specific [release page](https://github.com/ampproject/amphtml/releases) which lists the PRs in that release.
  - The most recent "Type: Release" issue with `(Production)` in the title is the build currently in production.
  - The "Type: Release" issue with `(Canary)` in the title tracks the current canary.
- The [PR Use: In Canary](https://github.com/ampproject/amphtml/issues?utf8=%E2%9C%93&q=label%3A%22PR%20use%3A%20In%20Canary%22) and [PR Use: In Production](https://github.com/ampproject/amphtml/issues?utf8=%E2%9C%93&q=label%3A%22PR%20use%3A%20In%20Production%22) labels are added to PRs when they've made it into a canary/production build.  There may be a delay between when the build is created and when it goes live.

## Cherry picks

We have a well-defined process for handling requests for changes to the canary release build or to the current production release build.  These changes are known as "cherry picks".

### Cherry pick criteria

**The bar for getting a cherry pick into canary or production is very high** because our goal is to produce high quality launches on a predictable schedule.

**Keep in mind that performing a cherry pick requires a significant amount of work from you and the onduty person** and they can take a long time to process.

- In general only fixes for [P0 issues](https://github.com/ampproject/amphtml/blob/master/contributing/issue-priorities.md) (causing "an outage or a critical production issue") may be cherry picked.  P0 issues are those that:
  - cause privacy or security issues
  - cause user data loss
  - break existing AMP web pages in a significant way
  - or would otherwise cause a significant harm to AMP's reputation if left unresolved
- Regressions found in the canary that are not P0 *may* be approved if they can be resolved with a rollback.  Fixes other than rollbacks--no matter how simple they may seem--will not be approved because these can cause cascading problems and delay the release of canary to production for everyone.

### Process for requesting a cherry pick

Use the following process to request a cherry pick if you have a change that you believe meets the [cherry pick criteria](#cherry-pick-criteria).

If you run into any issues or have any questions when requesting a cherry pick, please use the [AMP Slack #release channel](https://amphtml.slack.com/messages/C4NVAR0H3/) ([sign up for Slack](https://bit.ly/amp-slack-signup)).

- Ensure there is a GitHub issue filed for the problem that needs to be resolved *before* filing the cherry pick request issue.
- File the cherry pick request issue using the [Cherry pick request template](https://github.com/ampproject/amphtml/issues/new?title=%F0%9F%8C%B8%20Cherry%20pick%20request%20for%20%3CYOUR_ISSUE_NUMBER%3E%20into%20%3CRELEASE_ISSUE_NUMBER%3E%20%28Pending%29&template=cherry_pick_template.md).  Follow the instructions in the template, providing all of the requested data.  **Make sure you fill out this issue completely or your cherry pick may not be seen or acted upon.**
- **The [TL](../GOVERNANCE.md) or their designate is the only person who may approve cherry picks.**  The TL/designate will update the issue with their decision about whether your fix warrants a cherry pick.  You should be available to respond to any questions the TL/designate has regarding your request.
- If the TL/designate approves the cherry pick, the person currently handling releases (onduty) will work with you to ensure the cherry pick is made.
- **Once the cherry pick is made you are responsible for verifying that the cherry pick you requested fixes the reported issue and that it does not cause other issues.**

**If you are requesting a cherry pick to fix an issue in production** it is very likely you will *also* need a cherry pick into the canary release since otherwise the problem your cherry pick addresses would reappear as soon as the canary release is pushed to production.  Work with the onduty person to determine if you need a cherry pick to both and make sure your cherry pick request issue reflects what you determine.


## AMP Dev Channel

The AMP Dev Channel is a way to opt a browser into using the canary release build of the AMP JS libraries.  The Dev Channel **may be less stable** and it may contain features not yet available to all users.

Opting into the Dev Channel is great to:

- test and play with new features not yet available to all users
- use in Quality Assurance (QA) to ensure that your site is compatible with the next version of AMP

When you opt into the AMP Dev Channel you are only affecting the AMP JS libraries in your browser; there is no way to force visitors to your site to use the AMP Dev Channel version of AMP.

To opt your browser into the AMP Dev Channel, go to [the AMP experiments page](https://cdn.ampproject.org/experiments.html) and activate the "AMP Dev Channel" experiment. Please subscribe to our [low-volume announcements](https://groups.google.com/forum/#!forum/amphtml-announce) mailing list to get notified about important/breaking changes about AMP.

**If you find an issue that appears to only occur in the Dev Channel version of AMP**:
- please [file an issue](https://github.com/ampproject/amphtml/issues/new) with a description of the problem
  - include a note that the problem is new to the Dev Channel build so that it can be properly prioritized
  - include a URL to a page that reproduces the problem
- ping the [AMP Slack #release channel](https://amphtml.slack.com/messages/C4NVAR0H3/) ([sign up for Slack](https://bit.ly/amp-slack-signup)) with the issue you filed so we can delay the push of the Dev Channel version to production if needed

## Release cadence

We are intentionally cautious with our release cadence.

In determining how often we should push new versions of AMP to everyone, we have to weigh many factors including:

- stability for the millions of sites/billions of pages built using AMP
- cache busting that might happen when we push a new version
- the desire to get new features out quickly

After considering all of these factors we have arrived at the 1-2 week push cycle.  Thus far we have found this to be a reasonable compromise, but we will continue to evaluate all of these factors and may make changes in the future.

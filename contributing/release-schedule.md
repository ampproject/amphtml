# Release Schedule

- [Release Channels](#release-channels)
  - [Nightly](#nightly)
  - [Weekly](#weekly)
  - [LTS](#lts)
- [Determining if your change is in a release](#determining-if-your-change-is-in-a-release)
- [Release Cadence](#release-cadence)
  - [Detailed schedule](#detailed-schedule)
- [Cherry-picks](#cherry-picks)
  - [Process for requesting a cherry-pick](#process-for-requesting-a-cherry-pick)
- [Opt-In Cookie](#opt-in-cookie)
  - [AMP Dev Channel (Experimental)](#amp-dev-channel-experimental)
  - [AMP Beta Channel (Beta)](#amp-beta-channel-beta)
- [Release Freezes](#release-freezes)

A new release of AMP is pushed to all AMP pages every week on Tuesday. **Once a change in AMP is merged into the master branch of the amphtml repository, it will typically take 1-2 weeks for the change be live for all users.**

## Release Channels

The AMP Runtime and extensions are provided through a variety of different *release channels*. Each channel serves a purpose for developers and for the AMP HTML Project itself. See the [release cadence section](#release-cadence) for a more detailed breakdown.

### Nightly

The **nightly** release channel is updated (as its name indicates) every weeknight. This process is automated, and there is no guarantee that any given nightly release is free of bugs or other issues. Each night after midnight, the last "green" commit from the day is selected to be the release cutoff point. A green build indicates that all automated tests have passed on that bulid.

The nightly release provides a mechanism to detect and resolve issues quickly and before they reach the more traffic-heavy _weekly_ release channels. It also serves to reduce the number of users affected by newly introduced issues

The **nightly** release build is served to 0.05% of AMP traffic. It is possible to opt into the **nightly** channel via the `AMP_CANARY` cookie; see the [Opt-In Cookie section](#opt-in-cookie) for details.

An additional **nightly-control** release channel exists, and is also served to 0.05% of AMP traffic. This release contains the same binaries as **stable**, and is used as a traffic-eqivalent baseline to compare **nightly** against for metrics and error reporting. It cannot be opted into.

### [Weekly](#weekly)

The _weekly_ release channels are considered to be the primary "evergreen" release channels. The last **nightly** release from the previous week is promoted to the  **experimental** and **beta** release channels; the **beta** release from the previous week is promoted to the **stable** release channel.

There are two sets of build configurations used in creating release builds: the _canary_ configuration and the _production_ configuration. The **experimental** and **beta** release channels are built off of the same commit, but with the _canary_ and _production_ configurations, respectively. The _canary_ configuration enables experimental components and features that may be turned off in _production_. Each is served to 0.5% of AMP traffic. It is possible to opt into the **experimental** or **beta** channels via the `AMP_CANARY` cookie; see the [Opt-In Cookie section](#opt-in-cookie) for details.

The **stable** release is built with the _production_ configuration and served to most AMP traffic. Since the **beta** release is also built from the _production_ configuration, it represents the exact build which will become **stable** the following week (ignoring the possibility of [cherry-picks](#cherry-picks)).

An additional **control** release channel exists, and is also served to 0.5% of AMP traffic. This release contains the same binaries as **stable**, and is used as a traffic-eqivalent baseline to compare **experimental** and **beta** against for metrics and error reporting. It cannot be opted into.

See the [release cadence section](#release-cadence) for a more detailed breakdown of the release promotion cadence. To determine if a PR has been included in the current _weekly_ release, look for the GitHub labels _PR Use: In Canary_ or _PR Use: In Production_.

### LTS

The **lts** release channel provides a previous **stable** build for four-month intervals. Every four weeks, the current **stable** release is promoted to **lts**. This is not recommended for all AMP partners, but is provided so partners performing a QA cycle may do so less often. The **lts** release must be explicitly opted into by adding `/lts` to the path of the runtime and extension scripts requested in the page:

```html
<!-- Standard AMP HTML runtime and extension scripts -->
<script async src="https://cdn.ampproject.org/v0.js"></script>
<script async custom-element='amp-ad'
     src='https://cdn.ampproject.org/v0/amp-ad-0.1.js'></script>

<!-- LTS AMP HTML runtime and extension scripts -->
<script async src="https://cdn.ampproject.org/lts/v0.js"></script>
<script async custom-element='amp-ad'
     src='https://cdn.ampproject.org/lts/v0/amp-ad-0.1.js'></script>
```

As long as all runtime and extension scripts in a page must use the same release version, requesting the LTS scripts is considered valid AMP and gets the same cache benefits as the **stable** release channel.

One trade-off to be aware of is that, because the **lts** release is updated every four weeks, the release binaries may be as much as six weeks behind the `HEAD` of `ampproject/amphtml`. For this reason, partners using the **lts** release channel should not use very newly introduced features. See the section on [determining if your change is in a release](#Determining-if-your-change-is-in-a-release).

## Determining if your change is in a release

[_Type: Release_ GitHub issues](https://github.com/ampproject/amphtml/labels/Type%3A%20Release) are used to track the status of current and past releases (from the initial cut to **experimantal**/**beta** testing to **stable**). Announcements about releases are made on the [AMP Slack #release channel](https://amphtml.slack.com/messages/C4NVAR0H3/) ([sign up for Slack](https://bit.ly/amp-slack-signup)).

You can determine what changes are in a given build using one of the following:

- The [_Type: Release_ GitHub issues](https://github.com/ampproject/amphtml/labels/Type%3A%20Release) for each release build will include a link to the specific [release page](https://github.com/ampproject/amphtml/releases) listing the PRs in that release.
  - The most recent _Type: Release_ issue with _(Production)_ in the title tracks the build currently in the **stable** release.
  - The _Type: Release_ issue with _(Canary)_ in the title tracks the build currently in the **experimental**/**beta** releases.
- The [_PR Use: In Canary_](https://github.com/ampproject/amphtml/issues?utf8=%E2%9C%93&q=label%3A%22PR%20use%3A%20In%20Canary%22), [_PR Use: In Production_](https://github.com/ampproject/amphtml/issues?utf8=%E2%9C%93&q=label%3A%22PR%20use%3A%20In%20Production%22), and [_PR Use: In LTS_](https://github.com/ampproject/amphtml/issues?utf8=%E2%9C%93&q=label%3A%22PR%20use%3A%20In%20LTS%22) labels are added to PRs when they've made it into a _weekly_ or **lts** build. There may be a delay between when the build is created and when the label is added.

## Release Cadence

We are intentionally cautious with our release cadence.

In determining how often we should push new versions of AMP to everyone, we have to weigh many factors including:

- stability for the millions of sites/billions of pages built using AMP
- cache busting that might happen when we push a new version
- the desire to get new features out quickly

After considering all of these factors we have arrived at the 1-2 week push cycle. Thus far we have found this to be a reasonable compromise, but we will continue to evaluate all of these factors and may make changes in the future.


### Detailed schedule

We try to stick to this schedule as closely as possible, though complications may cause delays. You can track the latest status about any release in the [_Type: Release_ GitHub issues](https://github.com/ampproject/amphtml/labels/Type%3A%20Release) and the [AMP Slack #release channel](https://amphtml.slack.com/messages/C4NVAR0H3/) ([sign up for Slack](https://bit.ly/amp-slack-signup)).

- Tuesday @ [11am Pacific](https://www.google.com/search?q=11am+pacific+in+current+time+zone): a new canary release build is created from the [latest master build that passes all of our tests](https://travis-ci.org/ampproject/amphtml/branches) and is pushed to users of AMP who opted into the [AMP Dev Channel](#amp-dev-channel)
- Wednesday: we check bug reports for _Dev Channel_ users and if everything looks fine, we push the canary to 1% of AMP pages
- Thursday-Monday: we continue to monitor error rates and bug reports for _Dev Channel_ users and the 1% of pages with the **experimental**/**beta** builds
- Tuesday (about a week after the **beta** release build was cut): the **beta** build is fully promoted to **stable** (i.e. all AMP pages will now use this build)
TODO: Flow chart/diagrams and explanations

## Cherry-picks

We have a well-defined process for handling requests for changes to the **experimental**/**beta**, **stable**, or **lts** release builds. These changes are known as "cherry-picks".

> Note: We do not support cherry-picks into the **nightly** release channel; in the event of security or privacy issues, a rollback is performed instead.

**The bar for getting a cherry-pick into a live release is very high** because our goal is to produce high quality launches on a predictable schedule.

**Keep in mind that performing a cherry-pick requires a significant amount of work from you and the on-duty engineer** and they can take a long time to process.

- In general only fixes for [P0 issues](https://github.com/ampproject/amphtml/blob/master/contributing/issue-priorities.md) (causing "an outage or a critical production issue") may be cherry-picked. P0 issues are those that:
  - cause privacy or security issues
  - cause user data loss
  - break existing AMP web pages in a significant way
  - or would otherwise cause a significant harm to AMP's reputation if left unresolved
- Regressions found in the **experimental**/**beta** releases that are not P0 _may_ be approved if they can be resolved with a rollback. Fixes other than rollbacks--no matter how simple they may seem--will not be approved because these have the potential to cause cascading problems and delay the release promotion of **beta** to **stable** for everyone.

### Process for requesting a cherry-pick

Use the following process to request a cherry-pick if you have a change that you believe meets the [cherry-pick criteria](#cherry-pick-criteria).

If you run into any issues or have any questions when requesting a cherry-pick, please use the [AMP Slack #release channel](https://amphtml.slack.com/messages/C4NVAR0H3/) ([sign up for Slack](https://bit.ly/amp-slack-signup)).

- Ensure there is a GitHub issue filed for the problem that needs to be resolved _before_ filing the cherry-pick request issue.
- File the cherry-pick request issue using the [Cherry-pick request template](https://github.com/ampproject/amphtml/issues/new?title=%F0%9F%8C%B8%20Cherry%20pick%20request%20for%20%3CYOUR_ISSUE_NUMBER%3E%20into%20%3CRELEASE_ISSUE_NUMBER%3E%20%28Pending%29&template=cherry_pick_template.md). Follow the instructions in the template, providing all of the requested data. **Make sure you fill out this issue completely or your cherry-pick may not be seen or acted upon.**
- Get the necessary approval for your cherry-pick (indicated via comments on the cherry-pick request issue).
  - For cherry-picks into canary, at least one member of the [Approvers WG](https://github.com/orgs/ampproject/teams/wg-approvers/members) must approve the cherry-pick.
  - For cherry-picks into prod:
    - if the fix is a clean rollback that does not require any other changes, at least one member of the [Approvers WG](https://github.com/orgs/ampproject/teams/wg-approvers/members) must approve the cherry-pick.
    - otherwise, at least one member from the [Cherry-Pick Approvers group](https://github.com/orgs/ampproject/teams/cherry-pick-approvers/members) must approve the cherry-pick.
- After the cherry-pick has been approved, the person currently handling releases (on-duty engineer) will work with you to ensure the cherry-pick is made.
- **Once the cherry-pick is made you are responsible for verifying that the cherry-pick you requested fixes the reported issue and that it does not cause other issues.**

**If you are requesting a cherry-pick to fix an issue in production** it is very likely you will _also_ need a cherry-pick into the **experimental**/**beta** releases since otherwise the problem your cherry-pick addresses would reappear as soon as the **beta** release is promoted to **stable**. Work with the on-duty engineer to determine if you need a cherry-pick to both release channels and make sure your cherry-pick request issue reflects what you determine.

## Opt-In Cookie

TODO(danielrozenberg): Write up opt-in cookie docs for nightly, update this section

### AMP Dev Channel (Experimental)

The _AMP Dev Channel_ is a way to opt a browser into using the **experimental** release build of the AMP JS libraries. The _Dev Channel_ **may be less stable** and it may contain features not yet available to all users.

Opting into the _Dev Channel_ is great to:

- test and play with new features not yet available to all users
- use in Quality Assurance (QA) to ensure that your site is compatible with upcoming features of AMP that are still under development

When you opt into the _AMP Dev Channel_ you are only affecting the AMP JS libraries in your browser; there is no way to force visitors to your site to use the _AMP Dev Channel_ version of AMP.

To opt your browser into the _AMP Dev Channel_, go to [the AMP experiments page](https://cdn.ampproject.org/experiments.html) and activate the "AMP Dev Channel" experiment. Please subscribe to our [low-volume announcements](https://groups.google.com/forum/#!forum/amphtml-announce) mailing list to get notified about important/breaking changes about AMP.

**If you find an issue that appears to only occur in the Dev Channel version of AMP**:

- please [file an issue](https://github.com/ampproject/amphtml/issues/new) with a description of the problem
  - include a note that the problem is new to the Dev Channel build so that it can be properly prioritized
  - include a URL to a page that reproduces the problem
- ping the [AMP Slack #release channel](https://amphtml.slack.com/messages/C4NVAR0H3/) ([sign up for Slack](https://bit.ly/amp-slack-signup)) with the issue you filed so we can delay the push of the Dev Channel version to production if needed

### AMP Beta Channel (Beta)

The _AMP Beta Channel_ is a way to opt a browser into using the **beta** release build of the AMP JS libraries that will be promoted to **stable** during the subsequent release cycle (typically, a week later). It is similar to the _Dev Channel_ described above, but it will not contain the experimental features that are still under development.

Opting into the _Beta Channel_ is great to:

- test and play with the version of the AMP runtime that will be released soon
- use in Quality Assurance (QA) to ensure that your site is compatible with the next version of AMP

Similar to the _Dev Channel_, when you opt into the _AMP Beta Channel_ you are only affecting the AMP JS libraries in your browser; there is no way to force visitors to your site to use the _AMP Beta Channel_ version of AMP.

To opt your browser into the _AMP Beta Channel_, go to [the AMP experiments page](https://cdn.ampproject.org/experiments.html) and activate the "AMP RC Channel" experiment. Please subscribe to our [low-volume announcements](https://groups.google.com/forum/#!forum/amphtml-announce) mailing list to get notified about important/breaking changes about AMP.

> Note: "RC" refers to the term "Release Candidate", which was the previous name for the **beta** release channel.

**If you find an issue that appears to only occur in the _Beta Channel_ version of AMP**:

- please [file an issue](https://github.com/ampproject/amphtml/issues/new) with a description of the problem
  - include a note that the problem is new to the _Beta Channel_ build so that it can be properly prioritized
  - include a URL to a page that reproduces the problem
- ping the [AMP Slack #release channel](https://amphtml.slack.com/messages/C4NVAR0H3/) ([sign up for Slack](https://bit.ly/amp-slack-signup)) with the issue you filed so we can delay the push of the _Beta Channel_ version to production if needed

## Release Freezes

There are occasions when we will skip a release of AMP to production, known as a release freeze.

If a one week release freeze is announced for Week N:

- The previous week's release build remains in **experimental**/**beta** for an extra week, i.e. the release cut in Week N-1 is not pushed to **stable** in Week N as would normally be the case. Instead, it will be pushed to **stable** in Week N+1.
- A new release build is _not_ made in the freeze week (Week N).
- The normal schedule will resume in Week N+1, i.e. **experimental**/**beta** are cut in Week N+1 and promoted to **stable** in Week N+2.

A release freeze may happen due to:

- Times when there are not enough people available to push the AMP release to **stable** and monitor it. Currently most of the people performing AMP releases are based in the United States, so this will usually be the weeks of the major US holidays of Independence Day (July 4), Thanksgiving (fourth Thursday in November), Christmas (25 December) and New Year's Eve/Day (December 31/January 1).
- An emergency situation, such as a security or privacy issue as determined by the [Technical Steering Committee (TSC)](https://github.com/ampproject/meta-tsc) or the people performing the release.
- Other situations when stability of the codebase is deemed to be particularly important as determined by the TSC.

In all cases except emergencies the release freezes will be announced at least one month in advance.

Note that unless otherwise announced a release freeze does not imply a code freeze. Code may still be written, reviewed and merged during a release freeze.

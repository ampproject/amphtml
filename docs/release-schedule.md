# Release Schedule

<!--
  (Do not remove or edit this comment.)

  This table-of-contents is automatically generated. To generate it, run:
    amp markdown-toc --fix
-->

-   [Release Channels](#release-channels)
    -   [Nightly](#nightly)
    -   [Weekly](#weekly)
        -   [Beta and Experimental channels](#beta-and-experimental-channels)
    -   [Long-Term Stable (lts)](#long-term-stable-lts)
-   [Determining if your change is in a release](#determining-if-your-change-is-in-a-release)
-   [Release Cadence](#release-cadence)
    -   [Detailed schedule](#detailed-schedule)
    -   [Release Freezes](#release-freezes)

A new release of AMP is pushed to all AMP pages every week on Tuesday. **Once a change in AMP is merged into the main branch of the amphtml repository, it will typically take 1-2 weeks for the change to be live for all users.**

The [AMPHTML Validator](https://github.com/ampproject/amphtml/tree/main/validator#amp-html--validator) has it's own [Release Schedule](validator-release-schedule.md)

## Release Channels

The AMP runtime and extensions are provided through a variety of different _release channels_. Each channel serves a purpose for developers and for the AMP HTML Project itself. See the [release cadence section](#release-cadence) for a more detailed breakdown of how and when code from the [`ampproject/amphtml`](https://github.com/ampproject/amphtml) repository makes it into release builds.

To determine if a PR has been included in any of the following release channels, look for the GitHub labels _PR Use: In Canary_, _PR Use: In Production_, or _PR Use: In LTS_ (see the section on [determining if your change is in a release](#Determining-if-your-change-is-in-a-release) for more details).

### Nightly

The **nightly** release channel is updated (as its name indicates) every weeknight. This process is automated, and there is no guarantee that any given nightly release is free of bugs or other issues. Each night after midnight (Pacific Time), the last "green" commit from the day is selected to be the release cutoff point. A green build indicates that all automated tests have passed on that build.

The nightly release provides a mechanism to detect and resolve issues quickly and before they reach the more traffic-heavy _weekly_ release channels. It also serves to reduce the number of users affected by newly introduced issues.

It is possible to opt into the **nightly** channel, to test pull requests that were merged in the past few days. See the [opt-in section](developing.md#opting-in-to-pre-release-channels) in [developing.md] for details.

### Weekly

The _weekly_ release channels are considered to be the primary "evergreen" release channels. Each week the **beta** release from the previous week is promoted to the **stable** release channel, and the last **nightly** release from the previous week is promoted to the **experimental** and **beta** release channels (see the [detailed schedule](#detailed-schedule)).

There are two sets of build configurations used in creating release builds: the _canary_ configuration and the _production_ configuration. The **experimental** and **beta** release channels are built off of the same commit. However, the **experimental** channel uses the _canary_ configuration while the **beta** channel uses the _production_ configuration. The _canary_ configuration enables experimental components and features that may be turned off in _production_. It is possible to opt into the **experimental** or **beta** channels via the [experiments page](https://cdn.ampproject.org/experiments.html).

The **stable** release channel is built with the _production_ configuration and served to most AMP traffic. Since the **beta** release channel is also built from the _production_ configuration, it represents the exact build which will become **stable** the following week (with the possibility of cherry-picks to fix last-minute issues; see [Contributing Code](https://github.com/ampproject/amphtml/blob/main/docs/contributing-code.md#Cherry-picks)).

#### Beta and Experimental channels

The _Beta_ and _Experimental Channels_ are pre-release candidates for the next Stable release of AMP. Every Tuesday (except for weeks where there is a [release freeze](#release-freezes)), last week's **nightly** is promoted to the developer opt-in channels for **beta** and **experimental**. Following a 1-day period where we verify that no feature or performance regressions were introduced in these channels, we promote this release on Wednesday to a small portion of traffic. This same release is then promoted to the **stable** channel on Tuesday the following week.

It is possible to opt into these channels. See the [opt-in section](developing.md#opting-in-to-pre-release-channels) in [developing.md] for details.

Opting into the _Beta Channel_ is intended for:

-   testing and playing with the version of the AMP runtime that will be released soon
-   using in Quality Assurance (QA) to ensure that your site is compatible with the next version of AMP

The _Experimental Channel_ is intended for:

-   testing and playing with new features not yet available to all users
-   using in Quality Assurance (QA) to ensure that your site is compatible with upcoming features of AMP that are still under development

The _Experimental Channel_ **may be less stable** and it may contain features not yet available to all users.

### Long-Term Stable (lts)

The **lts** release channel provides a previous **stable** build for one-month intervals. On the second Monday of each month, the current **stable** release is promoted to **lts**. This channel is not recommended for all AMP publishers. It is provided so that publishers who wish to perform a QA cycle on their website less frequently may do so by opting specific web pages into the **lts** channel (see the [**lts** readme](https://github.com/ampproject/amphtml/blob/main/docs/lts-release.md)).

If the second Monday of the month falls on a holiday, the promotion will be performed after the end of the [release freeze](#release-freezes).

Important: Publishers using the **lts** release channel should not use newly introduced features. Because of the longer cycle, the **lts** release may be as much as seven weeks behind the `HEAD` of [`ampproject/amphtml`](https://github.com/ampproject/amphtml). See the section on [determining if your change is in a release](#Determining-if-your-change-is-in-a-release) to validate if a change will be ready with your chosen release cycle.

## Determining if your change is in a release

[_Type: Release_ GitHub issues](https://github.com/ampproject/amphtml/labels/Type%3A%20Release) are used to track the status of current and past releases; from the initial cut, to testing via **experimental**/**beta** channels, to eventual release via the **stable** and **lts** channels. Announcements about releases are made on the [AMP Slack #release channel](https://amphtml.slack.com/messages/C4NVAR0H3/) ([sign up for Slack](https://bit.ly/amp-slack-signup)).

You can determine what changes are in a given release using one of the following:

-   The [_Type: Release_ GitHub issues](https://github.com/ampproject/amphtml/labels/Type%3A%20Release) for each release will include a link to the specific [release page](https://github.com/ampproject/amphtml/releases) listing the changes contained in that release.
-   The [_PR Use: In Beta / Experimental_](https://github.com/ampproject/amphtml/issues?q=label%3A%22PR+use%3A+In+Beta+%2F+Experimental%22), [_PR Use: In Stable_](https://github.com/ampproject/amphtml/issues?utf8=%E2%9C%93&q=label%3A%22PR%20use%3A%20In%20Production%22), and [_PR Use: In LTS_](https://github.com/ampproject/amphtml/issues?utf8=%E2%9C%93&q=label%3A%22PR%20use%3A%20In%20LTS%22) labels are added to PRs when they've made it into a _weekly_ or **lts** release. There may be a delay between when the release is created and when the label is added.

## Release Cadence

We are intentionally cautious with our release cadence.

In determining how often we should push new versions of AMP to everyone, we have to weigh many factors including:

-   stability for the millions of sites/billions of pages built using AMP
-   cache-busting that might happen when we push a new version
-   the desire to get new features out quickly

After considering all of these factors, we have arrived at the 1-2 week push cycle. Thus far, we have found this to be a reasonable compromise, but we will continue to evaluate all of these factors and may make changes in the future.

### Detailed schedule

We try to stick to this schedule as closely as possible, though complications may cause delays. You can track the latest status about any release in the [_Type: Release_ GitHub issues](https://github.com/ampproject/amphtml/labels/Type%3A%20Release) and the [AMP Slack #release channel](https://amphtml.slack.com/messages/C4NVAR0H3/) ([sign up for Slack](https://bit.ly/amp-slack-signup)).

-   Every weeknight: a new **nightly** build is automatically cut and released to the [AMP Nightly Channel](#nightly).
-   Tuesday @ [11am Pacific](https://www.google.com/search?q=11am+pacific+in+current+time+zone): new **experimental** and **beta** releases are created from a recent known-good nightly channel release and are served to users who opted into the [AMP Experimental Channel](#amp-experimental-and-beta-channels) or [AMP Beta Channel](#amp-experimental-and-beta-channels), respectively.
-   Wednesday: we check bug reports for _Experimental Channel_ and _Beta Channel_ users and if everything looks fine, we push the **beta** to 1% of AMP pages
-   Thursday-Monday: we continue to monitor error rates and bug reports for _Experimental Channel_ and _Beta Channel_ users and the 1% of pages with the **experimental**/**beta** builds
-   Tuesday the following week: the **beta** release is fully promoted to **stable** (i.e. all AMP pages will now use this release)

### Release Freezes

There are occasions when we will skip a release of AMP to production, known as a release freeze.

If a one week release freeze is announced for Week N:

-   The previous week's **stable** release will remain for an extra week, i.e. a new release will not be promoted to **stable** in Week N as would normally be the case.
-   However, new **beta** and **experimental** releases will be created during the freeze week (Week N).
-   The normal schedule will resume in Week N+1, i.e. the **experimental**/**beta** releases from Week N are promoted to **stable** in Week N+1. In addition, new **experimental**/**beta** releases are created in Week N+1 and will be promoted to **stable** during Week N+2.
-   If the **stable** release promoted during Week N-1 was originally scheduled to be promoted to **lts** during Week N, it will now be promoted to **lts** on the Monday of Week N+1.
-   **nightly** releases are still generated and promoted, as they are fully automated.

A release freeze may happen due to:

-   Times when there are not enough people available to push the AMP release to **stable** and monitor it. Currently, most of the people performing AMP releases are based in the United States, so this will usually be the weeks of the major US holidays of Independence Day (July 4), Thanksgiving (fourth Thursday in November), Christmas (25 December), and New Year's Eve/Day (December 31/January 1).
-   An emergency situation, such as a security or privacy issue as determined by the [Technical Steering Committee (TSC)](https://github.com/ampproject/meta-tsc) or the people performing the release.
-   Other situations when the stability of the codebase is deemed to be particularly important as determined by the TSC.

In all cases, except emergencies, the release freezes will be announced at least one month in advance.

Note that unless otherwise announced a release freeze does not imply a code freeze. Code may still be written, reviewed and merged during a release freeze.

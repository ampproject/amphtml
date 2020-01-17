# Release Schedule

- [Release Channels](#release-channels)
  - [Weekly](#weekly)
  - [Long-Term Stable (lts)](#long-term-stable-lts)
  - [AMP Experimental and Beta Channels](#amp-experimental-and-beta-channels)
- [Determining if your change is in a release](#determining-if-your-change-is-in-a-release)
- [Release Cadence](#release-cadence)
  - [Detailed schedule](#detailed-schedule)
  - [Release Freezes](#release-freezes)

A new release of AMP is pushed to all AMP pages every week on Tuesday. **Once a change in AMP is merged into the master branch of the amphtml repository, it will typically take 1-2 weeks for the change be live for all users.**

## Release Channels

The AMP runtime and extensions are provided through a variety of different _release channels_. Each channel serves a purpose for developers and for the AMP HTML Project itself. See the [release cadence section](#release-cadence) for a more detailed breakdown of how and when code from the [`ampproject/amphtml`](https://github.com/ampproject/amphtml) repository makes it into release builds.

To determine if a PR has been included in any of the following release channels, look for the GitHub labels _PR Use: In Canary_, _PR Use: In Production_, or _PR Use: In LTS_ (see the section on [determining if your change is in a release](#Determining-if-your-change-is-in-a-release) for more details).

### Weekly

The _weekly_ release channels are considered to be the primary "evergreen" release channels. A green build from the `master` branch is used to build the **experimental** and **beta** release channels; the **beta** release from the previous week is promoted to the **stable** release channel (see the [detailed schedule](#detailed-schedule)).

There are two sets of build configurations used in creating release builds: the _canary_ configuration and the _production_ configuration. The **experimental** and **beta** release channels are built off of the same commit. However, the **experimental** channel uses the _canary_ configuration while the **beta** channel uses the _production_ configuration. The _canary_ configuration enables experimental components and features that may be turned off in _production_. It is possible to opt into the **experimental** or **beta** channels via the [experiments page](https://cdn.ampproject.org/experiments.html).

The **stable** release channel is built with the _production_ configuration and served to most AMP traffic. Since the **beta** release channel is also built from the _production_ configuration, it represents the exact build which will become **stable** the following week (modulo the possibility of cherry-picks; see [Contributing Code](https://github.com/ampproject/amphtml/blob/master/contributing/contributing-code.md#Cherry-picks)).

### Long-Term Stable (lts)

The **lts** release channel provides a previous **stable** build for one-month intervals. Approximately monthly, the current **stable** release is promoted to **lts**. This channel is not recommended for all AMP publishers. It is provided so that publishers who wish to perform a QA cycle on their website less frequently may do so by opting specific web pages into the **lts** channel (see the [**lts** readme](https://github.com/ampproject/amphtml/blob/master/contributing/lts-release.md)).

Important: Publishers using the **lts** release channel should not use newly introduced features. Because of the longer cycle, the **lts** release may be as much as seven weeks behind the `HEAD` of [`ampproject/amphtml`](https://github.com/ampproject/amphtml). See the section on [determining if your change is in a release](#Determining-if-your-change-is-in-a-release) to validate if a change will be ready with your chosen release cycle.

## Determining if your change is in a release

[_Type: Release_ GitHub issues](https://github.com/ampproject/amphtml/labels/Type%3A%20Release) are used to track the status of current and past releases; from the initial cut, to testing via **experimantal**/**beta** channels, to eventual release via the **stable** and **lts** channels. Announcements about releases are made on the [AMP Slack #release channel](https://amphtml.slack.com/messages/C4NVAR0H3/) ([sign up for Slack](https://bit.ly/amp-slack-signup)).

You can determine what changes are in a given build using one of the following:

- The [_Type: Release_ GitHub issues](https://github.com/ampproject/amphtml/labels/Type%3A%20Release) for each release build will include a link to the specific [release page](https://github.com/ampproject/amphtml/releases) listing the changes contained in that release.
- The [_PR Use: In Canary_](https://github.com/ampproject/amphtml/issues?utf8=%E2%9C%93&q=label%3A%22PR%20use%3A%20In%20Canary%22), [_PR Use: In Production_](https://github.com/ampproject/amphtml/issues?utf8=%E2%9C%93&q=label%3A%22PR%20use%3A%20In%20Production%22), and [_PR Use: In LTS_](https://github.com/ampproject/amphtml/issues?utf8=%E2%9C%93&q=label%3A%22PR%20use%3A%20In%20LTS%22) labels are added to PRs when they've made it into a _weekly_ or **lts** build. There may be a delay between when the build is created and when the label is added.

> Note: These labels still use legacy release names. They will be renamed soon to reflect the new release channel names (**beta** and **stable**).

### AMP Experimental and Beta Channels

The _AMP Experimental Channel_ is a way to opt a browser into using the **experimental** release build of the AMP JS libraries. The _Experimental Channel_ **may be less stable** and it may contain features not yet available to all users.

Opting into the _Experimental Channel_ is intended for:

- testing and playing with new features not yet available to all users
- using in Quality Assurance (QA) to ensure that your site is compatible with upcoming features of AMP that are still under development

To opt your browser into the _AMP Experimental Channel_, go to [the AMP experiments page](https://cdn.ampproject.org/experiments.html) and activate the "AMP Experimental Channel" experiment. Please subscribe to our [low-volume announcements](https://groups.google.com/forum/#!forum/amphtml-announce) mailing list to get notified about important/breaking changes about AMP.

The _AMP Beta Channel_ is a way to opt a browser into using the **beta** release build of the AMP JS libraries that will be promoted to **stable** during the subsequent release cycle (typically, a week later). It is similar to the _Experimental Channel_ described above, but it will not contain the experimental features that are still under development.

Opting into the _Beta Channel_ is intended for:

- testing and playing with the version of the AMP runtime that will be released soon
- using in Quality Assurance (QA) to ensure that your site is compatible with the next version of AMP

When you opt into the _Experimental_ or _Beta_ channel, you are only affecting the AMP JS libraries in your browser; there is no way to force visitors to your site to use the _AMP Experimental/Beta Channel_ version of AMP.

To opt your browser into one of these channels, go to [the AMP experiments page](https://cdn.ampproject.org/experiments.html) and activate the "AMP Experimental Channel" or "AMP Beta Channel" experiment. Please subscribe to our [low-volume announcements](https://groups.google.com/forum/#!forum/amphtml-announce) mailing list to get notified about important/breaking changes about AMP.

**If you find an issue that appears to only occur in the _Experimental/Beta Channel_ version of AMP**:

- please [file an issue](https://github.com/ampproject/amphtml/issues/new) with a description of the problem
  - include a note that the problem is new to the _Experimental/Beta Channel_ build so that it can be properly prioritized
  - include a URL to a page that reproduces the problem
- ping the [AMP Slack #release channel](https://amphtml.slack.com/messages/C4NVAR0H3/) ([sign up for Slack](https://bit.ly/amp-slack-signup)) with the issue you filed so we can delay the push of the _Experimental/Beta Channel_ version to production if needed

## Release Cadence

We are intentionally cautious with our release cadence.

In determining how often we should push new versions of AMP to everyone, we have to weigh many factors including:

- stability for the millions of sites/billions of pages built using AMP
- cache busting that might happen when we push a new version
- the desire to get new features out quickly

After considering all of these factors, we have arrived at the 1-2 week push cycle. Thus far, we have found this to be a reasonable compromise, but we will continue to evaluate all of these factors and may make changes in the future.

### Detailed schedule

We try to stick to this schedule as closely as possible, though complications may cause delays. You can track the latest status about any release in the [_Type: Release_ GitHub issues](https://github.com/ampproject/amphtml/labels/Type%3A%20Release) and the [AMP Slack #release channel](https://amphtml.slack.com/messages/C4NVAR0H3/) ([sign up for Slack](https://bit.ly/amp-slack-signup)).

- Tuesday @ [11am Pacific](https://www.google.com/search?q=11am+pacific+in+current+time+zone): new **experimental** and **beta** release builds are created from the [latest master build that passes all of our tests](https://travis-ci.org/ampproject/amphtml/branches) and are pushed to users of AMP who opted into the [AMP Experimental Channel](#amp-experimental-and-beta-channels) or [AMP Beta Channel](#amp-experimental-and-beta-channels), respectively.
- Wednesday: we check bug reports for _Experimental Channel_ and _Beta Channel_ users and if everything looks fine, we push the **beta** to 1% of AMP pages
- Thursday-Monday: we continue to monitor error rates and bug reports for _Experimental Channel_ and _Beta Channel_ users and the 1% of pages with the **experimental**/**beta** builds
- Tuesday the following week: the **beta** build is fully promoted to **stable** (i.e. all AMP pages will now use this build)

### Release Freezes

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

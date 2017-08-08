# Release Schedule

We push a new release of AMP to all AMP pages every week on Tuesday.

**It will typically take 1-2 weeks for a change in AMP to be live for all users.**  After a change is submitted it will be included in the next canary build cut on Mondays.  This canary build will be tested on our [Dev Channel](#amp-dev-channel) opt-in and with 1% of users for just over a week.  If no problems are found the canary build will then be pushed to all users.

You can determine what is in a given build using:

- the [releases page](https://github.com/ampproject/amphtml/releases); the release used by most users is marked as `Latest release` and the current Dev Channel release is marked as `Pre-release`
- the [PR Use: In Canary](https://github.com/ampproject/amphtml/issues?utf8=%E2%9C%93&q=label%3A%22PR%20use%3A%20In%20Canary%22) and [PR Use: In Production](https://github.com/ampproject/amphtml/issues?utf8=%E2%9C%93&q=label%3A%22PR%20use%3A%20In%20Production%22) labels; these are added to PRs when they've made it into a canary/production build (though note there may be a delay between the build is created and when it goes live)

Announcements regarding releases will be made on the [AMP Slack #release channel](https://amphtml.slack.com/messages/C4NVAR0H3/) ([sign up for Slack](https://docs.google.com/forms/d/e/1FAIpQLSd83J2IZA6cdR6jPwABGsJE8YL4pkypAbKMGgUZZriU7Qu6Tg/viewform?fbzx=4406980310789882877)).

## Release cadence

We are intentionally cautious with our release cadence.

In determining how often we should push new versions of AMP to everyone, we have to weigh many factors including:

- stability for the millions of sites/billions of pages built using AMP
- cache busting that might happen when we push a new version
- the desire to get new features out quickly

After considering all of these factors we have arrived at the 1-2 week push cycle.  Thus far we have found this to be a reasonable compromise, but we will continue to evaluate all of these factors and may make changes in the future.

## Detailed schedule

- Monday:  we create a canary build from a green release at the latest commit that passed all tests
- Tuesday:  this canary is pushed to users of AMP who opted into the [AMP Dev Channel](#amp-dev-channel)
- Thursday:  we check error rates for opt-in users and bug reports and if everything looks fine, we push the canary to 1% of AMP pages
- Friday-Monday: we continue to monitor error rates and bug reports
- Tuesday (about a week after the canary build was cut): the canary is pushed to all users

## AMP Dev Channel

AMP Dev Channel is a way to opt a browser into using a newer version of the AMP JS libraries.  This release **may be less stable** and it may contain features not available to all users. 

Opting into the Dev Channel is great to:

- test and play with new features not yet available to all users
- use in Quality Assurance (QA) to ensure that your site is compatible with the next version of AMP

When you opt into the AMP Dev Channel you are only affecting the AMP JS libraries in your browser; there is no way to force visitors to your site to use the AMP Dev Channel version of AMP.

To opt your browser into the AMP Dev Channel, go to [the AMP experiments page](https://cdn.ampproject.org/experiments.html) and activate the "AMP Dev Channel" experiment. Please subscribe to our [low-volume announcements](https://groups.google.com/forum/#!forum/amphtml-announce) mailing list to get notified about important/breaking changes about AMP.

If you find an issue that appears to only occur in the Dev Channel version of AMP, please [file an issue](https://github.com/ampproject/amphtml/issues/new) with a description of the problem. Please always include a URL to a page that reproduces the issue.

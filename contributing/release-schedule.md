# Release Schedule

We push a new release of AMP to all AMP pages every week on Thursday. The more detailed schedule is as follows:

- Every Wednesday we cut a green release at the latest commit that passed all tests.
- On Thursday this is pushed to users of AMP who opted into the [AMP Dev Channel](#amp-dev-channel).
- On Monday we check error rates for opt-in users and bug reports and if everything looks fine, we push this new release to 1% of AMP pages.
- We then continue to monitor error rates and bug reports throughout the week.
- On Thursday the "Dev Channel" release from last Thursday is then pushed to all users.

You can always follow the current release state of AMP on our [releases page](https://github.com/ampproject/amphtml/releases). The release used by most users is marked as `Latest release` and the current Dev Channel release is marked as `Pre-release`.

Announces regarding releases will be made on the [AMP Slack #release channel](https://amphtml.slack.com/messages/C4NVAR0H3/).  (You will need to [sign up for access](https://docs.google.com/forms/d/e/1FAIpQLSd83J2IZA6cdR6jPwABGsJE8YL4pkypAbKMGgUZZriU7Qu6Tg/viewform?fbzx=4406980310789882877) to AMP on Slack if you haven't done so already].)

### AMP Dev Channel

AMP Dev Channel is a way to opt a browser into using a newer version of the AMP JS libraries.

This release **may be less stable** and it may contain features not available to all users. Opt into this option if you'd like to help test new versions of AMP, report bugs or build documents that require a new feature that is not yet available to everyone.

Opting into Dev Channel is great to:

- test and play with new features not yet available to all users.
- use in Q&A to ensure that your site is compatible with the next version of AMP.

If you find an issue that appears to only occur in the Dev Channel version of AMP, please [file an issue](https://github.com/ampproject/amphtml/issues/new) with a description of the problem. Please always include a URL to a page that reproduces the issue.

To opt your browser into the AMP Dev Channel, go to [the AMP experiments page](https://cdn.ampproject.org/experiments.html) and activate the "AMP Dev Channel" experiment. Please subscribe to our [low-volume announcements](https://groups.google.com/forum/#!forum/amphtml-announce) mailing list to get notified about important/breaking changes about AMP.

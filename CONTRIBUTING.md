# Contributing to AMP HTML

The AMP HTML project strongly encourages technical [contributions](https://www.ampproject.org/contribute/)!

We hope you'll become an ongoing participant in our open source community but we also welcome one-off contributions for the issues you're particularly passionate about.

**If you have questions about using AMP or are encountering problems using AMP on your site please visit our [support page](SUPPORT.md) for help.**

- [Reporting issues with AMP](#reporting-issues-with-amp)
  * [Bugs](#bugs)
  * [Suggestions and feature requests](#suggestions-and-feature-requests)
- [Contributing code](#contributing-code)
  * [Tips for new open source contributors](#tips-for-new-open-source-contributors)
  * [How to contribute code](#how-to-contribute-code)
- [Contributing features](#contributing-features)
- [Contributing extended components](#contributing-extended-components)
- [Contributor License Agreement](#contributor-license-agreement)
- [Ongoing participation](#ongoing-participation)
  * [Discussion channels](#discussion-channels)
  * [Status updates](#status-updates)
  * [Weekly design reviews](#weekly-design-reviews)
  * [Working groups](#working-groups)
  * [See Also](#see-also)

## Reporting issues with AMP

### Bugs

If you find a bug in AMP, please [file a GitHub issue](https://github.com/ampproject/amphtml/issues/new).  Members of the community are regularly monitoring issues and will try to fix open bugs quickly according to our [prioritization guidelines](https://github.com/ampproject/amphtml/blob/master/contributing/issue-priorities.md).

The best bug reports provide a detailed description of the issue (including screenshots if possible), step-by-step instructions for predictably reproducing the issue, and possibly even a working example that demonstrates the issue.

### Suggestions and feature requests

The AMP Project is meant to evolve with feedback.  The project and its users appreciate your thoughts on ways to improve the design or features.

To make a suggestion or feature request [file a GitHub issue](https://github.com/ampproject/amphtml/issues/new) describing your idea.

If you are suggesting a feature that you are intending to implement, please see the [Contributing features](#contributing-features) section below for next steps.

## Contributing code

The AMP Project accepts and greatly appreciates code contributions!

If you are contributing code to the AMP Project consider [joining the AMP Project on GitHub](https://goo.gl/forms/T65peVtfQfEoDWeD3).

### Tips for new open source contributors

If you are new to contributing to an open source project, Git/GitHub, etc. welcome!  We are glad you're interested in contributing to the AMP Project and we want to help make your open source experience a success.

The [Getting Started End-to-End Guide](contributing/getting-started-e2e.md) provides step-by-step instructions for everything from creating a GitHub account to getting your code reviewed and merged.  Even if you've never contributed to an open source project before you'll soon be building AMP, making improvements and seeing your code live across the web.

The community has created a list of [Good First Issues](https://github.com/ampproject/amphtml/labels/good%20first%20issue) specifically for new contributors to the project.  Feel free to find one of the [unclaimed Good First Issues](https://github.com/ampproject/amphtml/issues?utf8=%E2%9C%93&q=is%3Aopen%20label%3A%22good%20first%20issue%22%20-label%3A%22GFI%20Claimed!%22) that interests you, claim it by adding a comment to it and jump in!

If you're interested in helping out but can't find a Good First Issue that matches your skills/interests, [sign up for our Slack](https://docs.google.com/forms/d/e/1FAIpQLSd83J2IZA6cdR6jPwABGsJE8YL4pkypAbKMGgUZZriU7Qu6Tg/viewform?fbzx=4406980310789882877) and then reach out in the [#welcome-contributors channel](https://amphtml.slack.com/messages/welcome-contributors/) or send a Direct Message to [mrjoro](https://amphtml.slack.com/team/mrjoro/).

If you run into any problems we have plenty of people who are willing to help; see the [How to get help](contributing/getting-started-e2e.md#how-to-get-help) section of the Getting Started guide.

### How to contribute code

The [Getting Started Quick Start Guide](contributing/getting-started-quick.md) has installation steps and instructions for building/testing AMP.

[DEVELOPING.md](contributing/DEVELOPING.md) has some more advanced instructions that may be necessary depending on the complexity of the changes you are making.

A few things to note:

* The AMP Project follows the [fork & pull](https://help.github.com/articles/using-pull-requests/#fork--pull) model for accepting contributions.
* Familiarize yourself with our [Design Principles](contributing/DESIGN_PRINCIPLES.md).
* We follow [Google's JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html).  More generally make sure to follow the same comment and coding style as the rest of the project.
* Include tests when contributing code.  There are plenty of tests that you can use as examples.
* A key feature of AMP is performance.  All changes will be analyzed for any performance impact; we particularly appreciate changes that make things even faster.  Please include any measured performance impact with substantial pull requests.

## Contributing features

Follow this process for contributing new features:
* Familiarize yourself with the [AMP Design Principles](contributing/DESIGN_PRINCIPLES.md)
* [Create a new GitHub issue](https://github.com/ampproject/amphtml/issues/new) to start discussion of the new feature.
* Before starting on the code get approval for your feature from an [OWNER](https://github.com/ampproject/amphtml/search?utf8=%E2%9C%93&q=filename%3AOWNERS.yaml&type=Code) of your feature's area and a [core committer](https://github.com/ampproject/amphtml/blob/master/GOVERNANCE.md#core-committers).  In most cases the people who can give this approval and are most familiar with your feature's area will get involved proactively or someone else in the community will add them.  If you are having trouble finding the right people add a comment on the issue or reach out on one of the channels in [How to get help](contributing/getting-started-e2e.md#how-to-get-help).
* Consider bringing the eng design for your feature to our [weekly design review](#weekly-design-review).
* Follow the guidelines for [Contributing code](#contributing-code) described above.

## Contributing extended components

A key feature of the AMP HTML project is its extensibility - it is meant to support “Extended Components” that provide first-class support for additional rich features.

Because Extended Components may have significant impact on AMP HTML performance, security, and usage, Extended Component contributions will be very carefully analyzed and scrutinized.

In particular we strive to design the overall component set, so that a large number of use cases can be composed from them. Instead of creating a new component it may thus be a better solution to combine existing components to a similar effect.

We have a few additional resources that provide an introduction to contributing extended components:
* ["Building an AMP Extension"](contributing/building-an-amp-extension.md) has a detailed description of how to build an AMP component.
* ["Creating your first AMP Component" codelab](https://codelabs.developers.google.com/codelabs/creating-your-first-amp-component/#0) provides a quick overview of the steps you need to go through to create a component with examples you can modify for your component.
* The ["Building a new AMP component" talk at AMP Conf 2017](https://youtu.be/FJEhQFNKeaQ?list=PLXTOW_XMsIDTDXYO-NAi2OpEH0zyguvqX) provides an introduction to contributing AMP components.

For further detail on integrating third party services, fonts, embeds, etc. see our [3p contribution guidelines](https://github.com/ampproject/amphtml/tree/master/3p).

## Contributor License Agreement

The AMP Project hosted at GitHub requires all contributors to either sign an individual Contributor License Agreement or be covered by a corporate Contributor License Agreement in order to protect contributors and users in issues of intellectual property.

We recommend you handle signing/being covered by a CLA *before* you send a pull request to avoid problems, though this is not absolutely necessary until your code is ready to be merged in.

**Make sure that the email you associate with your CLA is the same email address you associate with your commits (likely via the `user.email` Git config as described on GitHub's [Set up Git](https://help.github.com/articles/set-up-git/) page).**

* **If you are contributing code on your own behalf** you can sign the ([individual CLA](https://developers.google.com/open-source/cla/individual) instantly online.
* **If you are planning on contributing code on behalf of your company:**
  * Your company will need to agree to a [corporate CLA](https://developers.google.com/open-source/cla/corporate) if it has not already done so.  Although this is a relatively straightforward process, it requires approval from an authorized signer at your company and a manual verification process that may take a couple of days.  To ensure you can get your code reviewed and merged quickly please start this process as soon as possible.  The signer of your corporate CLA will associate a Google Group to the corporate CLA, and any email address added to this Google Group will be considered to be covered by this corporate CLA.
  * To be covered by your company's corporate CLA the owner of the Google Group associated with the corporate CLA (someone at your company) will need to add your address to this Google Group.

## Ongoing participation

We actively encourage ongoing participation by community members.

### Discussion channels

Technical issues, designs, etc. are discussed using several different channels:

- [GitHub issues](https://github.com/ampproject/amphtml/issues) and [pull requests](https://github.com/ampproject/amphtml/pulls)
- [Slack](https://amphtml.slack.com) ([signup](https://docs.google.com/forms/d/1wAE8w3K5preZnBkRk-MD1QkX8FmlRDxd_vs4bFSeJlQ/viewform?fbzx=4406980310789882877))
- the [amphtml-discuss Google Group](https://groups.google.com/forum/#!forum/amphtml-discuss)

### Status updates

Status updates from members of the community are tracked using approximately bi-weekly [Status Update GitHub issues](https://github.com/ampproject/amphtml/issues?q=label%3A%22Type%3A+Status+Update%22).

We encourage everyone who is actively contributing to AMP to add a comment to the relevant Status Update issue.

### Weekly design reviews

The community holds weekly engineering [design reviews](./contributing/design-reviews.md) via video conference.  We encourage everyone in the community to participate in these discussions and to bring their designs for new features and significant bug fixes to these reviews.

### Working groups

AMP Project [working groups](./contributing/working-groups.md) bring together parties with related interests to discuss ideas for how AMP can evolve and to receive updates on new features and changes in AMP that are relevant to the group.

### See Also

* [Code of conduct](CODE_OF_CONDUCT.md)
* [3p contribution guidelines](https://github.com/ampproject/amphtml/tree/master/3p)
* The [GOVERNANCE](GOVERNANCE.md) model

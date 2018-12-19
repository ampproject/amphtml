# Contributing to AMP HTML

The AMP HTML project strongly encourages technical [contributions](https://www.ampproject.org/contribute/)!

We hope you'll become an ongoing participant in our open source community but we also welcome one-off contributions for the issues you're particularly passionate about.

> :grey_question: If you have questions about using AMP or are encountering problems using AMP on your site please visit our [support page](SUPPORT.md) for help.

#### Contents

- [Reporting issues with AMP](#reporting-issues-with-amp)
  * [Bugs](#bugs)
  * [Suggestions and feature requests](#suggestions-and-feature-requests)
- [Contributing code](#contributing-code)
  * [Tips for new open source contributors](#tips-for-new-open-source-contributors)
  * [Contributing extended components](#contributing-extended-components)
  * [How to contribute code](#how-to-contribute-code)
    + [Contributing a new feature (concept & design phase)](#phase-concept-design)
    + [Contributing code for a feature (coding phase)](#phase-coding)
- [Contributor License Agreement](#contributor-license-agreement)
- [Ongoing participation](#ongoing-participation)
  * [Discussion channels](#discussion-channels)
  * [Status updates](#status-updates)
  * [Weekly design reviews](#weekly-design-reviews)
  * [Working groups](#working-groups)
  * [See Also](#see-also)
## Reporting issues with AMP

### Bugs

If you find a bug in AMP, please [file a GitHub issue](https://github.com/ampproject/amphtml/issues/new).  Members of the community are regularly monitoring issues and will try to fix open bugs quickly according to our [prioritization guidelines](./contributing/issue-priorities.md).

The best bug reports provide a detailed description of the issue (including screenshots if possible), step-by-step instructions for predictably reproducing the issue, and possibly even a working example that demonstrates the issue.

### Suggestions and feature requests

The AMP Project is meant to evolve with feedback.  The project and its users appreciate your thoughts on ways to improve the design or features.

To make a suggestion or feature request [file a GitHub issue](https://github.com/ampproject/amphtml/issues/new) describing your idea.

If you are suggesting a feature that you are intending to implement, please see the [Contributing a new feature](#phase-concept-design) section below for next steps.

## Contributing code

The AMP Project accepts and greatly appreciates code contributions!

### Tips for new open source contributors

If you are new to contributing to an open source project, Git/GitHub, etc. welcome!  We are glad you're interested in contributing to the AMP Project and we want to help make your open source experience a success.

The [Getting Started End-to-End Guide](./contributing/getting-started-e2e.md) provides step-by-step instructions for everything from creating a GitHub account to getting your code reviewed and merged.  Even if you've never contributed to an open source project before you'll soon be building AMP, making improvements and seeing your code live across the web.

The community has created a list of [Good First Issues](https://github.com/ampproject/amphtml/labels/good%20first%20issue) specifically for new contributors to the project.  Feel free to find one of the [unclaimed Good First Issues](https://github.com/ampproject/amphtml/issues?utf8=%E2%9C%93&q=is%3Aopen%20label%3A%22good%20first%20issue%22%20-label%3A%22GFI%20Claimed!%22) that interests you, claim it by adding a comment to it and jump in!

If you're interested in helping out but can't find a Good First Issue that matches your skills/interests, [sign up for our Slack](https://docs.google.com/forms/d/e/1FAIpQLSd83J2IZA6cdR6jPwABGsJE8YL4pkypAbKMGgUZZriU7Qu6Tg/viewform?fbzx=4406980310789882877) and then reach out in the [#welcome-contributors channel](https://amphtml.slack.com/messages/welcome-contributors/) or send a Direct Message to [mrjoro](https://amphtml.slack.com/team/mrjoro/).

If you run into any problems we have plenty of people who are willing to help; see the [How to get help](./contributing/getting-started-e2e.md#how-to-get-help) section of the Getting Started guide.

> :bookmark: You might have noticed that we use GitHub emojis in our pull requests. To learn what these emojis mean and which ones to use, see  :sparkles:[our list of emojis](./.github/PULL_REQUEST_TEMPLATE.md#emojis-for-categorizing-pull-requests) :sparkles:. 

### Contributing extended components

A key feature of the AMP HTML project is its extensibility - it is meant to support “Extended Components” that provide first-class support for additional rich features.

Because Extended Components may have significant impact on AMP HTML performance, security, and usage, Extended Component contributions will be very carefully analyzed and scrutinized.

In particular, we strive to design the overall component set, so that a large number of use cases can be composed from them. Instead of creating a new component it may thus be a better solution to combine existing components to a similar effect.

We have a few additional resources that provide an introduction to contributing extended components:
* ["Building an AMP Extension"](./contributing/building-an-amp-extension.md) has a detailed description of how to build an AMP component.
* ["Creating your first AMP Component" codelab](https://codelabs.developers.google.com/codelabs/creating-your-first-amp-component/#0) provides a quick overview of the steps you need to go through to create a component with examples you can modify for your component.
* The ["Building a new AMP component" talk at AMP Conf 2017](https://youtu.be/FJEhQFNKeaQ?list=PLXTOW_XMsIDTDXYO-NAi2OpEH0zyguvqX) provides an introduction to contributing AMP components.

For further detail on integrating third-party services (e.g., fonts, embeds, etc.), see our [3p contribution guidelines](https://github.com/ampproject/amphtml/tree/master/3p).

### How to contribute code

Contributing to AMP involves two phases:

1.  [Concept & Design](#phase-concept-design)
2.  [Coding & Implementation](#phase-coding)

#### <a name="phase-concept-design"></a>Contributing a new feature (concept & design phase)

1. Familiarize yourself with our [Design Principles](./contributing/DESIGN_PRINCIPLES.md).
1. [Create an  Intent to Implement (I2I) GH issue](https://github.com/ampproject/amphtml/issues/new) to discuss your new feature. In your I2I, include the following:
   -  A high-level description of the feature.
   -  A description of the API you plan to create.
   -  If you are integrating a third-party service, provide a link to the third-party's site and product.
   -  Details on any data collection or tracking that the feature might perform.
   -  A prototype or mockup (for example, an image, a GIF, or a link to a demo).
3. Before starting on the code, get approval for your feature from an [OWNER](https://github.com/ampproject/amphtml/search?utf8=%E2%9C%93&q=filename%3AOWNERS.yaml&type=Code) of your feature's area and a [core committer](GOVERNANCE.md#core-committers).  In most cases the people who can give this approval and are most familiar with your feature's area will get involved proactively or someone else in the community will add them. As part of the design review, you might be required to discuss your design in the [weekly design review](#weekly-design-reviews) meeting.
5.  [Start coding](#phase-coding).  

#### <a name="phase-coding"></a>Contributing code for a feature (coding & implementation phase)

1. If you haven't already, consider [joining the AMP Project](https://goo.gl/forms/T65peVtfQfEoDWeD3). This is entirely *optional* but by joining the project you become part of the AMP contributor community, and it allows for the ability to assign issues to you in GitHub.
1.  [Perform the one-time setup](./contributing/getting-started-quick.md#one-time-setup): Set up your GitHub account, install Node, Yarn, Gulp CLI, fork repo, track repo, etc.
1. [Create a working branch](./contributing/getting-started-e2e.md#create-a-git-branch).
1. [Build AMP](./contributing/getting-started-e2e.md#building-amp-and-starting-a-local-server).
1. Write code and consult these resources for guidance and guidelines:
   - **Design**: [AMP Design Principles](./contributing/DESIGN_PRINCIPLES.md)
   - **JavaScript**: [Google JavaScript Code Style Guide](https://google.github.io/styleguide/jsguide.html)
   - **CSS**: [Writing CSS For AMP Runtime](./contributing/writing-css.md)
   - **Creating new components**: 
     - [Instructions and Guidelines for building an AMP component](./contributing/building-an-amp-extension.md)
     - Learn to create your first component in this [codelab](https://codelabs.developers.google.com/codelabs/creating-your-first-amp-component/#0)
     - Watch this [YouTube video](https://youtu.be/FJEhQFNKeaQ?list=PLXTOW_XMsIDTDXYO-NAi2OpEH0zyguvqX) to learn about "Building a new AMP component"
   - **Integrating third-party software, embeds, services**: [Guidelines](./3p/README.md)
1. [Commit your files](./contributing/getting-started-e2e.md#edit-files-and-commit-them).
1. [Test your changes](./contributing/getting-started-e2e.md#testing-your-changes): A key feature of AMP is performance.  All changes will be analyzed for any performance impact; we particularly appreciate changes that make things even faster.  Please include any measured performance impact with substantial pull requests.
1. [Put your new component behind an experiment flag](./contributing/building-an-amp-extension.md#experiments).
1. [Pull the latest changes from the AMPHTML repo](./contributing/getting-started-e2e.md#pull-the-latest-changes-from-the-amphtml-repository) and resolve any conflicts.
1. [Sign the CLA](CONTRIBUTING.md#contributor-license-agreement): This is a one-time task.
1.  Run the **pre push** check, which is a tool that helps catch any issues before you submit your code. To enable the git pre-push hook, see [`enable-git-pre-push.sh`](./build-system/enable-git-pre-push.sh#L17-L20).
1. Prepare for your code review:
   - [ ] [Correct test coverage](./contributing/TESTING.md)
   - [ ] [Code follows style and design guidelines](./contributing/DEVELOPING.md#guidelines--style)
   - [ ] [Documentation for your feature](./contributing/building-an-amp-extension.md#documenting-your-element)
   - [ ] [Presubmit passes (no lint and type check errors, tests are passing)](./build-system/enable-git-pre-push.sh#L17-L20)
   - [ ] [Validation rules and validation tests provided](./contributing/building-an-amp-extension.md#allowing-proper-validations)
   - [ ] [Feature is behind an experiment flag](./contributing/building-an-amp-extension.md#experiments)
   - [ ] [Example provided](./contributing/building-an-amp-extension.md#example-of-using-your-extension)
1. [Push your changes](./contributing/getting-started-e2e.md#push-your-changes-to-your-github-fork)
1. [Send a Pull Request (PR) to review your code](./contributing/getting-started-e2e.md#send-a-pull-request-ie-request-a-code-review). Your PR needs to include:
    - A descriptive title
    - A link to your GitHub Intent To Implement # or Issue #
    - A visual demonstration of your change (e.g., a screenshot, GIF, or links to  a published demo (we can link to our Heroku setup which allows developers to publish work-in-progress code to the cloud)
    - @mention the core committer or someone who's already worked with you on the feature
1. Make sure your PR presubmit passes (no lint and type check errors, tests are passing).
1. [Respond to feedback](./contributing/getting-started-e2e.md#respond-to-pull-request-comments).
1. After your PR is approved, it's merged by a core committer. To check on your changes and find out when they get into production, read [See your changes in production](./contributing/getting-started-quick.md#see-your-changes-in-production).
1. [Clean up](./contributing/getting-started-quick.md#delete-your-branch-after-your-changes-are-merged-optional): After your changes are merged, you can delete your working branch.

## Contributor License Agreement

The AMP Project hosted at GitHub requires all contributors to either sign an individual Contributor License Agreement or be covered by a corporate Contributor License Agreement in order to protect contributors and users in issues of intellectual property.

We recommend you handle signing/being covered by a CLA *before* you send a pull request to avoid problems, though this is not absolutely necessary until your code is ready to be merged in.

**Make sure that the email you associate with your CLA is the same email address you associate with your commits (likely via the `user.email` Git config as described on GitHub's [Set up Git](https://help.github.com/articles/set-up-git/) page).**

* **If you are contributing code on your own behalf** you can sign the [individual CLA](https://developers.google.com/open-source/cla/individual) instantly online.
* **If you are planning on contributing code on behalf of your company:**
  * Your company will need to agree to a [corporate CLA](https://developers.google.com/open-source/cla/corporate) if it has not already done so.  Although this is a relatively straightforward process, it requires approval from an authorized signer at your company and a manual verification process that may take a couple of days.  To ensure you can get your code reviewed and merged quickly please start this process as soon as possible.  The signer of your corporate CLA will associate a Google Group to the corporate CLA, and any email address added to this Google Group will be considered to be covered by this corporate CLA.
  * To be covered by your company's corporate CLA the owner of the Google Group associated with the corporate CLA (someone at your company) will need to add your address to this Google Group.

## Ongoing participation

We actively encourage ongoing participation by community members.

### Discussion channels

Technical issues, designs, etc. are discussed using several different channels:

- [GitHub issues](https://github.com/ampproject/amphtml/issues) and [pull requests](https://github.com/ampproject/amphtml/pulls)
- [Slack](https://amphtml.slack.com) ([signup](https://docs.google.com/forms/d/1wAE8w3K5preZnBkRk-MD1QkX8FmlRDxd_vs4bFSeJlQ/viewform?fbzx=4406980310789882877))
  - the [#contributing](https://amphtml.slack.com/messages/C9HRJ1GPN/details/) channel is the main channel for you to discuss/ask questions about *contributing* to the open source project
  - if you're *new to contributing* to AMP stop by [#welcome-contributors](https://amphtml.slack.com/messages/C432AFMFE/details/) to say hi!
  - **NOTE: if you have a question about *using AMP on your site*, use [Stack Overflow](https://stackoverflow.com/questions/tagged/amp-html) rather than Slack** as Stack Overflow is more actively monitored for these types of questions
  - there are many other Slack channels for more specific topics; after you join our Slack click on the "Channels" header to find other channels you want to participate in
- the [amphtml-discuss Google Group](https://groups.google.com/forum/#!forum/amphtml-discuss)

### Status updates

Status updates from members of the community are tracked using approximately bi-weekly [Status Update GitHub issues](https://github.com/ampproject/amphtml/issues?q=label%3A%22Type%3A+Status+Update%22).

We encourage everyone who is actively contributing to AMP to add a comment to the relevant Status Update issue.

### Weekly design reviews

The community holds weekly engineering [design reviews](./contributing/design-reviews.md) via video conference.  We encourage everyone in the community to participate in these discussions and to bring their designs for new features and significant bug fixes to these reviews.

### Working groups

AMP Project [working groups](./contributing/working-groups.md) bring together parties with related interests to discuss ideas for how AMP can evolve and to receive updates on new features and changes in AMP that are relevant to the group.

## See also

* [Code of conduct](CODE_OF_CONDUCT.md)
* [3p contribution guidelines](https://github.com/ampproject/amphtml/tree/master/3p)
* The [GOVERNANCE](GOVERNANCE.md) model

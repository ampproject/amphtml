<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
# Contributing to AMP HTML

The AMP HTML project strongly encourages technical [contributions](https://www.ampproject.org/contribute/)!

We hope you'll become an ongoing participant in our open source community but we also welcome one-off contributions for the issues you're particularly passionate about.

- [Filing issues](#filing-issues)
  * [Suggestions](#suggestions)
  * [Bugs](#bugs)
- [Contributing code](#contributing-code)
  * [Tips for new open source contributors](#tips-for-new-open-source-contributors)
  * [How to contribute code](#how-to-contribute-code)
- [Contributing features](#contributing-features)
- [Contributing extended components](#contributing-extended-components)
- [Contributor License Agreement](#contributor-license-agreement)
- [Ongoing participation](#ongoing-participation)
  * [Discussion channels](#discussion-channels)
  * [Weekly status updates](#weekly-status-updates)
  * [Weekly design reviews](#weekly-design-reviews)
  * [See Also](#see-also)

## Filing issues

### Suggestions

The AMP Project is meant to evolve with feedback.  The project and its users appreciate your thoughts on ways to improve the design or features.

To make a suggestion [file an issue](https://github.com/ampproject/amphtml/issues/new).

If you are suggesting a feature that you are intending to implement, please see the [Contributing features](#contributing-features) section below for next steps.

### Bugs

If you find a bug in AMP, please [file an issue](https://github.com/ampproject/amphtml/issues/new).  Members of the community are regularly monitoring issues and will try to fix open bugs quickly.

The best bug reports provide a detailed description of the issue (including screenshots if possible), step-by-step instructions for predictably reproducing the issue, and possibly even a working example that demonstrates the issue.

If you want to learn more about our issues priorities and implementation guidelines check out [this document](https://github.com/ampproject/amphtml/blob/master/contributing/issue-priorities.md).

## Contributing code

The AMP Project accepts and greatly appreciates code contributions!

### Tips for new open source contributors

If you are new to contributing to an open source project, Git/GitHub, etc. welcome!  We are glad you're interested in contributing to the AMP Project.

The [Getting Started End-to-End Guide](contributing/getting-started-e2e.md) provides step-by-step instructions for everything from creating a GitHub account to getting your code reviewed and merged.  Even if you've never contributed to an open source project before you'll soon be building AMP, making improvements and seeing your code live across the web.

The community has created a list of [Great First Issues](https://github.com/ampproject/amphtml/milestone/25) specifically for new contributors to the project.  Feel free to find one that interests you and jump in!  Make sure to comment on the issue first so others know you are starting on it.

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
* ["Building an AMP Extension"](https://docs.google.com/document/d/19o7eDta6oqPGF4RQ17LvZ9CHVQN53whN-mCIeIMM8Qk/edit?ts=58e682c2) has a detailed description of how to build an AMP component.
* ["Creating your first AMP Component" codelab](https://codelabs.developers.google.com/codelabs/creating-your-first-amp-component/#0) provides a quick overview of the steps you need to go through to create a component with examples you can modify for your component.
* The ["Building a new AMP component" talk at AMP Conf 2017](https://youtu.be/FJEhQFNKeaQ?list=PLXTOW_XMsIDTDXYO-NAi2OpEH0zyguvqX) provides an introduction to contributing AMP components.

For further detail on integrating third party services, fonts, embeds, etc. see our [3p contribution guidelines](https://github.com/ampproject/amphtml/tree/master/3p).

## Contributor License Agreement

The AMP Project hosted at GitHub requires all contributors to sign a Contributor License Agreement ([individual](https://developers.google.com/open-source/cla/individual) or [corporation](https://developers.google.com/open-source/cla/corporate)) in order to protect contributors, users and Google in issues of intellectual property.

When you create a Pull Request a check will be run to ensure that you have signed the CLA.  Make sure that you sign the CLA with the same email address you associate with your commits (likely via the `user.email` Git config as described on GitHub's [Set up Git](https://help.github.com/articles/set-up-git/) page).

## Ongoing participation

We actively encourage ongoing participation by community members.

### Discussion channels

Technical issues, designs, etc. are discussed on [GitHub issues](https://github.com/ampproject/amphtml/issues) and [pull requests](https://github.com/ampproject/amphtml/pulls),
 the [amphtml-discuss Google Group](https://groups.google.com/forum/#!forum/amphtml-discuss) and the [amphtml Slack](https://docs.google.com/forms/d/1wAE8w3K5preZnBkRk-MD1QkX8FmlRDxd_vs4bFSeJlQ/viewform?fbzx=4406980310789882877).

### Weekly status updates

GitHub issues labeled [Type: Weekly Status](https://github.com/ampproject/amphtml/issues?q=label%3A%22Type%3A+Weekly+Status%22) are used to track weekly updates from members of the community.  We encourage everyone who is actively contributing to AMP to add a comment to the relevant Weekly Status issue.

### Weekly design reviews

The community holds weekly design reviews as video conferences via Google Hangouts on Wednesdays at [1pm Pacific](https://www.google.com/?#q=1pm+pacific+in+local+time).

We use GitHub issues labeled [Type: Design Review](https://github.com/ampproject/amphtml/issues?q=label%3A%22Type%3A+Design+Review%22) to track design reviews.  The Design Review issue for a given week will have a link to the design docs being discussed that week as well as a link to the Hangout.  **When attending a design review please read through the design docs _before_ the review starts.**

If the design for an issue/feature you are working on has a scope larger than you can cover in a discussion in the GitHub issue or one of the other discussion channels, consider bringing it to a design review:

* Create a software design document in a shared Google Document open to public comments.
  * A short design doc is fine as long as it covers your design in sufficient detail to allow for a review by other members of the community.
  * Take a look at [Design docs - A design doc](https://medium.com/@cramforce/design-docs-a-design-doc-a152f4484c6b) for tips on putting together a good design doc.  [Phone call tracking in AMP](https://docs.google.com/document/d/1UDMYv0f2R9CvMUSBQhxjtkSnC4984t9dJeqwm_8WiAM/edit) and [New AMP Boilerplate](https://docs.google.com/document/d/1gZFaKvcDffceJNaI3bYfuYPtYU5u2y6UhE5wBPTsJ9w/edit) are examples of past AMP Project design docs.
  * Add this license text to the top of your design doc before sharing it with anyone else in the community (updating the year if necessary):
      ```
      Copyright 2017 The AMP HTML Authors. All Rights Reserved.

      Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

      Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

      See the License for the specific language governing permissions and limitations under the License.
      ```

* Perform a design pre-review with at least one [core committer](https://github.com/ampproject/amphtml/blob/master/GOVERNANCE.md); you can request a pre-review in the [#design-review Slack channel](https://amphtml.slack.com/messages/design-review/).  It is fine to request a pre-review before your design doc is complete.

* When your design is ready to be discussed at a design review add a comment on the appropriate Design Review GitHub issue.  Post a link to the design doc and a brief summary by **1pm Pacific Monday** on the week of your design review.

* Update your design based on the feedback in the design review and any followup conversations in other channels.  Once your design is finalized, please provide a brief update at the start of a future design review (if you are able to attend) and submit a PDF version of your design doc in the [ampproject design-doc](https://github.com/ampproject/design-docs) repository.

### See Also

* [Code of conduct](CODE_OF_CONDUCT.md)
* [3p contribution guidelines](https://github.com/ampproject/amphtml/tree/master/3p)
* The [GOVERNANCE](GOVERNANCE.md) model

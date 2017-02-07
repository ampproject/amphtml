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

## Contributing to AMP HTML

The AMP HTML project strongly encourages technical [contributions](https://www.ampproject.org/contribute/)!

We hope you'll become an ongoing participant in our open source community but we also welcome one-off contributions for the issues you're particularly passionate about.

### Filing Issues

**Suggestions**

The AMP HTML project is meant to evolve with feedback - the project and its users greatly appreciate any thoughts on ways to improve the design or features. Please use the `enhancement` tag to specifically denote issues that are suggestions - this helps us triage and respond appropriately.

**Bugs**

As with all pieces of software, you may end up running into bugs. Please submit bugs as regular issues on GitHub - AMP HTML developers are regularly monitoring issues and will try to fix open bugs quickly.

The best bug reports include a detailed way to predictably reproduce the issue, and possibly even a working example that demonstrates the issue.

### Ongoing Participation

We actively encourage ongoing participation by community members.

* **Discussions** for implementations, designs, etc. often happen in the [amphtml-discuss Google Group](https://groups.google.com/forum/#!forum/amphtml-discuss) and the [amphtml Slack](https://docs.google.com/forms/d/1wAE8w3K5preZnBkRk-MD1QkX8FmlRDxd_vs4bFSeJlQ/viewform?fbzx=4406980310789882877).
* **Weekly status updates** from individual community members are posted as GitHub issues labeled [Type: Weekly Status](https://github.com/ampproject/amphtml/issues?q=label%3A%22Type%3A+Weekly+Status%22).  If you have a weekly status update related to your work on AMP that you'd like to share with the community please add it as a comment on the relevant Weekly Status issue.
* **Weekly design reviews** are held as video conferences via Google Hangouts on Wednesdays at [1pm Pacific](https://www.google.com/?#q=1pm+pacific+in+local+time).  Design reviews are used to discuss/refine engineering designs after an initial draft of the design has been created and shared with the community.  The design reviews are meant as an *optional* venue for concentrated feedback and discussion.  **Going through this design review is *not* required to make a contribution to AMP.**
  * We use GitHub issues labeled [Type: Design Review](https://github.com/ampproject/amphtml/issues?q=label%3A%22Type%3A+Design+Review%22) to track design reviews.  The Design Review issue for a given week will have a link to the design docs being discussed that week as well as a link to the Hangout.
  * When you attend a design review please read through the design docs before the review starts.
  * If you have an engineering design you would like to discuss at a design review:
    * Create a software design document in a shared Google Document open to public comments.  A short design doc is fine as long as it covers your design in sufficient detail to allow for a review by other members of the community.  Take a look at [Design docs - A design doc](https://medium.com/@cramforce/design-docs-a-design-doc-a152f4484c6b) for tips on putting together a good design doc.  Some examples:
      * [Phone call tracking in AMP](https://docs.google.com/document/d/1UDMYv0f2R9CvMUSBQhxjtkSnC4984t9dJeqwm_8WiAM/edit)
      * [New AMP Boilerplate](https://docs.google.com/document/d/1gZFaKvcDffceJNaI3bYfuYPtYU5u2y6UhE5wBPTsJ9w/edit)
    * Perform a design pre-review with at least one [core committer](https://github.com/ampproject/amphtml/blob/master/GOVERNANCE.md); you can request a pre-review in the [#design-review Slack channel](https://amphtml.slack.com/messages/design-review/).  It is fine to request a pre-review before your design doc is complete.
    * When your design is ready to be discussed at a design review add a comment on the appropriate Design Review GitHub issue.  Post a link to the design doc and a brief summary by **1pm Pacific Monday** on the week of your design review.

### Contributing Code

The AMP HTML project accepts and greatly appreciates contributions. The project follows the [fork & pull](https://help.github.com/articles/using-pull-requests/#fork--pull) model for accepting contributions.

When contributing code, please also include appropriate tests as part of the pull request, and follow the same comment and coding style as the rest of the project. Take a look through the existing code for examples of the testing and style practices the project follows.

A key feature of the AMP HTML project is performance - all pull requests will be analyzed for any performance impact, and the project greatly appreciates ways it can get even faster. Please include any measured performance impact with substantial pull requests.

* We follow [Google's JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html).

**Google Individual Contributor License**

Code contributors to the AMP HTML project must sign a Contributor License Agreement, either for an [individual](https://developers.google.com/open-source/cla/individual) or [corporation](https://developers.google.com/open-source/cla/corporate). The CLA is meant to protect contributors, users of the AMP HTML runtime, and Google in issues of intellectual property.

### Contributing Features

All pull requests for new features must go through the following process:
* Please familiarize yourself with the [AMP Design Principles](DESIGN_PRINCIPLES.md)
* Start an Intent-to-implement GitHub issue for discussion of the new feature.
* LGTM from Tech Lead and one other core committer is required
* Development occurs on a separate branch of a separate fork, noted in the intent-to-implement issue
* A pull request is created, referencing the issue.
* AMP HTML developers will provide feedback on pull requests, looking at code quality, style, tests, performance, and directional alignment with the goals of the project. That feedback should be discussed and incorporated
* LGTM from Tech Lead and one other core committer, who confirm engineering quality and direction.

#### Contributing Extended Components

A key feature of the AMP HTML project is its extensibility - it is meant to support “Extended Components” that provide first-class support for additional rich features. The project currently accepts pull requests to include these types of extended components.

Because Extended Components may have significant impact on AMP HTML performance, security, and usage, Extended Component contributions will be very carefully analyzed and scrutinized.

In particular we strive to design the overall component set, so that a large number of use cases can be composed from them. Instead of creating a new component it may thus be a better solution to combine existing components to a similar effect.

For further detail on integrating third party services, fonts, embeds, etc. see our [3p contribution guidelines](https://github.com/ampproject/amphtml/tree/master/3p).

### See Also

* [Code of conduct](CODE_OF_CONDUCT.md)
* [DEVELOPING](DEVELOPING.md) resources
* [3p contribution guidelines](https://github.com/ampproject/amphtml/tree/master/3p)
* The [GOVERNANCE](GOVERNANCE.md) model

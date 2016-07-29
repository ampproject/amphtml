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

### Filing Issues

**Suggestions**

The AMP HTML project is meant to evolve with feedback - the project and its users greatly appreciate any thoughts on ways to improve the design or features. Please use the `enhancement` tag to specifically denote issues that are suggestions - this helps us triage and respond appropriately.

**Bugs**

As with all pieces of software, you may end up running into bugs. Please submit bugs as regular issues on GitHub - AMP HTML developers are regularly monitoring issues and will try to fix open bugs quickly.

The best bug reports include a detailed way to predictably reproduce the issue, and possibly even a working example that demonstrates the issue.

### Contributing Code

The AMP HTML project accepts and greatly appreciates contributions. The project follows the [fork & pull](https://help.github.com/articles/using-pull-requests/#fork--pull) model for accepting contributions.

When contributing code, please also include appropriate tests as part of the pull request, and follow the same comment and coding style as the rest of the project. Take a look through the existing code for examples of the testing and style practices the project follows.

A key feature of the AMP HTML project is performance - all pull requests will be analyzed for any performance impact, and the project greatly appreciates ways it can get even faster. Please include any measured performance impact with substantial pull requests.

**Google Individual Contributor License**

Code contributors to the AMP HTML project must sign a Contributor License Agreement, either for an [individual](https://developers.google.com/open-source/cla/individual) or [corporation](https://developers.google.com/open-source/cla/corporate). The CLA is meant to protect contributors, users of the AMP HTML runtime, and Google in issues of intellectual property.

### Contributing Features

All pull requests for new features must go through the following process:
* Please familiarize yourself with the [AMP Design Principles](DESIGN_PRINCIPLES).md
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

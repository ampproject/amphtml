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

### Prerequisites

**Google Individual Contributor License**

Code contributors to the AMP HTML project must sign a Contributor License Agreement, either for an individual or corporation. The CLA is meant to protect contributors, users of the AMP HTML runtime, and Google in issues of intellectual property. You can fill out the appropriate Contributor License Agreement at:

Individuals - https://developers.google.com/open-source/cla/individual

Corporate - https://developers.google.com/open-source/cla/corporate

### Contributing

#### Filing Issues

**Suggestions**

The AMP HTML project is meant to evolve with feedback - the project and its users greatly appreciate any thoughts on ways to improve the design or features. Please use the `enhancement` tag to specifically denote issues that are suggestions - this helps us triage and respond appropriately.

**Bugs**

As with all pieces of software, you may end up running into bugs. Please submit bugs as regular issues on GitHub - AMP HTML developers are regularly monitoring issues and will try to fix open bugs quickly.

The best bug reports include a detailed way to predictably reproduce the issue, and possibly even a working example that demonstrates the issue.

#### Fixing bugs and runtime features

The AMP HTML project accepts and greatly appreciates contributions. The project follows the [fork & pull](https://help.github.com/articles/using-pull-requests/#fork--pull) model for accepting contributions. Please mark pull requests that are ready for review with the "NEEDS REVIEW" label.

When contributing code, please also include appropriate tests as part of the pull request, and follow the same comment and coding style as the rest of the project. Take a look through the existing code for examples of the testing and style practices the project follows.

A key feature of the AMP HTML project is performance - all pull requests will be analyzed for any performance impact, and the project greatly appreciates ways it can get even faster. Please include any measured performance impact with substantial pull requests.

AMP HTML developers will provide feedback on pull requests, looking at code quality, style, tests, performance, and directional alignment with the goals of the project.

#### Contributing Extended Components

A key feature of the AMP HTML project is its extensibility - it is meant to support “Extended Components” that provide first-class support for additional rich features. The project currently accepts pull requests to include these types of extended components.

Because Extended Components may have significant impact on AMP HTML performance, security, and usage, Extended Component contributions will be very carefully analyzed and scrutinized. Before embarking on a major Extended Component, please submit an Issue detailing your proposed component, so that the AMP HTML developers can offer any feedback before you spend lots of time. In particular we strive to design the overall component set, so that a large number of use cases can be composed from them. Instead of creating a new component it may thus be a better solution to combine existing components to a similar effect.

Important criteria for acceptance of an Extended Component is that an [oEmbed](http://oembed.com/) integration already exists and that the thing being integrated has an actively maintained Wikipedia page.

We highly prefer integrations that do not use iframes. JSONP cannot be used for security reasons, but CORS requests are perfectly fine.

Like all contributions, Extended Components will be analyzed for performance impact, code quality and style, and directional alignment with the project.

### Next steps

See [DEVELOPING](DEVELOPING.md).

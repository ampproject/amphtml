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

# Development on AMP HTML

## How to get started

Before you start developing in AMP, check out these resources:
* [CONTRIBUTING.md](../CONTRIBUTING.md) has details on various ways you can contribute to the AMP Project.
  * If you're developing in AMP, you should read the [Contributing code and features](./contributing-code.md) documentation, which includes information on code reviews and approvals.
  * The [Ongoing participation](../CONTRIBUTING.md#ongoing-participation) section has details on various ways of getting in touch with others in the community including email and Slack.
  * **If you are new to open source projects, Git/GitHub, etc.**, check out the [Tips for new open source contributors](../CONTRIBUTING.md#tips-for-new-open-source-contributors) which includes information on getting help and finding your first bug to work on.
* The [Getting Started Quick Start Guide](getting-started-quick.md) has installation steps and basic instructions for [one-time setup](getting-started-quick.md#one-time-setup), how to [build AMP & run a local server](getting-started-quick.md#build-amp--run-a-local-server) and how to [test AMP](getting-started-quick.md#test-amp).

## Guidelines & Style

Before you start writing code, consult these resources for guidance and guidelines on:

 - **Design**: [AMP Design Principles](DESIGN_PRINCIPLES.md)
 - **JavaScript**: [Google JavaScript Code Style Guide](https://google.github.io/styleguide/jsguide.html)
 - **CSS**: [Writing CSS For AMP Runtime](writing-css.md)
- **Creating new components**: 
  - [Instructions and Guidelines for building an AMP component](building-an-amp-extension.md)
  - Learn to create your first component in this [codelab](https://codelabs.developers.google.com/codelabs/creating-your-first-amp-component/#0)
  - Watch this [YouTube video](https://youtu.be/FJEhQFNKeaQ?list=PLXTOW_XMsIDTDXYO-NAi2OpEH0zyguvqX) to learn about "Building a new AMP component"
- **Integrating third-party software, embeds, services**: [Guidelines](../3p/README.md)

## Testing

For most developers, the instructions in the [Getting Started Quick Start Guide](getting-started-quick.md) will be sufficient for building/running/testing during development.  

For detailed information on testing, see [TESTING.md](TESTING.md).

## Repository Layout
<pre>
  3p/             - Implementation of third party sandbox iframes.
  ads/            - Modules implementing specific ad networks used in <amp-ad>
  build/          - (generated) intermediate generated files
  build-system/   - build infrastructure
  builtins/       - tags built into the core AMP runtime
      *.md        - documentation for use of the builtin
      *.js        - source code for builtin tag
  contributing/   - docs for people contributing to the AMP Project
  css/            - default css
  dist/           - (generated) main JS binaries are created here. This is what
                    gets deployed to cdn.ampproject.org.
  dist.3p/        - (generated) JS binaries and HTML files for 3p embeds and ads
                    This is what gets deployed to 3p.ampproject.net.
  examples/       - example AMP HTML files and corresponding assets
  extensions/     - plugins which extend the AMP HTML runtime's core set of tags
  spec/           - The AMP HTML Specification files
  src/            - source code for the AMP runtime
  test/           - tests for the AMP runtime and builtins
  testing/        - testing infrastructure
  third_party/    - third party code used in AMP
  tools/          - code for AMP related tools
  validator/      - AMP Validator runners and tools
  
</pre>

## Supported browsers

In general we support the 2 latest versions of major browsers like Chrome, Firefox, Edge, Safari, Opera, and UC Browser. We support desktop, phone, tablet and the web view version of these respective browsers. For iOS we support the latest 2 __major__ versions which covers about 2 years.

Beyond that the core AMP library and builtin elements should aim for very wide browser support and we accept fixes for all browsers with market share greater than 1 percent.

In particular, we try to maintain "it might not be perfect but isn't broken"-support for IE 11, iOS 8, the Android 4.0 system browser and Chrome 41. 

## Eng docs

- [Life of an AMP *](https://docs.google.com/document/d/1WdNj3qNFDmtI--c2PqyRYrPrxSg2a-93z5iX0SzoQS0/edit#)
- [AMP Layout system](../spec/amp-html-layout.md)
- [Building an AMP Extension](building-an-amp-extension.md)

We also recommend scanning the [spec](../spec/). The non-element part should help understand some of the design aspects.

## Builds and releases

- The [AMP buildcop](buildcop.md) helps ensure that AMP's builds remain green (i.e. everything builds and all of the tests pass).  If you run into issues with builds that seem unrelated to your changes see if the issue is present on [Travis](https://travis-ci.org/ampproject/amphtml/builds) and let the buildcop know.
- Understanding the [AMP release process](release-schedule.md) is useful for understanding when a change in AMP will make it into production and what to do if things go wrong during the rollout of a change.

## [Code of conduct](../CODE_OF_CONDUCT.md)

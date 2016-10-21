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

[![Build Status](https://travis-ci.org/ampproject/amphtml.svg?branch=master)](https://travis-ci.org/ampproject/amphtml)
[![Issue Stats](http://issuestats.com/github/ampproject/amphtml/badge/pr?style=flat)](http://issuestats.com/github/ampproject/amphtml)
[![Issue Stats](http://issuestats.com/github/ampproject/amphtml/badge/issue?style=flat)](http://issuestats.com/github/ampproject/amphtml)

# AMP HTML ⚡

[AMP HTML](https://www.ampproject.org/docs/get_started/about-amp.html) is a way to build web pages for static content that render with reliable, fast performance. It is our attempt at fixing what many perceive as painfully slow page load times – especially when reading content on the mobile web.

AMP HTML is entirely built on existing web technologies. It achieves reliable performance by restricting some parts of HTML, CSS and JavaScript. These restrictions are enforced with a validator that ships with AMP HTML. To make up for those limitations AMP HTML defines a set of [custom elements](http://www.html5rocks.com/en/tutorials/webcomponents/customelements/) for rich content beyond basic HTML. Learn more about [how AMP speeds up performance](https://www.ampproject.org/docs/get_started/technical_overview.html).

# How does AMP HTML work?

AMP HTML works by including the AMP JS library and adding a bit of boilerplate to a web page, so that it meets the AMP HTML Specification. The simplest AMP HTML file looks like this:

```html
<!doctype html>
<html ⚡>
  <head>
    <meta charset="utf-8">
    <link rel="canonical" href="hello-world.html" >
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
    <script async src="https://cdn.ampproject.org/v0.js"></script>
  </head>
  <body>Hello World!</body>
</html>
```

This allows the AMP library to include:
* The AMP JS library, that manages the loading of external resources to ensure a
  fast rendering of the page.
* An AMP validator that provides a way for web developers to easily validate
  that their code meets the AMP HTML specification.
* Some custom elements, called AMP HTML components, which make common patterns
  easy to implement in a performant way.

Get started [creating your first AMP page](https://www.ampproject.org/docs/get_started/create_page.html).

[Full docs and reference.](https://www.ampproject.org/docs/get_started/about-amp.html)

## The AMP JS library

The AMP JS library provides [builtin](builtins/README.md) AMP Components, manages the loading of external resources, and ensures a reliably fast time-to-paint.

## The AMP Validator

[The AMP Validator](validator/README.md) allows a web developer to easily
identify if the web page doesn't meet the
[AMP HTML specification](https://www.ampproject.org/docs/reference/spec.html).

Adding "#development=1" to the URL of the page instructs the AMP Runtime to run
a series of assertions confirming the page's markup meets the AMP HTML
Specification.  Validation errors are logged to the browser's console when the
page is rendered, allowing web developers to easily see how complex changes in
web code might impact performance and user experience.

It also allows apps that integrate web content to validate the web page against
the specification.  This allows an app to make sure the page is fast and
mobile-friendly, as pages adhering to the AMP HTML specification are reliably
fast.

Learn more about
[validating your AMP pages](https://www.ampproject.org/docs/guides/validate.html).
Also see [additional choices to invoke the validator](validator/README.md).

## AMP HTML Components

AMP HTML Components are a series of extended custom elements that supplement
or replace functionality of core HTML5 elements to allow the runtime to ensure
it is solely responsible for loading external assets and to provide for shared
best practices in implementation.

See our [docs and reference](https://www.ampproject.org/docs/get_started/about-amp.html) for more info.

# Releases

We push a new release of AMP to all AMP pages every week on Thursday. The more detailed schedule is as follows:

- Every Thursday we cut a green release from our `master` branch.
- This is then pushed to users of AMP who opted into the [AMP Dev Channel](#amp-dev-channel).
- On Monday we check error rates for opt-in users and bug reports and if everything looks fine, we push this new release to 1% of AMP pages.
- We then continue to monitor error rates and bug reports throughout the week.
- On Thursday the "Dev Channel" release from last Thursday is then pushed to all users.

You can always follow the current release state of AMP on our [releases page](https://github.com/ampproject/amphtml/releases). The release used by most users is marked as `Latest release` and the current Dev Channel release is marked as `Pre-release`.

## AMP Dev Channel

AMP Dev Channel is a way to opt a browser into using a newer version of the AMP JS libraries.

This release **may be less stable** and it may contain features not available to all users. Opt into this option if you'd like to help test new versions of AMP, report bugs or build documents that require a new feature that is not yet available to everyone.

Opting into Dev Channel is great to:

- test and play with new features not yet available to all users.
- use in Q&A to ensure that your site is compatible with the next version of AMP.

If you find an issue that appears to only occur in the Dev Channel version of AMP, please [file an issue](https://github.com/ampproject/amphtml/issues/new) with a description of the problem. Please always include a URL to a page that reproduces the issue.

To opt your browser into the AMP Dev Channel, go to [the AMP experiments page](https://cdn.ampproject.org/experiments.html) and activate the "AMP Dev Channel" experiment. Please subscribe to our [low-volume announcements](https://groups.google.com/forum/#!forum/amphtml-announce) mailing list to get notified about important/breaking changes about AMP.

# Further Reading

If you are creating AMP pages,
check out the docs on [ampproject.org](https://www.ampproject.org/) and samples on [ampbyexample.com](https://ampbyexample.com/).

These docs are public and open-source: [https://github.com/ampproject/docs/](https://github.com/ampproject/docs/).
See something that's missing from the docs, or that could be worded better?
[Create an issue](https://github.com/ampproject/docs/issues) and
we will do our best to respond quickly.

Resources:
* [AMP HTML samples](examples/)
* [AMP-HTML on StackOverflow](https://stackoverflow.com/questions/tagged/amp-html)

<!--
Not yet done.
* [Integrating your AMP HTML page](docs/integrating.md)
* [Extending AMP HTML with new elements](docs/extending.md)
* [Embedding AMP HTML content in your app](docs/embedding.md)
-->

Reference:
* [AMP HTML core built-in elements](builtins/README.md)
* [AMP HTML optional extended elements](extensions/README.md)

Technical Specifications:
* [AMP HTML format specification](spec/amp-html-format.md)
* [AMP HTML custom element specification](spec/amp-html-components.md)

# Who makes AMP HTML?

AMP HTML is made by the [AMP Project](https://www.ampproject.org/), and is licensed
under the [Apache License, Version 2.0](LICENSE).

## Contributing

Please see [the CONTRIBUTING file](CONTRIBUTING.md) for information on contributing to the AMP Project, and [the DEVELOPING file](DEVELOPING.md) for documentation on the AMP library internals and [hints how to get started](DEVELOPING.md#starter-issues).

### Security disclosures

The AMP Project accepts responsible security disclosures through the [Google Application Security program](https://www.google.com/about/appsecurity/).

### [Code of conduct](CODE_OF_CONDUCT.md)

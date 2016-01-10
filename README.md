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
[![Issue Stats](http://issuestats.com/github/ampproject/amphtml/badge/pr)](http://issuestats.com/github/ampproject/amphtml)
[![Issue Stats](http://issuestats.com/github/ampproject/amphtml/badge/issue)](http://issuestats.com/github/ampproject/amphtml)

# AMP HTML ⚡

AMP HTML is a way to build web pages for static content that render with reliable, fast performance. It is our attempt at fixing what many perceive as painfully slow page load times – especially when reading content on the mobile web.

AMP HTML is entirely built on existing web technologies. It achieves reliable performance by restricting some parts of HTML, CSS and JavaScript. These restrictions are enforced with a validator that ships with AMP HTML. To make up for those limitations AMP HTML defines a set of [custom elements](http://www.html5rocks.com/en/tutorials/webcomponents/customelements/) for rich content beyond basic HTML.

For more info on how AMP HTML works, and some insights into the design, please read our blog post ["A new approach to web performance"](https://www.ampproject.org/how-it-works/) (which may be the first AMP HTML file you ever see :). We also have a non-technical description of what we are doing on [www.ampproject.org](https://www.ampproject.org).

# How does AMP HTML work?

AMP HTML works by including the AMP JS library and adding a bit of boilerplate to a web page, so that it meets the AMP HTML Specification. The simplest AMP HTML file looks like this:

```html
<!doctype html>
<html ⚡>
  <head>
    <meta charset="utf-8">
    <link rel="canonical" href="hello-world.html" >
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <style>body {opacity: 0}</style><noscript><style>body {opacity: 1}</style></noscript>
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

## The AMP JS library

The AMP JS library provides [builtin](builtins/README.md) AMP Components, manages the loading of external resources, and ensures a reliably fast time-to-paint.

## The AMP Validator

The AMP Validator allows a web developer to easily identify if the web page
doesn't meet the AMP HTML specification.

Adding "#development=1" to the URL of the page instructs the AMP Runtime to run
a series of assertions confirming the page's markup meets the AMP HTML
Specification.  Validation errors are logged to the browser's console when the
page is rendered, allowing web developers to easily see how complex changes in
web code might impact performance and user experience.

It also allows apps that integrate web content to validate the web page against
the specification.  This allows an app to make sure the page is fast and
mobile-friendly, as pages adhering to the AMP HTML specification are reliably
fast.

## AMP HTML Components

AMP HTML Components are a series of additional custom elements that supplement
or replace functionality of core HTML5 elements to allow the runtime to ensure
it is solely responsible for loading external assets and to provide for shared
best practices in implementation.

These components can:
* Replace HTML5 elements that are not directly permitted in the specification
  such as [amp-img](builtins/amp-img.md) and [amp-video](builtins/amp-video.md).
* Implement embedded third-party content, such as
[amp-ad](builtins/amp-ad.md),
[amp-pinterest](extensions/amp-pinterest/amp-pinterest.md),
[amp-twitter](extensions/amp-twitter/amp-twitter.md),
and [amp-youtube](extensions/amp-youtube/amp-youtube.md).
* Provide for common patterns in web pages,
such as [amp-lightbox](extensions/amp-lightbox/amp-lightbox.md)
and [amp-carousel](extensions/amp-carousel/amp-carousel.md).
* Make advanced performance techniques easy,
such as [amp-anim](extensions/amp-anim/amp-anim.md),
which allows web developers to dynamically serve animated images
as either image files (GIF) or video files (WebM or MP4) based on browser compatibility.

# Further Reading

Resources:
* [AMP HTML samples](examples/)
* [AMP-HTML on StackOverflow](https://stackoverflow.com/questions/tagged/amp-html)

Tutorials:
* [How to Create a Basic AMP HTML Page](docs/create_page.md)
* [How to Include Common Features](docs/include_features.md)

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

Blog posts:
 * [Accelerated Mobile Pages – A new approach to web performance](https://www.ampproject.org/how-it-works/)

# Who makes AMP HTML?

AMP HTML is made by the [AMP Project](https://www.ampproject.org/), and is licensed
under the [Apache License, Version 2.0](LICENSE).

## Contributing

Please see [the CONTRIBUTING file](CONTRIBUTING.md) for information on contributing to the AMP Project, and [the DEVELOPING file](DEVELOPING.md) for documentation on the AMP library internals and [hints how to get started](DEVELOPING.md#starter-issues).

### [Code of conduct](CODE_OF_CONDUCT.md)

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

# AMP HTML ⚡

AMP HTML is a specified way of building web pages for static content that
ensures reliably fast performance on mobile devices.  It's made possible by the
AMP JS library, which, when included in a web page, makes it easy to build fast
web pages.

# How does AMP HTML work?

AMP HTML works by including the AMP library in a web page that meets the AMP
HTML Specification:

```html
  <script src="https://cdn.ampproject.org/v0.js" async></script>
```

This allows the AMP library to include:
* The AMP runtime, that manages the loading of external resources to ensure a
  fast rendering of the page.
* An AMP validator that provides a way for web developers to easily validate
  that their code meets the AMP HTML specification. 
* Some custom elements, called AMP HTML components, which make common patterns
  easy to implement in a performant way.

## The AMP Runtime

The AMP runtime manipulates the DOM to manage the loading of external resources
and ensure a reliably fast time-to-paint.

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
* Replace HTML5 elements that are not permitted in the specification, typically
  with added syntax sugar, such as amp-img and amp-video.
* Implement embedded third-party content, such as amp-youtube, amp-ad, and
  amp-twitter.
* Provide for common patterns in web pages, such as amp-lightbox and
  amp-slides.
* Make advanced performance techniques easy, such as amp-anim, which allows web
  developers to dynamically serve animated images as either image files (GIF)
  or video files (WebM or MP4) based on browser compatability.  

# Further Reading

Tutorials:
* [How to Create a Basic AMP HTML Page](docs/create_page.md)
* [How to Include Common Features](docs/include_features.md)
* [Integrating your AMP HTML page](docs/integrating.md)
* [Extending AMP HTML with new elements](docs/extending.md)
* [Embedding AMP HTML content in your app](docs/embedding.md)

Reference:
* [AMP HTML core built-in elements](builtins/README.md)
* [AMP HTML optional extended elements](extensions/README.md)

Technical Specifications:
* [AMP HTML format specification](spec/amp-html-format.md)
* [AMP HTML custom element specification](spec/amp-html-components.md)

Resources:
* [AMP HTML samples](examples/)
* [AMP HTML FAQ](docs/FAQ.md)

# Who made AMP HTML?

AMP HTML is made by the [AMP Project](www.ampproject.org]), and is licensed
under the [Apache License, Version 2.0](LICENSE.md).

For more info how AMP HTML works and some insights into the design and
motivation, please read our blog post ["Web performance: An intervention"](https://www.ampproject.org/how-it-works/) 

## Contributing

Please see [the CONTRIBUTING file](CONTRIBUTING.md) for resources on
contributing to the AMP Project.


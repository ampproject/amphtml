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

# AMP HTML Templates

## Overview

The AMP templating system allows AMP elements to render dynamic content using
templates defined within the AMP document. The data for templates is received
[from a CORS JSON endpoint](http://stackoverflow.com/questions/40315196/which-amp-extensions-can-fetch-a-response-from-an-endpoint).

The templates are defined using a templating language exported by an AMP templating
extension. For example, "amp-mustache" templates are defined using
[Mustache.js](https://github.com/janl/mustache.js/) syntax. However, any
templating language has its syntax restricted and verified by the AMP validator to
ensure that XSS and other issues cannot be dynamically injected into the AMP
document.

## Declaration

Before AMP templates can be used, the templating system has to be declared in the document's `head`:

```html
<script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.1.js"></script>
```

The `script` tag must be declared as `async` and with the `custom-template` attribute.
See the [AMP Spec](amp-html-format.md) for more detail.

## Security

All AMP template implementations must go through the AMP security review before they can be
submitted to the AMP repository.

## Usage

Templates can be defined anywhere in the AMP document's `body`, like this:

```html
<template type="amp-mustache">
  Hello {{world}}!
</template>
```

The `type` attribute must reference the template's type as defined in the `custom-template`
attribute when the templating system was imported in the document's `head`.

The use of the template is up to a specific AMP element that wants to use it. An AMP element would typically
look for a template within its children or using a template's ID. For instance, an `amp-carousel` element
may (in the future) use a CORS endpoint and an AMP template to load and render a dynamic set of slides.

## API

AMP elements can use `templates.renderTemplate` methods to render a template. It is up to
a specific AMP element how `templateElement` and `data` are provided.

## Templates

Here's a list of available extended templates:

| Template  | Description |
| --------- | ----------- |
| [`amp-mustache`](../extensions/amp-mustache/amp-mustache.md) | Allows rendering of [`Mustache.js`](https://github.com/janl/mustache.js/) templates. |

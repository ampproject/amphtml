<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-fx-collection"></a> `amp-fx-collection`

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Provides a collection of preset visual effects, such as parallax.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-fx-collection" src="https://cdn.ampproject.org/v0/amp-fx-collection-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
</table>

## Overview

The `amp-fx-collection` extension provides a collection of preset visual effects,
such as parallax that can be easily enabled on any element via attributes.

Currently, only the `parallax` effect is supported. More effects such as `fade-in`, `slide-in`
are planned to be supported soon.

### parallax
The `parallax` effect allows an element to move as if it is nearer or farther relative
to the foreground of the page content. As the user scrolls the page, the element
scrolls faster or slower depending on the value assigned to the
`data-parallax-factor` attribute.

Example:
```html
<h1 amp-fx="parallax" data-parallax-factor="1.5">
  A title that moves faster than other content
</h1>
```

#### Attributes

##### data-parallax-factor

Specifies a decimal value that controls how much faster or slower the element scrolls
relative to the scrolling speed:

- A value greater than 1 scrolls the element upward (element scrolls faster) when the user scrolls down the page.
- A value less than 1 scrolls the element downward (element scrolls slower) when the user scrolls downward.
- A value of 1 behaves normally.
- A value of 0 effectively makes the element scroll fixed with the page.

## Validation

See [amp-fx-collection rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-fx-collection/validator-amp-fx-collection.protoascii) in the AMP validator specification.

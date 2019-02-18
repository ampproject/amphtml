<!--
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

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

# `amp-scroll-toggle`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Slides a floating element in-and-out of view as the document is scrolled
    up or down.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><strong>Experimental</strong></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-scroll-toggle" src="https://cdn.ampproject.org/v0/amp-scroll-toggle-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td><code>nodisplay</code></td>
  </tr>
</table>

## Behavior

Slides a floating element (e.g. a fixed header or [bottom navigation](https://material.io/design/components/bottom-navigation.html)) in-and-out of view as the document is scrolled up or down.

```html
<header id="my-header">
  <h1>Ampersand News</h1>
</header>
<amp-scroll-toggle layout="nodisplay" target="my-header">
</amp-scroll-toggle>
```

When [in the Google viewer](https://developers.google.com/search/docs/guides/about-amp#the-google-amp-viewer), the toggled elements will slide along the viewer's header.

## Attributes

<table>
  <tr>
    <td width="40%"><strong>target</strong> (required)</td>
    <td>Element to toggle by id. Must be a valid element id. The element
    referenced must also have a <a href="#target-css-properties">few mandatory CSS properties.</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>position</strong></td>
    <td>One of <code>top</code> or <code>bottom</code>.
    <code>top</code> by default.</a> Defines the position of the target element
    to direct its sliding transition.</td>
  </tr>
</table>

## <a id="target-css-properties"></a> Mandatory `target` properties

The target element must contain the following CSS properties set to the corresponding values:

* `overflow: hidden`
* `position: fixed`
* if the `position` attribute on `<amp-scroll-toggle>` is set to `top`, the target must have `top: 0`
* if the `position` attribute on `<amp-scroll-toggle>` is set to `bottom`, the target must have `bottom: 0`

If any of these properties is absent or set to an incorrect value, an error will
be thrown and sliding behavior will not be enabled for this target.

## Validation
See [amp-scroll-toggle rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-scroll-toggle/validator-amp-scroll-toggle.protoascii) in the AMP validator specification.

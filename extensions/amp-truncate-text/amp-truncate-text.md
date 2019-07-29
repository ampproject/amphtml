---
$category@: presentation
formats:
  - websites
teaser:
  text: Truncates text with an ellipsis, optionally showing an overflow element.
experimental: true
---
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

# `amp-truncate-text`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Truncates text within a container with an ellipsis.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><div><a href="https://amp.dev/documentation/guides-and-tutorials/learn/experimental">Experimental</a>; You must turn on the <code>amp-truncate-text</code> experiment to use this component.</div></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-truncate-text" src="https://cdn.ampproject.org/v0/amp-truncate-text-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>container, fill, fixed, fixed-height, flex-item, intrinsic, nodisplay, responsive</td>
  </tr>
</table>

## Behavior

Truncates text with an ellipsis, optionally showing an overflow element when there is overflow. The overflow element is always placed at the end of the content and must be a direct child of `<amp-truncate-text>`.

## Children

<table>
  <tr>
    <td width="40%"><strong>slot="collapsed"</strong></td>
    <td>An optional element show when the element has truncated text. Clicking
    this will expand the element. This must be a direct child of <code>amp-truncate-text</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>slot="expanded"</strong></td>
    <td>An optional element show when the element was expanded. Clicking
    this will collapse the element to the same size before expansion. This must be a direct child of <code>amp-truncate-text</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>slot="persistent"</strong></td>
    <td>An optional element than is always shown, regardless of whether or not the text is truncated. This must be a direct child of <code>amp-truncate-text</code>.</td>
  </tr>
</table>

## Usage

```html
<amp-truncate-text layout="fixed" height="3em" width="20em">
  Some text that may get truncated.
  <button slot="collapsed">See more</button>
  <button slot="expanded">See less</button>
</amp-truncate-text>
```

## Using a Custom Action

If you do not want to expand in place, you can use `slot="persistent"` to perform a custom acton, such as navigating to another page with additional information. This can be useful when there is more content than would make sense to expand inline.

```html
<amp-truncate-text layout="fixed-height" height="3em">
  Some text that may get truncated.
  <a href="some/url" slot="persistent">See more</a>
</amp-truncate-text>
```

You can also customize the action for an element with `slot="collapsed"` by using either an anchor tag or a tap action. Note that this will not show up if the text fits. For example:

```html
<amp-truncate-text layout="fixed-height" height="3em">
  Some text that may get truncated.
  <a href="some/url" slot="collapsed">See more</a>
</amp-truncate-text>
```

By default, clicking within an element that has `slot="expanded"` will collapse the content. Like for `slot="collapsed"`, using an anchor tag or a tap action will allow you to override the behavior to do something else, like link to another page.

```html
<amp-truncate-text layout="fixed-height" height="3em">
  Some text that may get truncated.
  <button slot="collapsed">See more</button>
  <a href="some/url" slot="expanded">See even more</a>
</amp-truncate-text>
```

## Validation
See [amp-truncate-text rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-truncate-text/validator-amp-truncate-text.protoascii) in the AMP validator specification.

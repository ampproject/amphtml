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

# <a name="amp-anim"></a> `amp-anim`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>A runtime-managed animated image, typically a GIF.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-anim/">Annotated code example for amp-anim</a></td>
  </tr>
</table>

## Behavior

The `amp-anim` component is almost identical to the `amp-img` element, but allows the AMP runtime to reduce CPU usage when the animation is off-screen. Like [other elements](https://www.ampproject.org/docs/guides/author-develop/responsive/placeholders), it supports an optional `placeholder` child, to display while the `src` file is loading:

```html
<amp-anim width=400 height=300 src="my-gif.gif">
  <amp-img placeholder width=400 height=300 src="my-gif-screencap.jpg">
  </amp-img>
</amp-anim>
```

In the future, additional functionality, such as animation playback control, could be added.

## Attributes

**src**

Similar to the `src` attribute on the `img` tag. The value must be a URL that
points to a publicly-cacheable image file. Cache providers may rewrite these
URLs when ingesting AMP files to point to a cached version of the image.

**srcset**

Same as `srcset` attribute on the `img` tag.

**alt**

A string of alternate text, similar to the `alt` attribute on `img`.

**attribution**

A string that indicates the attribution of the image. For example, `attribution="CC courtesy of Cats on Flicker"`.

**height** and **width**

An explicit size of the image, which is used by the AMP runtime to determine the aspect ratio without fetching the image. 

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.


## Styling

`amp-img` can be styled directly via CSS properties. Setting a grey background
placeholder for example could be achieved via:
```css
amp-anim {
  background-color: grey;
}
```
## Validation

See [amp-anim rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-anim/validator-amp-anim.protoascii) in the AMP validator specification.

<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-sticky-ad"></a> `amp-sticky-ad`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>A stickyAd provides a way to fix ad at bottom of a page. The stickyAs serves as a container and the ad as its child will display as sticky-ad</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-sticky-ad" src="https://cdn.ampproject.org/v0/amp-sticky-ad-1.0.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-sticky-ad/">Annotated code example for amp-sticky-ad</a></td>
  </tr>
</table>

## Behavior

- There can be only one `<amp-sticky-ad>` in an AMP document. The `<amp-sticky-ad>` should only have one direct child of `<amp-ad>`.
- The sticky ad will appear on the bottom of a page.
- The sticky ad introduces a full width blank container and then fills the sticky ad based on the width and height of the amp-ad.
- The height of the sticky-ad is whatever its child needs up to its max-height.
- The max-height of the sticky-ad is 100px, if the height exceeds 100px then the height would be 100px and overflow content will be hidden.
- The width of the sticky-ad is set to 100% using CSS and cannot be overridden.
- The opacity of the sticky-ad is set to 1 using CSS and cannot be overridden.
- The background color of the sticky-ad can be customized to match page style. However any semi-transparent or transparent background will not be allowed and will be changed to a non-transparent color.
- The sticky ad will display after scroll one viewport height from top provided there is at least one more viewport of content available.
- When scrolled to the bottom of the page, the viewport is automatically padded with the additional height of the sticky ad, so that no content is ever hidden.
- When in landscape mode, the sticky ad will be center aligned.
- The sticky ad can be dismissed and removed by a close button.

Example:
```html
<amp-sticky-ad layout="nodisplay">
  <amp-ad width="320"
        height="50"
        type="doubleclick"
        data-slot="/35096353/amptesting/formats/sticky">
  </amp-ad>
</amp-sticky-ad>
```

## Attributes

**layout**

The only permissible value for the `layout` attribute in `amp-sticky-ad` is `nodisplay`.

## Styling

The `amp-sticky-ad` component can be styled with standard CSS.

- Sticky ad container style can be set through css class `amp-sticky-ad`.
- Close button style can be set through css class `amp-sticky-ad-close-button`.

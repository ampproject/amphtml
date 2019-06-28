---
$category@: presentation
formats:
  - websites
  - emails
  - ads
  - stories
teaser:
  text: Expands or shrinks font size to fit the content within the space given.
---
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

# amp-fit-text
Expands or shrinks its font size to fit the content within the space given to it.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-fit-text" src="https://cdn.ampproject.org/v0/amp-fit-text-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, intrinsic, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-fit-text/">amp-fit-text example</a>.</td>
  </tr>
</table>

[TOC]

## Behavior

The `amp-fit-text` component allows you to manage the size and fit of text within a specified area. For content contained in an `amp-fit-text` element, the `amp-fit-text` component finds the best font size to fit all of the content within the available space. The expected content for `amp-fit-text` is text or other inline content, but it can also contain non-inline content.


##### Example: Text scales to fit area

In the following example, the `<amp-fit-text>` element is nested within a 300x300 blue `div` block (class `fixedblock`). For the `<amp-fit-text>` element, we specified a `responsive` layout.  As a result, the text scales responsively per the aspect ratio provided by the width and height (200x200) of the `<amp-fit-text>` element, but the text does not exceed the size of its parent.

<!--embedded example - displays in ampproject.org -->
<div>
<amp-iframe height="207"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/ampfittext.base.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div>
</amp-iframe>
</div>

##### Example: Text scales to fit area using a maximum font size

The following example is similar to the one above, but in this example we specify a `max-font-size` of `22`, so the text is smaller but still fits the space:

<!--embedded example - displays in ampproject.org -->
<div>
  <amp-iframe height="226"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/ampfittext.max-font.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div>
</amp-iframe>

</div>

### Overflowing content

If the content of the `amp-fit-text` overflows the available space, even with a
`min-font-size` specified, the overflowing content is cut off and hidden. WebKit and Blink-based browsers show ellipsis for overflowing content.

##### Example: Text truncates when content overflows area

In the following example, we specified a `min-font-size` of `40`, which causes the content to exceed the size of its fixed block parent, so the text is truncated to fit the container.

<!--embedded example - displays in ampproject.org -->
<div>
<amp-iframe height="226"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/ampfittext.min-font.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div>
</amp-iframe>
</div>


## Attributes
<table>
  <tr>
    <td width="40%"><strong>min-font-size</strong></td>
    <td>Specifies the minimum font size as an integer that the <code>amp-fit-text</code> can use.</td>
  </tr>
  <tr>
    <td width="40%"><strong>max-font-size</strong></td>
    <td>Specifies the maximum font size as an integer that the <code>amp-fit-text</code> can use.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>


## Styling

You can style the `amp-fit-text` with standard CSS. In particular, you can use `text-align`, `font-weight`, `color` and many other CSS properties, with the main exception of `font-size`.

## Validation

See [amp-fit-text rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-fit-text/validator-amp-fit-text.protoascii) in the AMP validator specification.

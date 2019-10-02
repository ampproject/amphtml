---
$category: presentation
formats:
  - websites
teaser:
  text: FILL THIS IN.
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

# `amp-infinite-scroll`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Implements infinite scroll (feed that does automatically load next page once user scrolls down near amp-infinite-scroll visible area)</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-infinite-scroll" src="https://cdn.ampproject.org/v0/amp-infinite-scroll-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://amp.dev/documentation/examples/components/amp-infinite-scroll/">Annotated code example for amp-infinite-scroll</a></td>
  </tr>
</table>

## Behavior

This component implements scroll auto populated page, aka infinite scroll. When user scrolls down the page and hits area of visibility for amp-infinite scroll
it sends request to URL specified in `next-page` attribute and injects amp markup returned by `next-page` param into page.

Example:

```HTML
    <amp-infinite-scroll
      layout="fixed"
      width="500"
      height="20"
      next-page="https://someapi.com/page/"
    >
      <div placeholder>Loading...</div>
      <div fallback>Failed to load data, try to reload page</div>
    </amp-infinite-scroll>
```

While next page is loading `placeholder` attribute would be shown, if API has failed `fallback` element will be shown, see [Placeholders and Fallbacks docs](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/placeholders/)

API Requirements:

API URI passed to `next-page` param should return JSON response containing two mandatory fields: page (AMP HTML page content) and nextPage

Server response example: 

```javascript
{
  page: '<span>Next page content</span>'
  nextPage: 'https://someapi.com/page/2'
}
```

<table>
  <tr>
    <td width="40%"><strong>page <small>(required)</small></strong></td>
    <td>HTML to be injected into page when amp-infinite-scroll triggers load</td>
  </tr>
  <tr>
    <td width="40%"><strong>nextPage <small>(required)</small></strong></td>
    <td>should be either string that contains next page URI or `null` if current page is last. In this case no further requests would be send and it assumes we've reached end of pages available</td>
  </tr>
</table>



## Attributes

<table>
  <tr>
    <td width="40%"><strong>next-page(required)</strong></td>
    <td>API URI that returns next page data</td>
  </tr>
  <tr>
    <td width="40%"><strong>width (required)</strong></td>
    <td>The width of the amp-infinite-scroll component</td>
  </tr>
  <tr>
    <td width="40%"><strong>height (required)</strong></td>
    <td>The height of the amp-infinite-scroll component</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation
See [amp-infinite-scroll rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-infinite-scroll/validator-amp-infinite-scroll.protoascii) in the AMP validator specification.

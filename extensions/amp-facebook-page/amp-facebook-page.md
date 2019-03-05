---
$category@: social
formats:
  - websites
teaser:
  text: Embeds the Facebook page plugin.
---
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

# amp-facebook-page

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Embeds the <a href="https://developers.facebook.com/docs/plugins/page-plugin">Facebook page plugin</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-facebook-page" src="https://cdn.ampproject.org/v0/amp-facebook-page-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-facebook-page/">amp-facebook-page example</a>.</td>
  </tr>
</table>

[TOC]

## Overview

You can use the `amp-facebook-page` component to embed the [Facebook page plugin](https://developers.facebook.com/docs/plugins/page-plugin).

**Example**

```html
<amp-facebook-page width="340" height="130"
    layout="fixed"
    data-hide-cover="true"
    data-href="https://www.facebook.com/imdb/">
</amp-facebook-page>
```
## Attributes
<table>
  <tr>
    <td width="40%"><strong>data-href (required)</strong></td>
    <td>The absolute URL of the Facebook page. For example, <code>https://www.facebook.com/imdb/</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-locale (optional)</strong></td>
    <td>By default, the locale is set to the user's system language; however, you can specify a locale as well. For details, visit the <a href="https://developers.facebook.com/docs/internationalization">Facebook API Localization page</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-tabs (optional)</strong></td>
    <td>Specifies the tabs to render (i.e., <code>timeline</code>, <code>events</code>, <code>messages</code>). Use a comma-separated list to add multiple tabs (e.g., <code>timeline, events</code>). By default, the Facebook page plugin shows the timeline activity.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-hide-cover (optional)</strong></td>
    <td>Hides the cover photo in the header. Default value is <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-show-facepile (optional)</strong></td>
    <td>Shows profile photos of friends who like the page. Default value is <code>true</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-hide-cta (optional)</strong></td>
    <td>Hides the custom call to action button (if available). Default value is <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-small-header (optional)</strong></td>
    <td>Uses the small header instead. Default value is <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>


## Validation

See [amp-facebook-page rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-facebook-page/validator-amp-facebook-page.protoascii) in the AMP validator specification.

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

# <a name="amp-facebook-page"></a> `amp-facebook-page`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Embeds the Facebook page plugin.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-facebook-page" src="https://cdn.ampproject.org/v0/amp-facebook-page-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

[TOC]

## Overview

You can use the `amp-facebook-page` component to embed the [Facebook page plugin](https://developers.facebook.com/docs/plugins/page-plugin).

**Example**

```html
<amp-facebook-page width=90 height=20
    layout="fixed"
    data-hide-cover="true"
    data-href="https://www.facebook.com/testesmegadivertidos/">
</amp-facebook-page>
```
## Attributes

##### data-href (required)

The absolute URL of the page. For example, `https://www.facebook.com/barackobama/`.

##### data-locale (optional)

By default, the local is set to user's system language; however, you can specify a locale as well.

For details on strings accepted here please visit the [Facebook API Localization page](https://developers.facebook.com/docs/internationalization)

##### data-tabs (optional)

By default the Facebook page plugin shows the timeline activity as well.

You can specify the tabs to render i.e. `timeline`, `events`, `messages`. Use a comma-separated list to add multiple tabs, i.e. `timeline, events`.

##### data-hide-cover (optional)

Attribute hides cover photo in the header. `false` (cover photo displayed) by default.

##### data-show-face-pile (optional)

Shows profile photos of friends who like the page. `true` by default.

##### data-hide-cta (optional)

Hide the custom call to action button (if available). `false` by default.

##### data-small-header (optional)

Use the small header instead. `false` by default.

##### data-adapt-container-width (optional)

Try to fit inside the container width. `true` by default.

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-facebook-page rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-facebook-page/validator-amp-facebook-page.protoascii) in the AMP validator specification.

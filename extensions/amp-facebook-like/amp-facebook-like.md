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

# <a name="amp-facebook-like"></a> `amp-facebook-like`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Embeds the Facebook like-button plugin.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-facebook-comments" src="https://cdn.ampproject.org/v0/amp-facebook-like-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

## Overview

You can use the `amp-facebook-like` component to embed the [Facebook like-button plugin](https://developers.facebook.com/docs/plugins/like-button).

**Example**

```html
<amp-facebook-like width=120 height=30
    layout="responsive"
    data-layout="button_count"
    data-action="like"
    data-size="large"
    data-show-faces="false"
    data-share="false"
    data-href="https://www.facebook.com/testesmegadivertidos/">
</amp-facebook-like>
```
## Attributes

**data-href** (required)

The absolute URL of the page that will be liked. For example, `https://www.facebook.com/testesmegadivertidos/`.

**data-action** (optional)

The verb to display on the button. Can be either like or recommend.

**data-colorscheme** (optional)
The color scheme used by the plugin for any text outside of the button itself. Can be light or dark.

**data-kid_directed_site** (optional)
If your web site or online service, or a portion of your service, is directed to children under 13 you must enable this

**data-layout** (optional)
Selects one of the different layouts that are available for the plugin. Can be one of standard, button_count, button or box_count.

**data-ref** (optional)
A label for tracking referrals which must be less than 50 characters and can contain alphanumeric characters and some punctuation.

**data-share** (optional)
Specifies whether to include a share button beside the Like button. This only works with the XFBML version.

**data-show_faces** (optional)
Specifies whether to display profile photos below the button (standard layout only). You must not enable this on child-directed sites.

**data-size** (optional)
The button is offered in 2 sizes i.e. large and small.

For details, see the [Facebook comments documentation](https://developers.facebook.com/docs/plugins/like-button?locale=en_US#settings).

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-facebook-like rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-facebook-like/0.1/validator-amp-facebook-like.protoascii) in the AMP validator specification.

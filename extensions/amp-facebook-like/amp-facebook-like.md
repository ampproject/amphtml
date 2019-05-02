---
$category@: social
formats:
  - websites
teaser:
  text: Embeds the Facebook like button plugin.
---
<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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

# amp-facebook-like

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Embeds the Facebook like button plugin.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-facebook-like" src="https://cdn.ampproject.org/v0/amp-facebook-like-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-facebook-like/">amp-facebook-like example</a>.</td>
  </tr>
</table>

[TOC]

## Overview

You can use the `amp-facebook-like` component to embed the [Facebook like button plugin](https://developers.facebook.com/docs/plugins/like-button).

**Example**

```html
<amp-facebook-like width=90 height=20
    layout="fixed"
    data-layout="button_count"
    data-href="https://www.facebook.com/testesmegadivertidos/">
</amp-facebook-like>
```
## Attributes
<table>
  <tr>
    <td width="40%"><strong>data-href (required)</strong></td>
    <td>The absolute URL of the page that will be liked. For example, <code>https://www.facebook.com/testesmegadivertidos/</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-locale (optional)</strong></td>
    <td>By default, the locale is set to user's system language; however, you can specify a locale as well. <br> For details on strings accepted here please visit the <a href="https://developers.facebook.com/docs/internationalization">Facebook API Localization page</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-action (optional)</strong></td>
    <td>The verb to display on the button. Can be either <code>like</code> or <code>recommend</code>. The default is <code>like</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-colorscheme (optional)</strong></td>
    <td>The color scheme used by the plugin for any text outside of the button itself. Can be <code>light</code> or <code>dark</code>. The default is <code>light</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-kd_site  (optional)</strong></td>
    <td>This attribute is also known as <code>data-kid_directed_site</code> in the Facebook SDK.
If your web site or online service, or a portion of your service, is directed to children under 13 you must enable this attribute. The default is <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-layout (optional)</strong></td>
    <td>Selects one of the different layouts that are available for the plugin. Can be one of <code>standard</code>, <code>button_count</code>, <code>button</code> or <code>box_count</code>. The default is <code>standard</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-ref (optional)</strong></td>
    <td>A label for tracking referrals which must be less than 50 characters and can contain alphanumeric characters and some punctuation.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-share (optional)</strong></td>
    <td>Specifies whether to include a share button beside the Like button. This only works with the XFBML version. The default is <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-show_faces (optional)</strong></td>
    <td>Specifies whether to display profile photos below the button (standard layout only). You must not enable this on child-directed sites. The default is <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-size (optional)</strong></td>
    <td>The size of the button, which can be one of two sizes, <code>large</code> or <code>small</code>. The default is <code>small</code>. <br>For details, see the <a href="https://developers.facebook.com/docs/plugins/like-button#settings">Facebook comments documentation</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>


## Validation

See [amp-facebook-like rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-facebook-like/validator-amp-facebook-like.protoascii) in the AMP validator specification.

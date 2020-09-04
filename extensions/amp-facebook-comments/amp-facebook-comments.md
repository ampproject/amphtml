---
$category@: social
formats:
  - websites
teaser:
  text: Embeds the Facebook comments plugin.
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

# amp-facebook-comments

## Overview

You can use the `amp-facebook-comments` component to embed the [Facebook comments plugin](https://developers.facebook.com/docs/plugins/comments).

**Example**

```html
<amp-facebook-comments
  width="486"
  height="657"
  layout="responsive"
  data-numposts="5"
  data-href="http://www.directlyrics.com/adele-25-complete-album-lyrics-news.html"
>
</amp-facebook-comments>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-href (required)</strong></td>
    <td>The URL of the comments page. For example, <code>http://www.directlyrics.com/adele-25-complete-album-lyrics-news.html</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-locale (optional)</strong></td>
    <td>By default, the locale is set to user's system language; however, you can specify a locale as well. <br><br> For details on strings accepted here please visit the <a href="https://developers.facebook.com/docs/internationalization">Facebook API Localization page</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-numposts (optional)</strong></td>
    <td>The number of comments to show. Currently Facebook SDK limits this to max 100. For details, see the <a href="https://developers.facebook.com/docs/plugins/comments">Facebook comments documentation</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-order-by (optional)</strong></td>
    <td>The order to use when displaying comments. For details, see the <a href="https://developers.facebook.com/docs/plugins/comments">Facebook comments documentation</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

**Deprecated Attributes**
<table>
  <tr>
    <td width="40%"><strong>data-colorscheme (optional)</strong></td>
    <td>The color scheme. For details, see the <a href="https://developers.facebook.com/docs/plugins/comments">Facebook comments documentation</a>.<br><br><em>Note: This is no longer supported by Facebook. For more details, follow our <a href="https://github.com/ampproject/amphtml/issues/29980">our tracking issue</a> and <a href="https://developers.facebook.com/support/bugs/1759174414250782/">Facebook's bug report</a>.</em></td>
  </tr>
</table>

## Validation

See [amp-facebook-comments rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-facebook-comments/validator-amp-facebook-comments.protoascii) in the AMP validator specification.

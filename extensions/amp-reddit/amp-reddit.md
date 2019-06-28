---
$category@: social
formats:
  - websites
teaser:
  text: Displays a Reddit comment or post embed.
---
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

# amp-reddit

Displays a Reddit comment or post embed.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-reddit" src="https://cdn.ampproject.org/v0/amp-reddit-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-reddit/">amp-reddit example</a>.</td>
  </tr>
</table>

[TOC]

## Examples

Use the `amp-reddit` component to embed a Reddit post or comment.

**Example: Embedding a Reddit post**

```html
<amp-reddit
  layout="responsive"
  width="300"
  height="400"
  data-embedtype="post"
  data-src="https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed">
</amp-reddit>
```

**Example: Embedding a Reddit comment**

```html
<amp-reddit
  layout="responsive"
  width="400"
  height="400"
  data-embedtype="comment"
  data-src="https://www.reddit.com/r/sports/comments/54loj1/50_cents_awful_1st_pitch_given_a_historical/d8306kw"
  data-uuid="b1246282-bd7b-4778-8c5b-5b08ac0e175e"
  data-embedcreated="2016-09-26T21:26:17.823Z"
  data-embedparent="true"
  data-embedlive="true">
</amp-reddit>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-embedtype (required)</strong></td>
    <td>The type of embed, either <code>post</code> or <code>comment</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-src (required)</strong></td>
    <td>The permamlink uri for the post or comment.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-uuid</strong></td>
    <td>The provided UUID for the comment embed. Supported when <code>data-embedtype</code> is <code>comment</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-embedcreated</strong></td>
    <td>The datetime string for the comment embed. Supported when <code>data-embedtype</code> is <code>comment</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-embedparent</strong></td>
    <td>The datetime string for the comment embed. Supported when <code>data-embedtype</code> is <code>comment</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-embedlive</strong></td>
    <td>Indicates whether the embedded comment should update if the original comment is updated. Supported when <code>data-embedtype</code> is <code>comment</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-reddit rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-reddit/validator-amp-reddit.protoascii) in the AMP validator specification.

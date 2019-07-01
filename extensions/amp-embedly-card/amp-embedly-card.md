---
$category@: media
formats:
  - websites
teaser:
  text: Displays an Embedly card.
---
<!--
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

# amp-embedly-card

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Provides you with responsive and shareable embeds to drive the reach of your websites, blog posts, and articles from any URL using <a href="http://docs.embed.ly/docs/cards">Embedly cards</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-embedly-card" src="https://cdn.ampproject.org/v0/amp-embedly-card-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>responsive</td>
  </tr>
</table>

## Behavior

The `amp-embedly-card` component provides you with responsive and shareable embeds to drive the reach of your websites,
blog posts, and articles from any URL using <a href="http://docs.embed.ly/docs/cards">Embedly cards</a>.

Cards are the easiest way to leverage Embedly. For any media, cards provide a responsive embed with built-in embed analytics.

*Example: Embedding multiple resources*

If you have a paid plan, use the `amp-embedly-key` component to set your api key.
You just need one `amp-embedly-key` per AMP page.

```html
<amp-embedly-key
    value="12af2e3543ee432ca35ac30a4b4f656a"
    layout="nodisplay">
</amp-embedly-key>
```

If you are a paid user, setting the `amp-embedly-key` tag removes Embedly's branding from the cards.

Within your AMP page, you can include one or multiple `amp-embedly-card` components:

```html
<amp-embedly-card
    data-url="https://twitter.com/AMPhtml/status/986750295077040128"
    layout="responsive"
    width="150"
    height="80"
    data-card-theme="dark"
    data-card-controls="0">
</amp-embedly-card>

<amp-embedly-card
    data-url="https://www.youtube.com/watch?v=lBTCB7yLs8Y"
    layout="responsive"
    width="100"
    height="50">
</amp-embedly-card>
```

## Attributes
<table>
  <tr>
    <td width="40%"><strong>data-url (required)</strong></td>
    <td>The URL to retrieve embedding information.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-card-via</strong></td>
    <td>Specifies the via content in the card. This is a a great way to do attribution. This is an optional attribute.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-card-theme</strong></td>
    <td>Allows settings the <code>dark</code> theme which changes the background color of the main card container. Use <code>dark</code> to set this theme. For dark backgrounds it's better to specify this. The default is <code>light</code>, which sets no background color of the main card container.</td>
  </tr>
  <tr>
     <td width="40%"><strong>data-card-embed</strong></td>
     <td>The URL to a video or rich media. Use with static embeds like articles, instead of using the static page content in the card, the card will embed the video or rich media.
</td>
   </tr>
   <tr>
     <td width="40%"><strong>data-card-image</strong></td>
     <td>The URL to an image. Specifies which image to use in article cards when <code>data-url</code> points to an article.
Not all image URLs are supported, if the image is not loaded, try a different image or domain.</td>
   </tr>
   <tr>
     <td width="40%"><strong>data-card-controls</strong></td>
     <td><p>Enables share icons.</p>
<ul>
  <li>`0`: Disable share icons.</li>
  <li>`1`: Enable share icons</li>
</ul>
<p>The default is <code>1</code>.</p></td>
   </tr>
   <tr>
      <td width="40%"><strong>data-card-align</strong></td>
      <td>Aligns the card. The possible values are <code>left</code>, <code>center</code> and <code>right</code>. The default value is <code>center</code>.</td>
    </tr>
    <tr>
      <td width="40%"><strong>data-card-recommend</strong></td>
      <td><p>When recommendations are supported, it disables embedly recommendations on video and rich cards.<br>These are recommendations created by embedly.</p>
<ul>
  <li>`0`: Disables embedly recommendations.</li>
  <li>`1`: Enables embedly recommendations.</li>
</ul>
<p>The default value is <code>1</code>.</p></td>
    </tr>
    <tr>
      <td width="40%"><strong>common attributes</strong></td>
      <td>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</td>
    </tr>
</table>

## Validation
See [amp-embedly-card rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-embedly-card/validator-amp-embedly-card.protoascii) in the AMP validator specification.

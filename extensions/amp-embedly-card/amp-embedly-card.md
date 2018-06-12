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

# <a name="`amp-embedly-card`"></a> `amp-embedly-card`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Provides you with responsive and shareable embeds to drive the reach of your websites, blog posts, and articles. from any URL using <a href="http://docs.embed.ly/docs/cards">Embedly cards</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-embedly-card-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>responsive</td>
  </tr>
</table>

## Behavior

Provides you with responsive and shareable embeds to drive the reach of your websites, 
blog posts, and articles. from any URL using <a href="http://docs.embed.ly/docs/cards">Embedly cards</a>.

Cards are the easiest way to leverage Embedly. For any media, Cards provide a responsive
embed with built-in embed analytics.

Example: Embedding multiple resources.

If you have a paid plan, use the `amp-embedly-key` component to set your api key. 
You just need one per document that includes one or multiple `amp-embedly-card` components:

```html
<amp-embedly-key
    value="12af2e3543ee432ca35ac30a4b4f656a"
    layout="nodisplay">
</amp-embedly-key>
```

Setting a key through the `amp-embedly-key` component is optional. If you are a paid user 
this will remove Embedly's branding from the cards.

This tag must only be included once.

Then use the `amp-embedly-card` for the embed content:

```html
 <amp-embedly-card
    data-url="https://twitter.com/AMPhtml/status/986750295077040128"
    layout="responsive"
    width="150"
    height="80"
    data-card-theme="dark"
    data-card-controls="0"
  ></amp-embedly-card>

  <amp-embedly-card
    data-url="https://www.youtube.com/watch?v=lBTCB7yLs8Y"
    layout="responsive"
    width="100"
    height="50"
  ></amp-embedly-card>
```

## Attributes

##### data-url (required)
  
The URL used to retrieve embedding information. 

##### data-card-via

Specifies the via content in the card. It's a great way to do attribution.

##### data-card-chrome

Chrome of 0 will remove the left hand colored border.

##### data-card-theme

For dark backgrounds it's better to specify the dark theme.

##### data-card-image

Specify which image to use in article cards.

##### data-card-controls
	
Enable Share Icons. Default: "1"

##### data-card-align

Align the card, Default: "center"

##### data-card-recommend

Disable Embedly Recommendations on video and rich cards. Default: 1
  
##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

##### data-href (required)

The URL of the Facebook post/video. For example, `https://www.facebook.com/zuck/posts/10102593740125791`.

## Validation
See [amp-embedly-card rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-embedly-card/validator-amp-embedly-card.protoascii) in the AMP validator specification.

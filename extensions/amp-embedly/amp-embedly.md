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

# <a name="`amp-embedly`"></a> `amp-embedly`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Embeds content from any URL using <a href="http://docs.embed.ly/docs/oembed">Embedly’s oEmbed api</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-embedly-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

## Behavior

The `amp-embedly` component allows you to embed third party content from any URL by using <a href="http://docs.embed.ly/docs/oembed">Embedly’s oEmbed api</a>. This api is part of a paid service that will provide you with a paid api key.

Example: Embedding multiple resources.

First, use the `amp-embedly-key` component to set your api key. You just need one per document that includes one or multiple `amp-embedly` components:

```html
<amp-embedly-key
    value="12af2e3543ee432ca35ac30a4b4f656a"
    layout="nodisplay">
</amp-embedly-key>
```

Then use the `amp-embedly` for the embed content:

```html
<amp-embedly 
	data-url="https://twitter.com/AMPhtml/status/970787731533189120" 					layout="responsive" 
	width="150" 
	height="80">
</amp-embedly>  

<amp-embedly 
	data-url="https://vimeo.com/27246366" 
	layout="responsive" 
	width="150"
	height="80">
</amp-embedly>
```

## Attributes

##### data-url (required)
  
The URL used to retrieve embedding information. 
  
##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation
See [amp-embedly rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-embedly/validator-amp-embedly.protoascii) in the AMP validator specification.

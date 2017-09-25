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

# <a name="amp-addthis"></a> `amp-addthis`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays an <a href="https://www.addthis.com">AddThis</a> website tools embed.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-addthis" src="https://cdn.ampproject.org/v0/amp-addthis-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

## Behavior

The `amp-addthis` component provides the ability to embed AddThis website tools (for example, 
sharing buttons, follow buttons, related posts, etc.) on an AMP page.

Example:
```html
<amp-addthis
  width="320"
  height="92"
  data-pubId="ra-59c2c366435ef478"
  data-widgetId="0fyg">
</amp-addthis>
```

## Attributes

**data-pubId**

The AddThis publisher ID found in the URL in the [AddThis dashboard](https://addthis.com/dashboard)
after logging in. For example, in the URL `https://www.addthis.com/dashboard#gallery/pub/ra-55e761259a1acdc2`,
`ra-55e761259a1acdc2` is the publisher ID.

**data-widgetId**

The AddThis widget ID for the tool to be displayed, also found on the [AddThis dashboard](https://addthis.com/dashboard).
The widget Id for a specific tool can be found by opening that tool in the AddThis dashboard and
copying the last part of the URL. For example, in the URL `https://www.addthis.com/dashboard#tool-config/pub/ra-55e761259a1acdc2/widgetId/xz1d`,
`xz1d` is the widget Id.

## Validation

See [amp-addthis rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-addthis/0.1/validator-amp-addthis.protoascii) 
in the AMP validator specification.

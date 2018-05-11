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

# <a name="amp-addthis"></a> `amp-addthis`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays an <a href="https://www.addthis.com">AddThis</a> website tools embed.</td>
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
  data-pub-id="ra-59c2c366435ef478"
  data-widget-id="0fyg">
</amp-addthis>
```

## Attributes

**data-pub-id**

The AddThis publisher ID found in the URL in the [AddThis dashboard](https://addthis.com/dashboard)
after logging in. For example, in the URL `https://www.addthis.com/dashboard#gallery/pub/ra-55e761259a1acdc2`,
`ra-55e761259a1acdc2` is the publisher ID.

**data-widget-id**

The AddThis widget ID for the tool to be displayed, also found on the [AddThis dashboard](https://addthis.com/dashboard).
The widget Id for a specific tool can be found by opening that tool in the AddThis dashboard and
copying the last part of the URL. For example, in the URL `https://www.addthis.com/dashboard#tool-config/pub/ra-55e761259a1acdc2/widgetId/xz1d`,
`xz1d` is the widget Id.

**data-share-title**

Optional. If set, this is the title that the AddThis tool will attempt to share when sharing occurs.
If not set, the title of the document containing the amp-addthis tag will be used.

**data-share-url**

Optional. If set, this is the URL that the AddThis tool will attempt to share when sharing occurs.
If not set, the `location.href` property of the document containing the amp-addthis tag will be
used.

**data-share-media**

Optional. If set, this is an URL for a piece of media (e.g., image or video) that the AddThis tool
will attempt to share when sharing occurs. If not set, this is left undefined.

**data-share-description**

Optional. If set, this is the description of the page that the AddThis tool will attempt to share
when sharing occurs. If not set, this is left undefined.

## Validation

See amp-addthis rules in the AMP validator specification.

## Privacy

http://www.addthis.com/privacy/privacy-policy/

The AddThis Tools and AddThis Toolbar collect information from the device used by the End User to
interact with Publisher Sites or by the Toolbar User to interact with the AddThis
Toolbar (“AddThis Data”).

AddThis Data may consist of the following:

- Internet Protocol (IP) address, Mobile Advertising ID (MAID) (which allows mobile app developers
  to identify who is using their mobile apps), mobile application ID, browser type, browser language,
  type of operating system, and the date and time the End User visited a Publisher Site or Toolbar
- User used the Toolbar;
- Behavior on a Publisher Site, such as how long the End User visited the Publisher Site, End User
  sharing behavior of content on a Publisher Site, and scrolling behavior of an End User on a
  Publisher Site;
- The referring URL and the web search the End User used to locate and navigate to a Publisher Site;
- Keywords entered into the AddThis Toolbar search functionality, and whether and when the Toolbar
  User downloads, installs, or uninstalls the AddThis Toolbar;
- Information regarding how often an End User uses the AddThis Tools and how often a Toolbar User
  uses the AddThis Toolbar; and
- Geo-location data derived from an End User’s and Toolbar User’s IP address.

AddThis Data will be treated as personal information to the extent required under applicable law.
Publishers are required per the AddThis Terms of Service to obtain all necessary End User consents
and authorizations, and provide any required notices for the provision of AddThis Data collected
from End Users to Oracle.

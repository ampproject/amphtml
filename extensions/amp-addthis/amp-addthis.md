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

[TOC]

## Why AddThis?

The `amp-addthis` component provides beautiful, simple share buttons. Make it easy for your website visitors share content to over 200 social channels including Messenger, WhatsApp, Facebook, Twitter, Pinterest and many more. 

AddThis is trusted by over 15,000,000 websites with over 2 billion unique users, sharing content all over the world, in more than sixty languages.

## Share Buttons

### Floating
Placed on the sides, top, or bottom of your page, following your reader as they scroll. A great way to promote sharing without getting too in-your-face.

Example:
```html
<!-- 
  This example uses a placeholder pubId.
  Please replace the pubId value with your own after
  creating an account on https://www.addthis.com/dashboard.
-->
<amp-addthis
  width="320"
  height="92"
  layout="responsive"
  data-pub-id="ra-5c191331410932ff"
  data-widget-id="957l"
  data-widget-type="floating">
</amp-addthis>
```

### Inline
Integrate share buttons into your content for a seamless sharing experience.

Example:
```html
<!-- 
  This example uses a placeholder pubId.
  Please replace the pubId value with your own after
  creating an account on https://www.addthis.com/dashboard.
-->
<amp-addthis
  width="320"
  height="92"
  data-pub-id="ra-5c191331410932ff"
  data-widget-id="mv93"
  data-widget-type="inline">
</amp-addthis>
```

## Attributes

#####data-pub-id

The AddThis publisher ID found in the URL in the [AddThis dashboard](https://addthis.com/dashboard) after logging in. For example, in the URL `https://www.addthis.com/dashboard#gallery/pub/ra-5c191331410932ff`, `ra-5c191331410932ff` is the publisher ID.

#####data-widget-id

The AddThis widget ID for the tool to be displayed, also found on the [AddThis dashboard](https://addthis.com/dashboard). The widget Id for a specific tool can be found by opening that tool in the AddThis dashboard and copying the last part of the URL. For example, in the URL `https://www.addthis.com/dashboard#tool-config/pub/ra-5c191331410932ff/widgetId/957l`, `957l` is the widget Id.

#####data-widget-type

Attribute that describes the type of widget.

- Floating: `data-widget-type="floating"`
- Inline: `data-widget-type="inline"` 

#####data-title

Optional. If set, this is the title that the AddThis tool will attempt to share when sharing occurs. If not set, the title of the document containing the amp-addthis tag will be used.

#####data-url

Optional. If set, this is the URL that the AddThis tool will attempt to share when sharing occurs. If not set, the `location.href` property of the document containing the amp-addthis tag will be used.

#####data-media

Optional. If set, this is an URL for a piece of media (e.g., image or video) that the AddThis tool will attempt to share when sharing occurs. If not set, this is left undefined.

#####data-description

Optional. If set, this is the description of the page that the AddThis tool will attempt to share when sharing occurs. If not set, this is left undefined. 

## Implementation Documentation

1. If you haven’t already, you will need to create an AddThis account at <https://www.addthis.com/register>. Creating an AddThis account is entirely free and allows you to access our entire suite of website tools as well as our in-depth analytics reports to better understand your site’s social traffic.
2. Go to your [dashboard](https://addthis.com/dashboard) and customize your Share Buttons (AMP currently only supports Floating & Inline Share Buttons).
3. Customize your sharing buttons to your liking, then hit “activate tool”. This will redirect you to our Get The Code page.
4. Last but not least, copy and paste the inline code into the body section of your page where you want the share buttons to appear. For the Floating Share Buttons, you can place this code anywhere in the body as it will automatically appear on either the left or right side of your screen, depending on where you’ve set it in the tool’s settings.

And that’s it! You should see the share buttons appearing on your page! 

Check out our YouTube video for step-by-step instructions:
<iframe width="560" height="315" src="https://www.youtube.com/embed/BSkuAB4er2o" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> 

## Validation

See [amp-addthis rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-addthis/validator-amp-addthis.protoascii) in the AMP validator specification.

## Privacy

<http://www.addthis.com/privacy/privacy-policy/>

The AddThis Tools and AddThis Toolbar collect information from the device used by the End User to interact with Publisher Sites or by the Toolbar User to interact with the AddThis Toolbar (“AddThis Data”).

AddThis Data may consist of the following:

- Internet Protocol (IP) address, Mobile Advertising ID (MAID) (which allows mobile app developers to identify who is using their mobile apps), mobile application ID, browser type, browser language, type of operating system, and the date and time the End User visited a Publisher Site or Toolbar
- User used the Toolbar;
- Behavior on a Publisher Site, such as how long the End User visited the Publisher Site, End User sharing behavior of content on a Publisher Site, and scrolling behavior of an End User on a Publisher Site;
- The referring URL and the web search the End User used to locate and navigate to a Publisher Site;
- Keywords entered into the AddThis Toolbar search functionality, and whether and when the Toolbar User downloads, installs, or uninstalls the AddThis Toolbar;
- Information regarding how often an End User uses the AddThis Tools and how often a Toolbar User uses the AddThis Toolbar; and
- Geo-location data derived from an End User’s and Toolbar User’s IP address.

AddThis Data will be treated as personal information to the extent required under applicable law. Publishers are required per the AddThis Terms of Service to obtain all necessary End User consents and authorizations, and provide any required notices for the provision of AddThis Data collected from End Users to Oracle.

## Support
If you have any questions or need any help in implementing AddThis on AMP, please contact our fabulous support team by submitting a ticket [here](https://www.addthis.com/support/) or by emailing [help@addthis.com](mailto:help@addthis.com).

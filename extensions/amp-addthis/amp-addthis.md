---
$category@: social
formats:
  - websites
teaser:
  text: Displays AddThis customizable social share buttons.
---

# amp-addthis

## Usage

The `amp-addthis` component provides integration of
[AddThis share buttons](https://www.addthis.com/get/share/) in AMP pages. Website visitors use AddThis share buttons to share content to over 200 social channels including Messenger, WhatsApp, Facebook, Twitter, Pinterest and more.

### Share Buttons

#### Floating

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
  data-widget-type="floating"
>
</amp-addthis>
```

#### Inline

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
  data-widget-type="inline"
>
</amp-addthis>
```

### Implementation Documentation

1. If you haven’t already, you will need to [create an AddThis account](https://www.addthis.com/register). Creating an AddThis account is entirely free and allows you to access AddThis' entire suite of website tools as well as our in-depth analytics reports to better understand your site’s social traffic.
2. Go to your [dashboard](https://addthis.com/dashboard) and customize your Share Buttons (AMP currently only supports Floating & Inline Share Buttons).
3. Customize your sharing buttons to your liking, then hit “activate tool”. This will redirect you to our Get The Code page.
4. Last but not least, copy and paste the inline code into the body section of your page where you want the share buttons to appear. For the Floating Share Buttons, you can place this code anywhere in the body as it will automatically appear on either the left or right side of your screen, depending on where you’ve set it in the tool’s settings.

And that’s it! You should see the share buttons appearing on your page!

Check out our [YouTube video](https://www.youtube.com/watch?v=BSkuAB4er2o) for step-by-step instructions:
<amp-youtube data-videoid="BSkuAB4er2o" layout="responsive" width="480" height="270"></amp-youtube>

## Privacy

The AddThis Tools and AddThis Toolbar collect information from the device used by the End User to interact with Publisher Sites or by the Toolbar User to interact with the AddThis Toolbar (“AddThis Data”). Read the full [AddThis Privacy Policy](http://www.addthis.com/privacy/privacy-policy/).

AddThis Data may consist of the following:

-   Internet Protocol (IP) address, Mobile Advertising ID (MAID) (which allows mobile app developers to identify who is using their mobile apps), mobile application ID, browser type, browser language, type of operating system, and the date and time the End User visited a Publisher Site or Toolbar
-   User used the Toolbar;
-   Behavior on a Publisher Site, such as how long the End User visited the Publisher Site, End User sharing behavior of content on a Publisher Site, and scrolling behavior of an End User on a Publisher Site;
-   The referring URL and the web search the End User used to locate and navigate to a Publisher Site;
-   Keywords entered into the AddThis Toolbar search functionality, and whether and when the Toolbar User downloads, installs, or uninstalls the AddThis Toolbar;
-   Information regarding how often an End User uses the AddThis Tools and how often a Toolbar User uses the AddThis Toolbar; and
-   Geo-location data derived from an End User’s and Toolbar User’s IP address.

AddThis Data will be treated as personal information to the extent required under applicable law. Publishers are required per the AddThis Terms of Service to obtain all necessary End User consents and authorizations, and provide any required notices for the provision of AddThis Data collected from End Users to Oracle.

## Support

If you have any questions or need any help in implementing AddThis on AMP, please contact our fabulous support team by submitting a ticket [here](https://www.addthis.com/support/) or by emailing [help@addthis.com](mailto:help@addthis.com).

## Attributes

### data-pub-id

The AddThis publisher ID found in the URL in the [AddThis dashboard](https://addthis.com/dashboard) after logging in. For example, in the URL `https://www.addthis.com/dashboard#gallery/pub/ra-5c191331410932ff`, `ra-5c191331410932ff` is the publisher ID.

### data-widget-id

The AddThis widget ID for the tool to be displayed, also found on the [AddThis dashboard](https://addthis.com/dashboard). The widget Id for a specific tool can be found by opening that tool in the AddThis dashboard and copying the last part of the URL. For example, in the URL `https://www.addthis.com/dashboard#tool-config/pub/ra-5c191331410932ff/widgetId/957l`, `957l` is the widget Id.

### data-widget-type

Attribute that describes the type of widget.

-   Floating: `data-widget-type="floating"`
-   Inline: `data-widget-type="inline"`

### data-title

Optional. If set, this is the title that the AddThis tool will attempt to share when sharing occurs. If not set, the title of the document containing the `amp-addthis` tag will be used.

### data-url

Optional. If set, this is the URL that the AddThis tool will attempt to share when sharing occurs. If not set, the `location.href` property of the document containing the `amp-addthis` tag will be used.

### data-media

Optional. If set, this is an URL for a piece of media (e.g., image or video) that the AddThis tool will attempt to share when sharing occurs. If not set, this is left undefined.

### data-description

Optional. If set, this is the description of the page that the AddThis tool will attempt to share when sharing occurs. If not set, this is left undefined.

## Validation

See [`amp-addthis` rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-addthis/validator-amp-addthis.protoascii) in the AMP validator specification.

---
$category@: layout
formats:
  - websites
teaser:
  text: A wrapper and minimal UI for a cross-platform, fixed-position banner showing a call-to-action to install an app.
---

# amp-app-banner

## Usage

A wrapper and minimal UI for a cross-platform, fixed-position banner that shows
a call-to-action to install an app.

The `amp-app-banner` component includes conditional logic to direct users to the
right app on the right platform. If the user dismisses the banner, the banner is
hidden permanently.

```html
<head>
  <meta
    name="apple-itunes-app"
    content="app-id=123456789, app-argument=app-name://link/to/app-content"
  />
  <link rel="manifest" href="https://link/to/manifest.json" />
</head>

. . .

<body>
  <amp-app-banner layout="nodisplay" id="demo-app-banner-2134">
    <amp-img src="https://example.com/icon.png" width="60" height="51">
    </amp-img>
    <h3>App Name</h3>
    <p>Experience a richer experience on our mobile app!</p>
    <div class="actions">
      <button open-button>Get the app</button>
    </div>
  </amp-app-banner>
</body>
```

For a full-page example, see
[article.amp.html](../../examples/article.amp.html).

Use of `amp-app-banner` must meet the following requirements:

-   Don't include [`amp-ad/amp-embed`](../amp-ad/amp-ad.md),
    [`amp-sticky-ad`](../amp-sticky-ad/amp-sticky-ad.md), or
    [`amp-iframe`](../amp-iframe/amp-iframe.md) as
    descendants.

-   [`height`](https://www.w3schools.com/tags/att_height.asp) can't exceed
    `100px`.

-   Must be a direct child of the
    [`<body>`](https://www.w3schools.com/tags/tag_body.asp) tag.

-   The Android manifest
    [`href`](https://www.w3schools.com/tags/att_link_href.asp) attribute must be
    served over `https`.

-   Don't include more than one `amp-app-banner` on a single page.

### Specify data sources

To extend and promote the usage of the natively supported app banners on
[iOS](https://developer.apple.com/library/content/documentation/AppleApplications/Reference/SafariWebContent/PromotingAppswithAppBanners/PromotingAppswithAppBanners.html)
and [Android](https://web.dev/customize-install/), `amp-app-banner` uses the
exact data sources that the native app banners use on their respective
platforms. iOS uses a
[`<meta name="apple-itunes-app">`](https://www.w3schools.com/tags/tag_meta.asp)
tag in the head of the document, while Android uses a
[`<link rel="manifest">`](https://www.w3schools.com/tags/tag_link.asp) tag.

-   On iOS, the AMP runtime parses the `<meta>` tag content attribute to extract
    the App ID and `app-argument`. These are usually used for deep link URIs,
    such as app-protocols like `whatsapp://` or `medium://`.

    -   The `<meta>` tag must have the
        [`name`](https://www.w3schools.com/tags/att_meta_name.asp) and
        [`content`](https://www.w3schools.com/tags/att_meta_content.asp)
        attributes.

    -   The value of the `content` attribute must contain `app-id=`.

-   On Android, the AMP runtime makes an XHR request to fetch the
    `manifest.json` file. The runtime parses the
    content to extract `app_id` from `related_applications` and calculates the
    app store URL as well as open-in-app URL, which has the following form:
    `android-app://${appId}/${protocol}/${host}${pathname}`

    -   The `<link>` tag must have the
        [`"rel='manifest'"`](https://www.w3schools.com/tags/tag_link.asp)
        attribute and value, as well as the
        [`href`](https://www.w3schools.com/tags/att_link_href.asp) attribute.

[tip type="note"]
The protocol, host, and pathname are calculated from the canonical URL of the
AMP document. Your native app needs to register the links in their manifest. For
more information, read up on
[mobile deep linking](https://en.wikipedia.org/wiki/Mobile_deep_linking).
[/tip]

#### Example app manifest <a name="example-for-manifest-json"></a>

```xml
<activity
    android:name="com.example.android.GizmosActivity"
    android:label="@string/title_gizmos" >
    <intent-filter android:label="@string/view_article">
        <!-- This is important in order to allow browsers to launch your app. -->
        <category android:name="android.intent.category.BROWSABLE" />
        <!-- Accepts URIs that begin with "https://CANONICAL_HOST/gizmos” -->
        <data android:scheme="https"
              android:host="CANONICAL_HOST"
              android:pathPrefix="/" />
    </intent-filter>
</activity>
```

#### Example manifest.json

```javascript
{
  "prefer_related_applications": true, // This is not necessary for <amp-app-banner>, but signals a preference on non-AMP pages using the same manifest.json file for the native app over a web app if available
  "related_applications": [
    {
      "platform": "play",
      "id": "com.app.path",
      "url": "android-app://com.app.path/https/host.com/path/to/app-content"
    }
  ]
}
```

### UI behavior

`amp-app-banner` provides no default UI. Instead, the developer can build any
kind of UI inside the banner and style it accordingly.

Currently, the banner is always displayed until it's dismissed. After it's
dismissed, the banner never displays on that domain unless the user visits on a
different browser or clears their local storage.

#### Required attribute in the UI

The `button[open-button]` button is required in the banner. This is the click
target that either installs the app or, if it's already installed, opens the
deep link.

[tip type="note"]
The `button[open-button]` element can't have the value `disabled`.
[/tip]

#### Dismissal button restrictions

The "X" button used to dismiss the banner has limits on how you can customize
it. You can style this button with the `.amp-app-banner-dismiss-button` class.
Keep the dismissal button visible and easily accessible on mobile devices so
that the banner doesn't block content.

#### OS, browser, and viewer dependencies

The native app banners aren't shown in the viewer context. As such,
`amp-app-banner` is shown inside of the viewer when the appropriate markup is
present.

However, system-level app banners are shown when viewed with a browser on a
compatible OS, such as Android and Chrome, or iOS and Safari. In those cases,
the `amp-app-banner` is hidden to avoid redundancy. The following table shows
these dependencies:

<table>
  <thead>
    <tr>
      <th>Context</th>
      <th>Android + Chrome</th>
      <th>iOS + Safari</th>
      <th>Other OS + browser</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>In AMP viewer</td>
      <td>Show amp-app-banner</td>
      <td>Show amp-app-banner</td>
      <td>Show amp-app-banner</td>
    </tr>
    <tr>
      <td>Outside of AMP viewer</td>
      <td>Show system banner</td>
      <td>Show system banner</td>
      <td>Show amp-app-banner</td>
    </tr>
  </tbody>
</table>

## Attributes

### `id`

Defines a unique identifier for an `amp-app-banner` component. The `id` value is
used for persistence logic.

### `layout`

Specifies the layout of the banner. The value must be `nodisplay`.

## Validation

See [`amp-app-banner` rules](validator-amp-app-banner.protoascii)
in the AMP validator specification.

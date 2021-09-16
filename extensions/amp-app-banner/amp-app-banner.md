<!--
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

# <a name="amp-app-banner"></a> `amp-app-banner`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>A wrapper and minimal UI for a cross-platform, fixed-position banner showing a call-to-action to install an app. Includes conditional logic to direct to the right app on the right platform, and to hide permenantly if the user dismisses the banner.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td>
      <div>
        <code>&lt;script async custom-element="amp-app-banner" src="https://cdn.ampproject.org/v0/amp-app-banner-0.1.js">&lt;/script></code>
      </div>
    </td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>
      <ul>
        <li>
          TBD
        </li>
      </ul>
    </td>
  </tr>
</table>

## Behavior
`amp-app-banner` is a wrapper and minimal UI for a cross-platform, fixed-position banner showing a call-to-action to install an app. Includes conditional logic to direct to the right app on the right platform, and to hide permenantly if the user dismisses the banner.


##Data Sources
To extend and promote the usage of the natively supported app banners on <a href="https://developer.apple.com/library/content/documentation/AppleApplications/Reference/SafariWebContent/PromotingAppswithAppBanners/PromotingAppswithAppBanners.html">iOS</a> and <a href="https://developers.google.com/web/updates/2015/03/increasing-engagement-with-app-install-banners-in-chrome-for-android?hl=en#span-idnativenative-app-install-bannerspan">Android</a>, we are using the exact data-sources the native app banners use on the respective platforms. iOS uses a `<meta name="apple-itunes-app">` tag in the head of the document and Android uses a `<link rel="manifest">`. 

The AMP runtime parses the meta tag content attribute on iOS extracting the App ID and `app-argument` (usually used for deep-linking URIs - app-protocols like `whatsapp://` or `medium://`). On Android, the AMP runtimes makes an XHR request to fetch the `manifest.json` file, and parses its content to extract `app_id` from `related_applications` and it calculates the app store URL as well as open-in-app URL:

```
android-app://${appId}/${protocol}/${host}${pathname}
```
Note that the protocol/host/pathname are calculated from the canonical URL of the AMP document, and that your native app needs to register the links in their manifest as <a href="https://developer.android.com/training/app-indexing/deep-linking.html">documented here</a>.

### App manifest example
```java
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

### manifest.json example
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




##Appearance Behavior
amp-app-banner provides no default UI and leave the UI to the developer. The developer can build any kind of UI inside the banner and style it accordingly. There is one UI element that has limits to the amount of customization—the "X" button that dismisses the banner. This button can be styled with the `.amp-app-banner-dismiss-button` class. It should be kept visible and easily accessible on mobile devices, to avoid blocking content.

One required UI element is the `button[open-button]` button, which is the click target for the banner to install the app, or open the deep-link if the app is already installed.

###OS/Browser/Viewer Dependencies

Because native app banners currently are not shown in the viewer context, `<amp-app-banner>` is shown inside of the viewer when the appropriate markup is present. Because system-level app banners are already shown in Android/Chrome and iOS/Safari OS/Browser combinations, `<amp-app-banner>` is hidden in those contexts to avoid redundancy.

<table>
  <tr>
    <td></td>
    <td>Android + Chrome</td>
    <td>iOS + Safari</td>
    <td>Other OS + browser</td>
  </tr>
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
</table>


##Dismissal Persistence
The banner currently will be displayed always unless it was dismissed. Once dismissed the banner will never be displayed on that domain unless user visits on a different browser or clears their local storage.


## Tags

**At least one of `meta[name="apple-itunes-app"]` or `link[rel=manifest]`**
* `<meta>` tag must have "name" attribute and "content" attribute
* The value of the "content" attribute must contain "app-id=" 
* `<link>` tag must have "rel='manifest'" attribute and value, as well as "href" attribute


## Attributes


### Attributes on `amp-app-banner`

**id** (Required)

To uniquely identify an amp-app-banner - for persistence logic

**layout="nodisplay"** (Required)

### Attributes on 'button' descendent element

**open-button** (Required)

Not permitted: **disabled**


## Additional Validations

* Cannot have `<amp-ad>`, `<amp-sticky-ad>`, `<amp-embed>`, or `<amp-iframe>` as descendents
* Height cannot exceed 100px
* Must be a direct child of `<body>`
* Android manifest `href` must be served over `https`
* Cannot have more than one `<amp-app-banner>` on a single page


## Example ([link to full page example](https://github.com/ampproject/amphtml/blob/master/examples/article.amp.html))
```html
<head>
  <meta name="apple-itunes-app"
             content="app-id=123456789, app-argument=app-name://link/to/app-content">
  <link rel="amp-manifest" href="https://link/to/manifest.json">
</head>

. . . 

<body>
  <amp-app-banner layout="nodisplay" id="demo-app-banner-2134">
    <amp-img src="https://example.com/icon.png"
                     width="60" height="51">
    </amp-img>
    <h3>App Name</h3>
    <p>Experience a richer experience on our mobile app!</p>
    <div class="actions">
      <button open-button>Get the app</button>
    </div>
  </amp-app-banner>
</body>
```

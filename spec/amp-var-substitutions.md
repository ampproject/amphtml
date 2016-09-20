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

# AMP HTML URL Variable Substitutions

## Overview

Some components such as [`amp-pixel`](../builtins/amp-pixel.md) and
[`amp-list`](../extensions/amp-list/amp-list.md) allow variables to be substituted
in the relevant URLs. AMP provides a number of standard variable substitutions and
allows each component to add their own. The rest of this document talks about
the variables supported by the platform.

## Page and Content

### AMPDOC_HOST

Use the special string `AMPDOC_HOST` to add the AMP document's URL host.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?host=AMPDOC_HOST"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?host=example.com:8080`.

### AMPDOC_HOSTNAME

Use the special string `AMPDOC_HOSTNAME` to add the AMP document's URL hostname.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?hostname=AMPDOC_HOSTNAME"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?hostname=example.com`.

### AMPDOC_URL

Use the special string `AMPDOC_URL` to add the AMP document's URL.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?ref=AMPDOC_URL"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?ref=https%3A%2F%2Fexample.com%2F`.

### CANONICAL_HOST

Use the special string `CANONICAL_HOST` to add the canonical URL's host of the current document to the URL

For instance:
```html
<amp-pixel src="https://foo.com/pixel?host=CANONICAL_HOST"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?host=pinterest.com:9000`.

### CANONICAL_HOSTNAME

Use the special string `CANONICAL_HOSTNAME` to add the canonical URL's hostname of the current document to the URL

For instance:
```html
<amp-pixel src="https://foo.com/pixel?hostname=CANONICAL_HOSTNAME"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?host=pinterest.com`.

### CANONICAL_PATH

Use the special string `CANONICAL_PATH` to add the canonical URL's path of the current document to the URL

For instance:
```html
<amp-pixel src="https://foo.com/pixel?path=CANONICAL_PATH"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?path=%2Fpage1.html`.

### CANONICAL_URL

Use the special string `CANONICAL_URL` to add the canonical URL of the current document to the URL

For instance:
```html
<amp-pixel src="https://foo.com/pixel?href=CANONICAL_URL"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?href=https%3A%2F%2Fpinterest.com%2F`.

### SOURCE_URL

Use the special string `SOURCE_URL` to add the source URL of the current document to the URL.

The source URL is extracted from the proxy URL if the document is being served from a proxy. Otherwise the original document URL is returned. For instance, if the URL is served via the proxy `https://cdn.ampproject.org` from the URL `https://cdn.ampproject.org/c/s/example.com/page.html`, then `SOURCE_URL` would return `https://example.com/page.html`.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?href=SOURCE_URL"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?href=https%3A%2F%2Fpinterest.com%2F`.

### SOURCE_HOST

Use the special string `SOURCE_HOST` to add the source URL's host of the current document to the URL. See the description of `SOURCE_URL` for more details.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?host=SOURCE_HOST"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?host=pinterest.com:9000`.

### SOURCE_HOSTNAME

Use the special string `SOURCE_HOSTNAME` to add the source URL's hostname of the current document to the URL. See the description of `SOURCE_URL` for more details.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?host=SOURCE_HOSTNAME"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?host=pinterest.com`.

### SOURCE_PATH

Use the special string `SOURCE_PATH` to add the source URL's path of the current document to the URL. See the description of `SOURCE_URL` for more details.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?path=SOURCE_PATH"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?path=%2Fpage2.html`.

### DOCUMENT_CHARSET

Provides the character encoding of the current document.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?charSet=DOCUMENT_CHARSET"></amp-pixel>
```

### DOCUMENT_REFERRER

Use the special string `DOCUMENT_REFERRER` to add the current document's referrer to the URL.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?referrer=DOCUMENT_REFERRER"></amp-pixel>
```

### TITLE

Use the special string `TITLE` to add the title of the current document to the URL

For instance:
```html
<amp-pixel src="https://foo.com/pixel?title=TITLE"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?title=Breaking%20News`.

### VIEWER

Provides an identifier for the viewer that contains the AMP document. Empty string is provided when the document is loaded directly in the browser or if the id is not found.
For instance:
```html
<amp-pixel src="https://foo.com/pixel?viewer=VIEWER"></amp-pixel>
```

## Performance

### CONTENT_LOAD_TIME

Provides the time the page takes to fire the `DOMContentLoaded` event from the time the previous page is unloaded. The value is in milliseconds.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?contentLoadTime=CONTENT_LOAD_TIME"></amp-pixel>
```

### DOMAIN_LOOKUP_TIME

Provides the time it took to perform the DNS lookup for the current page. The value is in milliseconds.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?domainLookupTime=DOMAIN_LOOKUP_TIME"></amp-pixel>
```

### DOM_INTERACTIVE_TIME

Provides the time the page to become interactive from the time the previous page
is unloaded. The value is in milliseconds.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?domInteractiveTime=DOM_INTERACTIVE_TIME"></amp-pixel>
```

### NAV_REDIRECT_COUNT

Provides the number of redirects since the last non-redirect navigation.
See W3C Navigation Timing API [PerformanceNavigation interface](https://www.w3.org/TR/navigation-timing/#performancenavigation) for more information.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?nrc=NAV_REDIRECT_COUNT"></amp-pixel>
```

### NAV_TIMING

Provides access to metrics from the browser's PerformanceTiming interface.
If both `startEvent` and `endEvent` arguments are passed, the value will be the time elapsed between the two events.
Otherwise, if only `startEvent` argument is passed, the value will be the timestamp of the given event.
The value is in milliseconds.

See the W3C Navigation Timing API [PerformanceTiming interface](https://www.w3.org/TR/navigation-timing/#sec-navigation-timing-interface) documentation for attribute names and definitions.

Please see below for the required and optional arguments you may pass into `NAV_TIMING` like a function. Spaces between arguments and values are not allowed.

**arguments**:

  - `startEvent` (Required) - Name of the PerformanceTiming interface attribute corresponding to the start event.

  - `endEvent` (Optional) - Optional name of the PerformanceTiming interface attribute corresponding to the end event. If `endEvent` is passed, the value will be the time difference between the start and end events.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?navStart=NAV_TIMING(navigationStart)&amp;pageLoadTime=NAV_TIMING(navigationStart,loadEventStart)"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?navStart=1451606400000&pageLoadTime=100`.

### NAV_TYPE

Provides the type of the last non-redirect navigation in the current browsing context.
See W3C Navigation Timing API [PerformanceNavigation interface](https://www.w3.org/TR/navigation-timing/#performancenavigation) for more information.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?nt=NAV_TYPE"></amp-pixel>
```

### PAGE_DOWNLOAD_TIME

Provides the time between receiving the first and the last byte of response. The value is in milliseconds.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?pageDownloadTime=PAGE_DOWNLOAD_TIME"></amp-pixel>
```

### PAGE_LOAD_TIME

Provides the time taken to load the whole page. The value is calculated from the time `unload` event handler on previous page ends to the time `load` event for the current page is fired. If there is no previous page, the duration starts from the time the user agent is ready to fetch the document using an HTTP requesti. The value is in milliseconds.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?pageLoadTime=PAGE_LOAD_TIME"></amp-pixel>
```

### REDIRECT_TIME

Provides the time taken to complete all the redirects before the request for the current page is made. The value is in milliseconds.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?redirectTime=REDIRECT_TIME"></amp-pixel>
```

### SERVER_RESPONSE_TIME

Provides the time taken by the server to start sending the response after it starts receiving the request. The value is in milliseconds.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?serverResponseTime=SERVER_RESPONSE_TIME"></amp-pixel>
```

### TCP_CONNECT_TIME

Provides the time it took for HTTP connection to be setup. The duration includes connection handshake time and SOCKS authentication. The value is in milliseconds.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?tcpConnectTime=TCP_CONNECT_TIME"></amp-pixel>
```

## Device and Browser

### AVAILABLE_SCREEN_HEIGHT

Provides the screen height in pixels available for the page rendering. Note that this value can be slightly more or less than the actual viewport size because of various browser quirks.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?availScreenHeight=AVAILABLE_SCREEN_HEIGHT"></amp-pixel>
```

### AVAILABLE_SCREEN_WIDTH

Provides the screen width in pixels available for the page rendering. Note that this can be slightly more or less than the actual viewport height due to various browser quirks.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?availScreenWidth=AVAILABLE_SCREEN_WIDTH"></amp-pixel>
```

### BROWSER_LANGUAGE

Provides a string representing the preferred language of the user, usually the language of the browser UI.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?lang=BROWSER_LANGUAGE"></amp-pixel>
```

### SCREEN_COLOR_DEPTH

Provides the screen color depth provided by the browser.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?colorDepth=SCREEN_COLOR_DEPTH"></amp-pixel>
```

### VIEWPORT_HEIGHT

Provides the viewport height in pixels available for the page rendering. In contrast to `AVAILABLE_SCREEN_HEIGHT`, this value takes window size and zooming into account.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?viewportHeight=VIEWPORT_HEIGHT"></amp-pixel>
```

### VIEWPORT_WIDTH

Provides the viewport width in pixels available for the page rendering. In contrast to `AVAILABLE_SCREEN_WIDTH`, this value takes window size and zooming into account.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?viewportWidth=VIEWPORT_WIDTH"></amp-pixel>
```

## Miscellaneous

### AMP_VERSION

Provides a string with the AMP release version.

Example value: `1460655576651`

### CLIENT_ID

Use the special string `CLIENT_ID` to add a per document-source-origin (The origin of the website where you publish your AMP doc) and user identifier. The `CLIENT_ID` will be the same for the same user if they visit again within one year. It should behave roughly similar to a cookie storing a session id for one year. If the AMP document is not served through the Google AMP Cache, the `CLIENT_ID` will be replaced with a cookie of the name of the cid scope below. If it is not present a cookie will be set with the same name. These cookies will always have the prefix "amp-" followed by a random base64 encoded string.

Please see below the required and optional arguments you may
pass into `CLIENT_ID` like a function. (spaces between arguments and values are not allowed)

arguments:
  - `cid scope` (Required) - Name of the fallback cookie when the document
    is not served by an AMP proxy.
  - `amp-user-notification id` (Optional) - Optionally make the `CLIENT_ID`
    substitution be dependent on the dismissal of a user notification shown to the visitor
    of the page.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?cid=CLIENT_ID(cid-scope-cookie-fallback-name)"></amp-pixel>


<amp-user-notification
    layout=nodisplay
    id="user-consent"
    data-show-if-href="https://foo.com/api/show"
    data-dismiss-href="https://foo.com/api/dismissed">
    This site uses cookies to personalize content.
    <a href="">Learn more.</a>
   <button on="tap:user-consent.dismiss">I accept</button>
</amp-user-notification>

<!-- cid is not provided until `user-consent` is dismissed -->
<amp-pixel src="https://foo.com/pixel?cid=CLIENT_ID(cid-scope-cookie-fallback-name,user-consent-id)"></amp-pixel>
```

### QUERY_PARAM

Provides access to query string params.

arguments:
  - `param` (Required) - The key for the query string parameter to be inserted
  - `defaultValue` - The value to use if the provide key is not present on the query string. Defaults to ""

For instance:
```html
<amp-pixel src="https://foo.com/pixel?bar=QUERY_PARAM(baz,biz)"</amp-pixel>
```

If a query string parameter baz is provided then the corresponding value will be insterted into the pixel src, if no, the default "biz" will be used.

### PAGE_VIEW_ID

Contains a string that is intended to be random and likely to be unique per URL, user and day.

### RANDOM

Use the special string `RANDOM` to add a random number to the URL if required.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?RANDOM"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?0.8390278471201` where the $RANDOM value is randomly generated upon each impression.

### TIMESTAMP

Use the special string `TIMESTAMP` to add the current number of seconds that
have elapsed since 1970. (Epoch time)

For instance:
```html
<amp-pixel src="https://foo.com/pixel?timestamp=TIMESTAMP"></amp-pixel>
```

### TOTAL_ENGAGED_TIME

Provides the total time the user has been enagaged with the page since the page
first became visible in the viewport. Total engaged time will be 0 until the
page first becomes visible. This variable requires the [amp-analytics](../extensions/amp-analytics/amp-analytics.md) extension to be present on the page.

## Access

Access variables are described in [amp-access-analytics.md](../extensions/amp-access/amp-access-analytics.md).

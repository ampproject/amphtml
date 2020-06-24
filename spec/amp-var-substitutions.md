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

Various AMP features allow variables to be used inside of strings and substituted with the corresponding actual values. For example, `amp-pixel` allows expressions like this:

```html
<amp-pixel src="https://foo.com/pixel?RANDOM"></amp-pixel>
```

`RANDOM` gets resolved to a randomly generated value and AMP replaces it in the request string:

```http
https://foo.com/pixel?0.8390278471201
```

The following table lists the features that enable variable substitutions, as well as several properties that govern usage:

<table>
  <tr>
    <th width="25%"><strong>AMP Feature</strong></th>
    <th width="25%"><strong>URL limitations</strong></th>
    <th width="25%"><strong>Requires <a href="#per-use-opt-in">per-use opt-in</a>?</strong></th>
    <th width="25%"><strong>Restrictions</strong></th>
  </tr>
  <tr>
    <td width="25%"><code>amp-analytics</code><br><a href="https://github.com/ampproject/amphtml/blob/master/extensions/amp-analytics/amp-analytics.md#vars">Detailed documentation</a></td>
    <td width="25%">Requests must be HTTPS URLs (not a requirement specific to variable substitutions)</td>
    <td width="25%">No</td>
    <td width="25%">None</td>
  </tr>
  <tr>
    <td width="25%"><code>amp-list</code><br><a href="https://github.com/ampproject/amphtml/blob/master/extensions/amp-list/amp-list.md#substitutions">Detailed documentation</a></td>
    <td width="25%">Requests must be HTTPS URLs (not a requirement specific to variable substitutions)</td>
    <td width="25%">Yes, if fetching cross-origin resources via <code>[src]</code> <a href="https://amp.dev/documentation/components/amp-bind#element-specific-attributes">attribute binding</a>. Otherwise, no. Read more about <a href="#per-use-opt-in">per-use opt-in</a></td>
    <td width="25%">None</td>
  </tr>
  <tr>
    <td width="25%"><code>amp-pixel</code><br><a href="https://github.com/ampproject/amphtml/blob/master/builtins/amp-pixel.md#substitutions">Detailed documentation</a></td>
    <td width="25%">Requests must be HTTPS URLs (not a requirement specific to variable substitutions)</td>
    <td width="25%">No</td>
    <td width="25%">None</td>
  </tr>
  <tr>
    <td width="25%"><code>amp-state</code><br><a href="https://github.com/ampproject/amphtml/blob/master/extensions/amp-bind/amp-bind.md#attributes">Detailed documentation</a></td>
    <td width="25%">Requests must be HTTPS URLs (not a requirement specific to variable substitutions)</td>
    <td width="25%">Yes, if fetching cross-origin resources via <code>[src]</code> <a href="https://amp.dev/documentation/components/amp-bind#element-specific-attributes">attribute binding</a>. Otherwise, no. Read more about <a href="#per-use-opt-in">per-use opt-in</a></td>
    <td width="25%">None</td>
  </tr>
  <tr>
    <td width="25%">Links (<code>&lt;a&gt;</code>)</td>
    <td width="25%">
      HTTPS URL and URL matching either:
      <ul>
        <li>Page’s source origin</li>
        <li>Page’s canonical origin</li>
        <li>An origin white listed via the <code>amp-link-variable-allowed-origin</code> <code>meta</code> tag</li>
      </ul>
    </td>
    <td width="25%">Yes, via space-delimited attribute <code>data-amp-replace</code>. Read more about <a href="#per-use-opt-in">per-use opt-in</a></td>
    <td width="25%">Only these variables are supported: <code>CLIENT_ID</code> and <code>QUERY_PARAM</code>.<br>See the section on <a href="#substitution-timing">"substitution timing"</a> for further notes</td>
  </tr>
  <tr>
    <td width="25%">Form inputs<br><a href="https://github.com/ampproject/amphtml/blob/master/extensions/amp-form/amp-form.md#variable-substitutions">Detailed documentation</a></td>
    <td width="25%">Requests must be HTTPS URLs (not a requirement specific to variable substitutions)</td>
    <td width="25%">Yes, via space-delimited attribute <code>data-amp-replace</code>. Read more about <a href="#per-use-opt-in">per-use opt-in</a></td>
    <td width="25%">See the section on <a href="#substitution-timing">"substitution timing"</a> for further notes</td>
  </tr>
</table>

### Substitution timing

Variable substitutions that are dependent on a user action like links and form inputs may not occur if the value has not yet been computed.

Please take note of the following scenarios:

- `CLIENT_ID` is available once it has been computed. This can be accomplished through use by another feature such as `amp-analytics` or `amp-pixel`. Note that `CLIENT_ID` may also be blocked on an `amp-user-notification` that is pending acceptance.
- Asynchronously resolved variables are not available

### Restrictions

The `host` string of an URL does not accept variables. It fails on AMP cache.

## Variable substitution in links

Variable substitution is available in links, i.e. `<a href="..."></a>`.

Only these variables are supported:

- `CLIENT_ID`
- `QUERY_PARAM(argument)`

### Per-use opt-in

Link substitution requires per-use opt-in as an added security measure and to affirm the intention to use variable substitution. This is done by specifying an additional attribute called `data-amp-replace` with a string value containing a space-delimited listing of the desired variables to substitute. An example is below.

```html
<a
  href="https://example.com?client_id=CLIENT_ID(bar)&abc=QUERY_PARAM(abc)"
  data-amp-replace="CLIENT_ID QUERY_PARAM"
  >Go to my site</a
>
```

#### Appending parameters to the href

If you need to append dynamic parameters to the href, specify the parameters by using the `data-amp-addparams` attribute. Any substitution parameters that you specify in `data-amp-addparams` must also be specified in `data-amp-replace`, as in the following example

```html
<a
  href="https://example.com?abc=QUERY_PARAM(abc)"
  data-amp-replace="CLIENT_ID QUERY_PARAM"
  data-amp-addparams="client_id=CLIENT_ID(bar)&linkid=l123"
  >Go to my site</a
>
```

### White listed domains for link substitution

Link substitutions are restricted and will only be fulfilled for URLs matching:

- The page’s source origin
- The page’s canonical origin
- A white listed origin

To allowlist an origin, include a `amp-link-variable-allowed-origin` `meta` tag in the `head` of your document. To specify multiple domains, separate each domain with a space.

```html
<meta
  name="amp-link-variable-allowed-origin"
  content="https://example.com https://example.org"
/>
```

## Variables

The tables below list the available URL variables grouped by type of usage. Further down in this document, are [descriptions](#variable-descriptions) of each of the variables, along with example usages.

- [Page and Content](#page-and-content)
- [Performance](#performance)
- [Device and Browser](#device-and-browser)
- [Interaction](#interaction)
- [Visibility](#visibility)
- [AMP Components](#amp-components)
- [Miscellaneous](#miscellaneous)

### Page and Content

| Variable Name                                   | Platform Variable    | amp-analytics Variable |
| ----------------------------------------------- | -------------------- | ---------------------- |
| [AMP Document Host](#amp-document-host)         | `AMPDOC_HOST`        | `${ampdocHost}`        |
| [AMP Document Hostname](#amp-document-hostname) | `AMPDOC_HOSTNAME`    | `${ampdocHostname}`    |
| [AMP Document URL](#amp-document-url)           | `AMPDOC_URL`         | `${ampdocUrl}`         |
| [Canonical Host](#canonical-host)               | `CANONICAL_HOST`     | `${canonicalHost}`     |
| [Canonical Hostname](#canonical-hostname)       | `CANONICAL_HOSTNAME` | `${canonicalHostname}` |
| [Canonical Path](#canonical-path)               | `CANONICAL_PATH`     | `${canonicalPath}`     |
| [Canonical URL](#canonical-url)                 | `CANONICAL_URL`      | `${canonicalUrl}`      |
| [Counter](#counter)                             | `COUNTER`            | `${counter}`           |
| [Document Charset](#document-charset)           | `DOCUMENT_CHARSET`   | `${documentCharset}`   |
| [Document Referrer](#document-referrer)         | `DOCUMENT_REFERRER`  | `${documentReferrer}`  |
| [External Referrer](#external-referrer)         | `EXTERNAL_REFERRER`  | `${externalReferrer}`  |
| [HTML Attributes](#html-attributes)             | `HTML_ATTR`          | `${htmlAttr}`          |
| [Source URL](#source-url)                       | `SOURCE_URL`         | `${sourceUrl}`         |
| [Source Host](#source-host)                     | `SOURCE_HOST`        | `${sourceHost}`        |
| [Source Hostname](#source-hostname)             | `SOURCE_HOSTNAME`    | `${sourceHostname}`    |
| [Source Path](#source-path)                     | `SOURCE_PATH`        | `${sourcePath}`        |
| [Title](#title)                                 | `TITLE`              | `${title}`             |
| [Viewer](#viewer)                               | `VIEWER`             | `${viewer}`            |

### Performance

| Variable Name                                           | Platform Variable      | amp-analytics Variable      |
| ------------------------------------------------------- | ---------------------- | --------------------------- |
| [Content Load Time](#content-load-time)                 | `CONTENT_LOAD_TIME`    | `${contentLoadTime}`        |
| [Cumulative Layout Shift](#cumulative-layout-shift)     | N/A                    | `${cumulativeLayoutShift}`  |
| [Domain Lookup Time](#domain-lookup-time)               | `DOMAIN_LOOKUP_TIME`   | `${domainLookupTime}`       |
| [DOM Interactive Time](#dom-interactive-time)           | `DOM_INTERACTIVE_TIME` | `${domInteractiveTime}`     |
| [First Contentful Paint](#first-contentful-paint)       | N/A                    | `${firstContentfulPaint}`   |
| [First Input Delay](#first-input-delay)                 | N/A                    | `${firstInputDelay}`        |
| [Largest Contentful Paint](#largest-contentful-paint)   | N/A                    | `${largestContentfulPaint}` |
| [Navigation Redirect Count](#navigation-redirect-count) | `NAV_REDIRECT_COUNT`   | `${navRedirectCount}`       |
| [Navigation Timing ](#navigation-timing)                | `NAV_TIMING`           | `${navTiming}`              |
| [Navigation Type](#navigation-type)                     | `NAV_TYPE`             | `${navType}`                |
| [Page Download Time](#page-download-time)               | `PAGE_DOWNLOAD_TIME`   | `${pageDownloadTime}`       |
| [Page Load Time](#page-load-time)                       | `PAGE_LOAD_TIME`       | `${pageLoadTime}`           |
| [Redirect Time](#redirect-time)                         | `REDIRECT_TIME`        | `${redirectTime}`           |
| [Server Response Time](#server-response-time)           | `SERVER_RESPONSE_TIME` | `${serverResponseTime}`     |
| [TCP Connection Time](#tcp-connection-time)             | `TCP_CONNECT_TIME`     | `${tcpConnectTime}`         |

### Device and Browser

| Variable Name                                       | Platform Variable         | amp-analytics Variable     |
| --------------------------------------------------- | ------------------------- | -------------------------- |
| [Available Screen Height](#available-screen-height) | `AVAILABLE_SCREEN_HEIGHT` | `${availableScreenHeight}` |
| [Available Screen Width](#available-screen-width)   | `AVAILABLE_SCREEN_WIDTH`  | `${availableScreenWidth}`  |
| [Browser Language](#browser-language)               | `BROWSER_LANGUAGE`        | `${browserLanguage}`       |
| [Screen Color Depth](#screen-color-depth)           | `SCREEN_COLOR_DEPTH`      | `${screenColorDepth}`      |
| [Screen Height](#screen-heigth)                     | `SCREEN_HEIGHT`           | `${screenHeight}`          |
| [Screen Width](#screen-width)                       | `SCREEN_WIDTH`            | `${screenWidth}`           |
| [Scroll Height](#scroll-height)                     | `SCROLL_HEIGHT`           | `${scrollHeight}`          |
| [Scroll Width](#scroll-width)                       | `SCROLL_WIDTH`            | `${scrollWidth}`           |
| [Scroll Left](#scroll-left)                         | N/A                       | `${scrollLeft}`            |
| [Scroll Top](#scroll-top)                           | N/A                       | `${scrollTop}`             |
| [Timezone](#timezone)                               | `TIMEZONE`                | `${timezone}`              |
| [Timezone Code](#timezone-code)                     | N/A                       | `${timezoneCode}`          |
| [User Agent](#user-agent)                           | `USER_AGENT`              | `${userAgent}`             |
| [Viewport Height](#viewport-height)                 | `VIEWPORT_HEIGHT`         | `${viewportHeight}`        |
| [Viewport Width](#viewport-width)                   | `VIEWPORT_WIDTH`          | `${viewportWidth}`         |

### Interaction

| Variable Name                                             | Platform Variable          | amp-analytics Variable        |
| --------------------------------------------------------- | -------------------------- | ----------------------------- |
| [Horizontal Scroll Boundary](#horizontal-scroll-boundary) | N/A                        | `${horizontalScrollBoundary}` |
| [Total Engaged Time](#total-engaged-time)                 | `TOTAL_ENGAGED_TIME`       | `${totalEngagedTime}`         |
| [Incremental Engaged Time](#incremental-engaged-time)     | `INCREMENTAL_ENGAGED_TIME` | `${incrementalEngagedTime}`   |
| [Vertical Scroll Boundary](#vertical-scroll-boundary)     | N/A                        | `${verticalScrollBoundary}`   |

### Visibility

| Variable Name                                               | Platform Variable | amp-analytics Variable        |
| ----------------------------------------------------------- | ----------------- | ----------------------------- |
| [Backgrounded](#backgrounded)                               | N/A               | `${backgrounded}`             |
| [Backgrounded At Start](#backgrounded-at-start)             | N/A               | `${backgroundedAtStart}`      |
| [Carousel From Slide](#carousel-from-slide)                 | N/A               | `${fromSlide}`                |
| [Carousel To Slide](#carousel-to-slide)                     | N/A               | `${toSlide}`                  |
| [Element Id](#element-id)                                   | N/A               | `${elementId}`                |
| [Element Height](#element-height)                           | N/A               | `${elementHeight}`            |
| [Element Width](#element-width)                             | N/A               | `${elementWidth}`             |
| [Element X](#element-x)                                     | N/A               | `${elementX}`                 |
| [Element Y](#element-y)                                     | N/A               | `${elementY}`                 |
| [First Seen Time](#first-seen-time)                         | N/A               | `${firstSeenTime}`            |
| [First Visible Time](#first-visible-time)                   | N/A               | `${firstVisibleTime}`         |
| [Initial Scroll Depth](#initial-scroll-depth)               | N/A               | `${initialScrollDepth}`       |
| [Intersection Ratio](#intersection-ratio)                   | N/A               | `${intersectionRatio}`        |
| [Intersection Rect](#intersection-rect)                     | N/A               | `${intersectionRect}`         |
| [Last Seen Time](#last-seen-time)                           | N/A               | `${lastSeenTime}`             |
| [Last Visible Time](#last-visible-time)                     | N/A               | `${lastVisibleTime}`          |
| [Load Time Visibility](#load-time-visibility)               | N/A               | `${loadTimeVisibility}`       |
| [Max Continuous Visible Time](#max-continuous-visible-time) | N/A               | `${maxContinuousVisibleTime}` |
| [Max Scroll Depth](#max-scroll-depth)                       | N/A               | `${maxScrollDepth}`           |
| [Max Visible Percentage](#max-visible-percentage)           | N/A               | `${maxVisiblePercentage}`     |
| [Min Visible Percentage](#min-visible-percentage)           | N/A               | `${minVisiblePercentage}`     |
| [Total Time](#total-time)                                   | N/A               | `${totalTime}`                |
| [Total Visible Time](#total-visible-time)                   | N/A               | `${totalVisibleTime}`         |

### Timers

| Variable Name                     | Platform Variable | amp-analytics Variable |
| --------------------------------- | ----------------- | ---------------------- |
| [Timer Duration](#timer-duration) | N/A               | `${timerDuration}`     |
| [Timer Start Time](#timer-start)  | N/A               | `${timerStart}`        |

### AMP Components

| Variable Name                    | Platform Variable | amp-analytics Variable | Required AMP Components                                                                                             |
| -------------------------------- | ----------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [Variant](#experiment-variant)   | `VARIANT`         | N/A                    | [`<amp-experiment>`](https://github.com/ampproject/amphtml/blob/master/extensions/amp-experiment/amp-experiment.md) |
| [Variants](#experiment-variants) | `VARIANTS`        | N/A                    | [`<amp-experiment>`](https://github.com/ampproject/amphtml/blob/master/extensions/amp-experiment/amp-experiment.md) |
| [Geolocation](#geolocation)      | `AMP_GEO`         | `${ampGeo}`            | [`<amp-geo>`](https://github.com/ampproject/amphtml/blob/master/extensions/amp-geo/amp-geo.md)                      |

### Analytics Advanced Variable Syntax

| Variable Name               | Platform Variable | amp-analytics Variable |
| --------------------------- | ----------------- | ---------------------- |
| [Default](#default)         | N/A               | `$DEFAULT`             |
| [SubStr](#string-substr)    | N/A               | `$SUBSTR`              |
| [Trim](#trim)               | N/A               | `$TRIM`                |
| [ToLowerCase](#tolowercase) | N/A               | `$TOLOWERCASE`         |
| [ToUpperCase](#touppercase) | N/A               | `$TOUPPERCASE`         |
| [Not](#not)                 | N/A               | `$NOT`                 |
| [Base64](#base64)           | N/A               | `$BASE64`              |
| [Hash](#hash)               | N/A               | `$HASH`                |
| [If](#if)                   | N/A               | `$IF`                  |
| [Replace](#replace)         | N/A               | `$REPLACE`             |
| [Match](#match)             | N/A               | `$MATCH`               |
| [Equals](#equals)           | N/A               | `$EQUALS`              |

### Miscellaneous

| Variable Name                                 | Platform Variable  | amp-analytics Variable |
| --------------------------------------------- | ------------------ | ---------------------- |
| [AMP Version](#amp-version)                   | `AMP_VERSION`      | `${ampVersion}`        |
| [AMP State](#amp-state)                       | `AMP_STATE`        | `${ampState}`          |
| [Background State](#background-state)         | `BACKGROUND_STATE` | `${backgroundState}`   |
| [Client ID](#client-id)                       | `CLIENT_ID`        | `${clientId}`          |
| [Extra URL Parameters](#extra-url-parameters) | N/A                | `${extraUrlParams}`    |
| [Page View ID](#page-view-id)                 | `PAGE_VIEW_ID`     | `${pageViewId}`        |
| [Page View ID 64](#page-view-id-64)           | `PAGE_VIEW_ID_64`  | `${pageViewId64}`      |
| [Query Parameter](#query-parameter)           | `QUERY_PARAM`      | `${queryParam}`        |
| [Random](#random)                             | `RANDOM`           | `${random}`            |
| [Request Count](#request-count)               | N/A                | `${requestCount}`      |
| [Timestamp](#timestamp)                       | `TIMESTAMP`        | `${timestamp}`         |
| [Error Name](#error-name)                     | N/A                | `${errorName}`         |
| [Error Message](#error-message)               | N/A                | `${errorMessage}`      |

### Variable Descriptions

#### AMP Document Host

Provides the AMP document's URL host.

- **platform variable**: `AMPDOC_HOST`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?host=AMPDOC_HOST"></amp-pixel>
  ```
  Makes a request to something like `https://foo.com/pixel?host=example.com:8080`.
- **amp-analytics variable**: `${ampdocHost}`
  - Example value: `example.com`

#### AMP Document Hostname

Provides the AMP document's URL hostname.

- **platform variable**: `AMPDOC_HOSTNAME`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?hostname=AMPDOC_HOSTNAME"></amp-pixel>
  ```
  Makes a request to something like `https://foo.com/pixel?hostname=example.com`.
- **amp-analytics variable**: `${ampdocHostname}`
  - Example value: `example.com`

#### AMP Document URL

Provides the AMP document's URL. The URL contains the scheme, domain, port and full path. It does not contain the fragment part of the URL.

- **platform variable**: `AMPDOC_URL`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?ref=AMPDOC_URL"></amp-pixel>
  ```
  Makes a request to something like `https://foo.com/pixel?ref=https%3A%2F%2Fexample.com%2F`.
- **amp-analytics variable**: `${ampdocUrl}`
  - Example value: `http://example.com:8000/examples/analytics.amp.html`

#### AMP State

Pulls a value from the provided AMP state key.

- **platform variable**: `AMP_STATE`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?bar=AMP_STATE(foo.bar)"></amp-pixel>
  ```
  If `foo.bar` exists in the AMP state, the corresponding value is inserted into the pixel src.
- **amp-analytics variable**: `${ampState}`
  - Example value: `${ampState(foo.bar)}`: If `foo.bar` is available, its associated value is returned; otherwise, null is returned.

#### AMP Version

Provides a string with the AMP release version.

- **platform variable**: `AMP_VERSION`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?v=AMP_VERSION"></amp-pixel>
  ```
- **amp-analytics variable**: `${ampVersion}`
  - Example value: `1460655576651`

#### Available Screen Height

Provides the screen height in pixels available for the page rendering. This value can be slightly more or less than the actual viewport size because of various browser quirks.

- **platform variable**: `AVAILABLE_SCREEN_HEIGHT`
  - Example: <br>
  ```html
  <amp-pixel
    src="https://foo.com/pixel?availScreenHeight=AVAILABLE_SCREEN_HEIGHT"
  ></amp-pixel>
  ```
- **amp-analytics variable**: `${availableScreenHeight}`
  - Example value: `1480`

#### Available Screen Width

Provides the screen width in pixels available for the page rendering. This value can be slightly more or less than the actual viewport height due to various browser quirks.

- **platform variable**: `AVAILABLE_SCREEN_WIDTH`
  - Example: <br>
  ```html
  <amp-pixel
    src="https://foo.com/pixel?availScreenWidth=AVAILABLE_SCREEN_WIDTH"
  ></amp-pixel>
  ```
- **amp-analytics variable**: `${availableScreenWidth}`
  - Example value: `2500`

#### Backgrounded

A binary variable with possible values of 1 and 0 to indicate that the page/tab was sent to background at any point before the hit was sent. 1 indicates that the page was backgrounded while 0 indicates that the page has always been in the foreground. This variable does not count prerender as a backgrounded state.

- **platform variable**: N/A
- **amp-analytics variable**: `${backgrounded}`

#### Backgrounded At Start

A binary variable with possible values of 1 and 0 to indicate that the page/tab was backgrounded at the time when the page was loaded. 1 indicates that the page was loaded in the background while 0 indicates otherwise. This variable does not count prerender as a backgrounded state.

- **platform variable**: N/A
- **amp-analytics variable**: `${backgroundedAtStart}`

#### Background State

Provides the current background state of the page. Possible values are `0`, the page is visible, or `1`, the page is backgrounded.

- **platform variable**: `BACKGROUND_STATE`
- **amp-analytics variable**: `${backgroundState}`

#### Browser Language

Provides a string representing the preferred language of the user, usually the language of the browser UI.

- **platform variable**: `BROWSER_LANGUAGE`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?lang=BROWSER_LANGUAGE"></amp-pixel>
  ```
- **amp-analytics variable**: `${browserLanguage}`
  - Example value: `en-us`

#### Canonical Host

Provides the canonical document's URL host.

- **platform variable**: `CANONICAL_HOST`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?host=CANONICAL_HOST"></amp-pixel>
  ```
  Makes a request to something like `https://foo.com/pixel?host=pinterest.com:9000`.
- **amp-analytics variable**: `${canonicalHost}`
  - Example value: `http://pinterest.com:9000`

#### Canonical Hostname

Provides the canonical document's URL hostname.

- **platform variable**: `CANONICAL_HOSTNAME`
  - Example: <br>
  ```html
  <amp-pixel
    src="https://foo.com/pixel?hostname=CANONICAL_HOSTNAME"
  ></amp-pixel>
  ```
  Makes a request to something like `https://foo.com/pixel?host=pinterest.com`.
- **amp-analytics variable**: `${canonicalHostname}`
  - Example value: `pinterest.com`

#### Canonical Path

Provides the canonical document's URL path.

- **platform variable**: `CANONICAL_PATH`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?path=CANONICAL_PATH"></amp-pixel>
  ```
  Makes a request to something like `https://foo.com/pixel?path=%2Fpage1.html`.
- **amp-analytics variable**: `${canonicalPath}`
  - Example value: `%2Fanalytics.html`

#### Canonical URL

Provides the canonical document's URL.

- **platform variable**: `CANONICAL_URL`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?href=CANONICAL_URL"></amp-pixel>
  ```
  Makes a request to something like `https://foo.com/pixel?href=https%3A%2F%2Fpinterest.com%2F`.
- **amp-analytics variable**: `${canonicalUrl}`
  - Example value: `http%3A%2F%2Fexample.com%3A8000%2Fanalytics.html`

#### Carousel From Slide

Provides the `amp-carousel` slide from which the traversal happens. The value is either taken from the `data-slide-id` attribute of the slide when present, else it represents the index of the slide (starting from 0).

- **platform variable**: N/A
- **amp-analytics variable**: `${fromSlide}`

For more information on analytics for `amp-carousel`, see [AMP Carousel and Analytics](../extensions/amp-carousel/amp-carousel-analytics.md).

#### Carousel To Slide

Provides the `amp-carousel` slide to which the traversal happens. The value is either taken from the `data-slide-id` attribute of the slide when present, else it represents the index of the slide (starting from 0).

- **platform variable**: N/A
- **amp-analytics variable**: `${toSlide}`

For more information on analytics for `amp-carousel`, see [AMP Carousel and Analytics](../extensions/amp-carousel/amp-carousel-analytics.md).

#### Client ID

Provides a per document-source-origin (the origin of the website where you publish your AMP doc) and user identifier. The client ID will be the same for the same user if they visit again within one year. The client ID should behave roughly similar to a cookie storing a session ID for one year. If the AMP document is not served through the Google AMP Cache, the client ID is replaced with a cookie of the name of the `cid scope` argument (see below). If it is not present, a cookie will be set with the same name. These cookies will always have the prefix "amp-" followed by a random base64 encoded string.

- **platform variable**: `CLIENT_ID`

  - Example: <br>

  ```html
  <amp-pixel
    src="https://foo.com/pixel?cid=CLIENT_ID(cid-scope-cookie-fallback-name)"
  ></amp-pixel>

  <amp-user-notification
    layout="nodisplay"
    id="user-consent"
    data-show-if-href="https://foo.com/api/show"
    data-dismiss-href="https://foo.com/api/dismissed"
  >
    This site uses cookies to personalize content.
    <a href="">Learn more.</a>
    <button on="tap:user-consent.dismiss">I accept</button>
  </amp-user-notification>

  <!-- Client ID is not provided until `user-consent` is dismissed -->
  <amp-pixel
    src="https://foo.com/pixel?cid=CLIENT_ID(cid-scope-cookie-fallback-name,user-consent)"
  ></amp-pixel>
  ```

- **amp-analytics variable**: `${clientId}`
  - Example usage: `${clientId(foo)}`
  - Example value: `U6XEpUs3yaeQyR2DKATQH1pTZ6kg140fvuLbtl5nynbUWtIodJxP5TEIYBic4qcV`

##### Client ID arguments

You can pass the following arguments into the Client ID variable like a function. Spaces between arguments and values are not allowed.

- `cid scope` (Required): The namespace for the Client ID.
- `amp-user-notification id` (Optional): Use this argument to make the Client ID substitution dependent on the dismissal of a user notification shown to the visitor of the page. In amp-analytics, this is the same as using the [`data-consent-notification-id`](../extensions/amp-analytics/amp-analytics.md) attribute -- you may choose to use either one for the amp-analytics component.
- `cookie name` (Optional): The name of the fallback cookie when the document is not served by an AMP proxy. If not provided, `cid scope` will be used as the cookie name.

#### Content Load Time

Provides the time the page takes to fire the `DOMContentLoaded` event from the time the previous page is unloaded. The value is in milliseconds.

- **platform variable**: `CONTENT_LOAD_TIME`
  - Example: <br>
  ```html
  <amp-pixel
    src="https://foo.com/pixel?contentLoadTime=CONTENT_LOAD_TIME"
  ></amp-pixel>
  ```
- **amp-analytics variable**: `${contentLoadTime}`
  - Example value: `40`

#### Counter

Use `COUNTER(name)` to generate an index for the given request. Counts start at 1 and are per given `name`.

- **platform variable**: `COUNTER`
- **amp-analytics variable**: `${counter}`

#### Document Charset

Provides the character encoding of the current document.

- **platform variable**: `DOCUMENT_CHARSET`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?charSet=DOCUMENT_CHARSET"></amp-pixel>
  ```
- **amp-analytics variable**: `${documentCharset}`
  - Example value: `UTF-8`

#### Document Referrer

Provides the referrer where the user came from, which is read from `document.referrer`. The value is empty for direct visitors.

- **platform variable**: `DOCUMENT_REFERRER`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?referrer=DOCUMENT_REFERRER"></amp-pixel>
  ```
- **amp-analytics variable**: `${documentReferrer}`
  - Example value: `https://www.google.com`

#### Domain Lookup Time

Provides the time it took to perform the DNS lookup for the current page. The value is in milliseconds.

- **platform variable**: `DOMAIN_LOOKUP_TIME`
  - Example: <br>
  ```html
  <amp-pixel
    src="https://foo.com/pixel?domainLookupTime=DOMAIN_LOOKUP_TIME"
  ></amp-pixel>
  ```
- **amp-analytics variable**: `${domainLookupTime}`
  - Example value: `1`

#### DOM Interactive Time

Provides the time the page to become interactive from the time the previous page is unloaded. The value is in milliseconds.

- **platform variable**: `DOM_INTERACTIVE_TIME`
  - Example: <br>
  ```html
  <amp-pixel
    src="https://foo.com/pixel?domInteractiveTime=DOM_INTERACTIVE_TIME"
  ></amp-pixel>
  ```
- **amp-analytics variable**: `${domInteractiveTime}`
  - Example value: `40`

#### Element Height

Provides the height of the element specified by `visibilitySpec`.

- **platform variable**: N/A
- **amp-analytics variable**: `${elementHeight}`

#### Element Width

Provides the width of the element specified by `visibilitySpec`.

- **platform variable**: N/A
- **amp-analytics variable**: `${elementWidth}`

#### Element X

Provides the absolute X coordinate of the left edge of the element specified by `visibilitySpec`.

- **platform variable**: N/A
- **amp-analytics variable**: `${elementX}`

#### Element Y

Provides the absolute Y coordinate of the top edge of the element specified by `visibilitySpec`.

- **platform variable**: N/A
- **amp-analytics variable**: `${elementY}`

#### Error Message

Provides the message of the error that triggered an user error event. This variable is only available in a `trigger` of type `user-error`

- **platform variable**: N/A
- **amp-analytics variable**: `${errorMessage}`
  - Example value: `Invalid multi-size data format`

#### Experiment Variant

Provide the allocated variant information from the `<amp-experiment>` component. The allocated variant name is returned. The variable resolves to string `none` if no variant is allocated.

- **platform variable**: `VARIANT(experiment)`
- **amp-analytics variable**: N/A

#### Experiment Variants

Provide the all variants information from the `<amp-experiment>` component. The variable will be serialized in the following format.

- **platform variable**: `VARIANT(experiment)`
- **amp-analytics variable**: N/A
  - Example value: `{experiment1}.{variant}!{experiment2}.{variant}...`

#### Error Name

Provides the name of the error that triggered an user error event. This variable is only available in a `trigger` of type `user-error`

- **platform variable**: N/A
- **amp-analytics variable**: `${errorName}`
  - Example value: `AMP-AD`

#### External Referrer

Provides the referrer where the user came from. Similar to [Document Referrer](#document_referrer), but the value is empty if user is navigated from same domain or the corresponding CDN proxy domain.
Analytics vendor might prefer this value to Document Referrer for better session stitching, depending on the server side implementation.

- **platform variable**: `EXTERNAL_REFERRER`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?referrer=EXTERNAL_REFERRER"></amp-pixel>
  ```
- **amp-analytics variable**: `${externalReferrer}`
  - Example value: `https://www.google.com`

#### Extra URL Parameters

Provides all the parameters that are defined in the [`extraUrlParams`](../extensions/amp-analytics/amp-analytics.md#extra-url-params) block of the amp-analytics config as a variable. If you use the `extraUrlParams` variable, the parameters are not appended to the end of the URL.

- **platform variable**: N/A
- **amp-analytics variable**: `${extraUrlParams}`
  - Example value: `foo=bar&baz=something`

#### First Seen Time

Provides the time when at least 1px of the element is on the screen for the first time since the page has become visible.

- **platform variable**: N/A
- **amp-analytics variable**: `${firstSeenTime}`

#### First Visible Time

Provides the time when the element met visibility conditions for the first time since the page has become visible.

- **platform variable**: N/A
- **amp-analytics variable**: `${firstVisibleTime}`

#### Geolocation

Provides the approximate, country level, location of the user provided by the [`amp-geo`](../extensions/amp-geo/amp-geo.md#variable-substitution) extension.

- **platform variable**: AMP_GEO
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?domInteractiveTime=AMP_GEO"></amp-pixel>
  ```
- **amp-analytics variable**: `${ampGeo}`
  - Example value: `ca`

#### Horizontal Scroll Boundary

Provides the horizontal scroll boundary that triggered a scroll event. This variable is only available in a `trigger` of type `scroll`. The value of the boundary may be rounded based on the precision supported by the extension. For example, a boundary with value `1` and precision of `5` will result in value of var to be 0.

- **platform variable**: N/A
- **amp-analytics variable**: `${horizontalScrollBoundary}`

#### HTML Attributes

Provides values of attributes of HTML elements inside of an amp-ad tag which match a given CSS selector.
This only allows an amp-analytics tag to query attributes of HTML elements loaded by that amp-analytics tag's parent
amp-ad tag. It will not allow a publisher to obtain information about the content of an ad, nor will it allow metrics
of one ad to be seen by the provider of another ad on the page.

- **platform variable**: N/A
- **amp-analytics variable**: `${htmlAttr}`

Example:

```json
"requests": {
    "sample_visibility_request": "//somewhere/imgData=${htmlAttr(img,src,decoding)}"
},
```

This will return the "src" and "decoding" attributes of img tags in the ad.

Caveats:

- If the CSS selector matches 20 or more elements, an empty array will be returned. This is because traversing a
  large list of elements is inefficient.
- Attributes of at most 10 elements will be returned.
- If an element matches the CSS selector but has none of the requested attributes, that element will not be
  represented in the returned array.
- The returned values will be in the form of a URL encoded JSON array of objects wherein the object keys are the
  requested attribute names and the object values are the elements' values for those attributes.
- The CSS selector may contain only letters (upper- and/or lower-case), numbers, hyphens, underscores, and periods.
  [Issue #14252](https://github.com/ampproject/amphtml/issues/14252) has been created to address potential future demand for more complex CSS selectors.

#### Initial Scroll Depth

Provides the scroll depth at the time the element was loaded, relative to the target. The value returned will be top/inside/bottom, indicating whether the target was scrolled inside the viewport, was offscreen above the top of the viewport, or was offscreen below the bottom of the viewport.

- **platform variable**: N/A
- **amp-analytics variable**: `${initialScrollDepth}`

#### Intersection Ratio

Provides the fraction of the target that is visible. The value will be between 0.0 and 1.0, inclusive. For more information, please see the [IntersectionObserverEntry.intersectionRatio](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry/intersectionRatio) API documentation.

- **platform variable**: N/A
- **amp-analytics variable**: `${intersectionRatio}`

#### Intersection Rect

Provides the bounds of the rectangle defining the portion of the selected element that is visible. For more information, please see the [IntersectionObserverEntry.intersectionRect](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry/intersectionRect) API documentation.

Example value:

```javascript
{"left":0,"top":74,"width":256,"height":226,"bottom":300,"right":256,"x":0,"y":74}
```

- **platform variable**: N/A
- **amp-analytics variable**: `${intersectionRect}`

#### Last Seen Time

Provides the time when at least 1px of the element is on the screen for the last time since the page has become visible.

- **platform variable**: N/A
- **amp-analytics variable**: `${lastSeenTime}`

#### Last Visible Time

Provides the time when the element met visibility conditions for the last time since the page has become visible.

- **platform variable**: N/A
- **amp-analytics variable**: `${lastVisibleTime}`

#### Load Time Visibility

Provides the percentage of element visible in the viewport when the page has first become visible. This variable assumes that the page is scrolled to top.

- **platform variable**: N/A
- **amp-analytics variable**: `${loadTimeVisibility}`

#### Max Continuous Visible Time

Provides the maximum amount of continuous time an element has met the `visibilitySpec` conditions at the time this ping is sent. Note that a ping with a `continuousTimeMin=1000` and `totalTimeMin=5000` that is visible for 1000ms, then not visible, then visible for 2000ms, then not, then visible for 1000ms, then not, then visible for 1020ms will report 2000 for this number as that is the max continuous visible time, even if it is not the current continuous visible time (1020 in this example).

- **platform variable**: N/A
- **amp-analytics variable**: `${maxContinuousVisibleTime}`

#### Max Scroll Depth

Provides the maximum amount that the user has scrolled down the page, relative to the target. The value returned will be top/inside/bottom, indicating whether the target was scrolled inside the viewport, was offscreen above the top of the viewport, or was offscreen below the bottom of the viewport.

- **platform variable**: N/A
- **amp-analytics variable**: `${maxScrollDepth}`

#### Max Visible Percentage

Provides the maximum visible percentage over the time that `visibilitySpec` conditions were met. For example, a ping where the element was 100%, then off the page, then 100% will report this value as 100. A ping with `visiblePercentageMax=50` undergoing the same transitions would report somewhere between 0 and 50 since any time when the element was 100% on the page would not be counted.

- **platform variable**: N/A
- **amp-analytics variable**: `${maxVisiblePercentage}`

#### Min Visible Percentage

Provides the minimum visible percentage over the time that `visibilitySpec` conditions were met. For example, a ping where the element was 100%, then off the page, then 100% will report this value as 0. A ping with `visiblePercentageMin=50` condition undergoing the same transitions would report somewhere between 50 and 100 since any time when the element was 0% to 50% on the page would not be counted.

- **platform variable**: N/A
- **amp-analytics variable**: `${minVisiblePercentage}`

#### Navigation Redirect Count

Provides the number of redirects since the last non-redirect navigation.
For more information, see the W3C Navigation Timing API [PerformanceNavigation interface](https://www.w3.org/TR/navigation-timing/#performancenavigation).

- **platform variable**: `NAV_REDIRECT_COUNT`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?nrc=NAV_REDIRECT_COUNT"></amp-pixel>
  ```
- **amp-analytics variable**: `${navRedirectCount}`
  - Example value: `0`

#### Navigation Timing

Provides access to metrics from the browser's PerformanceTiming interface. See the W3C Navigation Timing API [PerformanceTiming interface](https://www.w3.org/TR/navigation-timing/#sec-navigation-timing-interface) documentation for attribute names and definitions.

- **platform variable**: `NAV_TIMING`
  - Example: <br>
  ```html
  <amp-pixel
    src="https://foo.com/pixel?navStart=NAV_TIMING(navigationStart)&amp;pageLoadTime=NAV_TIMING(navigationStart,loadEventStart)"
  ></amp-pixel>
  ```
  Makes a request to something like `https://foo.com/pixel?navStart=1451606400000&pageLoadTime=100`.
- **amp-analytics variable**: `${navTiming}`
  - Example 1: `${navTiming(navigationStart)}` results in value: `1451606400000`
  - Example 2: `${navTiming(navigationStart,responseStart)}` results in value: `10`

##### Navigation Timing arguments

You can pass the following arguments into the Navigation Timing variable like a function. Spaces between arguments and values are not allowed.

- `startEvent` (Required): The name of the [PerformanceTiming interface](https://www.w3.org/TR/navigation-timing/#sec-navigation-timing-interface) attribute that corresponds to the start event.
- `endEvent` (Optional): The name of the [PerformanceTiming interface](https://www.w3.org/TR/navigation-timing/#sec-navigation-timing-interface) attribute that corresponds to the end event. If `endEvent` is passed, the value will be the time difference between the start and end events.

If both `startEvent` and `endEvent` arguments are passed, the value will be the time elapsed between the two events. Otherwise, if only `startEvent` argument is passed, the value will be the timestamp of the given event.
The value is in milliseconds.

#### Navigation Type

Provides the type of the last non-redirect navigation in the current browsing context. See the W3C Navigation Timing API [PerformanceNavigation interface](https://www.w3.org/TR/navigation-timing/#performancenavigation) for more information.

- **platform variable**: `NAV_TYPE`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?nt=NAV_TYPE"></amp-pixel>
  ```
- **amp-analytics variable**: `${navType}`
  - Example value: `1`

#### Page Download Time

Provides the time between receiving the first and the last byte of response. The value is in milliseconds.

- **platform variable**: `PAGE_DOWNLOAD_TIME`
  - Example: <br>
  ```html
  <amp-pixel
    src="https://foo.com/pixel?pageDownloadTime=PAGE_DOWNLOAD_TIME"
  ></amp-pixel>
  ```
- **amp-analytics variable**: `${pageDownloadTime}`
  - Example value: `100`

#### Page Load Time

Provides the time taken to load the whole page. The value is calculated from the time `unload` event handler on previous page ends to the time `load` event for the current page is fired. If there is no previous page, the duration starts from the time the user agent is ready to fetch the document using an HTTP request. The value is in milliseconds.

- **platform variable**: `PAGE_LOAD_TIME`
  - Example: <br>
  ```html
  <amp-pixel
    src="https://foo.com/pixel?pageLoadTime=PAGE_LOAD_TIME"
  ></amp-pixel>
  ```
- **amp-analytics variable**: `${pageLoadTime}`
  - Example value: `220`

#### Page View ID

Provides a string that is intended to be random and likely to be unique per URL, user and day.

- **platform variable**: `PAGE_VIEW_ID`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?pid=PAGE_VIEW_ID"></amp-pixel>
  ```
- **amp-analytics variable**: `${pageViewId}`
  - Example value: `978`

#### Page View ID 64

Provides a string that is intended to be random with a high entropy and likely to be unique per URL, user and day.

- **platform variable**: `PAGE_VIEW_ID_64`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?pid=PAGE_VIEW_ID_64"></amp-pixel>
  ```
- **amp-analytics variable**: `${pageViewId64}`
  - Example value: `U6XEpUs3yaeQyR2DKATQH1pTZ6kg140fvuLbtl5nynb`

#### Query Parameter

Pulls a value from the provided query string parameter.

- **platform variable**: `QUERY_PARAM`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?bar=QUERY_PARAM(baz,biz)"></amp-pixel>
  ```
  If a `baz` query string parameter is provided, the corresponding value is inserted into the pixel src; otherwise, the default `biz` is used.
- **amp-analytics variable**: `${queryParam}`
  - Example 1: `${queryParam(foo)}`: If `foo` is available, its associated value is returned; otherwise, an empty string is returned.
  - Example 2: `${queryParam(foo,bar)}`: if `foo` is available, its associated value is returned, otherwise `bar` is returned.

##### Query Parameter arguments

You can pass the following arguments into the Query Parameter variable like a function. Spaces between arguments and values are not allowed.

- `param` (Required): The key for the query string parameter to be inserted.
- `defaultValue` (Optional): The value to use if the provided key is not present on the query string. Defaults to an empty value ("").

#### Random

Provides a random value each time a request is constructed.

- **platform variable**: `RANDOM`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?RANDOM"></amp-pixel>
  ```
  Makes a request to something like `https://foo.com/pixel?0.8390278471201` where the \$RANDOM value is randomly generated upon each impression.
- **amp-analytics variable**: `${random}`
  - Example value: `0.12345632345`

#### Redirect Time

Provides the time taken to complete all the redirects before the request for the current page is made. The value is in milliseconds.

- **platform variable**: `REDIRECT_TIME`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?redirectTime=REDIRECT_TIME"></amp-pixel>
  ```
- **amp-analytics variable**: `${redirectTime}`
  - Example value: `0`

#### Request Count

Provides the number of requests sent out from a particular `amp-analytics` tag. This value can be used to reconstruct the sequence in which requests were sent from a tag. The value starts from 1 and increases monotonically. Note that there may be a gap in `requestCount` numbers if the request sending fails due to network issues.

- **platform variable**: N/A
- **amp-analytics variable**: `${requestCount}`
  - Example value: `6`

#### Screen Color Depth

Provides the screen color depth provided by the browser.

- **platform variable**: `SCREEN_COLOR_DEPTH`
  - Example: <br>
  ```html
  <amp-pixel
    src="https://foo.com/pixel?colorDepth=SCREEN_COLOR_DEPTH"
  ></amp-pixel>
  ```
- **amp-analytics variable**: `${screenColorDepth}`
  - Example value: `24`

#### Screen Height

Provides the screen height in pixels. The value is retrieved from `window.screen.height`.

- **platform variable**: `SCREEN_HEIGHT`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?sh=SCREEN_HEIGHT"></amp-pixel>
  ```
- **amp-analytics variable**: `${screenHeight}`
  - Example value: `1600`

#### Screen Width

Provides the screen width in pixels. The value is retrieved from `window.screen.width`.

- **platform variable**: `SCREEN_WIDTH`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?sw=SCREEN_WIDTH"></amp-pixel>
  ```
- **amp-analytics variable**: `${screenWidth}`
  - Example value: `2560`

#### Scroll Height

Provides the total height of the page in pixels.

- **platform variable**: `SCROLL_HEIGHT`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?scrollHeight=SCROLL_HEIGHT"></amp-pixel>
  ```
- **amp-analytics variable**: `${scrollHeight}`
  - Example value: `400`

#### Scroll Left

Provides the number of pixels that the user has scrolled from left.

- **platform variable**: N/A
- **amp-analytics variable**: `${scrollLeft}`
  - Example value: `100`

#### Scroll Top

Provides the number of pixels that the user has scrolled from top.

- **platform variable**: N/A
- **amp-analytics variable**: `${scrollTop}`
  - Example value: `0`

#### Scroll Width

Provides the total width of the page in pixels.

- **platform variable**: `SCROLL_WIDTH`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?scrollWidth=SCROLL_WIDTH"></amp-pixel>
  ```
- **amp-analytics variable**: `${scrollWidth}`
  - Example value: `600`

#### Server Response Time

Provides the time taken by the server to start sending the response after it starts receiving the request. The value is in milliseconds.

- **platform variable**: `SERVER_RESPONSE_TIME`
  - Example: <br>
  ```html
  <amp-pixel
    src="https://foo.com/pixel?serverResponseTime=SERVER_RESPONSE_TIME"
  ></amp-pixel>
  ```
- **amp-analytics variable**: `${serverResponseTime}`
  - Example value: `10`

#### Source URL

Parses and provides the source URL of the current document to the URL.

The source URL is extracted from the proxy URL if the document is being served from a _known_ proxy. Otherwise, the original document URL is returned. For example, if the URL is served via the proxy `https://cdn.ampproject.org` from the URL `https://cdn.ampproject.org/c/s/example.com/page.html`, then `SOURCE_URL` would return `https://example.com/page.html`.

- **platform variable**: `SOURCE_URL`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?href=SOURCE_URL"></amp-pixel>
  ```
  Makes a request to something like `https://foo.com/pixel?href=https%3A%2F%2Fpinterest.com%2F`.
- **amp-analytics variable**: `${sourceUrl}`
  - Example value: `https%3A%2F%2Fpinterest.com%2F`

#### Source Host

Parses and provides the source URL's host. See the description of [Source URL](#source-url) for more details.

- **platform variable**: `SOURCE_HOST`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?host=SOURCE_HOST"></amp-pixel>
  ```
  Makes a request to something like `https://foo.com/pixel?host=pinterest.com:9000`.
- **amp-analytics variable**: `${sourceHost}`
  - Example value: `example.com`

#### Source Hostname

Parses and provides the source URL's hostname. See the description of [Source URL](#source-url) for more details.

- **platform variable**: `SOURCE_HOSTNAME`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?host=SOURCE_HOSTNAME"></amp-pixel>
  ```
  Makes a request to something like `https://foo.com/pixel?host=pinterest.com`.
- **amp-analytics variable**: `${sourceHostname}`
  - Example value: `example.com`

#### Source Path

Parses and provides the source URL's path. See the description of [Source URL](#source-url) for more details.

- **platform variable**: `SOURCE_PATH`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?path=SOURCE_PATH"></amp-pixel>
  ```
  Makes a request to something like `https://foo.com/pixel?path=%2Fpage2.html`.
- **amp-analytics variable**: `${sourcePath}`
  - Example value: `%2Fpage2.html`

#### TCP Connection Time

Provides the time it took for HTTP connection to be setup. The duration includes connection handshake time and SOCKS authentication. The value is in milliseconds.

- **platform variable**: `TCP_CONNECT_TIME`
  - Example: <br>
  ```html
  <amp-pixel
    src="https://foo.com/pixel?tcpConnectTime=TCP_CONNECT_TIME"
  ></amp-pixel>
  ```
- **amp-analytics variable**: `${tcpConnectTime}`
  - Example value: `10`

#### Title

Provides the title of the current document.

- **platform variable**: `TITLE`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?title=TITLE"></amp-pixel>
  ```
  Makes a request to something like `https://foo.com/pixel?title=Breaking%20News`.
- **amp-analytics variable**: `${title}`
  - Example value: `The New York Times - Breaking News, World News...`

#### Timestamp

Provides the number of milliseconds that have elapsed since 1970. (Epoch time)

- **platform variable**: `TIMESTAMP`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?timestamp=TIMESTAMP"></amp-pixel>
  ```
- **amp-analytics variable**: `${timestamp}`
  - Example value: `10`

#### Timezone

Provides the user's time-zone offset from UTC, in minutes.

- **platform variable**: `TIMEZONE`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?tz=TIMEZONE"></amp-pixel>
  ```
- **amp-analytics variable**: `${timezone}`
  - Example value: `480` for [Pacific Standard Time](https://en.wikipedia.org/wiki/Pacific_Time_Zone).

#### Timezone Code

Provides the user's IANA time-zone code (if available).

- **platform variable**: N/A
- **amp-analytics variable**: `${timezoneCode}`
  - Example value: `Europe/Rome`.

#### Total Engaged Time

Provides the total time (in seconds) the user has been engaged with the page since the page first became visible in the viewport. Total engaged time will be 0 until the page first becomes visible. This variable requires the [amp-analytics](../extensions/amp-analytics/amp-analytics.md) extension to be present on the page.

- **platform variable**: `TOTAL_ENGAGED_TIME`
- **amp-analytics variable**: `${totalEngagedTime}`
  - Example value: `36`

#### Incremental Engaged Time

Provides the time (in seconds) the user has been engaged with the page since the last time it was reset. It takes two arguments. The first is the name of the timer, the second is whether or not to reset it (it is optional and defaults to true). Incremental engaged time will be 0 until the page first becomes visible. This variable requires the [amp-analytics](../extensions/amp-analytics/amp-analytics.md) extension to be present on the page.

- **platform variable**: `INCREMENTAL_ENGAGED_TIME`
- **amp-analytics variable**: `${incrementalEngagedTime(foo,false)}`
  - Example value: `36`

#### Total Time

Provides the total time from the time page has become visible to the time a ping was sent out. Only applicable to visible trigger events.

- **platform variable**: N/A
- **amp-analytics variable**: `${totalTime}`

#### Total Visible Time

Provides the total time for which the element has met the `visiblitySpec`conditions at time this ping is sent.

- **platform variable**: N/A
- **amp-analytics variable**: `${totalVisibleTime}`

#### Timer Duration

Provides the duration of the triggered timer since last start or interval in milliseconds. For timers stopped before a full interval completes, this will report the partial time.

- **platform variable**: N/A
- **amp-analytics variable**: `${timerDuration}`

#### Timer Start Time

Provides the start time of the triggered timer in milliseconds from epoch. Resets only on timer start.

- **platform variable**: N/A
- **amp-analytics variable**: `${timerStart}`

#### User Agent

Provides a string representing the user agent of the requesting software, usually tells about user's browser operating system.

- **platform variable**: `USER_AGENT`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?sh=USER_AGENT"></amp-pixel>
  ```
- **amp-analytics variable**: `${userAgent}`
  - Example value: `Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0`

#### Vertical Scroll Boundary

Provides the vertical scroll boundary that triggered a scroll event. This variable is only available in a `trigger` of type `scroll`. The value of the boundary may be rounded based on the precision supported by the extension. For example, a boundary with value `1` and precision of `5` will result in value of var to be 0.

- **platform variable**: N/A
- **amp-analytics variable**: `${verticalScrollBoundary}`

#### Viewer

Provides an identifier for the viewer that contains the AMP document. An empty string is provided when the document is loaded directly in the browser or if the id is not found.

- **platform variable**: `VIEWER`
  - Example: <br>
  ```html
  <amp-pixel src="https://foo.com/pixel?viewer=VIEWER"></amp-pixel>
  ```
- **amp-analytics variable**: `${viewer}`
  - Example value: `www.google.com`

#### Viewport Height

Provides the viewport height in pixels available for the page rendering. In contrast to `AVAILABLE_SCREEN_HEIGHT`, this value takes window size and zooming into account.

- **platform variable**: `VIEWPORT_HEIGHT`
  - Example: <br>
  ```html
  <amp-pixel
    src="https://foo.com/pixel?viewportHeight=VIEWPORT_HEIGHT"
  ></amp-pixel>
  ```
- **amp-analytics variable**: `${viewportHeight}`
  - Example value: `1600`

#### Viewport Width

Provides the viewport width in pixels available for the page rendering. In contrast to `AVAILABLE_SCREEN_WIDTH`, this value takes window size and zooming into account.

- **platform variable**: `VIEWPORT_WIDTH`
  - Example: <br>
  ```html
  <amp-pixel
    src="https://foo.com/pixel?viewportHeight=VIEWPORT_HEIGHT"
  ></amp-pixel>
  ```
- **amp-analytics variable**: `${viewportWidth}`
  - Example value: `2560`

#### Analytics Advanced Variable Syntax

The following variables are only supported in `<amp-analytics>`

##### Default

Used to assign fallback value when the variable is resolved to empty string.

- Example: `$DEFAULT(${var}, fallback)`

##### String substr

- Example: `$SUBSTR(${var}, 1, 4)`

##### Trim

- Example: `$TRIM(${var})`

##### ToLowerCase

- Example: `$TOLOWERCASE(${var})`

##### ToUpperCase

- Example: `$TOUPPERCASE(TITLE)`

##### Not

Used to convert truth-y/false-y value to `'false'`/`'true'` string.

- Example `$NOT(hello)` = `'false'` and `$NOT()` = `'true'`

##### Base64

- Example `$BASE64(PAGE_VIEW_ID)`

##### Hash

SHA-384 hash

- Example: `$HASH(PAGE_VIEW_ID)`

##### If

An if statement to choose between values

- Example: `$IF(${var}, value1, value2)` resolves to `value2` if `${var}` resolves to falsey value (`'false'`, `''`, `'0'`, `'null'`, `'Nan'` or `'undefined'`), otherwise will resolve to `value1`.

##### Replace

Find an replace all matched pattern.

- Example: `$REPLACE(${var}, matchPattern, replaceStr)`

##### Match

Find the specified (or first) matched pattern.

- Example: `$MATCH(${var}, matchPatter, 0)`

##### Equals

- Example: `$EQUALS(${val}, value)` resolves to `'true'` or `'false'`

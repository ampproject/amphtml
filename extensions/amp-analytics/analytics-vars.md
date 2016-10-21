# <a name="amp-analytics"></a> Variables supported in `amp-analytics`

Use the format `${varName}` in a request string for a page or platform-defined variable. The `amp-analytics` tag will replace the template with its actual value at the time of construction of the analytics request.

Since the request that is constructed is sent over HTTP, the request needs to be encoded. To achieve this, the `var` values are url-encoded using [`encodeUrlComponent`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) before being inserted into the request.

## Variable definitions
Vars can be defined by the platform, in the config at the top level, inside the triggers or in a remote config, as shown in this example.

```html
<amp-analytics config="http://example.com/config.json">
<script type="application/json">
{
  "requests": {
    "pageview": "https://example.com/analytics?url=${canonicalUrl}&title=${title}&acct=${account}&clientId=${clientId(cid-scope)}",
  },
  "vars": {
    "account": "ABC123",
    "title": "Homepage"
  },
  "triggers": {
    "some-event": {
      "on": "visible",
      "request": "pageview",
      "vars": {
        "title": "My homepage",
        "clientId": "my user"
      }
  }
}
</script>
</amp-analytics>
```

## Variables as data attribute
For the following event types, variables can be passed as part of the element level data attribute

* visible
* click

The variables passed as data attributes should follow the format `data-vars-*`.

Example:

`<span id="test1" class="box" data-vars-event-id="22">
  Click here to generate an event
</span>`

And in the request url the token would be of the format `${eventId}` (follows camelcase).

When the same `var` is defined in multiple locations, the value is picked in the order remote config > element level data attributes > triggers > top level > platform. Thus, if the remote config defined `clientId` as `12332312` in the example above, the values of various vars will be as follows:

| var | Value | Defined by |
|-------|-------|------------|
|canonicalUrl | http://example.com/path/to/the/page | Platform |
|title | My homepage | Trigger |
|account | ABC123 | Top level config |
|clientId | 12332312 | Remote config |

The remainder of this doc lists and describes the variables supported in `amp-analytics`.

| Table of Contents  |
|---|
| [Device and Browser](#device-and-browser) |
| [Interaction](#interaction) |
| [Miscellaneous](#miscellaneous) |
| [Page and content](#page-and-content) |
| [Performance](#performance) |
| [Visibility](#visibility-variables) |


## Page and content

### ampdocHost

Provides the AMP document's URL host.

Example value: `example.com`

### ampdocUrl

Provides the AMP document's URL. The URL contains the scheme, domain, port and full path. It does not contain the fragment part of the URL.

Example value: `http://example.com:8000/examples/analytics.amp.html`

### canonicalHost

Provides the canonical URL's host.

Example value: `example.com`

### canonicalPath

Provides the canonical URL's path part.

Example value: `%2Fanalytics.html`

### canonicalUrl

Provides the canonical URL of the current document.

Example value: `http%3A%2F%2Fexample.com%3A8000%2Fanalytics.html`

### documentCharset

Provides the character encoding of the current document.

Example value: `UTF-8`

### documentReferrer

Provides the referrer where the user came from. It is read from `document.referrer`. The value is empty for direct visitors.

Example value: `https://www.google.com`

### sourceUrl

Parses and provides the source URL of the current document to the URL.

The source URL is extracted from the proxy URL if the document is being served from a *known* proxy. Otherwise the original document URL is returned. For instance, if the URL is served via the proxy `https://cdn.ampproject.org` from the URL `https://cdn.ampproject.org/c/s/example.com/page.html`, then `SOURCE_URL` would return `https://example.com/page.html`. If the URL is served directly from `https://example.com/page.html`, `https://example.com/page.html` will be returned.

### sourceHost

Parses and provides the source URL's host. See the description of `sourceUrl` for more details.

Example value: `example.com`

### sourcePath

Parses and provides the source URL's path part. See the description of `sourceUrl` for more details.

Example value: `%2Fpage.html`

### title

Provides the title of the current document.

Example value: `The New York Times - Breaking News, World News...`

### viewer
Provides an identifier for the viewer that contains the AMP document. Empty string if the document is loaded directly in a browser or if the id is not found.

Example value: `www.google.com`

## Device and Browser

### availableScreenHeight

Provides the screen height in pixels available for the page rendering. Note that this can be slightly more or less than the actual viewport height due to various browser quirks.

Example value: `1480`

### availableScreenWidth

Provides the screen width in pixels available for the page rendering. Note that this can be slightly more or less than the actual viewport height due to various browser quirks.

Example value: `2500`

### browserLanguage

Provides a string representing the preferred language of the user, usually the language of the browser UI.

Example value: `en-us`

### screenColorDepth

Provides the screen color depth provided by the browser.

Example value: `24`

### screenHeight

Provides the screen height in pixels. The value is retrieved from `window.screen.height`.

Example value: `1600`

### screenWidth

Provides the screen width in pixels. The value is retrieved from `window.screen.width`.

Example value: `2560`

### scrollHeight

Provides the total height of the page in pixels.

Example value: `400`

### scrollLeft

Provides the number of pixels that the user has scrolled from left.

Example value: `100`

### scrollTop

Provides the number of pixels that the user has scrolled from top.

Example value: `0`

### scrollWidth

Provides the total width of the page in pixels.

Example value: `600`

### timezone

Provides the user's time-zone offset from UTC, in minutes.

Example value: `480` for [Pacific Standard Time](https://en.wikipedia.org/wiki/Pacific_Time_Zone).

## Performance

Provides various navigation timing metrics. Since the metrics below are only available after the respective events occur, the dispatching of request will get delayed till either a) a value for the event is found or b) the event results in a `0` value.

### contentLoadTime

Provides the time the page takes to fire the `DOMContentLoaded` event from the time the previous page is unloaded. The value is in milliseconds.

Example value: `40`

### domainLookupTime

Provides the time it took to perform the DNS lookup for the current page. The value is in milliseconds.

Example value: `1`

### domInteractiveTime

Provides the time the page to become interactive from the time the previous page
is unloaded. The value is in milliseconds.

Example value: `40`

### navRedirectCount

Provides the number of redirects since the last non-redirect navigation.
See W3C Navigation Timing API [PerformanceNavigation interface](https://www.w3.org/TR/navigation-timing/#performancenavigation) for more information.

Example value: `0`

### navTiming

Provides access to metrics from the browser's PerformanceTiming interface.
If both `startEvent` and `endEvent` arguments are passed, the value will be the time elapsed between the two events.
Otherwise, if only `startEvent` argument is passed, the value will be the timestamp of the given event.
The value is in milliseconds.

See the W3C Navigation Timing API [PerformanceTiming interface](https://www.w3.org/TR/navigation-timing/#sec-navigation-timing-interface) documentation for attribute names and definitions.

Please see below for the required and optional arguments you may pass into `navTiming` like a function. Spaces between arguments and values are not allowed.

**arguments**:

  - `startEvent` (Required) - Name of the PerformanceTiming interface attribute corresponding to the start event.

  - `endEvent` (Optional) - Optional name of the PerformanceTiming interface attribute corresponding to the end event. If `endEvent` is passed, the value will be the time difference between the start and end events.


Example 1: `${navTiming(navigationStart)}` results in value: `1451606400000`

Example 2: `${navTiming(navigationStart,responseStart)}` results in value: `10`

### navType

Provides the type of the last non-redirect navigation in the current browsing context.
See W3C Navigation Timing API [PerformanceNavigation interface](https://www.w3.org/TR/navigation-timing/#performancenavigation) for more information.

Example value: `1`

### pageDownloadTime

Provides the time between receiving the first and the last byte of response. The value is in milliseconds.

Example value: `100`

### pageLoadTime

Provides the time taken to load the whole page. The value is calculated from the time `unload` event handler on previous page ends to the time `load` event for the current page is fired. If there is no previous page, the duration starts from the time the user agent is ready to fetch the document using an HTTP request. The value is in milliseconds.

Example value: `220`

### redirectTime

Provides the time taken to complete all the redirects before the request for the current page is made. The value is in milliseconds.

Example value: `0`

### serverResponseTime

Provides the time taken by the server to start sending the response after it starts receiving the request. The value is in milliseconds.

Example value: `10`

### tcpConnectTime

Provides the time it took for HTTP connection to be setup. The duration includes connection handshake time and SOCKS authentication. The value is in milliseconds.

Example value `10`

## Interaction

### horizontalScrollBoundary

Provides the horizontal scroll boundary that triggered a scroll event. This var is
only available in a `trigger` of type `scroll`. The value of the boundary may be
rounded based on the precision supported by the extension. For example, a
boundary with value `1` and precision of `5` will result in value of var to be 0.

### totalEngagedTime

Provides the total time (in seconds) the user has been engaged with the page since the page
first became visible in the viewport. Total engaged time will be 0 until the
page first becomes visible.

Example value: `36`

### verticalScrollBoundary

Provides the vertical scroll boundary that triggered a scroll event. This var is
only available in a `trigger` of type `scroll`. The value of the boundary may be
rounded based on the precision supported by the extension. For example, a
boundary with value `1` and precision of `5` will result in value of var to be 0.


## Miscellaneous

### ampVersion

Provides a string with the AMP release version.

Example value: `1460655576651`

### clientId

Provides a per document-source-origin (the origin of the website where you publish your AMP doc) and user identifier. The client id will be the same for the same user if they visit again within one year.

Please see below the required and optional arguments you may pass into `clientId` like a function. Spaces between arguments and values are not allowed.

**arguments**:

  - `cid-scope` (Required) - Name of the fallback cookie when the document is loaded by the user directly.
  - `amp-user-notification-id` (Optional) - Optionally make the clientId substitution dependent on the dismissal of a user notification shown to the visitor of the page.
    This is the same as using the [data-consent-notification-id](./amp-analytics.md) attribute
    and you may choose one or the other.

Example usage: `${clientId(foo)}`

Example value: `U6XEpUs3yaeQyR2DKATQH1pTZ6kg140fvuLbtl5nynbUWtIodJxP5TEIYBic4qcV`

### extraUrlParams

Provides all the params defined in extraUrlParams block of the config as a variable. If this variable is used, the parameters are not appended to the end of the URL.

Example usage: `${extraUrlParams}`

Example value: 'foo=bar&baz=something'

### pageViewId

Provides a string that is intended to be random and likely to be unique per URL, user and day.

Example value: `978`

### queryParam

Pulls a value from the query string

Please see below the required and optional arguments you may pass into `queryParam` like a function. Spaces between arguments and values are not allowed.

**arguments**

 - `query string param` (Required) - The query string param for which you want the value
 - `default value` (Optional) - If the query string param is not available use this default instead

Example usage: `${queryParam(foo)}` - if foo is available its associated value will be returned, if not an empty string will be returned
               `${queryParam(foo,bar)}` - if foo is available its associated value will be returned, if not bar will be returned

### random

Provides a random value every time a request is being constructed.

Example value: `0.12345632345`

### requestCount

Provides the number of requests sent out from a particular `amp-analytics` tag. This value can be used to reconstruct the sequence in which requests were sent from a tag. The value starts from 1 and increases monotonically. Note that there may be a gap in requestCount numbers if the request sending fails due to network issues.

Example value: `6`

### timestamp

Provides the number of seconds that have elapsed since 1970. (Epoch time)

Example value: `1452710304312`


### backgroundState

When used, will provide the current backgrounded state of the page.

Possible values are 0, the page is visible, or 1, the page is backgrounded.

## Visibility Variables

### backgrounded

A binary variable with possible values of 1 and 0 to indicate that the page/tab was sent to background at any point before the hit was sent. 1 indicates that the page was backgrounded while 0 indicates that the page has always been in the foreground. This variable does not count prerender as a backgrounded state.

### backgroundedAtStart

A binary variable with possible values of 1 and 0 to indicate that the page/tab was backgrounded at the time when the page was loaded. 1 indicates that the page was loaded in the background while 0 indicates otherwise. This variable does not count prerender as a backgrounded state.

### maxContinuousVisibleTime

Provides the maximum amount of continuous time an element has met the `visibilitySpec` conditions at the time this ping is sent. Note that a ping with a continuousTimeMin=1000 and totalTimeMin=5000 that is visible for 1000ms, then not visible, then visible
for 2000ms, then not, then visible for 1000ms, then not, then visible for 1020ms
will report 2000 for this number as that is the max continuous visible time,
even if it is not the current continuous visible time (1020 in this example).

### elementHeight

Provides the height of the element specified by `visibilitySpec`.

### elementWidth

Provides the width of the element specified by `visibilitySpec`.

### elementX

Provides the X coordinate of the left edge of the element specified by `visibilitySpec`.

### elementY

Provides the Y coordinate of the top edge of the element specified by `visibilitySpec`.

### firstSeenTime

Provides the time when at least 1px of the element is on the screen for the first time since the trigger is registered by `amp-analytics`.

### firstVisibleTime

Provides the time when the element met visibility conditions for the first time since
the trigger is registered by `amp-analytics`.

### lastSeenTime

Provides the time when at least 1px of the element is on the screen for the last time since javascript load.

### lastVisibleTime

Provides the time when the element met visibility conditions for the last time since
javascript load.

### loadTimeVisibility

Provides the percentage of element visible in the viewport at load time. This variable assumes that the page is scrolled to top.

### maxVisiblePercentage

Provides the maximum visible percentage over the time that `visibilitySpec` conditions were met. For example, a ping where the element was 100%, then off the page, then 100% will report this value as 100. A ping with visiblePercentageMax=50 undergoing the same transitions would report somewhere between 0 and 50 since any time when the element was 100% on the page would not be counted.

### minVisiblePercentage

Provides the minimum visible percentage over the time that visibilitySpec conditions were met. For example, a ping where the element was 100%, then off the page, then 100% will report this value as 0. A ping with visiblePercentageMin=50 condition undergoing the same transitions would report somewhere between 50 and 100 since any time when the element was 0% to 50% on the page would not be counted.

### totalTime

Provides the total time from the time page was loaded to the time a ping was sent out. The value is calculated from the time document became interactive.

### totalVisibleTime

Provides the total time for which the element has met the visiblitySpec conditions at time this ping is sent.



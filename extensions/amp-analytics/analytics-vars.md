# <a name="amp-analytics"></a> Variables supported in `amp-analytics`

Use the format `${varName}` in a request string for a page or platform-defined variable. `amp-analytics` tag will replace the template with its actual value at the time of construction of the analytics request.

Since the request that is constructed is sent over HTTP, the request needs to be encoded. To achieve this, the `var` values are url-encoded using [`encodeUrlComponent`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) before being inserted into the request.

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

When the same `var` is defined in multiple locations, the value is picked in the order remote config > triggers > top level > platform. Thus, if the remote config defined `clientId` as `12332312` in the example above, the values of various vars will be as follows:

| var | Value | Defined by |
|-------|-------|------------|
|canonicalUrl | http://example.com/path/to/the/page | Platform |
|title | My homepage | Trigger |
|account | ABC123 | Top level config |
|clientId | 12332312 | Remote config |

The remainder of this doc lists and describes the variables supported in `amp-analytics`.

## Page and content

### ampdocHost

Provides the AMP document's URL host.

Example value: `example.com`

### ampdocUrl

Provides the AMP document's URL. The URL contains the scheme, domain, port and full path. It does not contain the fragment part of the URL.

Example value: `http://example.com:8000/examples.build/analytics.amp.max.html`

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

### pageDownloadTime

Provides the time between receiving the first and the last byte of response. The value is in milliseconds.

Example value: `100`

### pageLoadTime

Provides the time taken to load the whole page. The value is calculated from the time `unload` event handler on previous page ends to the time `load` event for the current page is fired. If there is no previous page, the duration starts from the time the user agent is ready to fetch the document using an HTTP requesti. The value is in milliseconds.

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

## Miscellaneous

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

### pageViewId

Provides a string that is intended to be random and likely to be unique per URL, user and day.

Example value: `978`

### random

Provides a random value every time a request is being constructed.

Example value: `0.12345632345`

### timestamp

Provides the number of seconds that have elapsed since 1970. (Epoch time)

Example value: `1452710304312`

### queryParam

Pulls a value from the query string

Please see below the required and optional arguments you may pass into `queryParam` like a function. Spaces between arguments and values are not allowed.

**arguments**

 - `query string param` (Required) - The query string param for which you want the value
 - `default value` (Optional) - If the query string param is not available use this default instead

Example usage: `${queryParam(foo)}` - if foo is available its associated value will be returned, if not an empty string will be returned
               `${queryParam(foo,bar)}` - if foo is available its associated value will be returned, if not bar will be returned

## requestCount

Provides the number of requests sent out from a particular `amp-analytics` tag. This value can be used to reconstruct the sequence in which requests were sent from a tag. The value starts from 1 and increases monotonically. Note that there may be a gap in requestCount numbers if the request sending fails due to network issues.

Example value: `6`


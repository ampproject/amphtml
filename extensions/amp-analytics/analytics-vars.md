# <a name="amp-analytics"></a> Variables supported in `amp-analytics`

Use the format `${varName}` in a request string for a page or platform-defined variable. `amp-analytics` tag will replace the template with its actual value at the time of construction of the analytics request.

Since the request that is constructed is sent over HTTP, the request needs to be encoded. To achieve this, the `var` values are url-encoded using [`encodeUrlComponent`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) before being inserted into the request.

Vars can be defined by the platform, in the config at the top level, inside the triggers or in a remote config, as shown in this example.

```html
<amp-analytics config="http://example.com/config.json">
<script type="application/json">
{
  "requests": {
    "pageview": "https://example.com/analytics?url=${canonicalUrl}&title=${title}&acct=${account}&clientId=${clientId}",
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

## random

Provides a random value every time a request is being constructed.

Example value: `0.12345632345`

## canonicalUrl

Provides the canonical URL of the current document.

Example value: `http%3A%2F%2Fexample.com%3A8000%2Fanalytics.html`

## canonicalHost

Provides the canonical URL's host.

Example value: `example.com`

## canonicalPath

Provides the canonical URL's path part.

Example value: `%2Fanalytics.html`

## clientId

Provides a per document-source-origin (the origin of the website where you publish your AMP doc) and user identifier. The client id will be the same for the same user if they visit again within one year.

Please see below the required and optional arguments you may pass into `clientId` like a function. Spaces between arguments and values are not allowed.

**arguments**:

  - `cid-scope` (Required) - Name of the fallback cookie when the document is loaded by the user directly.
  - `amp-user-notification-id` (Optional) - Optionally make the clientId substitution dependent on the dismissal of a user notification shown to the visitor of the page.

Example usage: `${clientId(foo)}`

Example value: `U6XEpUs3yaeQyR2DKATQH1pTZ6kg140fvuLbtl5nynbUWtIodJxP5TEIYBic4qcV`


## documentReferrer

Provides the referrer where the user came from. It is read from `document.referrer`. The value is empty for direct visitors.

Example value: `https://www.google.com`

## title

Provides the title of the current document.

Example value: `The New York Times - Breaking News, World News...`

## ampdocUrl

Provides the AMP document's URL. The URL contains the scheme, domain, port and full path. It does not contain the fragment part of the URL.

Example value: `http://example.com:8000/examples.build/analytics.amp.max.html`

## ampdocHost

Provides the AMP document's URL host.

Example value: `example.com`

## pageViewId

Provides a string that is intended to be random and likely to be unique per URL, user and day.

Example value: `978`

## timestamp

Provides the number of seconds that have elapsed since 1970. (Epoch time)

Example value: `1452710304312`

## timezone

Provides the user's time-zone offset from UTC, in minutes.

Example value: `480` for [Pacific Standard Time](https://en.wikipedia.org/wiki/Pacific_Time_Zone).

## scrollTop

Provides the number of pixels that the user has scrolled from top.

Example value: `0`

## scrollLeft

Provides the number of pixels that the user has scrolled from left.

Example value: `100`

## scrollHeight

Provides the total size of the page in pixels.

Example value: `400`

## screenHeight

Provides the screen height in pixels. The value is retrieved from `window.screen.height`.

Example value: `1600`

## screenWidth

Provides the screen width in pixels. The value is retrieved from `window.screen.width`.

Example value: `2560`


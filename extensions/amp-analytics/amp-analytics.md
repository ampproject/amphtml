---
$category@: ads-analytics
formats:
  - websites
  - stories
  - ads
teaser:
  text: Captures analytics data from an AMP document.
---

# amp-analytics

## Usage

The `<amp-analytics>` component specifies a JSON configuration object that
contains the details for what to measure and where to send analytics data. It can report to an in-house or integrated third-party solution.

<a name="configuration-object"></a>The configuration object for
`<amp-analytics>` uses the following format:

```javascript
{
  "requests": {
    "request-name": request-value,
    ...
  },
  "vars": {
    "var-name": var-value,
    ...
  },
  "extraUrlParams": {
    "extraurlparam-name": extraurlparam-value,
    ...
  },
  "triggers": {
    "trigger-name": trigger-object,
    ...
  },
  "transport": {
    "beacon": *boolean*,
    "xhrpost": *boolean*,
    "image": *boolean*,
  }
}
```

The configuration data may be specified inline or fetched remotely by specifying
a URL in the `config` attribute. Additionally, built-in configuration for
popular analytics vendors can be selected by using the `type` attribute.

If configuration data from more than one of these sources is used, the
configuration objects (`vars`, `requests`, and `triggers`) will be merged
together such that:

1. Remote configuration takes precedence over inline configuration and
1. Inline configuration takes precedence over vendor configuration.

Before you start using AMP analytics on your site, you need to decide whether
you will use third-party analytics tools to analyze user engagement, or your own
in-house solution.

[tip type="read-on"]
Learn all about AMP analytics in the
[Configure Analytics](https://amp.dev/documentation/guides-and-tutorials/optimize-measure/configure-analytics/)
guide.
[/tip]

### Send data to an analytics vendor

The `amp-analytics` component is specifically designed to measure once and report to many. If
you are already working with one or more analytics vendors, check the list of
[Analytics Vendors](https://amp.dev/documentation/guides-and-tutorials/optimize-and-measure/configure-analytics/analytics-vendors/#vendors)
to see if they’ve integrated their solution with AMP.

#### Integrated analytics vendors

For integrated AMP analytics vendors:

1.  In the `<amp-analytics>` tag, add the `type` attribute and set its value to
    the specified
    [vendor](https://amp.dev/documentation/guides-and-tutorials/optimize-and-measure/configure-analytics/analytics-vendors/#vendors).
1.  Determine what data you want to capture and track, and specify those details
    in the configuration data. See the vendor's documentation for instructions
    on how to capture analytics data.

In the following example, analytics data is sent to Nielsen, a third-party
analytics provider that has integrated with AMP. Details for configuring
analytics data for Nielsen can be found in the
[Nielsen](https://engineeringportal.nielsen.com/docs/DCR_Static_Google_AMP_Cloud_API)
documentation.

```html
<amp-analytics type="nielsen">
  <script type="application/json">
    {
      "vars": {
        "apid": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
        "apv": "1.0",
        "apn": "My AMP Website",
        "section": "Entertainment",
        "segA": "Music",
        "segB": "News",
        "segC": "Google AMP"
      }
    }
  </script>
</amp-analytics>
```

#### Non-integrated analytics vendors

If the analytics vendor hasn’t integrated with AMP, reach out to the vendor to
ask for their support. We also encourage you to let us know by
[filing an issue](../../docs/contributing.md#report-a-bug)
requesting that the vendor be added. See also
[Integrating your analytics tools in AMP HTML](integrating-analytics.md).
Alternatively, work with your vendor to send the data to their specified URL.
Learn more in the [Send data in-house](#send-data-in-house) section below.

### Send data in-house <a name="send-data-in-house"></a>

If you have your own in-house solution for measuring user engagement, the only
thing you will need to integrate AMP analytics with that solution is a URL. This
is where you will send the data. You can also send data to various URLs. For
example, you can send page view data to one URL, and social engagement data to
another URL.

[tip type="note"]
If your in-house solution involves working with an analytics vendor that hasn't
integrated with AMP, work with the vendor to determine what configuration
information is required.
[/tip]

To send data to a specific URL:

1.  Determine what data you want to capture and track, and
    [specify those details in the configuration data](#configuration-object).
1.  In the [`requests`](#requests) configuration object, specify the type of
    request to track (e.g., pageview, specific triggered events) and the url(s)
    of where you want to send the tracking data to.

[tip type="note"]
When processing AMP URLs in the referrer header of analytics requests, strip out
or ignore the `usqp` parameter. This parameter is used by Google to trigger
experiments for the Google AMP Cache.
[/tip]

The example below tracks page views. Every time a page is visible,
the trigger event fires, and sends the pageview data to a defined URL along with
a random ID.

```html
<amp-analytics>
  <script type="application/json">
    {
      "requests": {
        "pageview": "https://foo.com/pixel?RANDOM"
      },
      "triggers": {
        "trackPageview": {
          "on": "visible",
          "request": "pageview"
        }
      }
    }
  </script>
</amp-analytics>
```

[tip type="note"]
For some common tracking use cases (e.g., page views, page clicks, scrolling,
etc.) see
[Analytics: Use Cases](https://amp.dev/documentation/guides-and-tutorials/optimize-measure/configure-analytics/use_cases).
[/tip]

### Load remote configuration

To load a remote configuration, in the `<amp-analytics>` element, specify the
`config` attribute and the URL for the configuration data. The URL specified
should use the HTTPS scheme. The URL may include
[AMP URL vars](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-var-substitutions.md).
To access cookies, see the [`data-credentials`](#data-credentials) attribute.
The response must follow the
[AMP CORS security guidelines](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-cors-requests.md).

In this example, we specify the `config` attribute to load the configuration
data from the specified URL.

```html
<amp-analytics
  config="https://example.com/analytics.account.config.json"
></amp-analytics>
```

### Dynamically rewrite a configuration

The configuration rewriter feature is designed to allow analytics providers to
dynamically rewrite a provided configuration. This is similar to the remote
configuration feature but additionally includes any user-provided configuration
in the request made to the sever. This currently can only be enabled by an
analytics vendor.

An analytics vendor specifies a configRewriter property with a server url.

```js
export const VENDOR_ANALYTICS_CONFIG = {
    ...
    'configRewriter': {
      'url': 'https://www.vendor.com/amp-config-rewriter',
    },
    ...
}
```

AMP sends a request containing the inlined configuration, merged with
the provided remote configuration, to the `configRewriter` endpoint given by the
vendor. The vendor uses this data server side to construction and return a new
rewritten configuration.

AMP then merges all the provided configurations to determine the final
configuration in order of highest to lowest precedence:

1. Rewritten Configuration
1. Inlined Configuration
1. Vendor defined configuration

### Enable Predfined Variable Groups

Variable Groups is a feature that allows analytics providers to group a
predefined set of variables that can easily be enabled. These
variables will then be resolved and sent along to the specified `configRewriter`
endpoint.

Analytics providers need to create a new `varGroups` object inside of the
`configRewriter` configuration to enable this feature. Publishers can then
include any named analytic provider created `varGroups` they wish to enable in
their analytics configuration. All of the variables supported by
[AMP HTML Substitutions Guide](../../docs/spec/amp-var-substitutions.md)
can be used. _Important note:_ the `${varName}` variants will not work.

For example we may have a vendor whose configuration looks like this:

```js
// This is predefined by vendor.
export const VENDOR_ANALYTICS_CONFIG = {
    ...
    'configRewriter': {
      'url': 'https://www.vendor.com/amp-config-rewriter',
      'varGroups' : {
        'group1': {
          'referrer': 'DOCUMENT_REFERRER',
          'source': 'SOURCE_URL',
        'group2': {
          'title': 'TITLE',
        },
      },
    },
    ...
}
```

You can specify which variable groups are enabled by including `{enabled: true}`
for the specified `varGroups` within the provider's `<amp-analytics>`
configuration. `enabled` is a reserved keyword, and can not be used as a
variable name.

In the example below, both `group1` and `group2` have been enabled. Any groups
that have not been specifically enabled will be ignored. The runtime will then
resolve all of these enabled variables, and merge them into a single
`configRewriter.vars` object that will be sent to the configuration rewriter
url.

```html
/* Included on publisher page */
<amp-analytics type="myVendor" id="myVendor" data-credentials="include">
  <script type="application/json">
    {
      "configRewriter": {
        "varGroups": {
          "group1": {
            "enabled": true
          },
          "group2": {
            "enabled": true
          }
        }
      }
    }
  </script>
</amp-analytics>
```

In this example the request body would look something like this:

```json
/* Sent to configuration rewriter server. */
"configRewriter": {
  "vars": {
    "referrer": "https://www.example.com",
    "source": "https://www.amp.dev",
    "title": "Cool Amp Tips"
  }
}
```

### Configuration data objects

#### Requests <a name="requests"></a>

The `requests` configuration object specifies the URLs used to transmit data to
an analytics platform as well as batching or reporting behavior of the request.
The `request-name` specifies what request should be sent in response to a
particular event (e.g., `pageview`, `event`, etc.) . The `request-value`
contains an https URL, the value may include placeholder tokens that can
reference other requests or variables. The `request-value` can also be an object
that contains optional request configs.

The properties for defining a request with an object are:

-   `baseUrl`: Defines the url of the request (required).
-   `reportWindow`: An optional property to specify the time (in seconds) to
    stop reporting requests. The trigger with `important: true` overrides the
    maximum report window constraint.
-   [`origin`](#request-origin): An optional property to specify the origin for
    requests

In this example, all requests are valid.

```json
"requests": {
  "base": "https://example.com/analytics?a=${account}&u=${canonicalUrl}&t=${title}",
  "pageview": {
    "baseUrl": "${base}&type=pageview"
  },
  "event": {
    "baseUrl": "${base}&type=event&eventId=${eventId}",
    "batchInterval": 5,
    "reportWindow" : 30
  }
}
```

Some analytics providers have an already-provided configuration, which you use
via the `type` attribute. If you are using an analytics provider, you may not
need to include requests information. See your vendor documentation to find out
if requests need to be configured, and how.

##### Define a request origin <a name="request-origin"></a>

The top-level `requestOrigin` property accepts an absolute URL and defines the
origin for requests. If `requestOrigin` is declared, the origin will be
extracted from the value and it will be prepended to `baseUrl`. `requestOrigin`
accepts and supports variables substitution. Variables will not be encoded in
`requestOrigin`.

```json
"requestOrigin": "${example}/ignore_query",
"requests": {
  "base": "/analytics?a=${account}",
  "pageview": {
    "baseUrl": "${base}&type=pageview"
  },
  "event": {
    "baseUrl": "${base}&type=event",
  }
},
"vars": {
  "example": "https://example.com"
}
```

In this example, outgoing requests will be
`https://example.com/analytics?a=${account}&type=pageview` for `pageview`
requests and `https://example.com/analytics?a=${account}&type=event` for `event`
requests. Notice that the `requestOrigin` value is not encoded and that only the
origin is added to `baseUrl`.

Request objects can also have an `origin` property that will override this
top-level `requestOrigin` property.

```json
"requestOrigin": "https://example.com",
"requests": {
  "pageview": {
    "origin": "https://newexample.com",
    "baseUrl": "/analytics?type=pageview"
  }
}
```

In this example, the outgoing request will be
`https://newexample.com/analytics?type=pageview` for the `pageview` request.

##### Schedule batch requests

To reduce the number of request pings, you can specify batching behaviors in the
request configuration. Any [`extraUrlParams`](#extra-url-parameters) from
`triggers` that use the same request are appended to the `baseUrl` of the
request.

The batching property is `batchInterval`. This property specifies the time interval (in seconds) to flush request pings in the batching queue. `batchInterval` can be a number or an array of numbers (the minimum time interval 200ms). The request will respect every value in the array, and then repe the last interval value (or the single value) when it reaches the end the array.

For example, the following config sends out a single request ping every 2
seconds, with one sample request ping looking like
`https://example.com/analytics?rc=1&rc=2`.

```json
"requests": {
  "timer": {
    "baseUrl": "https://example.com/analytics?",
    "batchInterval": 2
  }
}
"triggers": {
  "timer": {
    "on": "timer",
    "request" : "timer",
    "timerSpec": {
      "interval": 1
    },
    "extraUrlParams": {
      "rc": "${requestCount}"
    }
  }
}
```

The following config sends out the first request ping after 1 second and then
sends out a request every 3 seconds. The first request ping looks like
`https://example.com/analytics?rc=1`, the second request ping looks like
`https://example.com/analytics?rc=2&rc=3&rc=4`.

```json
"requests": {
  "timer": {
    "baseUrl": "https://example.com/analytics?",
    "batchInterval": [1, 3]
  }
}
"triggers": {
  "timer": {
    "on": "timer",
    "request" : "timer",
    "timerSpec": {
      "interval": 1
    },
    "extraUrlParams": {
      "rc": "${requestCount}"
    }
  }
}
```

#### Vars

The `amp-analytics` component defines many basic variables that can be used in
requests. A list of all such variables is available in the
[`amp-analytics` Variables Guide](analytics-vars.md).
In addition, all of the variables supported by
[AMP HTML Substitutions Guide](../../docs/spec/amp-var-substitutions.md)
are also supported.

Variables are resolved asynchronously and can delay the request until they are
fulfilled. For example, some metrics such as Cumulative Layout Shift and
Largest Contentful Paint are calculated after the page is hidden. For First
Input Delay, it is resolved after the user interacts with the page. For this
reason these metrics might not be suitable for use with all triggers (for
example, on timer or visible).

The `vars` configuration object can be used to define new key-value pairs or
override existing variables that can be referenced in `request` values. New
variables are commonly used to specify publisher specific information. Arrays
can be used to specify a list of values that should be URL encoded separately
while preserving the comma delimiter. Substituting built-in and custom variables
within arrays is supported, except when the variable expands into another array.

```json
"vars": {
  "account": "ABC123",
  "countryCode": "tr",
  "tags": ["Swift,Jonathan", "Gulliver's Travels", "${account}"]
}
```

#### Register event triggers <a name="triggers"></a>

The `triggers` configuration object describes when an analytics request should
be sent. The `triggers` attribute contains a key-value pair of trigger-name and
trigger-configuration. A trigger-name can be any string comprised of
alphanumeric characters (a-zA-Z0-9). Triggers from a configuration with lower
precedence are overridden by triggers with the same names from a configuration
with higher precedence.

For details on how to set up triggers, see
[Available triggers](#available-triggers).

As an example, the following configuration can be used to sample 50% of the
requests based on random input or at 1% based on client id.

```json
"triggers": {
  "sampledOnRandom": {
    "on": "visible",
    "request": "request",
    "sampleSpec": {
      "sampleOn": "${random}",
      "threshold": 50
    }
  },
  "sampledOnClientId": {
    "on": "visible",
    "request": "request",
    "sampleSpec": {
      "sampleOn": "${clientId(cookieName)}",
      "threshold": 1
    }
  }
}
```

###### Element selector <a name="element-selector"></a>

Some triggers such as `click`, `video`, and `visible` allow specifying a single element or
a collection of elements using the selector properties. Different triggers can
apply different limitations and interpretations on selected elements, such as
whether a selector applies to all matched elements or the first one, or which
elements can be matched: all or only AMP elements. See the documentation for
each relevant trigger for more details.

The selector properties are:

-   `selector` This property is used to find an element or a collection of
    elements using CSS/DOM query. The semantics of how the element is matched
    can be changed using `selectionMethod`. The value of this property can be
    one of:

    -   a valid CSS selector, e.g. `#ad1` or `amp-ad`.
    -   `:root` - a special selector that matches the document root.

-   `selectionMethod` When specified, this property can have one of two values:
    `scope` or `closest`. `scope` allows selection of element within the parent
    element of `amp-analytics` tag. `closest` searches for the closest ancestor
    of the `amp-analytics` tag that satisfies the given selector. The default
    value is `scope`.

##### Selector Values <a name="selector-values"></a>

As mentioned above, for `click`, `video`, and `visible` triggers it is possible to specify a single CSS selector or a collection of CSS selectors for the selector value.

If a single string CSS selector is specified, an element that maps to that selector will be extracted - even if the CSS selector maps to more than one element.

In the case where a single configuration applies to multiple elements, instead of creating separate configuration for each, it can be simplified by specifying all the selectors at once.
To do so, specify an array of selectors that are comma separated and individually enclosed in quote marks.

```javascript
"triggers": {
  "video-pause": {
    "on": "video-pause",
    "request": "event",
    "selector": ["#Video-1", "#Video-2"]
  },
}
```

##### Available triggers <a name="available-triggers"></a>

The `on` trigger provides an event to listen for. Valid values are
`render-start`, `ini-load`, `blur`, `change`, `click`, `scroll`, `timer`, `visible`, `hidden`,
`user-error`, `access-*`, and
`video-*`.

Other available triggers include `request`, `vars`, `important`, `selector`,
`selectionMethod`, `scrollSpec`, `timerSpec`, `sampleSpec`, and `videoSpec`.

###### `"on": "render-start"` trigger

AMP elements that embed other documents in iframes (e.g., ads) may report a
render start event (`"on": "render-start"`). This event is typically emitted as
soon as it's possible to confirm that rendering of the embedded document has
started. Consult the documentation of a particular AMP element to see whether it
emits this event.

The trigger for the embed element must include a [`selector`](#element-selector)
that points to the embedding element:

```json
"triggers": {
  "renderStart": {
    "on": "render-start",
    "request": "request",
    "selector": "#embed1"
  }
}
```

The render start event is also emitted by the document itself and can be
configured as:

```json
"triggers": {
  "renderStart": {
    "on": "render-start",
    "request": "request"
  }
}
```

###### `"on": "ini-load"` trigger <a name="ini-load"></a>

The initial load event (`"on": "ini-load"`) is triggered when the initial
contents of an AMP element or an AMP document have been loaded.

The "initial load" is defined in relationship to the container and its initial
size. More specifically:

-   For a document: all elements in the first viewport.
-   For an embed element: all content elements in the embed document that are
    positioned within the initial size of the embed element.
-   For a simple AMP element (e.g. `amp-img`): the resources itself, such as an
    image or a video.

The trigger for an embed or an AMP element must include a
[`selector`](#element-selector) that points to the element:

```json
"triggers": {
  "iniLoad": {
    "on": "ini-load",
    "request": "request",
    "selector": "#embed1"
  }
}
```

The initial load event is also emitted by the document itself and can be
configured as:

```json
"triggers": {
  "iniLoad": {
    "on": "ini-load",
    "request": "request"
  }
}
```

###### `"on": "blur"` trigger

The on blur is part of the browser events that are supported by the Browser Event Tracker.
Use the blur trigger (`"on": "blur"`) to fire a request when a specified
element is no longer in focus. Use [`selector`](#element-selector) to control which
elements will cause this request to fire. The trigger will fire for all elements
matched by the specified selector. The selector can either be a single CSS query selector or an array of selectors.

```json
"triggers": {
  "inputFieldBlurred": {
    "on": "blur",
    "request": "event",
    "selector": ["inputField-A", "inputField-B"]
    "vars": {
      "eventId": "${id}"
    }
  }
}
```

###### `"on": "change"` trigger

Similar to the blur trigger, the change trigger is part of the Browser Events.
Use the change trigger (`"on": "change"`) to fire a request when a specified
element undergoes a state change. The state change may vary for different elements. Use [`selector`](#element-selector) to control which elements will cause this request to fire. The selector can either be a single CSS query selector or an array of selectors. The trigger will fire for all elements matched by the specified selector.

```json
"triggers": {
  "selectChange": {
    "on": "change",
    "request": "event",
    "selector":["dropdownA", "dropdownB"],
    "vars": {
      "eventId": "${id}"
    }
  }
}
```

###### `"on": "click"` trigger

Use the click trigger (`"on": "click"`) to fire a request when a specified
element is clicked. Use [`selector`](#element-selector) to control which
elements will cause this request to fire. The trigger will fire for all elements
matched by the specified selector.

```json
"vars": {
  "id1": "#socialButtonId",
  "id2": ".shareButtonClass"
},
"triggers": {
  "anchorClicks": {
    "on": "click",
    "selector": "a, ${id1}, ${id2}",
    "request": "event",
    "vars": {
      "eventId": 128
    }
  }
}
```

In addition to the variables provided as part of triggers you can also specify
additional / overrides for
[variables as data attribute](analytics-vars.md#variables-as-data-attribute).
If used, these data attributes have to be part of element specified as the
`selector`.

###### `"on": "scroll"` trigger <a name="scroll"></a>

Use the scroll trigger (`"on": "scroll"`) to fire a request under certain
conditions when the page is scrolled. This trigger provides
[special vars](analytics-vars.md#interaction)
that indicate the boundaries that triggered a request to be sent. Use
`scrollSpec` to control when this will fire.

`scrollSpec` is an object that contains the properties:

-   `horizontalBoundaries`, `verticalBoundaries` (At least one of these is
    required for a scroll event to fire.)

    These should be number arrays containing the percentage boundaries on which a scroll event is fired.

    (To keep the page performant, these percentages are rounded to multiples of `5`.)

-   `useInitialPageSize` (optional, default `false`)

    If set to `true`, scroll position is calculated based on
    the initial sizing of the page, ignoring its new dimensions when
    resized.

[tip type="note"]
When using `<amp-analytics>` with infinitely scrolling experiences such as
`<amp-next-page>` and `<amp-list>`, you might find it helpful to use
`useInitialPageSize` in order to have scroll triggers report on the initial
height of the pages (before `<amp-next-page>` or `<amp-list>` elements get
added). Note that this will also ignore the size changes caused by other
extensions (such as expanding embedded content) so some scroll events might fire
prematurely instead.
[/tip]

For instance, in the following code snippet, the scroll event will be fired when
page is scrolled vertically by 25%, 50% and 90%. Additionally, the event will
also fire when the page is horizontally scrolled to 90% of scroll width.

```json
"triggers": {
  "scrollPings": {
    "on": "scroll",
    "scrollSpec": {
      "verticalBoundaries": [25, 50, 90],
      "horizontalBoundaries": [90]
    },
    "request": "event"
  }
}
```

###### `"on": "timer"` trigger <a name="timer"></a>

Use the timer trigger (`"on": "timer"`) to fire a request on a regular time
interval. Use `timerSpec` to control when this will fire.

`timerSpec` Specification for triggers of type `timer`. Unless a `startSpec` is specified, the timer will trigger immediately (by default, can be unset) and then at a specified interval thereafter.

-   `interval` Length of the timer interval, in seconds.
-   `maxTimerLength` Maximum duration for which the timer will fire, in
    seconds. An additional request will be triggered when the
    `maxTimerLength` has been reached. The default is 2 hours. When a
    `stopSpec` is present, but no `maxTimerLength` is specified, the default
    will be infinity.
-   `immediate` trigger timer immediately or not. Boolean, defaults to true

[tip type="note"]
The timer trigger will continue to send out requests regardless of document state (inactive or hidden), until the `maxTimerLength` has been reached (default to 2 hours if `stopSpec` doesn't exist and inifity if it does) or `stopSpec` has been met. In the case of no `stopSpec`, the `maxTimerLength` will default to infinity.
[/tip]

See the following example:

```json
"triggers": {
  "pageTimer": {
    "on": "timer",
    "timerSpec": {
      "interval": 10,
      "maxTimerLength": 600
    },
    "request": "pagetime"
  }
}
```

To configure a timer which times user events use:

-   `startSpec` Specification for triggering when a timer starts. Use the value of
    `on` and `selector` to track specific events. A config with a `startSpec`
    but no `stopSpec` will only stop after `maxTimerLength` has been reached.
-   `stopSpec` Specification for triggering when a timer stops. A config with a
    `stopSpec` but no `startSpec` will start immediately but only stop on the
    specified event.

See the spec on [triggers](#triggers) for details on creating nested timer
triggers. Note that using a timer trigger to start or stop a timer is not
allowed. The example below demonstrates how to configure a trigger based on a documents `hidden` and `visible` events and a trigger based on a videos `play` and `pause` events.

```json
"triggers": {
  "startOnVisibleStopOnHiddenTimer": {
    "on": "timer",
    "timerSpec": {
      "interval": 5,
      "startSpec": {
        "on": "visible",
        "selector": ":root"
      },
      "stopSpec": {
        "on": "hidden",
        "selector": ":root"
      }
    },
    "request": "timerRequest"
  },
  "videoPlayTimer": {
    "on": "timer",
    "timerSpec": {
      "interval": 5,
      "startSpec": {
        "on": "video-play",
        "selector": "amp-video"
      },
      "stopSpec": {
        "on": "video-pause",
        "selector": "amp-video"
      }
    },
    "request": "videoRequest"
  }
}
```

###### `"on": "visible"` trigger

Use the page visibility trigger (`"on": "visible"`) to fire a request when the
page becomes visible. The firing of this trigger can be configured using
`visibilitySpec`.

```json
"triggers": {
  "defaultPageview": {
    "on": "visible",
    "request": "pageview"
  }
}
```

The element visibility trigger can be configured for any AMP or non-AMP element or a
document root using [`selector`](#element-selector). The trigger will fire when
the specified element matches the visibility parameters that can be customized
using the `visibilitySpec`.

```json
"triggers": {
  "defaultPageview": {
    "on": "visible",
    "request": "elementview",
    "selector": "#ad1",
    "visibilitySpec": {/* optional visibility spec */}
  }
}
```

The element visibility trigger waits for the signal specified by the `waitFor`
property in `visibilitySpec` before tracking element visibility. If `waitFor` is
not specified, it waits for element's [`ini-load`](#ini-load) signal. See
`waitFor` docs for more details. If `reportWhen` is specified, the trigger waits
for that signal before sending the event. This is useful, for example, in
sending analytics events when the page is closed.

`selector` can either be a single selector string (shown above) or an array of selector strings (shown below). If `selector` is a string, then it will be used to only specify a single element or a document root. If `selector` is an array of strings, each selector will specify all the elements in the doc that share the selector and have the `data-vars-*` attribute (useful for identifying elements).

```json
"triggers": {
  "defaultPageview": {
    "on": "visible",
    "request": "adViewWithId",
    "selector": ["amp-ad", "#myImg.red"],
    "visibilitySpec": {/* optional visibility spec */}
  }
}
```

###### `"on": "hidden"` trigger

Use the hidden trigger (`"on": "hidden"`) to fire a request when the page
becomes hidden.

```json
"triggers": {
  "defaultPageview": {
    "on": "hidden",
    "request": "pagehide"
  }
}
```

A [`visibilitySpec`](#visibility-spec) can be included so that a request is only
fired if the visibility duration conditions are satisfied.

```json
"triggers": {
  "defaultPageview": {
    "on": "hidden",
    "request": "pagehide",
    "visibilitySpec": {
      "selector": "#anim-id",
      "visiblePercentageMin": 20,
      "totalTimeMin": 3000
    }
  }
}
```

The above configuration translates to:

> When page becomes hidden, fire a request if the element `#anim-id` has been
> visible (more than 20% area in viewport) for more than 3s in total.

###### `"on": "user-error"` trigger

The user error event (`"on": "user-error"`) is triggered when an error occurs
that is attributable to the author of the page or to software that is used in
publishing the page. This includes, but not limited to, misconfiguration of an
AMP component, misconfigured ads, or failed assertions. User errors are also
reported in the developer console.

```json
"triggers": {
  "userError": {
    "on": "user-error",
    "request": "error"
  }
}
```

[tip type="note"]
There is a
[known issue](https://github.com/ampproject/amphtml/issues/10891) that it still
reports errors from A4A iframe embeds, which are irrelevant to the page.
[/tip]

###### `"on":` Component-specific triggers

-   Access triggers: AMP Access system issues numerous events for different
    states in the access flow. For details on access triggers
    (`"on": "access-*"`), see
    [AMP Access and Analytics](../amp-access/amp-access-analytics.md).
-   Video analytics triggers: Video analytics provides several triggers
    (`"on": "video-*"`) that publishers can use to track different events
    occurring during a video's lifecycle. More details are available in
    [AMP Video Analytics](amp-video-analytics.md).
-   Browser Event Trackers: AMP provides the ability to track a custom set of browser events. The set of browser events that are supported are listed in the allow-list.
    Currently, events (`"on": "change"`) and (`"on": "blur"`) are supported.

###### `request` trigger

Name of the request to send (as specified in the `requests` section).

###### `vars` trigger (optional)

An object containing key-value pairs used to override `vars` defined in the top
level config, or to specify `vars` unique to this trigger.

###### `important` trigger (optional)

Can be specified to work with requests that support the batching behavior or the
report window. Setting `important` to `true` can help to flush batched request
queue with some certain triggers. In this case, it's possible to reduce the
request pings number without losing important trigger events. Setting
`important` to `true` can also override the request's `reportWindow` value to
send out important request pings regardless.

###### `selector` and `selectionMethod` trigger (optional)

Can be specified for some triggers, such as `click` and `visible`. See
[Element selector](#element-selector) for details.

###### `scrollSpec` trigger

This configuration is used in conjunction with the `scroll` trigger. See
[`scroll`](#scroll) for details. Required when `on` is set to `scroll`.

###### `timerSpec` trigger

This configuration is used in conjunction with the `timer` trigger. See
[`timer`](#timer) for details. Required when `on` is set to `timer`.

###### `sampleSpec` trigger (optional)

This object is used to define how the requests can be sampled before they are
sent. This setting allows sampling based on random input or other platform
supported `vars`. The object contains configuration to specify an input that is
used to generate a hash and a threshold that the hash must meet.

-   `sampleOn`: This string template is expanded by filling in the platform
    variables and then hashed to generate a number for the purposes of the
    sampling logic described under `threshold` below.
-   `threshold`: This configuration is used to filter out requests that do not
    meet particular criteria. For a request to go through to the analytics
    vendor, the following logic should be true `HASH(sampleOn) < threshold`.

###### `videoSpec` trigger

This configuration is used in conjunction with the
[`video-*`](https://github.com/ampproject/amphtml/blob/main/extensions/amp-analytics/amp-video-analytics.md)
triggers. Used when `on` is set to `video-*`.

#### Transport

The `transport` configuration object specifies how to send a request. The value
is an object with fields that indicate which transport methods are acceptable.

-   `beacon` Indicates
    [`navigator.sendBeacon`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)
    can be used to transmit the request. This will send a POST request with
    credentials. The request will be sent with an empty body unless `useBody` is
    true. See [ Extra URL parameters](#extra-url-parameters) for more
    information about `useBody`.
-   `xhrpost` Indicates `XMLHttpRequest` can be used to transmit the request.
    This will send a POST request with credentials. The request will be sent
    with an empty body unless `useBody` is true. See
    [Extra URL parameters](#extra-url-parameters) for more information about
    `useBody`.
-   `image` Indicates the request can be sent by generating an `Image` tag. This
    will send a GET request. To suppress console warnings due to empty responses
    or request failures, set `"image": {"suppressWarnings": true}`.
-   `iframe` Indicates that an `iframe` can be used to transmit the request. See
    [`iframe`](#iframe) for details.

If more than one of the above transport methods are enabled, the precedence is
`iframe` > `beacon` > `xhrpost` > `image`. Only one transport method will be
used, and it will be the highest precedence one that is permitted and available.
If the client's user agent does not support a method, the next highest
precedence method enabled will be used. By default, all four methods above are
enabled.

In the example below, an `iframe` URL is not specified, and `beacon` and
`xhrpost` are set to `false`, so they will not be used even though they have
higher precedence than `image`. `image` would be set `true` by default, but it
is explicitly declared here. If the client's user agent supports the `image`
method, then it will be used; otherwise, no request would be sent.

```json
"transport": {
  "beacon": false,
  "xhrpost": false,
  "image": true
}
```

To learn more, see
[this example that implements iframe transport client API](../../examples/analytics-iframe-transport-remote-frame.html)
and [this example page that incorporates that iframe](../../examples/analytics-iframe-transport.amp.html).
The example loads a [fake ad](../amp-ad-network-fake-impl/0.1/data/fake_amp_ad_with_iframe_transport.html),
which contains the `amp-analytics` tag. Note that the fake ad content includes
some extra configuration instructions that must be followed.

##### iframe

MRC-accredited vendors may utilize a fourth transport mechanism, "iframe
transport", by adding a URL string to iframe-transport-vendors.js. This
indicates that an iframe should be created, with its `src` attribute set to this
URL, and requests will be sent to that iframe via `window.postMessage()`. In
this case, requests need not be full-fledged URLs. `iframe` may only be
specified in `iframe-transport-vendors.js`, not inline within the
`amp-analytics` tag, nor via remote configuration. Furthermore, the vendor frame
may send a response, to be used by `amp-ad-exit`. See
[analytics-iframe-transport-remote-frame.html](../../examples/analytics-iframe-transport-remote-frame.html)
and [fake_amp_ad_with_iframe_transport.html](../amp-ad-network-fake-impl/0.1/data/fake_amp_ad_with_iframe_transport.html):
the former file sends a response JSON object of `{'collected-data': 'abc'}`, and
the latter file uses that object to substitute `'abc'` for `'bar_'` in
`finalUrl`.

##### Referrer policy

Referrer policy can be specified as `referrerPolicy` field in the `transport`
config. Currently only `no-referrer` is supported. Referrer policy is only
available for `image` transport. If `referrerPolicy: no-referrer` is specified,
the `beacon` & `xhrpost` transports are overridden to `false`.

```json
"transport": {
  "beacon": false,
  "xhrpost": false,
  "image": true,
  "referrerPolicy": "no-referrer"
}
```

#### Extra URL parameters <a name="extra-url-parameters"></a>

The `extraUrlParams` configuration object specifies additional parameters to be
included in the request. By default, extra URL params are appended to the query
string of a request URL via the usual `"&foo=baz"` convention.

Here's an example that would append `&a=1&b=2&c=3` to a request:

```json
"extraUrlParams": {
  "a": "1",
  "b": "2",
  "c": "3"
}
```

`extraUrlParams` may be sent via the request body instead of the URL if
`useBody` is enabled and the request is sent via the `beacon` or `xhrpost`
transport methods. In this case, the parameters are not URL encoded or
flattened.

The `useBody` configuration option indicates whether or not to include
`extraUrlParams` in the POST request body instead of in the URL as URL-encoded
query parameters.

`useBody` is only available for the `beacon` and `xhrpost` transport methods. If
`useBody` is true and used in conjunction with either of these transport
methods, `extraUrlParams` are sent in the POST request body. Otherwise, the
request is sent with an empty body and the `extraUrlParams` are included as URL
parameters.

With `useBody`, you can include nested objects in `extraUrlParams`. However, if
the request falls back to other transport options that don't support `useBody`
(e.g. `image`), then those nested objects will be stringified into the URL as
`[object Object]`.

```json
"transport": {
  "beacon": true,
  "xhrpost": true,
  "useBody": true,
  "image": false
}
```

##### Map replacement strings in parameters

The `extraUrlParamsReplaceMap` attribute specifies a map of keys and values that
act as parameters to `String.replace()` to pre-process keys in the
`extraUrlParams` configuration. For example, if an `extraUrlParams`
configuration defines `"page.title": "The title of my page"` and the
`extraUrlParamsReplaceMap` defines `"page.": "_p_"`, then
`&_p_title=The%20title%20of%20my%20page%20` will be appended to the request.

`extraUrlParamsReplaceMap` is not required to use `extraUrlParams`. If
`extraUrlParamsReplaceMap` is not defined, then no string substitution will
happens and the strings defined in `extraUrlParams` are used as-is.

If `useBody` is enabled and the request is sent via the `beacon` or `xhrpost`
transport methods, `extraUrlParamsReplaceMap` string substitution will only be
performed on the top-level keys in `extraUrlParams`.

### Customize the `visible` and `hidden` triggers with `visibilitySpec` <a name="visibility-spec"></a>

The `visibilitySpec` is a set of conditions and properties that can be applied
to `visible` or `hidden` triggers to change when they fire. If multiple
properties are specified, they must all be true in order for a request to fire.
Configuration properties supported in `visibilitySpec` are:

-   `waitFor`: This property indicates that the visibility trigger should wait
    for a certain signal before tracking visibility. The supported values are
    `none`, `ini-load`, and `render-start`. If `waitFor` is undefined, it is
    defaulted to [`ini-load`](#ini-load) (for AMP elements) when selector is specified, or to `none` otherwise. When tracking non-AMP elements, only `none` is supported, which is its default value. Tracking non-AMP elements may not always work as intended. For example, tracking a `<div>` element that contains an `<amp-iframe>`, may not accurately wait for the iframe to load before sending the signal out.

-   `reportWhen`: This property indicates that the visibility trigger should
    wait for a certain signal before sending the trigger. The only supported
    value is `documentExit`. `reportWhen` and `repeat` may not both be used in the
    same `visibilitySpec`. Note that when `reportWhen` is specified, the report
    will be sent at the time of the signal even if visibility requirements are
    not met at that time or have not been met previously. Any relevant variables
    (`totalVisibleTime`, etc.) will be populated according to the visibility
    requirements in this `visibilitySpec`.

-   `continuousTimeMin` and `continuousTimeMax`: These properties indicate that
    a request should be fired when (any part of) an element has been within the
    viewport for a continuous amount of time that is between the minimum and
    maximum specified times. The times are expressed in milliseconds. The
    `continuousTimeMin` is defaulted to `0` when not specified.

-   `totalTimeMin` and `totalTimeMax`: These properties indicate that a request
    should be fired when (any part of) an element has been within the viewport
    for a total amount of time that is between the minimum and maximum specified
    times. The times are expressed in milliseconds. The `totalTimeMin` is
    defaulted to `0` when not specified.

-   `visiblePercentageMin` and `visiblePercentageMax`: These properties indicate
    that a request should be fired when the proportion of an element that is
    visible within the viewport is between the minimum and maximum specified
    percentages. Percentage values between 0 and 100 are valid. Note that the
    upper bound (`visiblePercentageMax`) is inclusive. The lower bound
    (`visiblePercentageMin`) is exclusive, unless both bounds are set to 0 or
    both are set to 100. If both bounds are set to 0, then the trigger fires
    when the element is not visible. If both bounds are set to 100, the trigger
    fires when the element is fully visible. When these properties are defined
    along with other timing related properties, only the time when these
    properties are met are counted. The default values for
    `visiblePercentageMin` and `visiblePercentageMax` are `0` and `100`,
    respectively.

-   `repeat`: If this property is set to `true`, the trigger fires each time
    that the `visibilitySpec` conditions are met. In the following example, if
    the element is scrolled to 51% in view, then 49%, then 51% again, the
    trigger fires twice. However, if `repeat` was `false`, the trigger fires
    once. The default value of `repeat` is `false`. `reportWhen` and `repeat`
    may not both be used in the same visibilitySpec.

```json
"visibilitySpec": {
  "visiblePercentageMin": 50,
  "repeat": true
}
```

`visiblePercentageThresholds` may be used as a shorthand for creating multiple
`visibilitySpec` instances that differ only in `visiblePercentageMin` and
`visiblePercentageMax`. For example the following are equivalent:

```json
// Two triggers with visibilitySpecs that only differ in visiblePercentageMin and visiblePercentageMax:
"triggers": {
  "pageView_30_to_40": {
    "on": "visible",
    "request": "pageview",
    "selector": "#ad1",
    "visibilitySpec": {
      "visiblePercentageMin": 30,
      "visiblePercentageMax": 40,
      "continuousTimeMin": 1000
    }
  },
  "pageView_40_to_50": {
    "on": "visible",
    "request": "pageview",
    "selector": "#ad1",
    "visibilitySpec": {
      "visiblePercentageMin": 40,
      "visiblePercentageMax": 50,
      "continuousTimeMin": 1000
    }
  }
}

// A single trigger equivalent to both of the above:
"triggers": {
  "pageView": {
    "on": "visible",
    "request": "pageview",
    "selector": "#ad1",
    "visibilitySpec": {
      "visiblePercentageThresholds": [[30, 40], [40, 50]],
      "continuousTimeMin": 1000
    }
  }
}
```

In addition to the conditions above, `visibilitySpec` also enables certain
variables which are documented
[here](analytics-vars.md#visibility-variables).

```json
"triggers": {
  "defaultPageview": {
    "on": "visible",
    "request": "pageview",
    "selector": "#ad1",
    "visibilitySpec": {
      "waitFor": "ini-load",
      "reportWhen": "documentExit",
      "visiblePercentageMin": 20,
      "totalTimeMin": 500,
      "continuousTimeMin": 200
    }
  }
}
```

In addition to the variables provided as part of triggers you can also specify
additional / overrides for
[variables as data attribute](analytics-vars.md#variables-as-data-attribute).
If used, these data attributes have to be part of element specified as the
[`selector`](#element-selector).

### Linkers

The `linkers` feature is used to enable cross domain ID syncing. `amp-analytics`
will use a
[configuration object](linker-id-forwarding.md#format)
to create a "linker string" which will be appended to the specified outgoing
links on the page as URL param. When a user clicks on one of these links, the
destination page will read the linker string from the URL param to perform ID
syncing. This is typically used to join user sessions across an AMP proxy domain
and publisher domain.

Details on setting up your linker configuration are outlined in
[Linker ID Forwarding](linker-id-forwarding.md).

If you need to ingest this parameter, information on how this parameter is
created is illustrated in
[Linker ID Receiving](linker-id-receiving.md).

### Cookies

The `cookies` feature supports writing cookies to the origin domain by
extracting [`QUERY_PARAM`](../../docs/spec/amp-var-substitutions.md#query-parameter)
and [`LINKER_PARAM`](linker-id-receiving.md#linker-param)
information from the document url. It can be used along with `linkers` features
to perform ID syncing from the AMP proxied domain to AMP pages on a publisher's
domain.

Details on setting up the `cookies` configuration can be found at
[Receiving Linker Params on AMP Pages](linker-id-receiving.md#receiving-linker-params-on-amp-pages).

## Attributes

### `type`

Specifies the type of vendor. For details, see the list of
[Analytics vendors](https://amp.dev/documentation/guides-and-tutorials/optimize-measure/configure-analytics/analytics-vendors).

```html
<amp-analytics
  type="googleanalytics"
  config="https://example.com/analytics.account.config.json"
></amp-analytics>
```

### `config` (optional)

This is an optional attribute that can be used to load a configuration from a
specified remote URL. The URL specified should use the HTTPS scheme. See also
the `data-include-credentials` attribute below. The URL may include
[AMP URL vars](../../docs/spec/amp-var-substitutions.md).
The response must follow the
[AMP CORS security guidelines](../../docs/spec/amp-cors-requests.md).

```html
<amp-analytics
  config="https://example.com/analytics.config.json"
></amp-analytics>
```

### `data-credentials` (optional) <a name="data-credentials"></a>

If set to `include`, this turns on the ability to read and write cookies on the
request specified via the `config` attribute. This is an optional attribute.

### `data-consent-notification-id` (optional)

If provided, the page will not process analytics requests until an
[amp-user-notification](../amp-user-notification/amp-user-notification.md)
with the given HTML element id is confirmed (accepted) by the user. This is an
optional attribute.

## Analytics

AMP component developers can implement collection of data using AMP analytics.
For more information, please refer to
[Implementing analytics for AMP components](amp-components-analytics.md).

### Google Analytics 4 and AMP

For information on how to set up Google Analytics 4 with amp-analytics see
[amp-analytics dev guide](https://developers.google.com/analytics/devguides/collection/amp-analytics)
and [gtagjs guide](https://developers.google.com/tag-platform/gtagjs/amp?technology=gtagjs)

## Validation

See [`amp-analytics` rules](validator-amp-analytics.protoascii)
in the AMP validator specification.

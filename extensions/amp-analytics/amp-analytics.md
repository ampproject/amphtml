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

# <a name="amp-analytics"></a>`amp-analytics`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Capture analytics data from an AMP document.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/analytics.amp.html">analytics.amp.html</a></td>
  </tr>
</table>

The following lists validation errors specific to the `amp-analytics` tag
(see also `amp-analytics` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/validator/validator.protoascii):

<!---
Check for valid HTTPS URL coming soon;
this table will need to change too.
-->

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#tag-required-by-another-tag-is-missing">TAG_REQUIRED_BY_MISSING</a></td>
    <td>Error thrown when required <code>amp-analytics</code> extension <code>.js</code> script tag is missing or incorrect.</td>
  </tr>
</table>

## <a name="behavior"></a>Behavior

The `<amp-analytics>` element is used to measure activity on an AMP document. The details concerning what is measured and how
that data is sent to an analytics server is specified in a JSON configuration object.

For example, the following `<amp-analytics>` element is configured to send a request to `https://example.com/analytics`
when the document is first loaded, and each time an `<a>` tag is clicked:

```html
<amp-analytics>
<script type="application/json">
{
  "requests": {
    "pageview": "https://example.com/analytics?url=${canonicalUrl}&title=${title}&acct=${account}",
    "event": "https://example.com/analytics?eid=${eventId}&elab=${eventLabel}&acct=${account}"
  },
  "vars": {
    "account": "ABC123"
  },
  "triggers": {
    "trackPageview": {
      "on": "visible",
      "request": "pageview"
    },
    "trackAnchorClicks": {
      "on": "click",
      "selector": "a",
      "request": "event",
      "vars": {
        "eventId": "42",
        "eventLabel": "clicked on a link"
      }
    }
  }
}
</script>
</amp-analytics>
```

## <a name="attributes"></a>Attributes

  - `type` This optional attribute can be specified to use one of the built-in analytics providers. Currently supported values for type are:
    - `chartbeat`: Adds support for Chartbeat. More details for adding Chartbeat support can be found at [support.chartbeat.com](http://support.chartbeat.com/docs/).
    - `comscore`: Supports comScore Unified Digital Measurement™ pageview analytics. Requires defining *var* `c2` with comScore-provided *c2 id*.
    - `googleanalytics`: Adds support for Google Analytics. More details for adding Google Analytics support can be found at [developers.google.com](https://developers.google.com/analytics/devguides/collection/amp-analytics/).

    ```
    <amp-analytics type="XYZ"> ... </amp-analytics>
    ```

  - `config` This attribute can be used to load a configuration from a specified remote URL. The URL specified here should use https scheme. See also `data-include-credentials` attribute below.

    ```
    <amp-analytics config="https://example.com/analytics.config.json"></amp-analytics>
    ```
    The response must follow the [AMP CORS security guidelines](../../spec/amp-cors-requests.md).
  - `data-credentials` Optional. If set to `include` turns on the ability to read and write cookies on the request specified via `config` above.
  - `data-consent-notification-id` Optional attribute. If provided will stop
    processing the analytics request until a [amp-user-notification](../../extensions/amp-user-notification/amp-user-notification.md) with
    the given HTML-id was confirmed by the user.

## Configuration

Configuration may be specified inline (as shown in the example above) or fetched remotely by specifying a URL in the
`config` attribute. Additionally, built-in configuration for popular analytics vendors can be selected using
the `type` attribute.

If configuration data from more than one of these sources is used, the configuration objects(vars, requests and triggers) will
be merged together such that remote configuration takes precedence over inline configuration, and inline configuration
takes precendence over vendor configuration.

The `<amp-analytics>` configuration object uses the following format:

```javascript
{
  "requests": {
    request-name: request-value,
    ...
  },
  "vars": {
    var-name: var-value,
    ...
  },
  "triggers": {
    trigger-name: trigger-object,
    ...
  },
  "transport": {
    "beacon": *boolean*,
    "xhrpost": *boolean*,
    "image": *boolean*
  }
}
```
### Requests
The `requests` attribute specifies the URLs used to transmit data to an analytics platform. The `request-name` is used
in the trigger configuration to specify what request should be sent in response to a pariticular event. The `request-value`
is an https URL. These values may include placeholder tokens that can reference other requests or variables.

```javascript
"requests": {
  "base": "https://example.com/analytics?a=${account}&u=${canonicalUrl}&t=${title}",
  "pageview": "${base}&type=pageview",
  "event": "${base}&type=event&eventId=${eventId}"
}
```

### Vars
`amp-analytics` defines many basic variables that can be used in requests. A list of all such variables is available [here](./analytics-vars.md). In addition, all the variables supported by [AMP HTML URL Variable Substitutions](../../spec/amp-var-substitutions.md) are also supported.

The `vars` attribute in the configuration can be used to define new key-value pairs or override existing variables that can be referenced in `request` values. New variables are commonly used to specify publisher specific information.

```javascript
"vars": {
  "account": "ABC123",
  "countryCode": "tr"
}
```

### Triggers
The `triggers` attribute describes when an analytics request should be sent. It contains a key-value pair of trigger-name and
 trigger-configuration. Trigger name can be any string comprised of alphanumeric characters (a-zA-Z0-9). Triggers from a
 configuration with lower precedence are overridden by triggers with the same names from a configuration with higher precedence.

  - `on` (required) The event to listener for. Valid values are `visible`,`click`, and `timer`.
  - `request` (required) Name of the request to send (as specified in the `requests` section).
  - `vars` An object containing key-value pairs used to override `vars` defined in the top level config, or to specify
    vars unique to this trigger.

Following configuration only applies to specific values of `on`.
  - `selector` A CSS selector used to refine which elements should be tracked. Use value `*` to track all elements. Used in triggers where `on` is set to `click`.
  - `scrollSpec` An object used when `on` is set to `scroll`. This object can contain `verticalBoundaries` and `horizontalBoundaries`. At least one of the two property is required for scroll event to fire. The values for both the properties should be arrays of numbers containing the boundaries on which a scroll event is generated. For instance, in the following code snippet, the scroll event will be fired when page is scrolled vertically by 25%, 50% and 90%. Additionally, the event will also fire when the page is horizontally scrolled to 90% of scroll width.
  - `timerSpec` Specification for triggers of type `timer`. The timer will trigger immediately and then at a specified interval thereafter.
    - `interval` Length of the timer interval, in seconds.
    - `maxTimerLength` Maximum duration for which the timer will fire, in seconds.

```javascript
"triggers": {
  "defaultPageview": {
    "on": "visible",
    "request": "pageview"
  },
  "anchorClicks": {
    "on": "click",
    "selector": "a",
    "request": "event",
    "vars": {
      "eventId": 128
    }
  },
  "pageTimer": {
    "on": "timer",
    "timerSpec": {
      "interval": 10,
      "maxTimerLength": 600
    },
    "request": "pagetime"
  },
  "scrollPings": {
    "on": "scroll",
    "scrollSpec": {
      "verticalBoundaries": [25, 50, 90],
      "horizontalBoundaries": [90]
    }
  }
}
```

### Transport
The `transport` attribute specifies how to send a request. The value is an object with fields that
indicate which transport methods are acceptable.

  - `beacon` Indicates [`navigator.sendBeacon`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)
     can be used to transmit the request. This will send a POST request, with credentials, and an empty body.
  - `xhrpost` Indicates `XMLHttpRequest` can be used to transmit the request. This will send a POST
     request, with credentials, and an empty body.
  - `image` Indicates the request can be sent by generating an `Image` tag. This will send a GET request.

If more than one of the above transport methods are enabled, the precedence is `beacon` > `xhrpost` > `image`.
If the client's user agent does not support a method, the next highest precedence method enabled will be used.
By default, all three methods above are enabled.


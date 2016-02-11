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

### <a name="amp-analytics"></a>`amp-analytics`

Capture analytics data from an AMP document.

#### <a name="behavior"></a>Behavior

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

#### <a name="attributes"></a>Attributes

  - `type` Optional attribute. This attribute can be used to inherit configuration from one of the built-in analytics providers. Currently supported values for type are:
    - `chartbeat`: Adds support for Chartbeat. More details for adding Chartbeat support can be found at [support.chartbeat.com](http://support.chartbeat.com/docs/).
    - `comscore`: Adds support for comScore Unified Digital Measurement™ pageview analytics. Requires defining *var* `c2` with comScore-provided *c2 id*.
    - `googleanalytics`: Adds support for Google Analytics. More details for adding Google Analytics support can be found at [developers.google.com](https://developers.google.com/analytics/devguides/collection/amp-analytics/).
    - `parsely`: Adds support for Parsely. Configuration details can be found at [parsely.com/docs](http://parsely.com/docs/integration/tracking/google-amp.html).


    Here's an example of usage of `type` for a provider called XYZ:
    ```
    <amp-analytics type="XYZ"> ... </amp-analytics>
    ```

  - `config` Optional attribute. This attribute can be used to load a configuration from a specified remote URL. The URL specified here should use https scheme. See also `data-include-credentials` attribute below.

    ```
    <amp-analytics config="https://example.com/analytics.config.json"></amp-analytics>
    ```
    The response must follow the [AMP CORS security guidelines](../../spec/amp-cors-requests.md).
  - `data-credentials` Optional attribute. If set to `include` turns on the ability to read and write cookies on the request specified via `config` above.
  - `data-consent-notification-id` Optional attribute. If provided, the page will not process analytics requests until an [amp-user-notification](../../extensions/amp-user-notification/amp-user-notification.md) with
    the given HTML element id is confirmed (accepted) by the user.

#### Configuration

Configuration may be specified inline (as shown in the example above) or fetched remotely by specifying a URL in the
`config` attribute. Additionally, built-in configuration for popular analytics vendors can be selected using
the `type` attribute.

If configuration data from more than one of these sources is used, the configuration objects (vars, requests and triggers) will
be merged together such that **(i) remote configuration takes precedence over inline configuration and (ii) inline configuration
takes precendence over vendor configuration**.

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
##### Requests
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

##### Vars
`amp-analytics` defines many basic variables that can be used in requests. A list of all such variables is available in the  [`amp-analytics` Variables Guide](./analytics-vars.md). In addition, all of the variables supported by [AMP HTML Substitutions Guide](../../spec/amp-var-substitutions.md) are also supported.

The `vars` attribute in the configuration can be used to define new key-value pairs or override existing variables that can be referenced in `request` values. New variables are commonly used to specify publisher specific information.

```javascript
"vars": {
  "account": "ABC123",
  "countryCode": "tr"
}
```

##### Triggers
The `triggers` attribute describes when an analytics request should be sent. It contains a key-value pair of trigger-name and
 trigger-configuration. Trigger name can be any string comprised of alphanumeric characters (a-zA-Z0-9). Triggers from a
 configuration with lower precedence are overridden by triggers with the same names from a configuration with higher precedence.

  - `on` (required) The event to listener for. Valid values are `click`, `scroll`, `timer`, and `visible`.
  - `request` (required) Name of the request to send (as specified in the `requests` section).
  - `vars` An object containing key-value pairs used to override `vars` defined in the top level config, or to specify
    vars unique to this trigger.
  - `selector` (required when `on` is set to `click`) This configuration is used on conjunction with the `click` trigger. Please see below for details.
  - `scrollSpec` (required when `on` is set to `scroll`) This configuration is used on conjunction with the `scroll` trigger. Please see below for details.
  - `timerSpec` (required when `on` is set to `timer`) This configuration is used on conjunction with the `timer` trigger. Please see below for details.

###### Page visible trigger (`"on": "visible"`)
Use this configuration to fire a request when the page becomes visible. No further configuration is required.

```javascript
"triggers": {
  "defaultPageview": {
    "on": "visible",
    "request": "pageview"
  }
}
```

###### Click trigger (`"on": "click"`)
Use this configuration to fire a request when a specified element is clicked. Use `selector` to control which elements will cause this request to fire:
  - `selector` A CSS selector used to refine which elements should be tracked. Use value `*` to track all elements.

    ```javascript
    "triggers": {
      "anchorClicks": {
        "on": "click",
        "selector": "a",
        "request": "event",
        "vars": {
          "eventId": 128
        }
      }
    }
    ```

###### Scroll trigger (`"on": "scroll"`)
Use this configuration to fire a request under certain conditions when the page is scrolled. Use `scrollSpec` to control when this will fire:
  - `scrollSpec` This object can contain `verticalBoundaries` and `horizontalBoundaries`. At least one of the two properties is required for a scroll event to fire. The values for both of the properties should be arrays of numbers containing the boundaries on which a scroll event is generated. For instance, in the following code snippet, the scroll event will be fired when page is scrolled vertically by 25%, 50% and 90%. Additionally, the event will also fire when the page is horizontally scrolled to 90% of scroll width.
 

    ```javascript
    "triggers": {
      "scrollPings": {
        "on": "scroll",
        "scrollSpec": {
          "verticalBoundaries": [25, 50, 90],
          "horizontalBoundaries": [90]
        }
      }
    }
    ```

###### Timer trigger (`"on": "timer"`)
Use this configuration to fire a request on a regular time interval. Use `timerSpec` to control when this will fire:
  - `timerSpec` Specification for triggers of type `timer`. The timer will trigger immediately and then at a specified interval thereafter.
    - `interval` Length of the timer interval, in seconds.
    - `maxTimerLength` Maximum duration for which the timer will fire, in seconds.
    
    ```javascript
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

##### Transport
The `transport` attribute specifies how to send a request. The value is an object with fields that
indicate which transport methods are acceptable.

  - `beacon` Indicates [`navigator.sendBeacon`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)
     can be used to transmit the request. This will send a POST request, with credentials, and an empty body.
  - `xhrpost` Indicates `XMLHttpRequest` can be used to transmit the request. This will send a POST
     request, with credentials, and an empty body.
  - `image` Indicates the request can be sent by generating an `Image` tag. This will send a GET request.

If more than one of the above transport methods are enabled, the precedence is `beacon` > `xhrpost` > `image`. Only one transport method will be used, and it will be the highest precedence one that is permitted and available. If the client's user agent does not support a method, the next highest precedence method enabled will be used. By default, all three methods above are enabled.

In the example below, `beacon` and `xhrpost` are set to `false`, so they will not be used even though they have higher precedence than `image`. `image` would be set `true` by default, but it is explicitly declared here. If the client's user agent supports the `image` method, then it will be used; otherwise, no request would be sent.

```javascript
'transport': {
  'beacon': false,
  'xhrpost': false,
  'image': true
}
```

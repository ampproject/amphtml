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

**This extension is still a work in progress. Details below can change.**

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
    "track pageview": {
      "on": "visible",
      "request": "pageview"
    },
    "track anchor clicks": {
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

  - `type` This optional attribute can be specified to use one of the built-in analytics providers. Currently supported values for type are:
    - `googleanalytics`: Adds support for Google Analytics. More details for adding Google Analytics support can be found at [developers.google.com](https://developers.google.com/analytics/devguides/collection/amphtml/).

    ```
    <amp-analytics type="XYZ"> ... </amp-analytics>
    ```

  - `config` This attribute can be used to load a configuration from a specified remote URL. The URL specified here should use https scheme.

    ```
    <amp-analytics config="https://example.com/analytics.config.json"></amp-analytics>
    ```

#### Configuration

Configuration may be specified inline (as shown in the example above) or fetched remotely by specifying a URL in the
`config` attribute. Additionally, built-in configuration for popular analytics vendors can be selected using
the `type` attribute.

If configuration data from more than one of these sources is used, the configuration objects will
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
###### Requests
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

###### Vars
`amp-analytics` defines many basic variables that can be used in requests. A list of all such variables is available [here](./analytics-vars.md). In addition, all the variables supported by [AMP HTML URL Variable Substitutions](../../spec/amp-var-substitutions.md) are also supported. 

The `vars` attribute in the configuration can be used to define new key-value pairs or override existing variables that can be referenced in `request` values. New variables are commonly used to specify publisher specific information.

```javascript
"vars": {
  "account": "ABC123",
  "countryCode": "tr"
}
```

###### Triggers
The `triggers` attribute describes when an analytics request should be sent.

  - `on` (required) The event to listener for. Valid values are `visible` and `click`.
  - `selector` A CSS selector used to refine which elements should be tracked. Use value `*` to track all elements.
  - `request` (required) Name of the request to send (as specified in the `requests` section).
  - `vars` An object containing key-value pairs used to override `vars` defined in the top level config, or to specify
    vars unique to this trigger.

```javascript
"triggers": {
  "default pageview": {
    "on": "visible",
    "request": "pageview"
  },
  "anchor clicks": {
    "on": "click",
    "selector": "a",
    "request": "event",
    "vars": {
      "eventId": 128
    }
  }
}
```

###### Transport
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


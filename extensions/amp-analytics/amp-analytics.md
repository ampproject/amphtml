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
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Capture analytics data from an AMP document.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-analytics/">Annotated code example for amp-analytics</a></td>
  </tr>
</table>

[TOC]

## Overview

You can use the `<amp-analytics>` element to measure activity on an AMP document. In the `<amp-analytics>` element, you specify a JSON configuration object that contains the details for what to measure and where to send the analytics data. You can send the tracking data to an analytics vendor and/or to a URL. There are many analytics vendors that are pre-configured for `<amp-analytics>`, see [Analytics Vendors](https://www.ampproject.org/docs/guides/analytics/analytics-vendors.html) for details.

**Example**

In the following example, we send analytics data to `https://example.com/analytics` when the AMP document is first loaded, and each time an `<a>` tag is clicked:

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

**Example**

In the following example, we send pageview data to an analytics vendor, Google Analytics:

```html
<<<<<<< HEAD
<amp-analytics type="XYZ"> ... </amp-analytics>
```
### Acquia Lift

Type attribute value: `acquialift`

Adds support for Acquia Lift. The `decisionApiUrl`, `accountId` and `siteId` must be specified. More information about Acquia Lift can be found at [https://docs.acquia.com/lift](https://docs.acquia.com/lift).

Please consult the documentation from your vendor, which may be linked in the sections below. You can also look at the [vendors.js](https://github.com/ampproject/amphtml/blob/master/extensions/amp-analytics/0.1/vendors.js) file for further information on each vendor's configuration.

### Adobe Analytics

Type attribute value: `adobeanalytics`

Adds support for Adobe Analytics. More details for adding Adobe Analytics support can be found at [marketing.adobe.com](https://marketing.adobe.com/resources/help/en_US/sc/implement/accelerated-mobile-pages.html).

### AFS Analytics

Type attribute value: `afsanalytics`

Adds support for AFS Analytics. Additionally, the `websiteid` and `server` variables must be specified. More details for adding AFS Analytics support can be found at [afsanalytics.com](https://www.afsanalytics.com/articles/developers/).

### AT Internet

Type attribute value: `atinternet`

Adds support for AT Internet. More details for adding AT Internet support can be found at [developers.atinternet-solutions.com](http://developers.atinternet-solutions.com/javascript-en/advanced-features-javascript-en/accelerated-mobile-pages-amp-javascript-en/).

### Burt

Type attribute value: `burt`

Adds support for Burt. Additionally, the `trackingKey` variable must be specified. It's also possible to specify the optional variables `category` and `subCategory`. More details can be found at [burtcorp.com](http://burtcorp.com).

### Chartbeat

Type attribute value: `chartbeat`

Adds support for Chartbeat. More details for adding Chartbeat support can be found at [support.chartbeat.com](http://support.chartbeat.com/docs/integrations.html#amp).

### ColAnalytics

Type attribute value: `colanalytics`

Adds support for ColAnalytics. Additionally, you must specify a value for `id`.

### Clicky Web Analytics

Type attribute value: `clicky`

Adds support for Clicky Web Analytics. More details for adding Clicky support can be found at [clicky.com](https://clicky.com/help/apps-plugins).

### comScore

Type attribute value: `comscore`

Adds support for comScore Unified Digital Measurement™ pageview analytics. Requires defining *var* `c2` with comScore-provided *c2 id*. More information can be found at [comscore.com](http://www.comscore.com).

### Cxense

Type attribute value: `cxense`

Adds support for Cxense Insight analytics. Requires defining *var* `siteId` with Cxense-provided *siteId*. More details can be found at [wiki.cxense.com](https://wiki.cxense.com/display/cust/Accelerated+Mobile+Pages+%28AMP%29+integration).

### dynatrace

Type attribute value: `dynatrace`

Adds support for dynatrace. Requires defining *var* `app` with dynatrace-provided *appId* and *var* `tenant` with dynatrace-provided *tenantId*.

### Eulerian Analytics

Type attribute value: `euleriananalytics`

Adds support for Eulerian Technologies Analytics. Requires defining *var* `analyticsHost` with Eulerian delegated domain. More details can be found at [eulerian.wiki](https://eulerian.wiki).

### Gemius

Type attribute value: `gemius`

Adds support for Gemius Audience/Prism analytics. Additionally, the gemius-provided `prefix` and `identifier` variables must be specified. It's also possible to specify the optional variable `extraparams` (key1=value1|key2=value2). More details can be found at [gemius.com](https://www.gemius.com).

### Google Analytics

Type attribute value: `googleanalytics`

Adds support for Google Analytics. More details for adding Google Analytics support can be found at [developers.google.com](https://developers.google.com/analytics/devguides/collection/amp-analytics/).

### INFOnline / IVW

Type attribute value: `infonline`

Adds support for [INFOnline](https://www.infonline.de) / [IVW](http://www.ivw.de). Requires a copy of [amp-analytics-infonline.html](https://3p.ampproject.net/custom/amp-analytics-infonline.html) on a different subdomain than the including AMP file ([why?](https://github.com/ampproject/amphtml/blob/master/spec/amp-iframe-origin-policy.md)). The file must be served via HTTPS. Example: if your AMP files are hosted on `www.example.com`, then `amp-analytics-infonline.html` needs to be on another subdomain such as `iframe.example.com` or `assets.example.com`.

Additionally, the following variables must be defined:

* `st`: Angebotskennung
* `co`: comment
* `cp`: code
* `url`: HTTPS location of `amp-analytics-infonline.html`

More details for adding INFOnline / IVW support can be found at [www.infonline.de](https://www.infonline.de/downloads/web-mew-und-ctv/).

### Krux

Type attribute value: `krux`

Adds support for Krux.  Configuration details can be found at [help.krux.com](https://konsole.zendesk.com/hc/en-us/articles/216596608).

### Linkpulse

Type attribute value: `linkpulse`

Adds support for Linkpulse. Configuration details can be found at [docs.linkpulse.com](http://docs.linkpulse.com)

### Lotame

Type attribute value: `lotame`

Adds support for Lotame.  More information and configuration details can be found at [mylotame.force.com](https://mylotame.force.com/s/article/Google-AMP).

### Médiamétrie

Type attribute value: `mediametrie`

Adds support for Médiamétrie tracking pages. Requires defining *var* `serial`. Vars `level1` to `level4` are optional.  More information can be found at [mediametrie.com](http://www.mediametrie.com/).

### mParticle

Type attribute value: `mparticle`

Adds support for mParticle. More details for adding mParticle support can be found at [docs.mparticle.com](http://docs.mparticle.com/?javascript#amp).

### OEWA

Type attribute value: `oewa`

There is a variation called `oewadirect` wich does not use iframe-ping solution - and has a better client detection, by using AMP CLIENT_ID, this is currently EXPERIMENTAL,
and as of today (01.07.2015) prohibited by the OEWA - as it does not use `oewa2.js`

Adds support for [OEWA](https://www.oewa.at). Requires a copy of [amp-analytics-oewa.html](http://www.oewa.at/fileadmin/downloads/amp-analytics-oewa.html) on a different subdomain than the including AMP file ([why?](https://github.com/ampproject/amphtml/blob/master/spec/amp-iframe-origin-policy.md)). The file must be served via HTTPS. Example: if your AMP files are hosted on `www.example.com`, then `amp-analytics-oewa.html` needs to be on another subdomain such as `oewa-amp.example.com`.

Additionally, the following variables must be defined:

in vars-section:
* `s`: offer
* `cp`: categorypath

in requests-section:
* `url`: HTTPS location of `amp-analytics-oewa.html`

More details for adding ÖWA, support can be found [here](http://www.oewa.at/basic/implementierung).

### Parsely

Type attribute value: `parsely`

Adds support for Parsely. Configuration details can be found at [parsely.com/docs](http://parsely.com/docs/integration/tracking/google-amp.html).

### Piano

Type attribute value: `piano`

Adds support for Piano.  Configuration details can be found at [vx.piano.io](http://vx.piano.io/javascript-tracking-amp).

### Rakam

Type attribute value: `rakam`

Adds support for Rakam.io. Configuration details can be found at [Rakam Documentation](https://rakam.io/integration/amp).

### Quantcast Measurement

Type attribute value: `quantcast`

Adds support for Quantcast Measurement. More details for adding Quantcast Measurement can be found at [quantcast.com](https://www.quantcast.com/help/guides/)

### Segment

Type attribute value: `segment`

Adds support for segment page views and events.
To see the full list of fields that you can send, see [Segment Spec](https://segment.com/docs/spec/).

### SOASTA mPulse

Type attribute value: `mpulse`

Adds support for [SOASTA mPulse](https://www.soasta.com/mPulse). Configuration details can be found at [docs.soasta.com](http://docs.soasta.com/).

### SimpleReach

Type attribute value: `simplereach`

Adds support for SimpleReach.  Configuration details can be found at [simplereach.com/docs](http://docs.simplereach.com/dev-guide/implementation/google-amp-implementation)

### Snowplow Analytics

Type attribute value: `snowplow`

Adds support for Snowplow Analytics. More details for adding Snowplow Analytics support can be found at [github.com/snowplow/snowplow/wiki](https://github.com/snowplow/snowplow/wiki/Google-AMP-Tracker).

### Webtrekk

Type attribute value: `webtrekk`

Adds support for Webtrekk. Configuration details can be found at [supportcenter.webtrekk.com](https://supportcenter.webtrekk.com/en/public/amp-analytics.html).

### Yandex Metrica

Type attribute value: `metrika`

Adds support for Yandex Metrica.  Configuration details can be found at [Yandex Support](https://yandex.com/support/metrica/code/install-counter-amp.xml).

## Attributes

**type**

Specifies the type of vendor.  For details, see the [Analytics vendors](#analytics-vendors) section above.

**config**

This is an optional attribute that can be used to load a configuration from a specified remote URL. The URL specified should use the HTTPS scheme. See also the `data-include-credentials` attribute below. The URL may include [AMP URL vars](../../spec/amp-var-substitutions.md). The response must follow the [AMP CORS security guidelines](../../spec/amp-cors-requests.md).

Example:

```html
<amp-analytics config="https://example.com/analytics.config.json"></amp-analytics>
<amp-analytics type="googleanalytics" id="analytics1">
<script type="application/json">
{
  "vars": {
    "account": "UA-12345-Y"
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

{% call callout('Read on', type='read') %}
Learn more about AMP Analytics in the [Deep Dive into AMP Analytics](https://www.ampproject.org/docs/guides/analytics/deep_dive_analytics) guide.
{% endcall %}

## Analytics vendors

See [Analytics Vendors](https://www.ampproject.org/docs/guides/analytics/analytics-vendors.html) for a list of vendors that provide built-in support for `amp-analytics`.

## Configuration

Configuration data may be specified inline (as shown in the example above) or fetched remotely by specifying a URL in the
`config` attribute. Additionally, built-in configuration for popular analytics vendors can be selected by using
the `type` attribute.

If configuration data from more than one of these sources is used, the configuration objects (vars, requests and triggers) will
be merged together such that **(i) remote configuration takes precedence over inline configuration and (ii) inline configuration
takes precedence over vendor configuration**.

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
  "extraUrlParams": {
    extraurlparam-name: extraurlparam-value,
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
The `requests` configuration object specifies the URLs used to transmit data to an analytics platform. The `request-name` is used
in the trigger configuration to specify what request should be sent in response to a particular event. The `request-value`
is an https URL. These values may include placeholder tokens that can reference other requests or variables.

```javascript
"requests": {
  "base": "https://example.com/analytics?a=${account}&u=${canonicalUrl}&t=${title}",
  "pageview": "${base}&type=pageview",
  "event": "${base}&type=event&eventId=${eventId}"
}
```

### Vars

The `amp-analytics` component defines many basic variables that can be used in requests. A list of all such variables is available in the  [`amp-analytics` Variables Guide](./analytics-vars.md). In addition, all of the variables supported by [AMP HTML Substitutions Guide](../../spec/amp-var-substitutions.md) are also supported.

The `vars` configuration object can be used to define new key-value pairs or override existing variables that can be referenced in `request` values. New variables are commonly used to specify publisher specific information.  Arrays can be used to specify a list of values that should be URL encoded separately while preserving the comma delimiter.

```javascript
"vars": {
  "account": "ABC123",
  "countryCode": "tr",
  "tags": ["Swift,Jonathan", "Gulliver's Travels"]
}
```

### Extra URL Params

The `extraUrlParams` configuration object specifies additional parameters to append to the query string of a request URL via the usual "&foo=baz" convention.

Here's an example that would append `&a=1&b=2&c=3` to a request:

```javascript
"extraUrlParams": {
  "a": "1",
  "b": "2",
  "c": "3"
}
```

The `extraUrlParamsReplaceMap` attribute specifies a map of keys and values that act as parameters to `String.replace()` to pre-process keys in the `extraUrlParams` configuration. For example, if an `extraUrlParams` configuration defines `"page.title": "The title of my page"` and the `extraUrlParamsReplaceMap` defines `"page.": "_p_"`, then `&_p_title=The%20title%20of%20my%20page%20` will be appended to the request.

`extraUrlParamsReplaceMap` is not required to use `extraUrlParams`. If `extraUrlParamsReplaceMap` is not defined, then no string substitution will happens and the strings defined in `extraUrlParams` are used as-is.

### Triggers

The `triggers` configuration object describes when an analytics request should be sent. The `triggers` attribute contains a key-value pair of trigger-name and  trigger-configuration. A trigger-name can be any string comprised of alphanumeric characters (a-zA-Z0-9). Triggers from a  configuration with lower precedence are overridden by triggers with the same names from a configuration with higher precedence.

  - `on` (required) The event to listener for. Valid values are `ini-load`, `visible`, `click`, `scroll`, `timer`, and `hidden`.
  - `request` (required) Name of the request to send (as specified in the `requests` section).
  - `vars` An object containing key-value pairs used to override `vars` defined in the top level config, or to specify vars unique to this trigger.
  - `selector` and `selectionMethod` can be specified for some triggers, such as `click` and `visible`. See [Element selector](#element-selector) for details.
  - `scrollSpec` (required when `on` is set to `scroll`) This configuration is used on conjunction with the `scroll` trigger. Please see below for details.
  - `timerSpec` (required when `on` is set to `timer`) This configuration is used on conjunction with the `timer` trigger. Please see below for details.
  - `sampleSpec` This object is used to define how the requests can be sampled before they are sent. This setting allows sampling based on random input or other platform supported vars. The object contains configuration to specify an input that is used to generate a hash and a threshold that the hash must meet.
    - `sampleOn` This string template is expanded by filling in the platform variables and then hashed to generate a number for the purposes of the sampling logic described under threshold below.
    - `threshold` This configuration is used to filter out requests that do not meet particular criteria: For a request to go through to the analytics vendor, the following logic should be true `HASH(sampleOn) < threshold`.

As an example, the following configuration can be used to sample 50% of the requests based on random input or at 1% based on client id.

```javascript
'triggers': {
  'sampledOnRandom': {
    'on': 'visible',
    'request': 'request',
    'sampleSpec': {
      'sampleOn': '${random}',
      'threshold': 50,
    },
  },
  'sampledOnClientId': {
    'on': 'visible',
    'request': 'request',
    'sampleSpec': {
      'sampleOn': '${clientId(cookieName)}',
      'threshold': 1,
    },
  },
},
```


#####  Element selector

Some triggers such as `click` and `visible` allow specifying an single element or a collection of elements using the selector properties. Different triggers can apply different limitations and interpretations on selected elements, such as whether a selector applies to all matched elements or the first one, or which elements can be matched: all or only AMP elements. See the documentation for each relevant trigger for more details.

The selector properties are:
  - `selector` This property is used to find an element or a collection of elements using CSS/DOM query. The semantics of how the element is matched can be changed using `selectionMethod`. The value of this property can be one of:
    - a valid CSS selector, e.g. `#ad1` or `amp-ad`.
    - `:root` - a special selector that matches the document root.
  - `selectionMethod` When specified, this property can have one of two values: `scope` or `closest`. `scope` allows selection of element within the parent element of `amp-analytics` tag. `closest` searches for the closest ancestor of the `amp-analytics` tag that satisfies the given selector. The default value is `scope`.


#### Embed render start trigger

AMP elements that embed other documents in iframes (e.g., ads) may report a render start event (`"on": "render-start"`). This event
is typically emitted as soon as it's possible to confirm that rendering of the embedded document has started. Consult the documentation of a particular AMP element to see whether it emits this event.

The trigger for the embed element must include a [`selector`](#element-selector) that points to the embedding element:
```javascript
"triggers": {
  "renderStart": {
    "on": "render-start",
    "request": "request",
    "selector": "#embed1"
  }
}
```

The render start event is also emitted by the document itself and can be configured as:
```javascript
"triggers": {
  "renderStart": {
    "on": "render-start",
    "request": "request"
  }
}
```

#### Initial load trigger

The initial load event (`"on": "ini-load"`) is triggered when the initial contents of an AMP element or an AMP document have been loaded.

The "initial load" is defined in relationship to the container and its initial size.
More specifically:
 - For a document: all elements in the first viewport.
 - For an embed element: all content elements in the embed document that are positioned within the initial size of the embed element.
 - For a simple AMP element (e.g. `amp-img`): the resources itself, such as an image or a video.

The trigger for an embed or an AMP element must include a [`selector`](#element-selector) that points to the element:
```javascript
"triggers": {
  "iniLoad": {
    "on": "ini-load",
    "request": "request",
    "selector": "#embed1"
  }
}
```

The initial load event is also emitted by the document itself and can be configured as:
```javascript
"triggers": {
  "iniLoad": {
    "on": "ini-load",
    "request": "request"
  }
}
```

#### Page and element visibility trigger

Use the page visibility trigger (`"on": "visible"`) to fire a request when the page becomes visible. The firing of this trigger can be configured using `visibilitySpec`.

```javascript
"triggers": {
  "defaultPageview": {
    "on": "visible",
    "request": "pageview",
  }
}
```

The element visibility trigger can be configured for any AMP element or a document root using [`selector`](#element-selector). The trigger will fire when the specified element matches the visibility parameters that can be customized using the `visibilitySpec`.

```javascript
"triggers": {
  "defaultPageview": {
    "on": "visible",
    "request": "elementview",
    "selector": "#ad1",
    "visibilitySpec": {/* optional visibility spec */}
  }
}
```

Notice that selector can be used to only specify a single element, not a collection. The element can be either an [AMP extended  element](https://github.xom/ampproject/amphtml/blob/master/spec/amp-tag-addendum.md#amp-specific-tags) or a document root.

The element visibility trigger waits for element's [`ini-load`](#initial-load-trigger) signal before matching the `visibilitySpec`.


<strong><a id="visibility-spec"></a>Visibility Spec</strong>

The `visibilitySpec` is a set of conditions and properties that can be applied to `visible` or `hidden` triggers to change when they fire. If multiple properties are specified, they must all be true in order for a request to fire. Configuration properties supported in `visibilitySpec` are:
  - `continuousTimeMin` and `continuousTimeMax` These properties indicate that a request should be fired when (any part of) an element has been within the viewport for a continuous amount of time that is between the minimum and maximum specified times. The times are expressed in milliseconds. The `continuousTimeMin` is defaulted to 0 when not specified.
  - `totalTimeMin` and `totalTimeMax` These properties indicate that a request should be fired when (any part of) an element has been within the viewport for a total amount of time that is between the minimum and maximum specified times. The times are expressed in milliseconds. The `totalTimeMin` is defaulted to 0 when not specified.
  - `visiblePercentageMin` and `visiblePercentageMax` These properties indicate that a request should be fired when the proportion of an element that is visible within the viewport is between the minimum and maximum specified percentages. Percentage values between 0 and 100 are valid. Note that the lower bound (`visiblePercentageMin`) is inclusive while the upper bound (`visiblePercentageMax`) is not. When these properties are defined along with other timing related properties, only the time when these properties are met are counted. They default to 0 and 100 when not specified.

In addition to the conditions above, `visibilitySpec` also enables certain variables which are documented [here](./analytics-vars.md#visibility-variables).

```javascript
"triggers": {
  "defaultPageview": {
    "on": "visible",
    "request": "pageview",
    "selector": "#ad1",
    "visibilitySpec": {
      "visiblePercentageMin": 20,
      "totalTimeMin": 500,
      "continuousTimeMin": 200
    }
  }
}
```

In addition to the variables provided as part of triggers you can also specify additional / overrides for [variables as data attribute](./analytics-vars.md#variables-as-data-attribute). If used, these data attributes have to be part of element specified as the [`selector`](#element-selector).


#### Click trigger

Use the click trigger (`"on": "click"`) to fire a request when a specified element is clicked. Use [`selector`](#element-selector) to control which elements will cause this request to fire. The trigger will fire for all elements matched by the specified selector.

```javascript
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

In addition to the variables provided as part of triggers you can also specify additional / overrides for [variables as data attribute](./analytics-vars.md#variables-as-data-attribute). If used, these data attributes have to be part of element specified as the `selector`


#### Scroll trigger
Use the scroll trigger (`"on": "scroll"`) to fire a request under certain conditions when the page is scrolled. This trigger provides [special vars](./analytics-vars.md#interaction) that indicate the boundaries that triggered a request to be sent. Use `scrollSpec` to control when this will fire:
  - `scrollSpec` This object can contain `verticalBoundaries` and `horizontalBoundaries`. At least one of the two properties is required for a scroll event to fire. The values for both of the properties should be arrays of numbers containing the boundaries on which a scroll event is generated. For instance, in the following code snippet, the scroll event will be fired when page is scrolled vertically by 25%, 50% and 90%. Additionally, the event will also fire when the page is horizontally scrolled to 90% of scroll width. To keep the page performant, the scroll boundaries are rounded to the nearest multiple of `5`.


```javascript
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

#### Timer trigger
Use the timer trigger (`"on": "timer"`) to fire a request on a regular time interval. Use `timerSpec` to control when this will fire:
  - `timerSpec` Specification for triggers of type `timer`. The timer will trigger immediately (by default, can be unset) and then at a specified interval thereafter.
    - `interval` Length of the timer interval, in seconds.
    - `maxTimerLength` Maximum duration for which the timer will fire, in seconds.
    - `immediate` trigger timer immediately or not. Boolean, defaults to true

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

#### Hidden trigger

Use the hidden trigger (`"on": "hidden"`) to fire a request when the page becomes hidden.

```javascript
"triggers": {
  "defaultPageview": {
    "on": "hidden",
    "request": "pagehide",
  }
}
```

A [`visibilitySpec`](#visibility-spec) can be included so that a request is only fired if the visibility duration conditions are satisfied.
```json
"triggers": {
  "defaultPageview": {
    "on": "hidden",
    "request": "pagehide",
    "visibilitySpec": {
      "selector": "#anim-id",
      "visiblePercentageMin": 20,
      "totalTimeMin": 3000,
    }
  }
}
```
The above configuration translates to:
> When page becomes hidden, fire a request if the element #anim-id has been visible (more than 20% area in viewport) for more than 3s in total.


#### Access triggers

AMP Access system issues numerous events for different states in the access flow. For details on access triggers (`"on": "amp-access-*"`), see [AMP Access and Analytics](../amp-access/amp-access-analytics.md).


### Transport

The `transport` configuration object specifies how to send a request. The value is an object with fields that
indicate which transport methods are acceptable.

  - `beacon` Indicates [`navigator.sendBeacon`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)  can be used to transmit the request. This will send a POST request, with credentials, and an empty body.
  - `xhrpost` Indicates `XMLHttpRequest` can be used to transmit the request. This will send a POST request, with credentials, and an empty body.
  - `image` Indicates the request can be sent by generating an `Image` tag. This will send a GET request.

If more than one of the above transport methods are enabled, the precedence is `beacon` > `xhrpost` > `image`. Only one transport method will be used, and it will be the highest precedence one that is permitted and available. If the client's user agent does not support a method, the next highest precedence method enabled will be used. By default, all three methods above are enabled.

In the example below, `beacon` and `xhrpost` are set to `false`, so they will not be used even though they have higher precedence than `image`. `image` would be set `true` by default, but it is explicitly declared here. If the client's user agent supports the `image` method, then it will be used; otherwise, no request would be sent.

```javascript
"transport": {
  "beacon": false,
  "xhrpost": false,
  "image": true
}
```

## Attributes

These are the valid attributes for the `amp-analytics` component:


**type**

Specifies the type of vendor.  For details, see the list of [Analytics vendors](https://www.ampproject.org/docs/guides/analytics/analytics-vendors.html).

Example:

```html
<amp-analytics type="googleanalytics" config="https://example.com/analytics.account.config.json"></amp-analytics>
```

**config**

This is an optional attribute that can be used to load a configuration from a specified remote URL. The URL specified should use the HTTPS scheme. See also the `data-include-credentials` attribute below. The URL may include [AMP URL vars](../../spec/amp-var-substitutions.md). The response must follow the [AMP CORS security guidelines](../../spec/amp-cors-requests.md).

Example:

```html
<amp-analytics config="https://example.com/analytics.config.json"></amp-analytics>
```

**data-credentials**

If set to `include`, this turns on the ability to read and write cookies on the request specified via the `config` attribute. This is an optional attribute.

**data-consent-notification-id**

If provided, the page will not process analytics requests until an [amp-user-notification](../../extensions/amp-user-notification/amp-user-notification.md) with the given HTML element id is confirmed (accepted) by the user. This is an optional attribute.

## Validation

See [amp-analytics rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-analytics/0.1/validator-amp-analytics.protoascii) in the AMP validator specification.

<!--
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-ad-exit"></a> `amp-ad-exit`

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Provides configurable behavior for ad exits for A4A (AMP for Ads).</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-ad-exit" src="https://cdn.ampproject.org/v0/amp-ad-exit-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>All. This element is hidden.</td>
  </tr>
</table>

## Overview

The `amp-ad-exit` element is configured with a JSON child script element and 
exposes an "exit" action to other elements in the [A4A (AMP for Ads)](../amp-a4a/amp-a4a-format.md) creative. Elements can be annotated to exit when tapped, passing a target name and extra URL parameter values to insert. The exit action performs these steps:

1. Parse the JSON config (if it hasn't yet been parsed).
2. Find the requested exit target.
3. Determine whether the exit should be allowed by processing the click event through declared filters.
4. Rewrite URL variables (see [Variable Substitution](#variable-substitution))
5. Ping any click tracking URLs.
6. Perform the navigation by opening the target URL in a new tab.

## Example

```html
<amp-ad-exit id="exit-api">
<script type="application/json">
{
  "targets": {
    "landingPage": {
      "finalUrl": "https://example.com/artisan-baking/?from=_clickArea",
      "vars": {
        "_clickArea": {
          "defaultValue": "headline",
        }
      }
    }
    "flour": {
      "finalUrl": "https://adclickserver.example.com/click?id=af319adec901&x=CLICK_X&y=CLICK_Y&adurl=https://example.com/artisan-baking/flour",
      "filters": ["3sClick", "borderProtection"]
    },
    "bannetons": {
      "finalUrl": "https://example.com/artisan-baking/bannetons",
      "trackingUrls": [
        "https://adclickserver.example.com/click?id=af319adec901&x=CLICK_X&y=CLICK_Y",
        "https://tracker.adnetwork.example.com/?url=example.com",
      ],
      "filters": ["3sClick", "borderProtection"]
    }
  },
  "filters": {
    "3sClick": {
      "type": "clickDelay",
      "delay": 3000
    },
    "borderProtection": {
      "type": "clickLocation",
      "top": 10,
      "right": 10,
      "bottom": 10,
      "left": 10
    }
  }
}
</script>
</amp-ad-exit>

<h1 on="tap:exit-api.exit(target='landing')">Artisan Baking Supplies</h1>
<div id="product0" on="tap:exit-api.exit(target='flour')">
  <p>Rye flour</p>
  <amp-img src="..." width="..." height="..."></amp-img>
</div>
<div id="product1" on="tap:exit-api.exit(target='bannetons')">
  <p>Bannetons</p>
  <amp-img src="..." width="..." height="..."></amp-img>
</div>
<div id="footer" on="tap:exit-api.exit(target='landing', _clickArea='footer')">
  example.com/artisan-baking
</div>
```

## Filters

Filters are specified in the `filters` section of the config. Targets reference
filters by their property name in the `filters` section.

There are two types of filters: location-based and time-based. Other filters (such as a confirmation prompt) could be added as needed. 

### clickLocation filter

The `clickLocation` filter type specifies the minimum distance a click must be from the edges of the creative or viewport (whichever is smaller).  The `clickLocation` filter requires the following properties:

| Property | Value | Meaning |
| -------- | ----- | ------- |
| `top`    | `number` | Distance in px from the top edge. |
| `right`  | `number` | Distance in px from the right edge. |
| `bottom` | `number` | Distance in px from the bottom edge. |
| `left`   | `number` | Distance in px from the left edge. |

### clickDelay filter

The `clickDelay` filter type specifies the time to wait before responding to clicks. The `amp-ad-exit` element imposes a minimum delay of 1 second on all exits. The `clickDelay` filter requires the following properties:

| Property | Value | Meaning |
| ---------| ----- | ------- |
| `delay`  | `number` | Time in ms to reject any clicks after entering the viewport. | 

*Example: Using filters*

```json
{
  "targets": {
    "ad": {
      "finalUrl": "...",
      "filters": ["2second", "huge-border"]
    }
  },
  "filters": {
    "2second": {
      "type": "clickDelay",
      "delay": 2000
    },
    "small-border": {
      "type": "clickLocation",
      "top": 5,
      "right": 5,
      "bottom": 5,
      "left": 5
    }
    "huge-border": {
      "type": "clickLocation",
      "top": 100,
      "right": 100,
      "bottom": 100,
      "left": 100
    }
  }
}
```

## Click tracking URLs

Navigation targets can be associated with click tracking URLs in the config.
Before navigation, amp-ad-exit attempts to ping the tracking URLs by using:

1. `navigator.sendBeacon`, if available
2. image request

You can override this behavior with a "transport" object on the config:

```json
{
  "targets": { ... },
  "filters": { ... },
  "transport": {
    "beacon": false,
  }
}
```

## Variable Substitution

URL variable substitution works like standard [AMP variable substitution](../../spec/amp-var-substitutions.md) with
custom variables and a limited set of platform variables. Variable substitution
applies to navigation URLs and click tracking URLs.

### Platform variables

| Name | Value |
| ---- | ----- |
| RANDOM | A random float. See [RANDOM](../../spec/amp-var-substitutions.md#random). |
| CLICK_X | The `x` coordinate of the click in the viewport. |
| CLICK_Y | The `y` coordinate of the click in the viewport. |

### Custom variables
Custom variables must begin with an underscore. Define variables in the
config alongside the navigation target. The default value can be overridden
in the `exit` action invocation:

```html
<amp-ad-exit id="exit-api"><script type="application/json">
{
  "targets": {
    "product": {
      "finalUrl": "http://example.com/?page=_productCategory",
      "vars": {
        "_productCategory": {
          "defaultValue": "none"
        }
      }
    }
  }
}
</script></amp-ad-exit>
<a on="tap:exit-api.exit(target='product', _productCategory='shoes')">buy shoes</a>
<a on="tap:exit-api.exit(target='product', _productCategory='hats')">buy hats</a>
```

By convention, user-defined variables should be in `_camelCase`. System
variables are in `ALL_CAPS`.

{% call callout('Warning', type='caution') %}
Be careful with your variable names. Substitution works by simple
string replacement. *Any* occurrence of the variable in the URL will be
replaced. For example, if you define a custom variable named "_b" with value
"foo", `/?a_b_c=_b` will become `/?afoo_c=foo`.
{% endcall %}

## `exit` action

The `amp-ad-exit` element exposes an `exit` action that other elements reference in `on="tap:..."` attributes. The action accepts a "target" string parameter that must match a named `NavigationTarget` in the `ExitConfig`. Custom variables beginning with an underscore can also be passed in.

| Parameter name      | Parameter value type      | Meaning                    |
| ------------------- | ------------------------- | -------------------------- |
| `target`            | `string`                  | The name of a  `NavigationTarget` in the `ExitConfig` |
| `_[a-zA-Z0-9_-]+` | `string\|boolean\|number` | Replace the URL parameter with this name and value into the final and tracking URLs. |

## Configuration spec
See the `AmpAdExitConfig` typedef in [config.js](https://github.com/ampproject/amphtml/blob/master/extensions/amp-ad-exit/0.1/config.js).

## Attributes

##### id

An `id` is required so that `amp-exit` can be referenced by tappable elements. 

## Validation
The `amp-ad-exit` element is only available for [A4A (AMP for Ads)](../amp-a4a/amp-a4a-format.md) documents. 
See [amp-ad-exit rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-ad-exit/validator-amp-ad-exit.protoascii) for the AMP validator specification.

---
$category@: ads-analytics
formats:
  - websites
  - ads
teaser:
  text: Provides configurable behavior for ad exits for AMPHTML ads.
---

# amp-ad-exit

Provides configurable ad exit behavior for AMPHTML ads.

## Usage

Use the `amp-ad-exit` component to expose an “exit” action to other elements
in the [AMPHTML ad](https://amp.dev/documentation/guides-and-tutorials/learn/a4a_spec).

Configure the `amp-ad-exit` component with a JSON child script element. Use
the component to annotate other elements to exit when tapped and pass a target
name and extra URL parameters to the user's browser. The exit action performs
the following steps:

1. Parse the JSON config if it hasn't already been parsed.
1. Find the requested exit target.
1. Process the click event through declared filters to determine whether the
   exit should be allowed.
1. Rewrite [URL variables](https://github.com/ampproject/amphtml/blob/main/extensions/amp-ad-exit/amp-ad-exit.md#variable-substitution).
1. Ping click-tracking URLs.
1. Open the target URL in a new tab.

### Configuration spec

See the `AmpAdExitConfig` typedef in
[config.js](https://github.com/ampproject/amphtml/blob/main/extensions/amp-ad-exit/0.1/config.js)
for a configuration spec.

### Filters

You can specify filters in the `filters` section of your config. You can then
reference these filters by their property name in the `filters` section.

There are three primary types of filters: location-based, time-based, and element-based. Other filters, such as a confirmation prompt, can be added as needed.

#### clickLocation filter

The `clickLocation` filter specifies the minimum distance a click must be from the edges of the creative or the edges of a specific element in the creative. The `clickLocation` filter may have the following properties:

<table>
  <tr>
    <th>Property</th>
    <th>Value</th>
    <th>Meaning</th>
  </tr>
  <tr>
    <td><code>top</code></td>
    <td>number</td>
    <td>The distance in px from the top edge. Specify to overwrite the default
      value of 0.</td>
  </tr>
  <tr>
    <td><code>right</code></td>
    <td>number</td>
    <td>The distance in px from the right edge. Specify to overwrite the
      default value of 0.</td>
  </tr>
  <tr>
    <td><code>bottom</code></td>
    <td>number</td>
    <td>The distance in px from the bottom edge. Specify to overwrite the
      default value of 0.</td>
  </tr>
  <tr>
    <td><code>left</code></td>
    <td>number</td>
    <td>The distance in px from the left edge. Specify to overwrite the default
      value of 0.</td>
  </tr>
  <tr>
    <td><code>relativeTo</code></td>
    <td>string</td>
    <td>
      <p>Selects the element to use for edge boundaries. If unspecified, the
        full <code>body</code> of the creative is used by default.</p>
      <ul>
        <li>The selected element doesn't need to be the element that triggers
          the exit.</li>
        <li>The selected element must be in a fixed position for the life of
          the creative.</li>
        <li>The selector must use CSS selector syntax.</li>
      </ul>
    </td>
  </tr>
</table>

#### clickDelay filter

The `clickDelay` filter type specifies the amount of time to wait before clicks
are responded to. Keep in mind that `amp-ad-exit` imposes a minimum delay of 1
second on all exits.

The `clickDelay` filter requires the following properties:

<table>
  <tr>
    <th>Property</th>
    <th>Value</th>
    <th>Meaning</th>
  </tr>
  <tr>
    <td><code>delay</code></td>
    <td>number</td>
    <td>Time in ms to reject any clicks after entering the viewport.</td>
  </tr>
  <tr>
    <td>`startTimingEvent`</td>
    <td>string</td>
    <td>The name of an event to use as a delay start interval, such as
      <code>navigationStart</code>. Based on window performance timing.</td>
  </tr>
</table>

> Note: The default 1 second click delay uses extension load time as an
> interval. However, this can be overridden to use the `startTimingEvent`
> value. Use the `options` object in the root of the config for this purpose.
> If a value isn't explicitly given, all other click filters use the
> `startTimingEvent`.

##### Example

In the following example, the default click protection imposes a 1 second delay from `navigationStart` with two additional, specified click protections of 2 seconds from `navigationStart` and 3 seconds from `DOMContentLoaded` start.

```html
<amp-ad-exit id="exit-api">
  <script type="application/json">
    {
      "targets": {
        "flour": {
          "finalUrl": "https://adclickserver.example.com/click?id=af319adec901&x=CLICK_X&y=CLICK_Y&adurl=https://example.com/artisan-baking/flour",
          "filters": ["3sClick", "2sClick"]
        }
      },
      "options": {
        "startTimingEvent": "navigationStart"
      },
      "filters": {
        "3sClick": {
          "type": "clickDelay",
          "delay": 3000,
          "startTimingEvent": "domContentLoadedEventStart"
        },
        "2sClick": {
          "type": "clickDelay",
          "delay": 2000
        }
      }
    }
  </script>
</amp-ad-exit>
```

#### inactiveElement filter

The `inactiveElement` filter type specifies elements that shouldn't cause an exit when they're the source of an event. Remember that, by default, `amp-ad-exit` ignores clicks on the previous and next buttons of an `amp-carousel`.

The `inactiveElement` filter requires the following property:

<table>
  <tr>
    <th>Property</th>
    <th>Value</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>selector</code></td>
    <td>string</td>
    <td>A CSS selector. If the event that triggers an exit has a `target` that matches the selector, the exit isn't performed.</td>
  </tr>
</table>

##### Example

```css
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
    },
    "huge-border": {
      "type": "clickLocation",
      "top": 100,
      "right": 100,
      "bottom": 100,
      "left": 100
    },
    "border-with-relative-to-element": {
      "type": "clickLocation",
      "top": 10,
      "right": 10,
      "bottom": 10,
      "left": 10,
      "relativeTo": "#headline"
    }
  }
}
```

### Click-tracking URLs

Navigation targets can be associated with click-tracking URLs in the config.
Before navigation, `amp-ad-exit` attempts to use the following to ping the
tracking URLs:

-   `navigator.sendBeacon`, if available
-   image request

You can override this behavior with a `"transport"` object on the config, such as in this example:

```json
{
  "targets": { ... },
  "filters": { ... },
  "transport": {
    "beacon": false,
  }
}
```

### Variable Substitution

Variable substitution applies to navigation URLs and click-tracking URLs. URL
variable substitution works like standard
[AMP variable substitution](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-var-substitutions.md)
with custom variables and a limited set of platform variables.

#### Platform variables

<table>
  <tr>
    <th>Name</th>
    <th>Value</th>
  </tr>
  <tr>
    <td><code>RANDOM</code></td>
    <td>A <a href="https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-var-substitutions.md#random">random</a> float.</td>
  </tr>
  <tr>
    <td><code>CLICK_X</code></td>
    <td>The <code>x</code> coordinate of the click in the viewport.</td>
  </tr>
  <tr>
    <td><code>CLICK_Y</code></td>
    <td>The <code>y</code> coordinate of the click in the viewport.</td>
  </tr>
  <tr>
    <td><code>UACH</code></td>
    <td>Provides [user agent client hint](https://github.com/WICG/ua-client-hints) information.
    <b>WARNING<b>: Because the UACH API is asynchronous and amp-ad-exit is synchronous
    only, to retrieve UACH signals the values must be retrieved and cached beforehand by
    another AMP component that also uses variables substitution, otherwise they will be empty.</td>
  </tr>
</table>

### Custom variables

Custom variables must begin with an underscore. Define variables in the config alongside the navigation target. Variables should have a `"defaultValue"` property. You can override the default value in the `exit` action invocation.

Variable values can also come from 3P analytics. Use `<amp-analytics type='example-3p-vendor'>` to install a 3P analytics vendor iframe and reference it in the variable definition with the `"iframeTransportSignal"` property. The format of `"iframeTransportSignal"` is `"IFRAME_TRANSPORT_SIGNAL(example-3p-vendor,collected-data)"`, where `example-3p-vendor` is the name of the vendor and `collected-data` is a key in the message from the vendor iframe. Don't place a space after the comma between the two.

Conventionally, user-defined variables should be in `_camelCase`, and system variables in `ALL_CAPS`.

```html
<amp-ad-exit id="exit-api"
  ><script type="application/json">
    {
      "targets": {
        "product": {
          "finalUrl": "http://example.com/?page=_productCategory&verification=_3pAnalytics",
          "vars": {
            "_productCategory": {
              "defaultValue": "none"
            },
            "_3pAnalytics": {
              "defaultValue": "no_response",
              "iframeTransportSignal": "IFRAME_TRANSPORT_SIGNAL(example-3p-vendor,collected-data)"
            }
          }
        }
      }
    }
  </script></amp-ad-exit
>
<a on="tap:exit-api.exit(target='product', _productCategory='shoes')"
  >buy shoes</a
>
<a on="tap:exit-api.exit(target='product', _productCategory='hats')"
  >buy hats</a
>
```

> Caution: Be careful with your variable names. Substitution works by simple
> string replacement. Any occurrence of the variable in the URL is replaced.
> For example, if you define a custom variable named "\_b" with value "foo",
> `/?a_b_c=_b` will become `/?afoo_c=foo`.

### Behaviors

Behaviors specify additional properties of the `exit` action.

#### clickTarget

The `clickTarget` behavior specifies where a target's click should try to open. A click defaults to open in a new tab if that's possible in the environment. If set to `"_top"`, a user can specify that the click should open in the same tab. If this is set to anything other than `"_top"`, it opens in a new tab.

##### Example

```html
<amp-ad-exit id="exit-api">
  <script type="application/json">
    {
      "targets": {
        "landingPage": {
          "finalUrl": "https://example.com/artisan-baking/?from=_clickArea",
          "vars": {
            "_clickArea": {
              "defaultValue": "headline"
            }
          }
        },
        "flour": {
          "finalUrl": "https://adclickserver.example.com/click?id=af319adec901&x=CLICK_X&y=CLICK_Y&adurl=https://example.com/artisan-baking/flour",
          "filters": ["3sClick", "borderProtection"],
          "behaviors": {
            "clickTarget": "_top"
          }
        },
        "bannetons": {
          "finalUrl": "https://example.com/artisan-baking/bannetons",
          "trackingUrls": [
            "https://adclickserver.example.com/click?id=af319adec901&x=CLICK_X&y=CLICK_Y",
            "https://tracker.adnetwork.example.com/?url=example.com"
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

<h1 on="tap:exit-api.exit(target='landingPage')">Artisan Baking Supplies</h1>
<div id="product0" on="tap:exit-api.exit(target='flour')">
  <p>Rye flour</p>
  <amp-img src="..." width="..." height="..."></amp-img>
</div>
<div id="product1" on="tap:exit-api.exit(target='bannetons')">
  <p>Bannetons</p>
  <amp-img src="..." width="..." height="..."></amp-img>
</div>
<div
  id="footer"
  on="tap:exit-api.exit(target='landingPage', _clickArea='footer')"
>
  example.com/artisan-baking
</div>
```

## Attributes

### Id

An `id` is required so that `amp-exit` can be referenced by tappable elements.

## Actions

### setVariable

`amp-ad-exit` also supports variable targets. The variable targets don't
define exit URLs by themselves. Instead, they point to a named
`NavigationTarget` in the `ExitConfig`. Don't confuse these with URL custom
variables. These are state variables that are maintained by the `amp-ad-exit`
element. They can be updated at runtime to enable stateful exit behavior.

<table>
  <tr>
    <th>Name</th>
    <th>Value</th>
    <th>Meaning</th>
  </tr>
  <tr>
    <td><code>name</code></td>
    <td>string</td>
    <td>The name of the state variable.</td>
  </tr>
  <tr>
    <td><code>target</code></td>
    <td>string</td>
    <td>The name of the `NavigationTarget` in the <code>ExitConfig</code> that
      this state variable points to.</td>
  </tr>
</table>

### exit

The `amp-ad-exit` element exposes an `exit` action that other elements reference in `on="tap:..." attributes`. The action accepts a `"target"` string parameter that must match a named `NavigationTarget` in the `ExitConfig`, or a `"variable"` string parameter which is a state variable that points to a `NavigationTarget`. Custom variables that begin with an underscore can also be passed in.

<table>
  <tr>
    <th>Name</th>
    <th>Value</th>
    <th>Meaning</th>
  </tr>
  <tr>
    <td><code>target</code></td>
    <td>string</td>
    <td>The name of the state variable.</td>
  </tr>
  <tr>
    <td><code>variable</code></td>
    <td>string</td>
    <td>The name of the `NavigationTarget` in the `ExitConfig` that this state
      variable points to.</td>
  </tr>
  <tr>
    <td><code>default`</code></td>
    <td>string</td>
    <td>The name of the default `NavigationTarget` that the state variable
      should point to when it's not set. This is only meaningful when the
      variable is used.</td>
  </tr>
  <tr>
    <td><code>_[a-zA-Z0-9_-]+</code></td>
    <td>string, boolean, or number</td>
    <td>Replace the URL parameter in the final and tracking URLs with this name
      and value.</td>
  </tr>
</table>

> Caution: When you trigger the exit action, either the target or the variable
> should be provided, but not both.

#### Example

```html
<amp-ad-exit id="exit-api" layout="nodisplay">
  <script type="application/json">
    {
      "targets": {
        "product1": {
          "finalUrl": "https://example.com/product1"
        },
        "product2": {
          "finalUrl": "https://example.com/product2"
        }
      }
    }
  </script>
</amp-ad-exit>
<amp-selector
  id="exit-selector"
  layout="nodisplay"
  on="select:exit-api.setVariable(name='currentProduct', target=event.targetOption)"
>
  <option option="product1" selected></option>
  <option option="product2"></option>
</amp-selector>
<amp-carousel
  type="slides"
  autoplay
  on="slideChange:exit-selector.toggle(index=event.index, value=true),
        tap:exit-api.exit(variable='currentProduct', default='product1')"
>
  <div>product 1</div>
  <div>product 2</div>
</amp-carousel>
```

## Validation

The amp-ad-exit element is only available for [AMPHTML ads](https://www.ampproject.org/docs/ads/amphtml_ads).
Read [amp-ad-exit rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-ad-exit/validator-amp-ad-exit.protoascii)
for the AMP validator specification.

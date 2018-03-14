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

# <a name="amp-list"></a> `amp-list`

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Fetches content dynamically from a CORS JSON endpoint and renders it
using a supplied template.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-list" src="https://cdn.ampproject.org/v0/amp-list-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-list/">amp-list example</a>.</td>
  </tr>
</table>

## Usage

The `amp-list` component fetches dynamic content from a CORS JSON endpoint. The response from the endpoint contains data, which is rendered in the specified template.

{% call callout('Important', type='caution') %}
Your endpoint must implement the requirements specified in the [CORS Requests in AMP](https://www.ampproject.org/docs/fundamentals/amp-cors-requests) spec.
{% endcall %}

You can specify a template in one of two ways:

- a `template` attribute that references an ID of an existing `template` element.
- a `template` element nested directly inside the `amp-list` element.

For more details on templates, see [AMP HTML Templates](../../spec/amp-html-templates.md).

*Example: Displaying a dynamic list*

In the following example, we retrieve JSON data that contains URLs and titles, and render the content in a nested [amp-mustache template](https://www.ampproject.org/docs/reference/components/amp-mustache).

<!--embedded example - displays in ampproject.org -->
<div>
<amp-iframe height="259"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/amplist.basic.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div>
</amp-iframe>
</div>

Here is the JSON file that we used:

```json
{
 "items": [
   {
     "title": "AMP YouTube Channel",
     "url": "https://www.youtube.com/channel/UCXPBsjgKKG2HqsKBhWA4uQw"
   },
   {
     "title": "AMPproject.org",
     "url": "https://www.ampproject.org/"
   },
   {
     "title": "AMP By Example",
     "url": "https://ampbyexample.com/"
   },
   {
     "title": "AMP Start",
     "url": "https://ampstart.com/"
   }
 ]
}
```

## Behavior

The request is always made from the client, even if the document was served from the AMP Cache. Loading is triggered using normal AMP rules depending on how far the element is from
the current viewport.

If `amp-list` needs more space after loading, it requests the AMP runtime to update its
height using the normal AMP flow. If the AMP runtime cannot satisfy the request for the new
height, it will display the `overflow` element when available. Notice however, that the typical
placement of `amp-list` elements at the bottom of the document almost always guarantees
that the AMP runtime can resize them.

By default, `amp-list` adds a `list` ARIA role to the list element and a `listitem` role to item
elements rendered via the template.

### XHR batching

AMP batches XMLHttpRequests (XHRs) to JSON endpoints, that is, you can use a single JSON data request as a data source for multiple consumers (e.g., multiple `amp-list` elements) on an AMP page.  For example, if your `amp-list` makes an XHR to an endpoint, while the XHR is in flight, all subsequent XHRs to the same endpoint won't trigger and will instead return the results from the first XHR.

In `amp-list`, you can use the [`items`](#items-optional) attribute to render a subset of the JSON response, allowing you to have multiple `amp-list` elements rendering different content but sharing a single XHR.


### Specifying an overflow

Optionally, the `amp-list` element can contain an element with an `overflow` attribute. This element is shown if the AMP Runtime cannot resize the `amp-list` element as requested.

*Example: Displaying an overflow when the list needs more space*

In the following example, we display a list of images and titles. Because the amp-list content requires more space than available, the AMP Runtime displays the overflow element.

<!--embedded example - displays in ampproject.org -->
<div>
<amp-iframe height="213"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/amplist.overflow.embed.html?active-tab=preview&preview-height=213">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div>
</amp-iframe>
</div>

Here's the CSS for the `overflow`:

```css
.list-overflow[overflow] {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}
```

### Placeholder and fallback

Optionally, `amp-list` supports a placeholder and/or fallback.

- A *placeholder* is a child element with the `placeholder` attribute. This element is shown until the `amp-list` loads successfully. If a fallback is also provided, the placeholder is hidden when the `amp-list` fails to load.
- A *fallback* is a child element with the `fallback` attribute. This element is shown if the `amp-list` fails to load.

Learn more in [Placeholders & Fallbacks](https://www.ampproject.org/docs/guides/responsive/placeholders). Note that a child element cannot be both a placeholder and a fallback.

```html
<amp-list src="https://foo.com/list.json">
  <div placeholder>Loading ...</div>
  <div fallback>Failed to load data.</div>
</amp-list>
```

### Refreshing data

The `amp-list` element exposes a `refresh` action that other elements can reference in `on="tap:..."` attributes.

```html
<button on="tap:myList.refresh">Refresh List</button>
<amp-list id="myList" src="https://foo.com/list.json">
  <template type="amp-mustache">
    <div>{{title}}</div>
  </template>
</amp-list>
```

## Attributes

##### src (required)

The URL of the remote endpoint that returns the JSON that will be rendered
within this `amp-list`. This must be a CORS HTTP service. The URL's protocol must be HTTPS.

{% call callout('Important', type='caution') %}
Your endpoint must implement the requirements specified in the [CORS Requests in AMP](https://www.ampproject.org/docs/fundamentals/amp-cors-requests) spec.
{% endcall %}

The `src` attribute may be omitted if the `[src]` attribute exists. This is useful when rendering content as a result of a user gesture instead of on page load when working with [`amp-bind`](https://www.ampproject.org/docs/reference/components/amp-bind).

##### credentials (optional)

Defines a `credentials` option as specified by the [Fetch API](https://fetch.spec.whatwg.org/).

* Supported values: `omit`, `include`
* Default: `omit`

To send credentials, pass the value of `include`. If this value is set, the response must follow the [AMP CORS security guidelines](https://www.ampproject.org/docs/fundamentals/amp-cors-requests#cors-security-in-amp).

Here's an example that specifies including credentials to display personalized content in a list:

```html
<amp-list credentials="include"
    src="<%host%>/json/product.json?clientId=CLIENT_ID(myCookieId)">
  <template type="amp-mustache">
    Your personal offer: ${{price}}
  </template>
</amp-list>
```

##### items (optional)

Defines the expression to locate the array to be rendered within the response. This is a dot-notated expression that navigates via fields of the JSON response.
By defaut `amp-list` expects an array, the `single-item` attribute may be used to load data from an object.

- The default value is `"items"`. The expected response: `{items: [...]}`.
- If the response itself is the desired array, use the value of `"."`. The expected response is: `[...]`.
- Nested navigation is permitted (e.g., `"field1.field2"`). The expected response is: `{field1: {field2: [...]}}`.


When `items="items"` is specified (which, is the default) the response must be a JSON object that contains an array property called `"items"`:
```text
{
  "items": [...]
}
```

#### max-items (optional)

An integer value spcifying the maximum length of the items array to be rendered.
The `items` array will be trucated to `max-items` entries if the returned value exceeds `max-items`.

#### single-item (optional)

Causes `amp-list` to treat the returned result as if it were a single element array. An object response will be wrapped in an array so
`{items: {...}}` will behave as if it were `{items: [{...}]}`.

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Substitutions

The `amp-list` allows all standard URL variable substitutions.
See the [Substitutions Guide](../../spec/amp-var-substitutions.md) for more info.

For example:
```html
<amp-list src="https://foo.com/list.json?RANDOM"></amp-list>
```
may make a request to something like `https://foo.com/list.json?0.8390278471201` where the RANDOM value is randomly generated upon each impression.


## Validation

See [amp-list rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-list/validator-amp-list.protoascii) in the AMP validator specification.

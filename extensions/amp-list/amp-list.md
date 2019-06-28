---
$category@: dynamic-content
formats:
  - websites
  - email
  - stories
teaser:
  text: Dynamically downloads data and creates list items using a template.
---
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

# amp-list

Fetches content dynamically from a CORS JSON endpoint and renders it
using a supplied template.

<table>
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

The `<amp-list>` component fetches dynamic content from a CORS JSON endpoint. The response from the endpoint contains data, which is rendered in the specified template.

{% call callout('Important', type='caution') %}
Your endpoint must implement the requirements specified in the [CORS Requests in AMP](https://www.ampproject.org/docs/fundamentals/amp-cors-requests) spec.
{% endcall %}

You can specify a template in one of two ways:

- a `template` attribute that references an ID of an existing templating element.
- a templating element nested directly inside the `amp-list` element.

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
Here is how we styled the content fetched:

```css
    amp-list div[role="list"] {
      display: grid;
      grid-gap: 0.5em;
    }
```

## Behavior

The request is always made from the client, even if the document was served from the AMP Cache. Loading is triggered using normal AMP rules depending on how far the element is from the current viewport.

If `<amp-list>` needs more space after loading, it requests the AMP runtime to update its height using the normal AMP flow. If the AMP runtime cannot satisfy the request for the new height, it will display the `overflow` element when available. Notice however, that the typical placement of `<amp-list>` elements at the bottom of the document almost always guarantees that the AMP runtime can resize them.

By default, `<amp-list>` adds a `list` ARIA role to the list element and a `listitem` role to item elements rendered via the template.

### XHR batching

AMP batches XMLHttpRequests (XHRs) to JSON endpoints, that is, you can use a single JSON data request as a data source for multiple consumers (e.g., multiple `<amp-list>` elements) on an AMP page.  For example, if your `<amp-list>` makes an XHR to an endpoint, while the XHR is in flight, all subsequent XHRs to the same endpoint won't trigger and will instead return the results from the first XHR.

In `<amp-list>`, you can use the [`items`](#items-optional) attribute to render a subset of the JSON response, allowing you to have multiple `<amp-list>` elements rendering different content but sharing a single XHR.


### Specifying an overflow

Optionally, the `<amp-list>` element can contain an element with an `overflow` attribute. This element is shown if the AMP Runtime cannot resize the `<amp-list>` element as requested.

*Example: Displaying an overflow when the list needs more space*

In the following example, we display a list of images and titles. Because the `<amp-list>` content requires more space than available, the AMP Runtime displays the overflow element.

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

Optionally, `<amp-list>` supports a placeholder and/or fallback.

- A *placeholder* is a child element with the `placeholder` attribute. This element is shown until the `<amp-list>` loads successfully. If a fallback is also provided, the placeholder is hidden when the `<amp-list>` fails to load.
- A *fallback* is a child element with the `fallback` attribute. This element is shown if the `<amp-list>` fails to load.

Learn more in [Placeholders & Fallbacks](https://www.ampproject.org/docs/guides/responsive/placeholders). Note that a child element cannot be both a placeholder and a fallback.

```html
<amp-list src="https://foo.com/list.json">
  <div placeholder>Loading ...</div>
  <div fallback>Failed to load data.</div>
</amp-list>
```

### Refreshing data

The `<amp-list>` element exposes a `refresh` action that other elements can reference in `on="tap:..."` attributes.

```html
<button on="tap:myList.refresh">Refresh List</button>
<amp-list id="myList" src="https://foo.com/list.json">
  <template type="amp-mustache">
    <div>{{title}}</div>
  </template>
</amp-list>
```

### Dynamic resizing

In several cases, we may need the `<amp-list>` to resize on user interaction. For example, when the `<amp-list>` contains an amp-accordion that a user may tap on, when the contents of the `<amp-list>` change size due to bound CSS classes, or when the number of items inside an `<amp-list>` changes due to a bound `[src]` attribute. The `changeToLayoutContainer` action handles this by changing the amp list to `layout="CONTAINER"` when triggering this action. See the following example:

```html
  <button on="list.changeToLayoutContainer()">Show Grid</button>
  <amp-list id="list"
    width="396" height="80" layout="responsive"
    src="/test/manual/amp-list-data.json?RANDOM">
    <template type="amp-mustache">
      {{title}}
    </template>
  </amp-list>
```

## Attributes

##### src (required)

The URL of the remote endpoint that returns the JSON that will be rendered
within this `<amp-list>`. This must be a CORS HTTP service. The URL's protocol must be HTTPS.

{% call callout('Important', type='caution') %}
Your endpoint must implement the requirements specified in the [CORS Requests in AMP](https://www.ampproject.org/docs/fundamentals/amp-cors-requests) spec.
{% endcall %}

The `src` attribute may be omitted if the `[src]` attribute exists.

If fetching the data at the `src` URL fails, the `<amp-list>` triggers a low-trust `fetch-error` event.

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
By defaut `<amp-list>` expects an array, the `single-item` attribute may be used to load data from an object.

- The default value is `"items"`. The expected response: `{items: [...]}`.
- If the response itself is the desired array, use the value of `"."`. The expected response is: `[...]`.
- Nested navigation is permitted (e.g., `"field1.field2"`). The expected response is: `{field1: {field2: [...]}}`.


When `items="items"` is specified (which, is the default) the response must be a JSON object that contains an array property called `"items"`:
```text
{
  "items": [...]
}
```

##### max-items (optional)

An integer value specifying the maximum length of the items array to be rendered.
The `items` array will be truncated to `max-items` entries if the returned value exceeds `max-items`.

##### single-item (optional)

Causes `<amp-list>` to treat the returned result as if it were a single element array. An object response will be wrapped in an array so
`{items: {...}}` will behave as if it were `{items: [{...}]}`.

##### reset-on-refresh (optional)

Displays a loading indicator and placeholder again when the list's source is refreshed via `amp-bind` or the `refresh()` action.

By default, this will only trigger on refreshes that cause a network fetch. To reset on all refreshes, use `reset-on-refresh="always"`.

##### binding (optional)

For pages using `<amp-list>` that also use `amp-bind`, controls whether or not to block render on the evaluation of bindings (e.g. `[text]`) in rendered children.

We recommend using `binding="no"` or `binding="refresh"` for faster performance.

- `binding="no"`: Never block render **(fastest)**.
- `binding="refresh"`: Don't block render on initial load **(faster)**.
- `binding="always"`: Always block render **(slow)**.

If `binding` attribute is not provided, default is `always`.

##### [is-layout-container] (optional)

This is a bindable attribute that should always be `false` by default. When set to `true` via `amp-bind`, it changes the layout of the `<amp-list>` to `container`. This attribute is useful for handling dynamic resizing for amp-list.

This attribute cannot be true by default for the same reason why `<amp-list>` does not support layout `CONTAINER` &mdash; it can cause content jumping on first load.

Alternatively, one may also use the `changeToLayoutContainer` action.

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Load more and infinite scroll

We've introduced the `load-more` attributes with options `manual` and `auto` to allow pagination and infinite scroll.

#### Sample Usage

```html
<amp-list load-more="auto" src="https://my.rest.endpoint/" width="100" height="200">
  <template type="amp-mustache">
  // ...
  </template>
</amp-list>

```

For working examples, please see [test/manual/amp-list/infinite-scroll-1.amp.html](../../test/manual/amp-list/infinite-scroll-1.amp.html) and [test/manual/amp-list/infinite-scroll-2.amp.html](../../test/manual/amp-list/infinite-scroll-1.amp.html).

### Attributes

#### load-more (mandatory)

This attribute accepts two values: "auto" or "manual". Setting the value of this attribute to "manual" will show a "load-more" button at the end of `<amp-list>`. Setting the value of this attribute to "auto" will cause `<amp-list>` to automatically load more elements three viewports down for an infinite scroll effect.

#### load-more-bookmark (optional)

This attribute specifies a field name in the returned data that will give the url of the next items to load. If this attribute is not specified, `<amp-list>` expects the json payload to have the `load-more-src` field, which corresponds to the next url to load. In the case where this field is called something else, you can specify the name of that field via the `load-more-bookmark` field.E.g. In the following sample payload, we would specify `load-more-bookmark="next"`.

```
{ "items": [...], "next": "https://url.to.load" }
```

### Customizing load-more elements

`<amp-list>` with the `load-more` attribute contains these UI elements: a load-more button, a loader, a load-failed element, and optionally an end-cap marking the end of the list. These elements can be customized by providing `<amp-list-load-more>` elements as children of `<amp-list>` with the following attributes:

#### load-more-button

An `<amp-list-load-more>` element with the `load-more-button` attribute, which shows up at the end of the list (for the manual load-more) if there are more elements to be loaded. Clicking on this element will trigger a fetch to load more elements from the url contained in the `load-more-src` field or the field of the data returned corresponding to the `load-more-bookmark` attribute. This element can be customized by providing `<amp-list>` with a child element that has the attribute `load-more-button`.

##### Example:

```html
<amp-list load-more="manual" src="https://www.load.more.example.com/" width="400" height="800">
  ...
  <amp-list-load-more load-more-button>
    <button>See More</button> /* My custom see more button */
  </amp-list-load-more>
</amp-list>
```
It can be templated via `amp-mustache`.

##### Example:

```html
<amp-list load-more="auto" width="100" height="500" src="https://www.load.more.example.com/">
  ...
  <amp-list-load-more load-more-button>
    <template type="amp-mustache">
      Showing {{#count}} out of {{#total}} items
      <button>
        Click here to see more!
      </button>
    </template>
  </amp-list-load-more>
</amp-list>
```

#### load-more-loading

This element is a loader that will be displayed if the user reaches the end of the list and the contents are still loading, or as a result of clicking on the `load-more-button` element (while the new children of the `<amp-list>` are still loading). This element can be customized by providing `<amp-list>` with a child element that has the attribute `load-more-loading`. Example below:

```html
<amp-list load-more="auto" src="https://www.load.more.example.com/" width="400" height="800">
  ...
  <amp-list-load-more load-more-loading>
    <svg>...</svg> /* My custom loader */
  </amp-list-load-more>
</amp-list>
```

#### load-more-failed

A `<amp-list-load-more>` element containing the `load-more-failed` attribute that contains a button with the `load-more-clickable` attribute that will be displayed at the bottom of the `<amp-list>` if loading failed. Clicking on this element will trigger a reload of the url that failed. This element can be customized by providing `<amp-list>` with a child element that has the attribute `load-more-failed`. Example below:

```html
<amp-list load-more="auto" src="https://www.load.more.example.com/" width="200" height="500">
  ...
  <amp-list-load-more load-more-failed>
    <button>Unable to Load More</button>
  </amp-list-load-more>
</amp-list>
```

In the above example, the entire `load-more-failed` element is clickable. However, a common pattern for this element is a general unclickable "loading failed" element that contains a clickable "reload" button. To account for this, you can have a generally unclickable element with a button containing the `load-more-clickable` element. For example:

```html
<amp-list load-more="auto" src="https://www.load.more.example.com/" width="200" height="500">
  ...
  <amp-list-load-more load-more-failed>
    <div>
      Here is some unclickable text saying sorry loading failed.
    </div>
    <button load-more-clickable>Click me to reload!</button>
  </amp-list-load-more>
</amp-list>
```

#### load-more-end

This element is not provided by default, but if a `<amp-list-load-more>` element containing the `load-more-end` attribute is attached to `<amp-list>` as a child element, this element will be displayed at the bottom of the `<amp-list>` if there are no more items.  This element can be templated via `amp-mustache`. Example below:

```html
<amp-list load-more="auto" src="https://www.load.more.example.com/" width="200" height="500">
  ...
  <amp-list-load-more load-more-end>
    Congratulations! You've reached the end. /* Custom load-end element */
  </amp-list-load-more>
</amp-list>
```

## Substitutions

The `<amp-list>` allows all standard URL variable substitutions.
See the [Substitutions Guide](../../spec/amp-var-substitutions.md) for more info.

For example:
```html
<amp-list src="https://foo.com/list.json?RANDOM"></amp-list>
```
may make a request to something like `https://foo.com/list.json?0.8390278471201` where the RANDOM value is randomly generated upon each impression.


## Validation

See [amp-list rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-list/validator-amp-list.protoascii) in the AMP validator specification.

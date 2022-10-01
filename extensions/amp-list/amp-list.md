---
$category@: dynamic-content
formats:
  - websites
  - stories
  - email
teaser:
  text: Dynamically downloads data and creates list items using a template.
---

# amp-list

## Usage

The `amp-list` component fetches dynamic content from a CORS JSON endpoint.
The response from the endpoint contains data, which is rendered in the specified
template.

[tip type="important"]
Your endpoint must implement the requirements specified in the [CORS Requests in AMP](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests) spec.
[/tip]

You can specify a template in one of two ways:

-   a `template` attribute that references an ID of an existing templating element.
-   a templating element nested directly inside the `amp-list` element.

[tip type="note"]
When using `<amp-list>` in tandem with another templating AMP component, such as `<amp-form>`, note that templates may not nest in valid AMP documents. In this case a valid workaround is to provide the template by `id` via the `template` attribute. Learn more about [nested templates in `<amp-mustache>`](../amp-mustache/amp-mustache.md).
[/tip]

For more details on templates, see [AMP HTML Templates](../../docs/spec/amp-html-templates.md).

### Displaying a dynamic list

In the following example, we retrieve JSON data that contains URLs and titles, and render the content in a nested [amp-mustache template](../amp-mustache/amp-mustache.md).

[example preview="inline" playground="true" imports="amp-list" template="amp-mustache"]

```html
<amp-list
  width="auto"
  height="100"
  layout="fixed-height"
  src="{{server_for_email}}/static/inline-examples/data/amp-list-urls.json"
>
  <template type="amp-mustache">
    {% raw %}
    <div class="url-entry">
      <a href="{{url}}">{{title}}</a>
    </div>
    {% endraw %}
  </template>
</amp-list>
```

[/example]

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
amp-list div[role='list'] {
  display: grid;
  grid-gap: 0.5em;
}
```

The request is always made from the client, even if the document was served from the AMP Cache. Loading is triggered using normal AMP rules depending on how far the element is from the current viewport.

If `<amp-list>` needs more space after loading, it requests the AMP runtime to update its height using the normal AMP flow. If the AMP runtime cannot satisfy the request for the new height, it will display the `overflow` element when available. Notice however, that the typical placement of `<amp-list>` elements at the bottom of the document almost always guarantees that the AMP runtime can resize them.

### Accessibility considerations for `amp-list`

By default, `<amp-list>` adds a `list` ARIA role to the list element and a `listitem` role to item elements rendered via the template. If the list element or any of its children are not "tabbable" (accessible by keyboard keys such as the `a` and `button` elements or any elements with a positive `tabindex`), a `tabindex` of `0` will be added by default to the list item. This behaviour is arguably not always appropriate - generally, only interactive controls/content should be focusable. If you want to suppress this behaviour, make sure to include `tabindex="-1"` as part of the outermost element of your template.

[tip type="important"]
Currently, the rendered list element is declared as an ARIA live region (using `aria-live="polite"`), meaning that any change to the content of the list results in the entire list being read out/announced by assistive technologies (such as screen readers). Due to the way lists are initially rendered, this can also result in lists being announced in their entirety when a page is loaded. To work around this issue for now, you can add `aria-live="off"` to `<amp-list>`, which will override the addition of `aria-live="polite"`.
[/tip]

[tip type="note"]
Note also that a good practice is to provide templates a single top-level element to prevent unintended side effects. This means the following input:

```html
<template type="amp-mustache">
  {% raw %}
  <div class="item">{{item}}</div>
  <div class="price">{{price}}</div>
  {% endraw %}
</template>
```

Would most predictably be applied and rendered if instead provided as follows:

```html
<template type="amp-mustache">
  {% raw %}
  <div>
    <div class="item">{{item}}</div>
    <div class="price">{{price}}</div>
  </div>
  {% endraw %}
</template>
```

[/tip]

### XHR batching

AMP batches XMLHttpRequests (XHRs) to JSON endpoints, that is, you can use a single JSON data request as a data source for multiple consumers (e.g., multiple `<amp-list>` elements) on an AMP page. For example, if your `<amp-list>` makes an XHR to an endpoint, while the XHR is in flight, all subsequent XHRs to the same endpoint won't trigger and will instead return the results from the first XHR.

In `<amp-list>`, you can use the [`items`](#items) attribute to render a subset of the JSON response, allowing you to have multiple `<amp-list>` elements rendering different content but sharing a single XHR.

### Specifying an overflow

Optionally, the `<amp-list>` component can contain an element with the `overflow` attribute. AMP will display this element if all of the following conditions are met:

-   The contents rendered into the `amp-list` exceed its specified size.
-   The bottom of `amp-list` is within the viewport.
-   The bottom of `amp-list` is not near the bottom of the page (defined as the minimum of either the bottom 15% of the document or the bottom 1000px)

If `amp-list` is outside the viewport, it will be automatically expanded.

_Example: Displaying an overflow when the list needs more space_

In the following example, we display a list of images and titles. Because the `<amp-list>` content requires more space than available, the AMP framework displays the overflow element.

[example preview="inline" playground="true" imports="amp-list" template="amp-mustache"]

```html
<amp-list
  width="auto"
  height="140"
  layout="fixed-height"
  src="{{server_for_email}}/static/inline-examples/data/amp-list-data.json"
>
  <template type="amp-mustache">
    {% raw %}
    <div class="image-entry">
      <amp-img src="{{imageUrl}}" width="100" height="75"></amp-img>
      <span class="image-title">{{title}}</span>
    </div>
    {% endraw %}
  </template>
  <div overflow class="list-overflow" style="background-color:red;">
    See more
  </div>
</amp-list>
```

[/example]

AMP applies the following CSS to elements with the `overflow` attribute:

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

-   A _placeholder_ is a child element with the `placeholder` attribute. This element is shown until the `<amp-list>` loads successfully. If a fallback is also provided, the placeholder is hidden when the `<amp-list>` fails to load.
-   A _fallback_ is a child element with the `fallback` attribute. This element is shown if the `<amp-list>` fails to load.

Learn more in [Placeholders & Fallbacks](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/placeholders). Note that a child element cannot be both a placeholder and a fallback.

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

[filter formats="websites, stories"]
In several cases, we may need the `<amp-list>` to resize on user interaction. For example, when the `<amp-list>` contains an amp-accordion that a user may tap on, when the contents of the `<amp-list>` change size due to bound CSS classes, or when the number of items inside an `<amp-list>` changes due to a bound `[src]` attribute. The `changeToLayoutContainer` action handles this by changing the amp list to `layout="CONTAINER"` when triggering this action. See the following example:
[/filter]<!-- formats="websites, stories" -->

[filter formats="email"]
In several cases, we may need the `<amp-list>` to resize on user interaction. For example, when the `<amp-list>` contains an amp-accordion that a user may tap on, when the contents of the `<amp-list>` change size due to bound CSS classes. The `changeToLayoutContainer` action handles this by changing the amp list to `layout="CONTAINER"` when triggering this action. See the following example:
[/filter]<!-- formats="email" -->

```html
<button on="tap:list.changeToLayoutContainer()">Show Grid</button>
<amp-list
  id="list"
  width="396"
  height="80"
  layout="responsive"
  src="/test/manual/amp-list-data.json?RANDOM"
>
  <template type="amp-mustache">
    {{title}}
  </template>
</amp-list>
```

[filter formats="websites, stories"]

### Initialization from amp-state

In most cases, you’ll probably want to have `<amp-list>` request JSON from a server. But `<amp-list>` can also use JSON you’ve included in an `<amp-state>`, right there in your HTML! This means rendering can occur without an additional server call, although, of course, if your page is served from an AMP cache, the data may not be fresh.

Here’s how to have `<amp-list>` render from an `<amp-state>`:

1. Add the [amp-bind](https://amp.dev/documentation/components/amp-bind/) script to your document's `<head>`.
2. Use the `amp-state:` protocol in your `<amp-list>`’s src attribute, like this:
   `<amp-list src="amp-state:localState">`

Note that `<amp-list>` treats your JSON in the same way whether it’s requested from your server or pulled from a state variable. The format required doesn’t change.

See below for a full example,

```html
<amp-state id="localState">
  <script type="application/json">
    {
      "items": [{"id": 1}, {"id": 2}, {"id": 2}]
    }
  </script>
</amp-state>
<amp-list src="amp-state:localState">
  <template type="amp-mustache">
    <li>{{id}}</li>
  </template>
</amp-list>
```

### Using amp-script as a data source

You may use an exported `<amp-script>` function as the data source for `<amp-list>`. This enables you to flexibly combine and transform server responses before handoff to `<amp-list>`. The required format is the `<amp-script>` ID and the function name separated by a period, e.g. `amp-script:id.functionName`.

See below for an example:

```html
<!--
  See the [amp-script](https://amp.dev/documentation/components/amp-script/) documentation to setup the component and export your function>
-->
<amp-script id="dataFunctions" script="local-script" nodom></amp-script>
<script id="local-script" type="text/plain" target="amp-script">
  function getRemoteData() {
    return fetch('https://example.com')
      .then(resp => resp.json())
      .then(transformData)
  }
  exportFunction('getRemoteData', getRemoteData);
</script>

<!-- "exported-functions" is the <amp-script> id, and "getRemoteData" corresponds to the exported function. -->
<amp-list
  id="amp-list"
  width="auto"
  height="100"
  layout="fixed-height"
  src="amp-script:dataFunctions.getRemoteData"
>
  <template type="amp-mustache">
    <div>{{.}}</div>
  </template>
</amp-list>
```

[tip type="important"]
When using `<amp-script>` as merely a data-layer with no DOM manipulation, you may benefit from the [nodom](https://amp.dev/documentation/components/amp-script/#attributes) attribute. It improves the performance of the `<amp-script>`.
[/tip]

### Load more and infinite scroll

The `load-more` attribute has options `manual` and `auto` to allow pagination and infinite scroll.

```html
<amp-list
  load-more="auto"
  src="https://my.rest.endpoint/"
  width="100"
  height="200"
>
  <template type="amp-mustache">
    // ...
  </template>
</amp-list>
```

For working examples, please see [test/manual/amp-list/infinite-scroll-1.amp.html](../../test/manual/amp-list/infinite-scroll-1.amp.html) and [test/manual/amp-list/infinite-scroll-2.amp.html](../../test/manual/amp-list/infinite-scroll-1.amp.html).

[tip type="important"]

When using `<amp-list>` infinite scroll, content placed below the component may not be accessible, and it is recommended to place the infinite scroll content at the bottom of the document.

When using `<amp-list>` infinite scroll in conjunction with `<amp-analytics>` scroll triggers, it is recommended to make use of the `useInitialPageSize` property of `<amp-analytics>` to get a more accurate measurement of the scroll position that ignores the height changes caused by `<amp-list>`.

Without `useInitialPageSize`, the `100%` scroll trigger point might never fire as more documents get loaded. Note that this will also ignore the size changes caused by other extensions (such as expanding embedded content) so some scroll events might fire prematurely instead.
[/tip]

### Customizing load-more elements

`<amp-list>` with the `load-more` attribute contains these UI elements: a load-more button, a loader, a load-failed element, and optionally an end-cap marking the end of the list. These elements can be customized by providing `<amp-list-load-more>` elements as children of `<amp-list>` with the following attributes:

#### load-more-button

An `<amp-list-load-more>` element with the `load-more-button` attribute, which shows up at the end of the list (for the manual load-more) if there are more elements to be loaded. Clicking on this element will trigger a fetch to load more elements from the url contained in the `load-more-src` field or the field of the data returned corresponding to the `load-more-bookmark` attribute. This element can be customized by providing `<amp-list>` with a child element that has the attribute `load-more-button`.

### Accessibility considerations for infinite scroll lists

Be careful when using infinite scroll lists - if there is any content after the list (including a standard footer or similar), users won't be able to reach it until all list items have been loaded/displayed. This can make the experience frustrating or even impossible to overcome for users. See [Adrian Roselli: So you think you've built a good infinite scroll](https://adrianroselli.com/2014/05/so-you-think-you-built-good-infinite.html).

##### Example:

```html
<amp-list
  load-more="manual"
  src="https://www.load.more.example.com/"
  width="400"
  height="800"
>
  ...
  <amp-list-load-more load-more-button>
    <!-- My custom see more button -->
    <button>See More</button>
  </amp-list-load-more>
</amp-list>
```

It can be templated via `amp-mustache`.

##### Example:

```html
<amp-list
  load-more="auto"
  width="100"
  height="500"
  src="https://www.load.more.example.com/"
>
  ...
  <amp-list-load-more load-more-button>
    <template type="amp-mustache">
      Showing {% raw %}{{#count}}{% endraw %} out of {% raw %}{{#total}}{%
      endraw %} items
      <button>Click here to see more!</button>
    </template>
  </amp-list-load-more>
</amp-list>
```

#### `load-more-loading`

This element is a loader that will be displayed if the user reaches the end of the list and the contents are still loading, or as a result of clicking on the `load-more-button` element (while the new children of the `<amp-list>` are still loading). This element can be customized by providing `<amp-list>` with a child element that has the attribute `load-more-loading`. Example below:

```html
<amp-list
  load-more="auto"
  src="https://www.load.more.example.com/"
  width="400"
  height="800"
>
  ...
  <amp-list-load-more load-more-loading>
    <!-- My custom loader -->
    <svg>...</svg>
  </amp-list-load-more>
</amp-list>
```

#### `load-more-failed`

A `<amp-list-load-more>` element containing the `load-more-failed` attribute that contains a button with the `load-more-clickable` attribute that will be displayed at the bottom of the `<amp-list>` if loading failed. Clicking on this element will trigger a reload of the url that failed. This element can be customized by providing `<amp-list>` with a child element that has the attribute `load-more-failed`. Example below:

```html
<amp-list
  load-more="auto"
  src="https://www.load.more.example.com/"
  width="200"
  height="500"
>
  ...
  <amp-list-load-more load-more-failed>
    <button>Unable to Load More</button>
  </amp-list-load-more>
</amp-list>
```

In the above example, the entire `load-more-failed` element is clickable. However, a common pattern for this element is a general unclickable "loading failed" element that contains a clickable "reload" button. To account for this, you can have a generally unclickable element with a button containing the `load-more-clickable` element. For example:

```html
<amp-list
  load-more="auto"
  src="https://www.load.more.example.com/"
  width="200"
  height="500"
>
  ...
  <amp-list-load-more load-more-failed>
    <div>
      Here is some unclickable text saying sorry loading failed.
    </div>
    <button load-more-clickable>Click me to reload!</button>
  </amp-list-load-more>
</amp-list>
```

#### `load-more-end`

This element is not provided by default, but if a `<amp-list-load-more>` element containing the `load-more-end` attribute is attached to `<amp-list>` as a child element, this element will be displayed at the bottom of the `<amp-list>` if there are no more items. This element can be templated via `amp-mustache`. Example below:

```html
<amp-list
  load-more="auto"
  src="https://www.load.more.example.com/"
  width="200"
  height="500"
>
  ...
  <amp-list-load-more load-more-end>
    <!-- Custom load-end element -->
    Congratulations! You've reached the end.
  </amp-list-load-more>
</amp-list>
```

### Substitutions

The `<amp-list>` allows all standard URL variable substitutions.
See the [Substitutions Guide](../../docs/spec/amp-var-substitutions.md) for more info.

For example:

```html
<amp-list src="https://foo.com/list.json?RANDOM"></amp-list>
```

may make a request to something like `https://foo.com/list.json?0.8390278471201` where the RANDOM value is randomly generated upon each impression.

[/filter]<!-- formats="websites, stories" -->

## Attributes

### `src` (required)

[filter formats="websites, stories"]

The URL of the remote endpoint that returns the JSON that will be rendered
within this `<amp-list>`. There are three valid protocols for the `src` attribute.

1. **https**: This must refer to a CORS HTTP service. Insecure HTTP is not supported.
2. **amp-state**: For initializing from `<amp-state>` data. See [Initialization from `<amp-state>`](#initialization-from-amp-state) for more details.
3. **amp-script**: For using `<amp-script>` functions as the data source. See [Using `<amp-script>` as a data source](#using-amp-script-as-a-data-source) for more details.
   [/filter]<!-- formats="websites, stories" -->

[filter formats="email"]

The URL of the remote endpoint that returns the JSON for amp-list to render. This must refer to a CORS HTTP service and Insecure HTTP is not supported.

[/filter]<!-- formats="email" -->

[tip type="important"]
Your endpoint must implement the requirements specified in the [CORS Requests in AMP](https://www.ampproject.org/docs/fundamentals/amp-cors-requests) spec.
[/tip]

If fetching the data at the `src` URL fails, the `<amp-list>` triggers a low-trust `fetch-error` event.

[filter formats="websites, stories"]
The `src` attribute may be omitted if the `[src]` attribute exists. `[src]` supports URL and non-URL expression values; see `amp-list` in [`amp-bind` element specific attributes documentation](https://amp.dev/documentation/components/amp-bind/#element-specific-attributes) for details.
[/filter]<!-- formats="websites, stories" -->

[filter formats="websites, stories"]

### `credentials`

Defines a `credentials` option as specified by the [Fetch API](https://fetch.spec.whatwg.org/).

-   Supported values: `omit`, `include`
-   Default: `omit`

To send credentials, pass the value of `include`. If this value is set, the response must follow the [AMP CORS security guidelines](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests/#cors-security-in-amp).

Here's an example that specifies including credentials to display personalized content in a list:

```html
<amp-list
  credentials="include"
  src="<%host%>/json/product.json?clientId=CLIENT_ID(myCookieId)"
>
  <template type="amp-mustache">
    Your personal offer: ${{price}}
  </template>
</amp-list>
```

[/filter]<!-- formats="websites, stories" -->

### `items`

Defines the expression to locate the array to be rendered within the response. This is a dot-notated expression that navigates via fields of the JSON response.
By defaut `<amp-list>` expects an array, the `single-item` attribute may be used to load data from an object.

-   The default value is `"items"`. The expected response: `{items: [...]}`.
-   If the response itself is the desired array, use the value of `"."`. The expected response is: `[...]`.
-   Nested navigation is permitted (e.g., `"field1.field2"`). The expected response is: `{field1: {field2: [...]}}`.

When `items="items"` is specified (which, is the default) the response must be a JSON object that contains an array property called `"items"`:

```text
{
  "items": [...]
}
```

### `max-items`

An integer value specifying the maximum length of the items array to be rendered.
The `items` array will be truncated to `max-items` entries if the returned value exceeds `max-items`.

### `single-item`

Causes `<amp-list>` to treat the returned result as if it were a single element array. An object response will be wrapped in an array so
`{items: {...}}` will behave as if it were `{items: [{...}]}`.

[filter formats="websites, stories"]

### `xssi-prefix`

Causes `<amp-list>` to strip a prefix from the fetched JSON before parsing. This can be useful for APIs that include [security prefixes](http://patorjk.com/blog/2013/02/05/crafty-tricks-for-avoiding-xssi/) like `)]}` to help prevent cross site scripting attacks.

For example, lets say we had an API that returned this response:

```
)]}{ "items": ["value"] }
```

We could instruct `amp-list` to remove the security prefix like so:

```html
<amp-list xssi-prefix=")]}" src="https://foo.com/list.json"></amp-list>
```

[/filter]<!-- formats="websites, stories" -->

[filter formats="websites, stories"]

### `reset-on-refresh`

Displays a loading indicator and placeholder again when the list's source is refreshed via `amp-bind` or the `refresh()` action.

By default, this will only trigger on refreshes that cause a network fetch. To reset on all refreshes, use `reset-on-refresh="always"`.
[/filter]<!-- formats="websites, stories" -->

### `binding`

For pages using `<amp-list>` that also use `amp-bind`, controls whether or not to block render on the evaluation of bindings (e.g. `[text]`) in rendered children.

We recommend using `binding="no"` or `binding="refresh"` for faster performance.

-   `binding="no"`: Never block render **(fastest)**.
-   `binding="refresh"`: Don't block render on initial load **(faster)**.
-   `binding="always"`: Always block render **(slow)**.

If `binding` attribute is not provided, default is `always`.

[filter formats="websites, stories"]

<!-- prettier-ignore-start -->
<!-- See: https://github.com/remarkjs/remark/issues/456 -->
### `[is-layout-container]`
<!-- prettier-ignore-end-->

This is a bindable attribute that should always be `false` by default. When set to `true` via `amp-bind`, it changes the layout of the `<amp-list>` to `container`. This attribute is useful for handling dynamic resizing for amp-list.

This attribute cannot be true by default for the same reason why `<amp-list>` does not support layout `CONTAINER` &mdash; it can cause content jumping on first load.

Alternatively, one may also use the `changeToLayoutContainer` action.

#### `load-more`

This attribute accepts two values: "auto" or "manual". Setting the value of this attribute to "manual" will show a "load-more" button at the end of `<amp-list>`. Setting the value of this attribute to "auto" will cause `<amp-list>` to automatically load more elements three viewports down for an infinite scroll effect.

#### `load-more-bookmark`

This attribute specifies a field name in the returned data that will give the url of the next items to load. If this attribute is not specified, `<amp-list>` expects the json payload to have the `load-more-src` field, which corresponds to the next url to load. In the case where this field is called something else, you can specify the name of that field via the `load-more-bookmark` field.E.g. In the following sample payload, we would specify `load-more-bookmark="next"`.

```js
{ "items": [...], "next": "https://url.to.load" }
```

[/filter] <!-- formats="websites, stories" -->

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

[filter formats="email"]

##### Invalid AMP email attributes

The AMP for Email spec disallows the use of the following attributes on the AMP email format.

-   `[src]`
-   `[state]`
-   `[is-layout-container]`
-   `auto-resize`
-   `credentials`
-   `data-amp-bind-src`
-   `load-more`
-   `load-more-bookmark`
-   `reset-on-refresh`
-   `xssi-prefix`

[/filter] <!-- formats="email" -->

## Validation

See [amp-list rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-list/validator-amp-list.protoascii) in the AMP validator specification.

---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Renders remote or inline data using a template.
---

<!--
  All documentation starts with frontmatter. Front matter organizes documentation on amp.dev
  and improves SEO.
  * Include the relevant category(ies): ads-analytics, dynamic-content, layout, media, presentation, social, personalization
  * List applicable format(s): websites, ads, stories, email
  * Do not include markdown formatting in the frontmatter - plain text and punctionation only!
  * Remove this comment!
-->

<!--
Copyright 2021 The AMP HTML Authors. All Rights Reserved.

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

# amp-render

<!--
  If the component is relevant for more than one format and operates differently between these
  formats, include and filter multiple content blocks and code samples.
-->

## Usage

The `amp-render` component fetches dyanmic content from a CORS JSON endpoint, inline `amp-state` or `amp-script` and renders it in the specified template.

[tip type="important"]
Your endpoint must implement the requirements specified in the [CORS Requests in AMP](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests) spec.
[/tip]

You can specify a template in one of two ways:

-   a `template` attribute that references an ID of an existing templating element.
-   a templating element nested directly inside the `amp-render` element.

[tip type="note"]
When using `<amp-render>` in tandem with another templating AMP component, such as `<amp-form>`, note that templates may not nest in valid AMP documents. In this case a valid workaround is to provide the template by `id` via the `template` attribute. Learn more about [nested templates in `<amp-mustache>`](../amp-mustache/amp-mustache.md).
[/tip]

For more details on templates, see [AMP HTML Templates](../../spec/amp-html-templates.md).

<!--
  * [Read more about filtering sections](https://amp.dev/documentation/guides-and-tutorials/contribute/contribute-documentation/formatting/?format=websites#filtering-sections)
  * [Read more about executable code samples](https://amp.dev/documentation/guides-and-tutorials/contribute/contribute-documentation/formatting/?format=websites#preview-code-samples)
 -->

### Standalone use outside valid AMP documents (optional)

<!-- TODO: Remove backticks from link when guide is live -->

Bento AMP allows you to use AMP components in non-AMP pages without needing to commit to fully valid AMP. You can take these components and place them in implementations with frameworks and CMSs that don't support AMP. Read more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

#### Example

The example below demonstrates `amp-render` component in standalone use.

[example preview="top-frame" playground="false"]

```
<head>
...
<script async src="https://cdn.ampproject.org/v0.js"></script>
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-render-1.0.css">
<script async custom-element="amp-render" src="https://cdn.ampproject.org/v0/amp-render-1.0.js"></script>
...
</head>
<amp-render>
  ...
</amp-render>
<button id="element-id">
  Event Trigger
</button>
<script>
  example of one API usage
</script>
```

[/example]

#### Interactivity and API usage

Bento enabled components in standalone use are highly interactive through their API. In Bento standalone use, the element's API replaces AMP Actions and events and [`amp-bind`](https://amp.dev/documentation/components/amp-bind/?format=websites).

The `amp-render` component API is accessible by including the following script tag in your document:

```
await customElements.whenDefined('amp-render-component');
const api = await Render.getApi();
```

The `amp-render` API allows you to register and respond to the following events:

**event 1**
Explanation of event, proper syntax/arguments.

```
example
```

**event 2**
Explanation of event, proper syntax/arguments.

```
example
```

**action 1**
Explanation of action, proper syntax/arguments.

```
example
```

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-render-1.0.css">
```

Fully valid AMP pages use the AMP layout system to infer sizing of elements to create a page structure before downloading any remote resources. However, Bento use imports components into less controlled environments and AMP's layout system is inaccessible.

**Container type**

The `amp-render` component has a container/non-container layout type. To ensure the component renders correctly, apply the following styles:

```css
example
```

**style/layout guidelines 2 (optional)**

Information on how to layout and style `amp-render`.

```
example
```

### Behavior users should be aware of (optional)

What to do if they want behavior. How to work around it.

```html
<amp-render required-attribute>
  Code sample of behavior or behavior workaround.
</amp-render>
```

### Behavior restrictions

What is allowed, what isn't.

## Attributes

### `attribute-name`

### `src` (required)

[filter formats="websites"]

The URL of the remote endpoint that returns the JSON that will be rendered
within this `<amp-render>`. There are three valid protocols for the `src` attribute.

1. **https**: This must refer to a CORS HTTP service. Insecure HTTP is not supported.
2. **amp-state**: For initializing from `<amp-state>` data. See [Initialization from `<amp-state>`](#initialization-from-amp-state) for more details.
3. **amp-script**: For using `<amp-script>` functions as the data source. See [Using `<amp-script>` as a data source](#using-amp-script-as-a-data-source) for more details.

The URL of the remote endpoint that returns the JSON for amp-render to render. This must refer to a CORS HTTP service and Insecure HTTP is not supported.


[tip type="important"]
Your endpoint must implement the requirements specified in the [CORS Requests in AMP](https://www.ampproject.org/docs/fundamentals/amp-cors-requests) spec.
[/tip]

If fetching the data at the `src` URL fails, `<amp-render>` triggers a low-trust `fetch-error` event.

The `src` attribute may be omitted if the `[src]` attribute exists. `[src]` supports URL and non-URL expression values; see `amp-render` in [`amp-bind` element specific attributes documentation](https://amp.dev/documentation/components/amp-bind/#element-specific-attributes) for details.


### `credentials`

Defines a `credentials` option as specified by the [Fetch API](https://fetch.spec.whatwg.org/).

-   Supported values: `omit`, `include`
-   Default: `omit`

To send credentials, pass the value of `include`. If this value is set, the response must follow the [AMP CORS security guidelines](https://www.ampproject.org/docs/fundamentals/amp-cors-requests#cors-security-in-amp).

Here's an example that specifies including credentials to display personalized content:

```html
<amp-render
  credentials="include"
  src="<%host%>/json/product.json?clientId=CLIENT_ID(myCookieId)"
>
  <template type="amp-mustache">
    Your personal offer: ${{price}}
  </template>
</amp-render>
```

### `xssi-prefix`

Causes `<amp-render>` to strip a prefix from the fetched JSON before parsing. This can be useful for APIs that include [security prefixes](http://patorjk.com/blog/2013/02/05/crafty-tricks-for-avoiding-xssi/) like `)]}` to help prevent cross site scripting attacks.

For example, let's say we had an API that returned this response:

```json
)]}{ "items": ["value"] }
```

We could instruct `amp-render` to remove the security prefix like so:

```html
<amp-render xssi-prefix=")]}" src="https://example.com/data.json"></amp-render>
```

[/filter]<!-- formats="websites, stories" -->

### `key`

Defines the expression to locate the sub-object to be rendered within the response. For example, let's say we had an API that returned this response:

```json
{
  "automobiles": {
    "cars": [
      {
        "make": "BMW",
        "model": "M3"
      },
      {
        "make": "Tesla",
        "model": "Model X"
      }
    ],
    "trucks": [
      {
        "make": "Ford",
        "model": "F-150"
      },
      {
        "make": "Chevy",
        "model": "Silverado"
      }
    ]
  }
}
```

If we just want to display the cars from the response, we can do that using the `key` attribute.

```html
<amp-render src="https://example.com/data.json" key="automobiles.cars">
  <template type="amp-mustache">
    <ul>
    {{#cars}}
      <li>{{model}} by {{make}}</li>
    {{/cars}}
    </ul>
  </template>
</amp-render>
```
### `binding`

For pages using `<amp-list>` that also use `amp-bind`, controls whether or not to block render on the evaluation of bindings (e.g. `[text]`) in rendered children.

We recommend using `binding="no"` or `binding="refresh"` for faster performance.

-   `binding="no"`: Never block render **(fastest)**.
-   `binding="refresh"`: Don't block render on initial load **(faster)**.
-   `binding="always"`: Always block render **(slow)**.

If `binding` attribute is not provided, default is `always`.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.



## Actions

The `<amp-list>` element exposes a `refresh` action that other elements can reference in `on="tap:..."` attributes.

```html
<button on="tap:myList.refresh">Refresh List</button>
<amp-list id="myList" src="https://foo.com/data.json">
  <template type="amp-mustache">
    <div>{{title}}</div>
  </template>
</amp-list>
```

#### Valid AMP

Syntax and argument details for use in fully valid AMP pages.

[example preview=”top-frame” playground=”true”]

```html
<head>
  <script
    custom-element="amp-render"
    async
    src="https://cdn.ampproject.org/v0/amp-render-latest.js"
  ></script>
</head>
<body>
  <amp-render
    required-attribute
    on="event-name: my-button.show"
  >
    Hello World!
  </amp-render>
  <button id="my-button" hidden>
    Here I am!
  </button>
</body>
```

[/example]


## Accessibility

For `amp-render` instances that do not have an aria-live attribute,  `aria-live="polite"` will be added so any changes to the content are announced by screen readers. To override the addition of `aria-live="polite"`, add `aria-live="off"`.

## Validation

See [amp-render rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-render/validator-amp-render.protoascii) in the AMP validator specification.

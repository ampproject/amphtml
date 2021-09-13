---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Infinite scrolling experience for document-level page recommendations.
---

# amp-next-page

## Usage

The `<amp-next-page>` component loads content pages one after another creating an infinite scroll experience.

### Configure and load pages

Specify pages in a JSON configuration. Load the JSON configuration from a remote URL with the `src` attribute, or inline it within a `<script>` child element of `<amp-next-page>`. You may specify both a remote URL and inline a JSON object for a quicker suggestion loading speed.

Documents append to the end of the current document as a child of the `<amp-next-page>` element. To prevent shifting page content down, this component must be the last child of the document `<body>`. If needed, any footer content should be embedded inside the `<amp-next-page>` tag (by adding a container that has the `footer` attribute) and will be displayed once no more article suggestions are available.

The code sample below shows an example configuration for one article, which is the same format used by both the inline and remote configurations

```json
{
  "image": "https://example.com/image.jpg",
  "title": "This article shows next",
  "url": "https://example.com/article.amp.html"
}
```

Each page object must have the following key/value pairs:

| Key     | Value                                                                                                                                                            |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`   | String URL of the page. Must be on the same origin as the current document. URLs will automatically be rewritten to point to the Google AMP cache when required. |
| `title` | String title of the page, will be used when rendering the recommendation box.                                                                                    |
| `image` | String URL of the image to display in the recommendation box.                                                                                                    |

#### Inline Configuration

Inline a JSON configuration in the `<amp-next-page>` component by placing it inside a child `<script>` element.

```html
<amp-next-page>
  <script type="application/json">
    [
      {
        "url": ...,
        "title": ...,
        "image": ...
      },
      ...
    ]
  </script>
</amp-next-page>
```

When only using an inline configuration, `deep-parsing` (see the [Attributes section](https://amp.dev/documentation/components/amp-next-page/#attributes)) is enabled by default. This allows it to parse more suggestions by recursively looking at inline configurations inside `<amp-next-page>` tags on the loaded documents.

The documents render in the order they appear on the JSON configuration. `amp-next-page` queues all defined document suggestions in the original host document's `<amp-next-page>` configuration then appends the rendered pages defined documents to the queue as the user scrolls through them.

The following configuration recommends two more documents for the user to read.

```html
<amp-next-page>
  <script type="application/json">
    [
      {
        "image": "https://example.com/image1.jpg",
        "title": "This article shows first",
        "url": "https://example.com/article1.amp.html"
      },
      {
        "image": "https://example.com/image2.jpg",
        "title": "This article shows second",
        "url": "https://example.com/article2.amp.html"
      }
    ]
  </script>
</amp-next-page>
```

#### Load configuration from a remote URL

Use the `src` attribute to point to the remote JSON configuration.

```html
<amp-next-page src="https://example.com/next-page-config.json"></amp-next-page>
```

Structure remote configurations like the example below. This configuration provides two more documents and tells `amp-next-page` to query `https://example.com/more-pages` once the user scrolls through both.

```json
{
  "pages": [
    {
      "image": "https://example.com/image1.jpg",
      "title": "This article shows first",
      "url": "https://example.com/article1.amp.html"
    },
    {
      "image": "https://example.com/image2.jpg",
      "title": "This article shows second",
      "url": "https://example.com/article2.amp.html"
    }
  ],
  "next": "https://example.com/more-pages"
}
```

Remote configurations require the server to return a JSON object with the `pages` key/value pair and allows for an optional `next` key/value pair.

| Key               | Value                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages`           | Array of pages. The array contains all page object definitions as defined above.                                                                        |
| `next` (optional) | String URL pointing to the next remote JSON configuration. This should abide by the same rules as the initial URL, implementing the CORS requirements.) |

##### URL substitutions

The `amp-next-page` `src` allows all standard URL variable substitutions. See the [Substitutions Guide](../../docs/spec/amp-var-substitutions.md) for more info. For example:

```html
<amp-next-page src="https://foo.com/config.json?RANDOM"></amp-next-page>
```

This URL may make a request to something like `https://foo.com/config.json?0.8390278471201` where the RANDOM value is randomly generated upon each impression.

### Recommendation box (more suggested links)

The `<amp-next-page>` component renders the recommendation box if one of the following situations arise:

-   The user reaches the end of the page before the next page had loaded.
-   The next page fails to load.
-   If the [`max-pages`](<https://amp.dev/documentation/components/amp-next-page/#max-pages+(optional)>) attribute is specified and the number of displayed pages is met.

The recommendation box contains links to the remaining pages. The default recommendation box renders the specified `image` and `title` used in the JSON configuration. It can be styled as specified in the [Styling](https://amp.dev/documentation/components/amp-next-page/#styling) section.

#### Custom recommendation box

Customize the recommendation box by defining an element with the `recommendation-box` attribute inside the `<amp-next-page>` component. Display the remaining pages by templating the recommendation box with `amp-mustache` or another templating engine. Whem using templates, an array `pages` of remaining documents is passed to the template, including the `title`, `url`, and `image`.

```html
<amp-next-page src="https://example.com/config.json">
  <div recommendation-box class="my-custom-recommendation-box">
    Here are a few more articles:
    <template type="amp-mustache">
      <div class="recommendation-box-content">
        {{#pages}}
        <span class="title">{{title}}</span>
        <span class="url">{{url}}</span>
        <span class="image">{{image}}</span>
        {{/pages}}
      </div>
    </template>
  </div>
</amp-next-page>
```

### Separator

The `<amp-next-page>` component renders a separator between each document. The default separator is a full-width grey line. Refer to the [Styling](https://amp.dev/documentation/components/amp-next-page/#styling) section to change the default style.

#### Custom separator

Alternatively, it is possible to create a custom separator by defining an element with the `separator` attribute inside the `<amp-next-page>` component. Display information about the next article by templating the custom separator with `amp-mustache` or another templating engine. When using templates, the `title`, `url` and `image` of the upcoming article are passed to the template.

```html
<amp-next-page src="https://example.com/config.json">
  <div separator class="my-custom-separator">
    <template type="amp-mustache">
      <div class="my-custom-separator-content">
        <amp-img
          src="{{image}}"
          layout="fixed"
          height="16"
          width="16"
        ></amp-img>
        <span>Next article: {{title}}</span>
      </div>
    </template>
  </div>
</amp-next-page>
```

### Preventing page element duplication

Hide elements which are common across multiple loaded pages by using the `next-page-hide` attribute. Hiding certain elements helps create an uncluttered infinite scroll experience. Such considerations include:

-   Avoiding stacking common page elements, such as footers.
-   Avoiding duplicate page headers in subsequent pages
-   Preventing multiple sidebars, etc.

Elements with the `next-page-hide` attribute are set to `display: none` when loaded as a suggestion inside `<amp-next-page>`. These elements are visible when the document is loaded as a top-level host.

```html
<header class="my-header" next-page-hide>
  <h2>Text here.</h2>
</header>
```

In some cases, you may want to preserve the last instance of elements with fixed position and multiple instances. Such elements may include sticky ads, sticky footers, or notification banners. In this case, the `next-page-replace` attribute comes in handy. To preserve the last instance, choose a common identifying value for each of these types of elements. Use that common identifying value as the `next-page-replace` attribute's value on each element instance.

In the following example, as the user scrolls down, the first sticky element will get replaced by the second instance of the type.

_on the first document_

```html
<div class="sticky" next-page-replace="sticky-123">
  <h2>The second sticky will replace me once you scroll past my page</h2>
</div>
```

_on the second document_

```html
<div class="sticky" next-page-replace="sticky-123">
  <h2>I replaced the first instance of my type (sticky-123)</h2>
</div>
```

### Footer elements

Since `<amp-next-page>` should be the last element of the body, footer content (that should be displayed after all documents are shown) must go inside the `<amp-next-page>`. Add a container element that has the `footer` attribute and have your content be a descendent of it.

```html
<amp-next-page>
  <script type="application/json">
    ...
  </script>
  <div footer>
    My footer content here
  </div>
</amp-next-page>
```

### Migrating from 0.1

The experimental `0.1` version of `amp-next-page` had a similar but more restricted API. Version `1.0` allows for an infinite number of suggestions and has advanced features such as templated separators and recommendation box. To make use of these features, follow these instructions:

1. Update your `<script custom-element>` tag to link to the `1.0` bundle of `amp-next-page`
2. Make sure that `amp-next-page` is the last child of the body element, move any footers or other components that used to follow `<amp-next-page>` inside a container that has the `footer` attribute within the `<amp-next-page>` tag.
3. If you were using an inline configuration, the JSON config is now an `array` of pages instead of an `object` with a `pages` entry. Additionally, you must rename the `ampUrl` key of each page to `url`.
    ```html
    <amp-next-page>
      <!-- BEFORE: amp-next-page 0.1 -->
      <script type="application/json">
        {
          "pages": [
            {
              "image": "https://example.com/image1.jpg",
              "title": "This article shows first",
              "ampUrl": "https://example.com/article1.amp.html"
            }
          ],
          "hideSelectors": [".header", ".main footer", "#navigation"]
        }
      </script>
      <!-- AFTER: amp-next-page 1.0 -->
      <script type="application/json">
        [
          {
            "image": "https://example.com/image1.jpg",
            "title": "This article shows first",
            // `ampUrl` was renamed to `url`
            "url": "https://example.com/article1.amp.html"
          }
        ]
        // Instead of `hideSelectors`, use the `next-page-hide` attribute
      </script>
    </amp-next-page>
    ```

## Attributes

### `src`

The `src` attribute points to the remote endpoint that returns `amp-next-page`'s JSON configuration. This must be A CORS HTTP service. The URL's protocol must be HTTPS.

[tip type="important"]
Your endpoint must implement the requirements specified in the [CORS Requests in AMP](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests) spec.
[/tip]

The `src` attribute is a required attribute, unless the `<amp-next-page>` component contains an inline JSON configuration.

### `max-pages` (optional)

The maximum number of pages to load and show to the user. The maximum number should be less than the total amount of pages. After meeting the number, `<amp-next-page>` displays the recommendation box. The default is `Infinity`.

### `deep-parsing` (optional)

The `deep-parsing` attribute enables recursive parsing of subsequently loaded documents's `<amp-next-page>` JSON configurations.

This is the default behavior when `<amp-next-page>` inlines the JSON configuration. You may disable it by setting `deep-parsing="false"`. This is not the default behavior when `<amp-next-page>` points to a remote JSON configuration. You may enable it by setting `deep-parsing="true"`.

### `xssi-prefix` (optional)

When specified, this attribute enables `amp-next-page` to strip a prefix before parsing remotely hosted JSON. This can be useful for APIs that include [security prefixes](http://patorjk.com/blog/2013/02/05/crafty-tricks-for-avoiding-xssi/) like `)]}` to help prevent cross site scripting attacks.

## Styling

The `<amp-next-page>` component renders a default recommendation box and separator. You may style the appearance of these two elements as follows:

### Style the default recommendation box

You may add custom CSS styles to the default recommendation box. It exposes the following classes:

-   `.amp-next-page-links` for the parent container element
-   `.amp-next-page-link` for an individual article which contains:
-   `.amp-next-page-image` for the link image
-   `.amp-next-page-text` for the link text

### Style the default page separator

Each document loads with a full-width gray horizontal line to separate it from the previous page. It is possible to customize the default separator through CSS using the `.amp-next-page-separator` class:

```css
.amp-next-page-separator {
  background-color: red;
  height: 5px;
}
```

## Analytics

The `<amp-next-page>` component supports analytics on the hosted page as well as on subsequently loaded articles. We recommend using the same analytics triggers used on standalone articles, including scroll-bound triggers.

[tip type="important"]
Tracking page views is supported through [`<amp-pixel>`](../../src/builtins/amp-pixel/amp-pixel.md) or `<amp-analytics>` on the host page. It is recommended to use the `useInitialPageSize` property of `<amp-analytics>` to get a more accurate measurement of the scroll triggers otherwise the host page's `100%` trigger point would only be fired after the user scrolled past all sub-documents. Note that this will also ignore the size changes caused by other extensions (such as expanding embedded content) so some scroll events might fire prematurely instead.
[/tip]

Two custom analytics events are also provided on the host page to indicate transitioning between pages. These events can be tracked in the [amp-analytics](https://amp.dev/documentation/components/amp-analytics) config as follows:

| Event                  | Fired when                                                |
| ---------------------- | --------------------------------------------------------- |
| `amp-next-page-scroll` | The user scrolls to a new page.                           |
| `amp-next-page-click`  | The user click on an article from the recommendation box. |

Both `<amp-next-page>` specific triggers provide the variables `url` and `title`. The `title` and `url` refer to the scrolled-to page or the clicked article. The following code sample demonstrates their use:

```html
<amp-analytics>
  <script type="application/json">
    {
      "requests": {
        "nextpage": "https://foo.com/pixel?RANDOM&toURL=${toURL}"
      },
      "triggers": {
        "trackScrollThrough": {
          "on": "amp-next-page-scroll",
          "request": "nextpage"
        },
        "trackClickThrough": {
          "on": "amp-next-page-click",
          "request": "nextpage"
        }
      }
    }
  </script>
</amp-analytics>
```

## Accessibility

The default recommendation box and default separator both have a generic, non-localized `aria-label` describing their content. If this label is not satisfactory, please consider using a custom recommendation box or separator element to improve accessibility.

Both the default recommendation box and default separator are keyboard-focusable. When a custom separator is provided, its `tabindex` is preserved if present, otherwise a `tabindex` of `0` will be added to the given element.

## Version notes

| Version | Description                                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | Support for an infinite number of page recommendations, reduced bundle size, improved API, support for amp-analytics, templated separators and recommendation box, better handling of fixed elements.<br><br>API changes are breaking, please take a look at the [migration section](https://amp.dev/documentation/components/amp-next-page/#migrating-from-0.1) for details. |
| 0.1     | Initial experimental implementation. Limited to three recommended documents                                                                                                                                                                                                                                                                                                   |

## Validation

See [amp-next-page rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-next-page/validator-amp-next-page.protoascii)
in the AMP validator specification.

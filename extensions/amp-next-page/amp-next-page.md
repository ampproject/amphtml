---
\$category@: dynamic-content
formats:
  - websites
teaser:
  text: Infinite scrolling experience for document-level page recommendations.
experimental: true
---

<!--
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

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

# amp-next-page

## Version notes

| Version | Description                                                                                                                                                                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0     | Support for an infinite number of page recommendations, reduced bundle size, improved API, support for amp-analytics, templated separators and footers, better handling of fixed elements.<br><br>API changes are breaking, please take a look at the migration section for details. |
| 0.1     | Initial experimental implementation. Limited to three recommended documents                                                                                                                                                                                                          |

## Usage

The `<amp-next-page>` component loads content pages one after another creating an infinite-scroll experience.

### Configure and load pages

Specify pages in a JSON configuration. Load the JSON configuration from a remote URL with the `src` attribute, or inline it within a `<script>` child element of `<amp-next-page>`. You may choose to both specify a remote URL and inline the JSON object in order to speed up the initial loading of suggestions. In case the `deep-parsing` attribute is present, `<amp-next-page>` will also recursively read suggestions from each loaded document's `<amp-next-page>` element. The component automatically handles loading and unloading the documents from memory for a smooth user experience.

Documents append to the end of the current document as a child of the `<amp-next-page>` element. To prevent shifting page content down, this component must be the last child of the document `<body>`. If needed, any footer content should be embedded inside the `<amp-next-page>` tag and will be displayed once no more article suggestions are available.

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

The inline configuration defines the documents recommended by `amp-next-page` to
the user as an ordered array of page objects in JSON format.

Each page object should have the following key/value pairs:

| Key                | Value                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url` (required)   | String URL of the page. Must be on the same origin as the current document. URLs will automatically be rewritten to point to the Google AMP cache when required. |
| `title` (required) | String title of the page, will be used when rendering the recommendation box.                                                                                    |
| `image` (required) | String URL of the image to display in the recommendation box.                                                                                                    |

To enable for an infinite loading experience without the need for a server-side configuration (remote-loading), `amp-next-page` automatically enables `deep-parsing` (see Attributes), which allows it to parse more suggestions by recursively looking at inline configurations inside `<amp-next-page>` tags on the loaded documents. To disable this behavior, set `deep-parsing` to `false`.

The following configuration will recommend two more documents for the user to read.

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

Structure remote configurations like the example below. The following configuration returned from the server will recommend two more documents for the user to read and tell `amp-next-page` to query `https://example.com/more-pages` once the user scrolls through both provided documents.

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

For remote configuration, the destination server is required to return a JSON object that has the following key/value pairs:

| Key                | Value                                                                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages` (required) | Array of pages, exactly the same format as the in the inline configration section above.                                                                             |
| `next` (optional)  | Optional string url pointing to the next remote to query for more pages (should abide by the same rules as the initial URL, namely implement the CORS requirements.) |

##### URL substitutions

The `amp-next-page` `src` allows all standard URL variable substitutions. See the [Substitutions Guide](../../spec/amp-var-substitutions.md) for more info. For example:

```html
<amp-next-page src="https://foo.com/config.json?RANDOM"></amp-next-page>
```

This URL may make a request to something like `https://foo.com/config.json?0.8390278471201` where the RANDOM value is randomly generated upon each impression.

### Footer recommendation box

The `<amp-next-page>` component renders the footer recommendation box if one of the following situations arise:

- The user reaches the end of the page before the next page had loaded.
- The next page fails to load.
- If the [`max-pages`](https://amp.dev/documentation/components/amp-next-page/#max-pages) attribute is specified and the number of displayed pages is met.

The footer recommendation box contains links to the remaining pages. The default footer recommendation box renders the specified image and title used in the JSON configuration and can be styled as specified in the [Styling](https://amp.dev/documentation/components/amp-next-page/#Styling) section.

The footer recommendation box can also be provided as a custom component inside `<amp-next-page>` as any element that has the `footer`. It can also be templated via `amp-mustache` or other templating engines, in which case it will be passed an array of the remaining `pages`, each being an object with a `title`, `url` and `image`. Example:

```html
<amp-next-page src="https://example.com/config.json">
  <div footer class="my-custom-footer">
    Here are a few more articles:
    <template type="amp-mustache">
      <div class="footer-content">
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

A separator is rendered between each loaded document. By default this is
rendered as a full-width horizontal rule. Refer to the [Styling](https://amp.dev/documentation/components/amp-next-page/#Styling) section for information on customizing this default behavior.

Alternatively, you can specify a custom separator containing arbitrary HTML
content as a child of the `amp-next-page` component by using the `separator`
attribute. Similar to the footer box, custom separator can be templated via `amp-mustache` or other templating engines, and will be passed the `title`, `url` and `image` of the upcoming article.

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

### Element hiding/replacing

Hide elements which are common across multiple loaded pages by using the `next-page-hide` attribute. Hiding certain elements helps create an uncluttered infinite scroll experience. Such considerations include:

- Avoiding stacking common page elements, such as footers.
- Avoiding duplicate page headers in subsequent pages
- Preventing multiple sidebars, etc.

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

### Migrating from 0.1

The experimental `0.1` version of `amp-next-page` had a similar but more restricted API. Version `1.0` allows for an infinite number of suggestions and has advanced features such as templated separators and footers. To make use of these features, follow these instructions:

1. Update your `<script custom-element>` tag to link to the `1.0` bundle of `amp-next-page`
2. Make sure that `amp-next-page` is the last child of the body element, move any footers or other components that used to follow `<amp-next-page>` inside the `<amp-next-page>` tag.
3. If you were using an inline configuration, the JSON config is now an `array` of pages instead of an `object` with a `pages` entry. Additionally, the `ampUrl` key of each page entry was renamed to `url`.
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

The maximum number of pages to load and show to the user. The maximum number should be less than the total amount of pages. After meeting the number, <amp-next-page> displays the footer recommendation box. The default is `Infinity`.

### `deep-parsing` (optional)

When specified, the `deep-parsing` attribute enables recursive parsing of inline JSON configurations from subsequently loaded documents. This only works if the loaded documents contain an `<amp-next-page>` tag.

This behavior is the default if the `<amp-next-page>` component only specifies an inline configuration. If the `<amp-next-page>` component loads the configuration remotely this behavior is disabled by default unless `deep-parsing` is set to `true`.

### `xssi-prefix` (optional)

When specified, this attribute enables `amp-next-page` to strip a prefix before parsing remotely hosted JSON. This can be useful for APIs that include [security prefixes](http://patorjk.com/blog/2013/02/05/crafty-tricks-for-avoiding-xssi/) like `)]}` to help prevent cross site scripting attacks.

## Styling

The `<amp-next-page>` component renders a default recommendation box and separator. You may style the appearance of these two elements as follows:

### Style the default footer recommendation box

You may add custom CSS styles to the default footer recommendation box. It exposes the following classes:

- `.amp-next-page-footer` for the parent container element
- `.amp-next-page-footer-content` for the wrapping element
- `.amp-next-page-footer-article` for an individual article which contains:
- `.amp-next-page-footer-image` for the link image
- `.amp-next-page-footer-text` for the link text

### Style the default page separator

The default separator (shown between article recommendations) is a simple gray horizontal rule, although this can be customized through CSS by applying styles to the `.amp-next-page-separator` class, templating the separator allows for more flexibility in styling and allows the integration of the title, image and URL of the upcoming article into the separator's appearance.

## Analytics

The `<amp-next-page>` component supports analytics on the hosted page as well as on subsequently loaded articles. We recommend using the same analytics triggers used on standalone articles, including scroll-bound triggers. Two custom analytics events are also provided on the host page to indicate transitioning between pages. These events can be tracked in the [amp-analytics](https://amp.dev/documentation/components/amp-analytics) config as follows:

| Event                  | Fired when                                                       |
| ---------------------- | ---------------------------------------------------------------- |
| `amp-next-page-scroll` | The user scrolls to a new page.                                  |
| `amp-next-page-click`  | The user click on an article from the footer/recommendation box. |

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

The default footer and default separator both present a generic, non-localized `aria-label` describing their content. If this label is not satisfactory, please consider using a custom footer or separator element to improve accessibility.

Both the default footer and default separator are keyboard-focusable. When a custom separator is provided, its `tabindex` is preserved if present, otherwise a `tabindex` of `0` will be added to the given element.

## Validation

See [amp-next-page rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-next-page/validator-amp-next-page.protoascii)
in the AMP validator specification.

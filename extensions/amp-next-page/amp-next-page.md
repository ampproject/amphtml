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

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Infinite scrolling experience for document-level page recommendations.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><a href="https://amp.dev/documentation/guides-and-tutorials/learn/experimental">Experimental</a> <a href="https://github.com/ampproject/amphtml/blob/3a06c99f259b66998b61935a5ee5f0075481bfd2/tools/experiments/README.md#enable-an-experiment-for-a-particular-document"> (Document opt-in allowed)</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td>      
      <code>
        &lt;script async custom-element="amp-next-page"
        src="https://cdn.ampproject.org/v0/amp-next-page-1.0.js">&lt;/script>
      </code>
    </td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>N/A</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://amp.dev/documentation/examples/components/amp-next-page/">amp-next-page example</a>.</td>
  </tr>
</table>

## Version notes

| Version | Description                                                                                                                                                                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0     | Support for an infinite number of page recommendations, reduced bundle size, improved API, support for amp-analytics, templated separators and footers, better handling of fixed elements.<br><br>API changes are breaking, please take a look at the migration section for details. |
| 0.1     | Initial experimental implementation. Limited to three recommended documents                                                                                                                                                                                                          |

## Usage

Given a list of pages, `amp-next-page` tries to load them after the current
document, providing an infinite-scroll experience.

Pages should be specified in a JSON config loaded from a remote URL listed in
the element `src`, or inlined as a `script` element child (or both).

```html
<amp-next-page src="https://example.com/next-page-config.json"></amp-next-page>
<!-- Or -->
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

If loading the next document is successful it will be appended to the end of
the current document as a child of the `amp-next-page` component. Because of this the component must be the last child of the body element, for
example, at the end of a news article or recipe. If needed, any footer content should be embedded inside the `<amp-next-page>` tag and will be displayed once no more article suggestions are available.

The component will render an infinite number of articles so long as more unique suggestions are provided (either by the remote server through the `src` attribute or by parsing suggestions from the `<amp-next-page>` inline configurations on subsequently loaded documents through the `deep-parsing` attribute). `<amp-next-page>` automatically handles loading and unloading of documents from memory to retain a smooth experience.

### Footer Recommendation Box

If the user reaches the end of a page before the next has loaded, or if the
next page fails to load or if the maximum number of recommendations is reached (as specified by `max-pages`) a box will be displayed with links to the remaining pages. See the Styling section for information on how to customize the default recommendation box.

The footer / recommendation box can also be templated via `amp-mustache` or other templating engines, and will be passed an array of the remaining `pages`, each being a page object containing a `title`, `url` and `image`. Example:

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
rendered as a full-width hairline. Refer to the Styling section for information on customizing this default behavior.

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

### Element hiding

Elements which are common across multiple pages can be programmatically
hidden in child documents, to avoid e.g. stacking up multiple page footers at
the end of the document, or to hide the page header from each subsequent page.

Elements can be hidden by adding the `next-page-hide` attribute. Elements that have this attribute will be set to `display: none` when the document is loaded as a suggestion inside `<amp-next-page>` but will be visible when the document is loaded as a top-level host (not embedded).

```html
<header class="my-header" next-page-hide>
  <h2>Text here.</h2>
</header>
```

In the case of fixed position elements that have multiple instances (e.g. sticky ads, sticky footers, notification banners, etc.), it might make sense to only preserve the last instance and have each page replace the element when it becomes visible. To achieve this behavior, it is possible to add the `next-page-replace` attribute and give it a common identifier accross all similar instances. In the following example, as the user scrolls down, the first sticky element will get replaced by the second instance of the type.

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

### Inline Configuration

The inline configuration defines the documents recommended by `amp-next-page` to
the user as an ordered array of page objects in JSON format.

Each page object should have the following format:

| Key                | Value                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url` (required)   | String URL of the page. Must be on the same origin as the current document. URLs will automatically be rewritten to point to the Google AMP cache when required. |
| `title` (required) | String title of the page, will be used when rendering the recommendation box                                                                                     |
| `image` (required) | String URL of the image to display in the recommendation box                                                                                                     |

To enable for an infinite loading experience without the need for a server-side configuration (remote-loading), `amp-next-page` automatically enables `deep-parsing` (see Attributes), which allows it to parse more suggestions by recursively looking at inline configurations inside `<amp-next-page>` tags on the loaded documents. To disable this behavior, set `deep-parsing` to `false`.

#### Example Inline Configuration

The following configuration will recommend two more documents for the user to read.

```json
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
```

### Remote Configuration

For remote configuration, the destination server is required to return a JSON object that has the following structure:

| Key                | Value                                                                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages` (required) | Array of pages, exactly the same format as the in the inline configration section above.                                                                             |
| `next` (optional)  | Optional string url pointing to the next remote to query for more pages (should abide by the same rules as the initial URL, namely implement the CORS requirements.) |

#### Example Remote Configuration

The following configuration returned from the server will recommend two more documents for the user to read and tell `amp-next-page` to query `https://example.com/more-pages` when the user finishes reading the provided recommendations.

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

## Attributes

### `attribute-name`

Description of attribute. Use cases for this attribute.

- `attribute-value-option-one` (default): `attribute-option-one-value` does this to `${name}`.
- `attribute-value-option-two`: `attribute-option-two-value` does this to `${name}`.

### `optional-attribute-name` (optional)

Here, I write what `optional-attribute-name` will do to `${name}`.

## Actions (optional)

### `src`

The URL of the remote endpoint that returns the JSON that will be used to
configure this `amp-next-page` component. This must be a CORS HTTP service.
The URL's protocol must be HTTPS.

{% call callout('Important', type='caution') %} Your endpoint must implement
the requirements specified in the CORS Requests in AMP spec. {% endcall %}

The `src` attribute is required unless a config has been specified inline.

### `max-pages` (optional)

The maximum number of pages to load and show to the user. When this number is exceeded, the footer box will be shown with links to the remaining articles. The default is `Infinity`.

### `deep-parsing` (optional)

When specified, this attribute allows `amp-next-page` to recursively parse inline configuration from the loaded documents (if the documents themselves contain an `<amp-next-page>` tag). This behavior is enabled by default when using an inline configuration and disabled by default when using a remote configuration.

### `xssi-prefix` (optional)

When specified, this attribute allows `amp-next-page` to strip a prefix from the fetched JSON before parsing. This can be useful for APIs that include [security prefixes](http://patorjk.com/blog/2013/02/05/crafty-tricks-for-avoiding-xssi/) like `)]}` to help prevent cross site scripting attacks.

## Styling

Several CSS classes are exposed to provide flexibility in customizing the appearance of `<amp-next-page>` as follows:

### Styling the default footer

The default footer / recommendation box (that appears when no more suggestions are available or the suggestions exceed the maximum specified number of pages) can be styled by appling CSS styles to the following classes:

- `.amp-next-page-footer` for the parent container element
- `.amp-next-page-footer-content` for the wrapping element
- `.amp-next-page-footer-article` for an individual article which contains:
- `.amp-next-page-footer-image` for the link image
- `.amp-next-page-footer-text` for the link text

### Styling the default separator

The default separator (shown between article recommendations) is a simple gray hairline, although this can be customized through CSS by applying styles to the `.amp-next-page-separator` class, templating the separator allows for more flexibility in styling and allows the integration of the title, image and URL of the upcoming article into the separator's appearance.

## Analytics

Full support for analytics is included on the host page as well as subsequently loaded articles. It is recommended to simply use the same analytics triggers used on standalone articles (including scroll-bound triggers). However, a single custom analytics event is also provided on the host page to indicate transitioning between pages. This event can be tracked in the [amp-analytics](https://amp.dev/documentation/components/amp-analytics) config:

| Event                  | Fired when                                                      |
| ---------------------- | --------------------------------------------------------------- |
| `amp-next-page-scroll` | The user scrolls to a new page                                  |
| `amp-next-page-click`  | The user click on an article from the footer/recommendation box |

Both of the `triggers` provide the variables `url` and `title` referring to the page of interest. They can be used as follows:

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

## Substitutions

The `amp-next-page` src allows all standard URL variable substitutions. See
the [Substitutions Guide](../../spec/amp-var-substitutions.md) for more info.

For example:

```html
<amp-next-page src="https://foo.com/config.json?RANDOM"></amp-next-page>
```

may make a request to something like
`https://foo.com/config.json?0.8390278471201` where the RANDOM value is
randomly generated upon each impression.

## Accessibility

The default footer and default separator both present a generic, non-localized `aria-label` describing their content. If this label is not satisfactory, please consider using a custom footer/separator element to improve accessibility.

Both the default footer and default separator are keyboard-focusable. When a custom separator is provided, its `tabindex` is preserved if present, otherwise a `tabindex` of `0` will be added to the given element.

## Validation

See [amp-next-page rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-next-page/validator-amp-next-page.protoascii)
in the AMP validator specification.

---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Dynamically loads more documents recommended for the user.
experimental: true
---

# amp-next-page

## Usage

Dynamically loads more documents recommended for the user.

Given a list of pages, `amp-next-page` tries to load them after the current
document, providing an infinite-scroll type experience.

Pages should be specified in a JSON config loaded from a remote URL listed in
the element `src`, or inlined as a `script` element child.

```html
<amp-next-page src="https://example.com/next-page-config.json"></amp-next-page>
<!-- Or -->
<amp-next-page>
  <script type="application/json">
    {
      "pages": ...
    }
  </script>
</amp-next-page>
```

If loading the next document is successful it will be appended to the end of
the current document as a child of the `amp-next-page` component, moving any
content after it further down the page. Because of this the component should
usually be placed directly after the unique content of a given page: for
example, at the end of a news article or recipe, but before the footer or
other content repeated across articles.

The component will render a total maximum of three documents on screen in a
component will render a maximum of three documents (total) on screen at one single instance. This limit may be changed or removed in the future.

[tip type="important"]
**Important** [`<amp-analytics>`](../../amp-analytics/amp-analytics.md) is [currently unsupported](https://github.com/ampproject/amphtml/issues/15807) on pages users land on through `<amp-next-page>`.
Tracking page views is supported through [`<amp-pixel>`](../../../src/builtins/amp-pixel/amp-pixel.md) or `<amp-analytics>` on the host page.
[/tip]

### Configuration spec

The configuration defines the documents recommended by `amp-next-page` to
the user as a JSON object.

| Key                | Value                                                             |
| ------------------ | ----------------------------------------------------------------- |
| `pages` (required) | Ordered array of one or more page objects                         |
| `hideSelectors`    | Optional array of string CSS selectors to hide in child documents |

Each page object should have the following format:

| Key                   | Value                                                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ampUrl` (required)   | String URL of the page. Must be on the same origin as the current document. URLs will automatically be rewritten to point to the Google AMP cache when required. |
| `title` (required)    | String title of the page, will be used when rendering the recommendation box                                                                                     |
| `imageUrl` (required) | String URL of the image to display in the recommendation box                                                                                                     |

### Recommendation box

If the user reaches the end of a page before the next has loaded (or if the
next page fails to load), a box will be displayed with links to the next three
pages. This box will also be displayed after the maximum number of articles
have been rendered.

The appearance of these links can be customized by styling the following
classes:

-   `.amp-next-page-links` for the containing element
-   `.amp-next-page-link` for an individual link
-   `.amp-next-page-image` for the link image
-   `.amp-next-page-text` for the link text

### Separator

A separator is rendered between each loaded document. By default this is
rendered as a full-width hairline. It can be customised by styling the `.amp-next-page-default-separator` class.

Alternatively, you can specify a custom separator containing arbitrary HTML
content as a child of the `amp-next-page` component by using the `separator`
attribute.

```html
<amp-next-page src="https://example.com/config.json">
  <div separator>
    <h1>Keep reading</h1>
  </div>
</amp-next-page>
```

### Element hiding

Elements which are common across multiple pages can be programmatically
hidden in child documents, to avoid e.g. stacking up multiple page footers at
the end of the document, or to hide the page header from each subsequent page.

Elements can be hidden by specifying one or more string CSS selectors in the
`hideSelectors` key of the element config. Elements matching any of the
selectors will be set to `display: none` in all child documents.

```html
<amp-next-page>
  <script type="application/json">
    {
      "hideSelectors": [
        ".header",
        ".main footer",
        "#navigation"
      ],
      "pages": ...
    }
  </script>
</amp-next-page>
```

### Substitutions

The `amp-next-page` src allows all standard URL variable substitutions. See
the [Substitutions Guide](../../../docs/spec/amp-var-substitutions.md) for more info.

For example:

```html
<amp-next-page src="https://foo.com/config.json?RANDOM"></amp-next-page>
```

may make a request to something like
`https://foo.com/config.json?0.8390278471201` where the RANDOM value is
randomly generated upon each impression.

## Attributes

### `src`

The URL of the remote endpoint that returns the JSON that will be used to
configure this `amp-next-page` component. This must be a CORS HTTP service.
The URL's protocol must be HTTPS. Your endpoint must implement
the requirements specified in the CORS Requests in AMP spec.

The `src` attribute is required unless a config has been specified inline.
|

### Example configuration

The following configuration will recommend two more documents for the user to
read, and hides the header and footer elements from each child document.

```json
{
  "pages": [
    {
      "image": "https://example.com/image1.jpg",
      "title": "This article shows first",
      "ampUrl": "https://example.com/article1.amp.html"
    },
    {
      "image": "https://example.com/image2.jpg",
      "title": "This article shows second",
      "ampUrl": "https://example.com/article2.amp.html"
    }
  ],
  "hideSelectors": [".header", ".footer"]
}
```

## Analytics

Partial support for analytics is included through the initial host page via two separate events. These are triggered by `<amp-next-page>` and you can track them in your [amp-analytics](https://amp.dev/documentation/components/amp-analytics) config:

| Event                  | Fired when                                               |
| ---------------------- | -------------------------------------------------------- |
| `amp-next-page-scroll` | The user scrolls to a new page                           |
| `amp-next-page-click`  | The user click on an article from the recommendation box |

Both of the `triggers` provide the variables `fromUrl` and `toUrl` referring to the previous and current pages. They can be used as follows:

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

## Validation

See
[amp-next-page rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-next-page/validator-amp-next-page.protoascii)
in the AMP validator specification.

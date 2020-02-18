---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Infinite scrolling experience for document-level page recommendations.
experimental: true
---

<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

Infinite scrolling experience for document-level page recommendations.

<table>
  <tr>
    <td><strong>Availability</strong></td>
    <td><a href="https://amp.dev/documentation/guides-and-tutorials/learn/experimental">Experimental</a> <a href="https://github.com/ampproject/amphtml/blob/3a06c99f259b66998b61935a5ee5f0075481bfd2/tools/experiments/README.md#enable-an-experiment-for-a-particular-document"> (Document opt-in allowed)</a></td>
  </tr>
  <tr>
    <td><strong>Required Script</strong></td>
    <td>
      <code>
        &lt;script async custom-element="amp-next-page"
        src="https://cdn.ampproject.org/v0/amp-next-page-1.0.js">&lt;/script>
      </code>
    </td>
  </tr>
  <tr>
    <td>
      <strong>
        <a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a>
      </strong>
    </td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://amp.dev/documentation/examples/components/amp-next-page/">amp-next-page example</a>.</td>
  </tr>
</table>

[TOC]

## Version notes

| Version | Description                                                                                                                                                                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0     | Support for an infinite number of page recommendations, reduced bundle size, improved API, support for amp-analytics, templated separators and footers, better handling of fixed elements.<br><br>API changes are breaking, please take a look at the migration section for details. |
| 0.1     | Initial experimental implementation. Limited to three recommended documents                                                                                                                                                                                                          |

## Behavior

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

### Analytics triggers

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

### Footer Recommendation Box

If the user reaches the end of a page before the next has loaded, or if the
next page fails to load or if the maximum number of recommendations is reached (as specified by `max-pages`) a box will be displayed with links to the remaining pages.

The appearance of these links can be customized by styling the following
classes:

- `.amp-next-page-footer` for the parent container element
- `.amp-next-page-footer-content` for the wrapping element
- `.amp-next-page-footer-article` for an individual article which contains:
- `.amp-next-page-footer-image` for the link image
- `.amp-next-page-footer-text` for the link text

The footer can be templated via `amp-mustache` or other templating engines, and will be passed an array of the remaining `pages`, each being a page object containing a `title`, `url` and `image`.

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
rendered as a full-width hairline. It can be customised by styling the `.amp-next-page-separator` class.

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

## Attributes

<table>
  <tr>
    <td width="40%"><strong>src</strong></td>
    <td>The URL of the remote endpoint that returns the JSON that will be used to
configure this <code>amp-next-page</code> component. This must be a CORS HTTP service.
The URL's protocol must be HTTPS.
<br><br>
{% call callout('Important', type='caution') %} Your endpoint must implement
the requirements specified in the CORS Requests in AMP spec. {% endcall %}
<br><br>
The <code>src</code> attribute is required unless a config has been specified inline.</td>
  </tr>

  <tr>
    <td width="40%"><strong>max-pages</strong></td>
    <td>(optional) The maximum number of pages to load and show to the user. When this number is exceeded, the footer box will be shown with links to the remaining articles. The default is <code>Infinity</code>.</td>
  </tr>

  <tr>
    <td width="40%"><strong>deep-parsing</strong></td>
    <td>When specified, this attribute allows <code>amp-next-page</code> to recursively parse inline configuration from the loaded documents (if the documents themselves contain an <code>amp-next-page</code> tag). This behavior is enabled by default when using an inline configuration and disabled by default when using a remote configuration.</td>
  </tr>

  <tr>
    <td width="40%"><strong>xssi-prefix</strong></td>
    <td>When specified, this attribute allows <code>amp-next-page</code> to strip a prefix from the fetched JSON before parsing. This can be useful for APIs that include <a href="http://patorjk.com/blog/2013/02/05/crafty-tricks-for-avoiding-xssi/">security prefixes</a> like <code>)]}</code> to help prevent cross site scripting attacks.</td>
  </tr>

</table>

## Inline Configuration

The inline configuration defines the documents recommended by `amp-next-page` to
the user as an ordered array of page objects in JSON format.

Each page object should have the following format:

| Key                | Value                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url` (required)   | String URL of the page. Must be on the same origin as the current document. URLs will automatically be rewritten to point to the Google AMP cache when required. |
| `title` (required) | String title of the page, will be used when rendering the recommendation box                                                                                     |
| `image` (required) | String URL of the image to display in the recommendation box                                                                                                     |

To enable for an infinite loading experience without the need for a server-side configuration (remote-loading), `amp-next-page` automatically enables `deep-parsing` (see Attributes), which allows it to parse more suggestions by recursively looking at inline configurations inside `<amp-next-page>` tags on the loaded documents. To disable this behavior, set `deep-parsing` to `false`.

### Example configuration

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

## Remote configuration

For remote configuration, the destination server is required to return a JSON object that has the following structure:

| Key                | Value                                                                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages` (required) | Array of pages, exactly the same format as the in the inline configration section above.                                                                             |
| `next` (optional)  | Optional string url pointing to the next remote to query for more pages (should abide by the same rules as the initial URL, namely implement the CORS requirements.) |

### Example configuration

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

## Validation

See
[amp-next-page rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-next-page/validator-amp-next-page.protoascii)
in the AMP validator specification.

## Migrating from 0.1

`<amp-next-page>` version `0.1` was experimental and had a limit set on the number of pages that can be loaded. As of 2020-02-18, version `0.1` is considered deprecated, and will be removed soon. The stable `1.0` version removes the limit on the number of page suggestions to enable a true infinite scrolling. We recommend manually migrating your pages to version `1.0` soon to ensure functionality and proper design and to make use of the new features included in `1.0`.

#### Placement and Interaction with the footer

Starting with `1.0`, `<amp-next-page>` is required to be the last element of the body of the document in order to prevent content shifting while loading more articles. To add a footer to your document (shown once no more suggested articles are found), place your footer element **inside** the `amp-next-page` element. There is no limit on the number of elements you can place inside `<amp-next-page>`.

#### Configuration and Element hiding

The inline and remote configuration have been simplified in `1.0` to require a single array of pages instead of a JSON object. Inside the pages array, the `ampUrl` key was renamed to `url`. See the following migration example:

`amp-next-page` configuration (`0.1`)

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

`amp-next-page` configuration (`1.0`)

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

The `hideSelectors` key has been removed and element hiding is now handled on the embedded document side by adding the attributes `next-page-hide` or `next-page-replace` to the desired elements (see the Element hiding section).

#### Analytics

The previously built-in `amp-analytics` custom event `amp-next-page-scroll-back` has been removed while others (namely `amp-next-page-scroll` and `amp-next-page-click`) have been simplified in favor for native support of `amp-analytics` inside the host documents and each of the embedded documents (see the Analytics section).

#### CSS Selectors

The CSS class for targeting the default separator has been renamed from `.amp-next-page-default-separator` to simply `.amp-next-page-separator`. The default recommendation box / footer (which is displayed whenever the host page is out of suggestions) is can be targetted through a slightly changed structure:

```html
<div class="amp-next-page-footer">
  <div class="amp-next-page-footer-content">
    <a class="amp-next-page-footer-article">
      <img ref="image" class="amp-next-page-footer-image" />
      <span ref="title" class="amp-next-page-footer-title"></span>
    </a>
    ...
  </div>
</div>
```

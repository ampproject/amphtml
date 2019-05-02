---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Dynamically loads more documents recommended for the user.
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

Dynamically loads more documents recommended for the user.

<table>
  <tr>
    <td><strong>Availability</strong></td>
    <td><a href="https://amp.dev/documentation/guides-and-tutorials/learn/experimental.html">Experimental</a> <a href="https://github.com/ampproject/amphtml/blob/3a06c99f259b66998b61935a5ee5f0075481bfd2/tools/experiments/README.md#enable-an-experiment-for-a-particular-document"> (Document opt-in allowed)</a></td>
  </tr>
  <tr>
    <td><strong>Required Script</strong></td>
    <td>
      <code>
        &lt;script async custom-element="amp-next-page"
        src="https://cdn.ampproject.org/v0/amp-next-page-0.1.js">&lt;/script>
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
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-next-page/">amp-next-page example</a>.</td>
  </tr>
</table>

[TOC]

## Behavior

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

{% call callout('Note', type='note') %} For performance reasons the
component will render a maximum of three documents (total) on screen at one
time. This limit may be changed or removed in the future.
{% endcall %}

### Recommendation box

If the user reaches the end of a page before the next has loaded (or if the
next page fails to load), a box will be displayed with links to the next three
pages. This box will also be displayed after the maximum number of articles
have been rendered.

The appearance of these links can be customized by styling the following
classes:

- `.amp-next-page-links` for the containing element
- `.amp-next-page-link` for an individual link
- `.amp-next-page-image` for the link image
- `.amp-next-page-text` for the link text

### Separator

A separator is rendered between each loaded document. By default this is
rendered as a full-width hairline. It can be customised by styling the `
.amp-next-page-default-separator` class.

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
</table>

## Configuration spec

The configuration defines the documents recommended by `amp-next-page` to
the user as a JSON object.

| Key                | Value |
| ------------------ | ----- |
| `pages` (required) | Ordered array of one or more page objects |
| `hideSelectors`    | Optional array of string CSS selectors to hide in child documents |

Each page object should have the following format:

| Key                   | Value |
| --------------------- | ----- |
| `ampUrl` (required)   | String URL of the page. Must be on the same origin as the current document. URLs will automatically be rewritten to point to the Google AMP cache when required. |
| `title` (required)    | String title of the page, will be used when rendering the recommendation box |
| `imageUrl` (required) | String URL of the image to display in the recommendation box |

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
  "hideSelectors": [
    ".header",
    ".footer"
  ]
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

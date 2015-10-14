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

# AMP HTML ⚡

AMP HTML is a subset of HTML for authoring content pages such as news articles in a way that guarantees certain baseline performance characteristics.

Being a subset of HTML, it puts some restrictions on the full set of tags and functionality available through HTML but it does not require the development of new rendering engines: Existing user agents can render AMP HTML just like all other HTML.

Also, AMP HTML documents can be uploaded to a web server and served just like any other HTML document; no special configuration for the server is necessary. However, they are also designed to be optionally served through specialized AMP serving systems that proxy AMP documents. These documents serve them from their own origin and are allowed to apply transformations to the document that provide additional performance benefits. An incomplete list of optimizations such a serving system might do is:

- Replace image references with images sized to the viewer’s viewport.
- Inline images that are visible above the fold.
- Inline CSS variables.
- Preload extended components.
- Minify HTML and CSS.

AMP HTML uses a set of contributed but centrally managed and hosted custom elements to implement advanced functionality such as image galleries that might be found in an AMP HTML document. While it does allow styling the document using custom CSS, it does not allow author written JavaScript beyond what is provided through the custom elements to reach its performance goals.

By using this AMP format, content producers are making the content in AMP files available to be crawled, cached, and displayed by third parties.

## Performance

Predictable performance is a key design goal for AMP HTML. Primarily we are aiming at reducing the time until the content of a page can be consumed / used by the user.
In concrete terms this means that:

- HTTP requests necessary to render and fully layout the document should be minimized.
- Resources such as images or ads should only be downloaded if they are likely to be seen by the user.
- Browsers should be able to calculate the space needed by every resource on the page without fetching that resource.

## The AMP HTML format

### Sample document

```html
<!doctype html>
<html ⚡>
  <head>
    <meta charset="utf-8">
    <title>Sample document</title>
    <link rel="canonical" href="./regular-html-version.html">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <style amp-custom>
      h1 {color: red}
    </style>
    <script type="application/ld+json">
    {
      "@context": "http://schema.org",
      "@type": "NewsArticle",
      "headline": "Article headline",
      "image": [
        "thumbnail1.jpg"
      ],
      "datePublished": "2015-02-05T08:00:00+08:00"
    }
    </script>
    <script async custom-element="amp-carousel" src="https://cdn.ampproject.org/v0/amp-carousel-0.1.js"></script>
    <style>body {opacity: 0}</style><noscript><style>body {opacity: 1}</style></noscript>
    <script async src="https://cdn.ampproject.org/v0.js"></script>
  </head>
  <body>
    <h1>Sample document</h1>
    <p>
      Some text
      <amp-img src=sample.jpg width=300 height=300></amp-img>
    </p>
    <amp-ad width=300 height=250
        type="a9"
        data-aax_size="300x250"
        data-aax_pubname="test123"
        data-aax_src="302">
    </amp-ad>
  </body>
</html>
```

### Required markup

AMP HTML documents MUST

- <a name="dctp"></a>start with the doctype `<!doctype html>`. [🔗](#dctp)
- <a name="ampd"></a>contain a top-level `<html ⚡>` tag (`<html amp>` is accepted as well). [🔗](#ampd)
- <a name="crps"></a>contain `<head>` and `<body>` tags (They are optional in HTML). [🔗](#crps)
- <a name="canon"></a>contain a `<link rel="canonical" href="$SOME_URL" />` tag inside their head that points to the regular HTML version of the AMP HTML document or to itself if no such HTML version exists. [🔗](#canon)
- <a name="chrs"></a>contain a `<meta charset="utf-8">` tag as the first child of their head tag. [🔗](#chrs)
- <a name="vprt"></a>contain a `<meta name="viewport" content="width=device-width,minimum-scale=1">` tag inside their head tag. It's also recommend to include `initial-scale=1` (1). [🔗](#vprt)
- <a name="scrpt"></a>contain a `<script async src="https://cdn.ampproject.org/v0.js"></script>` tag as the last element in their head. [🔗](#scrpt)
- <a name="opacity"></a>contain `<style>body {opacity: 0}</style><noscript><style>body {opacity: 1}</style></noscript>` in their head tag. [🔗](#opacity)

(1) `width=device-width,minimum-scale=1` is required to ensure [GPU rasterization](https://www.chromium.org/developers/design-documents/chromium-graphics/how-to-get-gpu-rasterization) is enabled.

### Metadata

It is encouraged that AMP HTML documents are annotated with standardized metadata: [Open Graph Protocol](http://ogp.me/), [Twitter Cards](https://dev.twitter.com/cards/overview), etc.

We also recommend that AMP HTML documents are marked up with [schema.org/CreativeWork](https://schema.org/CreativeWork) or any of its more specific types such as [schema.org/NewsArticle](https://schema.org/NewsArticle) or [schema.org/BlogPosting](https://schema.org/BlogPosting).

### HTML Tags

HTML tags can be used unchanged in AMP HTML. Certain tags have equivalent custom tags (such as `<img>` and `<amp-img>`) and other tags are outright prohibited:

| Tag       | Status in AMP HTML                             |
|-----------|------------------------------------------------|
| script    | Prohibited unless the type is `application/ld+json` (Other non-executable values may be added as needed.). Exception is the mandatory script tag to load the AMP runtime and the script tags to load extended components. |
| base      | Prohibited |
| img       | Replaced with amp-img |
| video     | Replaced with amp-video |
| audio     | Replaced with amp-audio |
| iframe    | Replaced with amp-iframe |
| frame     | Prohibited. |
| frameset  | Prohibited. |
| object    | Prohibited. |
| param     | Prohibited. |
| applet    | Prohibited. |
| embed     | Prohibited. |
| form      | Prohibited. |
| input elements | Prohibited. Includes input, textarea, select, option. Notably, button element is allowed. |
| button    | Allowed. |
| <a name="cust"></a>style     | [Required style tags for adjusting opacity](#opacity) One additional style tag is allowed in head tag for the purpose of custom styling. This style tag must have the attribute `amp-custom`. [🔗](#cust) |
| link      | Allowed for certain values of rel: `canonical`. `stylesheet` is generally disallowed, but some values may be whitelisted for font providers. |
| meta      | The `http-equiv` attribute is banned. Otherwise allowed. |
| <a name="ancr"></a>a         | The `href` attribute value must not begin with `javascript:`. If set, the `target` attribute value must be `_blank`. Otherwise allowed. [🔗](#ancr) |
| svg       | Most SVG elements are allowed |

Validator implementations should use a whitelist based on the HTML5 specification with the above tags removed. See [AMP Tag Addendum](amp-tag-addendum.md).

### Comments

Conditional HTML comments are not allowed.

### HTML attributes

Attribute names starting with `on` (such as `onclick` or `onmouseover`) are disallowed in AMP HTML. The attribute with the literal name `on` (no suffix) is allowed.

The `style` attribute must not be used.

### Links

Links must be relative, protocol relative or use the schemas HTTP or HTTPS.

### Stylesheets

Major semantic tags and the AMP custom elements come with default styles to make authoring a responsive document reasonably easy. An option to opt out of default styles may be added in the future.

#### Author stylesheets

Authors may add custom styles to a document using a single `<style amp-custom>` tag in the head of the document.

#### Selectors
The initial version of AMP will only allow very simple CSS selectors in AMPs. The restriction is in place to make overall performance easier to reason about. It may be opened up in the future.

Allowed selectors are of the form:

- `.class`
- `#id`
- `tag-name`
- selector, selector
- media queries

Pseudo selectors are generally forbidden and must be whitelisted 1 by 1. Initially, we only allow `:hover`, `:active` and `:visited` with whitelisted CSS properties (For color and underlining).

CSS variables are used to style custom elements.

Class names, in author stylesheets, may not start with the string `-amp-`. These are reserved for internal use by the AMP runtime. It follows,
that the user's stylesheet may not reference CSS selectors for `-amp-` classes and `i-amp` tags. These classes and elements are not meant to
be customized by authors. Authors, however, can override styles of `amp-` classes and tags for any CSS properties not explicitly
forbidden by these components' spec.

Usage of the !important qualifier is not allowed.

#### Properties
These CSS properties are permanently banned:

- `behavior`
- `-moz-binding`

The initial version of AMP will prohibit the use of the following CSS properties. This may be relaxed in the future.

- `transition`
- `animation`
- `filter`

`overflow` (and `overflow-y`, etc.) may not be styled as “auto” or “scroll”. No user defined element in an AMP document may have a scrollbar.

##### Maximum size
It is a validation error if the author stylesheet is larger than 50,000 bytes.

### Custom fonts

Authors may include stylesheets for custom fonts. The 2 supported methods are link tags pointing to whitelisted font providers and `@font-face` inclusion.

Example:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Tangerine">
```

Font providers can be whitelisted if they support CSS-only integrations and serve over HTTPS. The following origins are currently allowed for font serving via link tags:

- https://fonts.googleapis.com

Authors are free to include all custom fonts via a `@font-face` CSS instruction via their custom CSS. Fonts included via `@font-face` must be fetched via the HTTP or HTTPS scheme.


## AMP runtime

The AMP runtime is a piece of JavaScript that runs inside every AMP document. It provides implementations for AMP custom elements, manages resource loading and prioritization and optionally includes a runtime validator for AMP HTML for use during development.

The AMP runtime is loaded via the mandatory `<script src="https://cdn.ampproject.org/v0.js"></script>` tag in the AMP document head.

Development mode is triggered by adding "#development=1" to the URL of the page.


## Resources

Resources such as images, videos, audio files or ads must be included into an AMP HTML file through custom elements such as `<amp-img>`. We call them managed resources because whether and when they will be loaded and displayed to the user is decided by the AMP runtime.

There are no particular guarantees as to the loading behavior of the AMP runtime, but it should generally strive to load resources quickly enough, so that they are loaded by the time the user would like to see them if possible. The runtime should prioritize resources currently in viewport and attempt to predict changes to the viewport and preload resources accordingly.

The AMP runtime may at any time decide to unload resources that are not currently in viewport or reuse the resource containers such as iframes to reduce overall RAM consumption.


## AMP Components

AMP HTML uses custom elements called, “AMP components” to substitute built-in resource-loading tags such as `<img>` and `<video>` and to implement features with complex interactions such as image lightboxes or carousels.

See the [AMP component spec](./amp-html-components.md) for details about supported components.

There are 2 types of supported AMP components:

1. Built-in
2. Extended

Built-in components are always available in an AMP document and have a dedicated custom element such as `<amp-img>`. Extended components must be explicitly included into the document.

### Common attributes

#### `width`, `height`

Depending on the value of the `layout` attribute AMP component elements must have a `width` and `height` attribute that contains an integer pixel value. Actual layout behavior is determined by the `layout` attribute.

#### `layout`

The optional layout attribute allows specifying how the component behaves in the document layout. Valid values for the layout attribute are:

- Not present: If `width` equals to `auto` `fixed-height` layout is assumed. If `width` or `height` attributes are present `fixed` layout is assumed. If `width` and `height` are not present `container` layout is assumed (unless otherwise documented with the component) which may not be supported by the element (Would trigger a runtime error).
- `fixed`: The `width` and `height` attributes must be present. The only exceptions are `amp-pixel` and `amp-audio` elements.
- `fixed-height`: The `height` attribute must be present. The `width` attribute must not be present or must be equal to `auto`.
- `responsive`: The `width` and `height` attributes must be present and are used to determine the aspect ratio of the component and the component is sized to the width of its container element while maintaining the height based on the aspect ratio.
- `nodisplay`: The component takes up zero space on the screen as if its display style was `none`. The `width` and `height` attributes are not required.
- `fill`: Element size will be determined by the parent element.
- `container`: The component is assumed to not have specific layout itself but only act as a container. Its children as rendered immediately.

#### `media`

All AMP custom elements support the `media` attribute. The value of media is a media query. If the query does not match, the element is not rendered at all and it's resources and potentially it's child resources will not be fetched. If the browser window changes size or orientation the media queries are re-evaluated and elements are hidden and shown based on the new results.

Example: Here we have 2 images with mutually exclusive media queries. Depending on the screen width one or the other will be fetched and rendered. Note that the media attribute is available on all custom elements, so it can be used with non-image elements such as ads.

```html
<amp-img
    media="(min-width: 650px)"
    src="wide.jpg"
    width=466
    height=355 layout="responsive" ></amp-img>
<amp-img
    media="(max-width: 649px)"
    src="narrow.jpg"
    width=527
    height=193 layout="responsive" ></amp-img>
```

### `on`

The `on` attribute is used to install event handlers on elements. The events that are supported depend on the element.

The value for the syntax is a simple domain specific language of the form `eventName:targetId[.methodName]`.
Example: `on="tap:fooId.showLightbox"`

If `methodName` is omitted the default method is executed if defined for the element.
Example: `on="tap:fooId"`


### Extended components

Extended components are components that do not necessarily ship with the AMP runtime. Instead they must be explicitly included into the document.

Extended components are loaded by including a `<script>` tag in the head of the document like this:

```html
<script async custom-element="amp-carousel" src="https://cdn.ampproject.org/v0/amp-carousel-0.1.js"></script>
```

The `<script>` tag must have an `async` attribute and must have a `custom-element` attribute referencing the name of the element.

Runtime implementations may use the name to render placeholders for these elements.

The script URL must start with “https://cdn.ampproject.org” and must follow a very strict pattern of “/v\d+/[a-z-]+-(latest|\d+|\d+-\d+)\.js”

##### URL

The URL for extended components is of the form:

```
https://cdn.ampproject.org/$RUNTIME_VERSION/$ELEMENT_NAME-$ELEMENT_VERSION.js
```

##### Versioning

Extended components are versioned via [semver](http://semver.org/). The version is referenced explicitly (See $ELEMENT_VERSION above) when loading the component in the URL. It may have the value “latest”.
Changes to the PATCH version component (x in 1.1.x) must strictly maintain backward compatibility or fix urgent security issues.

AMP documents may only reference versions with one or two components. Version “1” states “I accept every version of this component with major version 1”. Version “1.1” states “I accept every PATCH level of 1.1”. It is now allowed to explicitly reference the PATCH level in the version string.

## Security

AMP HTML documents must not trigger errors when served with a Content Security Policy that does not include the keywords `unsafe-inline` and `unsafe-eval`.

The AMP HTML format is designed so that is always the case.

## SVG

Currently, the following SVG elements are allowed:

* basics: "g", "path", "glyph", "glyphRef", "marker", "view"
* shapes: "circle", "line", "polygon", "polyline", "rect"
* text: "text", "textPath", "tref", "tspan"
* rendering: "clipPath", "filter", "linearGradient", "radialGradient", "mask", "pattern", "vkern", "hkern"
* special: "defs" (all children above are allowed here), "symbol", "use"
* aria: "desc", "title"

As well as these attributes:

* "xlink:href": only URIs starting with "#" are allowed
* "style"

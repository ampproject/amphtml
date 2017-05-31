<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

[TOC]

AMP HTML is a subset of HTML for authoring content pages such as news articles in a way that guarantees certain baseline performance characteristics.

Being a subset of HTML, it puts some restrictions on the full set of tags and functionality available through HTML but it does not require the development of new rendering engines: existing user agents can render AMP HTML just like all other HTML.

Also, AMP HTML documents can be uploaded to a web server and served just like any other HTML document; no special configuration for the server is necessary. However, they are also designed to be optionally served through specialized AMP serving systems that proxy AMP documents. These documents serve them from their own origin and are allowed to apply transformations to the document that provide additional performance benefits. An incomplete list of optimizations such a serving system might do is:

- Replace image references with images sized to the viewer’s viewport.
- Inline images that are visible above the fold.
- Inline CSS variables.
- Preload extended components.
- Minify HTML and CSS.

AMP HTML uses a set of contributed but centrally managed and hosted custom elements to implement advanced functionality such as image galleries that might be found in an AMP HTML document. While it does allow styling the document using custom CSS, it does not allow author written JavaScript beyond what is provided through the custom elements to reach its performance goals.

By using the AMP format, content producers are making the content in AMP files available to be crawled (subject to robots.txt restrictions), cached, and displayed by third parties.

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
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
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
- <a name="vprt"></a>contain a `<meta name="viewport" content="width=device-width,minimum-scale=1">` tag inside their head tag. It's also recommended to include `initial-scale=1`. [🔗](#vprt)
- <a name="scrpt"></a>contain a `<script async src="https://cdn.ampproject.org/v0.js"></script>` tag inside their head tag. [🔗](#scrpt)
- <a name="boilerplate"></a>contain the [AMP boilerplate code](amp-boilerplate.md) (`head > style[amp-boilerplate]` and `noscript > style[amp-boilerplate]`) in their head tag. [🔗](#boilerplate)

### Metadata

It is encouraged that AMP HTML documents are annotated with standardized metadata: [Open Graph Protocol](http://ogp.me/), [Twitter Cards](https://dev.twitter.com/cards/overview), etc.

We also recommend that AMP HTML documents are marked up with [schema.org/CreativeWork](https://schema.org/CreativeWork) or any of its more specific types such as [schema.org/NewsArticle](https://schema.org/NewsArticle) or [schema.org/BlogPosting](https://schema.org/BlogPosting).

### HTML Tags

HTML tags can be used unchanged in AMP HTML. Certain tags have equivalent custom tags (such as `<img>` and `<amp-img>`) and other tags are outright prohibited:

<table>
  <tr>
    <th width="30%">Tag</th>
    <th>Status in AMP HTML</th>
  </tr>
  <tr>
    <td width="30%">script</td>
    <td>Prohibited unless the type is <code>application/ld+json</code>. (Other non-executable values may be added as needed.) Exception is the mandatory script tag to load the AMP runtime and the script tags to load extended components.</td>
  </tr>
  <tr>
    <td width="30%">noscript</td>
    <td>Allowed. Can be used anywhere in the document. If specified, the content inside the <code>&lt;noscript&gt;</code> element displays if JavaScript is disabled by the user.</td>
  </tr>
  <tr>
    <td width="30%">base</td>
    <td>Prohibited.</td>
  </tr>
  <tr>
    <td width="30%">img</td>
    <td>Replaced with <code>amp-img</code>.<br>
        Please note: <code>&lt;img&gt;</code> is a <a href="https://www.w3.org/TR/html5/syntax.html#void-elements">Void Element according to HTML5</a>, so it does not have an end tag. However, <code>&lt;amp-img&gt;</code> does have an end tag <code>&lt;/amp-img&gt;</code>.</td>
  </tr>
  <tr>
    <td width="30%">video</td>
    <td>Replaced with <code>amp-video</code>.</td>
  </tr>
  <tr>
    <td width="30%">audio</td>
    <td>Replaced with <code>amp-audio</code>.</td>
  </tr>
  <tr>
    <td width="30%">iframe</td>
    <td>Replaced with <code>amp-iframe</code>.</td>
  </tr>
    <tr>
    <td width="30%">frame</td>
    <td>Prohibited.</td>
  </tr>
  <tr>
    <td width="30%">frameset</td>
    <td>Prohibited.</td>
  </tr>
  <tr>
    <td width="30%">object</td>
    <td>Prohibited.</td>
  </tr>
  <tr>
    <td width="30%">param</td>
    <td>Prohibited.</td>
  </tr>
  <tr>
    <td width="30%">applet</td>
    <td>Prohibited.</td>
  </tr>
  <tr>
    <td width="30%">embed</td>
    <td>Prohibited.</td>
  </tr>
  <tr>
    <td width="30%">form</td>
    <td>Allowed. Require including <a href="https://github.com/ampproject/amphtml/blob/master/extensions/amp-form/amp-form.md">amp-form extension</a>.</td>
  </tr>
  <tr>
    <td width="30%">input elements</td>
    <td>Mostly allowed with <a href="https://github.com/ampproject/amphtml/blob/master/extensions/amp-form/amp-form.md#inputs">exception of some input types</a>, namely, <code>&lt;input[type=image]&gt;</code>, <code>&lt;input[type=button]&gt;</code>, <code>&lt;input[type=password]&gt;</code>, <code>&lt;input[type=file]&gt;</code> are invalid. Related tags are also allowed: <code>&lt;fieldset&gt;</code>, <code>&lt;label&gt;</code></td>
  </tr>
  <tr>
    <td width="30%">button</td>
    <td>Allowed.</td>
  </tr>
  <tr>
    <td width="30%"><code><a name="cust"></a>style</code></td>
    <td><a href="#opacity">Required style tags for adjusting opacity</a>. One additional style tag is allowed in head tag for the purpose of custom styling. This style tag must have the attribute <code>amp-custom</code>. <a href="#cust">🔗</a></td>
  </tr>
  <tr>
    <td width="30%">link</td>
    <td><code>rel</code> values registered on <a href="http://microformats.org/wiki/existing-rel-values">microformats.org</a> are allowed. If a <code>rel</code> value is missing from our whitelist, <a href="https://github.com/ampproject/amphtml/issues/new">please submit an issue</a>. <code>stylesheet</code> and other values like <code>preconnect</code>, <code>prerender</code> and <code>prefetch</code> that have side effects in the browser are disallowed. There is a special case for fetching stylesheets from whitelisted font providers.</td>
  </tr>
  <tr>
    <td width="30%">meta</td>
    <td>The <code>http-equiv</code> attribute may be used for specific allowable values; see the <a href="https://github.com/ampproject/amphtml/blob/master/validator/validator-main.protoascii">AMP validator specification</a> for details.</td>
  </tr>
  <tr>
    <td width="30%"><code><a name="ancr"></a>a</code></td>
    <td>The <code>href</code> attribute value must not begin with <code>javascript:</code>. If set, the <code>target</code> attribute value must be <code>_blank</code>. Otherwise allowed. <a href="#ancr">🔗</a></td>
  </tr>
  <tr>
    <td width="30%">svg</td>
    <td>Most SVG elements are allowed.</td>
  </tr>
</table>

Validator implementations should use a whitelist based on the HTML5 specification with the above tags removed. See [AMP Tag Addendum](amp-tag-addendum.md).

### Comments

Conditional HTML comments are not allowed.

### HTML attributes

Attribute names starting with `on` (such as `onclick` or `onmouseover`) are disallowed in AMP HTML. The attribute with the literal name `on` (no suffix) is allowed.

The `style` attribute must not be used.

XML-related attributes, such as xmlns, xml:lang, xml:base, and xml:space are disallowed in AMP HTML.

Internal AMP attributes prefixed with `i-amp-` are disallowed in AMP HTML.

### Classes

Internal AMP class names prefixed with `-amp-` and `i-amp-` are disallowed in AMP HTML.

Consult AMP documentation for meaning of class names prefixed with `amp-`. The use of these classes is allowed and meant to allow customization of some features of AMP runtime and extensions.

All other authored class names are allowed in AMP HTML markup.

### IDs

Internal AMP IDs prefixed with `-amp-` and `i-amp-` are disallowed in AMP HTML.

Consult AMP documentation for specific extensions before using `amp-` and `AMP` IDs to avoid conflict with the features provided by these extensions, such as `amp-access`.

All other authored IDs are allowed in AMP HTML markup.

### Links

The `javascript:` schema is disallowed.

### Stylesheets

Major semantic tags and the AMP custom elements come with default styles to make authoring a responsive document reasonably easy. An option to opt out of default styles may be added in the future.

#### @-rules

The following @-rules are allowed in stylesheets:

`@font-face`, `@keyframes`, `@media`, `@supports`.

`@import` will not be allowed. Others may be added in the future.

#### Author stylesheets

Authors may add custom styles to a document using a single `<style amp-custom>` tag in the head of the document.

#### Selectors

The following restrictions apply to selectors in author style sheets:

##### Class and tag names
Class names, IDs, tag names and attributes, in author stylesheets, may not start with the string `-amp-` and `i-amp-`. These are reserved for internal use by the AMP runtime. It follows, that the user's stylesheet may not reference CSS selectors for `-amp-` classes, `i-amp-` IDs and `i-amp-` tags and attributes. These classes, IDs and tag/attribute names are not meant to be customized by authors. Authors, however, can override styles of `amp-` classes and tags for any CSS properties not explicitly forbidden by these components' spec.

To prevent usage of attribute selectors to circumvent class name limitations it is generally not allowed for CSS selectors to contain tokens and strings starting with `-amp-` and `i-amp-`.

#### Important
Usage of the `!important` qualifier is not allowed. This is a necessary requirement to enable AMP to enforce its element sizing invariants.

#### Properties
These CSS properties are permanently banned:

- `behavior`
- `-moz-binding`

The following properties are currently blacklisted due to performance concerns:

- `filter`

AMP only allows transitions and animations of properties that can be GPU accelerated in common browsers. We currently whitelist: `opacity`, `transform` (also `-vendorPrefix-transform`).

In the following examples `<property>` needs to be in the whitelist above.

- `transition <property>` (also -vendorPrefix-transition)
- `@keyframes name { from: {<property>: value} to {<property: value>} }` (also `@-vendorPrefix-keyframes`)

`overflow` (and `overflow-y`, `overflow-x`) may not be styled as “auto” or “scroll”. No user defined element in an AMP document may have a scrollbar.

#### Maximum size
It is a validation error if the author stylesheet is larger than 50,000 bytes.

### Custom fonts

Authors may include stylesheets for custom fonts. The 2 supported methods are link tags pointing to whitelisted font providers and `@font-face` inclusion.

Example:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Tangerine">
```

Font providers can be whitelisted if they support CSS-only integrations and serve over HTTPS. The following origins are currently allowed for font serving via link tags:

- Typography.com: https://cloud.typography.com
- Fonts.com: https://fast.fonts.net
- Google Fonts: https://fonts.googleapis.com
- Font Awesome: https://maxcdn.bootstrapcdn.com

IMPLEMENTERS NOTE: Adding to this list requires a change to the AMP Cache CSP rule.

Authors are free to include all custom fonts via an `@font-face` CSS instruction via their custom CSS. Fonts included via `@font-face` must be fetched via the HTTP or HTTPS scheme.


## AMP runtime

The AMP runtime is a piece of JavaScript that runs inside every AMP document. It provides implementations for AMP custom elements, manages resource loading and prioritization and optionally includes a runtime validator for AMP HTML for use during development.

The AMP runtime is loaded via the mandatory `<script src="https://cdn.ampproject.org/v0.js"></script>` tag in the AMP document `<head>`.

The AMP runtime can be placed into a development mode for any page. Development mode will trigger AMP validation on the embedded page, which will emit the validation status and any errors to the JavaScript developer console. Development mode may be triggered by appending `#development=1` to the URL of the page.


## Resources

Resources such as images, videos, audio files or ads must be included into an AMP HTML file through custom elements such as `<amp-img>`. We call them “managed resources” because whether and when they will be loaded and displayed to the user is decided by the AMP runtime.

There are no particular guarantees as to the loading behavior of the AMP runtime, but it should generally strive to load resources quickly enough, so that they are loaded by the time the user would like to see them if possible. The runtime should prioritize resources currently in the viewport and attempt to predict changes to the viewport and preload resources accordingly.

The AMP runtime may at any time decide to unload resources that are not currently in viewport or reuse the resource containers such as iframes to reduce overall RAM consumption.


## AMP Components

AMP HTML uses custom elements called “AMP components” to substitute built-in resource-loading tags such as `<img>` and `<video>` and to implement features with complex interactions such as image lightboxes or carousels.

See the [AMP component spec](./amp-html-components.md) for details about supported components.

There are 2 types of supported AMP components:

1. Built-in
2. Extended

Built-in components are always available in an AMP document and have a dedicated custom element such as `<amp-img>`. Extended components must be explicitly included into the document.

### Common attributes

#### `layout`, `width`, `height`, `media`, `placeholder`, `fallback`

These attributes define the layout of an element. The key goal here is to ensure that
the element can be displayed and its space can be properly reserved before any of the
JavaScript or remote resources have been downloaded.

See the [AMP Layout System](./amp-html-layout.md) for details about the layout system.

#### `on`

The `on` attribute is used to install event handlers on elements. The events that are supported depend on the element.

The value for the syntax is a simple domain specific language of the form:

```javascript
eventName:targetId[.methodName[(arg1=value, arg2=value)]]
```

Example: `on="tap:fooId.showLightbox"`

If `methodName` is omitted the default method is executed if defined for the element.
Example: `on="tap:fooId"`

Some actions, if documented, may accept arguments. The arguments are defined between parentheses in `key=value` notation. The accepted values are:
 - simple unquoted strings: `simple-value`;
 - quoted strings: `"string value"` or `'string value'`;
 - boolean values: `true` or `false`;
 - numbers: `11` or `1.1`.

You can listen to multiple events on an element by separating the two events with a semicolon `;`.

Example: `on="submit-success:lightbox1;submit-error:lightbox2"`

Read more about [AMP Actions and Events](./amp-actions-and-events.md).

### Extended components

Extended components are components that do not necessarily ship with the AMP runtime. Instead they must be explicitly included into the document.

Extended components are loaded by including a `<script>` tag in the head of the document like this:

```html
<script async custom-element="amp-carousel" src="https://cdn.ampproject.org/v0/amp-carousel-0.1.js"></script>
```

The `<script>` tag must have an `async` attribute and must have a `custom-element` attribute referencing the name of the element.

Runtime implementations may use the name to render placeholders for these elements.

The script URL must start with "https://cdn.ampproject.org" and must follow a very strict pattern of `/v\d+/[a-z-]+-(latest|\d+|\d+.\d+).js`.

##### URL

The URL for extended components is of the form:

```html
https://cdn.ampproject.org/$RUNTIME_VERSION/$ELEMENT_NAME-$ELEMENT_VERSION.js
```

##### Versioning

See the [AMP versioning policy](amp-versioning-policy.md).


### Extended templates

Templates render HTML content based on the language-specific template and provided JSON data.

See the [AMP template spec](./amp-html-templates.md) for details about supported templates.

Extended templates are not shipped with the AMP runtime and have to be downloaded just as with extended elements.
Extended components are loaded by including a `<script>` tag in the head of the document like this:

```html
<script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.1.js"></script>
```

The `<script>` tag must have an `async` attribute and must have a `custom-template` attribute referencing the type of the
template. The script URL must start with "https://cdn.ampproject.org" and must follow a very strict pattern of
`/v\d+/[a-z-]+-(latest|\d+|\d+.\d+).js`.

The templates are declared in the document as following:

```html
<template type="amp-mustache" id="template1">
  Hello {{you}}!
</template>
```

The `type` attribute is required and must reference a declared `custom-template` script.

The `id` attribute is optional. Individual AMP elements discover their own templates. Typical scenarios would involve an AMP element looking for a `<template>` either among its children or referenced by ID.

The syntax within the template element depends on the specific template language. However, the template language could be restricted within AMP. For instance, in accordance with the "template" element, all productions have to be over a valid well-formed DOM. All of the template outputs are also subject to sanitizing to ensure AMP-valid output.

To learn about the syntax and restrictions for an extended template, visit the [extended template's documentation](./amp-html-templates.md#templates).

##### URL

The URL for extended components is of the form:

```html
https://cdn.ampproject.org/$RUNTIME_VERSION/$TEMPLATE_TYPE-$TEMPLATE_VERSION.js
```

##### Versioning

See versioning of custom elements for more details.


## Security

AMP HTML documents must not trigger errors when served with a Content Security Policy that does not include the keywords `unsafe-inline` and `unsafe-eval`.

The AMP HTML format is designed so that is always the case.

All AMP template elements must go through AMP security review before they can be submitted into AMP repository.

## SVG

Currently, the following SVG elements are allowed:

* basics: "g", "glyph", "glyphRef", "image", "marker", "metadata", "path", "solidcolor", "svg", "switch", "view"
* shapes: "circle", "ellipse", "line", "polygon", "polyline", "rect"
* text: "text", "textPath", "tref", "tspan"
* rendering: "clipPath", "filter", "hkern", "linearGradient", "mask", "pattern", "radialGradient", "vkern"
* special: "defs" (all children above are allowed here), "symbol", "use"
* filter: "feColorMatrix", "feComposite", "feGaussianBlur", "feMerge", "feMergeNode", "feOffset", "foreignObject"
* ARIA: "desc", "title"

As well as these attributes:

* "xlink:href": only URIs starting with "#" are allowed
* "style"

## AMP document discovery

The mechanism described below provides a standardized way for software to discover whether an AMP version exists for a canonical document.

If an AMP document exists that is an alternative representation of a canonical document, then the canonical document should point to the AMP document via a `link` tag with the [relation "amphtml"](http://microformats.org/wiki/existing-rel-values#HTML5_link_type_extensions).

Example:

```html
<link rel="amphtml" href="https://www.example.com/url/to/amp/document.html">
```

The AMP document itself is expected to point back to its canonical document via a `link` tag with the relation "canonical".

Example:

```html
<link rel="canonical" href="https://www.example.com/url/to/canonical/document.html">
```

(If a single resource is simultaneously the AMP *and* the canonical document, the canonical relation should point to itself--no "amphtml" relation is required.)

Note that for widest compatibility with AMP-consuming systems, it should be possible to read the "amphtml" relation without executing JavaScript. (That is, the tag should be present in the raw HTML, and not injected via JavaScript.)

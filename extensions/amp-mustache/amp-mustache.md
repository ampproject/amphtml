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

# <a name="amp-mustache"></a> `amp-mustache`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Allows rendering of <a href="https://github.com/janl/mustache.js/">Mustache.js</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td>
      <div>
        <code>&lt;script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js">&lt;/script></code>
      </div>
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-mustache/">annotated amp-mustache</a> example.</td>
  </tr>
</table>

[TOC]

## Version notes

| Version | Description |
| ------- | ----- |
| 0.2 | Support for `<svg>` elements and reduced bundle size (12.2KB vs. 20.5KB, gzipped).<br><br>Migrates to a more modern HTML sanitizer library (Caja to DOMPurify). This may cause minor breaking changes due to differences in the tag and attribute whitelisting. We recommend testing your pages first before pushing to production to make sure the changes in generated markup do not affect functionality. |
| 0.1 | Initial implementation. |

## Syntax

Mustache is a logic-less template syntax. See [Mustache.js docs](https://github.com/janl/mustache.js/) for more details. Some of the core Mustache tags are:

- `{{variable}}`: A variable tag. It outputs the the HTML-escaped value of a variable.
- `{{#section}}``{{/section}}`: A section tag. It can test the existence of a variable and iterate over it if it's an array.
- `{{^section}}``{{/section}}`: An inverted tag. It can test the non-existence of a variable.
- `{{{unescaped}}}`: Unescaped HTML. It's restricted in the markup it may output (see "Restrictions" below).

## Usage

The `amp-mustache` template has to be defined and used according to the
[AMP Template Spec](../../spec/amp-html-templates.md).

First, the `amp-mustache` has to be declared/loaded like this:

```html
<script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"></script>
```

Then, the Mustache templates can be defined in the `template` tags like this:

```html
<template type="amp-mustache">
  Hello {{world}}!
</template>
```

How templates are discovered, when they are rendered, how data is provided is  all decided by the
target AMP element that uses this template to render its content (for example, in an [amp-list](../amp-list/amp-list.md), [amp-form](../amp-form/amp-form.md), etc.).

## Restrictions

Like all AMP templates, `amp-mustache` templates are required to be well-formed DOM fragments. This means
that among other things, you can't use `amp-mustache` to:

- Calculate tag name. E.g. `<{{tagName}}>` is not allowed.
- Calculate attribute name. E.g. `<div {{attrName}}=something>` is not allowed.

The output of "triple-mustache" is sanitized to only allow the following tags: `a`, `b`, `br`, `caption`, `colgroup`, `code`, `del`, `div`, `em`, `i`, `ins`, `li`, `mark`, `ol`, `p`, `q`, `s`, `small`, `span`, `strong`, `sub`, `sup`, `table`, `tbody`, `time`, `td`, `th`, `thead`, `tfoot`, `tr`, `u`, `ul`.

## Pitfalls

### Nested templates

Per AMP Validation, `<template>` elements must not be children of other `<template>` elements. This can happen when nesting two components that use templates, e.g. `amp-list` and `amp-form`.

To workaround this, `<template>` elements can also be referenced by `id` via the `template` attribute on the component. For example:

```html
<amp-list id="myList" src="https://foo.com/list.json">
  <template type="amp-mustache">
    <div>{{title}}</div>
  </template>
</amp-list>
```

Can also be represented as:

```html
<!-- Externalize templates to avoid nesting. -->
<template type="amp-mustache" id="myTemplate">
  <div>{{title}}</div>
</template>

<amp-list id="myList" src="https://foo.com/list.json" template="myTemplate">
</amp-list>
```

### Tables

Since AMP template strings must be specified in `<template>` elements, this can cause unexpected behavior due to browser parsing. For example, `<table>` elements can cause [foster parenting](https://www.w3.org/TR/html5/syntax.html#unexpected-markup-in-tables) of text. In the following example:

```html
<template type="amp-mustache">
  <table>
    <tr>
      {{#foo}}<td></td>{{/foo}}
    </tr>
  </table>
</template>
```

The browser will foster parent the text nodes `{{#foo}}` and `{{/foo}}`:

```html
{{#foo}}
{{/foo}}
<table>
  <tr>
    <td></td>
  </tr>
</table>
```

Workarounds include wrapping Mustache sections in HTML comments (e.g. `<!-- {{#bar}} -->`) or using non-table elements like `<div>` instead.

### Quote escaping

When using `amp-mustache` to calculate attribute values, quote escaping can be an issue. For example:

```html
<template type="amp-mustache">
  <!-- A double-quote (") in foo will cause malformed HTML. -->
  <amp-img alt="{{foo}}" src="example.jpg" width=100 height=100></amp-img>

  <!-- A single-quote (') or double-quote (") in bar will cause an AMP runtime parse error. -->
  <button on="tap:AMP.setState({foo: '{{bar}}'})">Click me</button>
</template>
```

Using HTML character codes in the `{{foo}}` or `{{bar}}` variables won't work since Mustache will HTML escape `&` characters (e.g. `&quot;` -> `&amp;quot;`). One workaround is to use facsimile characters e.g. &prime; (`&prime;`) and &Prime; (`&Prime;`).

There's an [open proposal](https://github.com/ampproject/amphtml/issues/8395) to perform this substitution in `amp-mustache` instead. Please comment on the issue if you'd like to support it.

### HTML entities

HTML entities are not preserved in `<template>` elements.

This can be an issue if you want to server-side render a `<template>` containing user-generated text, since user-generated text containing {% raw %}`{{`, `}}`, `{{{`, `}}}`{% endraw %} will be treated as a Mustache section. E.g. replacing {% raw %}`{{`{% endraw %} with HTML entities `&lcub;&lcub;` won't work because they aren't preserved when the browser parses the `<template>`.

Workarounds include replacing strings like {% raw %}`{{`{% endraw %} with different characters or stripping them outright from user-generated content.

## Validation

See [amp-mustache rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-mustache/validator-amp-mustache.protoascii) in the AMP validator specification.

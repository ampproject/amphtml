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
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>None</td>
  </tr>
</table>

## Syntax

Mustache is a logic-less template syntax. See [Mustache.js docs](https://github.com/janl/mustache.js/)
for more details. Some of the core Mustache tags are:

- \{\{variable\}\} - variable tag. It outputs the the HTML-escaped value of a variable;
- \{\{#section\}\}\{\{/section\}\} - section tag. It can test existance of a variable and iterate over it if
it's an array;
- \{\{^section\}\}\{\{/section\}\} - inverted tag. It can test non-existance of a variable.

## Usage

The `amp-mustache` template has to be defined and used according to the
[AMP Template Spec](../../spec/amp-html-templates.md).

First, the `amp-mustache` has to be declared/loaded like this:

```html
<script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.1.js"></script>
```

Then, the Mustache templates can be defined in the `template` tags like this:

```html
<template type="amp-mustache">
  Hello {{world}}!
</template>
```

How templates are discovered, when they are rendered, how data is provided - all decided by the
target AMP element that uses this template to render its content.

## Restrictions

Like all AMP templates, `amp-mustache` templates are required to be well-formed DOM fragments. This means
that among other things, you can't use `amp-mustache` to:

- Calculate tag name. E.g. `<{{tagName}}>` is not allowed.
- Calculate attribute name. E.g. `<div {{attrName}}=something>` is not allowed.
- Output arbitrary HTML using `{{{unescaped}}}`. The output of "triple-mustache" is sanitized to only allow
formatting tags such as `<b>`, `<i>`, and so on.

Notice also that because the body of the template has to be specified within the `template` element, it is
impossible to specify `{{&var}}` expressions - they will always be escaped as `{{&amp;var}}`. The triple-mustache
`{{{var}}}` has to be used for these cases.

## Validation errors

The following lists validation errors specific to `amp-mustache`
(see also `template` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/extensions/amp-mustache/0.1/validator-amp-mustache.protoascii)):

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#attribute-contains-template-syntax">Mustache template syntax in attribute name 'example1' in tag 'example2'.</a></td>
    <td>Mustache templates must be within the <code>amp-mustache</code> tag. Error thrown when templating syntax found in an attribute in another tag.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#attribute-contains-unescaped-template-syntax">The attribute 'example1' in tag 'example2' is set to 'example3', which contains unescaped Mustache template syntax.</a></td>
    <td>Mustache templates must be within the <code>amp-mustache</code> tag. Error thrown when <a href="https://github.com/janl/mustache.js/#variables">unescaped templating syntax</a> found in an attribute in another tag.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#attribute-contains-template-partial">The attribute 'example1' in tag 'example2' is set to 'example3', which contains a Mustache template partial.</a></td>
    <td>Mustache templates must be within the <code>amp-mustache</code> tag. Error thrown when <a href="https://github.com/janl/mustache.js/#partials">template partial</a> found in an attribute in another tag.</td>
  </tr>
</table>

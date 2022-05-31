# AMP Purifier

The AMP Purifier library contains an AMP-specific configuration for [DOMPurify](https://github.com/cure53/DOMPurify).

This library is internally used by [`amp-mustache`](https://amp.dev/documentation/components/amp-mustache/)
to sanitize rendered Mustache.js templates before displaying them.

## Usage

```js
import {Purifier} from '#purifier';

const purifier = new Purifier(document);
purifier.purifyHtml('a<script>b</script>c'); // "ac"
```

### Usage with Mustache.js

```js
import Mustache from 'mustache';
import {Purifier} from '#purifier';

const purifier = new Purifier(document);
const _unescapedValue = Mustache.Writer.prototype.unescapedValue;
Mustache.Writer.prototype.unescapedValue = function (token, context) {
  const result = _unescapedValue(token, context);
  return purifier.purifyTagsForTripleMustache(result);
};
const html = Mustache.render(template, data);

const body = purifier.purifyHtml(html);
for (const child of body.children) {
  targetElement.appendChild(child);
}
```

## Reference

The library has only a single export, the `Purifier` class.

### `Purifier` constructor

`new Purifier(doc, config, attrRewrite)`

#### `doc`

The base document to use. Usually `window.document`.

#### `config`

_Optional_

[DOMPurify configuration](https://github.com/cure53/DOMPurify#can-i-configure-dompurify)
to use in addition to the AMP default one.

#### `attrRewrite`

_Optional_

A function that, if provided, will be called for every sanitized attribute in
the output to change its value. It accepts the following attributes:

-   `tagName` - name of tag containing the attribute
-   `attrName` - name of attribute
-   `attrValue` - current attribute value

The returned value of this function is used as the new attribute value.

For example, this replaces the `href` of all `<a>` elements with example.com:

```js
new Purifier(window.document, {}, (tagName, attrName, attrValue) => {
  if (tagName === 'a' && attrName === 'href') {
    return 'https://google.com';
  }
  return attrValue;
});
```

### `purifyHtml`

`purifyHtml(html)`

Uses DOMPurify to sanitize HTML in a way that ensures the fragment is valid AMP.

#### `html`

The HTML code to sanitize (purify).

#### Return value

A <body> element containing the sanitized `html` markup.

### `purifyTagsForTripleMustache`

`purifyTagsForTripleMustache(html)`

Uses DOMPurify to sanitize HTML with stricter policy for unescaped templates
e.g. triple mustache. See [`amp-mustache` documentation](https://amp.dev/documentation/components/amp-mustache/#validation)
for more information.

#### `html`

The HTML code to sanitize (purify).

#### Return value

Sanitized HTML (as a string).

### `getAllowedTags`

`getAllowedTags()`

Gets a copy of the map of allowed tag names (standard DOMPurify config).

#### Return value

An object containing the list of allowed tags according to AMP's DOMPurify
config.

### `validateAttributeChange`

Returns whether an attribute addition/modification/removal is valid according to
AMP's DOMPurify config.

`validateAttributeChange(node, attr, value)`

#### `node`

DOM node to check.

#### `attr`

Attribute name.

#### `value`

Attribute value (can be null).

#### Return value

`true` if the given attribute change is valid, `false` otherwise.

# Contributing Validator Rules for an AMP Extended Component

This document explains how to create a basic validator ruleset for a new [AMP Extended Component](https://amp.dev/documentation/components/). It provides an example (`amp-cat`) and describes how to write, test, and validate new AMP component rules.

## Getting Started

Before writing `.protoascii` or `validator-*.html` files, review the [AMP Validator setup guide](https://github.com/ampproject/amphtml/blob/main/validator/README.md). To confirm your environment works correctly, run:

```bash
python3 validator/build.py
```

## Example: The `<amp-cat>` Component

Imagine you’re creating an AMP component that displays random cat images from a pre-set list: **Oscar**, **Chloe**, or **Bella**.

Usage example:

```html
<!-- Display the cat named 'oscar' -->
<amp-cat data-selected-cat="oscar" width="50" height="50"></amp-cat>

<!-- Display a random cat -->
<amp-cat width="50" height="50"></amp-cat>
```

Place your component code in:
```
amphtml/extensions/amp-cat/0.1/
```

This guide only covers **validator rules**, not runtime behavior (for that, see [Building an AMP Extension](https://github.com/ampproject/amphtml/blob/main/docs/building-an-amp-extension.md)).

## Validator Rules

Once your component is ready, create:
```
amphtml/extensions/amp-cat/validator-amp-cat.protoascii
```

### Example Rules File

```js
tags: {  # amp-cat script
  html_format: AMP
  tag_name: "SCRIPT"
  extension_spec: {
    name: "amp-cat"
    version: "0.1"
  }
  attr_lists: "common-extension-attrs"
}

tags: {  # <amp-cat>
  html_format: AMP
  tag_name: "AMP-CAT"
  requires_extension: "amp-cat"
  attrs: {
    name: "data-selected-cat"
    value_casei: "bella"
    value_casei: "chloe"
    value_casei: "oscar"
  }
  attr_lists: "extended-amp-global"
  amp_layout: {
    supported_layouts: FILL
    supported_layouts: FIXED
    supported_layouts: FIXED_HEIGHT
    supported_layouts: FLEX_ITEM
    supported_layouts: INTRINSIC
    supported_layouts: NODISPLAY
    supported_layouts: RESPONSIVE
  }
}
```

## Attribute Validation

Examples of attribute rules:

```js
attrs: { name: 'data-selected-cat' }            # Any value allowed
attrs: { name: 'data-selected-cat'; mandatory: true; }  # Must exist
attrs: { name: 'data-selected-cat'; value_casei: 'oscar'; }  # One allowed value
attrs: { name: 'id'; value_regex: '\\d+'; }     # Must match a pattern
```

### URL validation example

```js
attrs: {
  name: 'src';
  value_url: {
    protocol: 'https';
    allow_relative: false;
  }
}
```

### Parent validation example

```js
mandatory_parent: 'DIV';
```

or

```js
mandatory_ancestor: 'DIV';
```

## Test Files

Create test files alongside your validator:
```
amphtml/extensions/amp-cat/0.1/test/validator-amp-cat.html
amphtml/extensions/amp-cat/0.1/test/validator-amp-cat.out
```

### Example Test HTML

```html
<!doctype html>
<html ⚡>
<head>
  <meta charset="utf-8">
  <title>amp-cat validator test</title>
  <script async custom-element="amp-cat"
          src="https://cdn.ampproject.org/v0/amp-cat-0.1.js"></script>
</head>
<body>
  <!-- Valid amp-cat tag -->
  <amp-cat data-selected-cat="oscar" width="50" height="50"></amp-cat>
</body>
</html>
```

Generate `.out` results file:

```bash
amp validator --update_tests
```

A valid test outputs:
```
PASS
```
An invalid one might output:
```
FAIL
validator-amp-cat.html:41:2 The attribute 'src' in tag 'amp-cat' is missing or incorrect. [DISALLOWED_HTML]
```

## Running Tests

From `amphtml/validator/`, run:
```bash
python3 build.py
```
If successful:
```
[[build.py RunTests]] - ... success
```

## Notes

- Attributes are optional unless marked `mandatory: true`.
- Only one of `value`, `value_casei`, `value_regex`, `value_regex_casei`, or `value_url` may be used per attribute.
- Multiple case-insensitive values are allowed.
- Keep validator files consistent with AMP naming conventions.

## Contribution and Support

- Follow [AMP contribution guidelines](https://github.com/ampproject/amphtml/blob/main/docs/contributing.md)
- Join the [AMP Discord](https://discord.gg/ampproject)
- Read the [AMP Code of Conduct](https://amp.dev/code-of-conduct/)
- Ask questions on [Stack Overflow](https://stackoverflow.com/questions/tagged/amp-html)

## Summary

This guide helps new contributors quickly add **validator rules** for new AMP components — with tests and examples. You can adapt this same structure for any component beyond `<amp-cat>`.

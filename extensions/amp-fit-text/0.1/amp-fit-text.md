---
$category@: presentation
formats:
  - websites
  - stories
  - ads
  - email
teaser:
  text: Expands or shrinks font size to fit the content within the space given.
---

# amp-fit-text

## Usage

Expands or shrinks its font size to fit the content within the space given to it.

The `amp-fit-text` component allows you to manage the size and fit of text within a specified area. For content contained in an `amp-fit-text` element, the `amp-fit-text` component finds the best font size to fit all of the content within the available space. The expected content for `amp-fit-text` is text or other inline content, but it can also contain non-inline content.

In the following example, the `<amp-fit-text>` element is nested within a 300x300 blue `div` block. For the `<amp-fit-text>` element, we specified a `responsive` layout. As a result, the text scales responsively per the aspect ratio provided by the width and height (200x200) of the `<amp-fit-text>` element, but the text does not exceed the size of its parent.

[example preview="inline" playground="true" imports="amp-fit-text"]

```html
<div style="width: 300px; height: 300px; background:#005AF0; color: #FFF;">
  <amp-fit-text width="200" height="200" layout="responsive">
    Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
    inermis reprehendunt.
  </amp-fit-text>
</div>
```

[/example]

The following example is similar to the one above, but in this example we specify a `max-font-size` of `22`, so the text is smaller but still fits the space:

[example preview="inline" playground="true" imports="amp-fit-text"]

```html
<div style="width: 300px; height: 300px; background:#005AF0; color: #FFF;">
  <amp-fit-text width="200" height="200" layout="responsive" max-font-size="22">
    Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
    inermis reprehendunt.
  </amp-fit-text>
</div>
```

[/example]

### Overflowing content

If the content of the `amp-fit-text` overflows the available space, even with a
`min-font-size` specified, the overflowing content is cut off and hidden. WebKit and Blink-based browsers show ellipsis for overflowing content.

In the following example, we specified a `min-font-size` of `40`, and added more content inside the `amp-fit-text` element. This causes the content to exceed the size of its fixed block parent, so the text is truncated to fit the container.

[example preview="inline" playground="true" imports="amp-fit-text"]

```html
<div style="width: 300px; height: 300px; background:#005AF0; color: #FFF;">
  <amp-fit-text width="200" height="200" layout="responsive" min-font-size="40">
    Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
    inermis reprehendunt. Lorem ipsum dolor sit amet, has nisl nihil convenire
    et, vim at aeque inermis reprehendunt
  </amp-fit-text>
</div>
```

[/example]

#### Accessibility considerations of overflowing content

While overflowing content is _visually_ truncated to fit the container, note that it's still present in the document. Do not rely on the overflow behaviour to simply "stuff" large amounts of content in your pages - while visually it may look appropriate, it may lead to the page becoming overly verbose to users of assistive technologies (such as screen readers), as for these users all the truncated content will still be read/announced in full.

## Attributes

### `min-font-size`

Specifies the minimum font size in pixels as an integer that the `amp-fit-text` can use.

### `max-font-size`

Specifies the maximum font size in pixels as an integer that the `amp-fit-text` can use.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Styling

You can style the `amp-fit-text` with standard CSS. In particular, you can use `text-align`, `font-weight`, `color` and many other CSS properties, with the main exception of `font-size`.

## Validation

See [amp-fit-text rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-fit-text/validator-amp-fit-text.protoascii) in the AMP validator specification.

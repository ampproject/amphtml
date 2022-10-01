---
$category@: media
formats:
  - websites
teaser:
  text: Displays an Apester smart unit.
---

# amp-apester-media

## Usage

Displays an Apester smart unit.

## Attributes

### `data-apester-media-id`

This attribute is required for single mode, and it represents the ID of the
media (string value).

```html
<amp-apester-media height="390" data-apester-media-id="#"></amp-apester-media>
```

### `data-apester-channel-token`

This attribute is required for playlist mode, and it represents the token of the
channel (string value).

```html
<amp-apester-media
  height="390"
  data-apester-channel-token="#"
></amp-apester-media>
```

## Accessibility

`amp-apester-media` automatically adds the
[`aria-label`](https://www.w3.org/TR/wai-aria-1.1/#aria-label) attribute. This
[ARIA attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
is applied to the Apester Media loading image.

## Validation

See [`amp-apester-media` rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-apester-media/validator-amp-apester-media.protoascii)
in the AMP validator specification.

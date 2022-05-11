---
$category@: media
formats:
  - websites
teaser:
  text: The amp-contentpass element interacts with the amp-consent module to allow contentpass integration
---

# amp-contentpass

## Usage

The `amp-contentpass` element provides functionality for the amp-consent element when contentpass is integrated into the embedded consent UI.

The `data-proprety-id` attribute is required to communicate the correct property.

```html
<amp-contentpass layout="nodisplay" data-property-id="1234abcd" />
```

## Attributes

### `data-property-id`

The property ID provided to you by contentpass.

## Validation

See [amp-contentpass rules](validator-amp-contentpass.protoascii) in the AMP validator specification.

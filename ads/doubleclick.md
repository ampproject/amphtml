# Doubleclick

## Example

### Basic

```html
  <amp-ad width=320 height=50
      type="doubleclick"
      data-slot="/4119129/mobile_ad_banner"
      >
  </amp-ad>
```

### With additional targeting

```html
  <amp-ad width=320 height=50
      type="doubleclick"
      data-slot="/4119129/mobile_ad_banner"
      json='{"targeting":{"sport":["rugby","cricket"]},"categoryExclusion":"health","tagForChildDirectedTreatment":false}'
      >
  </amp-ad>
```

## Configuration

For semantics of configuration, please see ad network documentation.

Supported parameters:

- data-slot

Supported via `json` attribute:

- targeting
- categoryExclusion
- tagForChildDirectedTreatment

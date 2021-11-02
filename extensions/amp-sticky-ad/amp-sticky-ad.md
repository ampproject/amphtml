---
$category@: ads-analytics
formats:
  - websites
teaser:
  text: Provides a way to display and stick ad content at the bottom of the page.
---

# amp-sticky-ad

## Usage

Provides a way to display and stick ad content at the bottom of the page.

-   There can be only one `<amp-sticky-ad>` in an AMP document. The `<amp-sticky-ad>` should only have one direct child: `<amp-ad>`. **Note**: Make sure you include any required scripts for the `<amp-ad>` component.
-   The sticky ad appears at the bottom of a page.
-   The sticky ad introduces a full-width blank container and then fills the sticky ad based on the width and height of the `<amp-ad>`.
-   The height of the sticky-ad is whatever its child needs up to its max-height.
-   The max-height of the sticky-ad is 100px, if the height exceeds 100px then the height would be 100px and overflow content will be hidden.
-   The width of the sticky-ad is set to 100% using CSS and cannot be overridden.
-   The opacity of the sticky-ad is set to 1 using CSS and cannot be overridden.
-   The background color of the sticky-ad can be customized to match the page style. However, any semi-transparent or transparent background will not be allowed and will be changed to a non-transparent color.
-   When scrolled to the bottom of the page, the viewport is automatically padded with the additional height of the sticky ad, so that no content is ever hidden.
-   When in landscape mode, the sticky ad is center-aligned.
-   The sticky ad can be dismissed and removed by a close button.
-   If no ad is filled, the sticky ad container will collapse and will no longer be visible.

Example:

```html
<amp-sticky-ad layout="nodisplay">
  <amp-ad
    width="320"
    height="50"
    type="doubleclick"
    data-slot="/35096353/amptesting/formats/sticky"
  >
  </amp-ad>
</amp-sticky-ad>
```

## Attributes

### layout (required)

Must be set to `nodisplay`.

## Styling

The `amp-sticky-ad` component can be styled with standard CSS.

-   The sticky ad container style can be set through the `amp-sticky-ad` CSS class.
-   The close button style can be set through the `amp-sticky-ad-close-button` CSS class.
-   The padding bar between the ad and the close button style can be set through the `amp-sticky-ad-top-padding` CSS class.

## Validation

See [amp-sticky-ad rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-sticky-ad/validator-amp-sticky-ad.protoascii) in the AMP validator specification.

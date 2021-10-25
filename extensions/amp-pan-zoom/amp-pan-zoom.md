---
$category@: presentation
formats:
  - websites
teaser:
  text: Provides zooming and panning for arbitrary content.
---

# amp-pan-zoom

## Usage

The `<amp-pan-zoom>` component takes one child of arbitrary content and enables the ability for the user to zoom and pan the content via double tap or pinch-to-zoom actions. Tap events registered on the zoomable content or its children will trigger after a 300ms delay.

```html
<amp-layout layout="responsive" width="4" height="3">
  <amp-pan-zoom layout="fill">
    <svg>
      ...
    </svg>
  </amp-pan-zoom>
</amp-layout>
```

### Valid children tags

See the [list](https://github.com/ampproject/amphtml/blob/e517ee7e58215ea8baaa04fa5c6b09bba9581549/extensions/amp-pan-zoom/0.1/amp-pan-zoom.js#L47) of eligibles children tags of `amp-pan-zoom`.

## Attributes

### max-scale (optional)

Specifies a max zoom scale, which should be a positive number from 1 - 9. The default value is 3.

### initial-scale (optional)

Specifies a default zoom scale, which should be a positive number from 1 - 9. The default value is 1.

### initial-x, initial-y (optional)

Specifies default translation coordinates, otherwise both are set to 0. The value is expected to be a whole number.

### reset-on-resize (optional)

Refers to the ability to center the image and set the image's scale back to 1. Setting this attribute causes the component to reset the zoomable content on resize of the image itself.

### controls (optional)

Shows default controls (zoom in / zoom out button) which can be customized via public CSS classes.

### common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Actions

### transform

The `transform` action takes `scale`, `x`, `y` as parameters and sets the CSS transform property of the child content. If no `x` or `y` value is specified, the content zooms to center.

Assuming that there is an `<amp-pan-zoom>` component with the id `pan-zoom` on the page, a button with `on="tap:pan-zoom.transform(scale=3)"` will zoom to scale 3x at the center of the content, a button with `on="tap:pan-zoom.transform(scale=3, x=50, y=10)"` will first scale the content to 3x scale, and then shift the content 50 pixels towards the left, and 10 pixels upwards. Consider the `scale`, `x`, and `y` attributes directly applied to the content's CSS transform attribute after animation.

## Events

### transformEnd

The `<amp-pan-zoom>` component triggers the `transformEnd` event whenever the pan or zoom animation is complete. This event emits the `scale`, `x`, and `y` parameters. The `scale` parameter contains the current scale of the child content being zoomed. The `x` and `y` parameters contain the `x` and `y` translation of the child content from center in pixels, respectively.

This example contains an `amp-pan-zoom` component that will update `amp-state` on `transformEnd`.

```html
<amp-state id="transform">
  <script type="application/json">
    {
      "scale": 1,
      "y": 0,
      "x": 0
    }
  </script>
</amp-state>
<p
  [text]="'Current scale: ' + transform.scale + ', x: ' + transform.x + ', y: ' + transform.y"
>
  Current scale: 1
</p>
<amp-pan-zoom
  layout="responsive"
  width="1"
  height="1"
  id="pan-zoom"
  on="transformEnd:AMP.setState({transform: {scale: event.scale, x: event.x, y: event.y}})"
>
  ...
</amp-pan-zoom>
```

## Styling

The following public CSS classes are exposed to allow customization for the zoom buttons:

```css
.amp-pan-zoom-button .amp-pan-zoom-in-icon .amp-pan-zoom-out-icon;
```

Use `.amp-pan-zoom-button` to customize the dimensions, positioning, background-color, border-radius of all buttons.
Use `.amp-pan-zoom-in-icon` to customize the icon for the zoom in button.
Use `.amp-pan-zoom-out-icon` to customize the icon for the zoom out button.
You can also hide these buttons entirely and create your own using the `transform` action. To hide them, just apply

```css
.amp-pan-zoom-button {
  display: none;
}
```

## Validation

See [amp-pan-zoom rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-pan-zoom/validator-amp-pan-zoom.protoascii) in the AMP validator specification.

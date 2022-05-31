---
$category@: layout
formats:
  - websites
teaser:
  text: Displays elements in a full-viewport “lightbox” modal.
experimental: true
bento: true
---

# amp-lightbox

## Usage

The `amp-lightbox` component defines child elements that display in a
full-viewport overlay/modal. When the user taps or clicks an element (e.g., a
button), the `amp-lightbox` ID referenced in the clicked element's `on`
attribute triggers the lightbox to take up the full viewport and displays the
child elements of the `amp-lightbox`.

[tip type="read-on"]

For showing images in a lightbox, there's also the
[`<amp-image-lightbox>`](../amp-image-lightbox/amp-image-lightbox.md)
component. To show a gallery of images in a lightbox, you can use
[`<amp-lightbox-gallery>`](../amp-lightbox-gallery/amp-lightbox-gallery.md).

[/tip]

### Standalone use outside valid AMP documents

Bento allows you to use AMP components in non-AMP pages without needing
to commit to fully valid AMP. You can take these components and place them
in implementations with frameworks and CMSs that don't support AMP. Read
more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

To find the standalone version of `amp-lightbox`, see [**`bento-lightbox`**](./1.0/README.md).

## Attributes

### `id`

A unique identifier for the lightbox.

### `layout` (required)

Must be set to `nodisplay`.

### `animation`

Defines the style of animation for opening the lightbox. By default, this will
be set to `fade-in`. Valid values are `fade-in`, `fly-in-bottom`, and
`fly-in-top`.

This attribute can be configured to use different
options based on a [media query](./../../docs/spec/amp-html-responsive-attributes.md).

### `scrollable`

When the `scrollable` attribute is present, the content of the lightbox can
scroll when overflowing the height of the lightbox.

## Actions

### `open` (default)

Opens the lightbox.

### `close`

Closes the lightbox.

## Styling

You can style the `amp-lightbox` with standard CSS.

## Accessibility

Pressing the escape key on the keyboard or setting focus on an element outside
the lightbox closes the lightbox. Alternatively, setting the `on` attribute on
one or more elements within the lightbox and setting its method to `close`
closes the lightbox when the element is tapped or clicked. Once closed, the
focus will be sent back to the trigger element.

For accessibility reasons, if the user does not provide a focus in the lightbox
on open (using `autofocus` attribute or forcing focus on open), the focus will
be set on the first element using `on:tap`. Otherwise, a close button only
visible to screen readers, optionally using `data-close-button-aria-label`
attribute value, will be created and focused on.

```html
<button on="tap:quote-lb">See Quote</button>
<amp-lightbox id="quote-lb" layout="nodisplay">
  <blockquote>
    "Don't talk to me about JavaScript fatigue" - Horse JS
  </blockquote>
  <button on="tap:quote-lb.close">Nice!</button>
</amp-lightbox>
```

## Version notes

The experimental `1.0` version of `amp-lightbox` employs the following differences from version `0.1`:

-   This component does not currently support modifying browser history state.
-   `data-close-button-aria-label` is not supported and will soon be replaced with support for `slot="close-button"`.
-   `animate-in` has been renamed to `animation`.

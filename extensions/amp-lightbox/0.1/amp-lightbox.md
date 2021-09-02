---
$category@: layout
formats:
  - websites
  - ads
  - email
teaser:
  text: Displays elements in a full-viewport “lightbox” modal.
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
[`<amp-image-lightbox>`](../../amp-image-lightbox/amp-image-lightbox.md)
component. To show a gallery of images in a lightbox, you can use
[`<amp-lightbox-gallery>`](../../amp-lightbox-gallery/amp-lightbox-gallery.md).

[/tip]

[filter formats="ads"]

### Using `amp-lightbox` in AMPHTML ads <a name="a4a"></a>

There are some differences between using `amp-lightbox` in normal AMP documents
vs. [ads written in AMPHTML](../../amp-a4a/amp-a4a-format.md).

[tip type="note"]

The `amp-lightbox` component for use in AMPHTML ads is
[experimental](https://amp.dev/documentation/guides-and-tutorials/learn/experimental)
and under active development. To use `amp-lightbox` in AMPHTML ads,
[enable the `amp-lightbox-a4a-proto` experiment](http://cdn.ampproject.org/experiments.html).

[/tip]

#### Required `close-button`

For AMPHTML ads, the `close-button` attribute is required. This attribute causes
a header to render at the top of your lightbox. The header contains a close
button and a label that displays "Ad". Requirement of this header is needed to:

-   Set a consistent and predictable user experience for AMPHTML ads.
-   Ensure that an exit point for the lightbox always exists, otherwise the
    creative could effectively hijack the host document content via a lightbox.

The `close-button` attribute is required and only allowed in AMPHTML ads. In
regular AMP documents, you can render a close button wherever you need it as
part of the `<amp-lightbox>` content.

#### Scrollable lightboxes are disallowed

For AMPHTML ads, scrollable lightboxes are not allowed.

#### Transparent background

When you use `<amp-lightbox>` in AMPHTML ads, the background of your `<body>`
element becomes transparent because the AMP runtime resizes and realigns your
creative's content before the lightbox is expanded. This is done to prevent a
visual "jump" of the creative while the lightbox opens. If your creative needs a
background, set it on an intermediate container (like a full-size `<div>`)
instead of the `<body>`.

When the AMPHTML ad is running in a third-party environment (for example, in a
non-AMP document), the creative is centered relative to the viewport and is then
expanded. This is because third-party iframes need to rely on a postMessage API
to enable features like frame resizing, which is asynchronous, so centering the
creative first allows a smooth transition without visual jumps.

#### Examples of transitions in lightboxes for AMPHTML ads

In the examples below, we demonstrate how the transition looks for an AMPHTML ad
that has the `animate-in="fly-in-bottom"` attribute set on the lightbox element
for an AMPHTML ad in a friendly iframe, and an AMPHTML ad in a third-party
iframe.

##### On friendly iframes (e.g., coming from an AMP cache)

<amp-img alt="lightbox ad in friendly iframe"
    layout="fixed"
    width="360" height="480"
    src="https://github.com/ampproject/amphtml/raw/main/docs/spec/img/lightbox-ad-fie.gif" >
<noscript>
<img alt="lightbox ad in friendly iframe" src="../../docs/spec/img/lightbox-ad-fie.gif" />
</noscript>
</amp-img>

##### On third-party iframes (e.g., outside the AMP cache)

<amp-img alt="lightbox ad in 3p iframe"
    layout="fixed"
    width="360" height="480"
    src="https://github.com/ampproject/amphtml/raw/main/docs/spec/img/lightbox-ad-3p.gif" >
<noscript>
<img alt="lightbox ad in 3p iframe" src="../../docs/spec/img/lightbox-ad-3p.gif" />
</noscript>
</amp-img>

[/filter]<!-- formats="ads" -->

## Attributes

### `id`

A unique identifier for the lightbox.

### `layout`

Must be set to `nodisplay`.

[filter formats="ads"]

### `close-button`

Renders a close button header at the top of the lightbox. This attribute is
required for use with [AMPHTML Ads](#a4a). It is invalid on other AMP formats.

[/filter]<!-- formats="ads" -->

### `animate-in` (optional)

Defines the style of animation for opening the lightbox. By default, this will
be set to `fade-in`. Valid values are `fade-in`, `fly-in-bottom`, and
`fly-in-top`.

[tip type="important"]

The `fly-in-top` and `fly-in-bottom` animation presets modify the `transform`
property of the `amp-lightbox` element. Do not rely on transforming the
`amp-lightbox` element directly. If you need to apply a transform, set it on a
nested element instead.

[/tip]

[filter formats="websites, stories"]

### `data-close-button-aria-label` (optional)

Optional attribute used to set ARIA label for the autogenerated close button
added for accessibility. By default the applied label is "Close the modal".

### `scrollable` (optional)

When the `scrollable` attribute is present, the content of the lightbox can
scroll when overflowing the height of the lightbox.

[/filter]<!-- formats="websites, stories" -->

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

## Validation

See [`amp-lightbox` rules](../validator-amp-lightbox.protoascii)
in the AMP validator specification.

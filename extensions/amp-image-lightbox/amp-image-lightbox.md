---
$category@: layout
formats:
  - websites
  - email
teaser:
  text: Provides a lightbox effect for a specified image.
---

# amp-image-lightbox

## Usage

The `amp-image-lightbox` component provides a lightbox experience for a
specified image. When the user clicks the image, the image displays in the
center of a full-viewport lightbox.

```html
<amp-image-lightbox id="lightbox1" layout="nodisplay"></amp-image-lightbox>
<amp-img
  on="tap:lightbox1"
  role="button"
  tabindex="0"
  src="image1.jpg"
  width="200"
  height="100"
></amp-img>
```

When the user clicks the image, the `<amp-img>` activates the
`<amp-image-lightbox>` via the
[`on`](https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#on)
action, which references the ID of the `<amp-image-lightbox>` element (i.e.,
`lightbox1`). The `<amp-image-lightbox>` then displays the image in the center
of the full-viewport lightbox. Note that the `amp-image-lightbox` element itself
must be empty and must be set to `layout=nodisplay`.

Among other things the `amp-image-lightbox` allows the following user
manipulations: zooming, panning, showing/hiding of the description. Pressing the
escape key on a keyboard closes the lightbox.

[tip type="read-on"]

To show a gallery of images in a lightbox, there's also the
[`<amp-lightbox-gallery>`](../amp-lightbox-gallery/amp-lightbox-gallery.md)
component. To display other types of elements in a lightbox, use
[`<amp-lightbox>`](../amp-lightbox/amp-lightbox.md).

[/tip]

### Use a single lightbox for multiple images

You can use the same `amp-image-lightbox` for more than one image on the AMP
page.

In this example, two images display: a cat and a frog. When the user clicks
either image, the image displays in the lightbox.

```html
<amp-image-lightbox id="lightbox1" layout="nodisplay"></amp-image-lightbox>

<amp-img
  on="tap:lightbox1"
  role="button"
  tabindex="0"
  src="/img/frog.jpg"
  layout="responsive"
  width="360"
  height="360"
></amp-img>

<amp-img
  on="tap:lightbox1"
  role="button"
  tabindex="0"
  src="/img/cat.jpg"
  layout="responsive"
  width="360"
  height="360"
></amp-img>
```

### Add captions

Optionally, you can display captions at the bottom of the viewport for the
image. The `<amp-image-lightbox>` components determines the content for the
caption as follows:

1.  If the image is in a `figure` tag, the content of the `<figcaption>`
    displays for the caption.
1.  If the image specifies an `aria-describedby` attribute, the content of the
    element whose ID is specified by the `aria-describedby` attribute displays
    for the caption.

```html
<!-- Captions via figcaption -->
<figure>
  <amp-img
    on="tap:lightbox1"
    role="button"
    tabindex="0"
    src="dog.jpg"
    layout="responsive"
    width="300"
    height="246"
  ></amp-img>
  <figcaption>Border Collie</figcaption>
</figure>

<!-- Captions via aria-describedby -->
<div>
  <amp-img
    on="tap:lightbox1"
    role="button"
    tabindex="0"
    src="dog.jpg"
    aria-describedby="imageDescription"
    layout="responsive"
    width="300"
    height="246"
  ></amp-img>
  <div id="imageDescription">This is a border collie.</div>
</div>
```

## Attributes

### `layout`

Must be set to `nodisplay`.

### `id`

The ID for the lightbox element that's used as a target for the image's `on`
action.

### `data-close-button-aria-label` (optional)

An ARIA label that you can use for a close button.

## Actions

### `open` (default)

Opens the image lightbox with the source image being the one that triggered the
action.

## Styling

You can style the `amp-image-lightbox` component with standard CSS. Some of the
properties that can be styled are `background` and `color`. The
`amp-image-lightbox-caption` class is also available to style the caption
section.

## Validation

See [`amp-image-lightbox` rules](validator-amp-image-lightbox.protoascii)
in the AMP validator specification.

---
$category@: media
formats:
  - websites
  - ads
  - email
teaser:
  text: Manages an animated image, typically a GIF.
---

# amp-anim

## Usage

The `amp-anim` component displays a GIF animation with optimized CPU management.

The `amp-anim` component lets the AMP framework reduce the resources it spends
on the animation when it's off-screen. Otherwise, the behavior of `amp-anim` is
identical to [`amp-img`](https://amp.dev/documentation/components/amp-img/). You
can implement a [placeholder](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/placeholders/)
element to further optimize `amp-anim`.

```html
<amp-anim width="400" height="300" src="my-gif.gif">
  <amp-img placeholder width="400" height="300" src="my-gif-screencap.jpg">
  </amp-img>
</amp-anim>
```

## Attributes

### `src`

Specifies the URL for a GIF image.

[filter formats="email"]
In an AMP email, the `src` must point to an absolute `https` URL. Use of
`amp-anim` in email doesn't allow the following attributes:

-   `srcset`
-   `object-fit`
-   `object-position`

[/filter]

[filter formats="websites, ads"]

### `srcset`

Specifies the image URL to use in different circumstances. Operates the same as
the [`srcset` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-srcset)
on the `img` tag.

[/filter]

### `alt`

Provides a string of alternate text for accessibility purposes. Operates the
same as the [`alt` attribute](https://www.w3schools.com/tags/att_img_alt.asp) on
the `img` tag.

### `attribution`

Indicates the attribution of the image. For example, `attribution="CC courtesy of Cats on Flicker"`.

### `width` and `height`

Provides the explicit size of the image.

### Common attributes

`amp-anim` includes the
[common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Styling

You can directly style `amp-anim` with CSS properties. The following example sets
a grey background placeholder:

```html
<style amp-custom>
  .amp-anim {
      background-color: grey;
  }
</style>
```

## Validation

See [`amp-anim` rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-anim/validator-amp-anim.protoascii)
in the AMP validator specification.

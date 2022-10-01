---
$category: media
formats:
  - websites
  - email
  - ads
  - stories
teaser:
  text: Replaces the HTML5 img tag.
---

# amp-img

## Usage

The AMP HTML replacement for the normal HTML `img` tag. With `amp-img`, AMP
provides a powerful replacement.

AMP may choose to delay or prioritize resource loading based on the viewport
position, system resources, connection bandwidth, or other factors. The
`amp-img` components allows the runtime to effectively manage image resources
this way.

`amp-img` components, like all externally fetched AMP resources, must be given
an explicit size (as in `width` / `height`) in advance, so that the aspect ratio
can be known without fetching the image. Actual layout behavior is determined by
the `layout` attribute.

[tip type="read-on"]

Learn more about layouts in the
[AMP HTML Layout System](../../../docs/spec/amp-html-layout.md)
spec and
[Supported Layouts](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout.html#the-layout-attribute).

[/tip]

In the following example, we display an image that responds to the size of the
viewport by setting `layout=responsive`. The image stretches and shrinks
according to the aspect ratio specified by the `width` and `height`.

[example preview="inline" playground="true"]

```html
<amp-img
  alt="A view of the sea"
  src="{{server_for_email}}/static/inline-examples/images/sea.jpg"
  width="900"
  height="675"
  layout="responsive"
>
</amp-img>
```

[/example]

[tip type="read-on"]

Learn about responsive AMP pages in the
[Create Responsive AMP Pages](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/responsive_design)
guide.

[/tip]

If the resource requested by the `amp-img` component fails to load, the space
will be blank unless a
[`fallback`](https://amp.dev/documentation/guides-and-tutorials/learn/amp-html-layout#fallback)
child is provided. A fallback is only executed on the initial layout and
subsequent `src` changes after the fact (through resize + `srcset` for example)
will not have a fallback for performance implications.

### Specify a fallback image

In the following example, if the browser cannot load the image, it'll display
the fallback image instead (here we're using an inline SVG as fallback):

[example preview="inline" playground="true"]

```html
<amp-img
  alt="Misty road"
  width="550"
  height="368"
  src="image-does-not-exist.jpg"
>
  <amp-img
    alt="Misty road"
    fallback
    width="550"
    height="368"
    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSAiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmlld0JveD0iMSAxIDggNCI+PGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjYiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQW9BQUFBR0NBWUFBQUQ2OEEvR0FBQUFBWE5TUjBJQXJzNGM2UUFBQUVSbFdFbG1UVTBBS2dBQUFBZ0FBWWRwQUFRQUFBQUJBQUFBR2dBQUFBQUFBNkFCQUFNQUFBQUJBQUVBQUtBQ0FBUUFBQUFCQUFBQUNxQURBQVFBQUFBQkFBQUFCZ0FBQUFEK2lGWDBBQUFBcjBsRVFWUUlIVDJQU1FxRlFBeEVYN2VpNG9BYkVRV3Y0TVlMZUhLdjQwSVV3UW5uL25ZdmZxQ29JcWxRaVVpU1JQbStqNVFTei9PNDd4dkhjUmlHZ2I3dnNTeUw2N3FRNy91YW9XNHN5L0kzYXYwOGp6SHlsZFNHZmQrcDY5cXcxbTNia21VWlFnalQweXlpS0ZKNlE4ZVdaVWxSRklSaGFLS2JwdUU4VCtaNVJyaXVxejZna2VjNVZWVXhqaVBUTkpremp1TmcyemJzN3htQ0lDQk5VK0k0cHVzNmxGS3M2NHB0MjBicnhCODZ4VmdkUHdJV2NRQUFBQUJKUlU1RXJrSmdnZz09Ii8+PGZpbHRlciBpZD0iYmx1ciI+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iLjUiIC8+PC9maWx0ZXI+PC9zdmc+"
  >
  </amp-img>
</amp-img>
```

[/example]

A placeholder background color or other visual can be set using CSS selector and
style on the element itself.

Additional image features like captions can be implemented with standard HTML
(for example, `figure` and `figcaption`).

[tip type="read-on"]

Learn more about using `amp-img` from these resources:

-   [Placeholders & fallbacks](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/placeholders)
-   [Include Images & Video](https://amp.dev/documentation/guides-and-tutorials/develop/media_iframes_3p/)

[/tip]

### Scale an image up to a maximum width

If you want your image to scale as the window is resized but up to a maximum
width (so the image doesn't stretch beyond its width):

1.  Set `layout=responsive` for `<amp-img>`.
2.  On the container of the image, specify the
    `max-width:<max width to display image>` CSS attribute. Why on the
    container? An `amp-img` element with `layout=responsive` is a _block-level_
    element, whereas, `<img>` is _inline_. Alternatively, you could set
    `display: inline-block` in your CSS for the `amp-img` element.

### The difference between the `responsive` and `intrinsic` layouts

Both the `responsive` and `intrinsic` layouts create an image that will scale
automatically. The main difference is that the `intrinsic` layout uses an SVG
image as its scaling element. This will make it behave in the same way as a
standard HTML image while retaining the benefit of the browser knowing the image
size on initial layout. The `intrinsic` layout will have an intrinsic size and
will inflate a floated `div` until it reaches either the image size defined by
the width and height attributes passed to the `amp-img` (not by the natural size
of the image) or a CSS constraint such as `max-width`. The `responsive` layout
will render `0x0` in a floated `div` because it takes its size from the parent,
which has no natural size when floated.

### Set a fixed sized image

If you want your image to display at a fixed size:

1.  Set `layout=fixed` for `<amp-img>`.
2.  Specify the `width` and `height`.

[tip type="read-on"]

Learn about the
[inferred layout](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout#what-if-the-layout-attribute-isn%E2%80%99t-specified?)
if you don't specify the `layout` attribute.

[/tip]

### Set the aspect ratio

For responsive images, the `width` and `height` do not need to match the exact
width and height of the `amp-img`; those values just need to result in the same
aspect-ratio.

For example, instead of specifying `width="900"` and `height="675"`, you can
just specify `width="1.33"` and `height="1"`.

[example preview="inline" playground="true"]

```html
<amp-img
  alt="A view of the sea"
  src="{{server_for_email}}/static/inline-examples/images/sea.jpg"
  width="1.33"
  height="1"
  layout="responsive"
>
</amp-img>
```

[/example]

### Set multiple source files for different screen resolutions

[filter formats="websites, stories, ads"]

The [`srcset`](#srcset) attribute should be used to provide different
resolutions of the same image, that all have the same aspect ratio. The browser
will automatically choose the most appropriate file from `srcset` based on the
screen resolution and width of the user's device.

In contrast, the `media`
attribute shows or hides AMP components, and should be used when designing
responsive layouts. The appropriate way to display images with differing aspect
ratios is to use multiple `<amp-img>` components, each with a `media` attribute
that matches the screen widths in which to show each instance.

See the guide on
[creating responsive AMP pages](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/responsive_design#displaying-responsive-images)
for more details.

[/filter]<!-- formats="websites, stories, ads" -->

[filter formats="email"]

The `media`
attribute shows or hides AMP components, and should be used when designing
responsive layouts. The appropriate way to display images with differing aspect
ratios is to use multiple `<amp-img>` components, each with a `media` attribute
that matches the screen widths in which to show each instance.

See the guide on
[creating responsive AMP pages](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/responsive_design#displaying-responsive-images)
for more details.

[/filter]<!-- formats="email" -->

[filter formats="websites, stories, ads"]

### Maintain the aspect ratio for images with unknown dimensions

The AMP layout system requires the aspect ratio of an image in advance before
fetching the image; however, in some cases you might not know the image's
dimensions. To display images with unknown dimensions and maintain the aspect
ratios, combine AMP's
[`fill`](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout/#supported-values-for-the-layout-attribute)
layout with the
[`object-fit`](https://css-tricks.com/almanac/properties/o/object-fit/) CSS
property. For more information, see the
[How to support images with unknown dimensions](https://amp.dev/documentation/examples/style-layout/how_to_support_images_with_unknown_dimensions/)
example.

[/filter]<!-- formats="websites, stories, ads" -->

### Accessibility considerations for images

`<amp-img>` allows you to include animated images, like GIF or APNG. However, remember that animations included this way can't usually be paused/stopped by users. This can, depending on the image and its size, be a minor distraction, or a major problem for certain user groups - particularly, if the animation contains fast strobing color changes. In general, we recommend avoiding the use of animated images altogether, unless you are certain that they won't have an adverse impact.

`<amp-img>` can also be used to include images of text. It is usually preferable to use actual HTML text, rather than images of text, whenever possible. If an image of text must be used (for instance, because a specific typefaces is mandated by corporate identity/brand guidelines), make sure that the `alt` accurately reflects the text visible in the image.

Lastly, if images contain text or important non-text elements (such as bar charts, infographics, icons) that are essential to understanding the content of the image, make sure that they have sufficient color contrast. See [web.dev color and contrast accessibility](https://web.dev/color-and-contrast-accessibility/) for an introduction (primarily around text contrast) and [Knowbility: Exploring WCAG 2.1 — 1.4.11 Non‑text Contrast](https://knowbility.org/blog/2018/WCAG21-1411Contrast/) for more details around non-text elements.

#### Choosing an appropriate text alternative

For suggestions and advice on how to choose an appropriate text alternative for images, you can refer to the [W3C WAI tutorial "An alt Decision Tree"](https://www.w3.org/WAI/tutorials/images/decision-tree/) and the [HTML5.2 Requirements for providing text to act as an alternative for images](https://www.w3.org/TR/html52/semantics-embedded-content.html#alt-text).

## Attributes

### `src`

[filter formats="websites, stories, ads"]

This attribute is similar to the `src` attribute on the `img` tag. The value
must be a URL that points to a publicly-cacheable image file. Cache providers
may rewrite these URLs when ingesting AMP files to point to a cached version of
the image.

[/filter] <!-- formats="websites, stories, ads" -->

[filter formats="email"]

This attribute is similar to the `src` attribute on the `img` tag. For emails,
the URL must be `https`.

The AMP for Email spec disallows the use of the following attributes on the AMP
email format.

-   `[src]`
-   `[srcset]`
-   `srcset`
-   `lightbox`
-   `lightbox-thumbnail-id`
-   `object-fit`
-   `object-position`

[/filter] <!-- formats="email" -->

[filter formats="websites, stories, ads"]

### `srcset` <a name="srcset"></a>

Same as `srcset` attribute on the `img` tag. For browsers that do not support
`srcset`, `<amp-img>` will default to using `src`. If only `srcset` and no `src`
is provided, the first url in the `srcset` will be selected.

[/filter] <!-- formats="websites, stories, ads" -->

### `sizes`

The value of the AMP `sizes` attribute is a sizes expression that selects the
defined size corresponding to the media query based on the current window size.
<strong>Additionally, AMP sets an inline style for `width` on the
element</strong>. If the `srcset` attribute is provided, `<amp-img>` will
autogenerate the HTML5 definition of the `sizes` attribute for the underlying
`<img>`, when none is specified. If the `srcset` attribute is not provided, no
`sizes` attribute will be autogenerated for the underlying `<amp-img>`.

It is possible to use `sizes` on `<amp-img>` without `srcset` purely for setting
an inline style for `width` according to the matched media query, or purely for
inferencing layout `responsive`.

[tip type="note"]

For the `<img>` tag in `HTML`, the `sizes` attribute is used in conjunction with
the `srcset` attribute and specifies the intended display size of the image as
corresponding to a media condition. It will influence the intrinsic display size
of the underlying `<img>` based on
[browser behavior](https://gist.github.com/cathyxz/f17d12c07d60bcef52591e64e5e684fb).

[/tip]

See [Responsive images with srcset, sizes & heights](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/art_direction)
for usage of `sizes` and `srcset`.

### `alt`

A string of alternate text, similar to the `alt` attribute on `img`. Always provide an appropriate alternative text whenever you use `amp-img`. Otherwise, assistive technologies (such as screen readers) will announce the element as "unlabelled graphic" or similar. If the image is purely decorative and does not convey any content, you can use an empty `alt=""` - in this case, assistive technologies will simply ignore/not announce the element at all.

### `attribution`

A string that indicates the attribution of the image. For example,
`attribution="CC courtesy of Cats on Flicker"`.

### `height` and `width`

An explicit size of the image, which is used by the AMP runtime to determine the
aspect ratio without fetching the image.

### Common attributes

`amp-img` includes the
[common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

### Data attributes

Data attributes are copied from the `amp-img` element to the internal `img`
element created by the component.

## Styling

`amp-img` can be styled directly via CSS properties. Setting a grey background
placeholder for example could be achieved via:

```css
amp-img {
  background-color: grey;
}
```

[filter formats="email"]

Enable a lightbox effect on `amp-img` in email by using the
[`amp-image-lightbox`](../../../extensions/amp-image-lightbox/amp-image-lightbox.md)
component with the `on` action.

[/filter] <!-- formats="email" -->

## Validation

See [`amp-img` rules](https://github.com/ampproject/amphtml/blob/main/validator/validator-main.protoascii)
in the AMP validator specification.

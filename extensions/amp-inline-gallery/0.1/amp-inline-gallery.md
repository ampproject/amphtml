---
$category@: layout
formats:
  - websites
teaser:
  text: Displays multiple similar pieces of content along a horizontal axis, with optional pagination dots and thumbnails.
---

# amp-inline-gallery

## Usage

The `<amp-inline-gallery>` component uses an `<amp-base-carousel>` to display slides. The page must have the required scripts for both components in the document head. Typical usage might look like:

[example preview="inline" playground="true" imports="amp-inline-gallery,amp-base-carousel,amp-lightbox-gallery"]

```html
<amp-inline-gallery layout="container">
  <amp-base-carousel
    class="gallery"
    layout="responsive"
    width="3.6"
    height="2"
    snap-align="center"
    loop
    visible-count="1.2"
    lightbox
  >
    <amp-img
      src="{{server_for_email}}/static/inline-examples/images/image1.jpg"
      layout="responsive"
      width="450"
      height="300"
    ></amp-img>
    <amp-img
      src="{{server_for_email}}/static/inline-examples/images/image2.jpg"
      layout="responsive"
      width="450"
      height="300"
    ></amp-img>
    <amp-img
      src="{{server_for_email}}/static/inline-examples/images/image3.jpg"
      layout="responsive"
      width="450"
      height="300"
    ></amp-img>
  </amp-base-carousel>
  <amp-inline-gallery-pagination layout="nodisplay" inset>
  </amp-inline-gallery-pagination>
</amp-inline-gallery>
```

[/example]

The above example shows slides using an aspect ratio of 3:2, with 10% of a slide peeking on either side. An aspect ratio of 3.6:2 is used on the `amp-base-carousel` to show 1.2 slides at a time.

### Include pagination indicators

The `<amp-inline-gallery-pagination>` component determines how a pagination idicator should be displayed. By default, no pagination indicator is displayed.

The pagination indicator renders as dots when there are eight or fewer slides in the `amp-base-carousel`. For nine or more slides, the pagination indicator renders the current slide number and total number of slides, aligned to the right.

The pagination indicator location defaults to underneath the carousel. Adding the inset attribute to the `<amp-inline-gallery-pagination>` tag will overlay the pagination indicator on the carousel. To use different styles for different screen sizes, use the [media attribute](./../../../docs/spec/amp-html-responsive-attributes.md):

```html
<amp-inline-gallery layout="container">
  <amp-base-carousel>…</amp-base-carousel>
  <amp-inline-gallery-pagination
    media="(max-width: 599px)"
    layout="nodisplay"
    inset
  >
  </amp-inline-gallery-pagination>
  <amp-inline-gallery-pagination
    media="(min-width: 600px)"
    layout="fixed-height"
    height="24"
  >
  </amp-inline-gallery-pagination>
</amp-inline-gallery>
```

#### `amp-inline-gallery-pagination` attributes

##### `inset` (optional)

Displays the pagination indicator as inset, overlaying the carousel itself. When using `inset`, you should give the `<amp-inline-gallery-pagination>` element `layout="nodisplay"`.

##### common attributes

The `<amp-inline-gallery-pagination>` element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.

### Include thumbnails

The `amp-inline-gallery` component can display thumbnail preview in addition to, or instead of, the pagination indicators. By default, no thumbnails are shown in the gallery. Keep in mind the following best practices when using thumbnails:

-   Avoid using both pagination indicators and thumbnails with less than eight slides. The indicator dots are redundant in smaller galleries.
-   When using both pagination indicators and thumbnails, inset the pagination indicators to overlap the slides. View the code sample below to see an example.
-   Use the `media` attribute to show pagination indicators on smaller mobile devices and thumbnails on larger screens.
-   Load lower resolution images at thumbnails by using `srcset`. You can omit the `sizes` on `<amp-img>`, it will be automatically generated based on the rendered width.

The example below demonstrates a gallery with thumbnails visible at larger resolutions.

[example preview="inline" playground="true" imports="amp-inline-gallery,amp-base-carousel"]

```html
<amp-inline-gallery layout="container">
  <!--
    The amp-layout with layout="container" is used to display the pagination on
    top of the carousel instead of the thumbnails. You can also use a div with
    `position: relative;`
  -->
  <amp-layout layout="container">
    <amp-base-carousel
      class="gallery"
      layout="responsive"
      width="3"
      height="2"
      snap-align="center"
      loop
    >
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/779/600/400"
        srcset="https://picsum.photos/id/779/150/100 150w,
                https://picsum.photos/id/779/600/400 600w,
                https://picsum.photos/id/779/1200/800 1200w"
      >
      </amp-img>
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/1048/600/400"
        srcset="https://picsum.photos/id/1048/150/100 150w,
                https://picsum.photos/id/1048/600/400 600w,
                https://picsum.photos/id/1048/1200/800 1200w"
      >
      </amp-img>
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/108/600/400"
        srcset="https://picsum.photos/id/108/150/100 150w,
                https://picsum.photos/id/108/600/400 600w,
                https://picsum.photos/id/108/1200/800 1200w"
      >
      </amp-img>
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/130/600/400"
        srcset="https://picsum.photos/id/130/150/100 150w,
                https://picsum.photos/id/130/600/400 600w,
                https://picsum.photos/id/130/1200/800 1200w"
      >
      </amp-img>
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/14/600/400"
        srcset="https://picsum.photos/id/14/150/100 150w,
                https://picsum.photos/id/14/600/400 600w,
                https://picsum.photos/id/14/1200/800 1200w"
      >
      </amp-img>
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/165/600/400"
        srcset="https://picsum.photos/id/165/150/100 150w,
                https://picsum.photos/id/165/600/400 600w,
                https://picsum.photos/id/165/1200/800 1200w"
      >
      </amp-img>
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/179/600/400"
        srcset="https://picsum.photos/id/179/150/100 150w,
                https://picsum.photos/id/179/600/400 600w,
                https://picsum.photos/id/179/1200/800 1200w"
      >
      </amp-img>
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/392/600/400"
        srcset="https://picsum.photos/id/392/150/100 150w,
                https://picsum.photos/id/392/600/400 600w,
                https://picsum.photos/id/392/1200/800 1200w"
      >
      </amp-img>
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/468/600/400"
        srcset="https://picsum.photos/id/468/150/100 150w,
                https://picsum.photos/id/468/600/400 600w,
                https://picsum.photos/id/468/1200/800 1200w"
      >
      </amp-img>
    </amp-base-carousel>
    <!--
        If using fewer than 8 slides, consider adding something
        like media="(max-width: 799px)".
      -->
    <amp-inline-gallery-pagination layout="nodisplay" inset>
    </amp-inline-gallery-pagination>
  </amp-layout>
  <amp-inline-gallery-thumbnails
    media="(min-width: 800px)"
    layout="fixed-height"
    height="96"
  >
  </amp-inline-gallery-thumbnails>
</amp-inline-gallery>
```

[/example]

#### `amp-inline-gallery-thumbnails` attributes

##### Media Queries

The attributes for `<amp-inline-gallery-thumbnails>` can be configured to use different
options based on a [media query](./../../../docs/spec/amp-html-responsive-attributes.md).

##### `aspect-ratio-height` (optional)

Specifies the aspect ratio when used with `aspect-ratio-width`. The aspect radio defaults to match the slides in `<amp-base-carousel>`.

##### `aspect-ratio-width` (optional)

Specifies the aspect ratio when used with `aspect-ratio-height`. The aspect radio defaults to match the slides in `<amp-base-carousel>`.

##### `loop` (optional)

Loops thumbnails. Takes a value of `"true"` or `"false"`. Defaults to `"true"`.

##### common attributes

The `<amp-inline-gallery-thumbnails>` element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.

## Attributes

### common attributes

This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.

## Validation

See [amp-inline-gallery rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-inline-gallery/validator-amp-inline-gallery.protoascii) in the AMP validator specification.

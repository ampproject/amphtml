---
$category@: layout
formats:
  - websites
teaser:
  text: Displays multiple similar pieces of content along a horizontal axis, with optional pagination dots and thumbnails.
experimental: true
bento: true
---

<!---
Copyright 2021 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# amp-inline-gallery

## Usage

The `<amp-inline-gallery>` component uses an `<amp-base-carousel>` to display slides. The page must have the required scripts for both components in the document head. Typical usage might look like:

[example preview="inline" playground="true" imports="amp-inline-gallery:1.0,amp-base-carousel:1.0"]

```html
<amp-inline-gallery layout="container">
  <amp-base-carousel
    class="gallery"
    layout="responsive"
    width="3.6"
    height="2"
    snap-align="center"
    loop="true"
    visible-count="1.2"
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

### Standalone use outside valid AMP documents

Bento AMP allows you to use AMP components in non-AMP pages without needing to commit to fully valid AMP. You can take these components and place them in implementations with frameworks and CMSs that don't support AMP. Read more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

#### Example

The example below demonstrates `amp-inline-gallery` component in standalone use.

[example preview="top-frame" playground="false"]

```html
<head>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-inline-gallery-1.0.css">
  <script async custom-element="amp-inline-gallery" src="https://cdn.ampproject.org/v0/amp-inline-gallery-1.0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-base-carousel-1.0.css">
  <script async custom-element="amp-inline-gallery" src="https://cdn.ampproject.org/v0/amp-base-carousel-1.0.js"></script>
  <style>
    amp-base-carousel {
      aspect-ratio: 3/1;
    }
    amp-base-carousel > div {
      aspect-ratio: 1/1;
    }
    amp-inline-gallery-pagination {
      height: 20px;
    }
    .red-gradient {
      background: brown;
      background: linear-gradient(90deg, brown 50%, lightsalmon 90%, wheat 100%);
    }
    .blue-gradient {
      background: steelblue;
      background: linear-gradient(90deg, steelblue 50%, plum 90%, lavender 100%);
    }
    .green-gradient {
      background: seagreen;
      background: linear-gradient(90deg, seagreen 50%, mediumturquoise 90%, turquoise 100%);
    }
    .pink-gradient {
      background: pink;
      background: linear-gradient(90deg, pink 50%, lightsalmon 90%, wheat 100%);
    }
    .yellow-gradient {
      background: gold;
      background: linear-gradient(90deg, gold 50%, goldenrod 90%, darkgoldenrod 100%);
    }
    .orange-gradient {
      background: peru;
      background: linear-gradient(90deg, peru 50%, chocolate 90%, saddlebrown 100%);
    }
    .seafoam-gradient {
      background: darkseagreen;
      background: linear-gradient(90deg, darkseagreen 50%, lightseagreen 90%, MediumAquaMarine 100%);
    }
    .purple-gradient {
      background: rebeccapurple;
      background: linear-gradient(90deg, rebeccapurple 50%, mediumpurple 90%, mediumslateblue 100%);
    }
    .cyan-gradient {
      background: darkcyan;
      background: linear-gradient(90deg, darkcyan 50%, lightcyan 90%, white 100%);
    }
  </style>
</head>
<amp-inline-gallery>
  <amp-base-carousel id="my-carousel">
    <div class="red-gradient"></div>
    <div class="blue-gradient"></div>
    <div class="green-gradient"></div>
    <div class="pink-gradient"></div>
    <div class="yellow-gradient"></div>
    <div class="orange-gradient"></div>
    <div class="seafoam-gradient"></div>
    <div class="purple-gradient"></div>
    <div class="cyan-gradient"></div>
  </amp-base-carousel>
  <amp-inline-gallery-pagination>
</amp-inline-gallery>
<div class="buttons" style="margin-top: 8px;">
  <button id='prev-button'>Go to previous page of slides</button>
  <button id='next-button'>Go to next page of slides</button>
  <button id='go-to-button'>Go to slide with green gradient</button>
</div>
<script>
  (async () => {
    const carousel = document.querySelector('#my-carousel');
    await customElements.whenDefined('amp-base-carousel');
    const api = await carousel.getApi();
    // programatically advance to next slide
    api.next();
    // set up button actions
    document.querySelector('#prev-button').onclick = () => api.prev();
    document.querySelector('#next-button').onclick = () => api.next();
    document.querySelector('#go-to-button').onclick = () => api.goToSlide(2);
  })();
</script>
```

[/example]

#### Interactivity and API usage

Bento enabled components in standalone use are highly interactive through their API. In Bento standalone use, the element's API replaces AMP Actions and events and [`amp-bind`](https://amp.dev/documentation/components/amp-bind/?format=websites).

The `amp-inline-gallery` component is used in combination with `amp-base-carousel` and should access the [`amp-base-carousel` API](https://amp.dev/documentation/components/amp-base-carousel-v1.0/?format=websites) accordingly.

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-inline-gallery-1.0.css">
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-base-carousel-1.0.css">
```

Fully valid AMP pages use the AMP layout system to infer sizing of elements to create a page structure before downloading any remote resources. However, Bento use imports components into less controlled environments and AMP's layout system is inaccessible.

**Container type**

The `amp-inline-gallery-pagination` and `amp-inline-gallery-thumbnails` components have defined layout size types. To ensure the components render correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties):

```css
amp-inline-gallery-pagination {
  height: 20px;
}
amp-inline-gallery-thumbnails {
  aspect-ratio: 4/1
}
```

[tip type="note"]
Because this component composes with `amp-base-carousel`, be sure to also follow [`amp-base-carousel` styling recommendations](https://amp.dev/documentation/components/amp-base-carousel-v1.0/?format=websites#usage).
[/tip]

### Include pagination indicators

The `<amp-inline-gallery-pagination>` component determines how a pagination idicator should be displayed. By default, no pagination indicator is displayed.

The pagination indicator renders as dots when there are eight or fewer slides in the `amp-base-carousel`. For nine or more slides, the pagination indicator renders the current slide number and total number of slides, aligned to the right.

The pagination indicator location defaults to underneath the carousel. Adding the inset attribute to the `<amp-inline-gallery-pagination>` tag will overlay the pagination indicator on the carousel. To use different styles for different screen sizes, use the [media attribute](./../../spec/amp-html-responsive-attributes.md):

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

The default CSS for an `<amp-inline-gallery-pagination>` element with `inset` specifies it at `bottom: 0` with respect to its parent element. You may overwrite this to position the element over the carousel if there are other elements, such as `<amp-inline-gallery-thumbnails>`, directly below it.

##### common attributes

The `<amp-inline-gallery-pagination>` element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.

### Include thumbnails

The `amp-inline-gallery` component can display thumbnail preview in addition to, or instead of, the pagination indicators. By default, no thumbnails are shown in the gallery. Keep in mind the following best practices when using thumbnails:

-   Avoid using both pagination indicators and thumbnails with less than eight slides. The indicator dots are redundant in smaller galleries.
-   When using both pagination indicators and thumbnails, inset the pagination indicators to overlap the slides. View the code sample below to see an example.
-   Use the `media` attribute to show pagination indicators on smaller mobile devices and thumbnails on larger screens.
-   Load lower resolution images at thumbnails by using `data-thumbnail-src` on your slide elements.

The example below demonstrates a gallery with thumbnails visible at larger resolutions.

[example preview="inline" playground="true" imports="amp-inline-gallery:1.0,amp-base-carousel:1.0"]

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
      loop="true"
    >
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/779/600/400"
        srcset="https://picsum.photos/id/779/150/100 150w,
                https://picsum.photos/id/779/600/400 600w,
                https://picsum.photos/id/779/1200/800 1200w"
        data-thumbnail-src="https://picsum.photos/id/779/150/100"
      >
      </amp-img>
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/1048/600/400"
        srcset="https://picsum.photos/id/1048/150/100 150w,
                https://picsum.photos/id/1048/600/400 600w,
                https://picsum.photos/id/1048/1200/800 1200w"
        data-thumbnail-src="https://picsum.photos/id/1048/150/100"
      >
      </amp-img>
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/108/600/400"
        srcset="https://picsum.photos/id/108/150/100 150w,
                https://picsum.photos/id/108/600/400 600w,
                https://picsum.photos/id/108/1200/800 1200w"
        data-thumbnail-src="https://picsum.photos/id/108/150/100"
      >
      </amp-img>
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/130/600/400"
        srcset="https://picsum.photos/id/130/150/100 150w,
                https://picsum.photos/id/130/600/400 600w,
                https://picsum.photos/id/130/1200/800 1200w"
        data-thumbnail-src="https://picsum.photos/id/130/150/100"
      >
      </amp-img>
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/14/600/400"
        srcset="https://picsum.photos/id/14/150/100 150w,
                https://picsum.photos/id/14/600/400 600w,
                https://picsum.photos/id/14/1200/800 1200w"
        data-thumbnail-src="https://picsum.photos/id/14/150/100"
      >
      </amp-img>
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/165/600/400"
        srcset="https://picsum.photos/id/165/150/100 150w,
                https://picsum.photos/id/165/600/400 600w,
                https://picsum.photos/id/165/1200/800 1200w"
        data-thumbnail-src="https://picsum.photos/id/165/150/100"
      >
      </amp-img>
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/179/600/400"
        srcset="https://picsum.photos/id/179/150/100 150w,
                https://picsum.photos/id/179/600/400 600w,
                https://picsum.photos/id/179/1200/800 1200w"
        data-thumbnail-src="https://picsum.photos/id/179/150/100"
      >
      </amp-img>
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/392/600/400"
        srcset="https://picsum.photos/id/392/150/100 150w,
                https://picsum.photos/id/392/600/400 600w,
                https://picsum.photos/id/392/1200/800 1200w"
        data-thumbnail-src="https://picsum.photos/id/392/150/100"
      >
      </amp-img>
      <amp-img
        class="slide"
        layout="flex-item"
        src="https://picsum.photos/id/468/600/400"
        srcset="https://picsum.photos/id/468/150/100 150w,
                https://picsum.photos/id/468/600/400 600w,
                https://picsum.photos/id/468/1200/800 1200w"
        data-thumbnail-src="https://picsum.photos/id/468/150/100"
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
options based on a [media query](./../../spec/amp-html-responsive-attributes.md).

##### `aspect-ratio` (optional)

Specifies the aspect ratio expressed as `width / height`. The aspect radio defaults to match the slides in `<amp-base-carousel>`.

##### `loop` (optional)

Loops thumbnails. Takes a value of `"true"` or `"false"`. Defaults to `"false"`.

##### common attributes

The `<amp-inline-gallery-thumbnails>` element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.

## Attributes

### common attributes

This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.

## Version notes

Unlike `0.1`, the experimental `1.0` version of `amp-inline-gallery` includes the following changes:

-   `amp-inline-gallery-pagination` with `inset` attribute positions the element with an overwritable `bottom: 0`.
-   `amp-inline-gallery-thumbnails` takes `data-thumbnail-src` from slide elements (children of the `amp-base-carousel`) instead of `srcset`.
-   `amp-inline-gallery-thumbnails` takes `aspect-ratio` as expressed by `width / height` instead of two separate attributes, `aspect-ratio-width` and `aspect-ratio-height`.
-   `amp-inline-gallery-thumbnails` configuration for `loop` defaults to `"false"`.

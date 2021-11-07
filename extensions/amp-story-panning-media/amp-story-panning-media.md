---
$category@: media
formats:
  - stories
teaser:
  text: >-
    Transition an image's position and zoom between pages.
draft: true
experimental: true
tags:
  - immersive
  - panning
  - zooming
  - animation
  - media
  - transitions
author: processprocess
toc: true
$title: amp-story-panning-media
version: '0.1'
versions:
  - '0.1'
latest_version: '0.1'
is_current: true
$path: /documentation/components/amp-story-panning-media.html
$localization:
  path: '/{locale}/documentation/components/amp-story-panning-media.html'
scripts:
  - >-
    <script async custom-element="amp-story-panning-media"
    src="https://cdn.ampproject.org/v0/amp-story-panning-media-0.1.js"></script>
layouts:
  - Fill
---

<figure class="centered-fig">
  <amp-anim alt="amp-story-panning-media example" width="304" height="548" layout="fixed" src="https://raw.githubusercontent.com/processprocess/amphtml/panning-media-docs/extensions/amp-story-panning-media/img/amp-story-panning-media.gif">
    <noscript>
    <img alt="amp-story-panning-media example" src="https://raw.githubusercontent.com/processprocess/amphtml/panning-media-docs/extensions/amp-story-panning-media/img/amp-story-panning-media.gif" />
  </noscript>
  </amp-anim>
</figure>

The `amp-story-panning-media` component provides a way to pan and zoom an image between pages in [Web Stories](https://amp.dev/documentation/guides-and-tutorials/start/create_successful_stories/?format=stories).

## Usage

Use the `amp-story-panning-media` to transition an image between pages. The component can animate between position and zoom.

### Environment setup

Add the following script tag to the head of your Web Story:

```html
<script async custom-element="amp-story-panning-media" src="https://cdn.ampproject.org/v0/amp-story-panning-media-0.1.js"></script>
```

#### Configuration

The `amp-story-panning-media` component accepts 1 descendant. This descendant must be an [amp-img](https://amp.dev/documentation/components/amp-img/?format=stories). Components transition between pages when their child has the same `src` value.

```html
<amp-story-page>
  <amp-story-grid-layer>
    <amp-story-panning-media layout="fill" data-x="-10%" data-y="-20%" data-zoom=".8">
      <amp-img layout="fill" src="assets/world-map.jpg" width="4000" height="3059" ></amp-img>
    </amp-story-panning-media>
  </amp-story-grid-layer>
</amp-story-page>

<amp-story-page>
  <amp-story-grid-layer>
    <amp-story-panning-media layout="fill" data-x="20%" data-y="30%" data-zoom="2">
      <amp-img layout="fill" src="assets/world-map.jpg" width="4000" height="3059" ></amp-img>
    </amp-story-panning-media>
  </amp-story-grid-layer>
</amp-story-page>
```

### Web Story use example

The [Northern Sky Constellations Web Story](https://wsdemos.uc.r.appspot.com/constellations) uses a single star chart for the entire story. It highlights different constellations by panning and zooming. A parallax transition effect can be achieved by layering two png star images with transparency.

<amp-img alt="image of Northern Sky Constellations Web Story example" layout="fixed" src="https://raw.githubusercontent.com/processprocess/amphtml/panning-media-docs/extensions/amp-story-panning-media/img/constellations-screenshot.jpg" width="690" height="1009"></amp-img>

### Web Story creation tool integration example

The [Web Story creation tool integration example](https://philipbell-panning-media.web.app/examples/amp-story/controls.html) demos how to modify the component with sliders.

<amp-img alt="image of Web Story tool example" layout="fixed" src="https://raw.githubusercontent.com/processprocess/amphtml/panning-media-docs/extensions/amp-story-panning-media/img/controls.jpg" width="690" height="1009"></amp-img>

## Attributes

### data-x (optional)

Specifies the horizontal position in percentage.  
Centered on 0 (default) with positive values moving the image to the right (50% centering left edge of image) and negative to the left (-50% centering right edge of image).

### data-y (optional)

Specifies the vertical position in percentage.
Centered on 0 (default) with positive values moving the image down (50% centering top edge of image) and negative upward (-50% centering bottom edge of image).

### data-zoom (optional)

Specifies the level of zoom.
The default is 1. This corresponds to the image covering it's container with the same behavior the CSS declaration `background: cover;`.
A higher value scales the image up (zooms in). A lower value scales the image down (zooms out).
If `lock-bounds` is specified the image will not scale smaller than the viewport.

### lock-bounds (optional)

Prevents the image from panning beyond the viewport. When using `lock-bounds` `width` and `height` must be specified on the `amp-img` child.

## Validation

See validation rules in [amp-story-panning-media validator](https://github.com/processprocess/amphtml/blob/main/extensions/amp-story-panning-media/validator-amp-story-panning-media.protoascii).

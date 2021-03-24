---
$category@: media
formats:
  - stories
teaser:
  text: >-
<<<<<<< HEAD
    Transition an image's position and zoom between pages.
draft: true
experimental: true
=======
    Embeds 360 images and videos, explorable by gyroscope or animatable between points.
draft:
  - true
>>>>>>> d69f94a38 (basic structure.)
tags:
  - immersive
  - panning
  - zooming
  - animation
  - media
<<<<<<< HEAD
  - transitions
author: processprocess
=======
author: philipbell
>>>>>>> d69f94a38 (basic structure.)
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

<<<<<<< HEAD
<figure class="centered-fig">
  <amp-anim alt="amp-story-panning-media example" width="304" height="548" layout="fixed" src="https://raw.githubusercontent.com/processprocess/amphtml/panning-media-docs/extensions/amp-story-panning-media/img/amp-story-panning-media.gif">
    <noscript>
    <img alt="amp-story-panning-media example" src="https://raw.githubusercontent.com/processprocess/amphtml/panning-media-docs/extensions/amp-story-panning-media/img/amp-story-panning-media.gif" />
=======
[tip type="important"]Change image sources to ampproject/amphtml/master!!![/tip]

<figure class="centered-fig">
  <amp-anim alt="amp-story-panning-media example" width="300" height="533" layout="fixed" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story-panning-media/img/amp-story-panning-media.gif">
    <noscript>
    <img alt="amp-story-panning-media example" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story-panning-media/img/amp-story-panning-media.gif" />
>>>>>>> d69f94a38 (basic structure.)
  </noscript>
  </amp-anim>
</figure>

The `amp-story-panning-media` component provides a way to pan and zoom an image between pages in [Web Stories](https://amp.dev/documentation/guides-and-tutorials/start/create_successful_stories/?format=stories).

## Usage

<<<<<<< HEAD
Use the `amp-story-panning-media` to transition an image between pages. The component can animate between position and zoom.

### Environment setup

Add the following script tag to the head of your Web Story:

```html
<script async custom-element="amp-story-panning-media" src="https://cdn.ampproject.org/v0/amp-story-panning-media-0.1.js"><script>
```

#### Configuration

The `amp-story-panning-media` component accepts 1 descendant. This descendant must be an [amp-img](https://amp.dev/documentation/components/amp-img/?format=stories). Components transition between pages when their child has the same `src` value.

```html
<amp-story-page>
  <amp-story-grid-layer>
    <amp-story-panning-media layout="fill" x="-10%" y="-20%" zoom=".8">
      <amp-img layout="fill" src="assets/world-map.jpg" width="4000" height="3059" ></amp-img>
    </amp-story-panning-media>
  </amp-story-grid-layer>
</amp-story-page>

<amp-story-page>
  <amp-story-grid-layer>
    <amp-story-panning-media layout="fill" x="20%" y="30%" zoom="2">
      <amp-img layout="fill" src="assets/world-map.jpg" width="4000" height="3059" ></amp-img>
    </amp-story-panning-media>
  </amp-story-grid-layer>
</amp-story-page>
```
### Web Story use example

The [Northern Sky Constellations Web Story](https://philipbell-panning-media.web.app/examples/amp-story/northern-sky-constellations.html) uses a single star chart for the entire story. It highlights different constellations by panning and zooming. A parallax transition effect is also achieved by layering two png star images with transparency.

<amp-img alt="image of Northern Sky Constellations Web Story example" layout="responsive" src="https://raw.githubusercontent.com/processprocess/amphtml/panning-media-docs/extensions/amp-story-panning-media/img/constellations-screenshot.jpg" width="690" height="1009"></amp-img>

### Web Story creation tool integration example

The [Web Story creation tool integration example](https://philipbell-panning-media.web.app/examples/amp-story/controls.html) demos how to modify the  component with sliders.

<amp-img alt="image of Web Story tool example" layout="responsive" src="https://philipbell-panning-media.web.app/examples/amp-story/controls.html" width="690" height="1009"></amp-img>

## Attributes

### x (optional)

Specifies the horizontal position in percentage.  
Centered on 0 (default) with positive values moving the image to the right (50% centering left edge of image) and negative to the left (-50% centering right edge of image).

### y (optional)

Specifies the vertical position in percentage.
Centered on 0 (default) with positive values moving the image down (50% centering top edge of image) and negative upward (-50% centering bottom edge of image).

### zoom (optional)

Specifies the level of zoom.
The default is 1. This corresponds to the image fitting the viewport with [`layout=fill`](https://amp.dev/documentation/guides-and-tutorials/learn/amp-html-layout/?format=stories).
A higher value scales the image up (zooms in). A lower value scales the image down (zooms out).

### lock-bounds (optional)

Prevents the image from panning beyond the viewport. When using `lock-bounds` `width` and `height` must be specified on the `amp-img` child.

## Validation

This component is available in experimental. Validation details will be defined before launch.
=======
Use the `amp-story-panning-media` component to render 360 images and video. The component can animate between two points or be explorable via the device's gyroscope sensor. For best results, only use one element per [`amp-story-page`](https://amp.dev/documentation/components/amp-story-page/?format=stories).

### Accessibility considerations

Currently, the `amp-story-panning-media` component does not provide any controls for mouse or keyboard users.

### Media Requirements

The `amp-story-panning-media` component renders videos and images in [equirectangular projection](https://en.wikipedia.org/wiki/Equirectangular_projection).
This is the default format generated by many 360 cameras and 3D rendering software.

<amp-img src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story-panning-media/img/SeanDoran-Quela-sol1462-edited_ver2-sm_600-300.jpg" layout="intrinsic" width="400" height="230">

Credit: [NASA / JPL / MSSS / Seán Doran](https://informal.jpl.nasa.gov/museum/360-video).

### Dimensions

Use a 2:1 aspect ratio for the best distribution of resolution.

### Size

2048 x 1024 (2k) is recommended for images and video.

### Configuration

The `amp-story-panning-media` component accepts 1 descendant. This descendant must be an [amp-img](https://amp.dev/documentation/components/amp-img/?format=stories) or [amp-video](https://amp.dev/documentation/components/amp-video/?format=stories).

#### amp-image

[sourcecode:html]
<amp-story-panning-media layout="fill">
<amp-img layout="fill" src="assets/image360.jpg"></amp-img>
</amp-story-panning-media>
[/sourcecode]

#### amp-video

[sourcecode:html]
<amp-story-panning-media layout="fill">
<amp-video layout="fill" poster="assets/poster.jpg" autoplay loop>

<source src="assets/video360.mp4" type="video/mp4" />
</amp-video>
</amp-story-panning-media>
[/sourcecode]

Be sure to import the `amp-video` component.

#### Defining a initial point of view (PoV)

[sourcecode:html]
<amp-story-panning-media 
   layout="fill"
   heading-start="95" pitch-start="-10">
...
</amp-story-panning-media>
[/sourcecode]

#### PoV to PoV animation

[sourcecode:html]
<amp-story-panning-media 
   layout="fill"
   heading-start="95" pitch-start="-10"
   heading-end="-45" pitch-end="-20"
   duration="3s">
...
</amp-story-panning-media>
[/sourcecode]

The `duration` attribute is required for animation.

#### Gyroscope

Use the device gyroscope sensor to set the image's orientation.  
The component defaults to the `heading-end` value upon navigating to the page.  
If `heading-end` is not provided, `heading-start` is used. If neither are provided the heading will default to 0.

Serve the story over `https` to use this feature.

[sourcecode:html]
<amp-story-panning-media 
   layout="fill"
   controls="gyroscope"
   heading-start="95" pitch-start="-10"
   heading-end="-45" pitch-end="-20"
   duration="3s">
...
</amp-story-panning-media>
[/sourcecode]

##### Activate 360 button

If the device requires user permission to access the device’s gyroscope sensor an “activate 360” button will display.

<amp-img src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story-panning-media/img/activate-360.png" layout="intrinsic" width="88.5" height="36">

##### Animation fallback

If the device does not support gyroscope or the user declines permission, the component will fallback to animating if the animation is defined.

## Attributes

### Animation

#### heading-start {float} optional

Specifies the heading (horizontal angle in degrees) at the beginning of an animation.  
Centered on 0 (default) with a negative angle looking towards the left, positive angle to the right.

#### pitch-start {float} optional

Specifies the pitch (vertical angle in degrees) at the beginning of an animation.  
Centered on 0 (default) at the horizon, with a negative angle looking downwards, positive angle upwards.

#### zoom-start {float} optional

Specifies the zoom at the beginning of an animation.
The default is 1. This corresponds to a horizontal field of view of 90 degrees.
A higher value indicates a narrower field of view.

#### heading-end {float} optional

Specifies the heading of a complete animation.

#### pitch-end {float} optional

Specifies the pitch of a complete animation.

#### zoom-end {float} optional

Specifies the zoom of a complete animation.

#### duration {string} (required for animation)

Specifies how many seconds (s) or milliseconds (ms) an animation takes to complete.

### Controls

#### controls {“gyroscope”} optional

Specifies using the device’s gyroscope sensor to set orientation.
If the device requires permission for the sensor an `activate-360` button will display.
If the gyroscope sensor is not available, it will default to animating.

### Default orientations

These attributes correct rendering of images captured on a tilted axis.

#### scene-heading {float} optional

Specifies an absolute heading applied as a rotation matrix to the rendered image.

#### scene-pitch {float} optional

Specifies an absolute pitch applied as a rotation matrix to the rendered image.

#### scene-roll {float} optional

Specifies an absolute roll applied as a rotation matrix to the rendered image.

## Validation

See validation rules in [amp-story-panning-media validator](https://github.com/ampproject/amphtml/blob/master/extensions/amp-story-panning-media/validator-amp-story-panning-media.protoascii).
>>>>>>> d69f94a38 (basic structure.)

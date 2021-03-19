---
$category@: media
formats:
  - stories
teaser:
  text: >-
    Transition an image's position and zoom between pages.
draft:
  - true
tags:
  - immersive
  - panning
  - zooming
  - animation
  - media
  - transitions
author: philipbell
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

[tip type="important"]Change image sources to ampproject/amphtml/master!!![/tip]

<figure class="centered-fig">
  <amp-anim alt="amp-story-panning-media example" width="300" height="533" layout="fixed" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story-panning-media/img/amp-story-panning-media.gif">
    <noscript>
    <img alt="amp-story-panning-media example" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story-panning-media/img/amp-story-panning-media.gif" />
  </noscript>
  </amp-anim>
</figure>

The `amp-story-panning-media` component provides a way to pan and zoom an image between pages in [Web Stories](https://amp.dev/documentation/guides-and-tutorials/start/create_successful_stories/?format=stories).

## Usage

Use the `amp-story-panning-media` to transition an image between pages. The component can animate between position and zoom.

### Configuration

The `amp-story-panning-media` component accepts 1 descendant. This descendant must be an [amp-img](https://amp.dev/documentation/components/amp-img/?format=stories). Components associate with each other when they have a child with the same `src`.

[sourcecode:html]
<amp-story-page>
<amp-story-grid-layer>
<amp-story-panning-media layout="fill">
<amp-img layout="fill" src="assets/world-map.jpg" x="-10%" y="-20%" zoom=".8" width="4000" height="3059" ></amp-img>
</amp-story-panning-media>
</amp-story-grid-layer>
</amp-story-page>

<amp-story-page>
<amp-story-grid-layer>
<amp-story-panning-media layout="fill">
<amp-img layout="fill" src="assets/world-map.jpg" x="20%" y="20%" zoom="2" width="4000" height="3059" ></amp-img>
</amp-story-panning-media>
</amp-story-grid-layer>
</amp-story-page>
[/sourcecode]

## Attributes

### Animation

#### x {string} optional

Specifies the horizontal position in percentage.  
Centered on 0 (default) with positive values moving the image to the right and negative to the left.

#### y {string} optional

Specifies the vertical position in percentage.
Centered on 0 (default) with positive values moving the image to the top and negative to the bottom.

#### zoom {float} optional

Specifies the level of zoom.
The default is 1. This corresponds to the image fitting the viewport with [`layout=fill`](https://amp.dev/documentation/guides-and-tutorials/learn/amp-html-layout/?format=stories).

#### lock-bounds optional

Prevents the image from panning beyond the viewport. When using `lock-bounds` `width` and `height` must be specified on the `amp-img` child.

## Validation

See validation rules in [amp-story-panning-media validator](https://github.com/ampproject/amphtml/blob/master/extensions/amp-story-panning-media/validator-amp-story-panning-media.protoascii).

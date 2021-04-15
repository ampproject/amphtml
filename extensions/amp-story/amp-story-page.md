---
$category@: presentation
formats:
  - stories
teaser:
  text: A single screen of an AMP story.
---

<!--
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

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

# amp-story-page

## Usage

The `<amp-story-page>` component represents the content to display on a single page of a story.

<figure class="centered-fig">
  <amp-anim alt="Page 1 example" width="300" height="533" layout="fixed" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/pages-page-1.gif">
  <noscript>
    <img alt="Page 1 example" width="200" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/pages-page-1.gif" />
  </noscript>
  </amp-anim>
</figure>
<figure class="centered-fig">
  <amp-anim alt="Page 2 example" width="300" height="533" layout="fixed" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/pages-page-2.gif">
  <noscript>
    <img alt="Page 2 example" width="200" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/pages-page-2.gif" />
  </noscript>
  </amp-anim>
</figure>

```html
<amp-story-page id="cover">
  <amp-story-grid-layer template="fill">
    <amp-video
      layout="fill"
      src="background.mp4"
      poster="background.png"
      muted
      autoplay
    ></amp-video>
  </amp-story-grid-layer>
  <amp-story-grid-layer template="vertical">
    <h1>These are the Top 5 World's Most...</h1>
    <p>Jon Bersch</p>
    <p>May 18</p>
  </amp-story-grid-layer>
  <amp-story-grid-layer template="thirds">
    <amp-img
      grid-area="bottom-third"
      src="a-logo.svg"
      width="64"
      height="64"
    ></amp-img>
  </amp-story-grid-layer>
</amp-story-page>
```

## Valid children

The `<amp-story-page>` component contains one or more [layers](amp-story-grid-layer.md). Layers are stacked bottom-up (the first layer specified in the DOM is at the bottom; the last layer specified in the DOM is at the top).

## Attributes

### id [required]

A unique identifier for the page. Can be used for styling the page and its descendants in CSS, and is also used to uniquely identify the page in the URL fragment.

### auto-advance-after [optional]

Specifies when to auto-advance to the next page. If omitted, the page will not automatically advance. The value for `auto-advance-after` must be either a specified amount of time, or the `id` of an [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement) or video-interface.

#### Time

Auto-advance to the next story page after a specified amount of [time](https://developer.mozilla.org/en-US/docs/Web/CSS/time). The time must be positive.

```html
<amp-story-page id="tokyo" auto-advance-after="1s">
  ...
</amp-story-page>
```

#### Element `id`

You can auto-advance to the next story page when a video completes. Point the `auto-advance-after` attribute to the id of an [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement) or video-interface that displays the video. This includes AMP specific components, like [`amp-video`](../amp-video/amp-video.md).

```html
<amp-story-page id="tokyo" auto-advance-after="video1">
  ...
  	<amp-video autoplay id="video1"
    width="720" height="1280"
    poster="todo.jpg"
    layout="responsive">
    <source src="video1.mp4" type="video/mp4">
    </amp-video>
  ...
</amp-story-page>
```

### background-audio [optional]

A URI to an audio file that plays while this page is in view.

For example:

```html
<amp-story-page
  id="zurich"
  background-audio="./media/switzerland.mp3"
></amp-story-page>
```

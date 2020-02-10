---
$category@: presentation
formats:
  - websites
  - stories
teaser:
  text: A player for embedding and playing your favorite stories in your own website.
---

<!--
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

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

# <a name="`amp-story-player`"></a> `amp-story-player`

<figure class="centered-fig">
  <amp-anim alt="amp-story-player example" width="300" height="533" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/spec/img/amp-story-player.gif">
    <noscript>
    <img alt="amp-story-player example" src="https://github.com/ampproject/spec/img/amp-story-player.gif" />
  </noscript>
  </amp-anim>
</figure>

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>An easy way to embed and play stories in a website.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Scripts</strong></td>
    <td>
    <code>&lt;script async src="https://cdn.ampproject.org/amp-story-player-v0.js">&lt;/script></code>
    <code>&lt;link href="https://cdn.ampproject.org/amp-story-player-v0.css" rel='stylesheet' type='text/css'></code>
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><ul>
      <li>See <a href="https://github.com/ampproject/amphtml/blob/master/examples/amp-story/player.html">code snippet</a>.</li>
    </ul></td>
  </tr>
</table>

[TOC]

## AMP story player usage

Use `amp-story-player` to embed and play stories within a webpage.

### Embed in a non-AMP page

The following example demonstrates a basic embed of <amp-story-player> in a non-AMP webpage.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <script
      async
      src="https://cdn.ampproject.org/amp-story-player-v0.js"
    ></script>
    <link
      href="https://cdn.ampproject.org/amp-story-player-v0.css"
      rel="stylesheet"
      type="text/css"
    />
  </head>
  <body>
    <h1>This is a NON-AMP page that embeds a story below:</h1>
    <amp-story-player style="width: 360px; height: 600px;">
      <a
        href="https://example.com/story.html"
        style="--story-player-poster: url('https://example.com/img/promo3x4.jpg');"
      >
        <span>A description for my story.</span>
      </a>
    </amp-story-player>
  </body>
</html>
```

The high-level API for the player looks like the following:

[example preview="top-frame" playground="true"]

```html
<head>
  <script
    async
    src="https://cdn.ampproject.org/amp-story-player-v0.js"
  ></script>
  <link
    href="https://cdn.ampproject.org/amp-story-player-v0.css"
    rel="stylesheet"
    type="text/css"
  />
  <style injected>
    .story-player-iframe {
      background-size: cover;
      display: block;
      position: relative;
      height: 100%;
      width: 100%;
      flex: 0 0 100%;
    }

    .title {
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 1)
      );
      display: block;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      color: #fff;
      font-size: 40px;
      padding: 88px 32px 32px 32px;
      line-height: 1.25;
      text-shadow: 3px 3px #000;
    }
  </style>
</head>
<body>
  <h1>This is a NON-AMP page that embeds a story below:</h1>
  <amp-story-player style="width: 360px; height: 600px;">
    <a
      href="https://www-washingtonpost-com.cdn.ampproject.org/v/s/www.washingtonpost.com/graphics/2019/lifestyle/travel/amp-stories/a-locals-guide-to-what-to-eat-and-do-in-mexico-city/"
      data-poster-portrait-src="https://www-washingtonpost-com.cdn.ampproject.org/v/s/www.washingtonpost.com/graphics/2019/lifestyle/travel/amp-stories/a-locals-guide-to-what-to-eat-and-do-in-mexico-city/img/promo3x4.jpg"
      class="story"
    >
      <span class="title"
        >A local’s guide to what to eat and do in Mexico City</span
      >
    </a>
  </amp-story-player>
</body>
```

[/example]

### Attributes

The inline width and height ensures that the player will not cause any jumps in your website while the script is being loaded. Feel free to modify the values, but we recommend maintaining a 3:5 aspect ratio.

<table>
  <tr>
    <td width="40%"><strong>width [recommended]</strong></td>
    <td>Width of the player in pixels.</td>
  </tr>
  <tr>
    <td width="50%"><strong>height [recommended]</strong></td>
    <td>Height of the player in pixels.</td>
  </tr>
</table>

## Specify embedded story

The `<amp-story-player>` component contains one or more `<a>` tags, each of which represent a story. Use the `href` attribute to point to a particular story.

To provide a better experience for the user while the story is being loaded, as well as allowing search engines to crawl the embedded stories, you can provide some text inside the anchor tags.

You can also provide an image to work as a placeholder while the story is being loaded. Just add a `--story-player-poster` CSS variable as an inline style of the first anchor tag with its corresponding image URL:

### Attributes

<table>
  <tr>
    <td width="40%"><strong>href</strong></td>
    <td>URL pointing to the story.</td>
  </tr>
  <tr>
    <td width="50%"><strong>style="--story-player-poster: url('...');" [recommended]</strong></td>
    <td>URL pointing to the poster image of the story.</td>
  </tr>
</table>

```html
<amp-story-player style="width: 360px; height: 600px;">
  <a
    href="https://www.example.com/story.html"
    style="--story-player-poster: url('https://www.example.com/assets/cover1.html');"
  >
    <span>A title that describes this story.</span>
  </a>
</amp-story-player>
```

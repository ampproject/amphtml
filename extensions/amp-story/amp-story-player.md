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

The `amp-story-player` allows you to embed and play your favorite stories in your own website.

<figure class="centered-fig">
  <amp-anim alt="amp-story-player example" width="300" height="533" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/amp-story-player.gif">
    <noscript>
    <img alt="amp-story-player example" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/amp-story-player.gif" />
  </noscript>
  </amp-anim>
</figure>

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>An easy way to embed stories in your own website.</td>
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

## Version notes

| Version | Description      |
| ------- | ---------------- |
| 1.0     | Current version. |

## AMP story player

The `amp-story-player` allows you to embed and play your favorite stories in your own website.

### Boilerplate

The following markup is a decent starting point or boilerplate. Copy this and save it to a file with a `.html` extension.

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
        href="https://www-washingtonpost-com.cdn.ampproject.org/v/s/www.washingtonpost.com/graphics/2019/lifestyle/travel/amp-stories/a-locals-guide-to-what-to-eat-and-do-in-new-york-city/"
        style="--story-player-poster: url('https://www-washingtonpost-com.cdn.ampproject.org/i/s/www.washingtonpost.com/graphics/2019/lifestyle/travel/amp-stories/a-locals-guide-to-what-to-eat-and-do-in-new-york-city/img/promo3x4.jpg');"
      >
        <span class="title"
          >A local’s guide to what to eat and do in New York City</span
        >
      </a>
    </amp-story-player>
  </body>
</html>
```

### Features

- Improved experience over time (AKA the "Software as a Service" paradigm)
- Prerendering (coming soon!)
- Prefetching and caching resources (coming soon!)
- Customizable embed UI / chrome (coming soon!)
- Swipe/tap to next/previous (coming soon!)

### API

The high-level API for the player looks like the following:

```html
<amp-story-player style="width: 360px; height: 600px;">
  <a href="https://www.example.com/story1.html"></a>
  <a href="https://www.example.com/story2.html"></a>
  <a href="https://www.example.com/story3.html"></a>
  <a href="https://www.example.com/story4.html"></a>
</amp-story-player>
```

To provide a better experience for the user while the story is being loaded, you can provide some text inside the anchor tags.

You can also provide an image to work as a placeholder while the story is being loaded. Just add a `--story-player-poster` CSS variable as an inline style of the first anchor tag with its corresponding url:

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

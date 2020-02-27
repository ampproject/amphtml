---
$category@: presentation
formats:
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
    <img alt="amp-story-player example" src="https://github.com/ampproject/amphtml/raw/master/spec/img/amp-story-player.gif" />
  </noscript>
  </amp-anim>
</figure>

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Embed and play stories in a non-AMP website.</td>
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
    <td>
      <li>See <a href="https://github.com/ampproject/amphtml/blob/master/examples/amp-story/player.html">code snippet</a>.</li>
    </td>
  </tr>
</table>

[TOC]

## Usage

Use `amp-story-player` to embed and play stories within a webpage.

### Embed in a non-AMP page

The code snippet below demonstrates an embed of `<amp-story-player>` in a non-AMP webpage.

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
</head>
<body>
  <amp-story-player style="width: 360px; height: 600px;">
    <a
      href="https://preview.amp.dev/documentation/examples/introduction/stories_in_amp/"
      style="--story-player-poster: url('https://amp.dev/static/samples/img/story_dog2_portrait.jpg')"
    >
      Stories in AMP - Hello World
    </a>
  </amp-story-player>
</body>
```

[/example]

### Attributes

The inline width and height ensures that the player will not cause any jumps in your website while the script is being loaded. Feel free to modify the values, but we recommend maintaining a 3:5 aspect ratio.

#### style [recommended]

Inline CSS properties for the width and height of the player. e.g. `style="width: 360px; height: 600px;"`

## Specify embedded story

The `<amp-story-player>` component contains one `<a>` tag. Point the href attribute to the story URL.

Place the story's title within the `<a>` tag. This provides a better user experience and allows search engines to crawl embedded stories.

Use a poster image as a placeholder to display to users while the story loads. Add the `--story-player-poster` CSS variable as an inline style of the `<a>` tag and point to the poster image URL.

### Attributes

#### href

URL pointing to the story.

#### style="--story-player-poster: url('...');" [recommended]

CSS variable with the URL pointing to the poster image of the story.

```html
<amp-story-player style="width: 360px; height: 600px;">
  <a
    href="https://www.example.com/story.html"
    style="--story-player-poster: url('https://www.example.com/assets/cover1.html');"
  >
    A title that describes this story.
  </a>
</amp-story-player>
```

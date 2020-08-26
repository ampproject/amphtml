---
$category@: presentation
formats:
  - stories
teaser:
  text: A player for embedding and playing your favorite stories in your own AMP site.
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

## Usage

<figure class="centered-fig">
  <amp-anim alt="amp-story-player example" width="300" height="533" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/spec/img/amp-story-player.gif">
    <noscript>
    <img alt="amp-story-player example" src="https://github.com/ampproject/amphtml/raw/master/spec/img/amp-story-player.gif" />
  </noscript>
  </amp-anim>
</figure>

Use `amp-story-player` to embed and play stories within an AMP webpage.

### Embed in an AMP page

The code snippet below demonstrates an embed of `<amp-story-player>` in a AMP webpage.

[example preview="top-frame" playground="true"]

```html
<head>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script
    async
    custom-element="amp-story-player"
    src="https://cdn.ampproject.org/v0/amp-story-player-0.1.js"
  ></script>
</head>
<body>
  <amp-story-player layout="fixed" width="360" height="600">
    <a
      href="https://preview.amp.dev/documentation/examples/introduction/stories_in_amp/"
      style="--story-player-poster: url('https://amp.dev/static/samples/img/story_dog2_portrait.jpg')"
    >
      Stories in AMP - Hello World
    </a>
  </amp-story-player>
</body>
```

### Specify embedded stories

The `<amp-story-player>` component contains one or more `<a>` tags. Point the href attribute of each to the story URL.

Place the story's title within the `<a>` tag. This provides a better user experience and allows search engines to crawl embedded stories.

## Attributes

### layout

Supports any of the size-defined layouts:

<ul>
  <li>fixed</li>
  <li>fixed-height</li>
  <li>responsive</li>
  <li>fill</li>
</ul>

## Validation

See [amp-story-player rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-story-player/validator-amp-story-player.protoascii) in the AMP validator specification.

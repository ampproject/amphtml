---
$category@: presentation
formats:
  - stories
teaser:
  text: A player for embedding and playing your favorite stories in your own AMP site.
---

# <a name="`amp-story-player`"></a> `amp-story-player`

## Usage

<figure class="centered-fig">
  <amp-anim alt="amp-story-player example" width="300" height="533" layout="fixed" src="https://github.com/ampproject/amphtml/raw/main/docs/spec/img/amp-story-player.gif">
    <noscript>
    <img alt="amp-story-player example" src="https://github.com/ampproject/amphtml/raw/main/docs/spec/img/amp-story-player.gif" />
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
    <a href="https://preview.amp.dev/documentation/examples/introduction/stories_in_amp/">
      <img src="https://amp.dev/static/samples/img/story_dog2_portrait.jpg" width="360" height="600" loading="lazy" data-amp-story-player-poster-img>
      Stories in AMP - Hello World
    </a>
  </amp-story-player>
</body>
```

[/example]

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

See [amp-story-player rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story-player/validator-amp-story-player.protoascii) in the AMP validator specification.

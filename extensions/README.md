# AMP HTML Extensions

AMP Extensions are either extended components or extended templates.


## AMP HTML Extended Components

Extended components must be explicitly included into the document as custom elements.

For example, to include a youtube video in your page
include the following script in the `<head>`:

```html
<script async custom-element="amp-youtube" src="https://cdn.ampproject.org/v0/amp-youtube-0.1.js"></script>
```

Current list of extended components:

| Component                                     | Description                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [`amp-anim`](amp-anim/amp-anim.md)                     | Runtime-managed animated image, most typically a GIF.                                       |
| [`amp-audio`](amp-audio/amp-audio.md)                      | Replacement for the HTML5 `audio` tag.                                                      |
| [`amp-carousel`](amp-carousel/amp-carousel.md)                | Generic carousel for displaying multiple similar pieces of content along a horizontal axis. |
| [`amp-fit-text`](amp-fit-text/amp-fit-text.md)                | Expand or shrink font size to fit the content within the space given.                       |
| [`amp-iframe`](amp-iframe/amp-iframe.md)                 | Displays an iframe.                                                                         |
| [`amp-image-lightbox`](amp-image-lightbox/amp-image-lightbox.md) | Allows for a “image lightbox” or similar experience.                                        |
| [`amp-instagram`](amp-instagram/amp-instagram.md)           | Displays an instagram embed.                                                                |
| [`amp-lightbox`](amp-lightbox/amp-lightbox.md)             | Allows for a “lightbox” or similar experience.                                              |
| [`amp-twitter`](amp-twitter/amp-twitter.md)               | Displays a Twitter Tweet.                                                                   |
| [`amp-youtube`](amp-youtube/amp-youtube.md)               | Displays a Youtube video.                                                                   |


## AMP HTML Extended Templates

NOT LAUNCHED YET

Extended templates must be explicitly included into the document as custom templates.

For example, to include a amp-mustache template in your page
include the following script in the `<head>`:

```html
<script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.1.js"></script>
```

Current list of extended templates:

| Component                                     | Description                                                                                 |
| --------------------------------------------- | -------------------------------------------------------------------------------------------
|
| [`amp-mustache`](amp-mustache/amp-mustache.md) | Mustache template.                                       |

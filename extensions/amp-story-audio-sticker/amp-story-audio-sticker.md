---
$category@: presentation
formats:
  - stories
teaser:
  text: A sticker for users to click and unmute the story. 
tags:
  - audio
  - sticker
author: ychsieh
$title: amp-story-audio-sticker
version: '0.1'
versions:
  - '0.1'
latest_version: '0.1'
$path: /documentation/components/amp-story-audio-sticker.html
$scripts:
  - >-
    <script async custom-element="amp-story" 
    src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
    <script async custom-element="amp-story-audio-sticker" src="https://cdn.ampproject.org/v0/amp-story-audio-sticker-0.1.js"></script>
---

# amp-story-audio-sticker

<amp-video autoplay loop
            width="400"
            height="750"
            layout="fill">

<source src="https://github-production-user-asset-6210df.s3.amazonaws.com/1697814/245924556-e953c54a-0a09-4f15-8134-be6a0ac758ab.mp4" type="video/mp4">
</amp-video>

# Summary

An audio sticker component for publishers to put anywhere on their story for users to click to unmute the story.

Developers can choose to either choose one of the 4 default stickers or provide custom stickers. The sticker should be put inside an `<amp-story-grid-layer>`.

# Attributes

### `size` {string} optional

Size of the sticker. Accepted values:

-   “large”: 180 x 180 px
-   “small”: 120 x 120 px

Default value: “small”, which would be used if the input value is invalid or is not provided.

### `sticker` {string} optional

Default value: “headphone-cat”, which would be used if the input value is invalid or is not provided.

A list of premade stickers to use:

| Accepted Value  | Pre-tap Image                                                                                   | Post-tap Image                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| “headphone-cat” | ![Cat Pre-tap](https://www.gstatic.com/amphtml/stamp/audio-sticker/cat-sticker-pretap.png)      | ![Cat Post-tap](https://www.gstatic.com/amphtml/stamp/audio-sticker/cat-sticker-posttap.gif)      |
| “tape-player”   | ![Player Pre-tap](https://www.gstatic.com/amphtml/stamp/audio-sticker/tape-player-pretap.png)   | ![Player Post-tap](https://www.gstatic.com/amphtml/stamp/audio-sticker/tape-player-posttap.gif)   |
| “loud-speaker”  | ![Speaker Pre-tap](https://www.gstatic.com/amphtml/stamp/audio-sticker/loud-speaker-pretap.png) | ![Speaker Post-tap](https://www.gstatic.com/amphtml/stamp/audio-sticker/loud-speaker-posttap.png) |
| “audio-cloud”   | ![Cloud Pre-tap](https://www.gstatic.com/amphtml/stamp/audio-sticker/audio-cloud-pretap.png)    | ![Cloud Post-tap](https://www.gstatic.com/amphtml/stamp/audio-sticker/audio-cloud-posttap.png)    |

### `sticker-style` {string} optional

Default value: none

Extra premade styles of the sticker to use:

| Accepted Value | Description                                                             | Header 3                                                                                              |
| -------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| “outline”      | Adds a border around the provided sticker image.                        | ![Image 2](https://github.com/ampproject/amphtml/assets/1697814/c7996424-c810-40d3-a28f-09e7c76742d1) |
| “dropshadow”   | Adds a dropshadow around the opaque part of the provided sticker image. | ![Image 4](https://github.com/ampproject/amphtml/assets/1697814/2f5b6c5d-ea86-4345-80b8-3b2c20c92e58) |

#### Customize Sticker Style via CSS Variables

-   `--story-audio-sticker-outline-color`: Color of the sticker outline.
-   `--story-audio-sticker-dropshadow-color`: Color of the sticker drop shadow.

If the CSS variables are set on story level, the color would be applied to all stickers in the story. If the CSS variables are set on story page or sticker level, it would only be applied to the sticker on specific story page or the specific sticker.

If not set, the color of either style would be white.

# Children Nodes

### `<amp-story-audio-sticker-pretap>` optional

Sticker shown before a user tap. Takes any html code that can be rendered as a sticker, e.g. `<amp-img>`, `<svg>`, general elements with CSS animation, etc.

### `<amp-story-audio-sticker-posttap>` optional

Sticker shown after a user tap. Takes any html code that can be rendered as a sticker, e.g. `<amp-img>`, `<svg>`, general elements with CSS animation, etc.

# Example: Premade Stickers

```html
<amp-story-grid-layer>
  <amp-story-audio-sticker size="large" sticker="tape-player"></amp-story-audio-sticker>
</amp-story-grid-layer>
```

# Example: Custom Stickers

```html
<amp-story-grid-layer>
  <amp-story-audio-sticker size="large" sticker-style="dropshadow">
    <amp-story-audio-sticker-pretap>
      <amp-img width="100" height="100" layout="responsive" src="https://d1k5j68ob7clqb.cloudfront.net/thumb/480/processed/thumb/5zK5d91jK0gLkv1AMa.png"></amp-img>
    </amp-story-audio-sticker-pretap>
    <amp-story-audio-sticker-posttap>
      <amp-img width="100" height="100" layout="responsive" src="https://d1k5j68ob7clqb.cloudfront.net/thumb/480/processed/thumb/5zK5d91jK0gLkv1AMa.png"></amp-img>
    </amp-story-audio-sticker-posttap>
  </amp-story-audio-sticker>
</amp-story-grid-layer>
```

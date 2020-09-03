---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Megaphone.fm podcast episode or playlist.
---

<!---
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

# amp-megaphone

## Usage

Use `amp-megaphone` to display a [Megaphone.fm](https://megaphone.fm/) podcast episode or playlist.

With the fixed height layout, the element will expand to fill the width of the page while keeping the `height` constant:

Light Mode:

```html
<amp-megaphone
  height="166"
  layout="fixed-height"
  data-episode="OSC7749686951"
  data-light
></amp-megaphone>
```

Dark Mode:

```html
<amp-megaphone
  height="166"
  layout="fixed-height"
  data-episode="OSC7749686951"
  data-light
></amp-megaphone>
```

## Attributes

### data-episode

This attribute is required if `data-playlist` is not defined. The value for this attribute is the Megaphone.fm ID of a track, an integer.

### data-playlist

This attribute is required if <code>data-episode</code> is not defined.
The value for this attribute is the Megaphone.fm ID of a playlist.

### data-start (optional

For episode embeds only. The time at which to start the episode in seconds.

### data-episodes (optional)

For episode embeds only. Limits the number of episodes to display.

### data-tile (optional)

For episode embeds only. If present, displays the player in a "tile" mode where the internal components are layed out vertically.

### data-light (optional)

If present, this will switch the player theme to the "light" scheme as opposed to the default dark version.

### data-sharing (optional)

If present, this will enable the social sharing button on the embedded player. The default value is to disable the button.

### width and height

The layout for `amp-megaphone` is set to `fixed-height` and it fills all of the available horizontal space. This is ideal for the "classic" mode, but for "tile" mode, it's recommended that the height is 455px, and the width is 275px, as per the Megaphone embed code.

## Validation

See [amp-megaphone rules](validator-amp-megaphone.protoascii) in the AMP validator specification.

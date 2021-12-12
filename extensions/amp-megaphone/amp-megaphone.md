---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Megaphone.fm podcast episode or playlist.
---

# amp-megaphone

## Examples

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

<table>
  <tr>
    <td width="40%"><strong>data-episode</strong></td>
    <td>This attribute is required if <code>data-playlist</code> is not defined.<br />
The value for this attribute is the Megaphone.fm ID of a track, an integer.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlist</strong></td>
    <td>This attribute is required if <code>data-episode</code> is not defined.
The value for this attribute is the Megaphone.fm ID of a playlist.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-start (optional)</strong></td>
    <td>(for episodes only) The time at which to start the episode in seconds.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-episodes (optional)</strong></td>
    <td>(for playlists only) Limits the number of episodes to display.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-tile (optional)</strong></td>
    <td>(for episodes only) If present, displays the player in a "tile" mode where the internal components are layed out vertically.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-light (optional)</strong></td>
    <td>If present, this will switch the player theme to the "light" scheme as opposed to the default dark version.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-sharing (optional)</strong></td>
    <td>If present, this will enable the social sharing button on the embedded player. The default value is to disable the button.</td>
  </tr>
  <tr>
    <td width="40%"><strong>width and height</strong></td>
    <td>The layout for <code>amp-megaphone</code> is set to <code>fixed-height</code> and it fills all of the available horizontal space. This is ideal for the "classic" mode, but for "tile" mode, it's recommended that the height is 455px, and the width is 275px, as per the Megaphone embed code.</td>
  </tr>
</table>

## Validation

See [amp-megaphone rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-megaphone/validator-amp-megaphone.protoascii) in the AMP validator specification.

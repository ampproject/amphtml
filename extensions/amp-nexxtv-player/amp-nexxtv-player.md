---
$category@: media
formats:
  - websites
teaser:
  text: Displays a media stream from the nexxOMNIA platform.
---

# amp-nexxtv-player

## Example

With the responsive layout, the width and height from the example should yield correct layouts for 16:9 aspect ratio videos:

```html
<amp-nexxtv-player
  data-mediaid="71QQG852413DU7J"
  data-client="761"
  data-streamtype="video"
  data-mode="static"
  data-disable-ads="1"
  data-streaming-filter="nxp-bitrate-2500"
  layout="responsive"
  width="480"
  height="270"
></amp-nexxtv-player>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-mediaid (required)</strong></td>
    <td>Represents the ID of the media you want to play.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-client OR data-domain-id(required)</strong></td>
    <td>Your domain ID.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-streamtype (optional)</strong></td>
    <td><p>Indicates the media streaming type, which can be one of the following:</p>
  <ul>
    <li>`video` (default)</li>
    <li>`audio`</li>
    <li>`playlist`</li>
    <li>`audioalbum`: An audio playlist</li>
    <li>`live`</li>
    <li>`radio`</li>
    <li>`set`</li>
    <li>`collection`: collection of media items</li>
  </ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-mode (optional)</strong></td>
    <td>Indicates the data mode, which can be <code>static</code> (default) or <code>api</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-disable-ads (optional)</strong></td>
    <td>Ads are enabled by default. Set value to 1 to disable.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-streaming-filter (optional)</strong></td>
    <td>Set streaming filter e.g. "nxp-bitrate-0750" for max 750kbit max bitrate.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-exit-mode (optional)</strong></td>
    <td><p>Defines player exit screen</p>
  <ul>
    <li>`replay`</li>
    <li>`loop`</li>
    <li>`load`</li>
  </ul></td>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-nexxtv-player rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-nexxtv-player/validator-amp-nexxtv-player.protoascii) in the AMP validator specification.

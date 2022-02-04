---
$category@: media
formats:
  - websites
teaser:
  text: Displays an Izlesene video.
---

# amp-izlesene

## Example

With responsive layout the width and height from the example should yield correct layouts for 16:9 aspect ratio videos:

```html
<amp-izlesene
  data-videoid="7221390"
  layout="responsive"
  width="480"
  height="270"
></amp-izlesene>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-videoid (required)</strong></td>
    <td>The ID of the Izlesene video, which can be found in the Izlesene video page URL. For example, in https://www.izlesene.com/video/yayin-yok/7221390, the video ID is <code>7221390</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-showrel (optional)</strong></td>
    <td>This is an optional attribute that indicates whether to show related content. This functionality is not available for iOS devices.</p>
<ul>
  <li>Accepted values: `1` or `0`</li>
  <li>Default value: `1`</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-showreplay (optional)</strong></td>
    <td>This is an optional attribute that indicates whether to show the replay button at the end of the content.</p>
<ul>
  <li>Accepted values: `1` or `0`</li>
  <li>Default value: `1`</li>
</ul></td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-izlesene rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-izlesene/validator-amp-izlesene.protoascii) in the AMP validator specification.

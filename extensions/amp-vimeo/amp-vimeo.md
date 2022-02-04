---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Vimeo video.
---

# amp-vimeo

## Example

With responsive layout, the width and height from the example should yield correct layouts for 16:9 aspect ratio videos:

```html
<amp-vimeo
  data-videoid="27246366"
  layout="responsive"
  width="500"
  height="281"
></amp-vimeo>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-videoid (required)</strong></td>
    <td>The Vimeo video id found in every Vimeo video page URL For example, <code>27246366</code> is the video id for the following url: <code>https://vimeo.com/27246366</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>autoplay</strong></td>
    <td>If this attribute is present, and the browser supports autoplay, the video will be automatically
played as soon as it becomes visible. There are some conditions that the component needs to meet
to be played, <a href="https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-video-interface.md#autoplay">which are outlined in the Video in AMP spec</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>do-not-track</strong></td>
    <td>If this attribute is present the player will be blocked from tracking any session data, including all cookies and
    <a href="https://vimeo.com/stats">stats</a>. (It has the same effect as enabling a Do Not Track setting in your browser).
    See the 'dnt' parameter in the <a href="https://developer.vimeo.com/api/oembed/videos">Vimeo oEmbed Documentation</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-vimeo rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-vimeo/validator-amp-vimeo.protoascii) in the AMP validator specification.

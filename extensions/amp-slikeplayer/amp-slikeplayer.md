---
$category@: presentation
formats:
  - websites
teaser:
  text: Displays a cloud-hosted Slike Player.
---

# amp-slikeplayer

## Example

The `width` and `height` attributes determine the aspect ratio of the player embedded in responsive layouts.

Example:

```html
<amp-slikeplayer required-attribute>
  data-apikey="33502051"
  data-videoid="1281471"
  layout="responsive"
  height: 180
  width: 320
>
</amp-slikeplayer>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-apikey</strong></td>
    <td>The Slike apikey id. This attribute is mandatory.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-videoid</strong></td>
    <td>The Slike video content id - videoid. This attribute is mandatory</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-config</strong></td>
    <td>It is the player configuration passed as string and enentually capturen as query parameter. Few examples autoplay=true, skipad=true etc</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-iframe-src</strong></td>
    <td>The iframe source can be overriden by users own source. The default template is binded the component</td>
  </tr> 
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-slikeplayer rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-slikeplayer/validator-amp-slikeplayer.protoascii) in the AMP validator specification.

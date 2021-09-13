---
$category@: social
formats:
  - websites
teaser:
  text: Displays an Instagram embed.
---

# amp-instagram

## Behavior

The `width` and `height` attributes are special for the Instagram embed.
These should be the actual width and height of the Instagram image.
The system automatically adds space for the "chrome" that Instagram adds around the image.

Many Instagrams are square. When you set `layout="responsive"` any value where `width` and `height` are the same will work.

Example:

```html
<amp-instagram
  data-shortcode="fBwFP"
  data-captioned
  width="400"
  height="400"
  layout="responsive"
>
</amp-instagram>
```

If the Instagram is not square you will need to enter the actual dimensions of the image.

When using non-responsive layout you will need to account for the extra space added for the "instagram chrome" around the image. This is currently 48px above and below the image and 8px on the sides.

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-shortcode</strong></td>
    <td>The instagram data-shortcode is found in every instagram photo URL.
<br>
For example, in https://instagram.com/p/fBwFP, <code>fBwFP</code> is the data-shortcode.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-captioned</strong></td>
    <td>Include the Instagram caption. <code>amp-instagram</code> will attempt to resize to the correct height including the caption.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-instagram rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-instagram/validator-amp-instagram.protoascii) in the AMP validator specification.

---
$category@: social
formats:
  - websites
teaser:
  text: Displays an Instagram embed.
experimental: true
bento: true
---

# bento-instagram

## Behavior

The `width` and `height` attributes are special for the Instagram embed.
These should be the actual width and height of the Instagram image.
The system automatically adds space for the "chrome" that Instagram adds around the image.

Many Instagrams are square. When you set `layout="responsive"` any value where `width` and `height` are the same will work.

Example:

```html
<bento-instagram
  data-shortcode="fBwFP"
  data-captioned
  width="400"
  height="400"
  layout="responsive"
>
</bento-instagram>
```

If the Instagram is not square you will need to enter the actual dimensions of the image.

When using non-responsive layout you will need to account for the extra space added for the "instagram chrome" around the image. This is currently 48px above and below the image and 8px on the sides.

### Standalone use outside valid AMP documents

Bento allows you to use AMP components in non-AMP pages without needing
to commit to fully valid AMP. You can take these components and place them
in implementations with frameworks and CMSs that don't support AMP. Read
more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

To find the standalone version of `bento-instagram`, see [**`bento-instagram`**](./1.0/README.md).

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
    <td>Include the Instagram caption. <code>bento-instagram</code> will attempt to resize to the correct height including the caption.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

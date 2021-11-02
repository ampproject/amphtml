---
$category@: social
formats:
  - websites
teaser:
  text: Displays a Gfycat video GIF.
---

# amp-gfycat

## Example

The `width` and `height` attributes determine the aspect ratio of the Gfycat embedded in responsive layouts.

```html
<amp-gfycat
  data-gfyid="TautWhoppingCougar"
  width="640"
  height="360"
  layout="responsive"
>
</amp-gfycat>
```

# Attributes

### `data-gfyid`

The Gfycat ID found in any Gfycat url. For example, `TautWhoppingCougar` is the
id in the following url: `https://gfycat.com/TautWhoppingCougar`.

### `width` and `height`

The `width` and `height` attributes are special for the Gfycat embed. These
should be the actual width and height of the Gfycat. The system automatically
adds space for the "chrome" that Gfycat adds around the GIF.

Gfycat allows many aspect ratios.

To specify the width and height in the code, copy it from the embed URL:

1.  Go to [https://gfycat.com/](https://gfycat.com/)`name`, where `name` is the
    Gfycat ID.
2.  Click the embed link icon (`</>`).
3.  Copy the width and height specified in the "Fixed iFRAME" field.

```html
<iframe
  src="https://gfycat.com/ifr/TautWhoppingCougar"
  frameborder="0"
  scrolling="no"
  width="640"
  height="360"
  allowfullscreen
>
</iframe>
```

### `noautoplay`

By default, a video autoplays.

-   when the video is scrolled out of view, the video is paused
-   when the video is scrolled into view, the video resumes playback
-   if the user has interacted with the video (e.g., pauses/resumes), and the
    video is scrolled in or out of view, the state of the video remains as how
    the user left it. For example, if the user pauses the video, then scrolls
    the video out of view and returns to the video, the video is still paused.

You can turn off autoplay by setting the `noautoplay` attribute.

```html
<amp-gfycat data-gfyid="TautWhoppingCougar" width="640" height="360" noautoplay>
</amp-gfycat>
```

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Validation

See [amp-gfycat rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-gfycat/validator-amp-gfycat.protoascii) in the AMP validator specification.

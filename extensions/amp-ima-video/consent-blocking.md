# User consent

The `amp-ima-video` extension has built in compatibility with the
`<amp-consent>` component. You can set up a consent dialog by following
instructions in [the amp-consent readme](https://github.com/ampproject/amphtml/blob/main/extensions/amp-consent/amp-consent.md).

## Blocking based on user consent

After setting up your consent dialog, add the `data-block-on-consent` parameter to
your `<amp-ima-video>` component, like so:

```html
<amp-ima-video
  width="640"
  height="360"
  layout="responsive"
  data-tag="ads.xml"
  data-poster="poster.png"
  data-block-on-consent
>
  <source src="foo.mp4" type="video/mp4" />
  <source src="foo.webm" type="video/webm" />
  <track
    label="English subtitles"
    kind="subtitles"
    srclang="en"
    src="subtitles.vtt"
  />
  <script type="application/json">
    {
      "locale": "en",
      "numRedirects": 4
    }
  </script>
</amp-ima-video>
```

This will prevent the video player from loading until the user consent state is
known.

## Consent state effect

Each potential consent state will result in different behavior by the extension.

| Consent state                          | `amp-ima-video` behavior                                                                                                                                             |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UNKNOWN_NOT_REQUIRED` or `SUFFICIENT` | Request ads as normal.                                                                                                                                               |
| `INSUFFICIENT`                         | Request ads with "&npa=1" appended to the ad tag. For more info, see [Personalized and non-personalized ads](https://support.google.com/dfp_premium/answer/9005435). |
| `UNKNOWN`                              | Do not initialize the IMA SDK or request ads - only play the content video.                                                                                          |

---
$category@: media
formats:
  - websites
teaser:
  text: Embeds a video player for instream video ads that are integrated with the IMA SDK.
---

# amp-ima-video

## Usage

Use the `amp-ima-video` component to embed an [IMA SDK](https://developers.google.com/interactive-media-ads/docs/sdks/html5/) enabled video player.

The component requires an ad tag, provided in `data-tag`, which is a URL to a
VAST-compliant ad response (for examples, see
[IMA Sample Tags](https://developers.google.com/interactive-media-ads/docs/sdks/html5/tags)).

The component HTML accepts the following types of HTML nodes as children:

-   `source` tags for content video, used in the same way as the standard `video` tag.
-   `track` tags for subtitles, in the same way as the standard `video` tag. If the track is hosted on a different origin than the document, you must add the `data-crossorigin` attribute to the `<amp-ima-video>` tag.
-   a `script` tag of type `application/json` used to provide [ImaSdkSettings](https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/reference/js/ima.ImaSdkSettings). Provide the property-translation of the setters in the linked documentation (e.g. to call `setNumRedirects(4)`, provide `{"numRedirects": 4}`).

```html
<amp-ima-video
  width="640"
  height="360"
  layout="responsive"
  data-tag="ads.xml"
  data-poster="poster.png"
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

## Attributes

### data-tag (required)

The URL for your VAST ad document. A relative URL or a URL that uses https protocol.

### data-src

The URL of your video content. A relative URL or a URL that uses https protocol. This attribute is required if no `<source>` children are present.

### data-crossorigin

Required if a `track` resource is hosted on a different origin than the document.

### data-poster (optional)

An image for the frame to be displayed before video playback has started. By
default, the first frame is displayed.

### data-delay-ad-request (optional)

If true, delay the ad request until either the user scrolls the page, or for 3 seconds, whichever occurs first. Defaults to false.

### data-ad-label (optional)

A format string that looks like "Ad (%s of %s)", used to generate the ad disclosure when an ad is playing. The "%s" in the format string is replaced with the current ad number in the sequence and the total number of ads, respectively (e.g. Ad 2 of 3). This allows users to support ad disclosures in different languages. If no value is given, this defaults to "Ad (%s of %s)".

### dock

Requires `amp-video-docking` extension. If this attribute is present and the video is playing manually, the video will be "minimized" and fixed to a corner or an element when the user scrolls out of the video component's visual area.
For more details, see [documentation on the docking extension itself](https://amp.dev/documentation/components/amp-video-docking).

### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"IMA video"`.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) extended to AMP components.

## Validation

See [amp-ima-video rules](validator-amp-ima-video.protoascii) in the AMP validator specification.

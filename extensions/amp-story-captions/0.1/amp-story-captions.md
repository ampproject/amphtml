---
$category@: presentation
formats:
  - stories
teaser:
  text: Custom video captions rendering.
---

# amp-story-captions

The `amp-story-captions` component allows custom video [captions](https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery/Adding_captions_and_subtitles_to_HTML5_video) rendering.

## Usage

The `captions-id` value on [`amp-video`](https://amp.dev/documentation/components/amp-video/) connects the two components. This must be the same value as the `id` on the `amp-story-captions` component.

```html
<amp-story-grid-layer>
  <amp-video captions-id="captions" src="...">
    <track src="..."></track>
  </amp-video>
</amp-story-grid-layer>
<amp-story-grid-layer>
  <div>This text appears above the captions</div>
  <amp-story-captions id="captions" layout="fixed-height" height="300"></amp-story-captions>
  <div>This text appears below captions</div>
</amp-story-grid-layer>
```

### Layout

`container` layout in this component is different than other components because the HTML tree does not determine its size. Instead, the text height of the dynamically loaded captions determine the size. Thus it may cause CLS if the caption content changes while playing the video or audio.

### Styling

The position of the captions is controlled by the position of the `amp-story-captions` element. Properties like `font-size` and `line-height` can be specified using CSS on `amp-story-captions` itself.

To allow more granular control, we expose `amp-story-captions-future` to control the style of future parts of the cue for karaoke-style captions.

```html
amp-story-captions {
  color: white;
  font-size: 24px;
  padding: 16px;
}

// Words not spoken yet shown in gray.
.amp-story-captions-future {
  color: gray;
}
```

### Style presets

The optional `style-preset` attribute applies pre made styles to `amp-story-captions`. The accepted values are `default` and `appear`.

Style presets are not affected by custom CSS. Some customizable options are provided by defining CSS variables on the `amp-story-captions` element.

#### Default

The `default` preset renders the captions to match the Web Stories system UI.

<amp-img src="https://user-images.githubusercontent.com/3860311/165548375-bc08a45a-e028-4f77-a46f-8c9811591529.png" layout="intrinsic" width="300" height="497">

Example:

```html
<amp-story-grid-layer>
  <amp-video captions-id="captions" src="...">
    <track src="..."></track>
  </amp-video>
</amp-story-grid-layer>
<amp-story-grid-layer>
  <amp-story-captions
    id="captions"
    style-preset="default"
    layout="fixed-height"
    height="300">
  </amp-story-captions>
</amp-story-grid-layer>
```

#### Appear

The `appear` preset fades in text based on its [timestamp](https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API#cue_timings).

<amp-img src="https://user-images.githubusercontent.com/3860311/165548414-4e0b0506-c980-4971-9b6f-a514baf24e79.png" layout="intrinsic" width="300" height="507">

`font-size` and `font-family` can optionally be customized in this preset by defining `--story-captions-font-size` and `--story-captions-font-family` CSS variables within the `style` attribute of the `amp-story-captions` component.

Example:

```html
...
<!-- imported font in head of document -->
<link href="https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap" rel="stylesheet">
...
<amp-story-grid-layer>
  <amp-video captions-id="captions" src="...">
    <track src="..."></track>
  </amp-video>
</amp-story-grid-layer>
<amp-story-grid-layer>
  <amp-story-captions
    id="captions"
    style=preset="appear"
    style="--story-captions-font-size: .8em; --story-captions-font-family: 'Shadows Into Light'"
    layout="fixed-height"
    height="300">
  </amp-story-captions>
</amp-story-grid-layer>
```

## Validation

See validation rules in [amp-story-captions validator](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story-captions/validator-amp-story-captions.protoascii).

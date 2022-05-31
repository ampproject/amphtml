# amp-story-captions

The `amp-story-captions` component allows custom video or audio [caption](https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery/Adding_captions_and_subtitles_to_HTML5_video) rendering. See https://github.com/ampproject/amphtml/issues/34016 for the design.

Note that `container` layout in this component is different to all other components because the HTML tree does not determine the size. Instead, the text height of the dynamically loaded captions determine the size. Thus it may cause CLS issue if the caption content changes while playing the video or audio.

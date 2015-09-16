### <a name=”amp-video”></a> `amp-video`

A replacement for the HTML5 `video` tag. Like all embedded external resources in a AMP file, the video is lazily loaded only when the `amp-video` element is in or near the viewport.

The `amp-video` component is only to be used for direct HTML5 video file embeds.

#### Behavior

The `amp-video` component loads the video resource specified by its `src` attribute lazily, at a time determined by the runtime. It can be controlled much the same way as a standard HTML5 `video` tag.

The `amp-video` component HTML accepts up to three unique types of HTML nodes as children - `source` tags, a placeholder for before the video starts, and a fallback if the browser doesn’t support HTML5 video.

`source` tag children can be used in the same way as the standard `video` tag, to specify different source files to play.

One or zero immediate child nodes can have the `placeholder` attribute. If present, this node and its children form a placeholder that will display instead of the video. A click or tap anywhere inside of the `amp-video` container will replace the placeholder with the video itself.

One or zero immediate child nodes can have the `fallback` attribute. If present, this node and its children form the content that will be displayed if HTML5 video is not supported on the user’s browser.

For example:

    <amp-video width=400 height=300 src=”https://yourhost.com/videos/myvideo.mp4”>
      <amp-img placeholder width=400 height=300 src=”myvideo-poster.jpg”></amp-img>
      <div fallback>
        <p>Your browser doesn’t support HTML5 video</p>
      </div>
      <source type="video/mp4" src="foo.mp4">
      <source type="video/webm" src="foo.webm">
    </amp-video>

#### Attributes

**autoplay**

The `autoplay` attribute allows the author to specify when - if ever - the animated image will autoplay.

The presence of the attribute alone implies that the animated image will always autoplay. The author may specify values to limit when the animations will autoplay. Allowable values are `desktop`, `tablet`, or `mobile`, with multiple values separated by a space. The runtime makes a best-guess approximation to the device type to apply this value.

**controls**

Similar to the `video` tag `controls` attribute - if present, the browser offers controls to allow the user to control video playback.

**loop**

If present, will automatically loop the video back to the start upon reaching the end.

**muted**

If present, will mute the audio by default.

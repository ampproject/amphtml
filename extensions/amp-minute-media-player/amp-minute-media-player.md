---
$category: media
formats:
  - websites

teaser:
  text: Displays a Minute Media player.
---

# amp-minute-media-player

## Example

Example with RESPONSIVE layout - width and height attributes determine the aspect ratio of the player embedded.

```html
<amp-minute-media-player
  data-content-type="curated"
  data-content-id="fSkmeWKF"
  width="500"
  height="334"
  layout="responsive"
  autoplay
>
</amp-minute-media-player>
```

Example with FIXED layout - fixed width and height.

```html
  <amp-minute-media-player
    data-content-type="semantic"
    data-scanned-element-type="tag"
    data-scanned-element="post-body"
    layout="fixed" width="500" height="334"
  </amp-minute-media-player>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-content-type</strong></td>
    <td><p>The Minute Media player type.</p>
    <p>The options are <strong>'specific'</strong> or <strong>'semantic'</strong> .</p>
    <p>Choose <strong>'specific'</strong> in order to play specific content (insert the content id in the data-content-id attribute).</p>
    <p>By choosing <strong>'semantic'</strong> the playlist will be automatically created and match the content of the article to the most relevant video in real time.</p></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-content-id</strong></td>
    <td><p>The Minute Media player id.</p>
    <p>This data is <strong>required only if you choose playing specific content</strong>  (in the data-content-type).</p></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-scanned-element-type</strong></td>
    <td><p>Choose the defining characteristic (class-name, tag-name or id) when pairing content with the video.</p>
    <p>This data is reflected only if you choose playing semantic content (in the data-content-type).</p></td>
  </tr>
  <tr>
      <td width="40%"><strong>data-scanned-element</strong></td>
      <td><p>Choose the specific element accoring to the choosen scanned element type to be considered when pairing content with the video.</p>
      <p>This data is reflected only if you choose playing semantic content (in the data-content-type).</p></td>
    </tr>
  <tr>
    <td width="40%"><strong>data-tags</strong></td>
    <td><p>Tags that taken into consideration when the decision which video content to play is made (in 'semantic' content type).</p>
    <p>This data is reflected only if you choose playing 'semantic' content (in the data-content-type).</p></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-minimum-date-factor</strong></td>
    <td><p>This data reflects the last number of days the engine should take into consideration when searching for a matching video. Older videos will receive a lower score</p>
    <p>This data is reflected only if you choose playing 'semantic' content (in the data-content-type).</p></td>
  </tr>
  <tr>
      <td width="40%"><strong>data-scoped-keywords</strong></td>
      <td><p>This data is responsible to return only videos with the specified tags in the matching results.</p>
      <p>This data is reflected only if you choose playing 'semantic' content (in the data-content-type).</p></td>
    </tr>
  <tr>
    <td width="40%"><strong>autoplay</strong></td>
    <td><p>If this attribute is present, and the browser supports autoplay:</p>
    <ul>
       <li>the video is automatically muted before autoplay starts</li>
       <li>when the video is scrolled out of view, the video is paused</li>
       <li>when the video is scrolled into view, the video resumes playback</li>
       <li>when the user taps the video, the video is unmuted</li>
       <li>if the user has interacted with the video (e.g., mutes/unmutes, pauses/resumes, etc.), and the video is scrolled in or out of view, the state of the video remains as how the user left it. For example, if the user pauses the video, then scrolls the video out of view and returns to the video, the video is still paused..</li>
    </ul></p></td>
  </tr>
  <tr>
    <td width="40%"><strong>dock</strong></td>
    <td><p>If this attribute is present and the video is playing manually, the video will be "minimized" and fixed to a corner when the user scrolls out of the video component's visual area.</p>
    <ul>
       <li>The video can be dragged and repositioned by the user on a different corner.</li>
       <li>Multiple videos on the same page can be docked.</li>
     </ul>
     In order to use this attribute, the amp-video-docking extension script must be present:
     <code>&lt;script async custom-element="amp-video-docking" src="https://cdn.ampproject.org/v0/amp-video-docking-0.1.js"&gt;&lt;/script&gt;</code>
</p>
    </td>
  </tr>

</table>

## Validation

See [amp-minute-media-player rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-minute-media-player/validator-amp-minute-media-player.protoascii) in the AMP validator specification.

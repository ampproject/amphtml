---
$category@: presentation
formats:
  - stories
teaser:
  text: A panel of content that opens inline with an AMP story page.
toc: true
$title: amp-story-page-attachment
version: '0.1'
versions:
  - '0.1'
latest_version: '0.1'
is_current: true
$path: /documentation/components/amp-story-page-attachment.html
$localization:
  path: '/{locale}/documentation/components/amp-story-page-attachment.html'
layouts:
  - nodisplay  
---

# amp-story-page-attachment

## Usage

`amp-story-page-attachment` allows additional content in the form of inline AMPHTML content on specific AMP story pages. This content is revealed to users through a "swipe up" gesture, or a tap on the call to action element.
A UI button prompting the viewer to open the attachment will appear at the bottom of every page with a `amp-story-page-attachment` element.

<amp-img alt="AMP Story page attachment" layout="fixed" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-page-attachment.gif" width="240" height="480">
  <noscript>
    <img alt="AMP Story page attachment" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-page-attachment.gif" />
  </noscript>
</amp-img>

```html
<amp-story-page id="page-attachment-example">
  <amp-story-grid-layer template="fill">
    <amp-img src="https://example.ampproject.org/helloworld/bg1.jpg" width="900" height="1600">
  </amp-story-grid-layer>
  <amp-story-page-attachment layout="nodisplay">
    <h1>My title</h1>
    <p>Lots of interesting text with <a href="https://example.ampproject.org">links</a>!</p>
    <p>More text and a YouTube video!</p>
    <amp-youtube
        data-videoid="b4Vhdr8jtx0"
        layout="responsive"
        width="480" height="270">
    </amp-youtube>
    <p>And a tweet!</p>
    <amp-twitter
        data-tweetid="885634330868850689"
        layout="responsive"
        width="480" height="270">
    </amp-twitter>
  </amp-story-page-attachment>
</amp-story-page>
```

## Placement

The `<amp-story-page-attachment>` element must be the last child of `<amp-story-page>`, and must have the `layout="nodisplay"` attribute. The attachment AMPHTML content is expected to be provided inline in your AMP Story, within this `<amp-story-page-attachment>` tag.

[tip type="important"]
Both [`amp-story-page-attachment`](amp-story-page-attachment.md) and [`amp-story-page-outlink`](amp-story-page-outlink.md) must be the last child tag of an [`amp-story-page`](https://amp.dev/documentation/components/amp-story-page?format=stories). Because of this, you may include neither or one, but not both.
[/tip]

## Attributes

When no attributes are set, the default UI will render:

![amp-story-page-attachment-default](https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-page-attachment-default.jpg)

```html
<amp-story-page-attachment
  layout="nodisplay">
   ...
</amp-story-page-attachment>
```

### `theme` (optional)

String representing the color theme, default is `light`. Accepts values `light` & `dark`.

![amp-story-page-attachment-dark-theme](https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-page-attachment-dark-theme.jpg)

```html
<amp-story-page-attachment
  layout="nodisplay"
  theme="dark">
  ...
</amp-story-page-attachment>
```

### `cta-text` (optional)

String that customizes the button text. The default is "Swipe up".

![amp-story-page-attachment-cta-text](https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-page-attachment-cta-text.jpg)

```html
<amp-story-page-attachment
  layout="nodisplay"
  cta-text="Explore Tasting Menu">
   ...
</amp-story-page-attachment>
```

### `cta-image` (optional)

String representing a URL pointing to an image. Optimize performance and avoid distortion by using a 48x48px image.

![amp-story-page-attachment-1-image](https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-page-attachment-1-image.jpg)

```html
<amp-story-page-attachment
  layout="nodisplay"
  cta-image="images/48x48image.jpg">
   ...
</amp-story-page-attachment>
```

### `cta-image-2` (optional)

String representing a URL pointing to an image. Two images will display when `cta-image` and `cta-image-2` are defined. Optimize performance and avoid distortion by using a 48x48px image.

![amp-story-page-attachment-2-images](https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-page-attachment-2-images.jpg)

```html
<amp-story-page-attachment
  layout="nodisplay"
  cta-image="images/48x48image.jpg"
  cta-image-2="images/48x48image2.jpg">
   ...
</amp-story-page-attachment>
```

### `title` (optional)

String that displays in the attachment's header when scrolling beyond the height of the viewport.

```html
<amp-story-page-attachment
  layout="nodisplay"
  title="My title"
  >
  ...
</amp-story-page-attachment>
```

[tip type="note"]
`amp-story-page-attachment` previously supported outlinking. Please use `amp-story-page-outlink` for one-tap outlinking UI.
[/tip]

### Supported AMP Components in a Page Attachment

The attachment AMPHTML content is expected to be provided inline in your AMP Story, within this `<amp-story-page-attachment>` tag.

Story page attachments allow the same HTML elements as AMP Story along with additional components listed below, such as third party video players or social media embeds. This means you can add additional content that is too verbose or disallowed in an AMP Story page.

List of allowed AMP components in a page attachment:

<ul>
  <li><code>&lt;amp-3d-gltf></code></li>
  <li><code>&lt;amp-3q-player></code></li>
  <li><code>&lt;amp-accordion></code></li>
  <li><code>&lt;amp-audio></code></li>
  <li><code>&lt;amp-beopinion></code></li>
  <li><code>&lt;amp-bodymovin-animation></code></li>
  <li><code>&lt;amp-brid-player></code></li>
  <li><code>&lt;amp-brightcove></code></li>
  <li><code>&lt;amp-byside-content></code></li>
  <li><code>&lt;amp-call-tracking></code></li>
  <li><code>&lt;amp-carousel></code></li>
  <li><code>&lt;amp-dailymotion></code></li>
  <li><code>&lt;amp-date-countdown></code></li>
  <li><code>&lt;amp-embedly-card></code></li>
  <li><code>&lt;amp-facebook></code></li>
  <li><code>&lt;amp-facebook-comments></code></li>
  <li><code>&lt;amp-facebook-like></code></li>
  <li><code>&lt;amp-facebook-page></code></li>
  <li><code>&lt;amp-fit-text></code></li>
  <li><code>&lt;amp-fx-collection></code></li>
  <li><code>&lt;amp-fx-flying-carpet></code></li>
  <li><code>&lt;amp-gfycat></code></li>
  <li><code>&lt;amp-gfycat></code></li>
  <li><code>&lt;amp-gist></code></li>
  <li><code>&lt;amp-gist></code></li>
  <li><code>&lt;amp-google-document-embed></code></li>
  <li><code>&lt;amp-hulu></code></li>
  <li><code>&lt;amp-ima-video></code></li>
  <li><code>&lt;amp-image-slider></code></li>
  <li><code>&lt;amp-img></code></li>
  <li><code>&lt;amp-imgur></code></li>
  <li><code>&lt;amp-instagram></code></li>
  <li><code>&lt;amp-izlesene></code></li>
  <li><code>&lt;amp-jwplayer></code></li>
  <li><code>&lt;amp-kaltura-player></code></li>
  <li><code>&lt;amp-list></code></li>
  <li><code>&lt;amp-live-list></code></li>
  <li><code>&lt;amp-mathml></code></li>
  <li><code>&lt;amp-megaphone></code></li>
  <li><code>&lt;amp-mowplayer></code></li>
  <li><code>&lt;amp-nexxtv-player></code></li>
  <li><code>&lt;amp-o2-player></code></li>
  <li><code>&lt;amp-ooyala-player></code></li>
  <li><code>&lt;amp-pan-zoom></code></li>
  <li><code>&lt;amp-pinterest></code></li>
  <li><code>&lt;amp-playbuzz></code></li>
  <li><code>&lt;amp-powr-player></code></li>
  <li><code>&lt;amp-reach-player></code></li>
  <li><code>&lt;amp-reddit></code></li>
  <li><code>&lt;amp-riddle-quiz></code></li>
  <li><code>&lt;amp-soundcloud></code></li>
  <li><code>&lt;amp-springboard-player></code></li>
  <li><code>&lt;amp-timeago></code></li>
  <li><code>&lt;amp-twitter></code></li>
  <li><code>&lt;amp-video></code></li>
  <li><code>&lt;amp-video-iframe></code></li>
  <li><code>&lt;amp-vimeo></code></li>
  <li><code>&lt;amp-vine></code></li>
  <li><code>&lt;amp-viqeo-player></code></li>
  <li><code>&lt;amp-vk></code></li>
  <li><code>&lt;amp-wistia-player></code></li>
  <li><code>&lt;amp-yotpo></code></li>
  <li><code>&lt;amp-youtube></code></li>
</ul>

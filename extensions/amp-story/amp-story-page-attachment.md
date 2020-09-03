---
$category@: presentation
formats:
  - stories
teaser:
  text: An additional pane of content that can be associated with a single page of an AMP story.
---

<!--
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# amp-story-page-attachment

## Usage

Story page attachments allow you to provide additional content in the form of a link or inline AMPHTML content to specific pages. This content can be revealed by users through a "swipe up" gesture, or a tap on the call to action element.
A UI prompt to open the attachment will automatically be added at the bottom of every page that configured an attachment.

<amp-img alt="AMP Story page attachment" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/amp-story-page-attachment.gif" width="240" height="480">
  <noscript>
    <img alt="AMP Story page attachment" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/amp-story-page-attachment.gif" />
  </noscript>
</amp-img>

```html
<amp-story-page id="foo">
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

### Placement

The `<amp-story-page-attachment>` element must be the last child of `<amp-story-page>`, and must have the `layout="nodisplay"` attribute. The attachment AMPHTML content is expected to be provided inline in your AMP Story, within this `<amp-story-page-attachment>` tag.

### Linked content

When providing a `href` attribute as page attachment, the respective URL is opened when the user activates the page attachment.

```html
<amp-story-page-attachment layout="nodisplay" href="https://www.example.com">
</amp-story-page-attachment>
```

### Inline content

As an alternative to linking a page attachment, you may also provide inline AMP HTML as the page attachment.

Story page attachments allow the same HTML elements as AMP Story along with additional components listed below, such as third party video players or social media embeds. This means you can add additional content that is too verbose or disallowed in an AMP Story page.

<details>
  <summary>List of allowed AMP components in a page attachment</summary>
</details>
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
  <li><code>&lt;amp-exco></code></li>
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
  <li><code>&lt;amp-google-vrview-image></code></li>
  <li><code>&lt;amp-google-vrview-image></code></li>
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

## Attributes

### `data-cta-text`

Customizes the call to action text displayed on the UI prompt to open the attachment.
Default: "Swipe up"

```html
<amp-story-page-attachment layout="nodisplay" data-cta-text="Read more"
  >...</amp-story-page-attachment
>
```

### `data-title`

Displays the provided title in the page attachment header.
Default: `null`

```html
<amp-story-page-attachment layout="nodisplay" data-title="My title"
  >...</amp-story-page-attachment
>
```

### `theme`

Enables light or dark mode for the page attachment header and content background.
Values: "light" (default), "dark"

```html
<amp-story-page-attachment layout="nodisplay" theme="dark">
  ...
</amp-story-page-attachment>
```

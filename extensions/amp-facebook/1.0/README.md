---
$category@: layout
formats:
  - websites
teaser:
  text: Displays a Facebook post, video, or comment.
---

# Bento Facebook

## Usage

The Bento Facebook component allows you to embed a Facebook post, a Facebook video, or a comment on a Facebook post. It can be used as a web component [`<bento-facebook>`](#web-component), or as a Preact/React functional component [`<BentoFacebook>`](#preact/react-component). 

### Web Component

you must include each Bento component's required CSS library before adding custom styles in order to guarantee proper loading. Or use the lightweight pre-uprgrade styles available inline. See [Layout and Style](#layout-and-style).

#### Example: Import via npm

[example preview="top-frame" playground="false"]

Install via npm:

```sh
npm install @ampproject/bento-facebook
```

```javascript
import '@ampproject/bento-facebook';
```

[/example]

#### Example: Include via `<script>`

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-facebook {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <!-- TODO(wg-bento): Once available, change src to bento-facebook.js -->
  <script async src="https://cdn.ampproject.org/v0/amp-facebook-1.0.js"></script>
  <style>
    bento-facebook{
      width: 375px;
      height: 472px;
    }
  </style>
</head>

<!-- Facebook Post -->
<amp-facebook id="facebook-post" width="552" height="310"
    layout="responsive"
    data-href="https://www.facebook.com/ParksCanada/posts/1712989015384373">
</amp-facebook>
<div class="buttons" style="margin-top: 8px;">
  <button id="change-facebook-post">
    Change Facebook post
  </button>
</div>

<script>
  (async () => {
    const facebookPost = document.querySelector('#facebook-post');
    await customElements.whenDefined('bento-facebook');
    // set up button actions
    document.querySelector('#change-facebook-post').onclick = () => {
      facebookPost.setAttribute('data-href', 'https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772/')
    }
  })();
</script>

<!-- Facebook Video-->
<amp-facebook id="facebook-video" width="476" height="316"
    layout="responsive"
    data-embed-as="video"
    data-href="https://www.facebook.com/nasaearth/videos/10155187938052139">
</amp-facebook>
<div class="buttons" style="margin-top: 8px;">
  <button id="change-facebook-video">
    Change Facebook video
  </button>
</div>

<script>
  (async () => {
    const facebookVideo= document.querySelector('#facebook-video');
    await customElements.whenDefined('bento-facebook');
    // set up button actions
    document.querySelector('#change-facebook-video').onclick = () => {
      facebookVideo.setAttribute('data-href', 'https://www.facebook.com/NASA/videos/846648316199961/')
    }
  })();
</script>

<!-- Facebook Comment-->
<amp-facebook id="facebook-comment" width="552" height="500"
    layout="responsive"
    data-embed-type="comment"
    data-href="https://www.facebook.com/zuck/posts/10102735452532991?comment_id=1070233703036185">
</amp-facebook>
<div class="buttons" style="margin-top: 8px;">
  <button id="change-facebook-comment">
    Change Facebook comment
  </button>
</div>

<script>
  (async () => {
    const facebookComment= document.querySelector('#facebook-comment');
    await customElements.whenDefined('bento-facebook');
    // set up button actions
    document.querySelector('#change-facebook-comment').onclick = () => {
      facebookComment.setAttribute('data-href', 'https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772/?comment_id=10159193676606772')
    }
  })();
</script>
```

[/example]

#### Layout and Style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-facebook-1.0.css">
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style data-bento-boilerplate>
  bento-facebook {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Attributes

##### `data-href`

The URL of the Facebook post/video/comment. For example, a post or video will
look like `https://www.facebook.com/zuck/posts/10102593740125791`. A comment or
comment reply will look like
`https://www.facebook.com/zuck/posts/10102735452532991?comment_id=1070233703036185`.
For comments, see the Facebook documentation on
[how to get a comment's URL](https://developers.facebook.com/docs/plugins/embedded-comments#how-to-get-a-comments-url).

##### `data-embed-as`

The value is either `post`, `video` or `comment`. The default is `post`.

Both posts and videos can be embedded as a post. Setting `data-embed-as="video"`
for Facebook videos embeds the player of the video, and adds the accompanying
post card with it. Setting `data-embed-as="post"` ignores the caption card. This
is done to make sure we are zooming in on videos correctly.

The `comment` value embeds a single comment (or reply to a comment) on a post.
This is not to be confused with
[`amp-facebook-comments`](https://amp.dev/documentation/examples/components/amp-facebook-comments/).

Check out the documentation for differences between
[post embeds](https://developers.facebook.com/docs/plugins/embedded-posts),
[video embeds](https://developers.facebook.com/docs/plugins/embedded-video-player),
and [comment embeds](https://developers.facebook.com/docs/plugins/embedded-comments).

##### `data-include-comment-parent`

The value is either `true` or `false`. The default is `false`.

When you are embedding a comment reply, you can optionally also include the
parent comment of the reply.

##### `data-allowfullscreen`

The value is either set or omitted. The default is omitted (no fullscreen).

When embedding a video, set this value to allow for a fullscreen experience.

##### `data-align-center`

The value is either `true` or `false`. The default is `false`.

For posts and videos, having this attribute set to true would align the
post/video container to center.

##### `data-locale` (optional)

By default, the locale is set to user's system language; however, you can
specify a locale as well.

For details on strings accepted here please visit the
[Facebook API Localization page](https://developers.facebook.com/docs/internationalization).

##### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"Facebook"`.

##### `data-numposts` (optional)

The number of comments to show. Currently Facebook SDK limits this to max 100.
For details, see the
[Facebook comments documentation](https://developers.facebook.com/docs/plugins/comments).

##### `data-order-by` (optional)

The order to use when displaying comments. For details, see the
[Facebook comments documentation](https://developers.facebook.com/docs/plugins/comments).

##### `data-action` (optional)

The verb to display on the button. Can be either `like` or `recommend`. The
default is `like`.

##### `data-kd_site` (optional)

This attribute is also known as `data-kid_directed_site` in the Facebook SDK.
If your web site or online service, or a portion of your service, is directed to
children under 13 you must enable this attribute. The default is `false`.

##### `data-layout` (optional)

Selects one of the different layouts that are available for the plugin. Can be
one of `standard`, `button_count`, `button` or `box_count`. The default is
`standard`.

##### `data-ref` (optional)

A label for tracking referrals which must be less than 50 characters and can
contain alphanumeric characters and some punctuation.

##### `data-share` (optional)

Specifies whether to include a share button beside the Like button. This only
works with the XFBML version. The default is `false`.

##### `data-size` (optional)

The size of the button, which can be one of two sizes, `large` or `small`. The
default is `small`.

For details, see the
[Facebook comments documentation](https://developers.facebook.com/docs/plugins/like-button#settings).

##### `data-tabs` (optional)

Specifies the tabs to render (i.e., `timeline`, `events`, `messages`). Use a
comma-separated list to add multiple tabs (e.g., `timeline, events`). By
default, the Facebook page plugin shows the timeline activity.

##### `data-hide-cover` (optional)

Hides the cover photo in the header. Default value is `false`.

##### `data-show-facepile` (optional)

Shows profile photos of friends who like the page. Default value is `true`.

##### `data-hide-cta` (optional)

Hides the custom call to action button (if available). Default value is `false`.

##### `data-small-header` (optional)

Uses the small header instead. Default value is `false`.

### Preact/React Component

The examples below demonstrate use of the `<BentoFacebook>` as a functional component usable with the Preact or React libraries.

#### Example: Import via npm

[example preview="top-frame" playground="false"]

Install via npm:

```sh
npm install @ampproject/bento-facebook
```

```javascript
import React from 'react';
import { BentoFacebook } from '@ampproject/bento-facebook/react';
import '@ampproject/bento-facebook/styles.css';

function App() {
  return (
    <BentoFacebook
        embedAs="post"
        href="https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772/">
    </BentoFacebook>
  );
}
```

[/example]

#### Props

##### `href`

The URL of the Facebook post/video/comment. For example, a post or video will
look like `https://www.facebook.com/zuck/posts/10102593740125791`. A comment or
comment reply will look like
`https://www.facebook.com/zuck/posts/10102735452532991?comment_id=1070233703036185`.
For comments, see the Facebook documentation on
[how to get a comment's URL](https://developers.facebook.com/docs/plugins/embedded-comments#how-to-get-a-comments-url).

##### `embedAs`

The value is either `post`, `video` or `comment`. The default is `post`.

Both posts and videos can be embedded as a post. Setting `data-embed-as="video"`
for Facebook videos embeds the player of the video, and adds the accompanying
post card with it. Setting `data-embed-as="post"` ignores the caption card. This
is done to make sure we are zooming in on videos correctly.

The `comment` value embeds a single comment (or reply to a comment) on a post.
This is not to be confused with
[`amp-facebook-comments`](https://amp.dev/documentation/examples/components/amp-facebook-comments/).

Check out the documentation for differences between
[post embeds](https://developers.facebook.com/docs/plugins/embedded-posts),
[video embeds](https://developers.facebook.com/docs/plugins/embedded-video-player),
and [comment embeds](https://developers.facebook.com/docs/plugins/embedded-comments).

##### `includeCommentParent`

The value is either `true` or `false`. The default is `false`.

When you are embedding a comment reply, you can optionally also include the
parent comment of the reply.

##### `allowfullscreen`

The value is either set or omitted. The default is omitted (no fullscreen).

When embedding a video, set this value to allow for a fullscreen experience.

##### `alignCenter`

The value is either `true` or `false`. The default is `false`.

For posts and videos, having this attribute set to true would align the
post/video container to center.

##### `locale` (optional)

By default, the locale is set to user's system language; however, you can
specify a locale as well.

For details on strings accepted here please visit the
[Facebook API Localization page](https://developers.facebook.com/docs/internationalization).

##### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"Facebook"`.

##### `numposts` (optional)

The number of comments to show. Currently Facebook SDK limits this to max 100.
For details, see the
[Facebook comments documentation](https://developers.facebook.com/docs/plugins/comments).

##### `orderBy` (optional)

The order to use when displaying comments. For details, see the
[Facebook comments documentation](https://developers.facebook.com/docs/plugins/comments).

##### `action` (optional)

The verb to display on the button. Can be either `like` or `recommend`. The
default is `like`.

##### `kdSite` (optional)

This attribute is also known as `data-kid_directed_site` in the Facebook SDK.
If your web site or online service, or a portion of your service, is directed to
children under 13 you must enable this attribute. The default is `false`.

##### `dataLayout` (optional)

Selects one of the different layouts that are available for the plugin. Can be
one of `standard`, `button_count`, `button` or `box_count`. The default is
`standard`.

##### `ref` (optional)

A label for tracking referrals which must be less than 50 characters and can
contain alphanumeric characters and some punctuation.

##### `share` (optional)

Specifies whether to include a share button beside the Like button. This only
works with the XFBML version. The default is `false`.

##### `size` (optional)

The size of the button, which can be one of two sizes, `large` or `small`. The
default is `small`.

For details, see the
[Facebook comments documentation](https://developers.facebook.com/docs/plugins/like-button#settings).

##### `tabs` (optional)

Specifies the tabs to render (i.e., `timeline`, `events`, `messages`). Use a
comma-separated list to add multiple tabs (e.g., `timeline, events`). By
default, the Facebook page plugin shows the timeline activity.

##### `hideCover` (optional)

Hides the cover photo in the header. Default value is `false`.

##### `showFacepile` (optional)

Shows profile photos of friends who like the page. Default value is `true`.

##### `hideCta` (optional)

Hides the custom call to action button (if available). Default value is `false`.

##### `smallHeader` (optional)

Uses the small header instead. Default value is `false`.

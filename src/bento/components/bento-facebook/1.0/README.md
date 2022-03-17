# Bento Facebook

Embeds a [Facebook](https://facebook.com) post, a Facebook video, or a comment on a Facebook post.

## Web Component

You must include each Bento component's required CSS library before adding custom styles in order to guarantee proper loading. Or use the lightweight pre-uprgrade styles available inline. See [Layout and Style](#layout-and-style).

### Import via npm

```sh
npm install @bentoproject/facebook
```

```javascript
import {defineElement as defineBentoFacebook} from '@bentoproject/facebook';
defineBentoFacebook();
```

### Include via `<script>`

```html
<script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
<script type="module" src="https://cdn.ampproject.org/v0/bento-facebook-1.0.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/v0/bento-facebook-1.0.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-facebook-1.0.css" crossorigin="anonymous">
```

### Example

##### Embed a Facebook Post

<!--% example %-->

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/bento.mjs"
    ></script>
    <script nomodule src="https://cdn.ampproject.org/bento.js"></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-facebook-1.0.css"
    />
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-facebook-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-facebook-1.0.js"
    ></script>
    <style>
      bento-facebook {
        width: 375px;
        height: 472px;
      }
    </style>
  </head>
  <body>
    <bento-facebook
      id="facebook-post"
      data-href="https://www.facebook.com/ParksCanada/posts/1712989015384373"
    >
    </bento-facebook>
    <div class="buttons" style="margin-top: 8px">
      <button id="change-facebook-post">Change Facebook post</button>
    </div>

    <script>
      (async () => {
        const facebookPost = document.querySelector('#facebook-post');
        await customElements.whenDefined('bento-facebook');
        // set up button actions
        document.querySelector('#change-facebook-post').onclick = () => {
          facebookPost.setAttribute(
            'data-href',
            'https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772/'
          );
        };
      })();
    </script>
  </body>
</html>
```

##### Embed a Facebook Video

<!--% example %-->

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/bento.mjs"
    ></script>
    <script nomodule src="https://cdn.ampproject.org/bento.js"></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-facebook-1.0.css"
    />
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-facebook-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-facebook-1.0.js"
    ></script>
    <style>
      bento-facebook {
        width: 375px;
        height: 472px;
      }
    </style>
  </head>
  <body>
    <bento-facebook
      id="facebook-video"
      data-embed-as="video"
      data-href="https://www.facebook.com/nasaearth/videos/10155187938052139"
    >
    </bento-facebook>
    <div class="buttons" style="margin-top: 8px">
      <button id="change-facebook-video">Change Facebook video</button>
    </div>

    <script>
      (async () => {
        const facebookVideo = document.querySelector('#facebook-video');
        await customElements.whenDefined('bento-facebook');
        // set up button actions
        document.querySelector('#change-facebook-video').onclick = () => {
          facebookVideo.setAttribute(
            'data-href',
            'https://www.facebook.com/NASA/videos/846648316199961/'
          );
        };
      })();
    </script>
  </body>
</html>
```

##### Embed a Facebook Page

<!--% example %-->

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/bento.mjs"
    ></script>
    <script nomodule src="https://cdn.ampproject.org/bento.js"></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-facebook-1.0.css"
    />
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-facebook-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-facebook-1.0.js"
    ></script>
    <style>
      bento-facebook {
        width: 375px;
        height: 472px;
      }
    </style>
  </head>
  <body>
    <bento-facebook
      id="facebook-video"
      data-embed-as="video"
      data-href="https://www.facebook.com/nasaearth/videos/10155187938052139"
    >
    </bento-facebook>
    <div class="buttons" style="margin-top: 8px">
      <button id="change-facebook-video">Change Facebook video</button>
    </div>

    <script>
      (async () => {
        const facebookVideo = document.querySelector('#facebook-video');
        await customElements.whenDefined('bento-facebook');
        // set up button actions
        document.querySelector('#change-facebook-video').onclick = () => {
          facebookVideo.setAttribute(
            'data-href',
            'https://www.facebook.com/NASA/videos/846648316199961/'
          );
        };
      })();
    </script>
  </body>
</html>
```

##### Embed a Facebook Like Button

<!--% example %-->

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/bento.mjs"
    ></script>
    <script nomodule src="https://cdn.ampproject.org/bento.js"></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-facebook-1.0.css"
    />
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-facebook-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-facebook-1.0.js"
    ></script>
    <style>
      bento-facebook {
        width: 375px;
        height: 472px;
      }
    </style>
  </head>
  <body>
    <bento-facebook
      id="facebook-video"
      data-embed-as="like"
      data-href="https://www.facebook.com/nasaearth/videos/10155187938052139"
    >
    </bento-facebook>
  </body>
</html>
```

##### Embed a Facebook Comment Section

<!--% example %-->

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/bento.mjs"
    ></script>
    <script nomodule src="https://cdn.ampproject.org/bento.js"></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-facebook-1.0.css"
    />
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-facebook-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-facebook-1.0.js"
    ></script>
    <style>
      bento-facebook {
        width: 375px;
        height: 472px;
      }
    </style>
  </head>
  <body>
    <bento-facebook
      id="facebook-comments"
      data-embed-as="comments"
      data-href="https://www.facebook.com/zuck/posts/10102735452532991?comment_id=1070233703036185"
    >
    </bento-facebook>
  </body>
</html>
```

### Layout and Style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-facebook-1.0.css"
/>
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style>
  bento-facebook {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

### Attributes

#### `data-href`

The URL of the Facebook post/video/comment. For example, a post or video will look like `https://www.facebook.com/zuck/posts/10102593740125791`. A comment or comment reply will look like `https://www.facebook.com/zuck/posts/10102735452532991?comment_id=1070233703036185`.

#### `data-embed-as`

The value can be either `post`, `video`, `comments`, `like`, or `page`. The default value is `post`.

Both posts and videos can be embedded as a post. Setting `data-embed-as="video"` for Facebook videos embeds the player of the video, and adds the accompanying post card with it. Setting `data-embed-as="post"` ignores the caption card. This is done to make sure we are zooming in on videos correctly.

The `comments` value embeds a comment section which allows people to comment on content using their Facebook account.

The `like` value embeds a like button which, when clicked, triggers the like to be logged on Facebook. The `page` value embeds any public facebook page.

Check out the documentation for differences between [post embeds](https://developers.facebook.com/docs/plugins/embedded-posts), [video embeds](https://developers.facebook.com/docs/plugins/embedded-video-player), [like embeds](https://developers.facebook.com/docs/plugins/like-button), and [page embeds](https://developers.facebook.com/docs/plugins/page-plugin).

The `comment` value is deprecated but previously was used to embed a single comment (or reply to a comment) on a post. This is not to be confused with [`amp-facebook-comments`](https://amp.dev/documentation/examples/components/amp-facebook-comments/).

#### `data-align-center`

The value is either `true` or `false`. The default is `false`.

For posts and videos, having this attribute set to true would align the post/video container to center.

#### `data-allowfullscreen`

The value is either set or omitted. The default is omitted (no fullscreen).

When embedding a video, set this value to allow for a fullscreen experience.

#### `data-include-comment-parent`

The value is either `true` or `false`. The default is `false`.

When you are embedding a comment reply, you can optionally also include the parent comment of the reply.

#### `data-action` (optional)

The verb to display on the button. Can be either `like` or `recommend`. The default is `like`.

#### `data-hide-cover` (optional)

Hides the cover photo in the header. Default value is `false`.

#### `data-hide-cta` (optional)

Hides the custom call to action button (if available). Default value is `false`.

#### `data-kd_site` (optional)

This attribute is also known as `data-kid_directed_site` in the Facebook SDK. If your web site or online service, or a portion of your service, is directed to children under 13 you must enable this attribute. The default is `false`.

#### `data-layout` (optional)

Selects one of the different layouts that are available for the plugin. Can be one of `standard`, `button_count`, `button` or `box_count`. The default is `standard`.

#### `data-locale` (optional)

By default, the locale is set to user's system language; however, you can specify a locale as well.

For details on strings accepted here please visit the [Facebook API Localization page](https://developers.facebook.com/docs/internationalization).

#### `data-numposts` (optional)

The number of comments to show. Currently Facebook SDK limits this to max 100. For details, see the [Facebook comments documentation](https://developers.facebook.com/docs/plugins/comments).

#### `data-order-by` (optional)

The order to use when displaying comments. For details, see the [Facebook comments documentation](https://developers.facebook.com/docs/plugins/comments).

#### `data-ref` (optional)

A label for tracking referrals which must be less than 50 characters and can contain alphanumeric characters and some punctuation.

#### `data-share` (optional)

Specifies whether to include a share button beside the Like button. This only works with the XFBML version. The default is `false`.

#### `data-show-facepile` (optional)

Shows profile photos of friends who like the page. Default value is `true`.

#### `data-size` (optional)

The size of the button, which can be one of two sizes, `large` or `small`. The default is `small`.

For details, see the [Facebook comments documentation](https://developers.facebook.com/docs/plugins/like-button#settings).

#### `data-small-header` (optional)

Uses the small header instead. Default value is `false`.

#### `data-tabs` (optional)

Specifies the tabs to render (i.e., `timeline`, `events`, `messages`). Use a comma-separated list to add multiple tabs (e.g., `timeline, events`). By default, the Facebook page plugin shows the timeline activity.

#### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"Facebook"`.

---

## Preact/React Component

### Import via npm

```sh
npm install @bentoproject/facebook
```

```javascript
import React from 'react';
import {BentoFacebook} from '@bentoproject/facebook/react';
import '@bentoproject/facebook/styles.css';

function App() {
  return (
    <BentoFacebook
      embedAs="post"
      href="https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772/"
    ></BentoFacebook>
  );
}
```

### Props

#### `href`

The URL of the Facebook post/video/comment. For example, a post or video will look like `https://www.facebook.com/zuck/posts/10102593740125791`. A comment or comment reply will look like `https://www.facebook.com/zuck/posts/10102735452532991?comment_id=1070233703036185`.

#### `embedAs`

The value can be either `post`, `video`, `comments`, `like`, or `page`. The default value is `post`.

Both posts and videos can be embedded as a post. Setting `data-embed-as="video"` for Facebook videos embeds the player of the video, and adds the accompanying post card with it. Setting `data-embed-as="post"` ignores the caption card. This is done to make sure we are zooming in on videos correctly.

The `comments` value embeds a comment section which allows people to comment on content using their Facebook account.

The `like` value embeds a like button which, when clicked, triggers the like to be logged on Facebook. The `page` value embeds any public facebook page.

Check out the documentation for differences between [post embeds](https://developers.facebook.com/docs/plugins/embedded-posts), [video embeds](https://developers.facebook.com/docs/plugins/embedded-video-player), [like embeds](https://developers.facebook.com/docs/plugins/like-button), and [page embeds](https://developers.facebook.com/docs/plugins/page-plugin).

The `comment` value is deprecated but previously was used to embed a single comment (or reply to a comment) on a post. This is not to be confused with [`amp-facebook-comments`](https://amp.dev/documentation/examples/components/amp-facebook-comments/).

#### `alignCenter`

The value is either `true` or `false`. The default is `false`.

For posts and videos, having this attribute set to true would align the post/video container to center.

#### `allowFullScreen`

The value is either set or omitted. The default is omitted (no fullscreen).

When embedding a video, set this value to allow for a fullscreen experience.

#### `includeCommentParent`

The value is either `true` or `false`. The default is `false`.

When you are embedding a comment reply, you can optionally also include the parent comment of the reply.

#### `action` (optional)

The verb to display on the button. Can be either `like` or `recommend`. The default is `like`.

#### `dataLayout` (optional)

Selects one of the different layouts that are available for the plugin. Can be one of `standard`, `button_count`, `button` or `box_count`. The default is `standard`.

#### `hideCover` (optional)

Hides the cover photo in the header. Default value is `false`.

#### `hideCta` (optional)

Hides the custom call to action button (if available). Default value is `false`.

#### `kdSite` (optional)

This attribute is also known as `data-kid_directed_site` in the Facebook SDK. If your web site or online service, or a portion of your service, is directed to children under 13 you must enable this attribute. The default is `false`.

#### `locale` (optional)

By default, the locale is set to user's system language; however, you can specify a locale as well.

For details on strings accepted here please visit the [Facebook API Localization page](https://developers.facebook.com/docs/internationalization).

#### `numposts` (optional)

The number of comments to show. Currently Facebook SDK limits this to max 100. For details, see the [Facebook comments documentation](https://developers.facebook.com/docs/plugins/comments).

#### `orderBy` (optional)

The order to use when displaying comments. For details, see the [Facebook comments documentation](https://developers.facebook.com/docs/plugins/comments).

#### `refLabel` (optional)

A label for tracking referrals which must be less than 50 characters and can contain alphanumeric characters and some punctuation.

#### `share` (optional)

Specifies whether to include a share button beside the Like button. This only works with the XFBML version. The default is `false`.

#### `showFacepile` (optional)

Shows profile photos of friends who like the page. Default value is `true`.

#### `size` (optional)

The size of the button, which can be one of two sizes, `large` or `small`. The default is `small`.

For details, see the [Facebook comments documentation](https://developers.facebook.com/docs/plugins/like-button#settings).

#### `smallHeader` (optional)

Uses the small header instead. Default value is `false`.

#### `tabs` (optional)

Specifies the tabs to render (i.e., `timeline`, `events`, `messages`). Use a comma-separated list to add multiple tabs (e.g., `timeline, events`). By default, the Facebook page plugin shows the timeline activity.

#### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"Facebook"`.

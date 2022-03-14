---
$category@: social
formats:
  - websites
teaser:
  text: Displays a Facebook post, video or comment.
experimental: true
bento: true
---

# bento-facebook

## Usage

You can use the `bento-facebook` component to embed a Facebook post, a Facebook video or a comment on a Facebook post.

The following example shows how to embed a post:

[example preview="inline" playground="true" imports="bento-facebook"][sourcecode:html]
<bento-facebook width="552" height="310"
    layout="responsive"
    data-href="https://www.facebook.com/ParksCanada/posts/1712989015384373">
</bento-facebook>
[/sourcecode][/example]

The following example shows how to embed a video:

[example preview="inline" playground="true" imports="bento-facebook"][sourcecode:html]
<bento-facebook width="476" height="316"
    layout="responsive"
    data-embed-as="video"
    data-href="https://www.facebook.com/nasaearth/videos/10155187938052139">
</bento-facebook>
[/sourcecode][/example]

The following example shows how to embed a comment on a post:

[example preview="inline" playground="true" imports="bento-facebook"][sourcecode:html]
<bento-facebook width="552" height="500"
    layout="responsive"
    data-embed-type="comment"
    data-href="https://www.facebook.com/zuck/posts/10102735452532991?comment_id=1070233703036185">
</bento-facebook>
[/sourcecode][/example]

### Standalone use outside valid AMP documents

Bento allows you to use AMP components in non-AMP pages without needing
to commit to fully valid AMP. You can take these components and place them
in implementations with frameworks and CMSs that don't support AMP. Read
more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

To find the standalone version of `bento-facebook`, see [**`bento-facebook`**](./1.0/README.md).

## Attributes

### `data-href`

The URL of the Facebook post/video/comment. For example, a post or video will
look like `https://www.facebook.com/zuck/posts/10102593740125791`. A comment or
comment reply will look like
`https://www.facebook.com/zuck/posts/10102735452532991?comment_id=1070233703036185`.

### `data-embed-as`

The value is either `post`, `video` or `comment`. The default is `post`.

Both posts and videos can be embedded as a post. Setting `data-embed-as="video"`
for Facebook videos embeds the player of the video, and adds the accompanying
post card with it. Setting `data-embed-as="post"` ignores the caption card. This
is done to make sure we are zooming in on videos correctly.

The `comment` value embeds a single comment (or reply to a comment) on a post.
This is not to be confused with
[`bento-facebook-comments`](https://amp.dev/documentation/examples/components/amp-facebook-comments/).

Check out the documentation for differences between
[post embeds](https://developers.facebook.com/docs/plugins/embedded-posts) and
[video embeds](https://developers.facebook.com/docs/plugins/embedded-video-player).

### `data-include-comment-parent`

The value is either `true` or `false`. The default is `false`.

When you are embedding a comment reply, you can optionally also include the
parent comment of the reply.

### `data-allowfullscreen`

The value is either set or omitted. The default is omitted (no fullscreen).

When embedding a video, set this value to allow for a fullscreen experience.

### `data-align-center`

The value is either `true` or `false`. The default is `false`.

For posts and videos, having this attribute set to true would align the
post/video container to center.

### `data-locale` (optional)

By default, the locale is set to user's system language; however, you can
specify a locale as well.

For details on strings accepted here please visit the
[Facebook API Localization page](https://developers.facebook.com/docs/internationalization).

### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"Facebook"`.

### `data-numposts` (optional)

The number of comments to show. Currently Facebook SDK limits this to max 100.
For details, see the
[Facebook comments documentation](https://developers.facebook.com/docs/plugins/comments).

### `data-order-by` (optional)

The order to use when displaying comments. For details, see the
[Facebook comments documentation](https://developers.facebook.com/docs/plugins/comments).

### `data-action` (optional)

The verb to display on the button. Can be either `like` or `recommend`. The
default is `like`.

### `data-kd_site` (optional)

This attribute is also known as `data-kid_directed_site` in the Facebook SDK.
If your web site or online service, or a portion of your service, is directed to
children under 13 you must enable this attribute. The default is `false`.

### `data-layout` (optional)

Selects one of the different layouts that are available for the plugin. Can be
one of `standard`, `button_count`, `button` or `box_count`. The default is
`standard`.

### `data-ref` (optional)

A label for tracking referrals which must be less than 50 characters and can
contain alphanumeric characters and some punctuation.

### `data-share` (optional)

Specifies whether to include a share button beside the Like button. This only
works with the XFBML version. The default is `false`.

### `data-size` (optional)

The size of the button, which can be one of two sizes, `large` or `small`. The
default is `small`.

For details, see the
[Facebook comments documentation](https://developers.facebook.com/docs/plugins/like-button#settings).

### `data-tabs` (optional)

Specifies the tabs to render (i.e., `timeline`, `events`, `messages`). Use a
comma-separated list to add multiple tabs (e.g., `timeline, events`). By
default, the Facebook page plugin shows the timeline activity.

### `data-hide-cover` (optional)

Hides the cover photo in the header. Default value is `false`.

### `data-show-facepile` (optional)

Shows profile photos of friends who like the page. Default value is `true`.

### `data-hide-cta` (optional)

Hides the custom call to action button (if available). Default value is `false`.

### `data-small-header` (optional)

Uses the small header instead. Default value is `false`.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

### Deprecated attributes

**`data-colorscheme` (optional)**

The color scheme. For details, see the <a href="https://developers.facebook.com/docs/plugins/comments">Facebook comments documentation</a>.<br><br><em>Note: This is no longer supported by Facebook. For more details, follow our <a href="https://github.com/ampproject/amphtml/issues/29980">our tracking issue</a> and <a href="https://developers.facebook.com/support/bugs/1759174414250782/">Facebook's bug report</a>.</em>

## Validation

See [bento-facebook rules](../../../../extensions/amp-facebook/validator-amp-facebook.protoascii) in the AMP validator specification.

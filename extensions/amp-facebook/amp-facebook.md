---
$category@: social
formats:
  - websites
teaser:
  text: Displays a Facebook post, video or comment.
---

<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

# amp-facebook

## Usage

You can use the `amp-facebook` component to embed a Facebook post, a Facebook video or a comment on a Facebook post.

The following example shows how to embed a post:

[example preview="inline" playground="true" imports="amp-facebook"][sourcecode:html]
<amp-facebook width="552" height="310"
    layout="responsive"
    data-href="https://www.facebook.com/ParksCanada/posts/1712989015384373">
</amp-facebook>
[/sourcecode][/example]

The following example shows how to embed a video:

[example preview="inline" playground="true" imports="amp-facebook"][sourcecode:html]
<amp-facebook width="476" height="316"
    layout="responsive"
    data-embed-as="video"
    data-href="https://www.facebook.com/nasaearth/videos/10155187938052139">
</amp-facebook>
[/sourcecode][/example]

The following example shows how to embed a comment on a post:

[example preview="inline" playground="true" imports="amp-facebook"][sourcecode:html]
<amp-facebook width="552" height="500"
    layout="responsive"
    data-embed-type="comment"
    data-href="https://www.facebook.com/zuck/posts/10102735452532991?comment_id=1070233703036185">
</amp-facebook>
[/sourcecode][/example]

## Attributes

### `data-href`

The URL of the Facebook post/video/comment. For example, a post or video will
look like `https://www.facebook.com/zuck/posts/10102593740125791`. A comment or
comment reply will look like
`https://www.facebook.com/zuck/posts/10102735452532991?comment_id=1070233703036185`.
For comments, see the Facebook documentation on
[how to get a comment's URL](https://developers.facebook.com/docs/plugins/embedded-comments#how-to-get-a-comments-url).

### `data-embed-as`

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

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Validation

See [amp-facebook rules](validator-amp-facebook.protoascii) in the AMP validator specification.
